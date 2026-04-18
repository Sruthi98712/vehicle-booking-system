import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControlLabel, Switch, Box,
  InputAdornment, Typography, Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  DirectionsCar, DateRange, Badge,
  AttachMoney, Description
} from '@mui/icons-material';
import api from '../api';


export default function VehicleForm({ open, onClose, onSaved, editing }) {
  const [form, setForm] = useState({
    make: '', model: '', year: '', licensePlate: '', rentalPricePerDay: '', available: true, type: 'car'
  });

  const vehicleTypes = ['car', 'bike', 'auto', 'van', 'truck', 'tractor', 'bus', 'cycle'];

  useEffect(() => {
    if (editing) {
      setForm({
        make: editing.make || '',
        model: editing.model || '',
        year: editing.year || '',
        licensePlate: editing.licensePlate || '',
        rentalPricePerDay: editing.rentalPricePerDay || '',
        available: editing.available === undefined ? true : editing.available,
        type: editing.type || 'car'
      });
    } else {
      setForm({ make: '', model: '', year: '', licensePlate: '', rentalPricePerDay: '', available: true, type: 'car' });
    }
  }, [editing, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const payload = {
        ...form,
        year: Number(form.year),
        rentalPricePerDay: Number(form.rentalPricePerDay),
        ownerId: editing ? editing.ownerId : user?._id // Assign current user as owner on creation
      };

      if (editing) {
        await api.put(`/v1/vehicles/${editing._id}`, payload);
      } else {
        await api.post('/v1/vehicles', payload);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err.message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, width: '100%', maxWidth: 500 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }} component="div">
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {editing ? 'Edit Vehicle' : 'Add New Vehicle'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the details below to {editing ? 'update' : 'register'} a vehicle in the fleet.
        </Typography>
      </DialogTitle>
      <Divider sx={{ mx: 3 }} />
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
          <TextField
            label="Make"
            name="make"
            value={form.make}
            onChange={handleChange}
            placeholder="e.g. Tesla"
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><DirectionsCar fontSize="small" /></InputAdornment> }}
          />
          <TextField
            label="Model"
            name="model"
            value={form.model}
            onChange={handleChange}
            placeholder="e.g. Model S"
            fullWidth
          />
          <TextField
            label="Year"
            name="year"
            value={form.year}
            onChange={handleChange}
            type="number"
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><DateRange fontSize="small" /></InputAdornment> }}
          />
          <TextField
            label="License Plate"
            name="licensePlate"
            value={form.licensePlate}
            onChange={handleChange}
            placeholder="ABC-1234"
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><Badge fontSize="small" /></InputAdornment> }}
          />
          <TextField
            label="Price per Day"
            name="rentalPricePerDay"
            value={form.rentalPricePerDay}
            onChange={handleChange}
            type="number"
            fullWidth
            sx={{ gridColumn: 'span 2' }}
            InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney fontSize="small" /></InputAdornment> }}
          />
          <FormControl fullWidth sx={{ gridColumn: 'span 2' }}>
            <InputLabel>Vehicle Category</InputLabel>
            <Select
              name="type"
              value={form.type}
              label="Vehicle Category"
              onChange={handleChange}
            >
              {vehicleTypes.map(t => (
                <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ gridColumn: 'span 2', bgcolor: 'action.hover', p: 1.5, borderRadius: 2 }}>
            <FormControlLabel
              control={<Switch checked={form.available} onChange={(e) => setForm(f => ({ ...f, available: e.target.checked }))} />}
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Set as Available for Rent</Typography>}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ px: 4, borderRadius: 2 }}>
          {editing ? 'Save Changes' : 'Add Vehicle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
