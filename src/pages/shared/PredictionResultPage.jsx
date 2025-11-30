import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPredictionById } from '../../services/predictionService';
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
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from '@mui/icons-material';

/**
 * PredictionResultPage - Trang xem kết quả dự đoán rủi ro
 * STAFF và RISK_ANALYST có thể xem
 */
function PredictionResultPage() {
  const { predictionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStaff, isRiskAnalyst } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [polling, setPolling] = useState(false);

  const fetchPredictionResult = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      console.debug('[PredictionResultPage] Fetching prediction:', predictionId);
      const data = await getPredictionById(predictionId);
      console.debug('[PredictionResultPage] Prediction data received:', data);
      setPrediction(data);

      // Fetch customer info if not already loaded
      if (data.customerId && !customer) {
        try {
          console.debug('[PredictionResultPage] Fetching customer:', data.customerId);
          const customerData = await getCustomerById(data.customerId);
          setCustomer(customerData);
        } catch (err) {
          console.error('[PredictionResultPage] Error fetching customer:', err);
        }
      }
    } catch (err) {
      console.error('[PredictionResultPage] Error fetching prediction:', err);
      setError(err.message || 'Không thể tải kết quả dự đoán');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && predictionId) {
      fetchPrediction();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, predictionId]);

  useEffect(() => {
    // Polling nếu prediction đang PENDING
    if (prediction && prediction.status === 'PENDING' && !polling) {
      console.debug('[PredictionResultPage] Starting polling for prediction:', prediction.predictionId);
      setPolling(true);
      const interval = setInterval(() => {
        console.debug('[PredictionResultPage] Polling prediction status...');
        fetchPrediction(false); // Không set loading khi polling
      }, 3000); // Poll mỗi 3 giây

      return () => {
        console.debug('[PredictionResultPage] Stopping polling');
        clearInterval(interval);
        setPolling(false);
      };
    } else if (prediction && prediction.status !== 'PENDING' && polling) {
      console.debug('[PredictionResultPage] Prediction completed, stopping polling');
      setPolling(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prediction, polling, predictionId]);

  const fetchPrediction = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    try {
      console.debug('[PredictionResultPage] Fetching prediction:', predictionId);
      const data = await getPredictionById(predictionId);
      console.debug('[PredictionResultPage] Prediction data received:', data);
      setPrediction(data);

      // Fetch customer info if not already loaded
      if (data.customerId && !customer) {
        try {
          console.debug('[PredictionResultPage] Fetching customer:', data.customerId);
          const customerData = await getCustomerById(data.customerId);
          setCustomer(customerData);
        } catch (err) {
          console.error('[PredictionResultPage] Error fetching customer:', err);
        }
      }
    } catch (err) {
      console.error('[PredictionResultPage] Error fetching prediction:', err);
      setError(err.message || 'Không thể tải kết quả dự đoán');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <HourglassEmptyIcon />;
      case 'COMPLETED':
        return <CheckCircleIcon />;
      case 'FAILED':
        return <CancelIcon />;
      default:
        return null;
    }
  };

  const getResultLabel = (result) => {
    if (result === null || result === undefined) return 'Chưa có kết quả';
    return result ? 'Chấp nhận cho vay' : 'Từ chối cho vay';
  };

  const getResultColor = (result) => {
    if (result === null || result === undefined) return 'default';
    return result ? 'success' : 'error';
  };

  // Xác định route quay lại dựa trên role
  const getBackRoute = () => {
    if (isRiskAnalyst()) {
      return '/risk-analyst/dashboard';
    }
    if (prediction?.customerId) {
      return `/customers/${prediction.customerId}`;
    }
    return '/staff/customers';
  };

  if (loading && !prediction) {
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

  if (error && !prediction) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          component={Link}
          to={getBackRoute()}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="false" >
      <Box sx={{ mb: 3 }}>
        {/* Button Quay lại - nằm trên title */}
        <Box>
          <Button 
            component={Link}
            to={getBackRoute()}
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
            Kết Quả Dự Đoán
          </Typography>
        </Box>
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

      {prediction && (
        <Grid container spacing={3}>
          {/* Thông tin khách hàng */}
          {customer && (
            <Grid item xs={12}>
              <Card sx={{ width: '100%', height: '100%', boxSizing: 'border-box', m: 0, display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ p: 3, width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '24px', fontWeight: 600 }}>
                    Thông tin khách hàng
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-evenly' }}>
                    {/* Họ và tên - chiếm toàn bộ 1 hàng */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="body1" color="text.secondary" sx={{ fontSize: '16px', mb: 0.5 }}>
                        Họ và tên
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ fontSize: '18px' }}>
                        {customer.fullName}
                      </Typography>
                    </Box>
                    {/* Email - chiếm toàn bộ 1 hàng */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="body1" color="text.secondary" sx={{ fontSize: '16px', mb: 0.5 }}>
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ fontSize: '18px' }}>
                        {customer.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Kết quả dự đoán */}
          <Grid item xs={12}>
            <Card sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', m: 0 }}>
              <CardContent sx={{ p: 3, width: '100%', boxSizing: 'border-box' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontSize: '24px', fontWeight: 600 }}>Kết quả dự đoán</Typography>
                  <Chip
                    icon={getStatusIcon(prediction.status)}
                    label={getStatusLabel(prediction.status)}
                    color={getStatusColor(prediction.status)}
                    variant="filled"
                  />
                </Box>

                {prediction.status === 'PENDING' && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Đang xử lý dự đoán...
                    </Typography>
                    <LinearProgress sx={{ mt: 1 }} />
                  </Box>
                )}

                {prediction.status === 'COMPLETED' && (
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: prediction.predictionResult ? 'success.light' : 'error.light',
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="h4" fontWeight={600} gutterBottom>
                          {getResultLabel(prediction.predictionResult)}
                        </Typography>
                        {prediction.confidence !== null && prediction.confidence !== undefined && (
                          <Typography variant="body1" sx={{ mt: 1 }}>
                            Độ tin cậy: {(prediction.confidence * 100).toFixed(2)}%
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}

                {prediction.status === 'FAILED' && (
                  <Alert severity="error">
                    Dự đoán không thành công. Vui lòng thử lại sau.
                  </Alert>
                )}

                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid #eee' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Prediction ID
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {prediction.predictionId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Employee ID
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {prediction.employeeId}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày tạo
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatDate(prediction.createdAt)}
                      </Typography>
                    </Grid>
                    {prediction.completedAt && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Ngày hoàn thành
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatDate(prediction.completedAt)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default PredictionResultPage;

