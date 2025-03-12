import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !newPassword) {
      toast.error("الرجاء إدخال البريد الإلكتروني وكلمة المرور الجديدة");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(email)) {
      toast.error("البريد الإلكتروني غير صالح");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل مع أرقام وحروف");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put("https://ecommerce.routemisr.com/api/v1/auth/resetPassword", {
        email,
        newPassword
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.data?.status === "success") {
        toast.success("تم إعادة تعيين كلمة المرور بنجاح");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error("لم يتم إعادة تعيين كلمة المرور، حاول مرة أخرى");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور.");
      } else {
        toast.error("حدث خطأ غير متوقع، حاول مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Toaster position="top-center" reverseOrder={false} />
      <Box sx={{ textAlign: "center", marginTop: 5 }}>
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
            onChange={(e) => setEmail(e.target.value)}
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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={loading}
          >
            {loading ? "جاري إعادة تعيين كلمة المرور..." : "إعادة تعيين كلمة المرور"}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default ResetPassword;
