/**
 * Prediction Service - API calls cho dự đoán rủi ro
 * STAFF: tạo và xem predictions của mình
 * RISK_ANALYST: xem tất cả predictions
 */

const API_BASE_URL = '/api/predictions';

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

  if (includeRole && authData.role) {
    headers['X-User-Role'] = authData.role;
  }

  if (includeUserId && authData.userId) {
    headers['X-User-Id'] = authData.userId;
  }

  return headers;
};

/**
 * Create a new prediction - Chỉ STAFF
 * POST /api/predictions
 * @param {UUID} customerId - Customer ID
 * @returns {Promise<PredictionResponseDto>} Created prediction
 */
export const createPrediction = async (customerId) => {
  try {
    console.debug('[createPrediction] Creating prediction for customerId:', customerId);
    const headers = getHeaders(true, true); // Cần cả X-User-Role và X-User-Id
    console.debug('[createPrediction] Request headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined });
    
    // employeeId sẽ được lấy từ X-User-Id header
    const response = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ customerId }),
      mode: 'cors', // Đảm bảo CORS được xử lý đúng
      credentials: 'omit', // Không gửi cookies (vì đã có token trong header)
    });

    console.debug('[createPrediction] Response status:', response.status, response.statusText);
    console.debug('[createPrediction] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to create prediction' }));
      console.error('[createPrediction] Error response:', errorData);
      throw new Error(errorData.message || `Failed to create prediction: ${response.status} ${response.statusText}`);
    }

    // Kiểm tra Content-Type header để đảm bảo response là JSON
    const contentType = response.headers.get('content-type');
    console.debug('[createPrediction] Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.warn('[createPrediction] Response is not JSON:', text);
      throw new Error('Response is not valid JSON');
    }

    // Parse JSON với error handling
    const data = await response.json().catch((error) => {
      console.error('[createPrediction] Error parsing JSON response:', error);
      throw new Error('Failed to parse response as JSON');
    });

    console.debug('[createPrediction] Parsed data:', data);
    
    // Validate response có predictionId
    if (!data || !data.predictionId) {
      console.error('[createPrediction] Response missing predictionId:', data);
      throw new Error('Response from server is missing predictionId');
    }

    console.debug('[createPrediction] Returning prediction with ID:', data.predictionId);
    return data;
  } catch (error) {
    console.error('[createPrediction] Error:', error);
    // Nếu là lỗi từ getHeaders (Not authenticated), throw lại
    if (error.message === 'Not authenticated') {
      throw error;
    }
    // Nếu là lỗi network hoặc CORS
    if (error instanceof TypeError) {
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend server đang chạy.');
      }
      if (error.message.includes('CORS')) {
        throw new Error('CORS error: Backend không cho phép request từ frontend. Vui lòng kiểm tra CORS configuration trên backend.');
      }
    }
    // Throw lại các lỗi khác
    throw error;
  }
};

/**
 * Get prediction by ID - STAFF và RISK_ANALYST
 * GET /api/predictions/{predictionId}
 * @param {string|UUID} predictionId - Prediction ID
 * @returns {Promise<PredictionResponseDto>} Prediction data
 */
export const getPredictionById = async (predictionId) => {
  try {
    console.debug('[getPredictionById] Fetching prediction:', predictionId);
    const headers = getHeaders(true, true); // Cần cả X-User-Role và X-User-Id
    console.debug('[getPredictionById] Request headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : undefined });
    
    const response = await fetch(`${API_BASE_URL}/${predictionId}`, {
      method: 'GET',
      headers: headers,
      mode: 'cors', // Đảm bảo CORS được xử lý đúng
      credentials: 'omit', // Không gửi cookies (vì đã có token trong header)
    });

    console.debug('[getPredictionById] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch prediction' }));
      console.error('[getPredictionById] Error response:', errorData);
      throw new Error(errorData.message || `Failed to fetch prediction: ${response.status} ${response.statusText}`);
    }

    // Kiểm tra Content-Type header để đảm bảo response là JSON
    const contentType = response.headers.get('content-type');
    console.debug('[getPredictionById] Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.warn('[getPredictionById] Response is not JSON:', text);
      throw new Error('Response is not valid JSON');
    }

    // Parse JSON với error handling
    const data = await response.json().catch((error) => {
      console.error('[getPredictionById] Error parsing JSON response:', error);
      throw new Error('Failed to parse response as JSON');
    });

    console.debug('[getPredictionById] Parsed data:', data);
    return data;
  } catch (error) {
    console.error('[getPredictionById] Error:', error);
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
 * Get predictions by customer ID - STAFF và RISK_ANALYST
 * GET /api/predictions/customer/{customerId}
 * @param {string|UUID} customerId - Customer ID
 * @returns {Promise<PredictionResponseDto[]>} List of predictions
 */
export const getPredictionsByCustomerId = async (customerId) => {
  const response = await fetch(`${API_BASE_URL}/customer/${customerId}`, {
    method: 'GET',
    headers: getHeaders(true, false), // Chỉ cần X-User-Role
    mode: 'cors', // Đảm bảo CORS được xử lý đúng
    credentials: 'omit', // Không gửi cookies (vì đã có token trong header)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch predictions' }));
    throw new Error(errorData.message || 'Failed to fetch predictions');
  }

  return response.json();
};

/**
 * Get predictions by employee ID - STAFF và RISK_ANALYST
 * GET /api/predictions/employee/{employeeId}
 * @param {string|UUID} employeeId - Employee ID
 * @returns {Promise<PredictionResponseDto[]>} List of predictions
 */
export const getPredictionsByEmployeeId = async (employeeId) => {
  const response = await fetch(`${API_BASE_URL}/employee/${employeeId}`, {
    method: 'GET',
    headers: getHeaders(true, false), // Chỉ cần X-User-Role
    mode: 'cors', // Đảm bảo CORS được xử lý đúng
    credentials: 'omit', // Không gửi cookies (vì đã có token trong header)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch predictions' }));
    throw new Error(errorData.message || 'Failed to fetch predictions');
  }

  return response.json();
};

/**
 * Get current employee's predictions - Chỉ STAFF
 * GET /api/predictions/employee/me
 * @returns {Promise<PredictionResponseDto[]>} List of predictions
 */
export const getCurrentEmployeePredictions = async () => {
  const response = await fetch(`${API_BASE_URL}/employee/me`, {
    method: 'GET',
    headers: getHeaders(true, true), // Cần cả X-User-Role và X-User-Id
    mode: 'cors', // Đảm bảo CORS được xử lý đúng
    credentials: 'omit', // Không gửi cookies (vì đã có token trong header)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch predictions' }));
    throw new Error(errorData.message || 'Failed to fetch predictions');
  }

  return response.json();
};

/**
 * Get all predictions - STAFF và RISK_ANALYST
 * GET /api/predictions
 * @returns {Promise<PredictionResponseDto[]>} List of all predictions
 */
export const getAllPredictions = async () => {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'GET',
    headers: getHeaders(true, false), // Chỉ cần X-User-Role
    mode: 'cors', // Đảm bảo CORS được xử lý đúng
    credentials: 'omit', // Không gửi cookies (vì đã có token trong header)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch predictions' }));
    throw new Error(errorData.message || 'Failed to fetch predictions');
  }

  return response.json();
};

