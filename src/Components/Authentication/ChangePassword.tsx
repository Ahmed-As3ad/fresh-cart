import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('userToken') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !rePassword) {
      toast.error('الرجاء إدخال جميع الحقول');
      return;
    }

    if (newPassword !== rePassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      toast.error('كلمة المرور الجديدة يجب أن تحتوي على 8 أحرف على الأقل مع أحرف وأرقام');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        'https://ecommerce.routemisr.com/api/v1/users/changeMyPassword',
        { currentPassword, password: newPassword, rePassword },
        { headers: { token: `${token}` } }
      );

      toast.success('تم تغيير كلمة المرور بنجاح');
      setCurrentPassword('');
      setNewPassword('');
      setRePassword('');
    } catch (error) {
      toast.error('حدث خطأ أثناء تغيير كلمة المرور. حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Toaster position="top-center" reverseOrder={false} />
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
            onChange={(e) => setCurrentPassword(e.target.value)}
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
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <TextField
            label="إعادة كلمة المرور الجديدة"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={rePassword}
            onChange={(e) => setRePassword(e.target.value)}
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
      </Box>
    </Container>
  );
};

export default ChangePassword;
