export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80";

export const FALLBACK_IMAGE = DEFAULT_IMAGE;

export const getImageUrl = (url?: string) => {
  if (!url) return DEFAULT_IMAGE;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
