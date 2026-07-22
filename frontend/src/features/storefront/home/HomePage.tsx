import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, Clock, CreditCard, Camera } from 'lucide-react';
import { useProducts } from '../../../shared/hooks/apiHooks';
import { ProductCard } from '../../../shared/components/ProductCard';
import { Button } from '../../../shared/components/Button';
import { useAddToCart } from '../../../shared/hooks/cartHooks';
import { useAuthStore } from '../../../stores/authStore';
import { cn } from '../../../shared/utils/cn';

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop",
    tag: "Bộ Sưu Tập Thu Đông 2026",
    title: "Định Hình<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed-dim to-white'>Phong Cách Riêng</span>",
    description: "Khám phá những thiết kế tinh tế, chất liệu cao cấp mang lại sự sang trọng và thoải mái cho từng khoảnh khắc.",
    link: "/products"
  },
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
    tag: "Thời Trang Công Sở",
    title: "Thanh Lịch<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed-dim to-white'>Tự Tin Tỏa Sáng</span>",
    description: "Nâng tầm phong cách chuyên nghiệp với những bộ suit và sơ mi cắt may chuẩn xác nhất.",
    link: "/products?categoryId=Phụ Kiện"
  },
  {
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop",
    tag: "Xu Hướng Mới",
    title: "Bứt Phá<br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed-dim to-white'>Giới Hạn Bản Thân</span>",
    description: "Thể hiện cá tính mạnh mẽ với bộ sưu tập mang âm hưởng đường phố hiện đại.",
    link: "/products?gender=Nữ"
  }
];

