import React, { useEffect, useState } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, FlaskConical, TestTube2, CheckCircle2, Calendar, Clock, MapPin, MailCheck, X } from 'lucide-react';

export default function LabTestsView() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Modal state
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'home', // 'home' or 'walk-in'
    address: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

const fetchTests = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/labs");
    console.log("DATA RECEIVED:", res.data);
    setTests(res.data);
  } catch (error: any) {
    console.log("ERROR:", error);
  } finally {
    setLoading(false);
  }
};;

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;
    
    setBookingLoading(true);
    try {
      const payload = {
        labTestId: selectedTest._id,
        ...bookingData
      };
      const res = await api.post('/patients/book-lab', payload);
      setSuccessMsg(res.data.message || 'Lab booked successfully. Notification sent to your email ID.');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedTest(null);
        navigate('/'); // Redirect to dashboard to see reminders
      }, 3000);
      
    } catch (error) {
      console.error(error);
      alert('Failed to book test. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 relative">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <FlaskConical className="w-8 h-8 text-[#A855F7]" /> Lab Tests & Diagnostics
          </h1>
          <p className="text-slate-500 mt-1">Book diagnostic tests. Choose Home Collection or Walk-In.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A855F7]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col h-full group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-110 transition-transform">
                    <TestTube2 className="w-6 h-6 text-[#A855F7]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{test.name}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{test.description}</p>
                  </div>
                </div>

                <div className="mt-auto space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">
                    <CheckCircle2 className="w-4 h-4" /> Reports in 24 hrs
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-800">₹{test.price}</span>
                    <button 
                      onClick={() => setSelectedTest(test)}
                      className="bg-[#A855F7] text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-sm"
                    >
                      Book Test
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Booking Modal */}
        {selectedTest && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-lg text-slate-800">Book Lab Test</h3>
                <button 
                  onClick={() => setSelectedTest(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-full hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {successMsg ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MailCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800">Booking Confirmed!</h4>
                  <p className="text-emerald-600 font-medium">{successMsg}</p>
                  <p className="text-sm text-slate-500">Redirecting to your dashboard to view reminders...</p>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="p-6 space-y-6">
                  
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Selected Test</p>
                      <p className="font-bold text-slate-800">{selectedTest.name}</p>
                    </div>
                    <span className="text-xl font-bold text-slate-800">₹{selectedTest.price}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" /> Date
                      </label>
                      <input 
                        type="date" 
                        required
                        value={bookingData.date}
                        onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" /> Time Slot
                      </label>
                      <input 
                        type="time" 
                        required
                        value={bookingData.time}
                        onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Collection Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-center gap-2 ${bookingData.type === 'home' ? 'border-[#A855F7] bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                        <input type="radio" name="type" className="hidden" value="home" checked={bookingData.type === 'home'} onChange={() => setBookingData({...bookingData, type: 'home'})} />
                        <MapPin className="w-5 h-5" /> Home Collect
                      </label>
                      <label className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-center gap-2 ${bookingData.type === 'walk-in' ? 'border-[#A855F7] bg-purple-50 text-purple-700' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                        <input type="radio" name="type" className="hidden" value="walk-in" checked={bookingData.type === 'walk-in'} onChange={() => setBookingData({...bookingData, type: 'walk-in'})} />
                        <TestTube2 className="w-5 h-5" /> Walk-In
                      </label>
                    </div>
                  </div>

                  <div className={`space-y-2 transition-all ${bookingData.type === 'walk-in' ? 'opacity-50' : ''}`}>
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" /> {bookingData.type === 'home' ? 'Home Address' : 'Preferred Lab Center'}
                    </label>
                    <textarea 
                      required
                      placeholder={bookingData.type === 'home' ? "Enter your full address in Maduravoyal..." : "Search Maduravoyal Labs..."}
                      value={bookingData.address}
                      onChange={(e) => setBookingData({...bookingData, address: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 resize-none h-24"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={bookingLoading}
                    className="w-full bg-[#A855F7] text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center disabled:opacity-70"
                  >
                    {bookingLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
