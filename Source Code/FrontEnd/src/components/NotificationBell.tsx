import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Info } from 'lucide-react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome to BAYMAX!',
      message: 'Your account has been successfully created. Explore our healthcare services.',
      time: 'Just now',
      read: false,
      type: 'info'
    },
    {
      id: 2,
      title: 'Appointment Reminder',
      message: 'You have an upcoming appointment scheduled for tomorrow.',
      time: '2 hours ago',
      read: false,
      type: 'reminder'
    },
    {
      id: 3,
      title: 'System Update',
      message: 'New features have been added to the Blood Bank module.',
      time: '1 day ago',
      read: true,
      type: 'system'
    }
  ]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="text-slate-400 hover:text-slate-600 transition-colors relative p-1"
      >
        <Bell className="w-[22px] h-[22px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#F43F5E] text-white text-[10px] font-bold px-[5px] py-[1px] rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-[#3B82F6] font-medium hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5">
                      {notif.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                      {notif.type === 'reminder' && <Clock className="w-5 h-5 text-amber-500" />}
                      {notif.type === 'system' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold ${!notif.read ? 'text-slate-800' : 'text-slate-600'}`}>
                          {notif.title}
                        </p>
                        {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 text-center bg-slate-50">
              <button className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
