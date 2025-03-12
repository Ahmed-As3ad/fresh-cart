import axios from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  products?: CartItem[];
}

interface CartContextType {
  cart: CartData;
  setCart: React.Dispatch<React.SetStateAction<CartData>>;
  getCart: () => Promise<void>;
  addToCart: (productId: string) => Promise<any>;
  getProductsCart: () => Promise<any>;
  deleteProductCart: (productId: string) => Promise<void>;
  updateProductCart: (productId: string, count: number) => Promise<any>;
}

export const ContextCart = createContext<CartContextType | null>(null);

export default function ContextCartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartData>({});

  const getHeaders = () => ({
    token: ` ${localStorage.getItem("userToken") || ""}`,
  });

  async function addToCart(productId: string) {
    try {
      const response = await axios.post(
        "https://ecommerce.routemisr.com/api/v1/cart",
        { productId },
        { headers: getHeaders() }
      );
      toast.success("تمت إضافة المنتج إلى السلة!");
      getCart();
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة المنتج");
      throw error;
    }
  }

  async function getProductsCart() {
    try {
      const response = await axios.get("https://ecommerce.routemisr.com/api/v1/cart", {
        headers: getHeaders(),
      });
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء جلب المنتجات");
      throw error;
    }
  }

  async function deleteProductCart(productId: string) {
    try {
      await axios.delete(`https://ecommerce.routemisr.com/api/v1/cart/${productId}`, {
        headers: getHeaders(),
      });
  
      toast.success("تم حذف المنتج من السلة!");
      setCart((prevCart) => ({
        ...prevCart,
        products: prevCart.products?.filter((item) => item.product.id !== productId) || [],
      }));
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف المنتج");
      throw error;
    }
  }
  async function updateProductCart(productId: string, count: number) {
    try {
      const response = await axios.put(
        `https://ecommerce.routemisr.com/api/v1/cart/${productId}`,
        { count },
        { headers: getHeaders() }
      );
  
      toast.success("تم تحديث الكمية بنجاح!");
  
      setCart((prevCart) => {
        if (!prevCart.products) return prevCart;
  
        const newCart = structuredClone(prevCart);
  
        newCart.products = newCart.products.map((item) =>
          item.product.id === productId ? { ...item, count } : item
        );
  
        return newCart;
      });
  
      return response.data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تحديث الكمية");
      throw error;
    }
  }
  
  

  async function getCart() {
    try {
      const data = await getProductsCart();
      setCart(data || {});
    } catch {
      setCart({});
    }
  }

  useEffect(() => {
    getCart();
  }, []);

  return (
    <ContextCart.Provider value={{ cart, setCart, getCart, addToCart, getProductsCart, deleteProductCart, updateProductCart }}>
      {children}
    </ContextCart.Provider>
  );
}
