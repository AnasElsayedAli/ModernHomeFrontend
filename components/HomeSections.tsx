'use client';

import React from 'react';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import { Product, Category } from '@/types';
import { ToccoMark } from './ToccoLogo';
import ModernHomeProductCard from './ModernHomeProductCard';
import { ArrowLeft, ArrowRight, Sparkles, MessageCircle, ArrowUpRight, Compass, ShieldCheck, SunMedium } from 'lucide-react';
import Image from '@/components/SafeImage';

export function HomeHero() {
  const { navigateTo, settings } = useToccoStore();

  return (
    <section id="homepage-hero" dir="rtl" className="relative isolate flex min-h-[74svh] max-h-[880px] items-end overflow-hidden bg-[#17324A] pb-12 pt-24 sm:min-h-[78svh] sm:pb-16">
      <div className="absolute inset-0 z-0">
        <Image
          src={settings.homepage.heroImage}
          alt="مساحة معيشة عصرية من مودرن هوم"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.82] contrast-[1.04]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#122A3D]/90 via-[#17324A]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#122A3D]/55 via-transparent to-[#122A3D]/10" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <div className="max-w-2xl space-y-5 text-right text-white sm:space-y-7">
          <p className="text-xs font-medium text-[#F0D9B8] sm:text-sm">
            مودرن هوم <span className="mx-2 text-white/60">·</span> القاهرة
          </p>
          <h1 className="text-4xl font-semibold leading-[1.35] text-white sm:text-6xl sm:leading-[1.3]">
            بيتك يبدأ من اختيارك
          </h1>
          <p className="max-w-xl text-base leading-8 text-white/85 sm:text-lg">
            أثاث عصري بتصميمات مختارة، وحلول مخصصة تناسب مساحتك وذوقك.
          </p>

          <div className="flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row sm:items-center">
            <button
              id="hero-discover-story-btn"
              onClick={() => navigateTo('shop')}
              className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#F7F3EC] px-6 text-sm font-semibold text-[#17324A] transition-colors hover:bg-white"
            >
              <span>تصفح المنتجات</span>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('custom-design')}
              className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/65 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <span>صمّم قطعتك</span>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="pt-2 text-xs text-white/70 sm:pt-4">
            تصنيع حسب الطلب <span className="mx-2">·</span> قطع مستوردة مختارة
          </p>
        </div>
      </div>
    </section>
  );
}

