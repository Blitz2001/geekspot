import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/customer/Home';
import { ProductListing } from './pages/customer/ProductListing';
import { ProductDetail } from './pages/customer/ProductDetail';
import { Cart } from './pages/customer/Cart';
import { Checkout } from './pages/customer/Checkout';
import { OrderConfirmation } from './pages/customer/OrderConfirmation';
import { OrderTracking } from './pages/customer/OrderTracking';
import { Categories } from './pages/customer/Categories';
import { Deals } from './pages/customer/Deals';
import { Support } from './pages/customer/Support';
import { AdminLogin } from './pages/admin/AdminLogin';
import { Dashboard } from './pages/admin/Dashboard';
import { OrderManagement } from './pages/admin/OrderManagement';
import { ProductManagement } from './pages/admin/ProductManagement';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { CategoryManagement } from './pages/admin/CategoryManagement';
import { DealsManagement } from './pages/admin/DealsManagement';
import { ReviewModeration } from './pages/admin/ReviewModeration';
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute';
import './index.css';

import { ScrollToTop } from './components/common/ScrollToTop';

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AdminAuthProvider>
                <CartProvider>
                    <Toaster
                        position="bottom-right"
                        toastOptions={{
                            style: {
                                background: '#0f1f3a',
                                color: '#fff',
                                border: '1px solid #1a2b47',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#a8e600',
                                    secondary: '#0f1f3a',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                    <Routes>
                        {/* Customer Routes */}
                        <Route path="/" element={<Layout><Home /></Layout>} />
                        <Route path="/products" element={<Layout><ProductListing /></Layout>} />
                        <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
                        <Route path="/cart" element={<Layout><Cart /></Layout>} />
                        <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                        <Route path="/order-confirmation" element={<Layout><OrderConfirmation /></Layout>} />
                        <Route path="/track-order" element={<Layout><OrderTracking /></Layout>} />
                        <Route path="/categories" element={<Layout><Categories /></Layout>} />
                        <Route path="/deals" element={<Layout><Deals /></Layout>} />
                        <Route path="/support" element={<Layout><Support /></Layout>} />

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedAdminRoute>
                                    <Dashboard />
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/dashboard"
                            element={
                                <ProtectedAdminRoute>
                                    <Dashboard />
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/orders"
                            element={
                                <ProtectedAdminRoute>
                                    <OrderManagement />
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/products"
                            element={
                                <ProtectedAdminRoute>
                                    <ProductManagement />
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/customers"
                            element={
                                <ProtectedAdminRoute>
                                    <CustomerManagement />
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/categories"
                            element={
                                <ProtectedAdminRoute>
                                    <CategoryManagement />
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/deals"
                            element={
                                <ProtectedAdminRoute>
                                    <DealsManagement />
                                </ProtectedAdminRoute>
                            }
                        />
                        <Route
                            path="/admin/reviews"
                            element={
                                <ProtectedAdminRoute>
                                    <ReviewModeration />
                                </ProtectedAdminRoute>
                            }
                        />
                    </Routes>
                </CartProvider>
            </AdminAuthProvider>
        </BrowserRouter>
    );
}

export default App;
