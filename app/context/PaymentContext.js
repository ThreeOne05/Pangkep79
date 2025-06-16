"use client";
import { createContext, useContext, useState } from "react";

const PaymentContext = createContext();

export function PaymentProvider({ children }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const addProduct = (product) => {
    setSelectedProducts((prev) => {
      // Jika sudah ada, tambahkan quantity
      const exist = prev.find((p) => p.id === product.id);
      if (exist) {
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  const removeProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const clearSelectedProducts = () => setSelectedProducts([]);

  return (
    <PaymentContext.Provider
      value={{
        selectedProducts,
        isPaymentOpen,
        setIsPaymentOpen,
        addProduct,
        removeProduct,
        clearSelectedProducts,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);
