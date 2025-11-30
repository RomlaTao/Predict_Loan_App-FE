import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { addEmployee, getEmployeeById, updateEmployee } from '../../services/employeeService';
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
  Grid,
  FormControlLabel,
  Switch,
  Avatar,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Person as PersonIcon } from '@mui/icons-material';

/**
 * EmployeeEditPage - Trang tạo/sửa nhân viên (STAFF)
 * Chỉ ADMIN mới có quyền truy cập
 */
function EmployeeEditPage() {
  const { userId } = useParams(); // userId từ URL (nếu có thì là edit mode)
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state - adapt theo UserProfileRequestDto từ backend
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

  const isEditMode = !!userId;

  useEffect(() => {
    if (isAuthenticated && isEditMode) {
      fetchEmployee();
    }
  }, [isAuthenticated, userId]);

  const fetchEmployee = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployeeById(userId);
      console.debug('[EmployeeEditPage] Fetched employee data:', data);
      
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
      console.error('Error fetching employee:', err);
      setError(err.message || 'Không thể tải thông tin nhân viên');
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
      // Prepare data theo UserProfileRequestDto format
      const requestData = {
        fullName: formData.fullName,
        email: formData.email,
        department: formData.department || null,
        position: formData.position || null,
        hireDate: formData.hireDate || null,
        phoneNumber: formData.phoneNumber || null,
        address: formData.address || null,
        isActive: formData.isActive,
      };

      if (isEditMode) {
        await updateEmployee(userId, requestData);
        setSuccessMessage('Cập nhật nhân viên thành công!');
      } else {
        // Note: addEmployee có thể cần userId, nhưng thường được tạo từ auth service
        await addEmployee(requestData);
        setSuccessMessage('Tạo nhân viên thành công!');
      }

      // Redirect sau 1.5 giây
      setTimeout(() => {
        navigate('/admin/employees');
      }, 1500);
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(err.message || 'Không thể lưu thông tin nhân viên');
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
    <Container maxWidth="md" >
      <Box sx={{ mb: 3 }}>
        {/* Button Quay lại - nằm trên title */}
        <Box>
          <Button 
            component={Link}
            to="/admin/employees"
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
            {isEditMode ? 'Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}
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
        <Box component="form" onSubmit={handleSubmit} >
          {/* Họ và tên - chiếm 100% width, margin-top và margin-bottom tùy chỉnh */}
          <Box sx={{ width: '100%', mt: '10px', mb: '20px' }}>
            <TextField
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              fullWidth
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
              required
              fullWidth
              disabled={isEditMode} // Email không thể sửa khi edit
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
              />
            </Box>
          </Box>
          
          {/* Ngày tuyển dụng và Trạng thái hoạt động - cùng 1 hàng */}
          <Box sx={{ display: 'flex', gap: '20px', mb: '24px', alignItems: 'center' }}>
            {/* Ngày tuyển dụng - chiếm 65% width */}
            <Box sx={{ width: '65%' }}>
              <TextField
                label="Ngày tuyển dụng"
                name="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
            {/* Trạng thái hoạt động - chiếm 30% width */}
            <Box sx={{ width: '30%', display: 'flex', alignItems: 'center', pt: '8px' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    name="isActive"
                  />
                }
                label="Trạng thái hoạt động"
              />
            </Box>
          </Box>
          
          {/* Buttons - margin-top: 30px */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: '30px' }}>
            <Button
              component={Link}
              to="/admin/employees"
              variant="outlined"
              disabled={submitting}
              sx={{ 
                borderColor: 'primary.main',
                color: 'primary.main',
                textTransform: 'uppercase',
                fontSize: '16px',
                padding: '12px 32px',
                minWidth: '120px',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                }
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
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

export default EmployeeEditPage;

