import React, { useEffect, useState } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, Paper, Switch, Typography, Chip, Tooltip,
  Card, CardContent, InputAdornment, TextField, Avatar,
  Grid, Slider, FormControl, InputLabel, Select, MenuItem, Collapse, Pagination
} from '@mui/material';
import {
  Edit, Delete, Add, Search,
  DirectionsCar, Event, LocalOffer,
  HistoryEdu, MoreVert, FilterList, CleaningServices,
  Favorite, FavoriteBorder
} from '@mui/icons-material';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import VehicleForm from './VehicleForm';
import ConfirmDialog from './ConfirmDialog';
import RatingDisplay from './RatingDisplay';


export default function VehicleList({ initialCity = '', initialType = '' }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedVehicles, setSavedVehicles] = useState([]);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    city: initialCity,
    type: initialType,
    minPrice: '',
    maxPrice: '',
    rating: '',
    available: 'true', // Default to available for better browsing experience
    sortBy: 'newest'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 10 };
      // Remove empty filters
      Object.keys(params).forEach(key => params[key] === '' && delete params[key]);

      const res = await api.get('/v1/vehicles/search', { params });

      if (res.data && res.data.success && Array.isArray(res.data.data.vehicles)) {
        setVehicles(res.data.data.vehicles);
        setTotalPages(res.data.data.pages);
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedVehicles = async () => {
    if (!user) return;
    try {
      const res = await api.get('/v1/dashboard/customer');
      setSavedVehicles(res.data.data.savedVehicles.map(v => v._id));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchVehicles();
    fetchSavedVehicles();
  }, [page, filters]);

  const handleToggleSave = async (id) => {
    try {
      await api.post(`/v1/users/toggle-save/${id}`);
      setSavedVehicles(prev =>
        prev.includes(id) ? prev.filter(vid => vid !== id) : [...prev, id]
      );
    } catch (err) { console.error('Error toggling save', err); }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      available: '',
      sortBy: 'newest'
    });
    setPage(1);
  };

  const handleAdd = () => { setEditing(null); setOpenForm(true); };
  const handleEdit = (v) => { setEditing(v); setOpenForm(true); };
  const handleDelete = (id) => { setConfirm({ open: true, id }); };

  const confirmDelete = async (id) => {
    try {
      await api.delete(`/v1/vehicles/${id}`);
      setConfirm({ open: false, id: null });
      fetchVehicles();
    } catch (err) { console.error(err); }
  };

  const toggleAvailable = async (v) => {
    try {
      await api.put(`/v1/vehicles/${v._id}`, { ...v, available: !v.available });
      fetchVehicles();
    } catch (err) { console.error(err); }
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleBook = (id) => {
    navigate(`/book/${id}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Vehicles</Typography>
        {user && (user.role === 'admin' || user.role === 'vendor') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
            sx={{ borderRadius: 2, px: 3 }}
          >
            Add Vehicle
          </Button>
        )}
      </Box>

      {/* Filter Components */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: showFilters ? 2 : 0 }}>
            <Button
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <TextField
              placeholder="Search by car name or city..."
              size="small"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              sx={{ width: 350 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Collapse in={showFilters}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select name="type" value={filters.type} label="Type" onChange={handleFilterChange}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="SUV">SUV</MenuItem>
                    <MenuItem value="Sedan">Sedan</MenuItem>
                    <MenuItem value="Hatchback">Hatchback</MenuItem>
                    <MenuItem value="Luxury">Luxury</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Min Price"
                  name="minPrice"
                  type="number"
                  size="small"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Max Price"
                  name="maxPrice"
                  type="number"
                  size="small"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Availability</InputLabel>
                  <Select name="available" value={filters.available} label="Availability" onChange={handleFilterChange}>
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="true">Available Now</MenuItem>
                    <MenuItem value="false">On Rent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select name="sortBy" value={filters.sortBy} label="Sort By" onChange={handleFilterChange}>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="price_asc">Price: Low to High</MenuItem>
                    <MenuItem value="price_desc">Price: High to Low</MenuItem>
                    <MenuItem value="rating">Rating</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button startIcon={<CleaningServices />} onClick={clearFilters} color="inherit" size="small">
                Clear Filters
              </Button>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Vehicle Information</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Year</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>License Plate</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Daily Rate</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.length > 0 ? vehicles.map(v => (
              <TableRow key={v._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 40, height: 40 }}>
                      <DirectionsCar fontSize="small" />
                    </Avatar>
                    <Box sx={{ mr: 1 }}>
                      {user && user.role === 'customer' && (
                        <IconButton
                          size="small"
                          onClick={() => handleToggleSave(v._id)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            bgcolor: 'rgba(255,255,255,0.8)',
                            '&:hover': { bgcolor: 'white' },
                            zIndex: 1
                          }}
                        >
                          {savedVehicles.includes(v._id) ? <Favorite color="error" fontSize="small" /> : <FavoriteBorder fontSize="small" />}
                        </IconButton>
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>{v.make} {v.model}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {v.city ? v.city : 'Standard Location'}
                        </Typography>
                        {v.averageRating > 0 && <RatingDisplay rating={v.averageRating} totalRatings={v.totalReviews} size="small" />}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Event fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">{v.year}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                    {v.licensePlate}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    ${v.rentalPricePerDay}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={v.available ? 'Available' : 'On Rent'}
                    size="small"
                    color={v.available ? 'success' : 'error'}
                    variant="soft"
                    sx={{
                      fontWeight: 700,
                      borderRadius: 1.5,
                      bgcolor: v.available ? 'success.light' : 'error.light',
                      color: v.available ? 'success.dark' : 'error.dark',
                      opacity: 0.8
                    }}
                  />
                  {user && (user.role === 'admin' || user.role === 'vendor') && (
                    <Switch
                      size="small"
                      checked={v.available}
                      onChange={() => toggleAvailable(v)}
                      sx={{ ml: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {user && (user.role === 'admin' || user.role === 'vendor') ? (
                    <>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(v)} sx={{ mr: 1, color: 'primary.main' }}><Edit fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(v._id)} sx={{ color: 'error.main' }}><Delete fontSize="small" /></IconButton>
                      </Tooltip>
                    </>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleBook(v._id)}
                      disabled={!v.available}
                      sx={{ borderRadius: 2 }}
                    >
                      Book Now
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">No vehicles found matching your criteria.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
          shape="rounded"
        />
      </Box>

      <VehicleForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={() => { setOpenForm(false); fetchVehicles(); }}
        editing={editing}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Delete vehicle?"
        contentText="Are you sure you want to delete this vehicle? This action cannot be undone."
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={() => confirmDelete(confirm.id)}
      />
    </Box>
  );
}
