import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Activity, UserCheck, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try {
      const { data } = await api.get('/admin/pending-doctors');
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleApprove = async (id: string) => {
    if (!window.confirm('Approve this doctor?')) return;
    try {
      await api.put(`/admin/approve-doctor/${id}`);
      fetchDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Reject and delete this doctor?')) return;
    try {
      await api.delete(`/admin/reject-doctor/${id}`);
      fetchDoctors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#06B6D4] p-1.5 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">BAYMAX Admin</span>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }} 
            className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Pending Doctor Approvals</h1>
        
        {doctors.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            No pending doctors awaiting approval.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc: any) => (
              <div key={doc._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800">{doc.name}</h3>
                  <p className="text-sm text-slate-500">{doc.email}</p>
                </div>
                
                {doc.profile && (
                  <div className="space-y-2 mb-6 flex-1 text-sm">
                    <p><span className="font-semibold text-slate-700">Specialization:</span> {doc.profile.specialization}</p>
                    <p><span className="font-semibold text-slate-700">Experience:</span> {doc.profile.experience} years</p>
                    <p><span className="font-semibold text-slate-700">Hospital:</span> {doc.profile.hospital}</p>
                    <p><span className="font-semibold text-slate-700">Location:</span> {doc.profile.address}</p>
                  </div>
                )}
                
                <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleApprove(doc._id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReject(doc._id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
