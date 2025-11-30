import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from '@mui/material';

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
    gap: '1rem',
    alignItems: 'center',
};

const userInfoStyles = {
    color: '#555',
    marginRight: '0.5rem'
};

function Header() {
    const { isAuthenticated, authData, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        handleMenuClose();
        navigate('/profile');
    };

    const handleLogoutClick = () => {
        handleMenuClose();
        logout();
    };

    return (
        <header style={headerStyles}>
            <Link to="/" style={logoStyles}>
                LoanPredict
            </Link>
            <nav style={navStyles}>
                {isAuthenticated ? (
                    // Đã đăng nhập
                    <>
                        <Typography variant="body1" sx={userInfoStyles}>
                            Chào, {authData.email}
                        </Typography>
                        <IconButton
                            onClick={handleMenuClick}
                            size="small"
                            aria-controls={open ? 'user-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            sx={{ padding: '4px' }}
                        >
                            <img 
                                src="/menu-meatballs-1.svg" 
                                alt="Menu" 
                                style={{ width: '24px', height: '24px' }}
                            />
                        </IconButton>
                        <Menu
                            id="user-menu"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleMenuClose}
                            MenuListProps={{
                                'aria-labelledby': 'user-menu-button',
                            }}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            <MenuItem onClick={handleProfileClick}>
                                Hồ sơ
                            </MenuItem>
                            <MenuItem onClick={handleLogoutClick} sx={{ color: 'error.main' }}>
                                Đăng xuất
                            </MenuItem>
                        </Menu>
                    </>
                ) : (
                    // Chưa đăng nhập
                    <>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#007bff', fontWeight: '500' }}>
                            Đăng Nhập
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}

export default Header;