import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useProduct } from "../../../hooks/useProducts";
import { useCartStore } from "../../../store/useCartStore";
import { getImageUrl, FALLBACK_IMAGE, formatPrice } from "../../../lib/api";

export const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, isError, error } = useProduct(id);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    document.title = product
      ? `${product.name} · Roast & Bean`
      : "Roast & Bean";
    return () => {
      document.title = "Roast & Bean";
    };
  }, [product]);

  const backLink = (
    <Link
      to="/"
      className="text-sm text-amber-700 font-semibold hover:underline"
    >
      ← Back to catalog
    </Link>
  );
  if (isLoading) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-4 bg-stone-200 rounded w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-stone-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4"></div>
            <div className="h-8 bg-stone-200 rounded w-1/4"></div>
            <div className="h-4 bg-stone-200 rounded w-full"></div>
            <div className="h-4 bg-stone-200 rounded w-5/6"></div>
          </div>
        </div>
      </main>
    );
  }
  if (isError || !product) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Product not found
        </h1>
        <p className="text-stone-600 mb-6">
          {error instanceof Error
            ? error.message
            : "This product does not exist."}
        </p>
        {backLink}
      </main>
    );
  }
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">{backLink}</div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative aspect-square bg-stone-100 rounded-2xl overflow-hidden">
          <img
            src={getImageUrl(product.imageUrl)}
            alt={product.name}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover"
          />
          {product.roastLevel && (
            <span className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium capitalize">
              {product.roastLevel} roast
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            {product.category.replace("_", " ")}
          </span>
          <h1 className="text-3xl font-bold text-stone-900 mt-1 mb-3">
            {product.name}
          </h1>
          <p className="text-3xl font-extrabold text-amber-700 mb-5">
            {formatPrice(product.price)}
          </p>
          <div className="border-t border-stone-100 pt-4 mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Flavor &amp; Profile
            </h2>
            <p className="text-stone-600 leading-relaxed">
              {product.description}
            </p>
          </div>
          <p
            className={`text-sm font-medium mb-5 ${product.inStock ? "text-emerald-600" : "text-rose-500"}`}
          >
            {product.inStock ? "In Stock" : "Out of Stock"}
          </p>
          <button
            disabled={!product.inStock}
            onClick={() => addToCart(product)}
            className="bg-amber-700 text-white py-3 rounded-xl font-bold hover:bg-amber-800 disabled:opacity-50  disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {product.inStock
              ? `Add to Cart • ${formatPrice(product.price)}`
              : "Out of Stock"}
          </button>
        </div>
      </div>
    </main>
  );
};
