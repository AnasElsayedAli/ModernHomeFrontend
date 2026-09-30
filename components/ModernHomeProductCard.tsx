import { ArrowLeft } from 'lucide-react';
import type { Product } from '@/types';
import Image from '@/components/SafeImage';

interface ModernHomeProductCardProps {
  product: Product;
  categoryLabel?: string;
  onSelect: () => void;
  editorial?: boolean;
  ordinal?: number;
}

export default function ModernHomeProductCard({
  product,
  categoryLabel,
  onSelect,
  editorial = false,
  ordinal,
}: ModernHomeProductCardProps) {
  const isPriced = Number.isFinite(product.price) && product.price > 0;
  const priceLabel = isPriced
    ? `${new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(product.price)} جنيه`
    : 'حسب الطلب';

  return (
    <article dir="rtl" className="group min-w-0">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`عرض تفاصيل ${product.name}`}
        className={`relative block w-full overflow-hidden bg-[#E6DED2] text-right ${editorial ? 'aspect-[5/4]' : 'aspect-[4/5]'}`}
      >
        <Image
          src={product.images?.[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
        />
        <span className="absolute right-3 top-3 bg-[#F7F3EC]/95 px-2.5 py-1 text-[10px] font-medium text-[#17324A]">
          {!isPriced ? 'تصنيع حسب الطلب' : product.deliveryDays ? `جاهز خلال ${product.deliveryDays} يوم` : 'قطعة مختارة'}
        </span>
        {ordinal !== undefined && (
          <span className="absolute bottom-3 right-3 font-[family-name:var(--font-brand)] text-[10px] text-white drop-shadow sm:bottom-4 sm:right-4">
            {String(ordinal).padStart(2, '0')}
          </span>
        )}
        <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center bg-[#F7F3EC] text-[#17324A] transition-transform group-hover:-translate-x-1 sm:bottom-4 sm:left-4">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      <div className="space-y-2 pt-3 sm:pt-4">
        <div className="flex min-h-5 items-center justify-between gap-3">
          {categoryLabel ? (
            <span className="truncate text-[11px] text-[#9A6248]">{categoryLabel}</span>
          ) : <span />}
          {product.colors?.length > 0 && (
            <div className="flex shrink-0 items-center gap-1" aria-label="الألوان المتاحة">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  className="h-3 w-3 rounded-full border border-black/15"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-[#6D6A64]">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>

        <h3 className="truncate font-[family-name:var(--font-display)] text-base font-semibold text-[#17324A] sm:text-lg">
          <button type="button" onClick={onSelect} className="text-right transition-colors hover:text-[#A36046]">
            {product.name}
          </button>
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-xs leading-6 text-[#6D6A64]">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-sm font-semibold text-[#17324A]">{priceLabel}</span>
          <span className="truncate text-[10px] text-[#8A8175]">{product.material?.split(',')[0] || 'اختيار مودرن هوم'}</span>
        </div>
      </div>
    </article>
  );
}
