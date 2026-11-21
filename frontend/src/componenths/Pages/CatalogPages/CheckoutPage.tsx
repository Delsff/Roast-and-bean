import { useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { Link } from "react-router-dom";
import { formatPrice } from "../../../lib/api";
import { http } from "../../../lib/http";
import { useAuthStore } from "../../../store/useAuthStore";

export const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const [formData, setFormData] = useState({
    fullName: user?.name ?? "",
    email: user?.email ?? "",
    address: "",
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const orderPayload = {
      customer: formData,
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
      })),
    };

    try {
      const data = await http<{ id: string }>("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderPayload),
      });
      setCreatedOrderId(data.id);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (createdOrderId) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center py-16">
        <h2 className="text-3xl font-bold text-stone-900 mb-2">
          Thank you for your order!
        </h2>
        <p className="text-sm font-semibold text-amber-700 mb-4">
          Order ID: {createdOrderId}
        </p>
        <p className="text-gray-600 mb-8">
          We have received your order. Contact email:{" "}
          <span className="font-semibold">{formData.email}</span>.
        </p>
        {user && (
          <Link
            to="/orders"
            className="block text-amber-700 font-semibold hover:underline mb-4"
          >
            View my orders
          </Link>
        )}
        <Link
          to="/"
          className="inline-block bg-amber-700 text-white px-6 py-3 rounded-md font-medium hover:bg-amber-800 transition-colors"
        >
          Back to Catalog
        </Link>
      </main>
    );
  }
  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-6 text-center py-16">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-8">
          Add some specialty coffee to proceed with checkout.
        </p>
        <Link
          to="/"
          className="bg-amber-700 text-white px-6 py-3 rounded-md font-medium hover:opacity-90 transition-colors"
        >
          Explore Coffee
        </Link>
      </main>
    );
  }
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-stone-900 mb-6">Checkout Order</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 border border-stone-200 rounded-lg"
        >
          <h3 className="text-lg font-bold text-stone-900 mb-2">
            Shipping Information
          </h3>
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              autoComplete="name"
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-700"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-700"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Shipping Address
            </label>
            <textarea
              id="address"
              required
              rows={3}
              autoComplete="street-address"
              className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-700"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-700 text-white py-3 rounded-md font-bold hover:opacity-90 disabled:opacity-50 transition-colors mt-4 cursor-pointer"
          >
            {isSubmitting
              ? "Processing Order..."
              : `Place Order (${formatPrice(getTotalPrice())})`}
          </button>
        </form>
        <div className="bg-stone-50 p-6 border border-stone-200 rounded-lg h-fit">
          <h3 className="text-lg font-bold text-stone-900 mb-4">
            Order Summary
          </h3>
          <div className="space-y-3 mb-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span>
                  {product.name} x {quantity}
                </span>
                <span className="font-semibold">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-stone-300 pt-3 flex justify-between font-bold text-stone-900">
            <span>Total Amount:</span>
            <span className="text-amber-700">
              {formatPrice(getTotalPrice())}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
};
