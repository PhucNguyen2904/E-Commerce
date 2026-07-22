import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../../shared/utils/cn';

const COLLECTIONS = [
  {
    id: 1,
    title: "Bộ Sưu Tập Thu Đông 2026",
    description: "Khám phá những thiết kế tinh tế, chất liệu cao cấp mang lại sự sang trọng và thoải mái cho từng khoảnh khắc.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop",
    link: "/products",
    featured: true
  },
  {
    id: 2,
    title: "Thời Trang Công Sở",
    description: "Nâng tầm phong cách chuyên nghiệp với những bộ suit và phụ kiện cao cấp.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
    link: "/products?categoryId=Phụ Kiện"
  },
  {
    id: 3,
    title: "Xu Hướng Mới",
    description: "Thể hiện cá tính mạnh mẽ với bộ sưu tập mang âm hưởng đường phố hiện đại.",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop",
    link: "/products?gender=Nữ"
  },
  {
    id: 4,
    title: "Bộ Sưu Tập Capsule Độc Quyền",
    description: "Khám phá ngay bộ sưu tập giới hạn với các phối màu xu hướng nhất năm nay.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2000&auto=format&fit=crop",
    link: "/products"
  }
];

export const CollectionsPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="bg-surface-container-lowest py-16 md:py-24 border-b border-outline-variant/20">
        <div className="layout-container flex flex-col items-center text-center">
          <h1 className="text-display-lg font-bold mb-6">Bộ Sưu Tập</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Từ những thiết kế thanh lịch chốn công sở đến trang phục dạo phố năng động. Khám phá các bộ sưu tập được tuyển chọn kỹ lưỡng để định hình phong cách của riêng bạn.
          </p>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="layout-container py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {COLLECTIONS.map((collection) => (
            <Link
              key={collection.id}
              to={collection.link}
              className={cn(
                "group relative rounded-2xl overflow-hidden shadow-ambient hover:shadow-xl transition-all duration-500",
                collection.featured ? "md:col-span-2 aspect-[2/1] min-h-[400px]" : "aspect-square md:aspect-[4/5]"
              )}
            >
              <img
                src={collection.image}
                alt={collection.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h2 className="text-display-sm md:text-display-md text-white font-bold mb-4">
                    {collection.title}
                  </h2>
                  <p className="text-body-lg text-white/90 mb-6 max-w-xl line-clamp-2">
                    {collection.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-white font-semibold uppercase tracking-wider text-label-lg group-hover:text-primary-fixed-dim transition-colors">
                    Khám phá ngay <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
