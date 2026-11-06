
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import PatientDashboard from "./dashboards/PatientDashboard";
import DoctorDashboard from "./dashboards/DoctorDashboard";
import MedicalDocumentUpload from "./dashboards/MedicalDocumentUpload";

import PatientPortalLayout from "./layouts/PatientPortalLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Patient Portal - Shared Sidebar */}
        <Route path="/patient" element={<PatientPortalLayout />}>

          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<PatientDashboard />}
          />

          <Route
            path="documents/upload"
            element={<MedicalDocumentUpload />}
          />

          <Route
            path="documents"
            element={<PatientDashboard />}
          />

          <Route
            path="assistant"
            element={<PatientDashboard />}
          />

          <Route
            path="profile"
            element={<PatientDashboard />}
          />

          <Route
            path="settings"
            element={<PatientDashboard />}
          />

        </Route>

        {/* Doctor Portal */}
        <Route
          path="/doctor/dashboard"
          element={<DoctorDashboard />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
