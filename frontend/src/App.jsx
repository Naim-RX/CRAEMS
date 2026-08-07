import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';

// Dashboard Pages
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { FacultyDashboard } from './pages/dashboards/FacultyDashboard';
import { ResourceManagerDashboard } from './pages/dashboards/ResourceManagerDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';

// Module Pages
import { RoomManagementPage } from './pages/modules/RoomManagementPage';
import { EquipmentManagementPage } from './pages/modules/EquipmentManagementPage';
import { EventManagementPage } from './pages/modules/EventManagementPage';
import { ReportsPage } from './pages/modules/ReportsPage';
import { ProfilePage } from './pages/modules/ProfilePage';
import { AdminSettingsPage } from './pages/modules/AdminSettingsPage';
import { BookingStatusPage } from './pages/modules/BookingStatusPage';
import { NotFoundPage } from './pages/NotFoundPage';

import './styles/index.css';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role?.name)) {
    return <Navigate to="/dashboard/student" replace />;
  }
  return children;
};

// Role-based dashboard redirect
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role?.name) {
    case 'ADMINISTRATOR': return <Navigate to="/dashboard/admin" replace />;
    case 'RESOURCE_MANAGER': return <Navigate to="/dashboard/manager" replace />;
    case 'FACULTY': return <Navigate to="/dashboard/faculty" replace />;
    default: return <Navigate to="/dashboard/student" replace />;
  }
};

// Home redirect — logged-in users go to dashboard instead of public homepage
const HomeRedirect = () => {
  const { user } = useAuth();
  if (user) return <DashboardRedirect />;
  return <HomePage />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Auth routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Dashboard routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardRedirect />} />

              <Route
                path="/dashboard/student"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'GUEST', 'RESEARCHER', 'LAB_ASSISTANT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/faculty"
                element={
                  <ProtectedRoute allowedRoles={['FACULTY']}>
                    <FacultyDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/manager"
                element={
                  <ProtectedRoute allowedRoles={['RESOURCE_MANAGER']}>
                    <ResourceManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Shared module pages inside dashboard — sidebar always visible */}
              <Route path="/rooms" element={<RoomManagementPage />} />
              <Route path="/equipment" element={<EquipmentManagementPage />} />
              <Route path="/events" element={<EventManagementPage />} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR', 'RESOURCE_MANAGER', 'FACULTY']}><ReportsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings/admin" element={<ProtectedRoute allowedRoles={['ADMINISTRATOR']}><AdminSettingsPage /></ProtectedRoute>} />
              <Route path="/status" element={<BookingStatusPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
