import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPredictions } from '../../services/predictionService';
import { getApprovedCustomers, getRejectedCustomers, getPendingCustomers } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Container,
  Alert,
  Snackbar,
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

/**
 * RiskDashboardPage - Dashboard cho RISK_ANALYST
 * Xem tất cả predictions và customers theo status
 */
function RiskDashboardPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Predictions data
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Customers data
  const [approvedCustomers, setApprovedCustomers] = useState([]);
  const [rejectedCustomers, setRejectedCustomers] = useState([]);
  const [pendingCustomers, setPendingCustomers] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Filter predictions based on search term
    if (searchTerm) {
      const filtered = predictions.filter((prediction) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          prediction.predictionId?.toString().toLowerCase().includes(searchLower) ||
          prediction.customerId?.toString().toLowerCase().includes(searchLower) ||
          prediction.employeeId?.toString().toLowerCase().includes(searchLower)
        );
      });
      setFilteredPredictions(filtered);
    } else {
      setFilteredPredictions(predictions);
    }
    setPage(0);
  }, [searchTerm, predictions]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all predictions
      const predictionsData = await getAllPredictions();
      setPredictions(predictionsData);
      setFilteredPredictions(predictionsData);

      // Fetch customers by status
      try {
        const [approved, rejected, pending] = await Promise.all([
          getApprovedCustomers(),
          getRejectedCustomers(),
          getPendingCustomers(),
        ]);
        setApprovedCustomers(approved);
        setRejectedCustomers(rejected);
        setPendingCustomers(pending);
      } catch (err) {
        console.error('Error fetching customers by status:', err);
        // Không hiển thị error nếu không fetch được customers
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
    setSearchTerm('');
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  const getResultLabel = (result) => {
    if (result === null || result === undefined) return '-';
    return result ? 'Chấp nhận' : 'Từ chối';
  };

  const getResultColor = (result) => {
    if (result === null || result === undefined) return 'default';
    return result ? 'success' : 'error';
  };

  if (loading && predictions.length === 0) {
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" fontWeight={600} sx={{ mb: 3, textAlign: 'center' }}>
        Dashboard Phân Tích Rủi Ro
      </Typography>

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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4, justifyContent: 'center' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom >
                Tổng số Predictions
              </Typography>
              <Typography variant="h4" fontWeight={600} color="primary.main" textAlign="center">
                {predictions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Đã chấp nhận
              </Typography>
              <Typography variant="h4" fontWeight={600} color="success.main" textAlign="center">
                {approvedCustomers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Đã từ chối
              </Typography>
              <Typography variant="h4" fontWeight={600} color="error.main" textAlign="center">
                {rejectedCustomers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Đang chờ xử lý
              </Typography>
              <Typography variant="h4" fontWeight={600} color="warning.main" textAlign="center">
                {pendingCustomers.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab align="center" label="Tất cả Predictions" />
          <Tab align="center" label="Khách hàng đã chấp nhận" />
          <Tab align="center" label="Khách hàng đã từ chối" />
          <Tab align="center" label="Khách hàng đang chờ" />
        </Tabs>
      </Paper>

      {/* Tab Content: All Predictions */}
      {activeTab === 0 && (
        <>
          <TextField
            label="Tìm kiếm prediction..."
            variant="outlined"
            value={searchTerm}
            onChange={handleSearchChange}
            fullWidth
            sx={{ mb: 3 }}
          />

          {predictions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Chưa có prediction nào
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Prediction ID</strong></TableCell>
                      <TableCell><strong>Customer ID</strong></TableCell>
                      <TableCell><strong>Employee ID</strong></TableCell>
                      <TableCell><strong>Trạng thái</strong></TableCell>
                      <TableCell><strong>Kết quả</strong></TableCell>
                      <TableCell><strong>Độ tin cậy</strong></TableCell>
                      <TableCell><strong>Ngày tạo</strong></TableCell>
                      <TableCell><strong>Thao tác</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPredictions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((prediction) => (
                        <TableRow key={prediction.predictionId} hover>
                          <TableCell>{prediction.predictionId || '-'}</TableCell>
                          <TableCell>{prediction.customerId || '-'}</TableCell>
                          <TableCell>{prediction.employeeId || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(prediction.status)}
                              color={getStatusColor(prediction.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {prediction.status === 'COMPLETED' ? (
                              <Chip
                                label={getResultLabel(prediction.predictionResult)}
                                color={getResultColor(prediction.predictionResult)}
                                size="small"
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {prediction.confidence !== null && prediction.confidence !== undefined
                              ? `${(prediction.confidence * 100).toFixed(2)}%`
                              : '-'}
                          </TableCell>
                          <TableCell>{formatDate(prediction.createdAt)}</TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              color="primary"
                              component={Link}
                              to={`/predictions/${prediction.predictionId}`}
                              size="small"
                              startIcon={<VisibilityIcon />}
                            >
                              Xem
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredPredictions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số dòng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
              />
            </>
          )}
        </>
      )}

      {/* Tab Content: Approved Customers */}
      {activeTab === 1 && (
        <CustomerListTable
          customers={approvedCustomers}
          title="Khách hàng đã chấp nhận cho vay"
        />
      )}

      {/* Tab Content: Rejected Customers */}
      {activeTab === 2 && (
        <CustomerListTable
          customers={rejectedCustomers}
          title="Khách hàng đã từ chối cho vay"
        />
      )}

      {/* Tab Content: Pending Customers */}
      {activeTab === 3 && (
        <CustomerListTable
          customers={pendingCustomers}
          title="Khách hàng đang chờ xử lý"
        />
      )}
    </Container>
  );
}

/**
 * Component hiển thị danh sách customers
 */
function CustomerListTable({ customers, title }) {
  const formatCurrency = (value) => {
    if (value == null) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (customers.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Chưa có khách hàng nào
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Họ tên</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Tuổi</strong></TableCell>
            <TableCell><strong>Thu nhập</strong></TableCell>
            <TableCell><strong>Ngày tạo</strong></TableCell>
            <TableCell><strong>Thao tác</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.customerId} hover>
              <TableCell>{customer.fullName || '-'}</TableCell>
              <TableCell>{customer.email || '-'}</TableCell>
              <TableCell>{customer.age || '-'}</TableCell>
              <TableCell>{formatCurrency(customer.income)}</TableCell>
              <TableCell>{formatDate(customer.createdAt)}</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/customers/${customer.customerId}`}
                  size="small"
                >
                  Xem chi tiết
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default RiskDashboardPage;

