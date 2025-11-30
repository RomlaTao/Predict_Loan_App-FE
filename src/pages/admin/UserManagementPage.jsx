import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminSignup } from '../../services/authService';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { ROLES } from '../../utils/rbac';

/**
 * UserManagementPage - Trang quản lý users (tạo account với email/password/role)
 * Chỉ ADMIN mới có quyền truy cập
 */
function UserManagementPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    role: ROLES.STAFF, // Mặc định là STAFF
  });

  // Danh sách users (có thể fetch từ API sau)
  const [users, setUsers] = useState([]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFormData({
      email: '',
      password: '',
      passwordConfirm: '',
      role: ROLES.STAFF,
    });
    setError(null);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError(null);
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
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (formData.password !== formData.passwordConfirm) {
      setError('Mật khẩu xác nhận không khớp!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      setLoading(false);
      return;
    }

    try {
      const message = await adminSignup(
        formData.email,
        formData.password,
        formData.passwordConfirm,
        formData.role
      );

      setSuccessMessage(message || 'Tạo user thành công!');
      handleCloseDialog();

      // Có thể fetch lại danh sách users ở đây
      // await fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'Không thể tạo user. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return 'Admin';
      case ROLES.STAFF:
        return 'Nhân viên';
      case ROLES.RISK_ANALYST:
        return 'Phân tích rủi ro';
      default:
        return role;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={Link}
            to="/admin/employees"
            startIcon={<ArrowBackIcon />}
            variant="outlined"
          >
            Quản lý nhân viên
          </Button>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Quản Lý Users
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Tạo User Mới
        </Button>
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

      {/* Danh sách users - có thể fetch từ API sau */}
      {users.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Trạng thái</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleLabel(user.role)}</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Chưa có users nào. Click "Tạo User Mới" để bắt đầu.
          </Typography>
        </Paper>
      )}

      {/* Dialog tạo user mới */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Tạo User Mới</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  helperText="Tối thiểu 6 ký tự"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Xác nhận mật khẩu"
                  name="passwordConfirm"
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  fullWidth
                >
                  <MenuItem value={ROLES.STAFF}>Nhân viên (STAFF)</MenuItem>
                  <MenuItem value={ROLES.RISK_ANALYST}>Phân tích rủi ro (RISK_ANALYST)</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Đang tạo...' : 'Tạo User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}

export default UserManagementPage;

