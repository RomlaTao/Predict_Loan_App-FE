import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ROLES } from './utils/rbac';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import EmployeeListPage from './pages/admin/EmployeeListPage';
import EmployeeEditPage from './pages/admin/EmployeeEditPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import CustomerListPage from './pages/staff/CustomerListPage';
import CustomerEditPage from './pages/staff/CustomerEditPage';
import CustomerDetailPage from './pages/shared/CustomerDetailPage';
import PredictionPage from './pages/staff/PredictionPage';
import PredictionResultPage from './pages/shared/PredictionResultPage';
import ProfilePage from './pages/shared/ProfilePage';
import RiskDashboardPage from './pages/risk-analyst/RiskDashboardPage';
import Header from './components/Header';
import RoleBasedRoute from './components/RoleBasedRoute';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Header /> {/* Header luôn hiển thị */}
      <main>
        <Routes>
          {/* Trang chủ: Redirect tự động dựa trên role */}
          <Route
            path="/"
            element={
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF, ROLES.RISK_ANALYST]}>
                <HomePage />
              </RoleBasedRoute>
            }
          />

          {/* Auth routes - Chỉ truy cập khi chưa đăng nhập */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />

          {/* Admin routes - Chỉ ADMIN mới truy cập được */}
          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute allowedRoles={ROLES.ADMIN}>
                <UserManagementPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/employees"
            element={
              <RoleBasedRoute allowedRoles={ROLES.ADMIN}>
                <EmployeeListPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/admin/employees/:userId"
            element={
              <RoleBasedRoute allowedRoles={ROLES.ADMIN}>
                <EmployeeEditPage />
              </RoleBasedRoute>
            }
          />

          {/* Staff routes - Chỉ STAFF mới truy cập được */}
          <Route
            path="/staff/customers"
            element={
              <RoleBasedRoute allowedRoles={[ROLES.STAFF, ROLES.RISK_ANALYST]}>
                <CustomerListPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/staff/customers/new"
            element={
              <RoleBasedRoute allowedRoles={ROLES.STAFF}>
                <CustomerEditPage />
              </RoleBasedRoute>
            }
          />
          {/* Shared routes - STAFF và RISK_ANALYST có thể truy cập */}
          <Route
            path="/customers/:customerId"
            element={
              <RoleBasedRoute allowedRoles={[ROLES.STAFF, ROLES.RISK_ANALYST]}>
                <CustomerDetailPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/predictions/:predictionId"
            element={
              <RoleBasedRoute allowedRoles={[ROLES.STAFF, ROLES.RISK_ANALYST]}>
                <PredictionResultPage />
              </RoleBasedRoute>
            }
          />
          
          {/* Staff-only routes */}
          <Route
            path="/staff/customers/:customerId/edit"
            element={
              <RoleBasedRoute allowedRoles={ROLES.STAFF}>
                <CustomerEditPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/staff/customers/:customerId/prediction"
            element={
              <RoleBasedRoute allowedRoles={ROLES.STAFF}>
                <PredictionPage />
              </RoleBasedRoute>
            }
          />
          
          {/* Profile route cho tất cả users */}
          <Route
            path="/profile"
            element={
              <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF, ROLES.RISK_ANALYST]}>
                <ProfilePage />
              </RoleBasedRoute>
            }
          />

          {/* Risk Analyst routes - Chỉ RISK_ANALYST mới truy cập được */}
          <Route
            path="/risk-analyst/dashboard"
            element={
              <RoleBasedRoute allowedRoles={ROLES.RISK_ANALYST}>
                <RiskDashboardPage />
              </RoleBasedRoute>
            }
          />

          {/* 404 - Not Found */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;