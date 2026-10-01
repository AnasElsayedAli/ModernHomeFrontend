'use client';

import React from 'react';
import {
  ArrowUpLeft,
} from 'lucide-react';
import Image from '@/components/SafeImage';
import { useToccoStore } from '@/lib/store';
import { useModernHomeContent } from './modern-home/useModernHomeContent';
import type { Product } from '@/types';

const ATELIER_HERO = '/images/apple_craft_details_1790845954723.jpg';

const priceFormatter = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 });

function formatPrice(price: number): string {
  if (price <= 0) return 'استفسار عن السعر';
  return `${priceFormatter.format(price)} ج.م`;
}

export default function CustomDesignView() {
  const { navigateTo } = useToccoStore();
  const { products } = useModernHomeContent();

  // Local Egyptian Manufactured Products
  const localProducts = products.filter(
    (p) => p.categoryId === '801' || p.allowsCustomization || !p.slug?.includes('imported')
  );

  const handleProductSelect = (product: Product) => {
    navigateTo('product', { productId: product.id });
  };

  return (
    <div id="local-manufacturing-app" dir="rtl" className="min-h-screen bg-[#FAF7F2] pb-24 text-[#18232D]">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPACT, CLEAN HERO (NO CLUTTER)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative px-3 pt-3 sm:px-6 sm:pt-4 md:px-8">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-3xl bg-[#17324A] text-white shadow-sm">
          <div className="absolute inset-0">
            <Image
              src={ATELIER_HERO}
              alt="تصنيع محلي"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.70]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1F2E]/95 via-[#17324A]/55 to-transparent" />
          </div>

          <div className="relative z-10 flex min-h-[220px] sm:min-h-[260px] flex-col justify-end p-5 sm:p-8 md:p-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E9CBA6]">
              صناعة مصرية متقنة
            </span>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl sm:text-4xl font-bold text-white">
              تصنيع محلي
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-white/80 max-w-lg">
              قطع صُنعت في ورشنا بمصر من أخشاب الزان الطبيعي والرخام وتشطيب يدوي دقيق.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LOCAL COLLECTION CATALOG
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 sm:pt-10 md:px-8">
        <div className="flex items-center justify-between border-b border-[#E6DED2] pb-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#17324A]">
            قطع التصنيع المحلي
          </h2>
          <span className="text-xs text-[#81786C]">خشب زان طبيعي</span>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {localProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className="group cursor-pointer flex flex-col rounded-2xl border border-[#E6DED2]/80 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F0EAE1]">
                <Image
                  src={product.images[0] || ATELIER_HERO}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-2.5 right-2.5 rounded-full bg-[#17324A]/90 px-2 py-0.5 text-[10px] font-semibold text-[#E9CBA6] backdrop-blur-md">
                  صناعة مصرية
                </span>
                <span className="absolute bottom-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#17324A] shadow">
                  <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between pt-3">
                <div>
                  <h3 className="font-bold text-sm text-[#18232D] group-hover:text-[#17324A] truncate">
                    {product.name}
                  </h3>
                  {product.dimensions && (
                    <p className="mt-0.5 text-[11px] text-[#6D6A64] truncate">
                      {product.dimensions}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-[#F2ECE2] pt-2.5">
                  <span className="text-xs font-bold text-[#17324A] tabular-nums">
                    {formatPrice(product.price)}
                  </span>

                  <span className="rounded-lg bg-[#F4EFE6] px-3 py-1.5 text-xs font-medium text-[#17324A] group-hover:bg-[#17324A] group-hover:text-white transition-colors">
                    عرض القطعة
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
