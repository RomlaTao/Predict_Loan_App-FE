import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component bảo vệ route dựa trên role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con cần render
 * @param {string|string[]} props.allowedRoles - Role hoặc mảng roles được phép truy cập
 * @param {string} props.fallbackPath - Route redirect nếu không có quyền (mặc định: '/')
 */
function RoleBasedRoute({ children, allowedRoles, fallbackPath = '/' }) {
  const { isAuthenticated, hasRole, getDefaultRoute } = useAuth();

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role có được phép truy cập không
  if (!hasRole(allowedRoles)) {
    // Nếu không có quyền, redirect về route mặc định của role đó
    const defaultRoute = getDefaultRoute();
    return <Navigate to={defaultRoute || fallbackPath} replace />;
  }

  // Có quyền, render children
  return children;
}

export default RoleBasedRoute;

