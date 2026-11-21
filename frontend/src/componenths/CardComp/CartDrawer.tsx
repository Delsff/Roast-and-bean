import { useCartStore } from "../../store/useCartStore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { formatPrice } from "../../lib/api";

export const CartDrawer = () => {
  const {
    isOpen,
    toggleCart,
    items,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
  } = useCartStore();
  const navigate = useNavigate();
  const handleCheckout = () => {
    toggleCart();
    navigate("/checkout");
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, toggleCart]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto visible"
          : "opacity-0 pointer-events-none invisible"
      }`}
    >
      <div
        onClick={toggleCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />
      <div
        className={`absolute top-0 right-0 bg-white w-full max-w-md h-full flex flex-col p-6 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-stone-900">Your Cart</h2>
          <button
            onClick={toggleCart}
            className="text-gray-500 hover:text-red-500 text-xl font-bold cursor-pointer"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex items-center justify-between border-b border-gray-100 pb-3"
              >
                <div>
                  <h4 className="font-semibold text-stone-900">
                    {product.name}
                  </h4>
                  <p className="text-sm text-amber-700 font-medium">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-stone-300 rounded">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-red-500 hover:text-red-700 text-sm cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-lg font-bold text-stone-900 mb-4">
            <span>Total:</span>
            <span className="text-amber-700">
              {formatPrice(getTotalPrice())}
            </span>
          </div>
          <button
            disabled={items.length === 0}
            onClick={handleCheckout}
            className="w-full bg-amber-700 text-white py-3 rounded-md font-bold hover:opacity-90 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};
