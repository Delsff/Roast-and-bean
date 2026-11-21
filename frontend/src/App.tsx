import { Header } from "./componenths/Pages/Header";
import { CartDrawer } from "./componenths/CardComp/CartDrawer";
import { CatalogPage } from "./componenths/Pages/CatalogPages/CatalogPage";
import { CheckoutPage } from "./componenths/Pages/CatalogPages/CheckoutPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthPage } from "./componenths/Pages/AuthPages/AuthPage";
import { RequireAuth } from "./componenths/Pages/AuthPages/RequireAuth";
import { OrderPage } from "./componenths/Pages/OrdersPage";
import { AdminProductsPage } from "./componenths/Pages/AdminPages/AdminProductsPage";
import { Toaster } from "sonner";
import { ProductPage } from "./componenths/Pages/CatalogPages/ProductPage";
import { NotFoundPage } from "./componenths/Pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <CartDrawer />
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <OrderPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <OrderPage admin />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAuth role="admin">
              <AdminProductsPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