export const HomePage = () => {
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ page: 1 });
  const { mutate: addToCart } = useAddToCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleQuickAdd = (product: any) => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/';
      return;
    }
    addToCart({ productId: product.id, quantity: 1, product });
  };

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-24">
      {/* 1. Hero Section (Slider) */}
      <section className="relative h-[80vh] min-h-[600px] max-h-[900px] flex items-center overflow-hidden bg-black">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            <img
              src={slide.image}
              alt={`Slide ${index + 1}`}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-transform duration-[10000ms] ease-out",
                index === currentSlide ? "scale-105" : "scale-100"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

            <div className="relative z-10 layout-container w-full h-full flex items-center text-white">
              <div className={cn(
                "max-w-2xl flex flex-col items-start gap-6 bg-black/10 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl transition-all duration-1000 transform",
                index === currentSlide ? "translate-y-0 opacity-100 delay-300" : "translate-y-8 opacity-0"
              )}>
                <span className="text-label-sm uppercase tracking-[0.2em] text-primary-fixed-dim border-b border-primary-fixed-dim/30 pb-2">
                  {slide.tag}
                </span>
                <h1
                  className="text-display-lg-mobile md:text-display-lg font-bold leading-[1.1]"
                  dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                <p className="text-body-lg text-gray-300 md:text-xl font-light leading-relaxed">
                  {slide.description}
                </p>
                <div className="mt-4 flex gap-4">
                  <Button onClick={() => window.location.href = slide.link} variant="accent" className="h-14 px-8 text-body-md font-bold rounded-full shadow-[0_0_20px_rgba(15,76,129,0.4)] hover:shadow-[0_0_30px_rgba(15,76,129,0.6)] transition-all">
                    Khám Phá Ngay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-12 h-1.5 rounded-full transition-all duration-500",
                index === currentSlide ? "bg-primary w-20" : "bg-white/40 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* 1.5. Brand Perks */}
      <section className="bg-surface-container-lowest border-y border-outline-variant/20 py-12">
        <div className="layout-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-outline-variant/20">
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center text-primary mb-4">
                <Truck size={28} />
              </div>
              <h3 className="text-title-md font-bold mb-2">Miễn Phí Giao Hàng</h3>
              <p className="text-body-md text-on-surface-variant">Cho mọi đơn hàng từ 1.000.000đ</p>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center text-primary mb-4">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-title-md font-bold mb-2">Đổi Trả Dễ Dàng</h3>
              <p className="text-body-md text-on-surface-variant">Trong vòng 30 ngày hoàn toàn miễn phí</p>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center text-primary mb-4">
                <Clock size={28} />
              </div>
              <h3 className="text-title-md font-bold mb-2">Hỗ Trợ 24/7</h3>
              <p className="text-body-md text-on-surface-variant">Luôn sẵn sàng giải đáp mọi thắc mắc</p>
            </div>
            <div className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-primary-container/30 flex items-center justify-center text-primary mb-4">
                <CreditCard size={28} />
              </div>
              <h3 className="text-title-md font-bold mb-2">Thanh Toán An Toàn</h3>
              <p className="text-body-md text-on-surface-variant">Bảo mật thông tin tuyệt đối với SSL</p>
            </div>
          </div>
        </div>
      </section>
      {/* 2. Explore Categories */}
      <section className="max-w-container mx-auto px-4 md:px-12 w-full pt-8">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-display-sm md:text-display-md font-bold text-center">Khám Phá Danh Mục</h2>
          <div className="h-1 w-24 bg-primary mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Link to="/products?gender=Nữ" className="group relative min-h-[420px] rounded-2xl overflow-hidden block w-full md:col-span-1 shadow-ambient hover:shadow-xl transition-all duration-300">
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop" alt="Nữ" loading="lazy" onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-8 left-8 flex flex-col gap-3">
              <h3 className="text-display-sm text-white font-bold tracking-wide">Thời Trang Nữ</h3>
              <span className="text-body-lg text-white/80 group-hover:text-white flex items-center gap-2 transition-colors">
                Mua sắm ngay <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </div>
          </Link>
          <Link to="/products?gender=Nam" className="group relative min-h-[420px] rounded-2xl overflow-hidden block w-full md:col-span-1 shadow-ambient hover:shadow-xl transition-all duration-300">
            <img src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop" alt="Nam" loading="lazy" onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-8 left-8 flex flex-col gap-3">
              <h3 className="text-display-sm text-white font-bold tracking-wide">Thời Trang Nam</h3>
              <span className="text-body-lg text-white/80 group-hover:text-white flex items-center gap-2 transition-colors">
                Mua sắm ngay <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </div>
          </Link>
          <Link to="/products?categoryId=Phụ Kiện" className="group relative min-h-[300px] rounded-2xl overflow-hidden block md:col-span-2 w-full shadow-ambient hover:shadow-xl transition-all duration-300">
            <img src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop" alt="Phụ Kiện" loading="lazy" onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 flex flex-col gap-3">
              <h3 className="text-display-sm md:text-display-md text-white font-bold tracking-wide">Phụ Kiện Cao Cấp</h3>
              <span className="text-body-lg text-white/80 group-hover:text-white flex items-center gap-2 transition-colors">
                Khám phá bộ sưu tập <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Featured Products */}
      <section className="bg-surface-container-lowest py-16">
        <div className="layout-container">
          <div className="flex items-end justify-between mb-10 border-b border-outline-variant/30 pb-6">
            <div>
              <h2 className="text-display-sm font-bold text-on-surface">Sản Phẩm Nổi Bật</h2>
              <p className="text-body-lg text-on-surface-variant mt-2">Những thiết kế được yêu thích nhất mùa này</p>
            </div>
            <Link to="/products" className="text-title-md font-semibold text-primary hover:text-primary-container flex items-center gap-2 transition-colors group">
              Xem tất cả <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoadingProducts ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[4/5] bg-surface-variant rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {productsData?.data.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} onQuickAdd={handleQuickAdd} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3.5. Promo Banner */}
      <section className="relative py-24 my-12 overflow-hidden mx-4 md:mx-12 rounded-[2rem]">
        <img
          src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop"
          alt="Promo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full max-w-3xl mx-auto px-6">
          <span className="text-white/80 uppercase tracking-widest font-semibold mb-4 text-sm md:text-base border-b border-white/30 pb-2">Phiên Bản Giới Hạn</span>
          <h2 className="text-white text-display-md md:text-display-lg font-bold mb-6">Màu Sắc Mới, Phong Cách Mới</h2>
          <p className="text-white/90 text-lg md:text-xl mb-10 font-light leading-relaxed">
            Khám phá ngay bộ sưu tập Capsule độc quyền với các phối màu xu hướng nhất năm nay. Số lượng giới hạn, chỉ dành riêng cho bạn.
          </p>
          <Button onClick={() => window.location.href = '/products'} variant="primary" className="bg-white text-black hover:bg-gray-100 h-14 px-10 rounded-full font-bold shadow-2xl">
            Khám Phá Bộ Sưu Tập
          </Button>
        </div>
      </section>
      {/* 4. Testimonials */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container to-surface-container-highest" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />

        <div className="relative z-10 layout-container">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-display-sm md:text-display-md font-bold text-center">Khách Hàng Nói Gì Về Chúng Tôi</h2>
            <div className="h-1 w-24 bg-primary mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Nguyễn Văn A', role: 'Thành viên Vàng', review: 'Chất liệu vải cực kỳ tốt, phom dáng chuẩn như may đo. Sẽ tiếp tục ủng hộ LuxeRetail trong tương lai.' },
              { name: 'Trần Thị B', role: 'Thành viên Bạc', review: 'Giao hàng nhanh chóng, đóng gói cẩn thận và đẹp mắt. Áo vest nam tính và rất sang trọng.' },
              { name: 'Lê Hoàng C', role: 'Khách hàng mới', review: 'Lần đầu mua hàng nhưng cực kỳ ấn tượng với thiết kế của bộ sưu tập mới. Rất đáng đồng tiền.' }
            ].map((testi, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-white/40 flex flex-col gap-6 shadow-ambient hover:-translate-y-2 transition-transform duration-300">
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, j) => <Star key={j} size={20} fill="currentColor" />)}
                </div>
                <p className="text-body-lg text-on-surface-variant italic flex-grow leading-relaxed">"{testi.review}"</p>
                <div className="flex items-center gap-4 pt-6 border-t border-outline-variant/30">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl shadow-md">
                    {testi.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-title-md font-bold text-on-surface">{testi.name}</span>
                    <span className="text-label-md text-primary tracking-wide uppercase mt-1">{testi.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Social Instagram Feed */}
      <section className="max-w-container mx-auto px-4 w-full py-16">
        <div className="flex flex-col items-center text-center mb-10">
          <Camera size={36} className="text-primary mb-4" />
          <h2 className="text-display-sm md:text-headline-lg font-bold">@LuxeRetail trên Instagram</h2>
          <p className="text-body-lg text-on-surface-variant mt-2">Chia sẻ khoảnh khắc phong cách của bạn với hashtag #LuxeStyle</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=400&auto=format&fit=crop'
          ].map((img, idx) => (
            <div key={idx} className="relative aspect-square group overflow-hidden rounded-xl cursor-pointer shadow-sm">
              <img src={img} alt={`Social ${idx}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Camera size={32} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
