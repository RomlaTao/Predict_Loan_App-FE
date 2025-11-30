/**
 * Employee Service - API calls cho quản lý nhân viên (STAFF)
 * Chỉ ADMIN mới có quyền sử dụng các API này
 * Dựa trên UserProfileController từ backend
 */

// Sử dụng relative path để Vite proxy có thể forward request đến backend
// Nếu không dùng proxy, có thể đổi về: 'http://localhost:8080/api/users-profiles'
const API_BASE_URL = '/api/users-profiles';

/**
 * Lấy auth data từ localStorage
 */
const getAuthData = () => {
  const authData = localStorage.getItem('authData');
  if (authData) {
    return JSON.parse(authData);
  }
  return null;
};

/**
 * Tạo headers với Authorization token và custom headers
 * @param {boolean} includeRole - Có thêm X-User-Role header không (mặc định: true)
 * @param {boolean} includeUserId - Có thêm X-User-Id header không (mặc định: true)
 */
const getHeaders = (includeRole = true, includeUserId = true) => {
  const authData = getAuthData();
  if (!authData) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(authData.accessToken && { Authorization: `Bearer ${authData.accessToken}` }),
  };

  // Thêm X-User-Role header nếu cần (cho các API chỉ ADMIN)
  // Backend có thể yêu cầu format "ROLE_ADMIN" hoặc "ADMIN"
  // Gửi role như backend trả về (không normalize vì backend có thể expect exact format)
  if (includeRole && authData.role) {
    headers['X-User-Role'] = authData.role;
    console.debug('[getHeaders] X-User-Role:', authData.role);
  }

  // Thêm X-User-Id header nếu cần
  if (includeUserId && authData.userId) {
    headers['X-User-Id'] = authData.userId;
    console.debug('[getHeaders] X-User-Id:', authData.userId);
  }

  return headers;
};

/**
 * Get all employees (STAFF) - Chỉ ADMIN
 * GET /api/users-profiles
 * @returns {Promise<Array<UserProfileResponseDto>>} Danh sách nhân viên
 */
export const getAllEmployees = async () => {
  try {
    console.debug('[getAllEmployees] Fetching employees from:', API_BASE_URL);
    const headers = getHeaders(true, false); // Cần X-User-Role, không cần X-User-Id
    console.debug('[getAllEmployees] Request headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined });
    
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: headers,
      mode: 'cors', // Đảm bảo CORS được xử lý đúng
      credentials: 'omit', // Không gửi cookies (vì đã có token trong header)
    });

    console.debug('[getAllEmployees] Response status:', response.status, response.statusText);
    console.debug('[getAllEmployees] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch employees' }));
      console.error('[getAllEmployees] Error response:', errorData);
      throw new Error(errorData.message || `Failed to fetch employees: ${response.status} ${response.statusText}`);
    }

    // Kiểm tra Content-Type header để đảm bảo response là JSON
    const contentType = response.headers.get('content-type');
    console.debug('[getAllEmployees] Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.warn('[getAllEmployees] Response is not JSON:', text);
      // Nếu response rỗng, trả về array rỗng
      if (!text || text.trim() === '') {
        console.warn('[getAllEmployees] Empty response, returning empty array');
        return [];
      }
      throw new Error('Response is not valid JSON');
    }

    // Parse JSON với error handling
    const data = await response.json().catch((error) => {
      console.error('[getAllEmployees] Error parsing JSON response:', error);
      throw new Error('Failed to parse response as JSON');
    });

    console.debug('[getAllEmployees] Parsed data:', data);
    console.debug('[getAllEmployees] Data type:', typeof data, 'Is array:', Array.isArray(data));

    // Đảm bảo trả về array (ngay cả khi response là null hoặc undefined)
    const result = Array.isArray(data) ? data : [];
    console.debug('[getAllEmployees] Returning result:', result.length, 'items');
    return result;
  } catch (error) {
    console.error('[getAllEmployees] Error:', error);
    console.error('[getAllEmployees] Error type:', error.constructor.name);
    console.error('[getAllEmployees] Error message:', error.message);
    console.error('[getAllEmployees] Error stack:', error.stack);
    
    // Nếu là lỗi từ getHeaders (Not authenticated), throw lại
    if (error.message === 'Not authenticated') {
      throw error;
    }
    
    // Nếu là lỗi network hoặc CORS
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend server có đang chạy không (http://localhost:8080)\n2. CORS configuration trên backend\n3. Network connection');
      }
      if (error.message.includes('CORS')) {
        throw new Error('CORS error: Backend không cho phép request từ frontend. Vui lòng kiểm tra CORS configuration trên backend.');
      }
    }
    
    // Nếu là lỗi từ response
    if (error.message && error.message.includes('Failed to fetch')) {
      throw new Error('Không thể tải danh sách nhân viên. Vui lòng kiểm tra kết nối mạng và đảm bảo backend server đang chạy.');
    }
    
    // Throw lại các lỗi khác
    throw error;
  }
};

