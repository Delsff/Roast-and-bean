import { useState } from "react";
import { http } from "../../../lib/http";
import { getImageUrl, FALLBACK_IMAGE } from "../../../lib/api";
import type { Product } from "../../../types/types";

type FormState = {
  name: string;
  description: string;
  price: string;
  category: Product["category"];
  roastLevel: "" | "light" | "medium" | "dark";
  imageUrl: string;
  inStock: boolean;
};

type Props = {
  product: Product | null;
  onSaved: (product: Product) => void;
  onCancel: () => void;
};

const inputClass =
  "w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700";

export const ProductForm = ({ product, onSaved, onCancel }: Props) => {
  const [form, setForm] = useState<FormState>({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product ? (product.price / 100).toFixed(2) : "",
    category: product?.category ?? "coffee_beans",
    roastLevel: product?.roastLevel ?? "",
    imageUrl: product?.imageUrl ?? "",
    inStock: product?.inStock ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cents = Math.round(parseFloat(form.price) * 100);
    if (!Number.isFinite(cents) || cents < 1) {
      setError("Enter a valid price");
      return;
    }
    const payload = {
      name: form.name,
      description: form.description,
      price: cents,
      category: form.category,
      roastLevel:
        form.category === "coffee_beans" && form.roastLevel
          ? form.roastLevel
          : null,
      imageUrl: form.imageUrl,
      inStock: form.inStock,
    };
    setSaving(true);
    try {
      const saved = product
        ? await http<Product>(`/api/products/${product.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await http<Product>("/api/products", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-stone-200 rounded-xl p-6 mb-8 space-y-4"
    >
      <h2 className="text-lg font-bold text-stone-900">
        {product ? `Edit: ${product.name}` : "New product"}
      </h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="p-name"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Name
          </label>
          <input
            id="p-name"
            required
            minLength={2}
            className={inputClass}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="p-price"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Price ($)
          </label>
          <input
            id="p-price"
            type="number"
            step="0.01"
            min="0.01"
            required
            className={inputClass}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="p-category"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Category
          </label>
          <select
            id="p-category"
            className={inputClass}
            value={form.category}
            onChange={(e) =>
              set("category", e.target.value as FormState["category"])
            }
          >
            <option value="coffee_beans">Coffee beans</option>
            <option value="accessories">Accessories</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>
        {form.category === "coffee_beans" && (
          <div>
            <label
              htmlFor="p-roast"
              className="block text-sm font-medium text-stone-700 mb-1"
            >
              Roast level
            </label>
            <select
              id="p-roast"
              className={inputClass}
              value={form.roastLevel}
              onChange={(e) =>
                set("roastLevel", e.target.value as FormState["roastLevel"])
              }
            >
              <option value="">Not set</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        )}
      </div>
      <div>
        <label
          htmlFor="p-desc"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="p-desc"
          required
          minLength={10}
          rows={3}
          className={inputClass}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1 w-full">
          <label
            htmlFor="p-image"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Image URL
          </label>
          <input
            id="p-image"
            type="url"
            required
            className={inputClass}
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
          />
        </div>
        <img
          src={getImageUrl(form.imageUrl)}
          alt="Preview"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          className="w-24 h-24 rounded-lg object-cover bg-stone-100 border border-stone-200"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
        <input
          type="checkbox"
          checked={form.inStock}
          onChange={(e) => set("inStock", e.target.checked)}
        />
        In stock
      </label>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-amber-700 text-white px-5 py-2 rounded-lg font-semibold hover:bg-amber-800 disabled:opacity-50 transition-colors cursor-pointer"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
