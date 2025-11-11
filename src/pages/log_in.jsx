import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    
    const { login } = useAuth(); // Lấy hàm login từ Context
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // 1. Gọi hàm login từ Context
            // Dữ liệu body dựa trên LoginRequestDto
            await login(email, password);
            
            // 2. Context sẽ tự động lưu data và cập nhật state
            // 3. Chuyển hướng về trang chủ
            navigate('/');

        } catch (err) {
            // 4. Xử lý lỗi (sai pass, user không tồn tại)
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
            console.error(err);
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            <h2>Đăng Nhập</h2>
            
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                    type="email" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input 
                    type="password" 
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                />
            </div>
            
            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="form-button">Đăng Nhập</button>

            <Link to="/signup" className="form-link">Chưa có tài khoản? Đăng ký</Link>
        </form>
    );
}

export default LoginPage;