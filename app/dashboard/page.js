"use client";
import { useEffect, useState } from "react";
import { PaymentSidebar } from "../components/PaymentSidebar";
import { CardGrid } from "../components/CardGrid";
import { ProductForm } from "../components/Form";
import { usePayment } from "../context/PaymentContext";
import { menuItems } from "../components/path";
import { ContentHeader } from "../components/ContentHeader";
import Link from "next/link";

export default function DashboardPage() {
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

  const toggleDeleteMode = () => setIsDeleteMode(!isDeleteMode);

  useEffect(() => {
    setIsPaymentOpen(true); // PaymentSidebar otomatis terbuka

    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

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
  }, [setIsPaymentOpen]);

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
            {/* Kiri: Judul */}
            <div className="flex-1 flex items-center">
              <span className="text-50 font-bold">Warung Pangkep79</span>
            </div>
            {/* Tengah: Path menu (pakai Next Link) */}
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
            {/* Kanan: Tombol Add (+) dan Delete (X Circle) */}
            <div className="flex-1 flex justify-end">
              <ContentHeader
                title=""
                onAdd={handleAddCard}
                onToggleDelete={toggleDeleteMode}
                isDeleteMode={isDeleteMode}
              />
            </div>
          </div>
        </div>

        <div className="px-4">
          {/* Kategori Makanan */}
          {(groupedProducts.makanan || []).length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <h2 className="text-xl font-bold text-black">Makanan</h2>
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
                <h2 className="text-xl font-bold text-black">Minuman</h2>
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
                <h2 className="text-xl font-bold text-black">Snack</h2>
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
                <h2 className="text-xl font-bold text-black">Bungkus</h2>
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
  );
}
