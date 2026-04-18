import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, DialogContentText } from '@mui/material';

export default function ConfirmDialog({ open, title='Confirm', contentText, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => { onConfirm(); }} variant="contained">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
