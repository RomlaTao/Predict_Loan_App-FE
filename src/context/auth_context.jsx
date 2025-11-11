import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../services/authService';

// 1. Tạo Context
const AuthContext = createContext(null);

// 2. Tạo Provider (Component "cha" bọc ngoài)
export const AuthProvider = ({ children }) => {
    const [authData, setAuthData] = useState(null); // { userId, email, role, accessToken, refreshToken }
    const [loading, setLoading] = useState(true); // Trạng thái loading để kiểm tra localStorage

    // 3. Khi app mới tải, kiểm tra xem có thông tin đăng nhập trong localStorage không
    useEffect(() => {
        try {
            const storedData = localStorage.getItem('authData');
            if (storedData) {
                setAuthData(JSON.parse(storedData));
            }
        } catch (error) {
            console.error("Failed to parse auth data from localStorage", error);
            localStorage.removeItem('authData'); // Xóa dữ liệu hỏng
        } finally {
            setLoading(false);
        }
    }, []);

    // 4. Hàm Login
    const login = async (email, password) => {
        // Gọi API login từ service
        const data = await apiLogin(email, password); 
        // Lưu data (LoginResponseDto) vào state
        setAuthData(data); 
        // Lưu vào localStorage để giữ đăng nhập khi F5
        localStorage.setItem('authData', JSON.stringify(data)); 
    };

    // 5. Hàm Logout
    const logout = async () => {
        try {
            // Gọi API logout (cần accessToken)
            await apiLogout(authData.accessToken);
        } catch (error) {
            console.error("Logout API failed, but logging out locally", error);
        } finally {
             // Dù API có lỗi hay không, vẫn xóa thông tin ở client
            setAuthData(null);
            localStorage.removeItem('authData');
        }
    };

    // 6. Cung cấp state và hàm cho các component con
    const value = {
        authData,
        isAuthenticated: !!authData, // True nếu authData có, false nếu là null
        loading,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children} {/* Chỉ render app khi đã check xong localStorage */}
        </AuthContext.Provider>
    );
};

// 7. Tạo hook tùy chỉnh để dễ dàng sử dụng context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};