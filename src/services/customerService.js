/**
 * Customer Service - API calls cho quản lý khách hàng
 * STAFF: chỉ quản lý khách hàng của chính họ (staffId)
 * RISK_ANALYST: có thể xem tất cả khách hàng
 */

// Sử dụng relative path để Vite proxy có thể forward request đến backend
// Nếu không dùng proxy, có thể đổi về: 'http://localhost:8080/api/customers'
const API_BASE_URL = '/api/customers';

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
 * @param {boolean} includeRole - Có thêm X-User-Role header không
 * @param {boolean} includeUserId - Có thêm X-User-Id header không
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

  // Thêm X-User-Role header nếu cần
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
 * Create a new customer - Chỉ STAFF
 * POST /api/customers
 * @param {CustomerProfileRequestDto} customer - Customer data
 * @returns {Promise<CustomerProfileResponseDto>} Created customer
 */
export const createCustomer = async (customer) => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: getHeaders(true, false), // Cần X-User-Role, không cần X-User-Id (staffId sẽ lấy từ token)
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create customer' }));
    throw new Error(errorData.message || 'Failed to create customer');
  }

  return response.json();
};

/**
 * Create multiple customers (bulk) - Chỉ STAFF
 * POST /api/customers/bulk
 * @param {CustomerProfileRequestDto[]} customers - Array of customer data
 * @returns {Promise<CustomerProfileResponseDto[]>} Created customers
 */
export const createCustomers = async (customers) => {
  const response = await fetch(`${API_BASE_URL}/bulk`, {
    method: 'POST',
    headers: getHeaders(true, false),
    body: JSON.stringify(customers),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to create customers' }));
    throw new Error(errorData.message || 'Failed to create customers');
  }

  return response.json();
};

/**
 * Get all customers - RISK_ANALYST
 * GET /api/customers
 * @returns {Promise<CustomerProfileResponseDto[]>} List of customers
 */
export const getAllCustomers = async () => {
  try {
    console.debug('[getAllCustomers] Fetching customers from:', API_BASE_URL);
    const headers = getHeaders(true, false); // Cần X-User-Role
    console.debug('[getAllCustomers] Request headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined });
    
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'GET',
      headers: headers,
      mode: 'cors', // Đảm bảo CORS được xử lý đúng
      credentials: 'omit', // Không gửi cookies (vì đã có token trong header)
    });

    console.debug('[getAllCustomers] Response status:', response.status, response.statusText);
    console.debug('[getAllCustomers] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch customers' }));
      console.error('[getAllCustomers] Error response:', errorData);
      throw new Error(errorData.message || `Failed to fetch customers: ${response.status} ${response.statusText}`);
    }

    // Kiểm tra Content-Type header để đảm bảo response là JSON
    const contentType = response.headers.get('content-type');
    console.debug('[getAllCustomers] Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.warn('[getAllCustomers] Response is not JSON:', text);
      // Nếu response rỗng, trả về array rỗng
      if (!text || text.trim() === '') {
        console.warn('[getAllCustomers] Empty response, returning empty array');
        return [];
      }
      throw new Error('Response is not valid JSON');
    }

    // Parse JSON với error handling
    const data = await response.json().catch((error) => {
      console.error('[getAllCustomers] Error parsing JSON response:', error);
      throw new Error('Failed to parse response as JSON');
    });

    console.debug('[getAllCustomers] Parsed data:', data);
    console.debug('[getAllCustomers] Data type:', typeof data, 'Is array:', Array.isArray(data));

    // Đảm bảo trả về array (ngay cả khi response là null hoặc undefined)
    const result = Array.isArray(data) ? data : [];
    console.debug('[getAllCustomers] Returning result:', result.length, 'items');
    return result;
  } catch (error) {
    console.error('[getAllCustomers] Error:', error);
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
      throw new Error('Không thể tải danh sách khách hàng. Vui lòng kiểm tra kết nối mạng và đảm bảo backend server đang chạy.');
    }
    // Throw lại các lỗi khác
    throw error;
  }
};

/**
 * Get customer by ID - STAFF và RISK_ANALYST
 * GET /api/customers/{customerId}
 * @param {string|UUID} customerId - Customer ID
 * @returns {Promise<CustomerProfileResponseDto>} Customer data
 */
export const getCustomerById = async (customerId) => {
  const response = await fetch(`${API_BASE_URL}/${customerId}`, {
    method: 'GET',
    headers: getHeaders(true, true), // Cần cả X-User-Role và X-User-Id
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch customer' }));
    throw new Error(errorData.message || 'Failed to fetch customer');
  }

  return response.json();
};

/**
 * Update customer - Chỉ STAFF
 * PUT /api/customers/{customerId}
 * @param {string|UUID} customerId - Customer ID
 * @param {CustomerProfileRequestDto} customer - Updated customer data
 * @returns {Promise<CustomerProfileResponseDto>} Updated customer
 */
export const updateCustomer = async (customerId, customer) => {
  const response = await fetch(`${API_BASE_URL}/${customerId}`, {
    method: 'PUT',
    headers: getHeaders(true, true), // Cần cả X-User-Role và X-User-Id
    body: JSON.stringify(customer),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update customer' }));
    throw new Error(errorData.message || 'Failed to update customer');
  }

  return response.json();
};

/**
 * Get approved customers - Chỉ RISK_ANALYST
 * GET /api/customers/approved
 * @returns {Promise<CustomerProfileResponseDto[]>} List of approved customers
 */
export const getApprovedCustomers = async () => {
  const response = await fetch(`${API_BASE_URL}/approved`, {
    method: 'GET',
    headers: getHeaders(true, false),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch approved customers' }));
    throw new Error(errorData.message || 'Failed to fetch approved customers');
  }

  return response.json();
};

/**
 * Get rejected customers - Chỉ RISK_ANALYST
 * GET /api/customers/rejected
 * @returns {Promise<CustomerProfileResponseDto[]>} List of rejected customers
 */
export const getRejectedCustomers = async () => {
  const response = await fetch(`${API_BASE_URL}/rejected`, {
    method: 'GET',
    headers: getHeaders(true, false),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch rejected customers' }));
    throw new Error(errorData.message || 'Failed to fetch rejected customers');
  }

  return response.json();
};

/**
 * Get pending customers - Chỉ RISK_ANALYST
 * GET /api/customers/pending
 * @returns {Promise<CustomerProfileResponseDto[]>} List of pending customers
 */
export const getPendingCustomers = async () => {
  const response = await fetch(`${API_BASE_URL}/pending`, {
    method: 'GET',
    headers: getHeaders(true, false),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch pending customers' }));
    throw new Error(errorData.message || 'Failed to fetch pending customers');
  }

  return response.json();
};

/**
 * Get customers by staff id - STAFF và RISK_ANALYST
 * GET /api/customers/staff/{staffId}
 * @param {string|UUID} staffId - Staff ID
 * @param {string|UUID} currentStaffId - Current staff ID
 * @returns {Promise<CustomerProfileResponseDto[]>} List of customers
 */
export const getCustomersByStaffId = async (staffId) => {
  const response = await fetch(`${API_BASE_URL}/staff/${staffId}`, {
    method: 'GET',
    headers: getHeaders(true, true), // Cần cả X-User-Role và X-User-Id
    mode: 'cors', // Đảm bảo CORS được xử lý đúng
    credentials: 'omit', // Không gửi cookies (vì đã có token trong header)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch customers by staff id' }));
    throw new Error(errorData.message || 'Failed to fetch customers by staff id');
  }

  return response.json();
};
