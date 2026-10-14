import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// ==========================================
// ADMIN PAGES
// ==========================================

import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminAddProduct from "./pages/Admin/AdminAddProduct";
import AdminEditProduct from "./pages/Admin/AdminEditProduct";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import AdminSettings from "./pages/Admin/AdminSettings";
import AdminPaymentsPage from "./pages/Admin/AdminPaymentsPage";

// ==========================================
// USER PAGES
// ==========================================

import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";

import OrderDetailsPage from "./pages/OrderDetailsPage";
import WishlistPage from "./pages/WishlistPage";

import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrdersPage from "./pages/OrdersPage";

import AboutUsPage from "./pages/AboutUsPage";


// ==========================================
// LAYOUT & HOME
// ==========================================

import Layout from "./components/layout/Layout";
import HomePage from "./components/home/HomePage";

// ==========================================
// AUTHENTICATION
// ==========================================

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// ==========================================
// PROTECTED ROUTES
// ==========================================

import ProtectedRoute from "./components/common/ProtectedRoute";

// ==========================================
// PAYMENT PAGES
// ==========================================

import UPIPaymentPage from "./pages/UPIPaymentPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";

// ==========================================
// REACT QUERY
// ==========================================

const queryClient = new QueryClient();

// ==========================================
// APP
// ==========================================

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            {/* Toast Notifications */}

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,

                style: {
                  background: "#363636",
                  color: "#fff",
                },

                success: {
                  duration: 3000,

                  iconTheme: {
                    primary: "#f0c314",
                    secondary: "#fff",
                  },
                },
              }}
            />

            {/* Application Routes */}

            <Routes>
              {/* ==================================
                  PUBLIC ROUTES
              ================================== */}

              <Route path="/" element={<Layout />}>
                {/* Home Page */}

                <Route index element={<HomePage />} />

                {/* Information Pages */}

                <Route
                  path="about"
                  element={<AboutUsPage />}
                />

               

                {/* Products */}

                <Route
                  path="products"
                  element={<ProductsPage />}
                />

                <Route
                  path="products/:id"
                  element={<ProductDetailsPage />}
                />

                {/* Categories */}

                <Route
                  path="categories"
                  element={<CategoriesPage />}
                />

                <Route
                  path="categories/:id"
                  element={<CategoryProductsPage />}
                />

                {/* Cart */}

                <Route
                  path="cart"
                  element={<CartPage />}
                />

                {/* Authentication */}

                <Route
                  path="login"
                  element={<Login />}
                />

                <Route
                  path="register"
                  element={<Register />}
                />
              </Route>

              {/* ==================================
                  PROTECTED USER ROUTES
              ================================== */}

              <Route element={<ProtectedRoute />}>
                {/* Checkout */}

                <Route
                  path="/checkout"
                  element={<CheckoutPage />}
                />

                {/* UPI Payment */}

                <Route
                  path="/payment/upi/:orderId"
                  element={<UPIPaymentPage />}
                />

                {/* Payment Status */}

                <Route
                  path="/payment/status/:orderId"
                  element={<PaymentStatusPage />}
                />

                {/* Wishlist */}

                <Route
                  path="/wishlist"
                  element={<WishlistPage />}
                />

                {/* Order Details */}

                <Route
                  path="/orders/:id"
                  element={<OrderDetailsPage />}
                />

                {/* Order Confirmation */}

                <Route
                  path="/order-confirmation"
                  element={<OrderConfirmation />}
                />

                {/* My Orders */}

                <Route
                  path="/orders"
                  element={<OrdersPage />}
                />

                {/* Profile route removed because
                    ProfilePage.jsx is missing. */}
              </Route>

              {/* ==================================
                  ADMIN ROUTES
              ================================== */}

              <Route
                element={<ProtectedRoute adminOnly />}
              >
                <Route
                  path="/admin"
                  element={<AdminLayout />}
                >
                  {/* Admin Dashboard */}

                  <Route
                    index
                    element={<AdminDashboard />}
                  />

                  {/* Payments */}

                  <Route
                    path="payments"
                    element={<AdminPaymentsPage />}
                  />

                  {/* Orders */}

                  <Route
                    path="orders"
                    element={<AdminOrders />}
                  />

                  {/* Products */}

                  <Route
                    path="products"
                    element={<AdminProducts />}
                  />

                  <Route
                    path="products/add"
                    element={<AdminAddProduct />}
                  />

                  <Route
                    path="products/edit/:id"
                    element={<AdminEditProduct />}
                  />

                  {/* Categories */}

                  <Route
                    path="categories"
                    element={<AdminCategories />}
                  />

                  {/* Analytics */}

                  <Route
                    path="analytics"
                    element={<AdminAnalytics />}
                  />

                  {/* Settings */}

                  <Route
                    path="settings"
                    element={<AdminSettings />}
                  />
                </Route>
              </Route>

              {/* ==================================
                  UNKNOWN ROUTES
              ================================== */}

              <Route
                path="*"
                element={
                  <Navigate
                    to="/"
                    replace
                  />
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;