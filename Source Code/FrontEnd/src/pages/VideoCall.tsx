import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Activity, AlertCircle, Maximize, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function VideoCall() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [appointment, setAppointment] = useState<any>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Fetch appointment details
    const fetchAppointment = async () => {
      try {
        const endpoint = user?.role === 'doctor' ? '/doctor/appointments' : '/patients/records';
        const res = await api.get(endpoint);
        const appts = user?.role === 'doctor' ? res.data : res.data.appointments;
        const current = appts.find((a: any) => a._id === id);
        if (current) setAppointment(current);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAppointment();

    // Simulate connection delay
    const timer = setTimeout(() => setIsConnected(true), 2500);
    
    // Try getting local camera
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Camera access denied or unavailable", err));

    return () => {
      clearTimeout(timer);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [id, user]);

  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const handleEndCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate(-1);
  };

  const otherPersonName = user?.role === 'doctor' 
    ? appointment?.patient?.name || 'Patient' 
    : `Dr. ${appointment?.doctor?.name || 'Doctor'}`;

  return (
    <div className="h-screen w-full bg-[#0F172A] flex flex-col font-sans overflow-hidden relative">
      
      {/* Top Header */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3 text-white">
          <div className="bg-[#00A99D] p-1.5 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-tight">BAYMAX Consult</span>
            <span className="text-sm opacity-80 flex items-center gap-1.5">
              {isConnected ? (
                <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Encrypted Call</>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Connecting...</>
              )}
            </span>
          </div>
        </div>
        <div className="text-white bg-white/10 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
          {isConnected ? '00:14' : 'Connecting...'}
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
             <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                <User className="w-10 h-10 text-slate-500" />
             </div>
             <p className="text-lg font-medium">Connecting to {otherPersonName}...</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Remote Video Placeholder */}
            <div className="absolute inset-0 bg-[#1E293B] flex flex-col items-center justify-center">
               <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center shadow-2xl mb-6 ring-4 ring-slate-800">
                  <span className="text-5xl font-bold text-slate-400">
                    {otherPersonName.charAt(user?.role === 'patient' ? 4 : 0).toUpperCase()}
                  </span>
               </div>
               <h2 className="text-2xl font-semibold text-white tracking-wide">{otherPersonName}</h2>
               <p className="text-slate-400 mt-2 flex items-center gap-2">
                 <MicOff className="w-4 h-4" /> Remote user's mic is off
               </p>
            </div>

            {/* Local Video Picture-in-Picture */}
            <div className="absolute bottom-28 right-6 w-48 md:w-64 aspect-[3/4] md:aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-slate-700 z-10">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
              />
              {isVideoOff && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                  <User className="w-10 h-10 mb-2" />
                  <span className="text-xs font-medium">You</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs font-medium backdrop-blur-md">
                You {isMuted && '(Muted)'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-24 bg-[#0B1121] flex items-center justify-center gap-4 md:gap-6 px-4 pb-4">
        <button 
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button 
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
          title={isVideoOff ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <button 
          className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-all hidden md:flex"
          title="Chat"
        >
          <MessageSquare className="w-6 h-6" />
        </button>

        <button 
          onClick={handleEndCall}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all transform hover:scale-105 shadow-lg shadow-red-900/50 ml-4"
          title="End Call"
        >
          <PhoneOff className="w-7 h-7" />
        </button>
      </div>

    </div>
  );
}
