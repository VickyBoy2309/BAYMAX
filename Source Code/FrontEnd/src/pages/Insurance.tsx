import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, AlertCircle, FileText, CheckCircle } from 'lucide-react';

export default function Insurance() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm w-max"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-gradient-to-r from-[#00A99D] to-[#047857] p-8 rounded-[24px] text-white shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Health Insurance</h1>
              <p className="text-teal-50">Manage your policies and claims seamlessly.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[24px] shadow-sm border border-slate-200 text-center">
          <Shield className="w-20 h-20 text-[#00A99D] mx-auto mb-6 opacity-80" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">No Active Policies Found</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            You currently don't have any health insurance policies linked to your BAYMAX account. 
            Link your existing policy or explore new plans to secure your health.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="bg-[#00A99D] hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold shadow-sm transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" /> Link Existing Policy
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-8 py-3 rounded-xl font-semibold transition-colors w-full sm:w-auto flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" /> Explore Plans
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Need Help?</h3>
              <p className="text-slate-500 text-sm mb-3">Our support team is available 24/7 to assist you with insurance queries.</p>
              <button className="text-blue-500 font-semibold text-sm hover:underline">Contact Support</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg mb-1">Claim Status</h3>
              <p className="text-slate-500 text-sm mb-3">Track your recent reimbursement requests and pre-authorization status.</p>
              <button className="text-amber-500 font-semibold text-sm hover:underline">Track Claims</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}