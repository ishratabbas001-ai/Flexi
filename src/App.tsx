import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from '@/components/ui/sonner';
import InstallPrompt from './components/pwa/InstallPrompt';
import OfflineIndicator from './components/pwa/OfflineIndicator';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import SchoolDashboard from './pages/school/SchoolDashboard';
import ParentDashboard from './pages/parent/ParentDashboard';

// Feature Pages
import BNPLApplication from './pages/bnpl/BNPLApplication';
import PaymentForm from './pages/payment/PaymentForm';
import Students from './pages/school/Students';
import StudentDetails from './pages/school/StudentDetails';
import EditStudent from './pages/school/EditStudent';
import AddStudent from './pages/school/AddStudent';
import Enrollment from './pages/school/Enrollment';
import BNPLPlans from './pages/school/BNPLPlans';
import Schools from './pages/admin/Schools';
import Applications from './pages/admin/Applications';
import ApplicationDetails from './pages/admin/ApplicationDetails';
import Settings from './pages/admin/Settings';
import AddSchool from './pages/admin/AddSchool';
import Reports from './pages/reports/Reports';
import Payments from './pages/parent/Payments';
import PaymentHistory from './pages/parent/PaymentHistory';
import SchoolSettings from './pages/school/Settings';
import ParentSettings from './pages/parent/Settings';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Landing Page
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="bnpl-theme">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/schools" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Schools />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/applications" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Applications />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/applications/:id" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <ApplicationDetails />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/add-school" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AddSchool />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/school" element={
              <ProtectedRoute requiredRole="school">
                <Layout>
                  <SchoolDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/parent" element={
              <ProtectedRoute requiredRole="parent">
                <Layout>
                  <ParentDashboard />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/bnpl/apply" element={
              <ProtectedRoute requiredRole="parent">
                <Layout>
                  <BNPLApplication />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/payment/:installmentId" element={
              <ProtectedRoute requiredRole="parent">
                <Layout>
                  <PaymentForm />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/parent/payments" element={
              <ProtectedRoute requiredRole="parent">
                <Layout>
                  <Payments />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/parent/history" element={
              <ProtectedRoute requiredRole="parent">
                <Layout>
                  <PaymentHistory />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/school/settings" element={
              <ProtectedRoute requiredRole="school">
                <Layout>
                  <SchoolSettings />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/parent/settings" element={
              <ProtectedRoute requiredRole="parent">
                <Layout>
                  <ParentSettings />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/students" element={
              <ProtectedRoute requiredRole="school">
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/school/add-student" element={
              <ProtectedRoute requiredRole="school">
                <Layout>
                  <AddStudent />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/school/enrollment" element={
              <ProtectedRoute requiredRole="school">
                <Layout>
                  <Enrollment />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/school/bnpl-plans" element={
              <ProtectedRoute requiredRole="school">
                <Layout>
                  <BNPLPlans />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute requiredRole={["admin", "school"]}>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Student Detail Routes */}
            <Route path="/students/:id/view" element={
              <ProtectedRoute requiredRole="school">
                <Layout>
                  <StudentDetails />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/students/:id/edit" element={
              <ProtectedRoute requiredRole="school">
                <Layout>
                  <EditStudent />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;