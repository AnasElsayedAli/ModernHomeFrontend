import { ArrowLeft } from 'lucide-react';
import type { Product } from '@/types';
import Image from '@/components/SafeImage';

interface ModernHomeProductCardProps {
  product: Product;
  categoryLabel?: string;
  onSelect: () => void;
  editorial?: boolean;
  compact?: boolean;
  ordinal?: number;
  descriptionLimit?: number;
}

export default function ModernHomeProductCard({
  product,
  categoryLabel,
  onSelect,
  editorial = false,
  compact = false,
  ordinal,
  descriptionLimit,
}: ModernHomeProductCardProps) {
  const isPriced = Number.isFinite(product.price) && product.price > 0;
  const priceLabel = isPriced
    ? `${new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(product.price)} جنيه`
    : 'حسب الطلب';
  const description = product.description && descriptionLimit !== undefined && product.description.length > descriptionLimit
    ? `${product.description.slice(0, descriptionLimit).trimEnd()}...`
    : product.description;

  return (
    <article
      dir="rtl"
      className="group min-w-0 overflow-hidden rounded-[26px] border border-[#E8DFD3] bg-[#F9F5F0] shadow-[0_8px_18px_rgba(23,50,74,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D7C5A5] hover:shadow-[0_12px_22px_rgba(23,50,74,0.08)]"
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`عرض تفاصيل ${product.name}`}
        className={`relative block w-full overflow-hidden bg-[#EEE5DB] text-right ${compact ? 'aspect-[4/3]' : editorial ? 'aspect-[5/4]' : 'aspect-[4/5]'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1e2a]/18 via-transparent to-transparent" />
        <Image
          src={product.images?.[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />

        <span className="absolute right-3 top-3 rounded-full border border-[#EFE3D1] bg-[#F9F5F0]/90 px-2.5 py-1 text-[10px] font-medium text-[#17324A] shadow-sm backdrop-blur-sm">
          {!isPriced ? 'تصنيع حسب الطلب' : product.deliveryDays ? `جاهز خلال ${product.deliveryDays} يوم` : 'قطعة مختارة'}
        </span>

        {ordinal !== undefined && (
          <span className="absolute bottom-3 right-3 rounded-full border border-white/30 bg-[#17324A]/40 px-2 py-1 font-[family-name:var(--font-brand)] text-[9px] font-medium tracking-[0.2em] text-white shadow-sm backdrop-blur-[2px] sm:bottom-4 sm:right-4">
            {String(ordinal).padStart(2, '0')}
          </span>
        )}

        <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full border border-[#DED5C9] bg-[#fbf9f4]/95 text-[#17324A] shadow-sm transition-transform duration-200 group-hover:-translate-x-1 sm:bottom-4 sm:left-4">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      <div className={compact ? 'space-y-2 border-t border-[#F0E7DA] bg-white p-3 sm:p-4' : 'space-y-2.5 border-t border-[#F0E7DA] bg-white p-4 sm:p-5'}>
        <div className="flex min-h-5 items-center justify-between gap-3">
          {categoryLabel ? (
            <span className="truncate text-[11px] font-medium text-[#A36046]">{categoryLabel}</span>
          ) : <span />}
          {product.colors?.length > 0 && (
            <div className="flex shrink-0 items-center gap-1.5" aria-label="الألوان المتاحة">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color.id}
                  title={color.name}
                  className="h-2.5 w-2.5 rounded-full border border-black/10"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[9px] text-[#6D6A64]">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>

        <h3 className={`truncate font-[family-name:var(--font-display)] font-semibold text-[#17324A] ${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
          <button type="button" onClick={onSelect} className="text-right transition-colors hover:text-[#A36046]">
            {product.name}
          </button>
        </h3>

        {!compact && description && (
          <p className="line-clamp-2 text-xs leading-6 text-[#6D6A64]">{description}</p>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-sm font-semibold text-[#17324A]">{priceLabel}</span>
          {!compact && (
            <span className="truncate text-[10px] text-[#8A8175]">
              {product.material?.split(',')[0] || 'اختيار مودرن هوم'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
