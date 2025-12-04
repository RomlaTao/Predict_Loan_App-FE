import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getApprovedCustomers, getRejectedCustomers, getPendingCustomers } from '../../services/customerService';
import {
  getAnalystics,
  getAnalysticStatOverview,
  getEmployeePredictionCounts,
  getAnalysticStatByDateRange
} from '../../services/analyticsService';
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
  IconButton,
  Popover,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Visibility as VisibilityIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import * as d3 from 'd3';

/**
 * RiskDashboardPage - Dashboard cho RISK_ANALYST
 * Xem tất cả predictions và customers theo status
 */
function RiskDashboardPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Predictions / analytics data
  const [predictions, setPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Analytics stat data
  const [stat, setStat] = useState({
    totalPredictions: 0,
    totalAcceptedPredictions: 0,
    totalRejectedPredictions: 0,
  });
  const [employeePredictionCounts, setEmployeePredictionCounts] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [statRangeLoading, setStatRangeLoading] = useState(false);
  const [dateFilterAnchorEl, setDateFilterAnchorEl] = useState(null);
  const isDateFilterOpen = Boolean(dateFilterAnchorEl);
  const [employeeFilterAnchorEl, setEmployeeFilterAnchorEl] = useState(null);
  const isEmployeeFilterOpen = Boolean(employeeFilterAnchorEl);
  const [employeeFilter, setEmployeeFilter] = useState({
    limit: 5,
    sortBy: 'total', // total, accepted, rejected
  });

  // Customers data
  const [approvedCustomers, setApprovedCustomers] = useState([]);
  const [rejectedCustomers, setRejectedCustomers] = useState([]);
  const [pendingCustomers, setPendingCustomers] = useState([]);

  // Ref cho donut chart
  const donutChartRef = useRef(null);
  // Ref cho bar chart Top 5 employee
  const barChartRef = useRef(null);

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

  const applyStatData = (statData) => {
    if (!statData) return;
    setStat({
      totalPredictions: statData.totalPredictions ?? 0,
      totalAcceptedPredictions: statData.totalAcceptedPredictions ?? 0,
      totalRejectedPredictions: statData.totalRejectedPredictions ?? 0,
    });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch analytics predictions data từ analysticservice
      const [predictionsData, statData, employeeCounts] = await Promise.all([
        getAnalystics(),
        getAnalysticStatOverview(),
        getEmployeePredictionCounts(),
      ]);
      setPredictions(predictionsData || []);
      setFilteredPredictions(predictionsData || []);
      applyStatData(statData);
      setEmployeePredictionCounts(employeeCounts || []);

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

  const handleOpenDateFilter = (event) => {
    setDateFilterAnchorEl(event.currentTarget);
  };

  const handleCloseDateFilter = () => {
    setDateFilterAnchorEl(null);
  };

  const handleDateRangeChange = (field) => (event) => {
    const value = event.target.value;
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenEmployeeFilter = (event) => {
    setEmployeeFilterAnchorEl(event.currentTarget);
  };

  const handleCloseEmployeeFilter = () => {
    setEmployeeFilterAnchorEl(null);
  };

  const handleEmployeeFilterChange = (field) => (event) => {
    const value = event.target.value;
    setEmployeeFilter((prev) => ({
      ...prev,
      [field]: field === 'limit' ? Math.max(parseInt(value, 10) || 1, 1) : value,
    }));
  };

  const handleResetEmployeeFilter = () => {
    setEmployeeFilter({ limit: 5, sortBy: 'total' });
    handleCloseEmployeeFilter();
  };

  const handleApplyDateRange = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc');
      return;
    }

    setStatRangeLoading(true);
    try {
      const statData = await getAnalysticStatByDateRange(dateRange.startDate, dateRange.endDate);
      applyStatData(statData);
      handleCloseDateFilter();
    } catch (err) {
      console.error('Error fetching stat by date range:', err);
      setError(err.message || 'Không thể tải thống kê theo khoảng ngày đã chọn');
    } finally {
      setStatRangeLoading(false);
    }
  };

  const handleResetDateRange = async () => {
    if (!dateRange.startDate && !dateRange.endDate) return;

    setDateRange({ startDate: '', endDate: '' });
    setStatRangeLoading(true);
    try {
      const statData = await getAnalysticStatOverview();
      applyStatData(statData);
      handleCloseDateFilter();
    } catch (err) {
      console.error('Error resetting stat overview:', err);
      setError(err.message || 'Không thể tải lại thống kê tổng quan');
    } finally {
      setStatRangeLoading(false);
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

  const getResultLabel = (result) => {
    if (result === null || result === undefined) return '-';
    return result ? 'Chấp nhận' : 'Từ chối';
  };

  const getResultColor = (result) => {
    if (result === null || result === undefined) return 'default';
    return result ? 'success' : 'error';
  };

  // Vẽ bar chart Top 5 nhân viên với số dự đoán accepted / rejected
  useEffect(() => {
    if (!barChartRef.current) return;

    const container = barChartRef.current;
    d3.select(container).selectAll('*').remove();

    if (!employeePredictionCounts || employeePredictionCounts.length === 0) {
      d3.select(container)
        .append('div')
        .style('text-align', 'center')
        .style('color', '#666')
        .style('margin-top', '16px')
        .text('Chưa có dữ liệu để hiển thị');
      return;
    }

    const data = [...employeePredictionCounts]
      .map(item => ({
        employeeId: item.employeeId || 'N/A',
        acceptedCount: item.acceptedCount ?? 0,
        rejectedCount: item.rejectedCount ?? 0,
      }))
      .sort((a, b) => {
        const metric = employeeFilter.sortBy;
        const getValue = (entry) => {
          switch (metric) {
            case 'accepted':
              return entry.acceptedCount;
            case 'rejected':
              return entry.rejectedCount;
            default:
              return entry.acceptedCount + entry.rejectedCount;
          }
        };
        return d3.descending(getValue(a), getValue(b));
      })
      .slice(0, employeeFilter.limit || 5);

    if (data.length === 0) {
      d3.select(container)
        .append('div')
        .style('text-align', 'center')
        .style('color', '#666')
        .style('margin-top', '16px')
        .text('Chưa có dữ liệu nhân viên để hiển thị');
      return;
    }

    const rect = container.getBoundingClientRect();
    const width = rect.width || 500;
    const height = rect.height || 300;

    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 40;
    const marginLeft = 60;

    const x0 = d3
      .scaleBand()
      .domain(data.map(d => String(d.employeeId)))
      .rangeRound([marginLeft, width - marginRight])
      .paddingInner(0.2);

    const subgroups = ['acceptedCount', 'rejectedCount'];
    const x1 = d3
      .scaleBand()
      .domain(subgroups)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.15);

    const maxValue = d3.max(data, d => Math.max(d.acceptedCount, d.rejectedCount)) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxValue])
      .nice()
      .rangeRound([height - marginBottom, marginTop]);

    const color = d3
      .scaleOrdinal()
      .domain(subgroups)
      .range(['#4CAF50', '#F44336']);

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    const groups = svg
      .append('g')
      .selectAll('g')
      .data(data)
      .join('g')
      .attr('transform', d => `translate(${x0(String(d.employeeId))},0)`);

    groups
      .selectAll('rect')
      .data(d => subgroups.map(key => ({ key, value: d[key], employeeId: d.employeeId })))
      .join('rect')
      .attr('x', d => x1(d.key))
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => y(0) - y(d.value))
      .attr('fill', d => color(d.key))
      .append('title')
      .text(d => `Employee ${d.employeeId} - ${d.key === 'acceptedCount' ? 'Accepted' : 'Rejected'}: ${d.value}`);

    // Trục X (employee)
    svg
      .append('g')
      .attr('transform', `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x0))
      .selectAll('text')
      .style('font-size', '10px')
      .style('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.15em')
      .attr('transform', 'rotate(-20)');

    // Trục Y (số lần predict) - dùng tick nguyên để tránh lặp nhãn
    const yTicks = d3.range(0, (maxValue || 0) + 1);
    svg
      .append('g')
      .attr('transform', `translate(${marginLeft},0)`)
      .call(
        d3.axisLeft(y)
          .tickValues(yTicks)
          .tickFormat(d3.format('d'))
      )
      .call(g => g.selectAll('.domain').remove());

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - marginRight - 140}, ${marginTop})`);

    subgroups.forEach((key, index) => {
      const legendRow = legend.append('g').attr('transform', `translate(0, ${index * 20})`);
      legendRow
        .append('rect')
        .attr('x', 0)
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', color(key))
        .attr('rx', 2);

      legendRow
        .append('text')
        .attr('x', 18)
        .attr('y', 10)
        .style('font-size', '12px')
        .text(key === 'acceptedCount' ? 'Chấp nhận' : 'Từ chối');
    });
  }, [employeePredictionCounts, employeeFilter]);

  // Vẽ donut chart bằng d3 khi stat thay đổi (kích thước theo container)
  useEffect(() => {
    if (!donutChartRef.current) return;

    const data = [
      { label: 'Đã chấp nhận', value: stat.totalAcceptedPredictions },
      { label: 'Đã từ chối', value: stat.totalRejectedPredictions },
      {
        label: 'Đang chờ',
        value: Math.max(
          stat.totalPredictions - stat.totalAcceptedPredictions - stat.totalRejectedPredictions,
          0
        ),
      },
    ].filter(d => d.value > 0);

    const container = donutChartRef.current;
    d3.select(container).selectAll('*').remove();

    // Lấy kích thước thực tế của container (phụ thuộc card cha)
    const rect = container.getBoundingClientRect();
    const containerWidth = rect.width || 200;
    const containerHeight = rect.height || containerWidth;
    const size = Math.min(containerWidth, containerHeight);

    if (data.length === 0) {
      d3.select(container)
        .append('div')
        .style('text-align', 'center')
        .style('color', '#666')
        .text('Chưa có dữ liệu để vẽ biểu đồ');
      return;
    }

    const width = size;
    const height = size;
    const outerRadius = size / 2 - 8;
    const innerRadius = outerRadius * 0.6;

    const color = d3.scaleOrdinal()
      .domain(['Chấp nhận', 'Từ chối'])
      .range(d3.schemeTableau10);

    const svg = d3
      .select(container)
      .append('svg')
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    const arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    const pie = d3
      .pie()
      .sort(null)
      .value(d => d.value);

    svg
      .selectAll('path')
      .data(pie(data))
      .join('path')
      .attr('fill', d => color(d.data.label))
      .attr('d', arc)
      .append('title')
      .text(d => `${d.data.label}: ${d.data.value}`);
  }, [stat]);

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
    <Container maxWidth="lg" sx={{}}>
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

      {/* Dashboard Top Section: Charts + Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="center" justifyContent="center">
        
        {/* LEFT: Donut Chart Box */}
        <Grid item xs={12} md={6} sx={{ height: '100%', width: '33%' }}>
          <Card sx={{ height: '100%', minHeight: 300 }}>
            <CardContent sx={{ position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Tỷ lệ kết quả dự đoán
                </Typography>
                <IconButton color="primary" onClick={handleOpenDateFilter} size="small" aria-label="Lọc theo ngày">
                  <FilterListIcon />
                </IconButton>
              </Box>
              <Popover
                open={isDateFilterOpen}
                anchorEl={dateFilterAnchorEl}
                onClose={handleCloseDateFilter}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{ sx: { p: 2, width: 280 } }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Ngày bắt đầu"
                    type="date"
                    size="small"
                    value={dateRange.startDate}
                    onChange={handleDateRangeChange('startDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Ngày kết thúc"
                    type="date"
                    size="small"
                    value={dateRange.endDate}
                    onChange={handleDateRangeChange('endDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={handleResetDateRange}
                      disabled={statRangeLoading || (!dateRange.startDate && !dateRange.endDate)}
                    >
                      Xóa lọc
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleApplyDateRange}
                      disabled={statRangeLoading}
                    >
                      {statRangeLoading ? 'Đang tải...' : 'Áp dụng'}
                    </Button>
                  </Box>
                </Box>
              </Popover>

              {/* Donut Chart using d3 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: 300,
                  px: 2,
                  py: 1.5,
                  columnGap: 4
                }}
              >
                {/* Donut SVG */}
                <Box
                ref={donutChartRef}
                sx={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  flexDirection: 'column',
                  '& svg': {
                    width: '100%',
                    height: '100%',
                  },
                }}
              />

                {/* Legend */}
                <Box sx={{ width: '50%', display: 'flex', flexDirection: 'column', gap: 1, marginRight: '2px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: '#4CAF50' }} />
                      <Typography sx={{ fontSize: '14px' }}>Chấp nhận:</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '14px', marginLeft: '24px' }}>{stat.totalAcceptedPredictions}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 14, height: 14, borderRadius: '3px', bgcolor: '#F44336' }} />
                      <Typography sx={{ fontSize: '14px' }}>Từ chối:</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '14px', marginLeft: '24px' }}>{stat.totalRejectedPredictions}</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: Bar Chart Top 5 Employee */}
        <Grid item xs={12} md={6} sx={{ height: '100%', width: '63%' }}>
          <Card sx={{ height: '100%', minHeight: 360 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" fontWeight={600}>
                  Top nhân viên dự đoán nhiều nhất
                </Typography>
                <IconButton color="primary" size="small" onClick={handleOpenEmployeeFilter} aria-label="Lọc biểu đồ nhân viên">
                  <FilterListIcon />
                </IconButton>
              </Box>
              <Popover
                open={isEmployeeFilterOpen}
                anchorEl={employeeFilterAnchorEl}
                onClose={handleCloseEmployeeFilter}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { p: 2, width: 280 } }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Số nhân viên hiển thị"
                    type="number"
                    size="small"
                    value={employeeFilter.limit}
                    onChange={handleEmployeeFilterChange('limit')}
                    inputProps={{ min: 1, max: 20 }}
                  />
                  <FormControl size="small">
                    <InputLabel id="employee-sort-by-label">Sắp xếp theo</InputLabel>
                    <Select
                      labelId="employee-sort-by-label"
                      label="Sắp xếp theo"
                      value={employeeFilter.sortBy}
                      onChange={handleEmployeeFilterChange('sortBy')}
                    >
                      <MenuItem value="total">Tổng số dự đoán</MenuItem>
                      <MenuItem value="accepted">Số chấp nhận</MenuItem>
                      <MenuItem value="rejected">Số từ chối</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button size="small" onClick={handleResetEmployeeFilter}>
                      Mặc định
                    </Button>
                    <Button size="small" variant="contained" onClick={handleCloseEmployeeFilter}>
                      Đóng
                    </Button>
                  </Box>
                </Box>
              </Popover>

              <Box
                ref={barChartRef}
                sx={{
                  width: '100%',
                  minHeight: 320,
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  position: 'relative',
                  '& svg': {
                    width: '100%',
                    height: '100%',
                  },
                }}
              />
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
                              label={getStatusLabel(prediction.predictionStatus)}
                              color={getStatusColor(prediction.predictionStatus)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {prediction.predictionStatus === 'COMPLETED' &&
                            prediction.resultLabel !== undefined &&
                            prediction.resultLabel !== null ? (
                              <Chip
                                label={getResultLabel(prediction.resultLabel)}
                                color={getResultColor(prediction.resultLabel)}
                                size="small"
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {prediction.probability !== null && prediction.probability !== undefined
                              ? `${(prediction.probability * 100).toFixed(2)}%`
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

