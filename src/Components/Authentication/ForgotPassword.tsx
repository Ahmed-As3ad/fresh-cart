import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Snackbar } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setSnackbarMessage('الرجاء إدخال البريد الإلكتروني');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('https://ecommerce.routemisr.com/api/v1/auth/forgotPasswords', {
        email,
      });


      setSnackbarMessage('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setOpenSnackbar(true);

      navigate('/verify-code');
    } catch (error) {
      setSnackbarMessage('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ textAlign: 'center', marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
          نسيت كلمة المرور
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          أدخل بريدك الإلكتروني لتلقي رابط إعادة تعيين كلمة المرور.
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
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={loading}
          >
            {loading ? 'جاري الإرسال...' : 'إرسال'}
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

export default ForgotPassword;
