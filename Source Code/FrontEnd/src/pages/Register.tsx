import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'patient',
    specialization: '', experience: '', hospital: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', formData);
      login(data);
      if (data.role === 'doctor') {
        alert('Registration successful! Please wait for admin approval before logging in.');
        navigate('/login');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      if (!err.response) {
        setError('Server unreachable. Is the backend server running on port 5000?');
      } else {
        setError(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-[#06B6D4] p-2 rounded-xl">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">BAYMAX</span>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Create Account</h2>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#06B6D4] outline-none"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#06B6D4] outline-none"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#06B6D4] outline-none"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select 
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#06B6D4] outline-none bg-white"
              value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>

          {formData.role === 'doctor' && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
                Doctor accounts require admin approval. Address is restricted to Maduravoyal, Chennai.
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#06B6D4] outline-none"
                  value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                <input 
                  type="number" required min="0"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#06B6D4] outline-none"
                  value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hospital/Clinic Name</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#06B6D4] outline-none"
                  value={formData.hospital} onChange={(e) => setFormData({...formData, hospital: e.target.value})}
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6"
          >
            Create Account
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-[#2563EB] font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
