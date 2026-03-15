import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, Calendar, FileText, CheckCircle2, Clock, XCircle, 
  FlaskConical, TestTube2, Upload, File, Image as ImageIcon, 
  Activity, HeartPulse, Trash2, Droplet, Loader2
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from 'recharts';

export default function HealthRecords() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [labBookings, setLabBookings] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'appointments' | 'labs'>('overview');
  
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const [aptRes, labRes, docRes] = await Promise.all([
        api.get('/patients/appointments'),
        api.get('/patients/lab-bookings'),
        api.get('/patients/records')
      ]);
      setAppointments(aptRes.data);
      setLabBookings(labRes.data);
      setDocuments(docRes.data?.documents || []);
    } catch (error) {
      console.error('Failed to fetch records', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploading(true);
      
      try {
        // Simulating upload and AI Data Extraction processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const payload = {
          fileName: file.name,
          fileType: file.type,
          fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
        };

        const res = await api.post('/patients/records/upload', payload);
        
        // Add new document to state to reflect UI change instantly
        setDocuments([res.data, ...documents]);
        
        // Switch to overview to show them the new graph points automatically
        setActiveTab('overview');
        
      } catch (error) {
        console.error('Upload failed', error);
        alert('Failed to upload and analyze document. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      await api.delete(`/patients/records/${id}`);
      setDocuments(documents.filter(f => f._id !== id));
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'approved': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'rejected': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-orange-500 bg-orange-50 border-orange-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'approved': return <CheckCircle2 className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Dynamically compute graph data from uploaded documents
  const graphData = useMemo(() => {
    if (!documents || documents.length === 0) return [];
    
    // Extract the AI analyzed points and sort by date 
    const dataPoints = documents
      .filter(doc => doc.extractedData)
      .map(doc => ({
        month: doc.extractedData.date,
        bp: doc.extractedData.bloodPressure,
        sugar: doc.extractedData.bloodSugar,
        heartRate: doc.extractedData.heartRate,
        timestamp: new Date(doc.uploadDate).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
      
    // Remove the raw timestamp before passing to Recharts
    return dataPoints.map(({ timestamp, ...rest }) => rest);
  }, [documents]);

  const avgStats = useMemo(() => {
    if (graphData.length === 0) return { bp: 0, sugar: 0, hr: 0 };
    const sums = graphData.reduce((acc, curr) => ({
      bp: acc.bp + curr.bp,
      sugar: acc.sugar + curr.sugar,
      hr: acc.hr + curr.heartRate
    }), { bp: 0, sugar: 0, hr: 0 });
    
    return {
      bp: Math.round(sums.bp / graphData.length),
      sugar: Math.round(sums.sugar / graphData.length),
      hr: Math.round(sums.hr / graphData.length)
    };
  }, [graphData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-[#3B82F6]" />
              Health Records
            </h1>
            <p className="text-slate-500 mt-1">Manage your health data, documents, and medical history</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('documents')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'documents' ? 'bg-[#10B981] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Documents
            </button>
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'appointments' ? 'bg-[#F59E0B] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Appointments
            </button>
            <button 
              onClick={() => setActiveTab('labs')}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${activeTab === 'labs' ? 'bg-[#A855F7] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Lab Results
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {graphData.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-rose-100 text-rose-500 rounded-2xl flex items-center justify-center">
                          <HeartPulse className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-slate-500 text-sm font-medium">Avg Heart Rate</p>
                          <h4 className="text-2xl font-bold text-slate-800">{avgStats.hr} <span className="text-sm text-slate-400 font-normal">bpm</span></h4>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center">
                          <Activity className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-slate-500 text-sm font-medium">Avg Blood Pressure (Sys)</p>
                          <h4 className="text-2xl font-bold text-slate-800">{avgStats.bp} <span className="text-sm text-slate-400 font-normal">mmHg</span></h4>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-100 text-emerald-500 rounded-2xl flex items-center justify-center">
                          <Droplet className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-slate-500 text-sm font-medium">Avg Blood Sugar</p>
                          <h4 className="text-2xl font-bold text-slate-800">{avgStats.sugar} <span className="text-sm text-slate-400 font-normal">mg/dL</span></h4>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-indigo-500" />
                            AI Health Analysis
                          </h2>
                          <p className="text-slate-500 mt-1 text-sm">Trends extracted dynamically from your uploaded documents</p>
                        </div>
                      </div>
                      
                      <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 20px' }}
                              itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Area type="monotone" name="Blood Pressure" dataKey="bp" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorBp)" />
                            <Area type="monotone" name="Blood Sugar" dataKey="sugar" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorSugar)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-16 rounded-[32px] border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center">
                    <Activity className="w-20 h-20 text-slate-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-800">No Health Data Available</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">Upload your medical reports or scans in the Documents tab. BAYMAX AI will analyze them and generate your health trend graph.</p>
                    <button 
                      onClick={() => setActiveTab('documents')}
                      className="mt-8 px-8 py-3 bg-[#3B82F6] text-white font-semibold rounded-2xl hover:bg-blue-600 shadow-sm transition-all hover:shadow-md"
                    >
                      Upload Documents
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-emerald-200 bg-emerald-50/30 transition-all rounded-[32px] p-12 text-center flex flex-col items-center justify-center shadow-sm ${uploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-emerald-50/80 group'}`}
                >
                  <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                    {uploading ? (
                      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    ) : (
                      <Upload className="w-10 h-10 text-emerald-500" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {uploading ? 'BAYMAX is Analyzing Document...' : 'Upload Scans & Medical Reports'}
                  </h3>
                  <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                    {uploading 
                      ? 'Extracting vital signs and health data using AI...' 
                      : 'Click or drag and drop your physical records, x-rays, or prescriptions here to digitize and extract insights.'}
                  </p>
                  {!uploading && (
                    <div className="mt-4 px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                      PDF, JPG, PNG up to 10MB
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    disabled={uploading}
                  />
                </div>

                <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Your Documents</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {documents.map((file) => (
                      <div key={file._id} className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${file.fileType.includes('image') ? 'bg-purple-100 text-purple-600' : 'bg-rose-100 text-rose-600'}`}>
                            {file.fileType.includes('image') ? <ImageIcon className="w-7 h-7" /> : <File className="w-7 h-7" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 line-clamp-1">{file.fileName}</p>
                            <p className="text-xs sm:text-sm text-slate-500 flex gap-2 font-medium mt-1">
                              <span>Uploaded on {new Date(file.uploadDate).toLocaleDateString()}</span>
                              <span className="text-slate-300">•</span>
                              <span>{file.fileSize}</span>
                            </p>
                            {file.extractedData && (
                              <p className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Data Extracted Successfully
                              </p>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteFile(file._id)}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {documents.length === 0 && (
                      <div className="p-16 text-center text-slate-500 flex flex-col items-center">
                        <FileText className="w-16 h-16 text-slate-200 mb-4" />
                        <p className="text-lg font-medium text-slate-700">No documents uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* APPOINTMENTS TAB */}
            {activeTab === 'appointments' && (
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                {appointments.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {appointments.map((apt, idx) => (
                      <div key={idx} className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-slate-50/50 transition-colors">
                        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">
                          {apt.doctor?.name?.charAt(0).toUpperCase() || 'D'}
                        </div>
                        
                        <div className="flex-grow space-y-1">
                          <h3 className="text-lg font-bold text-slate-800">Dr. {apt.doctor?.name}</h3>
                          <p className="text-slate-500 text-sm flex items-center gap-2">
                            {apt.doctorProfile?.specialization || 'Specialist'} • {apt.doctorProfile?.hospital || 'Hospital'}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full md:w-auto mt-4 md:mt-0">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {new Date(apt.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 font-medium">
                              <Clock className="w-4 h-4 text-slate-400" />
                              {apt.time}
                            </div>
                          </div>

                          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border capitalize whitespace-nowrap ${getStatusColor(apt.status)}`}>
                            {getStatusIcon(apt.status)}
                            {apt.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <FileText className="w-20 h-20 text-slate-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-800">No appointments found</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">You haven't booked any appointments yet. Book one to start tracking your history.</p>
                    <button 
                      onClick={() => navigate('/appointments')}
                      className="mt-8 px-8 py-3 bg-[#F59E0B] text-white font-semibold rounded-2xl hover:bg-orange-500 shadow-sm transition-all hover:shadow-md"
                    >
                      Book Appointment
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* LABS TAB */}
            {activeTab === 'labs' && (
              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                {labBookings.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {labBookings.map((booking, idx) => (
                      <div key={idx} className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-slate-50/50 transition-colors">
                        <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                          <TestTube2 className="w-7 h-7" />
                        </div>
                        
                        <div className="flex-grow space-y-1">
                          <h3 className="text-lg font-bold text-slate-800">{booking.testDetails?.name || booking.labTestId}</h3>
                          <p className="text-slate-500 text-sm font-medium">
                            Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 w-full md:w-auto mt-4 md:mt-0">
                          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border capitalize whitespace-nowrap ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </div>
                          
                          {booking.status === 'completed' && (
                            <button className="text-[#A855F7] hover:bg-purple-50 px-4 py-2 rounded-xl transition-colors text-sm font-bold whitespace-nowrap">
                              Download Report
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center flex flex-col items-center justify-center min-h-[300px]">
                    <FlaskConical className="w-20 h-20 text-slate-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-800">No lab tests found</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">You haven't booked any lab tests yet.</p>
                    <button 
                      onClick={() => navigate('/labs')}
                      className="mt-8 px-8 py-3 bg-[#A855F7] text-white font-semibold rounded-2xl hover:bg-purple-600 shadow-sm transition-all hover:shadow-md"
                    >
                      Book Lab Test
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
