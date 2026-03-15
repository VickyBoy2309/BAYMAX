import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    const user = JSON.parse(userStr);
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Mock Backend Setup to ensure the app works fully in a static preview environment
const mock = new MockAdapter(api, { delayResponse: 500 });

const getStorage = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setStorage = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// Initialize Mock Data if empty
if (!localStorage.getItem('users')) setStorage('users', []);
if (!localStorage.getItem('doctors')) {
  const doctorsList = [
    { _id: 'd1', user: 'd1_u', name: 'A Gunasekaran', specialization: 'Comprehensive Care', hospital: 'Baymax Clinic', address: 'Maduravoyal', experience: 10, waitingCount: 2, completedCount: 15, fee: 600, recommendation: '94%' },
    { _id: 'd2', user: 'd2_u', name: 'C Dev Krishna Bharathi', specialization: 'Comprehensive Care', hospital: 'City Care', address: 'Maduravoyal', experience: 8, waitingCount: 0, completedCount: 5, fee: 800, recommendation: '50%' },
    { _id: 'd3', user: 'd3_u', name: 'Suresh Kumar D', specialization: 'General Physician', hospital: 'Prime Health', address: 'Ramapuram', experience: 12, waitingCount: 1, completedCount: 20, fee: 750, recommendation: '67%' },
    { _id: 'd4', user: 'd4_u', name: 'Anuradha Sridhar', specialization: 'Comprehensive Care', hospital: 'Sridhar Care', address: 'Maduravoyal', experience: 15, waitingCount: 5, completedCount: 50, fee: 1000, recommendation: '100%' },
    { _id: 'd5', user: 'd5_u', name: 'R Pradeep', specialization: 'Psychiatrist', hospital: 'Mind Wellness', address: 'Vanagaram', experience: 20, waitingCount: 0, completedCount: 40, fee: 2000, recommendation: '100%' },
    { _id: 'd6', user: 'd6_u', name: 'Shaji Bharath', specialization: 'Acupuncturist', hospital: 'Heal Center', address: 'Valasaravakkam', experience: 7, waitingCount: 3, completedCount: 12, fee: 800, recommendation: '99%' },
    { _id: 'd7', user: 'd7_u', name: 'Rathika Nagarajan', specialization: 'Pediatrician', hospital: 'Child Care', address: 'Valasaravakkam', experience: 9, waitingCount: 1, completedCount: 30, fee: 1000, recommendation: 'N/A' },
    { _id: 'd8', user: 'd8_u', name: 'Misbah Dulvi', specialization: 'Dermatologist', hospital: 'Skin Care', address: 'Valasaravakkam', experience: 5, waitingCount: 2, completedCount: 8, fee: 1000, recommendation: '50%' },
    { _id: 'd9', user: 'd9_u', name: 'Vinod Kumar Manepalli', specialization: 'Orthopedist', hospital: 'Bone & Joint', address: 'Valasaravakkam', experience: 14, waitingCount: 4, completedCount: 25, fee: 900, recommendation: 'N/A' },
    { _id: 'd10', user: 'd10_u', name: 'Thomas George', specialization: 'General Physician', hospital: 'George Clinic', address: 'Ramapuram', experience: 11, waitingCount: 0, completedCount: 18, fee: 750, recommendation: '91%' },
  ];
  setStorage('doctors', doctorsList);

  const usersList = doctorsList.map(d => ({
    _id: d.user,
    name: d.name,
    email: d.name.split(' ').join('').toLowerCase() + '@baymax.com',
    password: 'password123',
    role: 'doctor',
    isApproved: true
  }));
  const existingUsers = getStorage('users');
  setStorage('users', [...existingUsers, ...usersList]);
} else {
  // To ensure the update applies if they already have an existing local storage
  const doctorsList = getStorage('doctors');
  if (doctorsList.length === 0) {
    localStorage.removeItem('doctors');
    window.location.reload();
  }
}
if (!localStorage.getItem('appointments')) setStorage('appointments', []);
if (!localStorage.getItem('medicines')) {
  setStorage('medicines', [
    { _id: 'm1', name: 'Paracetamol 500mg', type: 'Tablet', price: 50, pharmacy: 'Apollo Pharmacy', availability: true, latitude: 13.0645, longitude: 80.1610 },
    { _id: 'm2', name: 'Amoxicillin 250mg', type: 'Capsule', price: 120, pharmacy: 'MedPlus', availability: true, latitude: 13.0655, longitude: 80.1620 },
  ]);
}
if (!localStorage.getItem('cart')) setStorage('cart', []);
if (!localStorage.getItem('labs')) {
  setStorage('labs', [
    { _id: 'l1', name: 'Complete Blood Count (CBC)', price: 400, description: 'Measures various components of blood.' },
    { _id: 'l2', name: 'Lipid Profile', price: 800, description: 'Measures cholesterol and triglycerides.' }
  ]);
}
if (!localStorage.getItem('bloodRequests')) setStorage('bloodRequests', []);
if (!localStorage.getItem('labBookings')) setStorage('labBookings', []);
if (!localStorage.getItem('healthRecords')) setStorage('healthRecords', []);

