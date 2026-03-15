import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Activity, CheckCircle2, Users, Minus, Plus, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState<any>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [aptRes, profRes] = await Promise.all([
        api.get('/doctor/appointments'),
        api.get('/doctor/profile')
      ]);
      setAppointments(aptRes.data);
      setProfile(profRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/doctor/appointment/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      await api.put(`/doctor/appointment/${id}/done`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const updateWaitingCount = async (action: 'increment' | 'decrement') => {
    if (action === 'decrement' && (!profile?.waitingCount || profile.waitingCount <= 0)) return;
    try {
      const { data } = await api.put('/doctor/waiting-count', { action });
      setProfile(data);
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
            <span className="text-xl font-bold text-slate-800 tracking-tight">BAYMAX Doctor</span>
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Welcome, Dr. {user?.name}</h1>
          <p className="text-slate-500">Manage your appointments and waiting list.</p>
        </div>

        <div className={`p-6 rounded-2xl transition-all duration-500 mb-8 border shadow-lg ${
          (profile?.waitingCount || 0) >= 15
            ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-500 shadow-red-200/50'
            : (profile?.waitingCount || 0) >= 10
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 shadow-orange-200/50'
              : (profile?.waitingCount || 0) >= 5 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-600 shadow-blue-200/50' 
                : (profile?.waitingCount || 0) >= 1 
                  ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 border-emerald-500 shadow-emerald-200/50' 
                  : 'bg-slate-100 border-slate-200 shadow-slate-200/50'
        }`}>
          <div className="mb-4">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${
              (profile?.waitingCount || 0) > 0 ? 'text-white' : 'text-slate-700'
            }`}>
              <Activity className="w-5 h-5" />
              Live Dashboard Status
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between transform transition-transform hover:scale-105 duration-300">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Live Waiting</p>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => updateWaitingCount('decrement')}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${profile?.waitingCount > 0 ? 'bg-slate-100 hover:bg-slate-200' : 'bg-slate-50 opacity-50 cursor-not-allowed'}`}
                    disabled={!profile?.waitingCount || profile.waitingCount <= 0}
                    title="Mark a manual patient as done"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-3xl font-bold text-slate-800">{profile?.waitingCount || 0}</span>
                  <button 
                    onClick={() => updateWaitingCount('increment')}
                    className="w-8 h-8 rounded-full bg-[#06B6D4] text-white flex items-center justify-center hover:bg-cyan-600"
                    title="Add a manual patient to waiting list"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-cyan-50 p-3 rounded-full hidden lg:block">
                <Users className="w-6 h-6 text-[#06B6D4]" />
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between transform transition-transform hover:scale-105 duration-300">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Done Today</p>
                <h3 className="text-3xl font-bold text-slate-800">{profile?.completedCount || 0}</h3>
              </div>
              <div className="bg-green-50 p-3 rounded-full hidden lg:block">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center justify-between transform transition-transform hover:scale-105 duration-300">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Completed</p>
                <h3 className="text-3xl font-bold text-slate-800">{profile?.totalCompleted || profile?.completedCount || 0}</h3>
              </div>
              <div className="bg-purple-50 p-3 rounded-full hidden lg:block">
                <CheckCircle2 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Appointment Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-500 text-sm font-medium text-left">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {appointments.map((apt: any) => (
                  <tr key={apt._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-800">{apt.patient?.name}</td>
                    <td className="px-6 py-4 text-slate-600">{apt.date}</td>
                    <td className="px-6 py-4 text-slate-600">{apt.time}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {apt.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(apt._id, 'approved')}
                            className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleStatusChange(apt._id, 'rejected')}
                            className="text-sm bg-red-100 text-red-600 px-3 py-1.5 rounded hover:bg-red-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {apt.status === 'approved' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => navigate(`/video-call/${apt._id}`)}
                            className="text-sm bg-[#06B6D4] text-white px-3 py-1.5 rounded hover:bg-cyan-600 flex items-center gap-1.5 font-medium"
                          >
                            <Video className="w-4 h-4" /> Start Call
                          </button>
                          <button 
                            onClick={() => handleMarkDone(apt._id)}
                            className="text-sm bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600"
                          >
                            Mark Done
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
