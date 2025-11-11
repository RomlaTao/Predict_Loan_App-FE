import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/authService';

function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // 1. Kiểm tra mật khẩu khớp
        if (password !== passwordConfirm) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            // 2. Gọi API từ service
            // Dữ liệu body dựa trên SignupRequestDto
            const responseMessage = await signup(email, password, passwordConfirm);
            
            // 3. Xử lý thành công
            setSuccess(responseMessage + ". Sẽ chuyển hướng đến trang đăng nhập...");
            
            // 4. Chờ 2 giây rồi chuyển sang trang Login
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            // 5. Xử lý lỗi
            setError(err.message);
        }
    };

    return (
        <form className="form-container" onSubmit={handleSubmit}>
            <h2>Đăng Ký</h2>
            
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

            <div className="form-group">
                <label htmlFor="passwordConfirm">Xác nhận mật khẩu</label>
                <input 
                    type="password" 
                    id="passwordConfirm"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required 
                />
            </div>
            
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <button type="submit" className="form-button">Đăng Ký</button>

            <Link to="/login" className="form-link">Đã có tài khoản? Đăng nhập</Link>
        </form>
    );
}

export default SignupPage;