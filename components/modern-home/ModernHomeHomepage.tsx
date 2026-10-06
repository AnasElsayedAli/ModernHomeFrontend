'use client';

import React, { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowUpLeft,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import Image from '@/components/SafeImage';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import type { Product } from '@/types';
import { useModernHomeContent } from './useModernHomeContent';

// High-fidelity imagery
const HERO_IMAGE = '/images/apple_hero_living_1790845941555.jpg';
const priceFormatter = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 });

function formatPrice(price: number): string {
  if (price <= 0) return 'استفسار عن السعر';
  return `${priceFormatter.format(price)} ج.م`;
}

export default function ModernHomeHomepage() {
  const { navigateTo, settings } = useToccoStore();
  const { products, categories, projects } = useModernHomeContent();

  // Featured products from the active catalog
  const publishedProducts = useMemo(() => {
    return products.filter((p) => p.isPublished !== false);
  }, [products]);

  const displayedProducts = useMemo(() => {
    return publishedProducts.filter((product) => product.isFeatured).slice(0, 20);
  }, [publishedProducts]);

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => category.isVisible);
  }, [categories]);

  const homeStories = projects.slice(0, 4).map((project) => ({
    id: project.id,
    title: project.title.replace('مشروع ', ''),
    location: project.location,
    image: project.coverImage,
    pieces: project.featuredPieces?.join(' · ') || project.productsUsed?.join(' · ') || '',
  }));

  const handleProductSelect = (product: Product) => {
    navigateTo('product', { productId: product.id });
  };

  const whatsappConciergeUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    'مرحبًا مودرن هوم، أود الاستفسار عن تفاصيل تشكيلة الأثاث المتوفرة لديكم.'
  )}`;

  return (
    <div className="bg-[#FAF7F2] text-[#18232D] pb-20 md:pb-16 selection:bg-[#C8A77D]/25 selection:text-[#17324A]">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SHOWCASE
          ───────────────────────────────────────────────────────────── */}
      <section className="relative px-3 pt-3 sm:px-6 sm:pt-4 md:px-8">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[26px] sm:rounded-[36px] bg-[#17324A] text-white shadow-md">
          {/* Background Photography */}
          <div className="absolute inset-0">
            <Image
              src={HERO_IMAGE}
              alt="أثاث مودرن هوم"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[60%_center] brightness-[0.88]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#112334]/95 via-[#17324A]/40 to-[#112334]/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#112334]/90 via-[#17324A]/30 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 flex min-h-[72svh] sm:min-h-[80svh] flex-col justify-between p-5 sm:p-10 md:p-14">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#E9CBA6]">
                مودرن هوم للأثاث المنزلي والمكتبي
              </span>
              <span className="hidden sm:inline-block text-xs font-light text-white/60">
                القاهرة الجديدة
              </span>
            </div>

            <div className="max-w-xl space-y-3.5 pt-12 sm:space-y-5 sm:pt-16">
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.25] sm:text-5xl lg:text-6xl text-balance">
                أثاث يُصمم ليدوم.
                <span className="block mt-1 font-normal text-[#E9CBA6]">
                  بشخصية فريدة لبيتك.
                </span>
              </h1>

              <p className="text-xs sm:text-sm leading-relaxed text-white/85 max-w-md">
                قطع معمارية معاصرة للمنازل والمكاتب، من أخشاب الزان الطبيعي والرخام وأقمشة الكتان، تمنح كل مساحة هدوءاً وأناقة استثنائية.
              </p>

              <div className="flex gap-2.5 pt-1 sm:items-center">
                <button
                  type="button"
                  onClick={() => navigateTo('shop')}
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-[#F7F3EC] px-6 text-xs sm:text-sm font-semibold text-[#17324A] shadow transition-transform active:scale-95"
                >
                  <span>استكشف المجموعة</span>
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('our-story')}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 text-xs sm:text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
                >
                  <span>حكايتنا</span>
                </button>
              </div>
            </div>

            {/* Quick 3-point strip */}
            <div className="mt-6 border-t border-white/15 pt-4">
              <div className="grid grid-cols-3 gap-2 text-right text-[11px] sm:text-xs">
                <div className="flex flex-col">
                  <span className="text-white/60">جميع الخامات</span>
                  <span className="font-medium text-white">اجود وافضل الخامات</span>
                </div>
                <div className="flex flex-col border-r border-white/15 pr-3">
                  <span className="text-white/60">التوصيل</span>
                  <span className="font-medium text-white">لكل المحافظات</span>
                </div>
                <div className="flex flex-col border-r border-white/15 pr-3">
                  <span className="text-white/60">الضمان</span>
                  <span className="font-medium text-white">ضمان وصيانة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {visibleCategories.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-6 sm:pt-16 md:px-8" aria-labelledby="home-category-heading">
          <div className="flex items-end justify-between border-b border-[#E6DED2] pb-4">
            <div>
              <span className="text-[11px] font-semibold text-[#A36046]">ابدأ من احتياجك</span>
              <h2 id="home-category-heading" className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-[#17324A] sm:text-2xl md:text-3xl">
                تسوّق حسب التصنيف
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('shop', { categoryId: '' })}
              className="group inline-flex items-center gap-1 text-xs font-semibold text-[#17324A] hover:text-[#A36046]"
            >
              <span>كل المنتجات</span>
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
            {visibleCategories.map((category) => {
              const productCount = publishedProducts.filter((product) => product.categoryId === category.id).length;
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => navigateTo('shop', { categoryId: category.id })}
                  className="group relative min-h-36 w-[72vw] max-w-[280px] shrink-0 snap-start overflow-hidden bg-[#17324A] text-right text-white sm:min-h-48 sm:w-auto sm:max-w-none"
                >
                  <Image
                    src={category.image || HERO_IMAGE}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover opacity-75 transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#112334]/95 via-[#17324A]/20 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
                    <span>
                      <span className="block font-[family-name:var(--font-display)] text-base font-semibold sm:text-xl">{category.name}</span>
                      <span className="mt-1 block text-[10px] text-white/75 sm:text-xs">{productCount} منتج</span>
                    </span>
                    <ArrowLeft className="mb-1 h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. CURATED PRODUCT SHOWCASE
          ───────────────────────────────────────────────────────────── */}
      {displayedProducts.length > 0 && (
      <section className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-6 sm:pt-16 md:px-8">
        <div className="flex items-end justify-between border-b border-[#E6DED2] pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A36046]">
              الواجهة المختارة
            </span>
            <h2 className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-bold text-[#17324A] sm:text-2xl md:text-3xl">
              مختارات مودرن هوم
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="group inline-flex items-center gap-1 text-xs font-semibold text-[#17324A] hover:text-[#A36046]"
          >
            <span>الكتالوج الشامل</span>
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6">
          <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-3 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
            {displayedProducts.map((product) => {
              const primaryImage = product.images[0];

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="group cursor-pointer flex w-[74vw] max-w-[280px] shrink-0 snap-start flex-col rounded-2xl border border-[#E6DED2]/80 bg-white p-3 shadow-sm transition-all sm:w-auto sm:max-w-none hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F0EAE1]">
                    {primaryImage && (
                      <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 74vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}

                    <span className="absolute bottom-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#17324A] shadow-sm">
                      <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col justify-between pt-2.5">
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm text-[#18232D] group-hover:text-[#17324A] truncate">
                        {product.name}
                      </h3>
                      <p className="mt-0.5 text-[11px] text-[#6D6A64] truncate">
                        {product.material ? product.material.split('،')[0] : 'أثاث راقي'}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#F2ECE2] pt-2">
                      <span className="text-xs font-bold text-[#17324A] tabular-nums">
                        {formatPrice(product.price)}
                      </span>
                      <span className="rounded-lg bg-[#F4EFE6] px-2.5 py-1 text-[11px] font-medium text-[#17324A] group-hover:bg-[#17324A] group-hover:text-white transition-colors">
                        عرض التفاصيل
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. "في بيوتكم" (CREATIVE REAL CLIENT LIVING SPACES SHOWCASE)
          Replaces the old space studio with real living home photography
          ───────────────────────────────────────────────────────────── */}
      {homeStories.length > 0 && (
      <section className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-6 sm:pt-16 md:px-8">
        <div className="flex items-end justify-between border-b border-[#E6DED2] pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A36046]">
              واقع نعتز به · تصوير حقيقي
            </span>
            <h2 className="mt-0.5 font-[family-name:var(--font-display)] text-xl font-bold text-[#17324A] sm:text-2xl md:text-3xl">
              في بيوتكم
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6D6A64]">
              لقطات حقيقية شاركنا إياها عملاؤنا بعد استقرار قطع مودرن هوم في منازلهم.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('projects')}
            className="group inline-flex items-center gap-1 text-xs font-semibold text-[#17324A] hover:text-[#A36046]"
          >
            <span>جميع الصور</span>
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          </button>
        </div>

        {/* Stories Horizontal Swipe on Mobile, 4-card Grid on Desktop */}
        <div className="mt-6">
          <div className="flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-3 no-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
            {homeStories.map((story) => (
              <div
                key={story.id}
                onClick={() => navigateTo('projects')}
                className="group cursor-pointer flex w-[78vw] max-w-[320px] shrink-0 snap-start flex-col rounded-2xl border border-[#E6DED2]/80 bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 sm:w-auto sm:max-w-none"
              >
                {/* Photo with Location badge */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F0EAE1]">
                  {story.image && (
                    <>
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    </>
                  )}

                  {story.location && <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md border border-white/10">
                    <MapPin className="h-2.5 w-2.5 text-[#E9CBA6]" aria-hidden="true" />
                    <span>{story.location}</span>
                  </span>}
                </div>

                {/* Caption Details */}
                <div className="flex flex-1 flex-col justify-between pt-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#18232D] group-hover:text-[#17324A] truncate">
                      {story.title}
                    </h3>
                    {story.pieces && <p className="mt-0.5 text-[11px] text-[#6D6A64] line-clamp-1">{story.pieces}</p>}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-[#F2ECE2] pt-2 text-[11px]">
                    <span className="text-[#81786C]">تصوير منزلي</span>
                    <span className="font-medium text-[#A36046] group-hover:underline flex items-center gap-0.5">
                      <span>عرض المساحة</span>
                      <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. VIP CONCIERGE BANNER
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-3 pt-10 sm:px-6 sm:pt-14 md:px-8">
        <div className="rounded-2xl sm:rounded-3xl bg-[#17324A] text-white p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[#E9CBA6]">
              <Phone className="h-3 w-3" aria-hidden="true" />
              <span>استشارة مجانية</span>
            </span>
            <h2 className="font-[family-name:var(--font-display)] text-base sm:text-xl font-bold">
              هل تبدأ في تأثيث منزلك؟
            </h2>
            <p className="text-xs text-white/75 max-w-md">
              تحدث مباشرة مع فريق التصميم لمساعدتك في اختيار القطع المناسبة لمساحتك.
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={whatsappConciergeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-xs font-bold text-white shadow active:scale-95 transition-transform"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>محادثة واتساب فورية</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
