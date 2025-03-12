import { createContext } from "react";

interface PayContextType {
  checkOutSession: (cartId: string, url: string, formikValues: any) => Promise<any>;
}

export const ContextPay = createContext<PayContextType | null>(null);
