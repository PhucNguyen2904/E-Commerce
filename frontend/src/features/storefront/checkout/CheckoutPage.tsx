import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCart, useClearCart } from '../../../shared/hooks/cartHooks';
import { useCreateOrder } from '../../../shared/hooks/orderHooks';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { ArrowLeft } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên không được vượt quá 50 ký tự'),
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  province: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố'),
  district: z.string().min(1, 'Vui lòng chọn Quận/Huyện'),
  ward: z.string().min(1, 'Vui lòng chọn Phường/Xã'),
  streetAddress: z.string().min(5, 'Địa chỉ cụ thể phải có ít nhất 5 ký tự'),
  paymentMethod: z.enum(['COD', 'VNPAY']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { data: cartData, isLoading: isCartLoading } = useCart();
  const cartItems = cartData?.items || [];
  const { mutate: clearCart } = useClearCart();
  const { mutateAsync: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      province: '',
      district: '',
      ward: '',
      paymentMethod: 'COD',
    }
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const selectedProvince = watch('province');
  const selectedDistrict = watch('district');

  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/p/')
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(() => toast.error('Không thể tải danh sách Tỉnh/Thành phố'));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then(res => res.json())
        .then(data => setDistricts(data.districts || []));
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then(res => res.json())
        .then(data => setWards(data.wards || []));
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (!isCartLoading && cartItems.length === 0) {
      toast.error('Giỏ hàng rỗng, không thể tiến hành thanh toán.');
      navigate('/cart');
    }
  }, [cartItems, isCartLoading, navigate]);

  if (isCartLoading || cartItems.length === 0) {
    return <div className="layout-container section-spacing text-center">Đang tải...</div>;
  }

  const subtotal = cartData?.originalTotalPrice || cartItems.reduce((total, item) => total + (item.product?.price || 0) * item.quantity, 0);
  const totalPrice = cartData?.totalPrice || subtotal;
  const discountAmount = subtotal - totalPrice;

  const onSubmit = async (data: CheckoutFormValues) => {
    const provinceName = provinces.find(p => p.code == data.province)?.name || '';
    const districtName = districts.find(d => d.code == data.district)?.name || '';
    const wardName = wards.find(w => w.code == data.ward)?.name || '';
    const fullAddress = `${data.streetAddress}, ${wardName}, ${districtName}, ${provinceName}`;

    try {
      const order = await createOrder({
        shippingAddress: fullAddress,
        paymentMethod: data.paymentMethod,
      });
      // Clear cart after successful order creation
      clearCart();
      toast.success('Đặt hàng thành công!');
      if (order.paymentUrl) {
        navigate(order.paymentUrl);
      } else {
        navigate(`/orders/${order.id}`);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="layout-container section-spacing">
      <nav className="text-label-sm text-on-surface-variant flex items-center gap-2 mb-6">
        <Link to="/cart" className="hover:text-primary">GIỎ HÀNG</Link>
        <span>/</span>
        <span className="text-on-surface">THANH TOÁN</span>
      </nav>

      <h1 className="text-display-lg-mobile md:text-display-lg font-bold mb-10">Thanh toán</h1>

      <div className="flex flex-col lg:flex-row gap-12 relative items-start">
        
        {/* Left: Shipping Form */}
        <div className="w-full lg:w-[65%] flex flex-col gap-8">
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <h2 className="text-headline-md font-bold border-b border-outline-variant/30 pb-4">Thông tin giao hàng</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Họ và tên" 
                placeholder="Nhập họ và tên..." 
                {...register('fullName')} 
                error={errors.fullName?.message}
              />
              <Input 
                label="Số điện thoại" 
                placeholder="Ví dụ: 0912345678" 
                {...register('phone')} 
                error={errors.phone?.message}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-bold text-on-surface">Tỉnh/Thành phố</label>
                <select 
                  className={`h-12 px-4 rounded-xl border bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errors.province ? 'border-error' : 'border-outline-variant'}`}
                  {...register('province')}
                  onChange={(e) => {
                    register('province').onChange(e);
                    setValue('district', '');
                    setValue('ward', '');
                  }}
                >
                  <option value="">Chọn Tỉnh/Thành</option>
                  {provinces.map(p => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
                {errors.province && <span className="text-label-sm text-error">{errors.province.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-bold text-on-surface">Quận/Huyện</label>
                <select 
                  className={`h-12 px-4 rounded-xl border bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errors.district ? 'border-error' : 'border-outline-variant'}`}
                  {...register('district')}
                  onChange={(e) => {
                    register('district').onChange(e);
                    setValue('ward', '');
                  }}
                  disabled={!selectedProvince}
                >
                  <option value="">Chọn Quận/Huyện</option>
                  {districts.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
                {errors.district && <span className="text-label-sm text-error">{errors.district.message}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-bold text-on-surface">Phường/Xã</label>
                <select 
                  className={`h-12 px-4 rounded-xl border bg-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary ${errors.ward ? 'border-error' : 'border-outline-variant'}`}
                  {...register('ward')}
                  disabled={!selectedDistrict}
                >
                  <option value="">Chọn Phường/Xã</option>
                  {wards.map(w => (
                    <option key={w.code} value={w.code}>{w.name}</option>
                  ))}
                </select>
                {errors.ward && <span className="text-label-sm text-error">{errors.ward.message}</span>}
              </div>
            </div>

            <Input 
              label="Địa chỉ chi tiết" 
              placeholder="Nhập số nhà, tên đường..." 
              {...register('streetAddress')} 
              error={errors.streetAddress?.message}
            />
            
            <div className="bg-surface-container-low p-4 rounded-lg mt-4 flex gap-4 text-body-md text-on-surface-variant flex-col">
              <div className="flex gap-4">
                <span>💳</span>
                <p className="font-bold text-on-surface">Phương thức thanh toán</p>
              </div>
              <div className="flex flex-col gap-3 pl-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" value="COD" {...register('paymentMethod')} className="w-5 h-5 accent-primary" />
                  <span className="text-on-surface">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" value="VNPAY" {...register('paymentMethod')} className="w-5 h-5 accent-primary" />
                  <span className="text-on-surface">Thanh toán trực tuyến (VNPAY)</span>
                </label>
              </div>
            </div>
          </form>

          <Link to="/cart" className="text-primary font-semibold text-body-md flex items-center gap-2 hover:underline w-max">
            <ArrowLeft size={18} /> Quay lại giỏ hàng
          </Link>
        </div>

        {/* Right: Order Summary (Read Only) */}
        <div className="w-full lg:w-[35%] lg:sticky lg:top-24 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-ambient flex flex-col gap-6">
          <h2 className="text-headline-md font-bold border-b border-outline-variant/30 pb-4">Đơn hàng của bạn</h2>
          
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
            {cartItems.map(item => (
              <div key={item.productId} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={item.product?.imageUrl || '/placeholder-product.png'} 
                      alt={item.product?.name} 
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }}
                      className="w-16 h-20 object-cover rounded bg-surface-container shrink-0"
                    />
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-body-md font-bold line-clamp-1">{item.product?.name}</span>
                    <span className="text-label-sm text-on-surface-variant">Màu: Đen, Size: M</span>
                  </div>
                </div>
                <span className="text-body-md font-semibold shrink-0">
                  {formatCurrency((item.product?.price || 0) * item.quantity)}
                </span>
              </div>
            ))}
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

          <Button 
            type="submit" 
            form="checkout-form"
            variant="accent" 
            className="h-14 mt-4" 
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? 'ĐANG ĐẶT HÀNG...' : 'ĐẶT HÀNG'}
          </Button>
        </div>

      </div>
    </div>
  );
};
