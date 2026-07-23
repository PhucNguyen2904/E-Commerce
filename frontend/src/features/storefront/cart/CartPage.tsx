import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { useCart, useUpdateCartItem, useRemoveFromCart, useApplyDiscount } from '../../../shared/hooks/cartHooks';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Stepper component for quantity
const QuantityStepper = ({ initialQuantity, onUpdate }: { initialQuantity: number, onUpdate: (q: number) => void }) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleDecrease = () => {
    if (quantity > 1) {
      const newQ = quantity - 1;
      setQuantity(newQ);
      onUpdate(newQ);
    }
  };

  const handleIncrease = () => {
    const newQ = quantity + 1;
    setQuantity(newQ);
    onUpdate(newQ);
  };

  return (
    <div className="flex items-center border border-outline-variant rounded w-max">
      <button onClick={handleDecrease} className="w-8 h-8 flex items-center justify-center hover:bg-surface-container disabled:opacity-50" disabled={quantity <= 1}>-</button>
      <span className="w-10 text-center text-body-md font-semibold">{quantity}</span>
      <button onClick={handleIncrease} className="w-8 h-8 flex items-center justify-center hover:bg-surface-container">+</button>
    </div>
  );
};

export const CartPage = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromCart();
  const { mutate: applyDiscount } = useApplyDiscount();
  
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    // Note: The useUpdateCartItem hook internally has a fake network delay, 
    // but in a real app, we might want to debounce the API call here.
    updateItem({ productId, quantity: newQuantity });
  };

  const handleRemove = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
      removeItem(productId);
    }
  };

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      setDiscountError('Vui lòng nhập mã giảm giá');
      return;
    }
    setDiscountError('');
    applyDiscount(discountCode, {
      onError: () => setDiscountError('Mã giảm giá không hợp lệ hoặc đã hết hạn')
    });
  };

  if (isLoading) {
    return (
      <div className="layout-container section-spacing animate-pulse">
        <div className="h-10 bg-surface-variant w-1/3 rounded mb-8"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[65%] h-[400px] bg-surface-variant rounded"></div>
          <div className="w-full lg:w-[35%] h-[300px] bg-surface-variant rounded"></div>
        </div>
      </div>
    );
  }

  const cartItems = cartData?.items || [];
  const isEmpty = cartItems.length === 0;

  if (isEmpty) {
    return (
      <div className="layout-container section-spacing flex flex-col items-center justify-center py-20 gap-6">
        <h1 className="text-display-lg-mobile font-bold text-on-surface">Giỏ hàng rỗng</h1>
        <p className="text-body-lg text-on-surface-variant text-center">
          Bạn chưa có sản phẩm nào trong giỏ hàng.<br/>
          Hãy tiếp tục khám phá các bộ sưu tập của chúng tôi.
        </p>
        <Button onClick={() => navigate('/products')} className="mt-4 px-8">
          TIẾP TỤC MUA SẮM
        </Button>
      </div>
    );
  }

  const subtotal = cartData?.originalTotalPrice || cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
  const totalPrice = cartData?.totalPrice || subtotal;
  const discountAmount = subtotal - totalPrice;

  return (
    <div className="layout-container section-spacing">
      
      <nav className="text-label-sm text-on-surface-variant flex items-center gap-2 mb-6">
        <Link to="/" className="hover:text-primary">TRANG CHỦ</Link>
        <span>/</span>
        <span className="text-on-surface">GIỎ HÀNG</span>
      </nav>

      <h1 className="text-display-lg-mobile md:text-display-lg font-bold mb-10">Giỏ hàng của bạn</h1>

      <div className="flex flex-col lg:flex-row gap-12 relative items-start">
        
        {/* Left: Product Table */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6">
          <div className="w-full overflow-x-auto pb-4">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/30">
                  <th className="py-4 px-4 text-body-md font-bold text-on-surface">Sản phẩm</th>
                  <th className="py-4 px-4 text-body-md font-bold text-on-surface w-32">Đơn giá</th>
                  <th className="py-4 px-4 text-body-md font-bold text-on-surface w-32">Số lượng</th>
                  <th className="py-4 px-4 text-body-md font-bold text-on-surface text-right w-36">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.productId} className="border-b border-outline-variant/20">
                    <td className="py-6 px-4">
                      <div className="flex items-start gap-4">
                        <img 
                          src={item.product?.imageUrl || '/placeholder-product.png'} 
                          alt={item.product?.name} 
                          loading="lazy"
                          onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }}
                          className="w-20 h-25 object-cover rounded bg-surface-container"
                        />
                        <div className="flex flex-col gap-1">
                          <span className="text-label-sm uppercase text-on-surface-variant">{item.product?.categoryName || item.product?.category}</span>
                          <Link to={`/products/${item.productId}`} className="text-body-md font-bold hover:text-primary line-clamp-2">
                            {item.product?.name}
                          </Link>
                          {/* Variant placeholder if backend supports later */}
                          <span className="text-body-sm text-on-surface-variant mt-1">Màu: Đen, Kích cỡ: M</span>
                          
                          <button 
                            onClick={() => handleRemove(item.productId)}
                            disabled={isRemoving}
                            className="text-error text-body-sm flex items-center gap-1 mt-2 hover:underline disabled:opacity-50 w-max"
                          >
                            <Trash2 size={14} /> Xóa
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-body-md text-on-surface">
                      {formatCurrency(item.product?.price || 0)}
                    </td>
                    <td className="py-6 px-4">
                      <QuantityStepper 
                        initialQuantity={item.quantity} 
                        onUpdate={(q) => handleQuantityChange(item.productId, q)} 
                      />
                    </td>
                    <td className="py-6 px-4 text-right text-body-md font-bold text-primary">
                      {formatCurrency((item.product?.price || 0) * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Link to="/products" className="text-primary font-semibold text-body-md flex items-center gap-2 hover:underline w-max mt-4">
            <ArrowLeft size={18} /> Tiếp tục mua sắm
          </Link>
        </div>

        {/* Right: Order Summary */}
        <div className="w-full lg:w-[35%] lg:sticky lg:top-24 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-ambient flex flex-col gap-6">
          <h2 className="text-headline-md font-bold border-b border-outline-variant/30 pb-4">Tóm tắt đơn hàng</h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-body-md font-semibold">Mã giảm giá</label>
            <div className="flex gap-2">
              <Input 
                placeholder="Nhập mã..." 
                className="h-12" 
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <Button variant="ghost" className="shrink-0 h-12" onClick={handleApplyDiscount}>ÁP DỤNG</Button>
            </div>
            {discountError && <span className="text-label-sm text-error">{discountError}</span>}
            {cartData?.discountCode && (
              <span className="text-label-sm text-primary">
                Đang áp dụng mã: <strong>{cartData.discountCode}</strong>
              </span>
            )}
          </div>

          <hr className="border-outline-variant/30 my-2" />

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-body-md">
              <span className="text-on-surface-variant">Tổng tiền hàng</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-body-md">
              <span className="text-on-surface-variant">Phí giao hàng</span>
              <span className="font-semibold">Miễn phí</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-body-md text-primary">
                <span>Giảm giá</span>
                <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
          </div>

          <hr className="border-outline-variant/30 my-2" />

          <div className="flex justify-between items-end">
            <span className="text-body-lg font-bold">Tổng thanh toán</span>
            <span className="text-headline-md font-bold text-primary">{formatCurrency(totalPrice)}</span>
          </div>

          <Button variant="accent" className="h-14 mt-4" onClick={() => navigate('/checkout')}>
            TIẾN HÀNH THANH TOÁN <ArrowRight size={20} />
          </Button>

          <p className="text-label-sm text-on-surface-variant text-center mt-2 flex items-center justify-center gap-1">
            <Lock size={14} className="text-on-surface-variant" /> Thanh toán an toàn & bảo mật
          </p>
        </div>

      </div>
    </div>
  );
};
