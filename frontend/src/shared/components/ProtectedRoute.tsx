import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

export const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: string }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  if (role && user?.role !== role) {
    toast.error('Bạn không có quyền hạn cần thiết để truy cập vào khu vực này.');
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
