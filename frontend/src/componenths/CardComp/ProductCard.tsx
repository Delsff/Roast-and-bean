import { Link } from "react-router-dom";
import type { Product } from "../../types/types";
import { useCartStore } from "../../store/useCartStore";
import { getImageUrl, FALLBACK_IMAGE, formatPrice } from "../../lib/api";

type Props = { product: Product; index?: number };

export const ProductCard = ({ product, index = 0 }: Props) => {
  const addToCart = useCartStore((s) => s.addToCart);
  return (
    <article
      style={{ animationDelay: `${index * 60}ms` }}
      className="fade-up relative bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group"
    >
      <div className="relative w-full aspect-square bg-stone-100 overflow-hidden">
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.roastLevel && (
          <span className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium capitalize">
            {product.roastLevel} roast
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-stone-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Out of stock
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex-1">
        <h3 className="font-bold text-lg text-stone-900 mb-1 group-hover:text-amber-700 transition-colors">
          <Link
            to={`/product/${product.id}`}
            className="after:absolute after:inset-0"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-stone-600 text-sm line-clamp-2">
          {product.description}
        </p>
      </div>
      <div className="p-5 pt-4 flex items-center justify-between border-t border-stone-100">
        <span className="text-xl font-bold text-amber-700">
          {formatPrice(product.price)}
        </span>
        <button
          disabled={!product.inStock}
          onClick={() => addToCart(product)}
          className="relative z-10 bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </article>
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-white border border-stone-200 rounded-xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-stone-200">
      <div className="p-5 space-y-3">
        <div className="h-5 bg-stone-200 rounded w-2/3" />
        <div className="h-4 bg-stone-200 rounded w-full" />
        <div className="h-4 bg-stone-200 rounded w-4/5" />
      </div>
      <div className="p-5 pt-4 border-t border-stone-100 flex items-center justify-between">
        <div className="h-6 bg-stone-200 rounded w-16" />
        <div className="h-9 bg-stone-200 rounded-lg w-28" />
      </div>
    </div>
  </div>
);
