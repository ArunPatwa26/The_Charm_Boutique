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


import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";


// ==========================================
// USER PAGES
// ==========================================

import OrderDetailsPage from "./pages/OrderDetailsPage";
import WishlistPage from "./pages/WishlistPage";

import Layout from "./components/layout/Layout";

import HomePage from "./components/home/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";

import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ReturnsPolicyPage from './pages/ReturnsPolicyPage';
import ShippingInfoPage from './pages/ShippingInfoPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import SitemapPage from './pages/SitemapPage';
import ComingSoonPage from './pages/ComingSoonPage';

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";


// ==========================================
// PROTECTED ROUTE
// ==========================================

import ProtectedRoute from "./components/common/ProtectedRoute";
import UPIPaymentPage from "./pages/UPIPaymentPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import AdminPaymentsPage from "./pages/Admin/AdminPaymentsPage";


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

            {/* ==================================
                TOAST NOTIFICATIONS
            =================================== */}

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


            {/* ==================================
                ROUTES
            =================================== */}

            <Routes>


              {/* ==================================
                  PUBLIC ROUTES
              =================================== */}

              <Route
                path="/"
                element={<Layout />}
              >

                <Route
                  index
                  element={<HomePage />}
                />

                <Route path="about" element={<AboutUsPage />} />
<Route path="contact" element={<ContactUsPage />} />
<Route path="help" element={<HelpCenterPage />} />
<Route path="returns" element={<ReturnsPolicyPage />} />
<Route path="shipping" element={<ShippingInfoPage />} />
<Route path="privacy" element={<PrivacyPolicyPage />} />
<Route path="terms" element={<TermsOfServicePage />} />
<Route path="cookies" element={<CookiePolicyPage />} />
<Route path="sitemap" element={<SitemapPage />} />

{/* Placeholder Pages */}
<Route
  path="careers"
  element={
    <ComingSoonPage
      title="Careers"
      description="We're growing! Open positions will be posted here soon."
    />
  }
/>
<Route
  path="sustainability"
  element={
    <ComingSoonPage
      title="Sustainability"
      description="Learn about our ethical sourcing and environmental initiatives."
    />
  }
/>
<Route
  path="press"
  element={
    <ComingSoonPage
      title="Press"
      description="Press releases, media kit, and brand assets coming soon."
    />
  }
/>
<Route
  path="blog"
  element={
    <ComingSoonPage
      title="Blog"
      description="Jewellery trends, care tips, and styling guides coming soon."
    />
  }
/>

                <Route
                  path="products"
                  element={<ProductsPage />}
                />

                <Route
                  path="products/:id"
                  element={<ProductDetailsPage />}
                />

                <Route
                  path="cart"
                  element={<CartPage />}
                />

                <Route
                  path="login"
                  element={<Login />}
                />

                <Route
                  path="register"
                  element={<Register />}
                />

                  <Route path="categories" element={<CategoriesPage />} />
<Route path="categories/:id" element={<CategoryProductsPage />} />

              </Route>


              {/* ==================================
                  PROTECTED USER ROUTES
              =================================== */}

              <Route
                element={<ProtectedRoute />}
              >

                <Route
                  path="/checkout"
                  element={<CheckoutPage />}
                />
                <Route
                  path="/payment/upi/:orderId"
                  element={<UPIPaymentPage />}
                />

                <Route
                  path="/payment/status/:orderId"
                  element={<PaymentStatusPage />}
                />

                


                <Route
                  path="/wishlist"
                  element={<WishlistPage />}
                />

                <Route
                  path="/orders/:id"
                  element={<OrderDetailsPage />}
                />

                <Route
                  path="/order-confirmation"
                  element={<OrderConfirmation />}
                />

                <Route
                  path="/orders"
                  element={<OrdersPage />}
                />

                <Route
                  path="/profile"
                  element={<ProfilePage />}
                />

              </Route>
            


              {/* ==================================
                  ADMIN ROUTES
              =================================== */}

              <Route
                element={
                  <ProtectedRoute adminOnly />
                }
              >

                <Route
                  path="/admin"
                  element={<AdminLayout />}
                >

                  <Route
                    index
                    element={<AdminDashboard />}
                  />

                  <Route
                    path="/admin/payments"
                    element={<AdminPaymentsPage />}
                  />


                  <Route
                    path="orders"
                    element={<AdminOrders />}
                  />

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

                  <Route
                    path="categories"
                    element={<AdminCategories />}
                  />

                  <Route path="analytics" element={<AdminAnalytics />} />     {/* ✅ NEW */}
    <Route path="settings" element={<AdminSettings />} />  

                </Route>

              </Route>


              {/* ==================================
                  UNKNOWN ROUTES

                  Any route that does not exist
                  will redirect to homepage
              =================================== */}

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

