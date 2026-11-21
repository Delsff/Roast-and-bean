import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <main className="max-w-md mx-auto px-4 py-20 text-center">
    <p className="text-6xl font-bold text-amber-700 mb-4">404</p>
    <h1 className="text-xl font-semibold text-stone-900 mb-2">
      Page not found
    </h1>
    <p className="text-stone-600 mb-6">
      The page you are looking for does not exist
    </p>
    <Link
      to="/"
      className="inline-block bg-amber-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-amber-800 transition-colors"
    >
      Back to catalog
    </Link>
  </main>
);
