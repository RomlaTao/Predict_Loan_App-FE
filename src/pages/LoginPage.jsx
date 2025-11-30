import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    CircularProgress,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email/mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundSize: 'cover',      /* lấp đầy màn hình */
                backgroundPosition: 'center', /* căn giữa */
                backgroundColor: '#f3f3f3',   // nền xám giống mẫu
                padding: 2,
            }}
        >
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 380,
                    borderRadius: 2,
                    boxShadow: '0 3px 12px rgba(0,0,0,0.12)',
                    backgroundColor: '#fff',
                }}
            >
                <CardContent sx={{ padding: 4 }}>
                    <Typography
                        variant="h5"
                        component="h1"
                        fontWeight={600}
                        textAlign="center"
                        gutterBottom
                        sx={{ mb: 3 }}
                    >
                        Login
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {error && (
                            <Typography color="error" variant="body2" textAlign="center">
                                {error}
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            size="medium"
                            fullWidth
                            disabled={loading}
                            sx={{
                                py: 1,
                                backgroundColor: '#0d6efd',
                                '&:hover': { backgroundColor: '#0b5ed7' },
                                fontWeight: 600,
                            }}
                        >
                            {loading ? <CircularProgress size={22} color="inherit" /> : 'LOGIN'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default LoginPage;
