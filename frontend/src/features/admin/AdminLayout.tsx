import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, Layers, Users, ShoppingCart, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../shared/utils/cn';

export const AdminLayout = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} />, exact: true },
    { path: '/admin/products', label: 'Sản phẩm', icon: <Package size={20} /> },
    { path: '/admin/categories', label: 'Danh mục', icon: <Tag size={20} /> },
    { path: '/admin/inventory', label: 'Tồn kho', icon: <Layers size={20} /> },
    { path: '/admin/orders', label: 'Đơn hàng', icon: <ShoppingCart size={20} /> },
    { path: '/admin/users', label: 'Người dùng', icon: <Users size={20} /> },
  ];

  return (
    <div className="flex h-screen w-full bg-surface-container overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-inverse-surface text-inverse-on-surface flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <span className="text-headline-sm font-bold tracking-tight text-white">LuxeRetail <span className="text-primary-fixed">Admin</span></span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-body-md font-semibold transition-all",
                isActive 
                  ? "bg-primary-fixed text-on-primary-fixed" 
                  : "text-inverse-on-surface hover:bg-white/10"
              )}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-body-md font-semibold text-error hover:bg-error/10 transition-colors"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 px-8 flex items-center justify-end shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <span className="text-body-md text-on-surface-variant font-medium">Chào, {user?.name || 'Admin'}</span>
            <div className="w-9 h-9 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
