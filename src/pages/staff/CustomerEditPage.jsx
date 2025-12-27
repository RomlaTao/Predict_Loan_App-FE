import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCustomer, getCustomerById, updateCustomer } from '../../services/customerService';
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
  Checkbox,
  MenuItem,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

/**
 * CustomerEditPage - Trang tạo/sửa khách hàng
 * Chỉ STAFF mới có quyền truy cập
 */
function CustomerEditPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, getUserId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isEditMode = !!customerId;

  // Form state - CustomerProfileRequestDto
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    experience: '',
    income: '',
    family: '',
    ccAvg: '',
    education: '',
    mortgage: '',
    securitiesAccount: false,
    cdAccount: false,
    online: false,
    creditCard: false,
    personalLoan: false,
  });

  useEffect(() => {
    if (isAuthenticated && isEditMode) {
      fetchCustomer();
    } else if (isAuthenticated && !isEditMode) {
      // Set default staffId when creating new customer
      const userId = getUserId();
      if (userId) {
        // staffId will be set automatically by backend from X-User-Id header
      }
    }
  }, [isAuthenticated, customerId]);

  const fetchCustomer = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerById(customerId);
      setFormData({
        fullName: data.fullName || '',
        email: data.email || '',
        age: data.age || '',
        experience: data.experience || '',
        income: data.income || '',
        family: data.family || '',
        ccAvg: data.ccAvg || '',
        education: data.education || '',
        mortgage: data.mortgage || '',
        securitiesAccount: data.securitiesAccount || false,
        cdAccount: data.cdAccount || false,
        online: data.online || false,
        creditCard: data.creditCard || false,
        personalLoan: data.personalLoan || false,
      });
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError(err.message || 'Không thể tải thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    // Allow empty or numeric values
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? '' : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Convert form data to proper types
      const customerData = {
        fullName: formData.fullName,
        email: formData.email,
        age: formData.age ? parseInt(formData.age) : null,
        experience: formData.experience ? parseInt(formData.experience) : null,
        income: formData.income ? parseFloat(formData.income) : null,
        family: formData.family ? parseInt(formData.family) : null,
        ccAvg: formData.ccAvg ? parseFloat(formData.ccAvg) : null,
        education: formData.education ? parseInt(formData.education) : null,
        mortgage: formData.mortgage ? parseFloat(formData.mortgage) : null,
        securitiesAccount: formData.securitiesAccount,
        cdAccount: formData.cdAccount,
        online: formData.online,
        creditCard: formData.creditCard,
        personalLoan: formData.personalLoan,
      };

      if (isEditMode) {
        await updateCustomer(customerId, customerData);
        setSuccessMessage('Cập nhật khách hàng thành công!');
      } else {
        await createCustomer(customerData);
        setSuccessMessage('Tạo khách hàng thành công!');
      }

      setTimeout(() => {
        navigate('/staff/customers');
      }, 1500);
    } catch (err) {
      console.error('Error saving customer:', err);
      setError(err.message || 'Không thể lưu thông tin khách hàng');
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button 
            component={Link}
            to="/staff/customers"
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
          {isEditMode ? 'Sửa Thông Tin Khách Hàng' : 'Thêm Khách Hàng Mới'}
        </Typography>
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
          <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
            Thông tin cơ bản
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <TextField
                label="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
                disabled={isEditMode}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ mb: '20px' }}>
              <TextField
                label="Tuổi"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleNumericChange}
                fullWidth
                inputProps={{ min: 0, max: 150 }}
              />
            </Grid>
            <Grid item xs={12} sm={4} sx={{ mb: '20px' }}>
              <TextField
                label="Kinh nghiệm (năm)"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleNumericChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4} size={3}>
              <TextField
                select
                label="Trình độ học vấn"
                name="education"
                value={formData.education}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">Chọn trình độ</MenuItem>
                <MenuItem value={1}>Đại học</MenuItem>
                <MenuItem value={2}>Sau đại học</MenuItem>
                <MenuItem value={3}>Tiến sĩ</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Thông tin tài chính
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <TextField
                label="Thu nhập"
                name="income"
                type="number"
                value={formData.income}
                onChange={handleNumericChange}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Nhập số tiền (VND)"
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <TextField
                label="Chi phí thẻ tín dụng trung bình (CC Avg)"
                name="ccAvg"
                type="number"
                value={formData.ccAvg}
                onChange={handleNumericChange}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <TextField
                label="Số thành viên gia đình"
                name="family"
                type="number"
                value={formData.family}
                onChange={handleNumericChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <TextField
                label="Thế chấp"
                name="mortgage"
                type="number"
                value={formData.mortgage}
                onChange={handleNumericChange}
                fullWidth
                helperText="VND"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Tài khoản và dịch vụ
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.securitiesAccount}
                    onChange={handleChange}
                    name="securitiesAccount"
                  />
                }
                label="Tài khoản chứng khoán"
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.cdAccount}
                    onChange={handleChange}
                    name="cdAccount"
                  />
                }
                label="Tài khoản CD"
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.online}
                    onChange={handleChange}
                    name="online"
                  />
                }
                label="Sử dụng dịch vụ online"
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ mb: '20px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.creditCard}
                    onChange={handleChange}
                    name="creditCard"
                  />
                }
                label="Có thẻ tín dụng"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.personalLoan}
                    onChange={handleChange}
                    name="personalLoan"
                  />
                }
                label="Vay cá nhân"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button
              component={Link}
              to="/staff/customers"
              variant="outlined"
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default CustomerEditPage;

