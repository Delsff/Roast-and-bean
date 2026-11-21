import { useMemo, useState } from "react";
import { useProducts } from "../../../hooks/useProducts";
import { ProductCard, ProductCardSkeleton } from "../../CardComp/ProductCard";
import type { Product } from "../../../types/types";

type RoastFilter = "all" | "light" | "medium" | "dark";
type CategoryFilter = "all" | Product["category"];
type SortOption = "default" | "price-asc" | "price-desc";

const categoryOptions: { label: string; value: CategoryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Coffee beans", value: "coffee_beans" },
  { label: "Accessories", value: "accessories" },
  { label: "Equipment", value: "equipment" },
];

const roastOptions: { label: string; value: RoastFilter }[] = [
  { label: "All roasts", value: "all" },
  { label: "Light", value: "light" },
  { label: "Medium", value: "medium" },
  { label: "Dark", value: "dark" },
];

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    aria-pressed={active}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${active ? "bg-amber-700 text-white shadow-sm" : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"}`}
  >
    {children}
  </button>
);

export const CatalogPage = () => {
  const { data: products = [], isLoading, isError, refetch } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [roastFilter, setRoastFilter] = useState<RoastFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const showRoastFilter =
    categoryFilter === "all" || categoryFilter === "coffee_beans";

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const result = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) &&
        (categoryFilter === "all" || p.category === categoryFilter) &&
        (roastFilter === "all" || p.roastLevel === roastFilter),
    );
    if (sortBy === "price-asc")
      return [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc")
      return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [products, searchQuery, categoryFilter, roastFilter, sortBy]);

  const selectCategory = (value: CategoryFilter) => {
    setCategoryFilter(value);
    if (value !== "all" && value !== "coffee_beans") setRoastFilter("all");
  };
  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setRoastFilter("all");
    setSortBy("default");
  };
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          Specialty Coffee Catalog
        </h1>
        <p className="text-stone-600">
          Freshly roasted beans sourced from the world's finest origins
        </p>
      </div>
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              aria-label="Search products"
              placeholder="Search by name (e.g., Ethiopia)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-select"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
            >
              Sort by:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-700 focus:outline-none ocus:ring-2 focus:ring-amber-700/50 focus:border-amber-700 cursor-pointer"
            >
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {categoryOptions.map((o) => (
              <Chip
                key={o.value}
                active={categoryFilter === o.value}
                onClick={() => selectCategory(o.value)}
              >
                {o.label}
              </Chip>
            ))}
          </div>
          {showRoastFilter && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">
                Roast:
              </span>
              {roastOptions.map((o) => (
                <Chip
                  key={o.value}
                  active={roastFilter === o.value}
                  onClick={() => setRoastFilter(o.value)}
                >
                  {o.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </div>
      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center mb-8">
          <p className="mb-2">Failed to load product catalog.</p>
          <button
            onClick={() => refetch()}
            className="text-sm font-semibold underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
      {!isLoading && !isError && visibleProducts.length === 0 && (
        <div className="text-center py-16 bg-stone-50 rounded-xl border border-dashed border-stone-300">
          <p className="text-stone-600 font-medium mb-2">
            No products found matching your search
          </p>
          <p className="text-sm text-stone-400 mb-4">
            Try adjusting your search criteria or reset filters
          </p>
          <button
            onClick={resetFilters}
            className="text-sm text-amber-700 font-semibold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
      {!isLoading && !isError && visibleProducts.length > 0 && (
        <>
          <p className="text-sm text-stone-500 mb-4">
            {visibleProducts.length} product
            {visibleProducts.length === 1 ? "" : "s"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </>
      )}
    </main>
  );
};
