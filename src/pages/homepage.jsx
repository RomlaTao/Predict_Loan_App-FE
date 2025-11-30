import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRouteByRole } from '../utils/rbac';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * HomePage - Entry point sau khi đăng nhập
 * Tự động redirect đến trang mặc định dựa trên role của user
 * - ADMIN → /admin/employees
 * - STAFF → /staff/customers
 * - RISK_ANALYST → /risk-analyst/dashboard
 */
function HomePage() {
    const { authData, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Chỉ redirect khi đã load xong auth data và đã đăng nhập
        if (!loading && isAuthenticated && authData?.role) {
            const defaultRoute = getDefaultRouteByRole(authData.role);
            console.log('HomePage redirect:', { role: authData.role, route: defaultRoute });
            if (defaultRoute && defaultRoute !== '/') {
                navigate(defaultRoute, { replace: true });
            }
        }
    }, [loading, isAuthenticated, authData?.role, navigate]);

    // Hiển thị loading trong khi đang redirect
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: 2,
            }}
        >
            <CircularProgress />
            <Typography variant="body1" color="text.secondary">
                Đang chuyển hướng...
            </Typography>
        </Box>
    );
}

export default HomePage;