import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// CSS cho Header
const headerStyles = {
    background: '#fff',
    padding: '1rem 2rem',
    borderBottom: '1px solid #eee',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
};

const logoStyles = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#333',
    textDecoration: 'none',
};

const navStyles = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
};

const navLinkStyles = {
    textDecoration: 'none',
    color: '#007bff',
    fontWeight: '500',
};

const userInfoStyles = {
    color: '#555',
    marginRight: '1rem'
};

const logoutButtonStyles = {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '1rem'
};


function Header() {
    const { isAuthenticated, authData, logout } = useAuth();

    return (
        <header style={headerStyles}>
            <Link to="/" style={logoStyles}>
                LoanPredict
            </Link>
            <nav style={navStyles}>
                {isAuthenticated ? (
                    // Đã đăng nhập
                    <>
                        <span style={userInfoStyles}>Chào, {authData.email}</span>
                        <button onClick={logout} style={logoutButtonStyles}>
                            Đăng Xuất
                        </button>
                    </>
                ) : (
                    // Chưa đăng nhập
                    <>
                        <Link to="/login" style={navLinkStyles}>Đăng Nhập</Link>
                        <Link to="/signup" style={navLinkStyles}>Đăng Ký</Link>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Header;