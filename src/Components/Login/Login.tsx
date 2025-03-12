import { TextField, Button, Container, Typography, CircularProgress, Box, InputAdornment } from '@mui/material';
import { AccountCircle, Lock } from '@mui/icons-material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux'; 
import { setIsLogin } from '../../libs/UserToken/userSlice.ts'; 
import toast from 'react-hot-toast';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('البريد الإلكتروني غير صالح')
      .required('البريد الإلكتروني مطلوب'),
    password: Yup.string()
      .min(8, 'كلمة المرور قصيرة (8 أحرف على الأقل)')
      .max(20, 'كلمة المرور طويلة (20 حرف كحد أقصى)')
      .required('كلمة المرور مطلوبة'),
  });

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const { data } = await axios.post('https://ecommerce.routemisr.com/api/v1/auth/signin', values);
        
        if (data.message === 'success') {
          dispatch(setIsLogin({ token: data.token, userData: data.user }));
          
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userData', JSON.stringify(data.user));

          toast.success('تم تسجيل الدخول بنجاح!');
          navigate('/');
        }
      } catch (error) {
        const err = error as Error;
        toast.error(err.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container maxWidth="sm" sx={{ 
      mt: 8,
      p: 4,
      bgcolor: 'background.paper',
      borderRadius: 3,
      boxShadow: 3,
      minHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        تسجيل الدخول
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          label="البريد الإلكتروني"
          variant="outlined"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          type="password"
          label="كلمة المرور"
          variant="outlined"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 4 }}
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          size="large"
          sx={{ 
            py: 1.5,
            fontSize: '1.1rem',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'تسجيل الدخول'}
        </Button>

        <Box textAlign="center" mt={3}>
          <Button 
            color="primary" 
            onClick={() => navigate('/register')}
            sx={{ textTransform: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            ليس لديك حساب؟ سجل الآن
          </Button>
        </Box>
        
        <Box textAlign="center">
          <Button 
            color="primary" 
            onClick={() => navigate('/forgot-Password')}
            sx={{ textTransform: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            هل نسيت كلمة السر؟ استرجع الحساب الآن
          </Button>
        </Box>
      </form>
    </Container>
  );
}
