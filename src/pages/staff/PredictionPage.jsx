import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { createPrediction, getPredictionsByCustomerId } from '../../services/predictionService';
import { getCustomerById } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Container,
  Paper,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Assessment as AssessmentIcon } from '@mui/icons-material';

/**
 * PredictionPage - Trang tạo dự đoán rủi ro cho khách hàng
 * Chỉ STAFF mới có quyền truy cập
 */
function PredictionPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [existingPredictions, setExistingPredictions] = useState([]);

  useEffect(() => {
    if (isAuthenticated && customerId) {
      fetchCustomer();
      fetchExistingPredictions();
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

  const fetchExistingPredictions = async () => {
    try {
      const data = await getPredictionsByCustomerId(customerId);
      setExistingPredictions(data);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      // Không hiển thị error nếu không fetch được predictions
    }
  };

  const handleCreatePrediction = async () => {
    setSubmitting(true);
    setError(null);

    try {
      console.debug('[PredictionPage] Creating prediction for customerId:', customerId);
      const prediction = await createPrediction(customerId);
      console.debug('[PredictionPage] Prediction created:', prediction);
      
      // Kiểm tra prediction có predictionId không
      if (!prediction || !prediction.predictionId) {
        console.error('[PredictionPage] Prediction response missing predictionId:', prediction);
        throw new Error('Không nhận được prediction ID từ server. Vui lòng thử lại.');
      }

      // Redirect đến trang kết quả
      console.debug('[PredictionPage] Navigating to:', `/predictions/${prediction.predictionId}`);
      navigate(`/predictions/${prediction.predictionId}`);
    } catch (err) {
      console.error('[PredictionPage] Error creating prediction:', err);
      setError(err.message || 'Không thể tạo dự đoán. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Đang xử lý';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'FAILED':
        return 'Thất bại';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
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

  if (!customer) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Không tìm thấy khách hàng</Alert>
        <Button
          component={Link}
          to="/staff/customers"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Button 
            component={Link}
            to={`/customers/${customerId}`}
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
          Tạo Dự Đoán Rủi Ro
        </Typography>
      </Box>

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

      {/* Thông tin khách hàng */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thông tin khách hàng
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Họ và tên
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {customer.fullName}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {customer.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Tuổi
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {customer.age || '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Thu nhập
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {customer.income
                  ? new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(customer.income)
                  : '-'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lịch sử predictions */}
      {existingPredictions.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Lịch sử dự đoán
            </Typography>
            <Box sx={{ mt: 2 }}>
              {existingPredictions.map((prediction) => (
                <Box
                  key={prediction.predictionId}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid #eee',
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(prediction.createdAt)}
                    </Typography>
                    <Typography variant="body2">
                      Trạng thái: {getStatusLabel(prediction.status)}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    component={Link}
                    to={`/predictions/${prediction.predictionId}`}
                  >
                    Xem chi tiết
                  </Button>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Form tạo prediction */}
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <AssessmentIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Tạo dự đoán rủi ro cho khách hàng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hệ thống sẽ phân tích thông tin khách hàng và đưa ra dự đoán về khả năng vay vốn
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            component={Link}
            to={`/customers/${customerId}`}
            variant="outlined"
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePrediction}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <AssessmentIcon />}
            size="large"
          >
            {submitting ? 'Đang tạo dự đoán...' : 'Tạo Dự Đoán'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default PredictionPage;

