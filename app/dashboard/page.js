"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { PaymentSidebar } from "../components/PaymentSidebar";
import { ContentHeader } from "../components/ContentHeader";
import { CardGrid } from "../components/CardGrid";
import { ProductForm } from "../components/Form";
import { usePayment } from "../context/PaymentContext";

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const [groupedProducts, setGroupedProducts] = useState({
    makanan: [],
    minuman: [],
    snack: [],
    bungkus: [],
  });

  // Payment context
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
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        // Perbaikan: data.products (bukan data langsung)
        const makanan = [];
        const minuman = [];
        const snack = [];
        const bungkus = [];

        if (Array.isArray(data.products)) {
          for (const product of data.products) {
            const card = {
              id: product._id,
              name: product.name || "",
              title: product.name || "",
              description: `Harga: Rp${parseInt(
                product.price || 0
              ).toLocaleString()}`,
              image: product.image || "",
              price: Number(product.price) || 0,
              quantity: product.quantity ? Number(product.quantity) : 1,
              category: product.category,
            };

            if (product.category === "makanan") makanan.push(card);
            else if (product.category === "minuman") minuman.push(card);
            else if (product.category === "snack") snack.push(card);
            else if (product.category === "bungkus") bungkus.push(card);
          }
        }

        setGroupedProducts({ makanan, minuman, snack, bungkus });
      } catch (error) {
        console.error("Error fetching products:", error);
        setGroupedProducts({
          makanan: [],
          minuman: [],
          snack: [],
          bungkus: [],
        });
      }
    };
    fetchProducts();
  }, []);

  const handleAddCard = () => setIsFormOpen(true);

  const handleSubmitForm = (newProduct) => {
    setGroupedProducts((prev) => ({
      ...prev,
      [newProduct.category]: [
        {
          id: newProduct._id,
          name: newProduct.name || "",
          title: newProduct.name || "",
          description: `Harga: Rp${parseInt(
            newProduct.price || 0
          ).toLocaleString()}`,
          image: newProduct.image || "",
          price: Number(newProduct.price) || 0,
          quantity: newProduct.quantity ? Number(newProduct.quantity) : 1,
          category: newProduct.category,
        },
        ...(prev[newProduct.category] || []),
      ],
    }));
  };

  const handleDeleteCard = async (id, category) => {
    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (response.ok) {
        setGroupedProducts((prev) => ({
          ...prev,
          [category]: (prev[category] || []).filter((card) => card.id !== id),
        }));
      } else {
        console.error("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

        <PaymentSidebar
          isOpen={isPaymentOpen}
          toggleSidebar={() => setIsPaymentOpen(!isPaymentOpen)}
          selectedProducts={selectedProducts || []}
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
              title="Warung Pangkep79"
              onAdd={handleAddCard}
              onToggleDelete={toggleDeleteMode}
              isDeleteMode={isDeleteMode}
            />
          </div>

          <div className="px-20">
            {/* Kategori Makanan */}
            {(groupedProducts.makanan || []).length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Makanan</h2>
                  <div className="flex-grow border-t border-gray-300 ml-4"></div>
                </div>
                <CardGrid
                  cards={groupedProducts.makanan || []}
                  isDeleteMode={isDeleteMode}
                  onDelete={(id) => handleDeleteCard(id, "makanan")}
                  onCardClick={addProduct}
                />
              </div>
            )}

            {/* Kategori Minuman */}
            {(groupedProducts.minuman || []).length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Minuman</h2>
                  <div className="flex-grow border-t border-gray-300 ml-4"></div>
                </div>
                <CardGrid
                  cards={groupedProducts.minuman || []}
                  isDeleteMode={isDeleteMode}
                  onDelete={(id) => handleDeleteCard(id, "minuman")}
                  onCardClick={addProduct}
                />
              </div>
            )}

            {/* Kategori Snack */}
            {(groupedProducts.snack || []).length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Snack</h2>
                  <div className="flex-grow border-t border-gray-300 ml-4"></div>
                </div>
                <CardGrid
                  cards={groupedProducts.snack || []}
                  isDeleteMode={isDeleteMode}
                  onDelete={(id) => handleDeleteCard(id, "snack")}
                  onCardClick={addProduct}
                />
              </div>
            )}

            {/* Kategori Bungkus */}
            {(groupedProducts.bungkus || []).length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Bungkus</h2>
                  <div className="flex-grow border-t border-gray-300 ml-4"></div>
                </div>
                <CardGrid
                  cards={groupedProducts.bungkus || []}
                  isDeleteMode={isDeleteMode}
                  onDelete={(id) => handleDeleteCard(id, "bungkus")}
                  onCardClick={addProduct}
                />
              </div>
            )}
          </div>

          {isFormOpen && (
            <ProductForm
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleSubmitForm}
            />
          )}
        </div>
      </div>
    </>
  );
}
