/**
 * Role-Based Access Control (RBAC) Utilities
 * Hỗ trợ kiểm tra quyền truy cập dựa trên role của user
 * Dựa trên LoginResponseDto từ backend
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  RISK_ANALYST: 'RISK_ANALYST',
};

/**
 * Kiểm tra user có role cụ thể không
 * @param {string|object} userRole - Role của user hiện tại (từ authData.role)
 * @param {string|string[]} allowedRoles - Role hoặc mảng roles được phép
 * @returns {boolean}
 */
export const hasRole = (userRole, allowedRoles) => {
  if (!userRole) return false;
  
  const normalizedUserRole = normalizeRole(userRole);
  
  if (Array.isArray(allowedRoles)) {
    return allowedRoles.some(role => normalizeRole(role) === normalizedUserRole);
  }
  
  return normalizeRole(allowedRoles) === normalizedUserRole;
};

/**
 * Kiểm tra user có phải ADMIN không
 * @param {string} userRole 
 * @returns {boolean}
 */
export const isAdmin = (userRole) => hasRole(userRole, ROLES.ADMIN);

/**
 * Kiểm tra user có phải STAFF không
 * @param {string} userRole 
 * @returns {boolean}
 */
export const isStaff = (userRole) => hasRole(userRole, ROLES.STAFF);

/**
 * Kiểm tra user có phải RISK_ANALYST không
 * @param {string} userRole 
 * @returns {boolean}
 */
export const isRiskAnalyst = (userRole) => hasRole(userRole, ROLES.RISK_ANALYST);

/**
 * Normalize role - hỗ trợ cả 'ADMIN' và 'ROLE_ADMIN'
 * Backend trả về enum Role, có thể là "ADMIN" hoặc "ROLE_ADMIN"
 * @param {string|object} role - Role từ backend (có thể là string hoặc enum object)
 * @returns {string} - Normalized role (ROLE_ADMIN, ROLE_STAFF, ROLE_RISK_ANALYST)
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  
  // Nếu role là object (enum), lấy name hoặc toString
  let roleStr;
  if (typeof role === 'object') {
    roleStr = role.name || role.toString();
  } else {
    roleStr = String(role);
  }
  
  // Nếu role không có prefix ROLE_, thêm vào
  if (!roleStr.startsWith('ROLE_')) {
    return `ROLE_${roleStr.toUpperCase()}`;
  }
  return roleStr.toUpperCase();
};

/**
 * Lấy route mặc định dựa trên role
 * @param {string} role - Role của user (từ authData.role)
 * @returns {string} - Route path
 */
export const getDefaultRouteByRole = (role) => {
  if (!role) return '/';
  
  const normalizedRole = normalizeRole(role);
  
  // So sánh với normalized role strings (ROLE_ADMIN, ROLE_STAFF, ROLE_RISK_ANALYST)
  switch (normalizedRole) {
    case 'ROLE_ADMIN':
      return '/admin/employees';
    case 'ROLE_STAFF':
      return '/staff/customers';
    case 'ROLE_RISK_ANALYST':
      return '/risk-analyst/dashboard';
    default:
      console.warn('Unknown role:', role, 'normalized to:', normalizedRole);
      return '/';
  }
};

/**
 * Kiểm tra role có hợp lệ không
 * @param {string} role 
 * @returns {boolean}
 */
export const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

