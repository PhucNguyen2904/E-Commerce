import { ProductCard, type Product } from '../../../shared/components/ProductCard';
import { useAddToCart } from '../../../shared/hooks/cartHooks';
import { useAuthStore } from '../../../stores/authStore';
import { Percent } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { useProducts } from '../../../shared/hooks/apiHooks';

export const SalePage = () => {
  const { mutate: addToCart } = useAddToCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: productsData, isLoading } = useProducts({ isSale: true, page: 1 });

  const handleQuickAdd = (product: Product) => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/sale';
      return;
    }
    addToCart({ productId: product.id, quantity: 1, product });
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Hero Banner */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-black">
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop"
          alt="Sale Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80" />
        
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-3xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-error text-white mb-6 animate-pulse">
            <Percent size={32} />
          </div>
          <h1 className="text-display-lg md:text-display-xl font-black text-white tracking-tight mb-4 uppercase">
            Mid-Season <span className="text-error">Sale</span>
          </h1>
          <p className="text-headline-sm md:text-headline-md text-white/90 mb-8 font-light">
            Ưu đãi lên đến <span className="font-bold text-error">50%</span> cho các sản phẩm hot nhất.
          </p>
          <Button variant="primary" className="bg-white text-black hover:bg-gray-200 h-14 px-10 rounded-full font-bold shadow-2xl uppercase tracking-wider text-label-lg">
            Săn Sale Ngay
          </Button>
        </div>
      </section>

      {/* Sale Products Grid */}
      <section className="layout-container pt-20">
        <div className="flex items-end justify-between mb-10 border-b border-outline-variant/30 pb-6">
          <div>
            <h2 className="text-display-sm font-bold text-on-surface">Flash Sale Đang Diễn Ra</h2>
            <p className="text-body-lg text-on-surface-variant mt-2">Số lượng có hạn. Mua ngay kẻo lỡ!</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[4/5] bg-surface-variant rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {productsData?.data?.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickAdd={handleQuickAdd} 
              />
            ))}
          </div>
        )}
      </section>
      
      {/* Newsletter Banner */}
      <section className="layout-container mt-24">
        <div className="bg-surface-container rounded-3xl p-8 md:p-16 text-center flex flex-col items-center">
          <h3 className="text-display-sm font-bold mb-4">Đừng Bỏ Lỡ Bất Kỳ Ưu Đãi Nào</h3>
          <p className="text-body-lg text-on-surface-variant mb-8 max-w-2xl">
            Đăng ký nhận bản tin để là người đầu tiên biết về các chương trình khuyến mãi, bộ sưu tập mới và sự kiện đặc biệt từ LuxeRetail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
            <input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              className="flex-grow h-14 px-6 rounded-full border border-outline bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <Button variant="primary" className="h-14 px-8 rounded-full whitespace-nowrap">
              Đăng Ký
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
