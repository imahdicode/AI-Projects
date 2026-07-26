import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PatientList } from './pages/PatientList';
import { PatientDetail } from './pages/PatientDetail';
import { VisitRecorder } from './pages/VisitRecorder';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';
import { sessionService } from './services/apiService';
import { RecentVisits } from './pages/RecentVisits';
import { DoctorQueue } from './pages/DoctorQueue';
import { MedicineInventory } from './pages/MedicineInventory';
import { AdminDashboard } from './pages/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = sessionService.getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = sessionService.getUser();
  if (!user || (user.role !== 'ADMIN' && user.username.toLowerCase() !== 'mahdi')) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="queue" element={<DoctorQueue />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="patients/:id" element={<PatientDetail />} />
            <Route path="patients/:id/new-visit" element={<VisitRecorder />} />
            <Route path="visits" element={<RecentVisits />} />
            <Route path="inventory" element={<MedicineInventory />} />
            <Route path="admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </ErrorBoundary>
  );
};

export default App;