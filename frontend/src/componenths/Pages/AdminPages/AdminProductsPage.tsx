import { useEffect, useState } from "react";
import { http } from "../../../lib/http";
import { getImageUrl, FALLBACK_IMAGE, formatPrice } from "../../../lib/api";
import type { Product } from "../../../types/types";
import { ProductForm } from "./ProductForm";
import { useQueryClient } from "@tanstack/react-query";

export const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const refreshCatalog = () =>
    queryClient.invalidateQueries({ queryKey: ["products"] });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  useEffect(() => {
    http<Product[]>("/api/products")
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (saved: Product) => {
    (setProducts((prev) =>
      prev.some((p) => p.id === saved.id)
        ? prev.map((p) => (p.id === saved.id ? saved : p))
        : [...prev, saved],
    ),
      setEditing(null));
    refreshCatalog();
  };
  const toggleStock = async (product: Product) => {
    try {
      const updated = await http<Product>(`/api/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
      refreshCatalog();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  };
  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await http<void>(`/api/products/${product.id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      refreshCatalog();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  };
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-900">Products</h1>
        {editing === null && (
          <button
            onClick={() => setEditing("new")}
            className="bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-800 transition-colors cursor-pointer"
          >
            + Add product
          </button>
        )}
      </div>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {editing !== null && (
        <ProductForm
          key={editing === "new" ? "new" : editing.id}
          product={editing === "new" ? null : editing}
          onSaved={handleSaved}
          onCancel={() => setEditing(null)}
        />
      )}
      {loading && <p className="text-stone-500">Loading...</p>}
      <div className="space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-stone-200 rounded-xl p-4 flex flex-wrap items-center gap-4"
          >
            <img
              src={getImageUrl(product.imageUrl)}
              alt={product.name}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
              className="w-16 h-16 rounded-lg object-cover bg-stone-100"
            />
            <div className="flex-1 min-w-40">
              <p className="font-semibold text-stone-900">{product.name}</p>
              <p className="text-xs text-stone-500 capitalize">
                {product.category.replace("_", " ")}
                {product.roastLevel ? `· ${product.roastLevel} roast` : ""}
              </p>
            </div>
            <p className="font-bold text-amber-700">
              {formatPrice(product.price)}
            </p>
            <button
              onClick={() => toggleStock(product)}
              className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer ${
                product.inStock
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {product.inStock ? "In stock" : "Out of stock"}
            </button>
            <div className="flex gap-3 text-sm">
              <button
                onClick={() => setEditing(product)}
                className="text-amber-700 font-semibold hover:underline cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product)}
                className="text-red-600 font-semibold hover:underline cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
