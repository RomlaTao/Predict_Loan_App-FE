import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEmployees } from '../../services/employeeService';
import { adminSignup } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/rbac';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';

/**
 * EmployeeListPage - Trang danh sách nhân viên (STAFF)
 * Chỉ ADMIN mới có quyền truy cập
 */
function EmployeeListPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Dialog state cho tạo user mới
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserFormData, setCreateUserFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    role: ROLES.STAFF, // Mặc định là STAFF
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset page khi search
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter employees dựa trên search term
  const filteredEmployees = employees.filter((employee) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (employee.fullName?.toLowerCase().includes(searchLower) || '') ||
      (employee.email?.toLowerCase().includes(searchLower) || '') ||
      (employee.department?.toLowerCase().includes(searchLower) || '') ||
      (employee.position?.toLowerCase().includes(searchLower) || '')
    );
  });

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Handler cho dialog tạo user
  const handleOpenCreateUserDialog = () => {
    setOpenCreateUserDialog(true);
    setCreateUserFormData({
      email: '',
      password: '',
      passwordConfirm: '',
      role: ROLES.STAFF,
    });
    setError(null);
  };

  const handleCloseCreateUserDialog = () => {
    setOpenCreateUserDialog(false);
    setError(null);
  };

  const handleCreateUserFormChange = (e) => {
    const { name, value } = e.target;
    setCreateUserFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (createUserFormData.password !== createUserFormData.passwordConfirm) {
      setError('Mật khẩu xác nhận không khớp!');
      setCreatingUser(false);
      return;
    }

    if (createUserFormData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      setCreatingUser(false);
      return;
    }

    try {
      const message = await adminSignup(
        createUserFormData.email,
        createUserFormData.password,
        createUserFormData.passwordConfirm,
        createUserFormData.role
      );

      setSuccessMessage(message || 'Tạo user thành công!');
      handleCloseCreateUserDialog();
      
      // Refresh danh sách employees sau khi tạo user thành công
      await fetchEmployees();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'Không thể tạo user. Vui lòng thử lại.');
    } finally {
      setCreatingUser(false);
    }
  };

  if (loading && employees.length === 0) {
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
    <Box sx={{ mt: 4, mb: 4, width: '100%', px: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Danh Sách Nhân Viên
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenCreateUserDialog}
          startIcon={<AddIcon />}
          sx={{ 
            ml: 2,
            borderColor: 'primary.dark',
            color: 'white.main',
            fontSize: '16px',
            padding: '12px 32px',
            minWidth: '120px',
            textTransform: 'uppercase',
            bgcolor: 'primary.main',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'primary.light',
            }
          }}
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

      <TextField
        label="Tìm kiếm nhân viên..."
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        fullWidth
        sx={{ mb: 3 }}
      />

      {employees.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Chưa có nhân viên nào
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
            <Table sx={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center"><strong>Email</strong></TableCell>
                  <TableCell align="center"><strong>Họ tên</strong></TableCell>
                  <TableCell align="center"><strong>Phòng ban</strong></TableCell>
                  <TableCell align="center"><strong>Chức vụ</strong></TableCell>
                  <TableCell align="center"><strong>Trạng thái</strong></TableCell>
                  <TableCell align="center"><strong>Thao tác</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee) => (
                    <TableRow key={employee.userId || employee.id} hover align="center">
                      <TableCell align="center">{employee.email || '-'}</TableCell>
                      <TableCell align="center">
                        {employee.fullName || (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            Chưa cập nhật
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">{employee.department || '-'}</TableCell>
                      <TableCell align="center">{employee.position || '-'}</TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          color={employee.isActive ? 'success.main' : 'error.main'}
                          fontWeight={500}
                        >
                          {employee.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/admin/employees/${employee.userId}`)}
                          title="Chỉnh sửa"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Số dòng mỗi trang:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
          />
        </>
      )}

      {/* Dialog tạo user mới */}
      <Dialog 
        open={openCreateUserDialog} 
        onClose={handleCloseCreateUserDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <form onSubmit={handleCreateUserSubmit}>
          <DialogTitle>Tạo User Mới</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={createUserFormData.email}
                  onChange={handleCreateUserFormChange}
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
                  value={createUserFormData.password}
                  onChange={handleCreateUserFormChange}
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
                  value={createUserFormData.passwordConfirm}
                  onChange={handleCreateUserFormChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Role"
                  name="role"
                  value={createUserFormData.role}
                  onChange={handleCreateUserFormChange}
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
            <Button onClick={handleCloseCreateUserDialog} disabled={creatingUser}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creatingUser}
              startIcon={creatingUser ? <CircularProgress size={20} /> : null}
            >
              {creatingUser ? 'Đang tạo...' : 'Tạo User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default EmployeeListPage;

