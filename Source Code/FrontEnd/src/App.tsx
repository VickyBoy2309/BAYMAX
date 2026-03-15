import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import HealthRecords from './pages/HealthRecords';
import BuyMedicines from './pages/BuyMedicines';
import CartView from './pages/CartView';
import LabTestsView from './pages/LabTestsView';
import BloodBank from './pages/BloodBank';
import Insurance from './pages/Insurance';
import VideoCall from './pages/VideoCall';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactElement, allowedRoles?: string[] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'doctor') return <Navigate to="/doctor" />;
  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <DoctorAppointments />
            </ProtectedRoute>
          } />
          <Route path="/health-records" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <HealthRecords />
            </ProtectedRoute>
          } />
          <Route path="/medicines" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BuyMedicines />
            </ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <CartView />
            </ProtectedRoute>
          } />
          <Route path="/labs" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <LabTestsView />
            </ProtectedRoute>
          } />
          <Route path="/blood-bank" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <BloodBank />
            </ProtectedRoute>
          } />
          <Route path="/insurance" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Insurance />
            </ProtectedRoute>
          } />
          <Route path="/video-call/:id" element={
            <ProtectedRoute allowedRoles={['patient', 'doctor']}>
              <VideoCall />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export { App };
export default App;
