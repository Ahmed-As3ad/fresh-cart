import axios from "axios";
import { createContext } from "react";

export let ContextPay = createContext();

export default function ContextPayProvider({ children }) { 
  let headers = {
    token: localStorage.getItem('userToken')
  };

  function checkOutSession(cartId, url, formikValues) {
    return axios.post(
      `https://ecommerce.routemisr.com/api/v1/orders/checkout-session/${cartId}?url=${url}`,
      { shippingAddress: formikValues },
      { headers }
    )
    .then((response) => response)
    .catch((error) => error);
  }

  return (
    <ContextPay.Provider value={{ checkOutSession }}>
      {children} 
    </ContextPay.Provider>
  );
}