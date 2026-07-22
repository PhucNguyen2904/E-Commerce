import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, X, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/cartHooks';
import { useAuthStore } from '../../stores/authStore';
import { useSearchSuggestions } from '../hooks/apiHooks';

const navLinks = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Sản phẩm', path: '/products' },
  { name: 'Bộ sưu tập', path: '/collections' },
  { name: 'Giảm giá', path: '/sale' },
];

export const Header = () => {
  const { data: cartData } = useCart();
  const totalCartItems = cartData?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: suggestions, isLoading: isSuggestionsLoading, isError: isSuggestionsError, refetch: refetchSuggestions } = useSearchSuggestions(debouncedQuery);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setDebouncedQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant/30">
      <div className="layout-container h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-headline-md font-bold text-primary">
          LuxeRetail
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex h-full items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `h-full flex items-center text-body-md font-semibold transition-colors border-b-2 ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-primary hover:border-primary/50'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4 text-on-surface">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 hover:bg-surface-container rounded-full transition-colors" 
            aria-label="Search"
          >
            <Search size={24} />
          </button>
          
          <Link to={isAuthenticated ? "/cart" : "/login?redirect=/cart"} className="p-2 hover:bg-surface-container rounded-full transition-colors relative" aria-label="Cart">
            <ShoppingCart size={24} />
            {totalCartItems > 0 && (
              <span className="absolute top-0 right-0 bg-error text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full transform translate-x-1/4 -translate-y-1/4">
                {totalCartItems > 99 ? '99+' : totalCartItems}
              </span>
            )}
          </Link>

          <Link to={isAuthenticated ? "/account" : "/login"} className="p-2 text-on-surface hover:text-primary transition-colors">
            <User size={24} />
          </Link>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div ref={searchRef} className="absolute top-16 left-0 w-full bg-surface-container-lowest border-b border-outline-variant/30 py-6 shadow-ambient animate-in slide-in-from-top-2">
          <div className="layout-container relative">
            <form onSubmit={handleSearch} className="flex items-center gap-4">
              <Search size={28} className="text-on-surface-variant" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm (vd: áo thun, blazer...)"
                className="flex-1 bg-transparent border-none outline-none text-headline-sm placeholder:text-outline-variant text-on-surface"
              />
              <button 
                type="button" 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setDebouncedQuery(''); }} 
                className="p-2 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant hover:text-error"
              >
                <X size={28} />
              </button>
            </form>

            {/* Dropdown Suggestions */}
            {debouncedQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-surface-container-lowest border border-outline-variant/30 rounded-lg shadow-xl overflow-hidden z-50">
                {isSuggestionsLoading && (
                  <div className="p-6 flex justify-center text-on-surface-variant">
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                )}
                
                {isSuggestionsError && (
                  <div className="p-6 text-center">
                    <p className="text-error mb-2">Không thể kết nối đến máy chủ tìm kiếm.</p>
                    <button onClick={() => refetchSuggestions()} className="text-primary font-bold hover:underline">
                      Thử lại
                    </button>
                  </div>
                )}

                {!isSuggestionsLoading && !isSuggestionsError && suggestions && (
                  <>
                    <div className="max-h-[60vh] overflow-y-auto">
                      {suggestions.length === 0 ? (
                        <div className="p-6 text-center text-on-surface-variant">
                          Không tìm thấy sản phẩm nào khớp với '{debouncedQuery}'.
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {suggestions.map((product: any) => (
                            <Link
                              key={product.id}
                              to={`/products/${product.id}`}
                              onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setDebouncedQuery(''); }}
                              className="flex items-center gap-4 p-3 hover:bg-surface-container transition-colors border-b border-outline-variant/10 last:border-b-0"
                            >
                              <img src={product.imageUrl} alt={product.name} className="w-12 h-16 object-cover rounded bg-surface-variant" />
                              <div className="flex-1">
                                <h4 className="text-body-md font-bold text-on-surface line-clamp-1">
                                  {product.name.split(new RegExp(`(${debouncedQuery})`, 'gi')).map((part: string, i: number) => 
                                    part.toLowerCase() === debouncedQuery.toLowerCase() ? <span key={i} className="bg-primary/20 text-primary">{part}</span> : part
                                  )}
                                </h4>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    {suggestions.length > 0 && (
                      <Link
                        to={`/products?keyword=${encodeURIComponent(debouncedQuery)}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setDebouncedQuery(''); }}
                        className="block w-full p-3 text-center bg-surface-container hover:bg-surface-variant transition-colors text-primary font-bold text-body-md"
                      >
                        Xem tất cả kết quả cho '{debouncedQuery}' →
                      </Link>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
