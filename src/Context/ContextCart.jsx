import axios from "axios";
import { createContext, useEffect, useState } from "react";

export let ContextCart = createContext();

export default function ContextCartProvider(props) {
  const [cart, setCart] = useState({}); 

  const headers = {
    token: localStorage.getItem("userToken"),
  };

  async function addToCart(productId) {
    try {
      const response = await axios.post(
        "https://ecommerce.routemisr.com/api/v1/cart",
        { productId },
        { headers }
      );
      return response;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  async function getProductsCart() {
    try {
      const response = await axios.get("https://ecommerce.routemisr.com/api/v1/cart", {
        headers,
      });
      return response;
    } catch (error) {
      console.error("Error fetching cart products:", error);
      throw error;
    }
  }

  async function deleteProductCart(productId) {
    try {
      const response = await axios.delete(
        `https://ecommerce.routemisr.com/api/v1/cart/${productId}`,
        { headers }
      );
      return response;
    } catch (error) {
      console.error("Error deleting product from cart:", error);
      throw error;
    }
  }

  async function updateProductCart(productId, count) {
    try {
      const response = await axios.put(
        `https://ecommerce.routemisr.com/api/v1/cart/${productId}`,
        { count },
        { headers }
      );
      return response;
    } catch (error) {
      console.error("Error updating product in cart:", error);
      throw error;
    }
  }

  async function getCart() {
    try {
      const response = await getProductsCart();
      setCart(response?.data || {});
    } catch (error) {
      console.error("Error getting cart:", error);
      setCart({});
    }
  }

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
      {props.children}
    </ContextCart.Provider>
  );
}