// Auth routes
mock.onPost('/auth/register').reply((config) => {
  const data = JSON.parse(config.data);
  const users = getStorage('users');
  
  if (users.find((u: any) => u.email === data.email)) {
    return [400, { message: 'User already exists' }];
  }

  const newUser = {
    _id: uuidv4(),
    ...data,
    isApproved: data.role !== 'doctor',
    token: 'mock-jwt-token'
  };
  
  users.push(newUser);
  setStorage('users', users);

  if (data.role === 'doctor') {
    const doctors = getStorage('doctors');
    doctors.push({
      _id: uuidv4(),
      user: newUser._id,
      name: data.name,
      specialization: data.specialization,
      experience: data.experience,
      hospital: data.hospital,
      address: 'Maduravoyal, Chennai',
      waitingCount: 0,
      completedCount: 0
    });
    setStorage('doctors', doctors);
  }

  return [201, newUser];
});

mock.onPost('/auth/login').reply((config) => {
  const { email, password } = JSON.parse(config.data);
  const users = getStorage('users');
  
  if (email === 'admin' && password === 'admin@baymax' || email === 'admin@baymax.com') {
    return [200, {
      _id: 'admin', name: 'Admin', email: 'admin@baymax.com', role: 'admin', isApproved: true, token: 'admin-token'
    }];
  }

  const user = users.find((u: any) => u.email === email && u.password === password);
  if (!user) return [401, { message: 'Invalid credentials' }];

  if (user.role === 'doctor' && !user.isApproved) {
    return [403, { message: 'Your account is pending admin approval.' }];
  }

  return [200, { ...user, token: 'mock-jwt-token' }];
});

// Admin routes
mock.onGet('/admin/pending-doctors').reply(() => {
  const users = getStorage('users');
  const doctors = getStorage('doctors');
  
  const unapprovedUsers = users.filter((u: any) => u.role === 'doctor' && !u.isApproved);
  const result = unapprovedUsers.map((u: any) => {
    const docProfile = doctors.find((d: any) => d.user === u._id) || {};
    return { ...u, profile: docProfile };
  });
  
  return [200, result];
});

mock.onPut(/\/admin\/approve-doctor\/.+/).reply((config) => {
  const id = config.url?.split('/').pop();
  const users = getStorage('users');
  const userIndex = users.findIndex((u: any) => u._id === id);
  if (userIndex > -1) {
    users[userIndex].isApproved = true;
    setStorage('users', users);
  }
  return [200, { message: 'Approved' }];
});

mock.onDelete(/\/admin\/reject-doctor\/.+/).reply((config) => {
  const id = config.url?.split('/').pop();
  const users = getStorage('users');
  const filteredUsers = users.filter((u: any) => u._id !== id);
  setStorage('users', filteredUsers);
  return [200, { message: 'Rejected' }];
});

// Patient routes
mock.onGet('/patients/doctors').reply(() => {
  const users = getStorage('users');
  const doctors = getStorage('doctors');
  
  const approvedDoctors = doctors.filter((doc: any) => {
    const u = users.find((user: any) => user._id === doc.user);
    return u?.isApproved;
  });
  
  return [200, approvedDoctors];
});

mock.onGet('/patients/appointments').reply((config) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return [401, {message:'Unauthorized'}];
  
  const patientId = JSON.parse(userStr)._id;
  const allAppts = getStorage('appointments');
  const doctors = getStorage('doctors');
  const users = getStorage('users');
  
  const myAppts = allAppts.filter((a: any) => a.patient === patientId).map((a: any) => {
    const docProfile = doctors.find((d: any) => d._id === a.doctor) || {};
    const docUser = users.find((u: any) => u._id === docProfile.user) || {};
    return { ...a, doctorProfile: docProfile, doctor: docUser };
  });

  return [200, myAppts];
});