/**
 * Get current user profile
 * GET /api/users-profiles/me
 * @returns {Promise<UserProfileResponseDto>} Current user profile
 */
export const getCurrentProfile = async () => {
  try {
    console.debug('[getCurrentProfile] Fetching current user profile from:', `${API_BASE_URL}/me`);
    const headers = getHeaders(false, true); // Cần X-User-Id, không cần X-User-Role
    console.debug('[getCurrentProfile] Request headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined });
    
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      credentials: 'omit',
    });

    console.debug('[getCurrentProfile] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
      console.error('[getCurrentProfile] Error response:', errorData);
      throw new Error(errorData.message || `Failed to fetch profile: ${response.status} ${response.statusText}`);
    }

    // Kiểm tra Content-Type header để đảm bảo response là JSON
    const contentType = response.headers.get('content-type');
    console.debug('[getCurrentProfile] Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.warn('[getCurrentProfile] Response is not JSON:', text);
      throw new Error('Response is not valid JSON');
    }

    // Parse JSON với error handling
    const data = await response.json().catch((error) => {
      console.error('[getCurrentProfile] Error parsing JSON response:', error);
      throw new Error('Failed to parse response as JSON');
    });

    console.debug('[getCurrentProfile] Parsed data:', data);
    return data;
  } catch (error) {
    console.error('[getCurrentProfile] Error:', error);
    // Nếu là lỗi từ getHeaders (Not authenticated), throw lại
    if (error.message === 'Not authenticated') {
      throw error;
    }
    // Nếu là lỗi network hoặc CORS
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend server đang chạy.');
      }
    }
    // Throw lại các lỗi khác
    throw error;
  }
};

/**
 * Get employee by ID - Chỉ ADMIN
 * GET /api/users-profiles/{userId}
 * @param {string|UUID} userId - User ID
 * @returns {Promise<UserProfileResponseDto>} Employee data
 */
export const getEmployeeById = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/${userId}`, {
    method: 'GET',
    headers: getHeaders(true, false), // Cần X-User-Role, không cần X-User-Id
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch employee' }));
    throw new Error(errorData.message || 'Failed to fetch employee');
  }

  return response.json();
};

/**
 * Add a new employee (STAFF) - Chỉ ADMIN
 * POST /api/users-profiles
 * @param {UserProfileRequestDto} employee - Employee data
 * @returns {Promise<UserProfileResponseDto>} Created employee
 */
export const addEmployee = async (employee) => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: getHeaders(true, false), // Cần X-User-Role, không cần X-User-Id
    body: JSON.stringify(employee),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create employee' }));
    throw new Error(errorData.message || 'Failed to create employee');
  }

  return response.json();
};

/**
 * Update an existing employee
 * PUT /api/users-profiles/{userId}
 * @param {string|UUID} userId - User ID
 * @param {UserProfileRequestDto} employee - Updated employee data
 * @returns {Promise<UserProfileResponseDto>} Updated employee
 */
export const updateEmployee = async (userId, employee) => {
  const response = await fetch(`${API_BASE_URL}/${userId}`, {
    method: 'PUT',
    headers: getHeaders(true, true), // Cần cả X-User-Role và X-User-Id (backend check role: ADMIN hoặc STAFF)
    body: JSON.stringify(employee),
    mode: 'cors',
    credentials: 'omit',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update employee' }));
    throw new Error(errorData.message || 'Failed to update employee');
  }

  return response.json();
};

// Note: Backend không có DELETE endpoint cho user profiles
// Nếu cần xóa, có thể thêm sau khi backend implement

