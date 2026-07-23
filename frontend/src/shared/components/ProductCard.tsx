import { Link } from 'react-router-dom';
import { ProductBadge } from './ProductBadge';
import { ShoppingCart } from 'lucide-react';
import { cn } from '../utils/cn';

export interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  imageUrl: string;
  isNew?: boolean;
  discountPercentage?: number;
}

export interface ProductCardProps {
  product: Product;
  className?: string;
  onQuickAdd?: (product: Product) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const ProductCard = ({ product, className, onQuickAdd }: ProductCardProps) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const calculatedDiscount = hasDiscount 
    ? Math.round((1 - product.price / product.originalPrice!) * 100) 
    : 0;
  const displayDiscount = product.discountPercentage || calculatedDiscount;

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden transition-colors hover:border-primary',
        className
      )}
    >
      {/* Image container 4:5 aspect ratio */}
      <Link to={`/products/${product.slug || product.id}`} className="block relative aspect-[4/5] bg-surface-container-low overflow-hidden">
        <img
          src={product.imageUrl || '/placeholder-product.png'}
          alt={product.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = '/placeholder-product.png'; }}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && <ProductBadge type="new" label="MỚI" />}
          {displayDiscount > 0 && (
            <ProductBadge type="discount" label={`-${displayDiscount}%`} />
          )}
        </div>

        {/* Quick Add Button (Visible on hover on desktop) */}
        {onQuickAdd && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickAdd(product);
            }}
            className="absolute bottom-0 left-0 right-0 bg-primary/90 text-on-primary py-3 text-label-sm flex items-center justify-center gap-2 translate-y-full transition-transform duration-300 group-hover:translate-y-0"
          >
            <ShoppingCart size={18} />
            THÊM NHANH
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-grow">
        <Link to={`/products/${product.slug || product.id}`} className="text-body-md font-bold text-on-surface line-clamp-2 hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-auto pt-2 flex items-center gap-2">
          <span className="text-body-md font-semibold text-primary">{formatCurrency(product.price)}</span>
          {product.originalPrice && (
            <span className="text-body-md text-on-surface-variant line-through text-sm">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
