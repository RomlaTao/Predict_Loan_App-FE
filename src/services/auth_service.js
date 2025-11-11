const API_BASE_URL = 'http://localhost:8080/api/auth';

/**
 * Gọi API Signup
 * Dựa trên SignupRequestDto.java
 */
export const signup = async (email, password, passwordConfirm) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, passwordConfirm }),
    });

    if (!response.ok) {
        // Xử lý lỗi (ví dụ: email đã tồn tại)
        const errorData = await response.json(); // Hoặc .text() nếu backend trả về text
        throw new Error(errorData.message || 'Signup failed');
    }
    // Backend trả về text "Signup successful for user:..."
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