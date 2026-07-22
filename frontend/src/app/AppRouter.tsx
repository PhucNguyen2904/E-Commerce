import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { StorefrontLayout } from '../features/storefront/StorefrontLayout';
import { HomePage } from '../features/storefront/home/HomePage';
import { CollectionsPage } from '../features/storefront/collections/CollectionsPage';
import { SalePage } from '../features/storefront/sale/SalePage';
import { ProductListPage } from '../features/storefront/product/ProductListPage';
import { ProductDetailPage } from '../features/storefront/product/ProductDetailPage';
import { CartPage } from '../features/storefront/cart/CartPage';
import { CheckoutPage } from '../features/storefront/checkout/CheckoutPage';
import { OrderTrackingPage } from '../features/storefront/checkout/OrderTrackingPage';
import { MockPaymentPage } from '../features/storefront/checkout/MockPaymentPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { AccountLayout } from '../features/account/AccountLayout';
import { ProfilePage } from '../features/account/ProfilePage';
import { OrderHistoryPage } from '../features/account/OrderHistoryPage';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { AdminLayout } from '../features/admin/AdminLayout';
import { AdminDashboardPage } from '../features/admin/AdminDashboardPage';
import { AdminCategoriesPage } from '../features/admin/AdminCategoriesPage';
import { AdminProductsPage } from '../features/admin/AdminProductsPage';
import { AdminInventoryPage } from '../features/admin/AdminInventoryPage';
import { AdminOrdersPage } from '../features/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '../features/admin/AdminOrderDetailPage';
import { AdminUsersPage } from '../features/admin/AdminUsersPage';
import { NotFoundPage } from '../shared/components/NotFoundPage';
import { ForbiddenPage } from '../shared/components/ForbiddenPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'collections',
        element: <CollectionsPage />,
      },
      {
        path: 'sale',
        element: <SalePage />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <OrderTrackingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/:orderId',
        element: (
          <ProtectedRoute>
            <MockPaymentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'account',
        element: (
          <ProtectedRoute>
            <AccountLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="profile" replace />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'orders',
            element: <OrderHistoryPage />,
          }
        ]
      }
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute role="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: 'categories',
        element: <AdminCategoriesPage />,
      },
      {
        path: 'products',
        element: <AdminProductsPage />,
      },
      {
        path: 'inventory',
        element: <AdminInventoryPage />,
      },
      {
        path: 'orders',
        element: <AdminOrdersPage />,
      },
      {
        path: 'orders/:id',
        element: <AdminOrderDetailPage />,
      },
      {
        path: 'users',
        element: <AdminUsersPage />,
      },
    ]
  },
  {
    path: '/403',
    element: <ForbiddenPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
