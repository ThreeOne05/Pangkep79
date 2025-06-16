"use client";
import { useState } from "react";

export const ProductForm = ({ onClose, onSubmit }) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [productCategory, setProductCategory] = useState("makanan");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [preview, setPreview] = useState(null);

  // Format angka ke format rupiah
  const formatRupiah = (value) => {
    if (!value) return "";
    const number = value.replace(/[^0-9]/g, "");
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Extract angka dari format rupiah
  const extractNumber = (rupiahString) => {
    return rupiahString.replace(/[^0-9]/g, "");
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatRupiah(value);
    setProductPrice(formattedValue);
  };

  const handleImageChange = async (e) => {
    setUploadError("");
    const file = e.target.files[0];
    if (!file) return;

    // Preview image
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setIsUploading(false);

    if (response.ok) {
      setProductImage(data.imageUrl);
    } else {
      setUploadError(data.message || "Error uploading image");
      setProductImage(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productImage) {
      setUploadError("Image is required");
      alert("Please upload an image");
      return;
    }

    try {
      // Extract angka dari format rupiah untuk dikirim ke API
      const priceNumber = parseInt(extractNumber(productPrice));

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productName,
          price: priceNumber,
          image: productImage,
          category: productCategory,
        }),
      });

      if (response.ok) {
        const newProduct = await response.json();
        onSubmit(newProduct);
        onClose();
      } else {
        setUploadError("Failed to save product");
      }
    } catch (error) {
      setUploadError("Error: " + error.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50 p-1">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-xs mx-1 p-3 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-1 top-1 text-gray-400 hover:text-red-500 text-lg font-bold w-6 h-6 flex items-center justify-center"
          aria-label="Tutup"
        >
          ×
        </button>
        <h2 className="text-sm font-bold mb-2 text-center text-blue-600 mt-1">
          Tambah Produk
        </h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Nama Produk */}
          <div>
            <label className="block text-[10px] font-semibold mb-0.5 text-gray-700">
              Nama
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
              required
              placeholder="Nama produk"
              autoFocus
            />
          </div>

          {/* Harga */}
          <div>
            <label className="block text-[10px] font-semibold mb-0.5 text-gray-700">
              Harga
            </label>
            <input
              type="text"
              value={productPrice}
              onChange={handlePriceChange}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
              required
              placeholder="Rp 12.000"
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-[10px] font-semibold mb-0.5 text-gray-700">
              Kategori
            </label>
            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
              required
            >
              <option value="makanan">Makanan</option>
              <option value="minuman">Minuman</option>
              <option value="snack">Snack</option>
              <option value="bungkus">Bungkus</option>
            </select>
          </div>

          {/* Upload Foto */}
          <div>
            <label className="block text-[10px] font-semibold mb-0.5 text-gray-700">
              Foto
            </label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full text-[10px] text-gray-800"
              accept="image/*"
              required
              disabled={isUploading}
            />
            {isUploading && (
              <div className="text-[9px] text-blue-500 mt-0.5">Upload...</div>
            )}
            {uploadError && (
              <div className="text-[9px] text-red-500 mt-0.5">
                {uploadError}
              </div>
            )}
            {preview && (
              <div className="mt-1 flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="rounded h-12 w-12 object-cover border"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-1 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-600 py-1.5 text-[10px] rounded font-semibold hover:bg-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-blue-500 text-white py-1.5 text-[10px] rounded font-semibold hover:bg-blue-600 disabled:opacity-60"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
