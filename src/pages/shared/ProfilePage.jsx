import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentProfile, updateEmployee } from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
  Container,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

/**
 * ProfilePage - Trang user tự cập nhật profile của mình
 * Tất cả users (ADMIN, STAFF, RISK_ANALYST) đều có thể truy cập
 * Sử dụng endpoint /api/users-profiles/me để lấy và cập nhật profile
 */
function ProfilePage() {
  const navigate = useNavigate();
  const { isAuthenticated, getUserId } = useAuth();
  
  // Tất cả users đều có thể cập nhật profile của chính họ
  const canEdit = true;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state - UserProfileRequestDto
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
    position: '',
    hireDate: '',
    phoneNumber: '',
    address: '',
    isActive: true,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentProfile();
      console.debug('[ProfilePage] Fetched profile data:', data);
      
      // Map data từ backend vào form theo UserProfileRequestDto
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        department: data.department || '',
        position: data.position || '',
        hireDate: data.hireDate ? data.hireDate.split('T')[0] : '', // Format LocalDate to YYYY-MM-DD
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
    } catch (err) {
      console.error('[ProfilePage] Error fetching profile:', err);
      setError(err.message || 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Prepare data theo UserProfileRequestDto format
      // Note: isActive không được gửi vì user không thể tự thay đổi trạng thái hoạt động
      const requestData = {
        fullName: formData.fullName,
        email: formData.email,
        department: formData.department || null,
        position: formData.position || null,
        hireDate: formData.hireDate || null,
        phoneNumber: formData.phoneNumber || null,
        address: formData.address || null,
      };

      await updateEmployee(userId, requestData);
      setSuccessMessage('Cập nhật profile thành công!');
      
      // Refresh profile data
      await fetchProfile();
    } catch (err) {
      console.error('[ProfilePage] Error updating profile:', err);
      setError(err.message || 'Không thể cập nhật profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mb: 3 }}>
        {/* Button Quay lại - nằm trên title */}
        <Box>
          <Button 
            component={Link}
            to="/"
            startIcon={<img src="/arrow-left.svg" style={{ width: '44px', height: '44px' }} />}
            sx={{ 
              borderColor: 'primary.main',
              color: 'primary.main',
              marginBottom: '20px',
              marginTop: '10px',
            }}
          >
          </Button>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Thông Tin Cá Nhân
          </Typography>
        </Box>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Họ và tên - chiếm 100% width, margin-top và margin-bottom tùy chỉnh */}
          <Box sx={{ width: '100%', mt: '10px', mb: '20px' }}>
            <TextField
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              fullWidth
              disabled={!canEdit}
            />
          </Box>
          
          {/* Email - chiếm 100% width, margin-bottom: 25px */}
          <Box sx={{ width: '100%', mb: '25px' }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              disabled
            />
          </Box>
          
          {/* Địa chỉ - chiếm 100% width, margin-bottom: 18px */}
          <Box sx={{ width: '100%', mb: '18px' }}>
            <TextField
              label="Địa chỉ"
              name="address"
              value={formData.address}
              onChange={handleChange}
              fullWidth
              disabled={!canEdit}
            />
          </Box>
          
          {/* Số điện thoại - chiếm 100% width, margin-bottom: 22px */}
          <Box sx={{ width: '100%', mb: '22px' }}>
            <TextField
              label="Số điện thoại"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              fullWidth
              disabled={!canEdit}
            />
          </Box>
          
          {/* Phòng ban và Chức vụ - 2 cột với khoảng cách khác nhau */}
          <Box sx={{ display: 'flex', gap: '15px', mb: '20px' }}>
            {/* Phòng ban - chiếm 48% width */}
            <Box sx={{ width: '48%' }}>
              <TextField
                label="Phòng ban"
                name="department"
                value={formData.department}
                onChange={handleChange}
                fullWidth
                disabled={!canEdit}
              />
            </Box>
            {/* Chức vụ - chiếm 48% width */}
            <Box sx={{ width: '48%' }}>
              <TextField
                label="Chức vụ"
                name="position"
                value={formData.position}
                onChange={handleChange}
                fullWidth
                disabled={!canEdit}
              />
            </Box>
          </Box>
          
          {/* Ngày tuyển dụng - chiếm 100% width */}
          <Box sx={{ width: '100%', mb: '24px' }}>
            <TextField
              label="Ngày tuyển dụng"
              name="hireDate"
              type="date"
              value={formData.hireDate}
              onChange={handleChange}
              fullWidth
              disabled={!canEdit}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
          
          {/* Buttons - margin-top: 30px */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: '30px' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{
                bgcolor: 'primary.main',
                textTransform: 'uppercase',
                fontSize: '16px',
                padding: '12px 32px',
                minWidth: '120px',
                '&:hover': {
                  bgcolor: 'primary.dark',
                }
              }}
            >
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProfilePage;

