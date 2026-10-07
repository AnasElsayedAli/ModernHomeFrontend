'use client';

import React, { useMemo } from 'react';
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import Image from '@/components/SafeImage';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import type { Product } from '@/types';
import ModernHomeProductCard from '@/components/ModernHomeProductCard';
import { useModernHomeContent } from './useModernHomeContent';

const HERO_IMAGE = '/images/apple_hero_living_1790845941555.jpg';
const PROJECTS_SHOWCASE_ENABLED = false;

export default function ModernHomeHomepage() {
  const { navigateTo, settings, setSearchQuery } = useToccoStore();
  const { products, categories, projects } = useModernHomeContent();

  const publishedProducts = useMemo(() => {
    return products.filter((product) => product.isPublished !== false);
  }, [products]);

  const featuredProducts = useMemo(() => {
    return publishedProducts.filter((product) => product.isFeatured);
  }, [publishedProducts]);
  const displayedProducts = featuredProducts.slice(0, 4);

  const visibleCategories = useMemo(() => {
    return categories.filter((category) => category.isVisible).slice(0, 5);
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

  const showAllFeaturedProducts = () => {
    setSearchQuery('');
    navigateTo('featured');
  };

  const whatsappConciergeUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    'مرحبًا مودرن هوم، أود الاستفسار عن تفاصيل تشكيلة الأثاث المتوفرة لديكم.'
  )}`;

  const brandValues = [
    {
      title: 'خامات مختارة بعناية',
      desc: 'نوازن بين الخامات والتفاصيل لنمنح كل قطعة حضورًا هادئًا يناسب منزلك.',
    },
    {
      title: 'تصميم يشبه العمارة',
      desc: 'كل قطعة مصممة وفق نسب ومساحات تضمن تناغم الغرفة وتوازنها البصري.',
    },
    {
      title: 'تفاصيل تناسب احتياجك',
      desc: 'تعرّف على خيارات المقاسات والألوان والخامات المتاحة لكل قطعة قبل الطلب.',
    },
  ];

  return (
    <main className="min-h-screen bg-[#F5F1EB] text-[#17324A]">
      <section className="relative overflow-hidden border-b border-[#E8DED1] bg-[radial-gradient(circle_at_top,#f9f4ee_0%,#f4efe9_38%,#efe7dc_100%)]">
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="z-10 space-y-6 text-right lg:col-span-6">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-[#81786C] sm:text-sm">
                <span className="h-px w-7 bg-[#C4AD8B]" aria-hidden="true" />
                <span>مجموعة مودرن هوم</span>
              </div>

              <h1 className="font-[family-name:var(--font-display)] text-3xl leading-[1.08] text-[#17324A] sm:text-4xl md:text-5xl lg:text-[4rem]">
                أثاث مَدروس..
                <span className="mt-1 block font-light text-[#625E57]">لمساحات تُشبه هدوءك.</span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-[#625E57] sm:text-lg">
                نصمم ونختار أثاثًا يجمع بين الخطوط الهندسية الهادئة والوظيفة اليومية، بقطع تناسب المساحات السكنية وبيئات العمل المعاصرة.
              </p>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => navigateTo('shop')}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#17324A] px-8 py-4 text-sm font-medium text-[#FBF9F4] shadow-[0_10px_20px_rgba(23,50,74,0.14)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#24445E]"
                >
                  <span>استكشف المجموعة الكاملة</span>
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={showAllFeaturedProducts}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#DCCDB8] bg-[#FBF9F4]/80 px-7 py-4 text-sm font-medium text-[#17324A] transition-all duration-200 hover:border-[#C7B292] hover:bg-[#F2E9DE]"
                >
                  <span>اكتشف القطع المختارة</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-[#E6DED2] pt-6 text-right sm:gap-4">
                <div>
                  <p className="text-base font-bold text-[#17324A] sm:text-lg">تصميم</p>
                  <p className="mt-0.5 text-[11px] text-[#81786C]">خطوط معمارية هادئة</p>
                </div>
                <div>
                  <p className="text-base font-bold text-[#17324A] sm:text-lg">اختيارات</p>
                  <p className="mt-0.5 text-[11px] text-[#81786C]">خامات وألوان متنوعة</p>
                </div>
                <div>
                  <p className="text-base font-bold text-[#17324A] sm:text-lg"> الضمان </p>
                  <p className="mt-0.5 text-[11px] text-[#81786C]">ضمان و صيانه</p>
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[32px] bg-[#F0EAE1] shadow-[0_22px_48px_rgba(23,50,74,0.12)]">
                <Image
                  src={HERO_IMAGE}
                  alt="أثاث معماري من مودرن هوم"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                {featuredProducts.length > 0 && (
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-[20px] border border-[#E6DED2] bg-[#FBF9F4]/90 p-4 shadow-sm backdrop-blur-sm">
                    <div className="text-right">
                      <p className="text-[10px] text-[#81786C]">مختارات مودرن هوم</p>
                      <p className="mt-1 text-sm font-semibold text-[#17324A]">
                        {featuredProducts.length} {featuredProducts.length === 1 ? 'قطعة مختارة' : 'قطع مختارة'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={showAllFeaturedProducts}
                      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F1E9DF] px-3 py-2 text-[11px] font-semibold text-[#A36046]"
                    >
                      <span>عرض الكل</span>
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {visibleCategories.length > 0 && (
        <section id="categories-section" className="border-b border-[#E6DED2] bg-[#FBF9F4] py-16 sm:py-24">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col gap-4 border-b border-[#E6DED2] pb-6 text-right sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="mb-2 block text-xs font-semibold tracking-[0.22em] text-[#A36046]">استكشف حسب المساحة والغرض</span>
                <h2 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl md:text-4xl text-[#17324A]">تصنيفات الأثاث المعماري</h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-[#81786C]">
                قطع وظيفية مصممة بنسب متوازنة تلبي متطلبات الحياة اليومية والعمل المنزلي بأعلى درجات الراحة والجودة.
              </p>
            </div>

            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-none pb-3 sm:gap-5">
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => navigateTo('shop', { categoryId: category.id })}
                  className="group relative w-[min(76vw,280px)] shrink-0 snap-start overflow-hidden rounded-[26px] bg-[#E6DED2] text-right shadow-[0_12px_26px_rgba(23,50,74,0.06)] transition-all duration-200 hover:-translate-y-1 sm:w-[min(38vw,330px)] lg:w-[min(30vw,360px)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-[26px]">
                    <Image
                      src={category.image || HERO_IMAGE}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                      <span className="mb-1 block text-[10px] font-medium text-[#E6DED2]">مجموعة مختارة</span>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-[family-name:var(--font-display)] text-xl sm:text-2xl">
                          {category.name}
                        </h3>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/16 text-white backdrop-blur-sm transition-transform duration-200 group-hover:-translate-x-1 sm:h-10 sm:w-10">
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {displayedProducts.length > 0 && (
        <section id="products-section" className="border-b border-[#E6DED2] bg-[#FBF9F4] py-16 sm:py-24">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-6 border-b border-[#E6DED2] pb-6 text-right md:flex-row md:items-end">
              <div>
                <span className="mb-2 block text-xs font-semibold tracking-[0.22em] text-[#A36046]">اختيارات فريق مودرن هوم</span>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#17324A] sm:text-3xl md:text-4xl">مختارات مودرن هوم</h2>
                <p className="mt-1.5 text-sm text-[#81786C]">{featuredProducts.length} قطعة اختيرت بعناية من التشكيلة</p>
              </div>
              <button
                type="button"
                onClick={showAllFeaturedProducts}
                className="inline-flex min-h-11 items-center gap-2 self-start border-b border-[#C8A77D] text-sm font-semibold text-[#17324A] transition-colors hover:text-[#A36046] md:self-auto"
              >
                <span>عرض كل المختارات</span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scrollbar-none pb-3 sm:gap-5">
              {displayedProducts.map((product, index) => {
                const categoryLabel = categories.find((category) => category.id === product.categoryId)?.name;
                return (
                  <div key={product.id} className="w-[min(72vw,280px)] shrink-0 snap-start sm:w-[min(34vw,320px)] lg:w-[min(21vw,290px)]">
                    <ModernHomeProductCard
                      product={product}
                      categoryLabel={categoryLabel}
                      onSelect={() => handleProductSelect(product)}
                      compact
                      ordinal={index + 1}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section id="craftsmanship-section" className="border-b border-[#E6DED2] bg-[#FBF9F4] py-16 sm:py-24">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="order-2 lg:order-1 lg:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EAE1] shadow-lg">
                <Image
                  src="/images/apple_craft_details_1790845954723.jpg"
                  alt="تفاصيل النحت والتشطيب اليدوي لأثاث مودرن هوم"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="mt-4 border border-[#E6DED2] bg-white p-5 text-right">
                <p className="mb-1 text-xs font-semibold text-[#A36046]">دقة التنفيذ المعماري</p>
                <p className="text-sm leading-relaxed text-[#625E57]">
                  كل خط وكل زاوية قائمة أو مشطوفة تُحسب بالملليمتر لتضمن انسجام القطعة مع الضوء الطبيعي ومساحة الغرفة دون أي تشويش بصري.
                </p>
              </div>
            </div>

            <div className="order-1 space-y-6 text-right lg:order-2 lg:col-span-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#A36046]">
                <span className="h-px w-6 bg-[#A36046]" aria-hidden="true" />
                <span>فلسفة الصنع والخامات</span>
              </div>

              <h2 className="font-[family-name:var(--font-display)] text-2xl leading-[1.25] text-[#17324A] sm:text-3xl md:text-4xl">
                أثاث يدوم لسنوات..
                <span className="mt-1 block font-light text-[#625E57]">صُنع بأيدي مصرية وعناية فائقة.</span>
              </h2>

              <p className="text-sm leading-relaxed text-[#625E57] sm:text-base">
                في مودرن هوم نؤمن بأن الأثاث الجيد يجمع بين جمال التصميم وراحة الاستخدام. نختار تفاصيل كل قطعة بعناية، ونوازن بين الخامة واللون والنسب لتنسجم مع مساحتك وتفاصيل حياتك اليومية.
              </p>

              <div className="space-y-4 pt-2">
                {brandValues.map((item) => (
                  <div key={item.title} className="flex items-start gap-3.5 text-right">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EEE7DC] text-[#17324A]">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#17324A]">{item.title}</h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#81786C]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {PROJECTS_SHOWCASE_ENABLED && homeStories.length > 0 && (
        <section id="showrooms-section" className="border-b border-[#E6DED2] bg-[#FBF9F4] py-16 sm:py-24">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-4 border-b border-[#E6DED2] pb-6 text-right sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="mb-2 block text-xs font-semibold tracking-[0.22em] text-[#A36046]">التجربة الواقعية</span>
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-[#17324A] sm:text-3xl md:text-4xl">في بيوتكم</h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-[#81786C]">
                يسعدنا استقبالكم لتفقد الخامات وعينات الأخشاب والأقمشة على الطبيعة، واستشارة مهندسي الديكور لدينا مجاناً.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {homeStories.map((story, index) => (
                <div
                  key={story.id}
                  onClick={() => navigateTo('projects')}
                  className={`group cursor-pointer overflow-hidden border border-[#E6DED2] bg-white ${index === 0 ? 'lg:col-span-2' : ''}`}
                >
                  <div className={`relative ${index === 0 ? 'h-[320px] sm:h-[380px]' : 'h-[260px] sm:h-[320px]'}`}>
                    {story.image && (
                      <Image
                        src={story.image}
                        alt={story.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {story.location && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                        <MapPin className="h-3 w-3 text-[#E9CBA6]" aria-hidden="true" />
                        {story.location}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 p-4 sm:p-5">
                    <h3 className="font-[family-name:var(--font-display)] text-2xl text-[#17324A]">{story.title}</h3>
                    {story.pieces && <p className="text-sm text-[#625E57]">{story.pieces}</p>}
                    <div className="flex items-center justify-between border-t border-[#E6DED2] pt-3 text-xs text-[#17324A]">
                      <span>مشروع حقيقي</span>
                      <span className="inline-flex items-center gap-1 font-medium text-[#A36046]">
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

      <section className="mx-auto mb-6 w-full max-w-[1500px] px-4 pt-8 sm:mb-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-3 rounded-[24px] border border-[#E6DED2] bg-[#F7F3EC] p-4 shadow-[0_8px_18px_rgba(23,50,74,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <h2 className="text-right font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A]">تحدث معنا</h2>
          <a
            href={whatsappConciergeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(37,211,102,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20b65a] sm:w-auto"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span>واتساب</span>
          </a>
        </div>
      </section>
    </main>
  );
}
