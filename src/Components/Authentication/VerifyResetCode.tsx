import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Snackbar } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VerifyPassword = () => {
  const [resetCode, setResetCode] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetCode(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetCode) {
      setSnackbarMessage('الرجاء إدخال رمز إعادة التعيين');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://ecommerce.routemisr.com/api/v1/auth/verifyResetCode', {
        resetCode,
      });

      setSnackbarMessage('تم التحقق من الرمز بنجاح');
      setOpenSnackbar(true);
      navigate('/reset-password');
    } catch (error) {
      setSnackbarMessage('حدث خطأ أثناء التحقق من الرمز. حاول مرة أخرى');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ textAlign: 'center', marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
          التحقق من رمز إعادة التعيين
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          أدخل رمز إعادة التعيين الذي تم إرساله إلى بريدك الإلكتروني.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="رمز إعادة التعيين"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            value={resetCode}
            onChange={handleCodeChange}
            required
            autoFocus
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={loading}
          >
            {loading ? 'جاري التحقق...' : 'تحقق'}
          </Button>
        </form>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
};

export default VerifyPassword;