export function SignaturePiecesSection() {
  const { products, navigateTo } = useToccoStore();
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);

  if (!featuredProducts.length) return null;

  return (
    <section id="signature-pieces-section" dir="rtl" className="border-b border-[#E6DED2] bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold text-[#A36046]">اختيارات مودرن هوم</span>
            <h2 className="text-2xl font-semibold text-[#17324A] sm:text-4xl">قطع تستحق مكانها في بيتك</h2>
            <p className="text-sm leading-7 text-[#6D6A64]">
              اكتشف القطع التي اختارها فريقنا لمساحات معاصرة وتفاصيل تدوم.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('shop')}
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#17324A] transition-colors hover:text-[#A36046] sm:self-auto"
          >
            <span>اكتشف كل المنتجات</span>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ModernHomeProductCard
              key={product.id}
              product={product}
              categoryLabel={product.material?.split(',')[0] || undefined}
              onSelect={() => navigateTo('product', { productId: product.id })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function StoryTeaserSection() {
  const { navigateTo, settings } = useToccoStore();

  return (
    <section id="story-teaser-section" dir="rtl" className="border-b border-[#E6DED2] bg-[#F7F3EC] py-14 sm:py-20">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-8 px-4 sm:px-8 lg:grid-cols-12 lg:gap-14 lg:px-12">
        <div className="space-y-5 lg:col-span-5 sm:space-y-7">
          <ToccoMark size={44} />
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#A36046]">حكاية مودرن هوم</span>
            <h2 className="text-2xl font-semibold leading-relaxed text-[#17324A] sm:text-4xl">
              أثاث يكمّل روح المكان
            </h2>
            <p className="text-sm leading-8 text-[#53616A] sm:text-base">
              مودرن هوم للأثاث والديكور العصري. نختار قطعًا بتفاصيل مدروسة، ونمنحك مساحة لتصميم ما يناسب بيتك فعلًا.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-[#D9CEBF] pt-4 sm:gap-5">
            <div>
              <span className="block text-sm font-semibold text-[#17324A] sm:text-base">تصميم عصري</span>
              <span className="mt-1 block text-xs leading-5 text-[#6D6A64]">تفاصيل هادئة</span>
            </div>
            <div>
              <span className="block text-sm font-semibold text-[#17324A] sm:text-base">اختيارات مختارة</span>
              <span className="mt-1 block text-xs leading-5 text-[#6D6A64]">لبيتك ومساحتك</span>
            </div>
            <div>
              <span className="block text-sm font-semibold text-[#17324A] sm:text-base">حسب الطلب</span>
              <span className="mt-1 block text-xs leading-5 text-[#6D6A64]">على مقاسك</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('our-story')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#17324A] transition-colors hover:text-[#A36046]"
          >
            <span>اعرف حكايتنا</span>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative min-h-[300px] overflow-hidden sm:min-h-[460px] lg:col-span-7">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85"
            alt="تصميم داخلي عصري بألوان طبيعية"
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#122A3D]/55 to-transparent" />
          <p className="absolute bottom-4 right-4 text-xs text-white sm:bottom-6 sm:right-6">مودرن هوم · القاهرة</p>
        </div>
      </div>
    </section>
  );
}

export function CategoriesShowcase() {
  const { categories, navigateTo } = useToccoStore();
  const visibleCategories = categories.filter((c) => c.isVisible);
  const purchasePaths = [
    {
      number: '01',
      title: 'تصنيع حسب الطلب',
      description: 'اختار المقاس والخامة واللون، وننفّذ قطعة تناسب مساحتك.',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1400&q=85',
      action: () => navigateTo('custom-design'),
      actionLabel: 'صمّم قطعتك',
    },
    {
      number: '02',
      title: 'قطع مستوردة مختارة',
      description: 'تصميمات جاهزة بتفاصيل واضحة لتختار ما يناسب بيتك.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
      action: () => navigateTo('shop'),
      actionLabel: 'تصفح المنتجات',
    },
  ];

  return (
    <section id="categories-showcase-section" dir="rtl" className="border-b border-[#E6DED2] bg-[#F7F3EC] py-14 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <div className="mb-7 max-w-2xl space-y-2 sm:mb-10">
          <span className="text-xs font-semibold text-[#A36046]">اختار طريقة اقتنائك</span>
          <h2 className="text-2xl font-semibold text-[#17324A] sm:text-4xl">قطعتك الجاهزة، أو تصميمك الخاص</h2>
          <p className="text-sm leading-7 text-[#6D6A64]">
            لكل مساحة حكاية؛ اكتشف القطع المختارة أو ابدأ بتفاصيل قطعة على مقاسك.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
          {purchasePaths.map((path) => (
            <button
              key={path.number}
              type="button"
              onClick={path.action}
              className="group relative min-h-[340px] overflow-hidden bg-[#17324A] text-right sm:min-h-[430px]"
            >
              <Image
                src={path.image}
                alt={path.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <span className="absolute inset-0 bg-gradient-to-l from-[#122A3D]/90 via-[#17324A]/30 to-transparent" aria-hidden="true" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#122A3D]/45 to-transparent" aria-hidden="true" />
              <span className="absolute inset-0 flex flex-col items-start justify-end p-5 text-white sm:p-8">
                <span className="mb-3 text-xs font-medium text-[#F0D9B8]">{path.number}</span>
                <span className="text-xl font-semibold sm:text-3xl">{path.title}</span>
                <span className="mt-2 max-w-md text-sm leading-7 text-white/85">{path.description}</span>
                <span className="mt-5 inline-flex items-center gap-2 border-b border-[#C8A77D] pb-1 text-sm font-semibold text-white">
                  {path.actionLabel}
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </span>
              </span>
            </button>
          ))}
        </div>

        {visibleCategories.length > 0 && (
          <div className="mt-10 border-t border-[#E6DED2] pt-6 sm:mt-12 sm:pt-8">
            <h3 className="mb-4 text-sm font-semibold text-[#17324A]">تصفّح حسب التصنيف</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {visibleCategories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => navigateTo('shop', { categoryId: category.id })}
                  className="inline-flex items-center gap-2 border-b border-[#C8A77D] pb-1 text-sm text-[#42515C] transition-colors hover:text-[#17324A]"
                >
                  <span>{category.name}</span>
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function CollaborationsSection() {
  const { collaborations } = useToccoStore();

  if (!collaborations.length) return null;

  return (
    <section id="homepage-collaborations" dir="rtl" className="border-y border-[#E6DED2] bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="mb-8 text-right sm:mb-10">
          <p className="mb-2 text-xs font-semibold text-[#A36046]">شركاؤنا</p>
          <h2 className="text-xl font-semibold text-[#17324A] sm:text-2xl">جهات نتعاون معها</h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14">
          {collaborations.map((collaboration) => (
            <div
              key={collaboration.id}
              title={collaboration.title}
              className="relative w-24 h-12 sm:w-32 sm:h-16"
            >
              <Image
                src={collaboration.image}
                alt={collaboration.title}
                fill
                className="object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CustomDesignTeaser() {
  const { settings, navigateTo } = useToccoStore();

  const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    'مرحبًا مودرن هوم، أرغب في مناقشة تصميم قطعة أثاث خاصة.'
  )}`;

  return (
    <section id="custom-design-teaser-section" dir="rtl" className="relative overflow-hidden bg-[#17324A] py-14 text-white sm:py-20">
      <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-8 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12 lg:px-12">
        <div className="space-y-4 sm:space-y-6 lg:col-span-7">
          <span className="text-xs font-semibold text-[#E6C9A3]">تصنيع حسب الطلب</span>
          <h2 className="text-2xl font-semibold leading-relaxed sm:text-4xl">
            أنت تحدد التفاصيل، ونحن ننفّذها.
          </h2>
          <p className="max-w-xl text-sm leading-8 text-white/80 sm:text-base">
            شاركنا فكرتك والمقاسات والخامات التي تفضّلها. فريقنا يساعدك في تحويلها إلى قطعة تناسب بيتك.
          </p>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => navigateTo('custom-design')}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#F7F3EC] px-5 text-sm font-semibold text-[#17324A] transition-colors hover:bg-white"
            >
              صمّم قطعتك <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/50 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4 text-[#65C987]" aria-hidden="true" />
              <span>تواصل على واتساب</span>
            </a>
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden sm:min-h-[340px] lg:col-span-5">
            <Image
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=85"
              alt="تفاصيل أثاث وديكور عصري"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
            />
        </div>
      </div>
    </section>
  );
}

const PROJECTS_SHOWCASE_ENABLED = false;

export function ProjectsAndInstagramSection() {
  const { projects, navigateTo, settings } = useToccoStore();
  const instagramHandles = settings.contact.instagramHandles.filter((handle) => !/tocco/i.test(handle));

  return (
    <section id="projects-journal-section" dir="rtl" className="bg-[#F7F3EC] py-14 sm:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        {PROJECTS_SHOWCASE_ENABLED && (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#A36046]">من بيوتنا ومشروعاتنا</span>
            <h2 className="text-2xl font-semibold text-[#17324A] sm:text-4xl">أثاث في مساحته الحقيقية</h2>
            <p className="max-w-lg text-sm leading-7 text-[#6D6A64]">شاهد كيف تبدو القطع داخل مساحات مختلفة.</p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('projects')}
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#17324A] hover:text-[#A36046] sm:self-auto"
          >
            <span>اكتشف المشروعات</span>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {projects.slice(0, 3).map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => navigateTo('projects')}
              className="group min-w-0 text-right"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#EDE4D7]">
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="space-y-1.5 pt-3">
                <span className="text-xs text-[#A36046]">{[project.location, project.year].filter(Boolean).join(' · ')}</span>
                <h3 className="text-base font-semibold text-[#17324A] transition-colors group-hover:text-[#A36046]">{project.title}</h3>
                <p className="line-clamp-2 text-xs leading-6 text-[#6D6A64]">{project.description}</p>
              </div>
            </button>
              ))}
            </div>
          </>
        )}

        {instagramHandles.length > 0 && (
          <div className="mt-10 flex flex-col gap-4 border-t border-[#E6DED2] pt-7 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold text-[#A36046]">تابعونا</span>
              <h3 className="mt-1 text-lg font-semibold text-[#17324A]">مودرن هوم على إنستجرام</h3>
            </div>
            <div className="flex flex-wrap gap-4">
              {instagramHandles.map((handle) => (
                <a
                  key={handle}
                  href={`https://instagram.com/${handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border-b border-[#C8A77D] pb-1 text-sm text-[#42515C] hover:text-[#17324A]"
                >
                  <span>{handle}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
