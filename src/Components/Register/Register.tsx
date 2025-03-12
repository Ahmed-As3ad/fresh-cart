import { useState } from 'react';
import { TextField, Button, Box, InputAdornment, CircularProgress, Grid, Typography } from '@mui/material';
import { Person, Email, Lock, LockOpen, Phone } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { setIsLogin } from "../../libs/UserToken/userSlice.ts";
import axios from 'axios';
import { useFormik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom'; 
import toast from 'react-hot-toast';

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  phone: string;
}

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

  const formik = useFormik<RegisterFormValues>({
    initialValues: { name: '', email: '', password: '', rePassword: '', phone: '' },
    validationSchema,
    onSubmit: async (values: RegisterFormValues, { setSubmitting }: FormikHelpers<RegisterFormValues>) => {
      setLoading(true);
      try {
        const { data } = await axios.post('https://ecommerce.routemisr.com/api/v1/auth/signup', values);
        
        if (data.message === 'success') {
          dispatch(setIsLogin({ token: data.token, userData: data.user }));
          
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userData', JSON.stringify(data.user));

          toast.success('تم إنشاء الحساب بنجاح!');
          navigate('/');
        }
      } catch (error) {
        const errorObj = error as { response?: { data?: { message?: string } } };
        toast.error(errorObj?.response?.data?.message || 'حدث خطأ في التسجيل');
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', marginTop: '40px', padding: 4, borderRadius: 2, boxShadow: 3, backgroundColor: 'background.paper' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4 }}>
        إنشاء حساب جديد
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          {([
            { name: 'name', label: 'اسم المستخدم', type: 'text', icon: <Person /> },
            { name: 'email', label: 'البريد الإلكتروني', type: 'email', icon: <Email /> },
            { name: 'password', label: 'كلمة المرور', type: 'password', icon: <Lock /> },
            { name: 'rePassword', label: 'تأكيد كلمة المرور', type: 'password', icon: <LockOpen /> },
            { name: 'phone', label: 'رقم الهاتف', type: 'text', icon: <Phone /> },
          ] as const).map(({ name, label, type, icon }, index) => (
            <Grid item xs={12} key={index}>
              <TextField
                label={label}
                variant="outlined"
                fullWidth
                type={type}
                name={name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values[name as keyof RegisterFormValues]} 
                error={formik.touched[name as keyof RegisterFormValues] && Boolean(formik.errors[name as keyof RegisterFormValues])}
                helperText={formik.touched[name as keyof RegisterFormValues] && formik.errors[name as keyof RegisterFormValues]}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
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
