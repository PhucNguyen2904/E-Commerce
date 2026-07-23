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
      <aside className="w-64 bg-inverse-surface text-inverse-on-surface flex flex-col shrink-0 shadow-xl z-20 relative">
        <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0 bg-black/10">
          <span className="text-headline-sm font-bold tracking-tight text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-fixed to-primary-fixed-dim flex items-center justify-center text-on-primary-fixed shadow-ambient">
              L
            </div>
            LuxeRetail <span className="text-primary-fixed font-medium">Admin</span>
          </span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 custom-scrollbar">
          {menuItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-body-md font-semibold transition-all duration-300 ease-out overflow-hidden",
                isActive 
                  ? "text-on-primary-fixed shadow-md shadow-primary-fixed/20 transform scale-[1.02]" 
                  : "text-inverse-on-surface hover:bg-white/5 hover:text-white hover:translate-x-1"
              )}
            >
              {({ isActive }) => (
                <>
                  {/* Active background gradient */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-fixed/90 to-primary-fixed-dim/90 z-0"></div>
                  )}
                  {/* Icon and Label */}
                  <div className={cn("relative z-10 flex items-center gap-3", isActive && "drop-shadow-sm")}>
                    <div className={cn(
                      "transition-transform duration-300",
                      !isActive && "group-hover:scale-110 group-hover:text-primary-fixed"
                    )}>
                      {item.icon}
                    </div>
                    {item.label}
                  </div>
                  {/* Active Indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-white rounded-r-full z-10 shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 shrink-0 bg-black/10">
          <button 
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl text-body-md font-semibold text-error-container hover:bg-error-container hover:text-on-error-container transition-all duration-300 ease-out"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        {/* Header */}
        <header className="h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 px-8 flex items-center justify-end shrink-0 z-10 sticky top-0 transition-all">
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex flex-col items-end">
              <span className="text-body-md text-on-surface font-bold leading-tight">{user?.name || 'Admin'}</span>
              <span className="text-label-sm text-on-surface-variant font-medium">Administrator</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-container text-white flex items-center justify-center font-bold shadow-md border-2 border-surface">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
