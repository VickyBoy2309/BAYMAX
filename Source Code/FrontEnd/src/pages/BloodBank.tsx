import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Droplet, Clock, Search, MapPin } from 'lucide-react';

export default function BloodBank() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodGroup, setBloodGroup] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/patients/blood-requests');
      setRequests(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bloodGroup) return;

    try {
      await api.post('/patients/blood-requests', { bloodGroup });
      setBloodGroup('');
      alert('Blood Request Submitted!');
      fetchRequests();
    } catch (error) {
      console.error(error);
      alert('Failed to submit request');
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-[#EF4444] rounded-[24px] p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border border-white/30 backdrop-blur-sm">
                <Droplet className="w-10 h-10 fill-white text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Blood Bank Services</h1>
                <p className="text-red-100 mt-2 text-lg">Request blood or find nearby donors in Maduravoyal</p>
              </div>
            </div>
            
            <a 
              href="https://www.google.com/maps/search/blood+bank+near+maduravoyal+chennai" 
              target="_blank" 
              rel="noreferrer"
              className="bg-white text-[#EF4444] px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
              <Search className="w-5 h-5" /> Find Banks Nearby
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Request Blood</h2>
              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Blood Group Needed</label>
                  <select 
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">Select Group</option>
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full bg-[#EF4444] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-red-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Droplet className="w-5 h-5 fill-current" /> Submit Request
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
               <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                 <Clock className="w-5 h-5" /> Emergency Contacts
               </h3>
               <p className="text-sm text-orange-700 mb-3">For immediate medical assistance and blood requirements, contact:</p>
               <div className="space-y-2 font-medium text-orange-900">
                 <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                   <MapPin className="w-4 h-4 text-orange-500" /> ACS Hospital: 044-2653-3222
                 </div>
                 <div className="flex items-center gap-2 bg-white/50 p-2 rounded-lg">
                   <Droplet className="w-4 h-4 text-red-500" /> Red Cross: 104
                 </div>
               </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Your Recent Requests</h2>
            
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((req, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-red-200 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-4 shadow-sm
                        ${req.status === 'pending' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
                          req.status === 'fulfilled' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                          'bg-red-50 text-red-500 border-red-100'}
                      `}>
                        {req.bloodGroup}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Blood Request ({req.bloodGroup})</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5" /> 
                          {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider
                      ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        req.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : 
                        'bg-red-100 text-red-700'}
                    `}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center text-slate-500">
                <Droplet className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-medium">No blood requests made yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
