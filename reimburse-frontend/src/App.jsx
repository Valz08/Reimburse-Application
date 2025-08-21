import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";

// Halaman Login
import LoginUser from "./pages/LoginUser";
import LoginAdmin from "./pages/LoginAdmin";

// Halaman User
import DashboardUser from "./pages/DashboardUser";
import AjukanReimburse from "./pages/AjukanReimburse";
import Riwayat from "./pages/Riwayat";

// Halaman Admin
import DashboardAdmin from "./pages/DashboardAdmin";
import RiwayatAdmin from "./pages/RiwayatAdmin";

// Layout
import DashboardAdminLayout from "./layouts/DashboardAdminLayout";
import DashboardUserLayout from "./layouts/DashboardUserLayout";

// Proteksi
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect default */}
        <Route path="/" element={<Navigate to="/RoleSelection" replace />} />

        <Route path="/RoleSelection" element={<RoleSelection />} />

        {/* Login */}
        <Route path="/login-user" element={<LoginUser />} />
        <Route path="/login-admin" element={<LoginAdmin />} />

        {/* Halaman User (Proteksi Token) */}
        <Route
          path="/user"
          element={
            <PrivateRoute redirectTo="/login-user">
              <DashboardUserLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<DashboardUser />} />
          <Route path="ajukan" element={<AjukanReimburse />} />
          <Route path="riwayat" element={<Riwayat />} />
        </Route>

        {/* Halaman Admin (Proteksi Token) */}
        <Route
          path="/admin"
          element={
            <PrivateRoute redirectTo="/login-admin">
              <DashboardAdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="riwayat" element={<RiwayatAdmin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
