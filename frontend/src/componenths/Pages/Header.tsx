import { Link } from "react-router-dom";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";

export const Header = () => {
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const navLink =
    "text-sm text-stone-200 hover:text-amber-200 transition-colors";
  return (
    <header className="bg-stone-900 text-white shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <Link to="/" className="block">
          <span className="block text-2xl font-bold tracking-wide">
            Roast & Bean
          </span>
          <span className="block text-sm text-amber-200">
            Specialty Coffee Store
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-4">
          {user ? (
            <>
              {user.role === "admin" && (
                <>
                  <Link to="/admin" className={navLink}>
                    Orders
                  </Link>
                  <Link to="/admin/products" className={navLink}>
                    Products
                  </Link>
                </>
              )}
              <Link to="/orders" className={navLink}>
                My orders
              </Link>
              <span className="text-sm text-amber-200">{user.name}</span>
              <button onClick={logout} className={`${navLink} cursor-pointer`}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLink}>
                Sign in
              </Link>
              <Link to="/register" className={navLink}>
                Sign up
              </Link>
            </>
          )}
          <button
            onClick={toggleCart}
            aria-label={`Open cart, ${totalItems} items`}
            className="bg-amber-700 px-4 py-2 rounded-md font-medium hover:bg-amber-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="bg-white text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
