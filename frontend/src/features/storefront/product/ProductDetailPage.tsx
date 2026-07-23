import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useProduct, useInventory } from '../../../shared/hooks/apiHooks';
import { Button } from '../../../shared/components/Button';
import { cn } from '../../../shared/utils/cn';
import { useAddToCart } from '../../../shared/hooks/cartHooks';
import { useAuthStore } from '../../../stores/authStore';
import { toast } from 'sonner';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = useProduct(id!);
  const { data: inventory } = useInventory(product?.id || '');
  
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  const { mutate: addToCart, mutateAsync: addToCartAsync, isPending: isAdding } = useAddToCart();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isLoading) {
    return (
      <div className="layout-container section-spacing animate-pulse">
        <div className="h-4 bg-surface-variant w-1/3 mb-8 rounded"></div>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-[55%] h-[500px] bg-surface-variant rounded-lg"></div>
          <div className="w-full md:w-[45%] flex flex-col gap-6">
            <div className="h-10 bg-surface-variant w-3/4 rounded"></div>
            <div className="h-8 bg-surface-variant w-1/4 rounded"></div>
            <div className="h-24 bg-surface-variant w-full rounded"></div>
            <div className="h-12 bg-surface-variant w-full rounded"></div>
            <div className="h-12 bg-surface-variant w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="layout-container section-spacing text-center py-24">
        <h2 className="text-headline-md font-bold text-error mb-4">Sản phẩm không tồn tại</h2>
        <Button onClick={() => navigate('/products')} variant="ghost" className="mx-auto">Quay lại Cửa hàng</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/products/${id}`);
      return;
    }
    
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích cỡ');
      return;
    }

    addToCart({ productId: product.id, quantity, product }, {
      onSuccess: () => toast.success('Đã thêm sản phẩm vào giỏ hàng')
    });
  };


  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }
    
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích cỡ');
      return;
    }

    try {
      await addToCartAsync({ productId: product.id, quantity, product });
      navigate('/checkout');
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  const isOutOfStock = inventory && !inventory.inStock;
  const availableQuantity = inventory?.availableQuantity || 0;

  return (
    <div className="layout-container section-spacing flex flex-col gap-16">
      
      {/* Top Section */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
        
        {/* Left: Images (~55%) */}
        <div className="w-full md:w-[55%] flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
            {[1, 2, 3].map((_, i) => (
              <button key={i} className={cn("shrink-0 w-20 h-24 border-2 rounded overflow-hidden", i === 0 ? "border-primary" : "border-transparent")}>
                <img src={product.imageUrl || '/placeholder-product.png'} alt={`${product.name} ${i}`} loading="lazy" onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 aspect-[4/5] bg-surface-container-low rounded-lg overflow-hidden">
            <img src={product.imageUrl || '/placeholder-product.png'} alt={product.name} loading="lazy" onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Right: Info (~45%) */}
        <div className="w-full md:w-[45%] flex flex-col gap-6">
          {/* Breadcrumb */}
          <nav className="text-label-sm text-on-surface-variant flex items-center gap-2">
            <Link to="/products" className="hover:text-primary">SẢN PHẨM</Link>
            <span>/</span>
            <Link to={`/products?categoryId=${product.categoryId || product.category}`} className="hover:text-primary uppercase">{product.categoryName || product.category}</Link>
            <span>/</span>
            <span className="text-on-surface truncate">{product.name}</span>
          </nav>

          <div className="flex flex-col gap-2">
            <h1 className="text-display-lg-mobile font-bold text-on-surface">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-headline-md font-semibold text-primary">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <span className="text-body-lg text-on-surface-variant line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>
          </div>

          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            {product.description}
          </p>

          <hr className="border-outline-variant/30" />

          {/* Color Selection (TODO: wait for backend real integration) */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-label-sm uppercase text-on-surface">MÀU SẮC: {selectedColor || 'CHƯA CHỌN'}</span>
              <div className="flex flex-wrap gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all",
                      selectedColor === color ? "border-primary scale-110" : "border-outline-variant hover:border-primary/50"
                    )}
                    style={{ backgroundColor: color === 'Trắng' ? '#fff' : color === 'Đen' ? '#000' : '#1e3a8a' }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-label-sm uppercase text-on-surface">KÍCH CỠ</span>
                <button className="text-body-sm font-semibold text-primary underline">Hướng dẫn chọn size</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "min-w-[3rem] h-12 px-4 rounded border font-semibold transition-colors",
                      selectedSize === size ? "border-primary bg-primary-fixed text-on-primary-fixed" : "border-outline-variant text-on-surface hover:border-primary"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inventory info */}
          <div className="flex items-center gap-2">
            <span className="text-body-md font-semibold text-on-surface">Số lượng:</span>
            <div className="flex items-center border border-outline-variant rounded">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 hover:bg-surface-container" disabled={isOutOfStock}>-</button>
              <span className="w-8 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => Math.min(availableQuantity, q + 1))} 
                className="px-4 py-2 hover:bg-surface-container"
                disabled={isOutOfStock || quantity >= availableQuantity}
              >
                +
              </button>
            </div>
            {!inventory ? null : isOutOfStock ? (
              <span className="text-body-sm text-error ml-4">Hết hàng</span>
            ) : (
              <span className="text-body-sm text-primary ml-4 flex items-center gap-1"><CheckCircle2 size={16}/> Còn {availableQuantity} sản phẩm</span>
            )}
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <Button 
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="h-14 font-bold text-[16px]"
            >
              <ShoppingCart size={20} />
              {isAdding ? 'ĐANG THÊM...' : isOutOfStock ? 'TẠM HẾT HÀNG' : 'THÊM VÀO GIỎ HÀNG'}
            </Button>
            <Button 
              variant="ghost" 
              disabled={isOutOfStock || isAdding} 
              onClick={handleBuyNow}
              className="h-14 font-bold text-[16px]"
            >
              MUA NGAY
            </Button>
          </div>

          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-outline-variant/30">
            <div className="flex items-center gap-2 text-on-surface-variant text-body-md">
              <Truck size={20} />
              <span>Giao hàng miễn phí</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant text-body-md">
              <RefreshCw size={20} />
              <span>Đổi trả 30 ngày</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 border-t border-outline-variant/30 pt-16">
        
        {/* Description & Features */}
        <div className="flex flex-col gap-6">
          <h2 className="text-headline-md font-bold">Chi tiết sản phẩm</h2>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            {product.description}
          </p>
          {product.features && product.features.length > 0 && (
            <ul className="list-disc pl-5 flex flex-col gap-2 mt-4 text-body-lg text-on-surface-variant">
              {product.features.map((feat, i) => <li key={i}>{feat}</li>)}
            </ul>
          )}
        </div>

        {/* Reviews */}
        <div className="flex flex-col gap-6">
          <h2 className="text-headline-md font-bold">Đánh giá khách hàng</h2>
          <div className="bg-surface-container flex flex-col items-center justify-center p-8 rounded-xl border border-outline-variant/20 shadow-ambient">
            <span className="text-[64px] font-bold text-on-surface leading-none">4.9</span>
            <div className="flex text-tertiary mt-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={24} fill="currentColor" />)}
            </div>
            <span className="text-body-md text-on-surface-variant mt-2">Dựa trên 128 lượt đánh giá</span>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            {[1, 2].map(i => (
              <div key={i} className="pb-4 border-b border-outline-variant/20 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">Khách hàng {i}</span>
                    <span className="text-label-sm text-on-surface-variant uppercase">Đã mua hàng</span>
                  </div>
                  <div className="flex text-tertiary">
                    {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                  </div>
                </div>
                <p className="text-body-md text-on-surface-variant">Form áo đẹp, chất vải mềm mại. Đóng gói rất cẩn thận và giao hàng siêu tốc.</p>
              </div>
            ))}
            <button className="text-primary font-bold text-body-md self-start hover:underline">
              Xem tất cả đánh giá
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};
