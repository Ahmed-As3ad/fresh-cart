import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Box } from '@mui/material';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const VerifyPassword = () => {
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetCode) {
      toast.error('الرجاء إدخال رمز إعادة التعيين');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://ecommerce.routemisr.com/api/v1/auth/verifyResetCode', { resetCode });

      toast.success('تم التحقق من الرمز بنجاح');
      setTimeout(() => navigate('/reset-password'), 1500);
    } catch (error) {
      toast.error('رمز التحقق غير صحيح أو انتهت صلاحيته. حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Toaster position="top-center" reverseOrder={false} />
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
            onChange={(e) => setResetCode(e.target.value)}
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
      </Box>
    </Container>
  );
};

export default VerifyPassword;
