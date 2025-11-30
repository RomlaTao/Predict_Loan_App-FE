import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCustomerById } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Container,
  Paper,
  Grid,
  Alert,
  Snackbar,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';

/**
 * CustomerDetailPage - Trang chi tiết khách hàng
 * STAFF: có thể xem và sửa khách hàng của mình
 * RISK_ANALYST: có thể xem tất cả khách hàng
 */
function CustomerDetailPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    if (isAuthenticated && customerId) {
      fetchCustomer();
    }
  }, [isAuthenticated, customerId]);

  const fetchCustomer = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerById(customerId);
      setCustomer(data);
    } catch (err) {
      console.error('Error fetching customer:', err);
      setError(err.message || 'Không thể tải thông tin khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value == null) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getEducationLabel = (value) => {
    switch (value) {
      case 1:
        return 'Đại học';
      case 2:
        return 'Sau đại học';
      case 3:
        return 'Tiến sĩ';
      default:
        return '-';
    }
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

  if (error && !customer) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          component={Link}
          to={isStaff() ? "/staff/customers" : "/risk-analyst/dashboard"}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
              component={Link}
              to={isStaff() ? "/staff/customers" : "/risk-analyst/dashboard"}
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
            Chi Tiết Khách Hàng
          </Typography>
        </Box>
        {isStaff() && (
          <Button
            variant="contained"
            component={Link}
            to={`/staff/customers/${customerId}/edit`}
            startIcon={<EditIcon />}
          >
            Sửa
          </Button>
        )}
      </Box>

      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}

      {customer && (
        <Grid container spacing={3}>
          {/* Thông tin cơ bản */}
          <Grid item xs={12} width="100%">
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom fontWeight={600} marginLeft={2}>
                  Thông tin cơ bản
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} width="18%" marginLeft={2}>
                    <Typography variant="body2" color="text.secondary">
                      Họ và tên
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {customer.fullName || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {customer.email || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Tuổi
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {customer.age || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Kinh nghiệm (năm)
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {customer.experience || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Trình độ học vấn
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {getEducationLabel(customer.education)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Thông tin tài chính */}
          <Grid item xs={12} width="100%">
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom fontWeight={600} marginLeft={2}>
                  Thông tin tài chính
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} marginLeft={2} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Thu nhập
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(customer.income)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} marginLeft={2} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Chi phí thẻ tín dụng trung bình
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(customer.ccAvg)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} marginLeft={2} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Số thành viên gia đình
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {customer.family || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} marginLeft={2} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Thế chấp
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatCurrency(customer.mortgage)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Tài khoản và dịch vụ */}
          <Grid item xs={12} width="100%">
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600} marginLeft={2}>
                  Tài khoản và dịch vụ
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                  <Chip
                    label="Tài khoản chứng khoán"
                    color={customer.securitiesAccount ? 'success' : 'default'}
                    variant={customer.securitiesAccount ? 'filled' : 'outlined'}
                    sx={{ marginLeft: 2 , width: '18%'}}
                  />
                  <Chip
                    label="Tài khoản CD"
                    color={customer.cdAccount ? 'success' : 'default'}
                    variant={customer.cdAccount ? 'filled' : 'outlined'}
                    sx={{ width: '18%'}}
                  />
                  <Chip
                    label="Dịch vụ online"
                    color={customer.online ? 'success' : 'default'}
                    variant={customer.online ? 'filled' : 'outlined'}
                    sx={{ width: '18%'}}
                  />
                  <Chip
                    label="Thẻ tín dụng"
                    color={customer.creditCard ? 'success' : 'default'}
                    variant={customer.creditCard ? 'filled' : 'outlined'}
                    sx={{ width: '18%'}}
                  />
                  <Chip
                    label="Vay cá nhân"
                    color={customer.personalLoan ? 'success' : 'default'}
                    variant={customer.personalLoan ? 'filled' : 'outlined'}
                    sx={{ width: '18%'}}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Thông tin hệ thống */}
          <Grid item xs={12} width="100%">
            <Card sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600} marginLeft={2}>
                  Thông tin hệ thống
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6} marginLeft={2}width="28%">
                    <Typography variant="body2" color="text.secondary">
                      Customer ID
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {customer.customerId || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} width="28%">
                    <Typography variant="body2" color="text.secondary">
                      Staff ID
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {customer.staffId || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Ngày tạo
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(customer.createdAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} width="18%">
                    <Typography variant="body2" color="text.secondary">
                      Ngày cập nhật
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatDate(customer.updatedAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Nút tạo prediction */}
          {isStaff() && (
            <Grid item xs={12} width="100%">
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/staff/customers/${customerId}/prediction`}
                >
                  Tạo Dự Đoán Rủi Ro
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}

export default CustomerDetailPage;

