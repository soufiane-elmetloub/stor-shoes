import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import InventoryPage from './pages/InventoryPage';
import InventoryProductDetailsPage from './pages/InventoryProductDetailsPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryEditorPage from './pages/CategoryEditorPage';
import ReportsPage from './pages/ReportsPage';
import SalesPage from './pages/SalesPage';
import ContactMessagesPage from './pages/ContactMessagesPage';
import ContactMessageDetailsPage from './pages/ContactMessageDetailsPage';
import SettingsPage from './pages/SettingsPage';
import ProductEditorPage from './pages/ProductEditorPage';
import ArchivePage from './pages/ArchivePage';
import AnalyticsPage from './pages/AnalyticsPage';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="loading-spinner"><div className="spinner" /></div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductEditorPage />} />
        <Route path="products/edit/:id" element={<ProductEditorPage />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="inventory/:id" element={<InventoryProductDetailsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="categories/new" element={<CategoryEditorPage />} />
        <Route path="categories/edit/:id" element={<CategoryEditorPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="contact" element={<ContactMessagesPage />} />
        <Route path="contact/:id" element={<ContactMessageDetailsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-left" toastOptions={{
          duration: 3000,
          style: { borderRadius: '12px', background: '#1e293b', color: '#fff', direction: 'rtl' },
        }} />
      </AuthProvider>
    </BrowserRouter>
  );
}