mock.onPost('/patients/appointments').reply((config) => {
  const { doctorId, date, time, reason } = JSON.parse(config.data);
  const appointments = getStorage('appointments');
  
  // Extract user ID from header (mock)
  const token = config.headers?.Authorization as string;
  let patientId = 'unknown';
  if (token) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      patientId = JSON.parse(userStr)._id;
    }
  }

  const newAppt = {
    _id: uuidv4(),
    patient: patientId,
    doctor: doctorId,
    date, time, reason, status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  appointments.push(newAppt);
  setStorage('appointments', appointments);
  
  return [201, newAppt];
});

mock.onGet('/patients/medicines').reply(() => {
  return [200, getStorage('medicines')];
});

mock.onPost('/patients/cart').reply((config) => {
  const { medicineId, quantity } = JSON.parse(config.data);
  const cart = getStorage('cart');
  const medicines = getStorage('medicines');
  const med = medicines.find((m: any) => m._id === medicineId);
  
  if (med) {
    const existing = cart.find((c: any) => c.medicine._id === medicineId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ _id: uuidv4(), medicine: med, quantity });
    }
    setStorage('cart', cart);
  }
  return [200, { message: 'Added to cart' }];
});

mock.onGet('/patients/cart').reply(() => {
  return [200, { items: getStorage('cart') }];
});

mock.onPost('/patients/cart/checkout').reply(() => {
  setStorage('cart', []);
  return [200, { message: 'Checkout successful' }];
});

mock.onGet('/patients/labs').reply(() => {
  return [200, getStorage('labs')];
});

mock.onPost('/patients/book-lab').reply((config) => {
  const { labTestId, date, time, type, address } = JSON.parse(config.data);
  const userStr = localStorage.getItem('user');
  if (!userStr) return [401, { message: 'Unauthorized' }];
  const patientId = JSON.parse(userStr)._id;

  const labBookings = getStorage('labBookings');
  const newBooking = {
    _id: uuidv4(),
    patientId,
    labTestId,
    date,
    time,
    type,
    address,
    status: 'booked',
    createdAt: new Date().toISOString()
  };
  
  labBookings.push(newBooking);
  setStorage('labBookings', labBookings);

  return [200, { message: 'Lab booked successfully. Notification sent to your email ID.' }];
});

mock.onGet('/patients/lab-bookings').reply(() => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return [401, { message: 'Unauthorized' }];
  const patientId = JSON.parse(userStr)._id;

  const labBookings = getStorage('labBookings');
  const labs = getStorage('labs');

  const myBookings = labBookings.filter((b: any) => b.patientId === patientId).map((b: any) => {
    const testDetails = labs.find((l: any) => l._id === b.labTestId) || {};
    return { ...b, testDetails };
  });

  return [200, myBookings];
});

mock.onGet('/patients/blood-requests').reply(() => {
  return [200, getStorage('bloodRequests')];
});

mock.onPost('/patients/blood-requests').reply((config) => {
  const data = JSON.parse(config.data);
  const reqs = getStorage('bloodRequests');
  reqs.push({ _id: uuidv4(), ...data, status: 'pending', createdAt: new Date().toISOString() });
  setStorage('bloodRequests', reqs);
  return [200, { message: 'Requested successfully' }];
});

mock.onGet('/patients/records').reply((config) => {
  // Try to get current patient
  const userStr = localStorage.getItem('user');
  if (!userStr) return [401, {message:'Unauthorized'}];
  
  const patientId = JSON.parse(userStr)._id;
  const allAppts = getStorage('appointments');
  const doctors = getStorage('doctors');
  const healthRecords = getStorage('healthRecords');
  
  const myAppts = allAppts.filter((a: any) => a.patient === patientId).map((a: any) => {
    const doc = doctors.find((d: any) => d._id === a.doctor) || {};
    return { ...a, doctor: doc };
  });

  const myRecords = healthRecords.filter((r: any) => r.patientId === patientId);

  return [200, { appointments: myAppts, documents: myRecords, labs: [] }];
});

mock.onPost('/patients/records/upload').reply((config) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return [401, { message: 'Unauthorized' }];
  const patientId = JSON.parse(userStr)._id;

  const { fileName, fileType, fileSize } = JSON.parse(config.data);
  const records = getStorage('healthRecords');
  
  // Simulate AI Data Extraction for Graph
  const extractedData = {
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    bloodPressure: Math.floor(Math.random() * 20) + 110, // 110-130
    bloodSugar: Math.floor(Math.random() * 30) + 80, // 80-110
    heartRate: Math.floor(Math.random() * 20) + 65, // 65-85
  };

  const newDoc = {
    _id: uuidv4(),
    patientId,
    fileName,
    fileType,
    fileSize,
    uploadDate: new Date().toISOString(),
    extractedData
  };

  records.push(newDoc);
  setStorage('healthRecords', records);

  return [200, newDoc];
});

