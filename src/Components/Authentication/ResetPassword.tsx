import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Snackbar } from '@mui/material';
import axios from 'axios';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newPassword) {
      setSnackbarMessage('الرجاء إدخال البريد الإلكتروني وكلمة المرور الجديدة');
      setOpenSnackbar(true);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      setSnackbarMessage('البريد الإلكتروني غير صالح');
      setOpenSnackbar(true);
      return;
    }
    if (newPassword.length < 6) {
      setSnackbarMessage('كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://ecommerce.routemisr.com/api/v1/auth/resetPassword',
        {
          email,
          newPassword,
        }
      );
      
      if (response.status === 200) {
        setSnackbarMessage('تم إعادة تعيين كلمة المرور بنجاح');
      } else {
        setSnackbarMessage('حدث خطأ أثناء إعادة تعيين كلمة المرور. حاول مرة أخرى');
      }
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage('حدث خطأ أثناء إعادة تعيين كلمة المرور. حاول مرة أخرى');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ textAlign: 'center', marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
          إعادة تعيين كلمة المرور
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          أدخل بريدك الإلكتروني وكلمة المرور الجديدة لإعادة تعيين كلمة المرور.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="البريد الإلكتروني"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={handleEmailChange}
            required
            autoFocus
          />

          <TextField
            label="كلمة المرور الجديدة"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={handlePasswordChange}
            required
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={loading}
          >
            {loading ? 'جاري إعادة تعيين كلمة المرور...' : 'إعادة تعيين كلمة المرور'}
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

export default ResetPassword;
