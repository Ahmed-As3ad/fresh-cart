import { useState } from 'react';
import { TextField, Button, Box, InputAdornment, CircularProgress, Grid, Typography } from '@mui/material';
import { Person, Email, Lock, LockOpen, Phone } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { setIsLogin } from "../../libs/UserToken/userSlice.ts";
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom'; 
import toast from 'react-hot-toast';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().min(3, 'اسم المستخدم قصير').max(15, 'اسم المستخدم طويل').required('اسم المستخدم مطلوب'),
    email: Yup.string().email('البريد الإلكتروني غير صالح').required('البريد الإلكتروني مطلوب'),
    password: Yup.string().min(8, 'كلمة المرور قصيرة').max(20, 'كلمة المرور طويلة').required('كلمة المرور مطلوبة'),
    rePassword: Yup.string().oneOf([Yup.ref('password')], 'كلمة المرور غير متطابقة').required('تأكيد كلمة المرور مطلوب'),
    phone: Yup.string().matches(/^01[0125][0-9]{8}$/, 'رقم الهاتف غير صالح').required('رقم الهاتف مطلوب'),
  });

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', rePassword: '', phone: '' },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await axios.post('https://ecommerce.routemisr.com/api/v1/auth/signup', values);
        if (response.data.message === 'success') {
          dispatch(setIsLogin({ token: response.data.token, userData: response.data.user }));
          localStorage.setItem('userToken', response.data.token);
          toast.success('تم إنشاء الحساب بنجاح!');
          navigate('/');
        } else {
          toast.error('حدث خطأ في التسجيل');
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || 'حدث خطأ في التسجيل');
      }
      setLoading(false);
    },
  });

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', marginTop: '40px', padding: 4, borderRadius: 2, boxShadow: 3, backgroundColor: 'background.paper' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
        إنشاء حساب جديد
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {['name', 'email', 'password', 'rePassword', 'phone'].map((field, index) => (
            <Grid item xs={12} key={index}>
              <TextField
                label={field === 'name' ? 'اسم المستخدم' : field === 'email' ? 'البريد الإلكتروني' : field === 'password' ? 'كلمة المرور' : field === 'rePassword' ? 'تأكيد كلمة المرور' : 'رقم الهاتف'}
                variant="outlined"
                fullWidth
                type={field.includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                name={field}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values[field]}
                error={formik.touched[field] && Boolean(formik.errors[field])}
                helperText={formik.touched[field] && formik.errors[field]}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {field === 'name' ? <Person /> : field === 'email' ? <Email /> : field === 'password' ? <Lock /> : field === 'rePassword' ? <LockOpen /> : <Phone />}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          ))}

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5, fontSize: '1.1rem', borderRadius: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'إنشاء حساب'}
            </Button>
            <Box textAlign="center" mt={1}>
              <Button color="primary" onClick={() => navigate('/login')} sx={{ textTransform: 'none', fontSize: '0.9rem' }}>
                هل لديك حساب؟ سجل دخول الآن
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}