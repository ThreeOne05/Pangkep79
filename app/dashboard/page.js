"use client";
import { useEffect, useState } from "react";
import { PaymentSidebar } from "../components/PaymentSidebar";
import { CardGrid } from "../components/CardGrid";
import { ProductForm } from "../components/Form";
import { usePayment } from "../context/PaymentContext";
import { menuItems } from "../components/path";
import { ContentHeader } from "../components/ContentHeader";
import Link from "next/link";

const CATEGORIES = ["makanan", "minuman", "snack", "bungkus", "rokok"];

// Helper untuk update order ke backend
async function updateProductOrder(category, orderedIds) {
  await fetch("/api/products/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, orderedIds }),
  });
}

export default function DashboardPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false); // satu tombol global
  const [groupedProducts, setGroupedProducts] = useState({
    makanan: [],
    minuman: [],
    snack: [],
    bungkus: [],
    rokok: [],
  });
  const [loading, setLoading] = useState(true);

  // Payment context
  const {
    selectedProducts,
    setIsPaymentOpen,
    addProduct,
    removeProduct,
    clearSelectedProducts,
  } = usePayment();

  const toggleDeleteMode = () => setIsDeleteMode((prev) => !prev);
  const toggleReorderMode = () => setIsReorderMode((prev) => !prev);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products?limit=100");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();

      const grouped = {};
      for (const cat of CATEGORIES) grouped[cat] = [];
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
          if (grouped[product.category]) grouped[product.category].push(card);
        }
      }
      setGroupedProducts(grouped);
    } catch (error) {
      setGroupedProducts(
        Object.fromEntries(CATEGORIES.map((cat) => [cat, []]))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    setIsPaymentOpen?.(true);
    fetchProducts();
    // eslint-disable-next-line
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
      }
    } catch (error) {}
  };

  // Inilah perubahan penting: update backend setiap kali urutan berubah
  const handleReorder = async (category, newCards) => {
    setGroupedProducts((prev) => ({
      ...prev,
      [category]: newCards,
    }));
    // Kirim ke backend agar urutan bertahan
    await updateProductOrder(
      category,
      newCards.map((card) => card.id)
    );
  };

  return (
    <div className="flex min-h-screen">
      <PaymentSidebar
        selectedProducts={selectedProducts || []}
        onRemoveProduct={removeProduct}
        onClearProducts={clearSelectedProducts}
      />
      <div className={"flex-1 transition-all duration-300 mr-60"}>
        {/* HEADER */}
        <div className="bg-blue-50 text-black px-4 py-3 font-bold rounded-b-4xl mb-4 ml-16 mr-4">
          <div className="flex items-center gap-6">
            <div className="flex-1 flex items-center">
              <span className="text-50 font-bold">Warung Pangkep79</span>
            </div>
            <div className="flex-1 flex justify-center">
              <nav className="flex gap-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="text-black font-semibold hover:underline transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-1 flex justify-end">
              <ContentHeader
                title=""
                onAdd={handleAddCard}
                onToggleDelete={toggleDeleteMode}
                isDeleteMode={isDeleteMode}
                isReorderMode={isReorderMode}
                onToggleReorder={toggleReorderMode}
              />
            </div>
          </div>
        </div>

        <div className="px-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading products...
            </div>
          ) : (
            <>
              {CATEGORIES.map((kategori) =>
                (groupedProducts[kategori] || []).length > 0 ? (
                  <div className="mb-8" key={kategori}>
                    <div className="flex items-center mb-4">
                      <h2 className="text-xl font-bold text-black capitalize">
                        {kategori}
                      </h2>
                      <div className="flex-grow border-t border-gray-300 ml-4"></div>
                    </div>
                    <CardGrid
                      cards={groupedProducts[kategori] || []}
                      isDeleteMode={isDeleteMode}
                      isReorderActive={isReorderMode}
                      onDelete={(id) => handleDeleteCard(id, kategori)}
                      onCardClick={addProduct}
                      onReorder={(newCards) =>
                        handleReorder(kategori, newCards)
                      }
                    />
                  </div>
                ) : null
              )}
            </>
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
  );
}
