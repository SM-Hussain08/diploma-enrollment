import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts & Protected Routes
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";

// Pages
import LandingPage from "./pages/LandingPage"; // <--- Import here
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProgramsPage from "./pages/admin/ProgramsPage";
import OrgInfoPage from "./pages/admin/OrganizationInfoPage";
import UserInfoPage from "./pages/admin/UserInfoPage";
import GeneralInfoPage from "./pages/admin/GeneralInfoPage";
import PublicEnrollment from "./pages/public/PublicEnrollment";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT: Choice between Enroll or Admin */}
        <Route path="/" element={<LandingPage />} />

        {/* PUBLIC ENROLLMENT FLOW */}
        <Route path="/public/enroll" element={<PublicEnrollment />} />

        {/* ADMIN LOGIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN AREA */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="organization-info" element={<OrgInfoPage />} />
          <Route path="user-info" element={<UserInfoPage />} />
          <Route path="general-info" element={<GeneralInfoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}