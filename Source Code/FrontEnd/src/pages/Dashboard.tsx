import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationBell from '../components/NotificationBell';
import ChatBot from '../components/ChatBot';
import {
  HeartPulse,
  Home,
  Calendar,
  Pill,
  FlaskConical,
  FileText,
  Shield,
  Droplet,
  Bell,
  User,
  X,
  Search,
  AlertTriangle,
  Phone,
  ChevronRight,
  LogOut,
  Video,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labBookings, setLabBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ upcoming: 0, total: 0, labs: 0, reminders: 0 });

  useEffect(() => {
    if (user) {
      api.get('/patients/records').then(res => {
        const appts = res.data.appointments || [];
        setAppointments(appts);
        const upcoming = appts.filter((a: any) => a.status === 'approved' || a.status === 'pending').length;
        setStats(s => ({ ...s, total: appts.length, upcoming }));
      }).catch(console.error);
      
      api.get('/patients/labs').then(res => {
        setStats(s => ({ ...s, labs: res.data.length || 0 }));
      }).catch(console.error);

      api.get('/patients/lab-bookings').then(res => {
        const bookings = res.data || [];
        setLabBookings(bookings);
        setStats(s => ({ ...s, reminders: bookings.length }));
      }).catch(console.error);
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-2 text-[#00A99D] cursor-pointer">
            <div className="bg-[#00A99D] p-1.5 rounded-lg flex items-center justify-center">
              <HeartPulse className="text-white w-6 h-6" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-2xl tracking-tight">BAYMAX</span>
          </div>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-1.5 ml-8 mr-auto">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-[15px] font-medium transition-colors">
              <Home className="w-[18px] h-[18px]" strokeWidth={2.5} /> Home
            </button>
            <button onClick={() => navigate('/appointments')} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-[15px] font-medium transition-colors">
              <Calendar className="w-[18px] h-[18px]" /> Appointments
            </button>
            <button onClick={() => navigate('/medicines')} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-[15px] font-medium transition-colors">
              <Pill className="w-[18px] h-[18px]" /> Medicines
            </button>
            <button onClick={() => navigate('/labs')} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-[15px] font-medium transition-colors">
              <FlaskConical className="w-[18px] h-[18px]" /> Lab Tests
            </button>
            <button onClick={() => navigate('/health-records')} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-[15px] font-medium transition-colors">
              <FileText className="w-[18px] h-[18px]" /> Records
            </button>
            <button onClick={() => navigate('/blood-bank')} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-[15px] font-medium transition-colors">
              <Droplet className="w-[18px] h-[18px]" /> Blood Bank
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5">
            <NotificationBell />
            
            <div className="flex items-center gap-2 border-l border-slate-200 pl-5 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
              <div className="w-9 h-9 rounded-full bg-[#3B82F6] text-white flex items-center justify-center font-bold shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:flex flex-col">
                <div className="text-[13px] font-medium text-slate-700 leading-tight">@{user.name.toLowerCase().split(' ')[0]}</div>
                <div className="text-[#3B82F6] bg-blue-50 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium mt-0.5 w-max capitalize">
                  <User className="w-3 h-3" /> {user.role}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Info Banner */}
      {showBanner && (
        <div className="bg-[#4F46E5] text-white px-4 py-2.5 flex items-center justify-center text-[13.5px]">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-2 opacity-90 font-light">
                 <User className="w-4 h-4" />
                 <span>Logged in as <strong className="font-semibold capitalize">{user.role}</strong> · {user.name} <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs ml-1 mr-1">@{user.name.toLowerCase().split(' ')[0]}</span> · Access all healthcare features</span>
              </div>
              <button onClick={() => setShowBanner(false)} className="opacity-70 hover:opacity-100 transition-opacity p-1"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] rounded-[24px] p-8 text-white shadow-lg relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-5">
              {/* Profile Tag */}
              <div className="flex items-center gap-4">
                <div className="w-[52px] h-[52px] bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-md shadow-inner border border-white/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg leading-tight">{user.name}</h3>
                    <span className="bg-white/20 px-2 py-0.5 rounded-md flex items-center gap-1.5 text-xs font-medium backdrop-blur-md border border-white/10 capitalize">
                      <User className="w-3 h-3" /> {user.role}
                    </span>
                  </div>
                  <div className="text-blue-100 text-sm opacity-90 leading-tight">@{user.name.toLowerCase().split(' ')[0]}</div>
                  <div className="text-blue-100 text-[13px] opacity-75 leading-tight">{user.email}</div>
                </div>
              </div>

              {/* Greeting */}
              <div className="space-y-2">
                <h1 className="text-[32px] md:text-[40px] font-bold leading-tight flex items-center gap-3">
                  Good Morning, {user.name.split(' ')[0]}! 
                </h1>
                <p className="text-blue-50/90 max-w-xl text-[15px] md:text-[17px] leading-relaxed font-light">
                  Your personal health dashboard. Track appointments, medicines, and health records all in one place.
                </p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-3 pt-1">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white/20 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-[13px] font-medium shadow-sm hover:bg-white/30 transition-colors cursor-pointer">
                  <Bell className="w-4 h-4" /> view notifications
                </button>
                <span className="bg-white/20 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-[13px] font-medium shadow-sm">
                  Active
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex gap-4 w-full md:w-auto mt-6 md:mt-0 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {[
                { label: 'Upcoming', value: stats.upcoming.toString(), action: () => navigate('/appointments') },
                { label: 'Total Apts', value: stats.total.toString(), action: () => navigate('/health-records') },
                { label: 'Lab Tests', value: stats.reminders.toString(), action: () => { document.getElementById('reminders-section')?.scrollIntoView({ behavior: 'smooth' }); } },
              ].map((stat, i) => (
                <div key={i} onClick={stat.action} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[20px] p-4 flex flex-col items-center justify-center min-w-[90px] md:min-w-[105px] h-[105px] shadow-sm hover:bg-white/15 transition-colors cursor-pointer">
                  <span className="text-3xl font-bold mb-1">{stat.value}</span>
                  <span className="text-[12px] text-blue-50 font-medium text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative shadow-sm group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 transition-colors">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input 
            type="text" 
            className="block w-full pl-12 pr-5 py-4 bg-transparent outline-none text-slate-800 placeholder-slate-400 text-lg transition-all" 
            placeholder="Search doctors, specializations, cities..." 
          />
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-[20px] font-bold text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { label: 'Book Appointment', icon: Calendar, color: 'bg-[#3B82F6]', path: '/appointments' },
              { label: 'Buy Medicines', icon: Pill, color: 'bg-[#10B981]', path: '/medicines' },
              { label: 'Lab Tests', icon: FlaskConical, color: 'bg-[#A855F7]', path: '/labs' },
              { label: 'Health Records', icon: FileText, color: 'bg-[#F59E0B]', path: '/health-records' },
              { label: 'Insurance', icon: Shield, color: 'bg-[#00A99D]', path: '/insurance' },
              { label: 'Blood Bank', icon: Droplet, color: 'bg-[#EF4444]', path: '/blood-bank' },
            ].map((action, i) => (
              <button key={i} onClick={() => action.path !== '#' && navigate(action.path)} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-slate-200 transition-all flex flex-col items-center justify-center gap-4 group">
                <div className={`${action.color} p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-[14px] font-semibold text-slate-700 text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emergency SOS */}
        <div className="bg-[#EF4444] rounded-[24px] p-6 shadow-md text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/20 p-4 rounded-full border border-white/20 backdrop-blur-sm">
               <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-[22px] font-bold">Emergency SOS</h2>
              <p className="text-red-50 text-[15px] font-medium">Need immediate medical assistance?</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <a href="tel:108" className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-white text-[#EF4444] font-bold py-3.5 px-8 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-lg">
              <Phone className="w-5 h-5" /> Call 108
            </a>
            <button onClick={() => navigate('/blood-bank')} className="flex-1 md:flex-none flex items-center justify-center gap-2.5 bg-[#DC2626] text-white font-bold py-3.5 px-8 rounded-xl hover:bg-red-800 transition-colors shadow-sm border border-red-400/30 text-lg">
              <Droplet className="w-5 h-5" fill="currentColor" /> Blood
            </button>
          </div>
        </div>

        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
          {/* Appointments & Reminders */}
          <div className="lg:col-span-2 space-y-8" id="reminders-section">
            
            {/* Appointments */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-bold text-slate-800 flex items-center gap-2.5">
                      <Calendar className="w-[22px] h-[22px] text-[#3B82F6]" /> Your Upcoming Appointments
                  </h2>
                  <button onClick={() => navigate('/health-records')} className="text-[#3B82F6] text-[15px] font-medium hover:underline flex items-center gap-1">
                      View All <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
               
               {appointments.filter(a => a.status === 'pending' || a.status === 'approved').length > 0 ? (
                 <div className="space-y-3">
                   {appointments.filter(a => a.status === 'pending' || a.status === 'approved').slice(0, 3).map((appt: any, i) => (
                     <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl shrink-0">
                           {appt.doctor?.name ? appt.doctor.name.charAt(0) : 'D'}
                         </div>
                         <div>
                           <h4 className="font-bold text-slate-800">Dr. {appt.doctor?.name || 'Unknown'}</h4>
                           <div className="flex items-center gap-3 text-sm text-slate-500">
                             <span>{appt.date} at {appt.time}</span>
                             {appt.status === 'approved' && appt.doctor?.waitingCount !== undefined && (
                               <span className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-medium text-xs">
                                 <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                                 {appt.doctor.waitingCount} waiting ahead
                               </span>
                             )}
                           </div>
                         </div>
                       </div>
                       <div className="flex flex-col items-end gap-2 shrink-0">
                         <span className={`px-3 py-1 text-xs font-semibold rounded-full ${appt.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                           {appt.status.toUpperCase()}
                         </span>
                         {appt.status === 'approved' && (
                           <button 
                             onClick={() => navigate(`/video-call/${appt._id}`)}
                             className="flex items-center gap-1.5 text-xs bg-[#3B82F6] hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm font-medium"
                           >
                             <Video className="w-3.5 h-3.5" /> Join Call
                           </button>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="bg-white rounded-[24px] border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center justify-center text-slate-400">
                    <Calendar className="w-12 h-12 mb-3 text-slate-200" strokeWidth={1} />
                    <p className="text-[14px] font-medium">No upcoming appointments</p>
                    <button onClick={() => navigate('/appointments')} className="mt-4 px-6 py-2 bg-blue-50 text-[#3B82F6] rounded-lg font-medium text-[13px] hover:bg-blue-100 transition-colors">Book Now</button>
                 </div>
               )}
            </div>

            {/* Reminders & Lab Tests */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-bold text-slate-800 flex items-center gap-2.5">
                      <Bell className="w-[22px] h-[22px] text-[#A855F7]" /> Your Reminders & Lab Tests
                  </h2>
               </div>
               
               {labBookings.length > 0 ? (
                 <div className="space-y-3">
                   {labBookings.map((booking: any, i) => (
                     <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between shadow-sm hover:border-[#A855F7]/30 transition-colors relative overflow-hidden">
                       <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#A855F7]"></div>
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                           <FlaskConical className="w-6 h-6" />
                         </div>
                         <div>
                           <h4 className="font-bold text-slate-800">{booking.testDetails?.name || 'Lab Test'}</h4>
                           <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                             <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {booking.date}</span>
                             <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {booking.time}</span>
                             <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md uppercase ${booking.type === 'home' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                               {booking.type === 'home' ? 'Home Collect' : 'Walk-In'}
                             </span>
                           </div>
                         </div>
                       </div>
                       <div className="shrink-0">
                         <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-1.5">
                           <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                         </span>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="bg-white rounded-[24px] border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center justify-center text-slate-400">
                    <FlaskConical className="w-12 h-12 mb-3 text-slate-200" strokeWidth={1} />
                    <p className="text-[14px] font-medium">No active lab bookings or reminders</p>
                    <button onClick={() => navigate('/labs')} className="mt-4 px-6 py-2 bg-purple-50 text-[#A855F7] rounded-lg font-medium text-[13px] hover:bg-purple-100 transition-colors">Book Lab Test</button>
                 </div>
               )}
            </div>

          </div>

          {/* Right Sidebar - Profile Widget */}
          <div className="space-y-4 lg:pt-11">
             <div className="bg-white rounded-[24px] border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center text-center">
                <div className="w-[84px] h-[84px] bg-[#3B82F6] rounded-[24px] flex items-center justify-center text-white text-[32px] font-bold shadow-lg mb-5">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-slate-800 text-[20px]">{user.name}</h3>
                <p className="text-[14px] text-slate-500 mt-1 font-medium capitalize">{user.role} Profile</p>
                
                <div className="w-full h-px bg-slate-100 my-6"></div>
                
                <div className="w-full space-y-3.5 text-[14.5px]">
                    <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl">
                      <span className="text-slate-500 font-medium">Email</span> 
                      <span className="font-bold text-slate-800 text-sm truncate max-w-[150px]" title={user.email}>{user.email}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-xl">
                      <span className="text-slate-500 font-medium">Status</span> 
                      <span className="font-bold text-emerald-500">Active</span>
                    </div>
                </div>
                
                <button onClick={() => navigate('/health-records')} className="mt-6 w-full py-3 border border-slate-200 rounded-xl text-[14.5px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                  View Full Profile
                </button>
             </div>
          </div>

        </div>

      </main>

      {/* Floating Action Button */}
      <ChatBot />

      {/* Added global styles inline for custom hide-scrollbar */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
