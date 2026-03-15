import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, MapPin, Star, Clock, Calendar, Search, Activity, Users, ShieldCheck, HeartPulse, X, IndianRupee, ThumbsUp } from 'lucide-react';

export default function DoctorAppointments() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [mapLocation, setMapLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/patients/doctors');
      setDoctors(res.data);
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !time) return;

    try {
      await api.post('/patients/appointments', {
        doctorId: selectedDoctor._id,
        date,
        time
      });
      alert('Appointment booked successfully!');
      setSelectedDoctor(null);
      setDate('');
      setTime('');
      navigate('/health-records');
    } catch (error) {
      console.error('Failed to book appointment', error);
      alert('Failed to book appointment');
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    (doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.specialization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.hospital || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Top Navigation Banner */}
      <div className="bg-[#3B82F6] text-white pt-6 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium border border-white/20 shadow-sm w-fit mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 text-blue-100 font-medium text-sm mb-2">
                <HeartPulse className="w-4 h-4" /> BAYMAX Healthcare
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Book an Appointment</h1>
              <p className="text-blue-100 text-lg md:text-xl font-light leading-relaxed max-w-xl">
                Find top-rated specialists in <strong className="font-semibold text-white">Maduravoyal, Chennai</strong> and book your consultation instantly.
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl shadow-sm w-full md:w-auto">
               <div className="flex -space-x-3">
                 {[1,2,3].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#3B82F6] flex items-center justify-center font-bold text-sm ${i===1?'bg-blue-100 text-blue-600':i===2?'bg-emerald-100 text-emerald-600':'bg-amber-100 text-amber-600'}`}>
                       D
                    </div>
                 ))}
               </div>
               <div className="pl-2">
                  <div className="text-xs text-blue-100 font-medium">Verified Doctors</div>
                  <div className="text-sm font-bold">{doctors.length}+ Available</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        
        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-3 md:p-4 mb-10 flex flex-col md:flex-row items-center gap-4 max-w-4xl mx-auto">
          <div className="relative w-full flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialization, or hospital..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-slate-700 font-medium"
            />
          </div>
          <button className="w-full md:w-auto bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-sm whitespace-nowrap">
            Search Doctors
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-200 border-t-[#3B82F6]"></div>
            <p className="mt-4 text-slate-500 font-medium">Finding the best doctors for you...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc, idx) => (
              <div key={idx} className="bg-white rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
                
                {/* Top Banner Context */}
                <div className={`h-2 w-full ${doc.waitingCount > 10 ? 'bg-orange-400' : doc.waitingCount > 5 ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>

                <div className="p-6 md:p-8 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-inner group-hover:scale-110 transition-transform">
                        {doc.name ? doc.name.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div>
                        <h3 className="text-[19px] font-bold text-slate-800 leading-tight mb-1">Dr. {doc.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-bold">
                          {doc.specialization}
                        </span>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600" title="Verified Specialist">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8 flex-grow">
                    <div className="flex items-start gap-3">
                      <div className="bg-slate-50 p-2 rounded-lg mt-0.5">
                        <MapPin className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{doc.hospital}</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{doc.address}</p>
                        <button 
                          onClick={() => setMapLocation(`${doc.hospital}, ${doc.address || 'Maduravoyal, Chennai'}`)}
                          className="inline-block text-[#3B82F6] hover:text-blue-700 hover:underline mt-1.5 font-semibold text-[13px]"
                        >
                          View on Map →
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Experience</span>
                            <span className="text-sm font-bold text-slate-700">{doc.experience} Yrs</span>
                          </div>
                       </div>
                       
                       <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100">
                          <Users className="w-4 h-4 text-blue-500" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</span>
                            <span className="text-sm font-bold text-slate-700">{doc.completedCount || 0}+</span>
                          </div>
                       </div>

                       <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100">
                          <IndianRupee className="w-4 h-4 text-emerald-500" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consult Fee</span>
                            <span className="text-sm font-bold text-slate-700">₹{doc.fee || 500}</span>
                          </div>
                       </div>

                       <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100">
                          <ThumbsUp className="w-4 h-4 text-purple-500" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rating</span>
                            <span className="text-sm font-bold text-slate-700">{doc.recommendation || '90%'}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Waiting Queue Status */}
                  <div className="mb-5 flex items-center justify-between bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Activity className={`w-4 h-4 ${doc.waitingCount > 10 ? 'text-orange-500' : 'text-emerald-500'}`} />
                      <span className="text-sm font-semibold text-slate-700">Live Queue</span>
                    </div>
                    <div className="flex items-center gap-2">
                       {doc.waitingCount > 0 ? (
                         <>
                           <div className={`w-2 h-2 rounded-full animate-pulse ${doc.waitingCount > 10 ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                           <span className={`text-sm font-bold ${doc.waitingCount > 10 ? 'text-orange-600' : 'text-emerald-600'}`}>
                             {doc.waitingCount} Waiting
                           </span>
                         </>
                       ) : (
                         <span className="text-sm font-bold text-slate-400">No Wait Time</span>
                       )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedDoctor(doc)}
                    className="w-full bg-[#3B82F6] text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Book Appointment
                  </button>
                </div>
              </div>
            ))}

            {filteredDoctors.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No doctors found</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  We couldn't find any doctors in Maduravoyal matching "{searchQuery}". Try adjusting your search criteria.
                </p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 text-[#3B82F6] font-semibold hover:underline"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}

        {/* Improved Booking Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] p-8 text-white text-center relative">
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors backdrop-blur-md"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-24 h-24 bg-white text-[#3B82F6] rounded-[24px] flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-inner">
                  {selectedDoctor.name ? selectedDoctor.name.charAt(0).toUpperCase() : 'D'}
                </div>
                <h3 className="text-2xl font-bold mb-1">Dr. {selectedDoctor.name}</h3>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/10">
                  {selectedDoctor.specialization}
                </span>
              </div>
              
              <form onSubmit={handleBook} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3B82F6] transition-colors" />
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Time</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3B82F6] transition-colors" />
                    <input 
                      type="time" 
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                  <p className="text-[13px] text-blue-800 font-medium leading-relaxed">
                    By confirming this booking, you will be added to the doctor's queue. Currently, there are <strong className="font-bold">{selectedDoctor.waitingCount} patients</strong> waiting.
                  </p>
                </div>
                
                <div className="pt-2 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="flex-1 py-3.5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] py-3.5 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-md"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {mapLocation && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
              <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Hospital Location</h3>
                  <p className="text-sm text-slate-500">{mapLocation}</p>
                </div>
                <button 
                  onClick={() => setMapLocation(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              <div className="flex-grow bg-slate-100 relative">
                <iframe
                  title="Google Maps Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(mapLocation + ', Chennai')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
