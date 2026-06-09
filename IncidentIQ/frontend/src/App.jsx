import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import DeveloperDashboard from './pages/DeveloperDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CreateIncident from './pages/CreateIncident';
import RCAReport from './pages/RCAReport';
import RCAHistory from './pages/RCAHistory';
import ManagerReportCenter from './pages/ManagerReportCenter';
import ManagerAnalytics from './pages/ManagerAnalytics';
import PlaceholderPage from './pages/PlaceholderPage';
import Layout from './components/layout/Layout';
import GlobalChatbot from './components/GlobalChatbot';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, sessionRole, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(sessionRole)) {
    if (!sessionRole) return <Navigate to="/select-role" />;
    if (sessionRole === 'Developer') return <Navigate to="/dev-dashboard" />;
    if (sessionRole === 'IT Manager') return <Navigate to="/manager-dashboard" />;
  }
  
  return children;
};

function App() {
  const { user, sessionRole } = useAuth();

  return (
    <Router>
      <Toaster position="top-right" />
      <GlobalChatbot />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* On login, always redirect to /select-role first if sessionRole is not set */}
        <Route path="/login" element={user ? <Navigate to={sessionRole ? (sessionRole === 'Developer' ? "/dev-dashboard" : "/manager-dashboard") : "/select-role"} /> : <LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/select-role" element={<ProtectedRoute><RoleSelectionPage /></ProtectedRoute>} />

        <Route element={<Layout />}>
          {/* Developer Routes */}
          <Route path="/dev-dashboard" element={<ProtectedRoute allowedRoles={['Developer']}><DeveloperDashboard /></ProtectedRoute>} />
          <Route path="/incidents/new" element={<ProtectedRoute allowedRoles={['Developer']}><CreateIncident /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute allowedRoles={['Developer']}><RCAHistory /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute allowedRoles={['Developer']}><PlaceholderPage title="Incident History" description="View past incidents and their resolutions." /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute allowedRoles={['Developer']}><PlaceholderPage title="Developer Analytics" description="Personal performance and incident statistics." /></ProtectedRoute>} />

          {/* Shared Routes */}
          <Route path="/reports/:id" element={<ProtectedRoute allowedRoles={['Developer', 'IT Manager']}><RCAReport /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><PlaceholderPage title="Notifications" description="Manage your alerts and system messages." /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><PlaceholderPage title="Account Settings" description="Update your profile, preferences, and security settings." /></ProtectedRoute>} />

          {/* Manager Routes */}
          <Route path="/manager-dashboard" element={<ProtectedRoute allowedRoles={['IT Manager']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager-reports" element={<ProtectedRoute allowedRoles={['IT Manager']}><ManagerReportCenter /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute allowedRoles={['IT Manager']}><PlaceholderPage title="Team Management" description="Manage developers, assign roles, and view team capacity." /></ProtectedRoute>} />
          <Route path="/manager-analytics" element={<ProtectedRoute allowedRoles={['IT Manager']}><ManagerAnalytics /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
