import { Outlet, NavLink } from 'react-router-dom';
import { User, ShoppingBag, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../shared/utils/cn';

export const AccountLayout = () => {
  const logout = useAuthStore((state: any) => state.logout);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const navItems = [
    { path: '/account/profile', label: 'Hồ sơ cá nhân', icon: <User size={20} /> },
    { path: '/account/orders', label: 'Lịch sử đơn hàng', icon: <ShoppingBag size={20} /> },
  ];

  return (
    <div className="layout-container section-spacing flex flex-col md:flex-row gap-8 lg:gap-12 min-h-[60vh]">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <h1 className="text-headline-md font-bold text-on-surface mb-4 px-4">Tài khoản</h1>
        
        <nav className="flex flex-col gap-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-body-md font-semibold transition-colors",
                isActive ? "bg-primary-container text-primary" : "text-on-surface hover:bg-surface-container"
              )}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-body-md font-semibold text-error hover:bg-error-container/30 transition-colors mt-4"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

    </div>
  );
};
