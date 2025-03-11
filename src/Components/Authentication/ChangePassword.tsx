import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('userToken') || '';

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentPassword(e.target.value);
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleRePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRePassword(e.target.value);
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !rePassword) {
      setSnackbarMessage('الرجاء إدخال جميع الحقول');
      setOpenSnackbar(true);
      return;
    }

    if (newPassword !== rePassword) {
      setSnackbarMessage('كلمة المرور الجديدة غير متطابقة');
      setOpenSnackbar(true);
      return;
    }

    if (!validatePassword(newPassword)) {
      setSnackbarMessage('كلمة المرور الجديدة يجب أن تحتوي على 8 أحرف على الأقل مع أحرف وأرقام');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'https://ecommerce.routemisr.com/api/v1/users/changeMyPassword',
        {
          currentPassword,
          password: newPassword,
          rePassword,
        },
        {
          headers: {
            token: token, 
          },
        }
      );

      setSnackbarMessage('تم تغيير كلمة المرور بنجاح');
    } catch (error) {
      setSnackbarMessage('حدث خطأ أثناء تغيير كلمة المرور. حاول مرة أخرى');
    } finally {
      setOpenSnackbar(true);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ textAlign: 'center', marginTop: 5 }}>
        <Typography variant="h4" gutterBottom>
          تغيير كلمة المرور
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          أدخل كلمة المرور الحالية، كلمة المرور الجديدة، وإعادة كلمة المرور الجديدة لتغيير كلمة المرور.
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="كلمة المرور الحالية"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={currentPassword}
            onChange={handleCurrentPasswordChange}
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
            onChange={handleNewPasswordChange}
            required
          />

          <TextField
            label="إعادة كلمة المرور الجديدة"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={rePassword}
            onChange={handleRePasswordChange}
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
            {loading ? 'جاري تغيير كلمة المرور...' : 'تغيير كلمة المرور'}
          </Button>
        </form>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarMessage.includes('خطأ') ? 'error' : 'success'}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default ChangePassword;
