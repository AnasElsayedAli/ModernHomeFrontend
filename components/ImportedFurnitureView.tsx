'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowUpLeft,
  CheckCircle2,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import Image from '@/components/SafeImage';
import { useToccoStore } from '@/lib/store';
import { useModernHomeContent } from './modern-home/useModernHomeContent';
import type { Product } from '@/types';

const IMPORTED_HERO_IMAGE = '/images/apple_dining_sculptural_1790845966979.jpg';

const priceFormatter = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 });

function formatPrice(price: number): string {
  if (price <= 0) return 'استفسار عن السعر';
  return `${priceFormatter.format(price)} ج.م`;
}

export default function ImportedFurnitureView() {
  const { navigateTo, addToCart, setIsCartDrawerOpen } = useToccoStore();
  const { products } = useModernHomeContent();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  // Products belonging to the Imported world
  const importedProducts = useMemo(() => {
    return products.filter((p) => {
      const isImportedCat = p.categoryId === '802';
      const isImportedSlug = p.slug?.includes('imported') || p.allowsCustomization === false;
      const hasDirectPrice = p.price > 0;
      return isImportedCat || (isImportedSlug && hasDirectPrice);
    });
  }, [products]);

  const displayCatalog = useMemo(() => {
    const base = importedProducts.length >= 3 ? importedProducts : products.filter((p) => p.price > 0);
    if (activeFilter === 'all') return base;
    if (activeFilter === 'chairs') {
      return base.filter((p) => p.name.includes('كرسي') || p.name.includes('لاونج') || p.slug?.includes('chair'));
    }
    if (activeFilter === 'tables') {
      return base.filter((p) => p.name.includes('طاولة') || p.name.includes('سفرة') || p.slug?.includes('table'));
    }
    if (activeFilter === 'storage') {
      return base.filter((p) => p.name.includes('وحدة') || p.name.includes('بوفيه') || p.slug?.includes('storage') || p.slug?.includes('tv'));
    }
    return base;
  }, [activeFilter, importedProducts, products]);

  const handleProductSelect = (product: Product) => {
    navigateTo('product', { productId: product.id });
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    void addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] || '',
      unitPrice: product.price,
      selectedFinish: product.finishes?.[0] || 'MATTE',
      selectedColor: product.colors?.[0] || { id: 'default', name: 'افتراضي', hex: '#17324A' },
      quantity: 1,
    });
    setJustAddedId(product.id);
    setIsCartDrawerOpen(true);
    setTimeout(() => {
      setJustAddedId(null);
    }, 2000);
  };

  return (
    <div id="imported-furniture-app" dir="rtl" className="min-h-screen bg-[#FAF7F2] pb-24 text-[#18232D]">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPACT, CLEAN SHOWROOM BANNER (NO CLUTTER)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative px-3 pt-3 sm:px-6 sm:pt-4 md:px-8">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-3xl bg-[#112334] text-white shadow-sm">
          <div className="absolute inset-0">
            <Image
              src={IMPORTED_HERO_IMAGE}
              alt="الأثاث المستورد"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-[0.70]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1B29]/95 via-[#112334]/55 to-transparent" />
          </div>

          <div className="relative z-10 flex min-h-[220px] sm:min-h-[260px] flex-col justify-end p-5 sm:p-8 md:p-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#E9CBA6]">
              تسليم فوري بالمخزن
            </span>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl sm:text-4xl font-bold text-white">
              الأثاث المستورد
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-white/80 max-w-lg">
              قطع وتصميمات مستوردة من الخارج، متوفرة للشحن المباشر إلى منزلك.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FILTER & SHOWROOM CATALOG
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 sm:pt-10 md:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E6DED2] pb-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#17324A]">
            قطع الاستلام الفوري
          </h2>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'chairs', label: 'كراسي ومقاعد' },
              { id: 'tables', label: 'طاولات' },
              { id: 'storage', label: 'وحدات تخزين' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`min-h-[34px] whitespace-nowrap rounded-xl px-3.5 text-xs font-medium transition-all ${
                  activeFilter === tab.id
                    ? 'bg-[#17324A] text-white shadow-sm font-semibold'
                    : 'bg-white text-[#6D6A64] hover:bg-white/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {displayCatalog.map((product) => {
            const primaryImage = product.images[0] || IMPORTED_HERO_IMAGE;
            const isAdded = justAddedId === product.id;

            return (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="group cursor-pointer flex flex-col rounded-2xl border border-[#E6DED2]/80 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F0EAE1]">
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-[#17324A]/90 px-2 py-0.5 text-[10px] font-semibold text-[#E9CBA6] backdrop-blur-md">
                    <Zap className="h-2.5 w-2.5" aria-hidden="true" />
                    <span>فوري</span>
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

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className={`inline-flex min-h-[34px] items-center gap-1 rounded-lg px-3 text-xs font-medium transition-all active:scale-95 ${
                        isAdded
                          ? 'bg-[#25D366] text-white'
                          : 'bg-[#17324A] text-white hover:bg-[#112334]'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          <span>تمت الإضافة</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3 w-3" aria-hidden="true" />
                          <span>إضافة للسلة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
