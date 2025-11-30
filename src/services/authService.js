// Sử dụng relative path để Vite proxy có thể forward request đến backend
// Nếu không dùng proxy, có thể đổi về: 'http://localhost:8080/api/auth'
const API_BASE_URL = '/api/auth';

/**
 * ADMIN tạo user mới (có thể chỉ định role)
 * Chỉ ADMIN mới có quyền gọi API này
 * Endpoint yêu cầu JWT token trong Authorization header
 * @param {string} email - Email của user
 * @param {string} password - Password
 * @param {string} passwordConfirm - Xác nhận password
 * @param {string} role - Role (ROLE_STAFF, ROLE_RISK_ANALYST)
 * @returns {Promise<string>} Success message
 */
export const adminSignup = async (email, password, passwordConfirm, role) => {
    // Lấy access token từ localStorage
    const authData = localStorage.getItem('authData');
    if (!authData) {
        throw new Error('Not authenticated. Please login first.');
    }
    
    let parsed;
    try {
        parsed = JSON.parse(authData);
    } catch (error) {
        throw new Error('Invalid authentication data. Please login again.');
    }

    const token = parsed?.accessToken;
    if (!token) {
        throw new Error('Access token not found. Please login again.');
    }

    // Gửi request với JWT token trong Authorization header
    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // JWT token required
        },
        body: JSON.stringify({ email, password, passwordConfirm, role }),
    });

    if (!response.ok) {
        // Xử lý lỗi từ backend
        let errorMessage = 'Failed to create user';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
            // Nếu response không phải JSON, thử đọc text
            try {
                const errorText = await response.text();
                if (errorText) errorMessage = errorText;
            } catch (textError) {
                // Ignore
            }
        }

        // Xử lý các lỗi phổ biến
        if (response.status === 401) {
            throw new Error('Unauthorized. Your session may have expired. Please login again.');
        } else if (response.status === 403) {
            throw new Error('Forbidden. Only ADMIN can create users.');
        } else if (response.status === 400) {
            throw new Error(errorMessage || 'Invalid request data.');
        }

        throw new Error(errorMessage);
    }

    return response.text();
};

/**
 * Gọi API Login
 * Dựa trên LoginRequestDto.java
 */
export const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        // Xử lý lỗi (ví dụ: sai mật khẩu)
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }
    // Backend trả về LoginResponseDto
    return response.json(); 
};

/**
 * Gọi API Logout
 * Cần gửi kèm Access Token
 */
export const logout = async (accessToken) => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Logout failed');
    }
    // Backend trả về text "Logged out successfully"
    return response.text();
};