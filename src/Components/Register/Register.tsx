import { useState } from 'react';
import { TextField, Button, Box, InputAdornment, Alert, CircularProgress, Grid, Typography } from '@mui/material';
import { Person, Email, Lock, LockOpen, Phone } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { setIsLogin } from "../../libs/UserToken/userSlice.ts";
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom'; 

export default function Register({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(3, 'اسم المستخدم قصير')
      .max(15, 'اسم المستخدم طويل')
      .required('اسم المستخدم مطلوب'),
    email: Yup.string()
      .email('البريد الإلكتروني غير صالح')
      .required('البريد الإلكتروني مطلوب'),
    password: Yup.string()
      .min(8, 'كلمة المرور قصيرة')
      .max(20, 'كلمة المرور طويلة')
      .required('كلمة المرور مطلوبة'),
    rePassword: Yup.string()
      .oneOf([Yup.ref('password')], 'كلمة المرور غير متطابقة')
      .required('تأكيد كلمة المرور مطلوب'),
    phone: Yup.string()
      .matches(/^01[0125][0-9]{8}$/, 'رقم الهاتف غير صالح')
      .required('رقم الهاتف مطلوب'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      rePassword: '',
      phone: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setErrorMsg('');
      try {
        const response = await axios.post('https://ecommerce.routemisr.com/api/v1/auth/signup', values);
        if (response.data.message === 'success') {
          dispatch(setIsLogin({
            token: response.data.token,
            userData: response.data.user,
          }));
          setErrorMsg('');
          localStorage.setItem('userToken', response.data.token);
          onClose(); 
          navigate('/'); 
        } else {
          setErrorMsg('حدث خطأ في التسجيل');
        }
      } catch (error) {
        console.log('Error response:', error?.response?.data);
        setErrorMsg(error?.response?.data?.message || 'حدث خطأ في التسجيل');
      }
      setLoading(false);
    },
  });

  return (
    <>
      <Box
        sx={{
          maxWidth: 500,
          margin: 'auto',
          marginTop: '40px',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
          إنشاء حساب جديد
        </Typography>

        {errorMsg && <Alert severity="error" sx={{ mb: 3 }}>{errorMsg}</Alert>}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="اسم المستخدم"
                variant="outlined"
                fullWidth
                name="name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.name}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="البريد الإلكتروني"
                variant="outlined"
                fullWidth
                type="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="كلمة المرور"
                variant="outlined"
                fullWidth
                type="password"
                name="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="تأكيد كلمة المرور"
                variant="outlined"
                fullWidth
                type="password"
                name="rePassword"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.rePassword}
                error={formik.touched.rePassword && Boolean(formik.errors.rePassword)}
                helperText={formik.touched.rePassword && formik.errors.rePassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOpen />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="رقم الهاتف"
                variant="outlined"
                fullWidth
                type="tel"
                name="phone"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phone}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'إنشاء حساب'}
              </Button>

              <Box textAlign="center" mt={1}>
          <Button 
            color="primary" 
            onClick={() => navigate('/login')}
            sx={{ textTransform: 'none', fontSize: '0.9rem' }}
          >
            هل لديك حساب؟ سجل دخول الأن
          </Button>
        </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </>
  );
}
