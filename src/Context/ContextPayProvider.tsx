import axios from "axios";
import { ContextPay } from "./ContextPay.tsx"; 
import { ReactNode } from "react";
import toast from "react-hot-toast";

interface ContextPayProviderProps {
  children: ReactNode;
}

export default function ContextPayProvider({ children }: ContextPayProviderProps) {
  
  const getHeaders = () => ({
    token: localStorage.getItem("userToken") || "",
  });

  async function checkOutSession(cartId: string, url: string, formikValues: any) {
    try {
      const response = await axios.post(
        `https://ecommerce.routemisr.com/api/v1/orders/checkout-session/${cartId}?url=${url}`,
        { shippingAddress: formikValues },
        { headers: getHeaders() }
      );
      toast.success("✅ تم إنشاء طلب الدفع بنجاح!");
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "❌ حدث خطأ أثناء إنشاء الطلب");
      throw error;
    }
  }

  return (
    <ContextPay.Provider value={{ checkOutSession }}>
      {children}
    </ContextPay.Provider>
  );
}