mock.onDelete(/\/patients\/records\/.+/).reply((config) => {
  const id = config.url?.split('/').pop();
  const records = getStorage('healthRecords');
  const filtered = records.filter((r: any) => r._id !== id);
  setStorage('healthRecords', filtered);
  return [200, { message: 'Deleted successfully' }];
});

// Doctor routes
mock.onGet('/doctor/profile').reply((config) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return [401, {message:'Unauthorized'}];
  const userId = JSON.parse(userStr)._id;
  
  const doctors = getStorage('doctors');
  const docProfile = doctors.find((d: any) => d.user === userId);
  
  if (!docProfile) return [404, {message:'Profile not found'}];
  return [200, docProfile];
});

mock.onPut('/doctor/waiting-count').reply((config) => {
  const { action } = JSON.parse(config.data);
  const userStr = localStorage.getItem('user');
  if (!userStr) return [401, {message:'Unauthorized'}];
  const userId = JSON.parse(userStr)._id;
  
  const doctors = getStorage('doctors');
  const docIndex = doctors.findIndex((d: any) => d.user === userId);
  
  if (docIndex > -1) {
    if (typeof doctors[docIndex].totalCompleted === 'undefined') {
      doctors[docIndex].totalCompleted = doctors[docIndex].completedCount || 0;
    }
    
    if (action === 'increment') {
      doctors[docIndex].waitingCount = (doctors[docIndex].waitingCount || 0) + 1;
    } else if (action === 'decrement' && doctors[docIndex].waitingCount > 0) {
      doctors[docIndex].waitingCount -= 1;
      doctors[docIndex].completedCount = (doctors[docIndex].completedCount || 0) + 1;
      doctors[docIndex].totalCompleted += 1;
    }
    
    setStorage('doctors', doctors);
    return [200, doctors[docIndex]];
  }
  return [404, {message:'Profile not found'}];
});

mock.onGet('/doctor/appointments').reply((config) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return [401, {message:'Unauthorized'}];
  const userId = JSON.parse(userStr)._id;
  
  const doctors = getStorage('doctors');
  const docProfile = doctors.find((d: any) => d.user === userId);
  if (!docProfile) return [200, []];

  const appts = getStorage('appointments').filter((a: any) => a.doctor === docProfile._id);
  const users = getStorage('users');
  
  const populated = appts.map((a: any) => {
    const pat = users.find((u: any) => u._id === a.patient) || { name: 'Unknown' };
    return { ...a, patient: pat };
  });
  
  return [200, populated];
});

mock.onPut(/\/doctor\/appointment\/.+\/status/).reply((config) => {
  const id = config.url?.split('/')[3];
  const { status } = JSON.parse(config.data);
  
  const appts = getStorage('appointments');
  const apptIndex = appts.findIndex((a: any) => a._id === id);
  
  if (apptIndex > -1) {
    appts[apptIndex].status = status;
    setStorage('appointments', appts);
    
    // Update waiting count if approved
    if (status === 'approved') {
      const doctors = getStorage('doctors');
      const docIndex = doctors.findIndex((d: any) => d._id === appts[apptIndex].doctor);
      if (docIndex > -1) {
        doctors[docIndex].waitingCount = (doctors[docIndex].waitingCount || 0) + 1;
        setStorage('doctors', doctors);
      }
    }
  }
  return [200, { message: 'Status updated' }];
});

mock.onPut(/\/doctor\/appointment\/.+\/done/).reply((config) => {
  const id = config.url?.split('/')[3];
  
  const appts = getStorage('appointments');
  const apptIndex = appts.findIndex((a: any) => a._id === id);
  
  if (apptIndex > -1) {
    appts[apptIndex].status = 'completed';
    const docId = appts[apptIndex].doctor;
    setStorage('appointments', appts);
    
    // Decrease waiting count, increase completed count
    const doctors = getStorage('doctors');
    const docIndex = doctors.findIndex((d: any) => d._id === docId);
    if (docIndex > -1) {
      if (typeof doctors[docIndex].totalCompleted === 'undefined') {
        doctors[docIndex].totalCompleted = doctors[docIndex].completedCount || 0;
      }
      if (doctors[docIndex].waitingCount > 0) doctors[docIndex].waitingCount -= 1;
      doctors[docIndex].completedCount = (doctors[docIndex].completedCount || 0) + 1;
      doctors[docIndex].totalCompleted += 1;
      setStorage('doctors', doctors);
    }
  }
  return [200, { message: 'Marked as done' }];
});

export default api;
