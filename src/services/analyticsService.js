/**
 * Analytics Service - API calls cho analysticservice
 * Chỉ ROLE_RISK_ANALYST được phép truy cập
 */

// Base URL cho analysticservice (đã được proxy qua Vite)
const API_BASE_URL = '/api/analystics';

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
const getHeaders = (includeRole = true, includeUserId = false) => {
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
 * Helper gọi GET đơn giản
 */
const getJson = async (url) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(true, false),
    mode: 'cors',
    credentials: 'omit',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch analytics data' }));
    throw new Error(errorData.message || `Failed to fetch analytics data: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Lấy analytics theo predictionId
 * GET /api/analystics/prediction/{predictionId}
 */
export const getAnalysticByPredictionId = async (predictionId) => {
  return getJson(`${API_BASE_URL}/prediction/${predictionId}`);
};

/**
 * Lấy danh sách analytics
 * GET /api/analystics/predictions
 */
export const getAnalystics = async () => {
  return getJson(`${API_BASE_URL}/predictions`);
};

/**
 * Lấy danh sách analytics theo customerId
 * GET /api/analystics/customer/{customerId}
 */
export const getAnalysticsByCustomerId = async (customerId) => {
  return getJson(`${API_BASE_URL}/customer/${customerId}`);
};

/**
 * Lấy danh sách analytics theo employeeId
 * GET /api/analystics/employee/{employeeId}
 */
export const getAnalysticsByEmployeeId = async (employeeId) => {
  return getJson(`${API_BASE_URL}/employee/${employeeId}`);
};

/**
 * Lấy danh sách analytics theo customerId và employeeId
 * GET /api/analystics/customer/{customerId}/employee/{employeeId}
 */
export const getAnalysticsByCustomerAndEmployee = async (customerId, employeeId) => {
  return getJson(`${API_BASE_URL}/customer/${customerId}/employee/${employeeId}`);
};

/**
 * Lấy danh sách analytics theo khoảng ngày hoàn thành
 * GET /api/analystics/date-range/from={startDate}&to={endDate}
 * startDate, endDate: string 'YYYY-MM-DD'
 */
export const getAnalysticsByDateRange = async (startDate, endDate) => {
  return getJson(`${API_BASE_URL}/date-range/from=${startDate}&to=${endDate}`);
};

/**
 * Lấy danh sách analytics theo resultLabel (true/false)
 * GET /api/analystics/result-label/{resultLabel}
 */
export const getAnalysticsByResultLabel = async (resultLabel) => {
  return getJson(`${API_BASE_URL}/result-label/${resultLabel}`);
};

/**
 * Lấy danh sách analytics theo khoảng probability
 * GET /api/analystics/probability-range/from={minProbability}&to={maxProbability}
 */
export const getAnalysticsByProbabilityRange = async (minProbability, maxProbability) => {
  return getJson(`${API_BASE_URL}/probability-range/from=${minProbability}&to=${maxProbability}`);
};

/**
 * Lấy danh sách analytics theo predictionStatus (PENDING/COMPLETED/FAILED)
 * GET /api/analystics/prediction-status/{predictionStatus}
 */
export const getAnalysticsByPredictionStatus = async (predictionStatus) => {
  return getJson(`${API_BASE_URL}/prediction-status/${predictionStatus}`);
};

/**
 * Lấy thống kê tổng quan
 * GET /api/analystics/stat/overview
 * Trả về AnalysticStatDto
 */
export const getAnalysticStatOverview = async () => {
  return getJson(`${API_BASE_URL}/stat/overview`);
};

/**
 * Lấy thống kê theo khoảng ngày
 * GET /api/analystics/stat/date-range/from={startDate}&to={endDate}
 * startDate, endDate: string 'YYYY-MM-DD'
 */
export const getAnalysticStatByDateRange = async (startDate, endDate) => {
  return getJson(`${API_BASE_URL}/stat/date-range/from=${startDate}&to=${endDate}`);
};

/**
 * Lấy thống kê số lượng prediction (chấp nhận / từ chối) cho từng employee.
 * GET /api/analystics/employee-prediction-counts
 */
export const getEmployeePredictionCounts = async () => {
  return getJson(`${API_BASE_URL}/employee-prediction-counts`);
};