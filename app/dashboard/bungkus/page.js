"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { ContentHeader } from "../../components/ContentHeader";
import { CardGrid } from "../../components/CardGrid";
import { PaymentSidebar } from "../../components/PaymentSidebar";
import { usePayment } from "../../context/PaymentContext";
import { ProductForm } from "../../components/Form";

export default function BungkusLayout() {
  const [isOpen, setIsOpen] = useState(true);
  const [cards, setCards] = useState([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    selectedProducts,
    isPaymentOpen,
    setIsPaymentOpen,
    addProduct,
    removeProduct,
    clearSelectedProducts,
  } = usePayment();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleDeleteMode = () => setIsDeleteMode(!isDeleteMode);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products/");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();

        // Ambil array dari data.products, filter sesuai kategori
        const produkArray = Array.isArray(data.products) ? data.products : [];
        const bungkusCards = produkArray
          .filter((product) => product.category === "bungkus")
          .map((product) => ({
            id: product._id,
            name: product.name || "",
            title: product.name || "",
            description: `Harga: Rp${parseInt(
              product.price || 0
            ).toLocaleString()}`,
            image: product.image || "",
            category: product.category,
            price: Number(product.price) || 0,
            quantity: product.quantity ? Number(product.quantity) : 1,
          }));

        setCards(bungkusCards);
      } catch (error) {
        console.error("Error fetching products:", error);
        setCards([]); // fallback jika error
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteCard = async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCards((prevCards) => prevCards.filter((card) => card.id !== id));
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleSubmitForm = (newProduct) => {
    setCards((prevCards) => [
      {
        id: newProduct._id,
        name: newProduct.name || "",
        title: newProduct.name || "",
        description: `Harga: Rp${parseInt(
          newProduct.price || 0
        ).toLocaleString()}`,
        image: newProduct.image || "",
        category: newProduct.category,
        price: Number(newProduct.price) || 0,
        quantity: newProduct.quantity ? Number(newProduct.quantity) : 1,
      },
      ...prevCards,
    ]);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      <PaymentSidebar
        isOpen={isPaymentOpen}
        toggleSidebar={() => setIsPaymentOpen(!isPaymentOpen)}
        selectedProducts={selectedProducts}
        onRemoveProduct={removeProduct}
        onClearProducts={clearSelectedProducts}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-52" : "ml-0"
        } ${isPaymentOpen ? "mr-64" : "mr-0"}`}
      >
        <div className="bg-blue-50 text-black px-6 py-3 font-bold rounded-b-4xl mb-8 ml-20 mr-28">
          <ContentHeader
            title="Bungkus"
            onAdd={() => setIsFormOpen(true)}
            onToggleDelete={toggleDeleteMode}
            isDeleteMode={isDeleteMode}
          />
        </div>

        <div className="px-20">
          {cards.length > 0 ? (
            <CardGrid
              cards={cards}
              isDeleteMode={isDeleteMode}
              onDelete={handleDeleteCard}
              onCardClick={addProduct}
            />
          ) : (
            <div className="text-center py-10">
              <p>Tidak ada produk bungkus tersedia</p>
            </div>
          )}
        </div>
        {isFormOpen && (
          <ProductForm
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmitForm}
            category="bungkus"
          />
        )}
      </div>
    </div>
  );
}
