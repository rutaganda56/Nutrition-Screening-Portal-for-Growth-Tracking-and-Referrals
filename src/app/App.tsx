import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/app/components/ui/sonner";
import { ErrorBoundary } from "@/app/components/ErrorBoundary";

// Public Pages
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";

// Auth Pages
import { TwoFactorSetup } from "@/pages/auth/TwoFactorSetup";
import { TwoFactorVerify } from "@/pages/auth/TwoFactorVerify";

// Layout & Dashboards
import { DashboardLayout } from "@/components/DashboardLayout";
import { DoctorDashboard } from "@/pages/dashboards/DoctorDashboard";
import { CHWDashboard } from "@/pages/dashboards/CHWDashboard";
import { AdminDashboard } from "@/pages/dashboards/AdminDashboard";

// Doctor Pages
import { Reports } from "@/pages/doctor/Reports";
import { PatientClinicalSummary } from "@/pages/doctor/PatientClinicalSummary";
import { ServiceRequestQueue } from "@/pages/doctor/ServiceRequestQueue";
import { GrowthTracking } from "@/pages/doctor/GrowthTracking";

// Community Health Worker Pages
import { PatientRegistration } from "@/pages/chw/PatientRegistration";
import { NewScreening } from "@/pages/chw/NewScreening";
import { PatientHistory } from "@/pages/chw/PatientHistory";

// Admin Pages
import { UserManagement } from "@/pages/admin/UserManagement";
import { FacilityDirectory } from "@/pages/admin/FacilityDirectory";
import { ReportsAnalytics } from "@/pages/admin/ReportsAnalytics";
import { Settings as AdminSettings } from "@/pages/admin/Settings";

// Shared Pages
import { Profile } from "@/pages/shared/Profile";
import { NotificationsPage } from "@/pages/shared/NotificationsPage";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Dashboard Route based on role
const RoleBasedDashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "doctor":
      return <DoctorDashboard />;
    case "communityhealthworker":
      return <CHWDashboard />;
    case "administrator":
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* 2FA Routes */}
        <Route path="/2fa-setup" element={<TwoFactorSetup />} />
        <Route path="/2fa-verify" element={<TwoFactorVerify />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleBasedDashboard />} />
          {/* Doctor Routes - Clinical Assessment & Service Request Workflow Only */}
          <Route
            path="service-request-queue"
            element={<ServiceRequestQueue />}
          />
          <Route
            path="patient-clinical-summary"
            element={<PatientClinicalSummary />}
          />
          <Route path="growth-tracking" element={<GrowthTracking />} />
          <Route path="reports" element={<Reports />} />

          {/* CHW Routes */}
          <Route
            path="patient-registration"
            element={<PatientRegistration />}
          />
          <Route path="new-screening" element={<NewScreening />} />
          <Route path="patient-history" element={<PatientHistory />} />

          {/* Admin Routes */}
          <Route path="user-management" element={<UserManagement />} />
          <Route path="facilities" element={<FacilityDirectory />} />
          <Route path="analytics" element={<ReportsAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />

          {/* Shared Routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </ErrorBoundary>
  );
}
