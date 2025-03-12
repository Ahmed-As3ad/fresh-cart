import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

// تعريف الأنواع بشكل دقيق
interface Product {
  id: string;
  title: string;
  imageCover: string;
  price: number;
}

interface CartItem {
  product: Product;
  count: number;
  price: number;
}

interface CartData {
  _id?: string;
  data?: {
    products?: CartItem[];
    _id?: string;
    cartOwner?: string;
    totalCartPrice?: number;
  };
  status?: string;
  numOfCartItems?: number;
}

interface CartContextType {
  cart: CartData;
  setCart: React.Dispatch<React.SetStateAction<CartData>>;
  getCart: () => Promise<void>;
  addToCart: (productId: string) => Promise<CartData>;
  getProductsCart: () => Promise<CartData>;
  deleteProductCart: (productId: string) => Promise<void>;
  updateProductCart: (productId: string, count: number) => Promise<CartData>;
}

export const ContextCart = createContext<CartContextType | null>(null);

export default function ContextCartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartData>({});

  // إصلاح مساحة الزائدة في التوكن
  const getHeaders = () => ({
    token: localStorage.getItem("userToken") || "",
  });

  // تحسين أنواع الدوال
  const addToCart = async (productId: string): Promise<CartData> => {
    try {
      const response = await axios.post<CartData>(
        "https://ecommerce.routemisr.com/api/v1/cart",
        { productId },
        { headers: getHeaders() }
      );
      toast.success("تمت إضافة المنتج إلى السلة!");
      await getCart();
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة المنتج");
      throw error;
    }
  };

  const getProductsCart = async (): Promise<CartData> => {
    try {
      const response = await axios.get<CartData>(
        "https://ecommerce.routemisr.com/api/v1/cart",
        { headers: getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء جلب المنتجات");
      throw error;
    }
  };

  const deleteProductCart = async (productId: string): Promise<void> => {
    try {
      await axios.delete(`https://ecommerce.routemisr.com/api/v1/cart/${productId}`, {
        headers: getHeaders(),
      });

      toast.success("تم حذف المنتج من السلة!");
      setCart((prevCart) => ({
        ...prevCart,
        data: {
          ...prevCart.data,
          products: prevCart.data?.products?.filter(
            (item) => item.product.id !== productId
          ),
        },
      }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف المنتج");
      throw error;
    }
  };

  const updateProductCart = async (
    productId: string,
    count: number
  ): Promise<CartData> => {
    try {
      const response = await axios.put<CartData>(
        `https://ecommerce.routemisr.com/api/v1/cart/${productId}`,
        { count },
        { headers: getHeaders() }
      );

      toast.success("تم تحديث الكمية بنجاح!");
      setCart((prevCart) => {
        const newCart = { ...prevCart };
        if (newCart.data?.products) {
          newCart.data.products = newCart.data.products.map((item) =>
            item.product.id === productId ? { ...item, count } : item
          );
        }
        return newCart;
      });
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تحديث الكمية");
      throw error;
    }
  };

  const getCart = async (): Promise<void> => {
    try {
      const data = await getProductsCart();
      setCart(data);
    } catch {
      setCart({});
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  return (
    <ContextCart.Provider
      value={{
        cart,
        setCart,
        getCart,
        addToCart,
        getProductsCart,
        deleteProductCart,
        updateProductCart,
      }}
    >
      {children}
    </ContextCart.Provider>
  );
}