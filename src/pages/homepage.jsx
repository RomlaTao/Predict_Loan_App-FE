import React from 'react';
import { useAuth } from '../context/AuthContext';

// CSS cho trang Home
const homeStyles = {
    textAlign: 'center',
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
};

const logoutButtonStyles = {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#dc3545', // Màu đỏ cho logout
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1.5rem',
};

function HomePage() {
    // Lấy thông tin user và hàm logout từ Context
    const { authData, logout } = useAuth(); 

    // Hàm xử lý khi nhấn nút Logout
    const handleLogout = async () => {
        // Chỉ cần gọi hàm logout từ Context
        // Context sẽ tự gọi API và dọn dẹp localStorage
        await logout();
        // App.jsx sẽ tự động chuyển hướng về /login
    };

    return (
        <div style={homeStyles}>
            <h1>Chào mừng bạn đến với Trang Dự Đoán Cho Vay</h1>
            <p>Bạn đã đăng nhập với tư cách:</p>
            <h3>{authData.email}</h3>
            <p>(Role: {authData.role})</p>
            <p>(User ID: {authData.userId})</p>

            {/* Nút Logout gọi hàm handleLogout */}
            <button 
                onClick={handleLogout} 
                style={logoutButtonStyles}
            >
                Đăng Xuất
            </button>
        </div>
    );
}

export default HomePage;