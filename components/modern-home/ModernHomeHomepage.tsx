'use client';

import React, { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowUpLeft,
  Hammer,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
} from 'lucide-react';
import Image from '@/components/SafeImage';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import type { Product } from '@/types';
import { useModernHomeContent } from './useModernHomeContent';

// High-fidelity imagery
const HERO_IMAGE = '/images/apple_hero_living_1790845941555.jpg';
const CRAFT_IMAGE = '/images/apple_craft_details_1790845954723.jpg';
const DINING_IMAGE = '/images/apple_dining_sculptural_1790845966979.jpg';
const ARMCHAIR_IMAGE = '/images/apple_armchair_studio_1790845976502.jpg';

const priceFormatter = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 });

function formatPrice(price: number): string {
  if (price <= 0) return 'استفسار عن السعر';
  return `${priceFormatter.format(price)} ج.م`;
}

export default function ModernHomeHomepage() {
  const { navigateTo, settings } = useToccoStore();
  const { products, projects } = useModernHomeContent();

  // Featured curated products: a mix of local manufacturing and imported pieces
  const publishedProducts = useMemo(() => {
    return products.filter((p) => p.isPublished !== false);
  }, [products]);

  const displayedProducts = useMemo(() => {
    return publishedProducts.slice(0, 8);
  }, [publishedProducts]);

  // Real client homes showcase ("في بيوتكم")
  const homeStories = useMemo(() => {
    if (projects && projects.length > 0) {
      return projects.slice(0, 4).map((p, idx) => ({
        id: p.id,
        title: p.title.replace('مشروع ', ''),
        location: p.location || 'القاهرة',
        image: p.coverImage || (idx === 0 ? HERO_IMAGE : idx === 1 ? DINING_IMAGE : idx === 2 ? ARMCHAIR_IMAGE : CRAFT_IMAGE),
        pieces: p.featuredPieces?.join(' · ') || (p.productsUsed?.join(' · ')) || 'أثاث مودرن هوم',
      }));
    }
    return [
      {
        id: 'home-1',
        title: 'صالون المعيشة المعاصر',
        location: 'الشيخ زايد',
        image: HERO_IMAGE,
        pieces: 'صوفا كونتور · طاولة ترافرتين طبيعي',
      },
      {
        id: 'home-2',
        title: 'ركن السفرة المفتوح',
        location: 'التجمع الخامس',
        image: DINING_IMAGE,
        pieces: 'طاولة حجرية مضلعة · كراسي زان طبيعي',
      },
      {
        id: 'home-3',
        title: 'زاوية الاسترخاء والمطالعة',
        location: 'المعادي',
        image: ARMCHAIR_IMAGE,
        pieces: 'كرسي تيمبو النحتي · طاولة خدمة',
      },
      {
        id: 'home-4',
        title: 'وحدة التخزين المعلقة',
        location: 'القاهرة الجديدة',
        image: CRAFT_IMAGE,
        pieces: 'بوفيه خشب زان · تعشيقات يدوية',
      },
    ];
  }, [projects]);

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
                تصميم معاصر · مودرن هوم
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
                قطع معمارية معاصرة من أخشاب الزان الطبيعي، الرخام، وأقمشة الكتان، تمنح مساحتك هدوءاً وأناقة استثنائية.
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
                  <span className="text-white/60">الخامات</span>
                  <span className="font-medium text-white">زان ورخام طبيعي</span>
                </div>
                <div className="flex flex-col border-r border-white/15 pr-3">
                  <span className="text-white/60">التوصيل</span>
                  <span className="font-medium text-white">لكل المحافظات</span>
                </div>
                <div className="flex flex-col border-r border-white/15 pr-3">
                  <span className="text-white/60">الضمان</span>
                  <span className="font-medium text-white">ضمان شامل وصيانة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. DUAL GATEWAY CARDS: تصنيع محلي vs أثاث مستورد
          ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1440px] px-3 pt-8 sm:px-6 sm:pt-12 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
          {/* Card 1: Local Manufacturing (تصنيع محلي) */}
          <div
            onClick={() => navigateTo('custom-design')}
            className="group cursor-pointer rounded-2xl sm:rounded-3xl border border-[#E6DED2] bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-[#C8A77D]"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A36046]">
                <Hammer className="h-3.5 w-3.5" aria-hidden="true" />
                <span>صناعة مصرية</span>
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#FAF7F2] text-[#17324A] transition-transform group-hover:-translate-x-1">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>

            <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-[#17324A]">
              تصنيع محلي
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6D6A64]">
              قطع صُنعت في ورشنا بمصر بأخشاب زان طبيعي وتشطيب يدوي متقن.
            </p>
          </div>

          {/* Card 2: Imported Luxury (أثاث مستورد) */}
          <div
            onClick={() => navigateTo('imported')}
            className="group cursor-pointer rounded-2xl sm:rounded-3xl bg-[#17324A] text-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-[#112334]"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E9CBA6]">
                <Plane className="h-3.5 w-3.5 rotate-45" aria-hidden="true" />
                <span>تسليم فوري</span>
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white transition-transform group-hover:-translate-x-1">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>

            <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl sm:text-2xl font-bold text-white">
              أثاث مستورد
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/80">
              تصميمات حصرية مستوردة من الخارج جاهزة للشحن الفوري لبيتك.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CURATED SHOWCASE (MIX OF LOCAL & IMPORTED PIECES)
          ───────────────────────────────────────────────────────────── */}
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
              const primaryImage = product.images[0] || HERO_IMAGE;
              const isImported = product.categoryId === '802' || product.slug?.includes('imported') || product.allowsCustomization === false;

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="group cursor-pointer flex w-[74vw] max-w-[280px] shrink-0 snap-start flex-col rounded-2xl border border-[#E6DED2]/80 bg-white p-3 shadow-sm transition-all sm:w-auto sm:max-w-none hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F0EAE1]">
                    <Image
                      src={primaryImage}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 74vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Origin Badge: Local vs Imported */}
                    <span
                      className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-md ${
                        isImported
                          ? 'bg-[#17324A]/90 text-[#E9CBA6]'
                          : 'bg-[#A36046]/90 text-white'
                      }`}
                    >
                      {isImported ? 'مستورد' : 'تصنيع محلي'}
                    </span>

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

      {/* ─────────────────────────────────────────────────────────────
          4. "في بيوتكم" (CREATIVE REAL CLIENT LIVING SPACES SHOWCASE)
          Replaces the old space studio with real living home photography
          ───────────────────────────────────────────────────────────── */}
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
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                  <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-md border border-white/10">
                    <MapPin className="h-2.5 w-2.5 text-[#E9CBA6]" aria-hidden="true" />
                    <span>{story.location}</span>
                  </span>
                </div>

                {/* Caption Details */}
                <div className="flex flex-1 flex-col justify-between pt-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#18232D] group-hover:text-[#17324A] truncate">
                      {story.title}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-[#6D6A64] line-clamp-1">
                      {story.pieces}
                    </p>
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
              تحدث مباشرة مع فريق التصميم لمساعدتك سواء في القطع المصنعة محلياً أو المستوردة.
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
