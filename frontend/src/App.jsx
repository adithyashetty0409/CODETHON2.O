import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CreateRequestModal from './components/CreateRequestModal';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentServicesPage from './pages/StudentServicesPage';
import StudentRequestsPage from './pages/StudentRequestsPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminPortal from './pages/AdminPortal';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRequestsPage from './pages/AdminRequestsPage';
import AdminDepartmentsPage from './pages/AdminDepartmentsPage';
import NotificationsPage from './pages/NotificationsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If student attempts to access admin route, redirect to student dashboard
    if (user?.role === 'student') {
      return <Navigate to="/dashboard" replace />;
    }
    // If admin accesses student route, redirect to admin dashboard
    return <Navigate to="/admin" replace />;
  }

  return children;
};

// Main App Dashboard Shell
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <CreateRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onRequestCreated={() => {
          setIsCreateModalOpen(false);
          // Trigger refresh if needed
          window.location.reload();
        }}
      />
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Student Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout>
              <StudentServicesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-requests"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout>
              <StudentRequestsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Executive Portal Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'faculty']}>
            <DashboardLayout>
              <AdminPortal />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-portal"
        element={
          <ProtectedRoute allowedRoles={['admin', 'faculty']}>
            <DashboardLayout>
              <AdminPortal />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute allowedRoles={['admin', 'faculty']}>
            <DashboardLayout>
              <AdminRequestsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <ProtectedRoute allowedRoles={['admin', 'faculty']}>
            <DashboardLayout>
              <AdminDepartmentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Shared Protected Notifications Page */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'faculty']}>
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
