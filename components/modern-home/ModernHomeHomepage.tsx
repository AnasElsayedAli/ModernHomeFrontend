'use client';

import React from 'react';
import {
  ArrowLeft,
  ArrowUpLeft,
  CalendarDays,
  ChevronDown,
  Hammer,
  MapPin,
  MessageCircle,
  Quote,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import Image from '@/components/SafeImage';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import type { EventItem, Product, ProjectItem } from '@/types';
import { useModernHomeContent } from './useModernHomeContent';

const FALLBACK_ROOM_IMAGE = 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=85';
const FALLBACK_MATERIAL_IMAGE = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85';
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1920&q=85';
const priceFormatter = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 });

const TRUST_POINTS = [
  { icon: Hammer, label: 'تصنيع يدوي دقيق' },
  { icon: Truck, label: 'توصيل لكل محافظات مصر' },
  { icon: ShieldCheck, label: 'ضمان على كل قطعة' },
];

function priceLabel(product: Product) {
  return product.price > 0 ? `${priceFormatter.format(product.price)} جنيه` : 'حسب الطلب';
}

function FeaturePiece({ product, onSelect }: { product: Product; onSelect: () => void }) {
  return (
    <article className="group min-w-0">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`عرض ${product.name}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#E6DED2] text-right"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 44vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
        />
        <span className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center bg-[#F7F3EC] text-[#17324A] transition-transform group-hover:-translate-x-1">
          <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>
      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[#18232D]">{product.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-[#6D6A64]">{product.material || 'تفاصيل مختارة'}</p>
        </div>
        <span className="shrink-0 text-xs font-medium text-[#17324A]">{priceLabel(product)}</span>
      </div>
    </article>
  );
}

function ProjectStory({ project, onSelect }: { project: ProjectItem; onSelect: () => void }) {
  return (
    <article className="grid min-w-0 grid-cols-1 lg:grid-cols-12 lg:items-end lg:gap-10">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`اكتشف ${project.title}`}
        className="relative block aspect-[5/4] overflow-hidden bg-[#DED2C3] text-right lg:col-span-8 lg:aspect-[16/10]"
      >
        <Image
          src={project.coverImage}
          alt={project.title}
          fill
          sizes="(max-width: 1024px) 100vw, 68vw"
          className="object-cover transition-transform duration-700 hover:scale-[1.02]"
        />
      </button>
      <div className="space-y-4 py-5 lg:col-span-4 lg:pb-2">
        <p className="flex items-center gap-2 text-xs text-[#9A6248]">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{project.location || 'القاهرة، مصر'}</span>
          {project.year && <span className="text-[#A49A8D]">· {project.year}</span>}
        </p>
        <h3 className="font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#17324A] sm:text-3xl">
          {project.title}
        </h3>
        <p className="text-sm leading-7 text-[#625E57]">{project.description}</p>
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex min-h-10 items-center gap-2 border-b border-[#A36046] text-sm font-semibold text-[#17324A]"
        >
          <span>شاهد المشروع</span>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

function EventCard({ event, onSelect }: { event: EventItem; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative block aspect-[16/9] w-full overflow-hidden bg-[#584839] text-right sm:aspect-[21/9]"
    >
      <Image
        src={event.coverImage || FALLBACK_ROOM_IMAGE}
        alt={event.title}
        fill
        sizes="(max-width: 1024px) 100vw, 60vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#122A3D]/85 via-[#122A3D]/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
        <div className="min-w-0">
          <span className="flex items-center gap-2 text-xs font-medium text-[#E9CBA6]">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            {event.date} · {event.location || 'القاهرة'}
          </span>
          <h3 className="mt-2 truncate font-[family-name:var(--font-display)] text-xl text-white sm:text-2xl">{event.title}</h3>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center bg-white/15 text-white backdrop-blur-sm transition-transform group-hover:-translate-x-1">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

export default function ModernHomeHomepage() {
  const { navigateTo, settings } = useToccoStore();
  const { products, categories, projects, events, isPreviewMode } = useModernHomeContent();
  const publishedProducts = products.filter((product) => product.isPublished);
  const madeToOrder = publishedProducts.filter((product) => product.price <= 0);
  const imported = publishedProducts.filter((product) => product.price > 0);
  const featuredProducts = publishedProducts.filter((product) => product.isFeatured);
  const leadProduct = featuredProducts[0] || publishedProducts[0];
  const supportingProducts = featuredProducts.filter((product) => product.id !== leadProduct?.id).slice(0, 3);
  const leadProject = projects[0];
  const upcomingEvent = events.find((event) => event.isUpcoming) || events[0];
  const manufacturingImage = madeToOrder[0]?.images[0] || FALLBACK_MATERIAL_IMAGE;
  const importedImage = imported[0]?.images[0] || FALLBACK_ROOM_IMAGE;
  const storyImage = leadProduct?.images[1] || leadProduct?.images[0] || FALLBACK_ROOM_IMAGE;
  const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    'مرحبًا مودرن هوم، أود مناقشة تصميم قطعة أثاث تناسب مساحتي.'
  )}`;

  return (
    <div dir="rtl" className="overflow-hidden bg-[#F7F3EC] text-[#18232D]">
      {isPreviewMode && (
        <p role="status" className="border-b border-[#D9CEBF] bg-[#F0E7DA] px-4 py-2 text-center text-[11px] text-[#625E57]">
          معاينة تطوير · بيانات تجريبية لعرض التصميم فقط
        </p>
      )}

      <section id="homepage-hero" className="relative isolate flex min-h-[86svh] items-end overflow-hidden bg-[#17324A] pb-32 pt-24 sm:min-h-[92svh] md:pb-20">
        <div className="absolute inset-0">
          <Image
            src={settings.homepage.heroImage || DEFAULT_HERO_IMAGE}
            alt="مساحة منزلية معاصرة من مودرن هوم"
            fill
            priority
            sizes="100vw"
            className="mh-kenburns object-cover object-[58%_center] brightness-[0.79]"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#122A3D]/90 via-[#17324A]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#122A3D]/60 via-transparent to-[#122A3D]/25" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-[1500px] grid-cols-1 items-end gap-8 px-5 sm:px-10 lg:grid-cols-12 lg:px-14">
          <div className="space-y-5 text-white sm:space-y-7 lg:col-span-12">
            <p className="text-xs font-medium text-[#E9CBA6] sm:text-sm">
              مودرن هوم <span className="mx-1 text-white/50">·</span> صناعة مصرية من قلب القاهرة
            </p>
            <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-[1.45] sm:text-6xl sm:leading-[1.35] lg:text-7xl">
              أثاث يصنع<br className="hidden sm:block" /> للمكان شخصية.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
              تصميمات عصرية بروح مصرية أصيلة، وقطع مختارة بعناية، وتنفيذ يراعي كل تفصيلة في بيتك.
            </p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigateTo('shop')}
                className="inline-flex min-h-12 items-center justify-center gap-3 bg-[#F7F3EC] px-6 text-sm font-semibold text-[#17324A] transition-colors hover:bg-white"
              >
                <span>اكتشف المجموعة</span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => navigateTo('custom-design')}
                className="inline-flex min-h-12 items-center justify-center gap-3 border border-white/60 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <span>تصنيع حسب الطلب</span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

        </div>

        <div className="mh-float absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/70 sm:flex">
          <span className="text-[10px]">مرر لتكتشف المزيد</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>
      </section>

      <section id="brand-story" className="border-b border-[#DED5C9] bg-[#FBF9F4] py-14 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
            <div className="relative flex flex-col justify-between overflow-hidden bg-[#17324A] p-8 text-white sm:p-10 lg:col-span-7 lg:p-14">
              <Quote className="h-10 w-10 text-[#E9CBA6]/40" aria-hidden="true" />
              <div className="mt-6">
                <p className="text-xs font-semibold text-[#E9CBA6]">حكاية المكان <span className="me-2 font-[family-name:var(--font-brand)] text-white/40">01</span></p>
                <h2 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-[1.55] sm:text-5xl">
                  {settings.homepage.storyQuote || 'نصنع مساحة تشبهك.'}
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-8 text-white/75 sm:text-base">
                  نؤمن أن الأثاث جزء من يومك، من جلسة طويلة مع العائلة إلى ركنك الهادئ في آخر النهار. نختار القطع بعناية ونمنحك مساحة لتفصيل ما يلائم بيتك.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('our-story')}
                className="mt-8 inline-flex min-h-10 w-fit items-center gap-2 border-b border-[#E9CBA6] text-sm font-semibold"
              >
                <span>تعرّف على مودرن هوم</span>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col gap-5 lg:col-span-5">
              <figure className="relative min-h-[240px] flex-1 overflow-hidden bg-[#DED2C3] sm:min-h-[280px]">
                <Image src={storyImage} alt="تفاصيل أثاث في مساحة منزلية" fill sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover transition-transform duration-700 hover:scale-105" />
                <figcaption className="absolute bottom-4 right-4 border-r border-white/70 pe-3 text-xs text-white sm:right-6">
                  خامات طبيعية · تفاصيل تعيش معك
                </figcaption>
              </figure>

              <div className="overflow-hidden border border-[#D8CEBF] bg-[#F3EFE8]">
                <div className="bg-[#17324A] px-6 py-5 text-white sm:px-8">
                  <div>
                    <p className="text-[11px] font-semibold text-[#E9CBA6]">اختيارات مودرن هوم</p>
                    <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl sm:text-2xl">تصفح حسب الاهتمام</h3>
                  </div>
                </div>
                {categories.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 sm:p-5">
                    {categories.slice(0, 5).map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => navigateTo('shop', { categoryId: category.id })}
                        className="group flex min-h-12 items-center justify-between gap-3 border border-[#DED5C9] bg-[#FBF9F4] px-4 py-3 text-right text-sm text-[#42515C] transition-colors hover:border-[#17324A] hover:bg-white hover:text-[#17324A]"
                      >
                        <span className="min-w-0">{category.name === 'تصنيع حسب الطلب' ? 'مصنعه' : category.name}</span>
                        <ArrowLeft className="h-4 w-4 shrink-0 text-[#A36046] transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="p-5 text-sm leading-7 text-[#625E57]">نجهز تصنيفات جديدة لعرضها قريبًا.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="furniture-worlds" aria-label="عالما مودرن هوم من الأثاث">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="relative min-h-[390px] overflow-hidden bg-[#584839] sm:min-h-[540px] lg:col-span-8">
            <Image src={manufacturingImage} alt="قطعة أثاث مصممة حسب الطلب" fill sizes="(max-width: 1024px) 100vw, 68vw" className="object-cover transition-transform duration-700 hover:scale-[1.02]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1D211E]/80 via-[#1D211E]/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10 lg:p-14">
              <p className="text-xs font-medium text-[#E9CBA6]">من الفكرة إلى القطعة <span className="me-2 font-[family-name:var(--font-brand)]">01</span></p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-relaxed sm:text-5xl">تصنيع على مقاسك</h2>
              <p className="mt-2 max-w-lg text-sm leading-7 text-white/85">اختر المقاس والخامة واللون، وننفّذ قطعة تبدأ من احتياج مساحتك.</p>
              <button type="button" onClick={() => navigateTo('custom-design')} className="mt-5 inline-flex min-h-10 items-center gap-2 border-b border-[#E9CBA6] text-sm font-semibold">
                <span>ابدأ طلبك</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="relative flex flex-col justify-center gap-10 overflow-hidden bg-[#D9C8AE] px-6 py-10 sm:px-10 sm:py-14 lg:col-span-4 lg:px-12 lg:py-16">
            <span className="pointer-events-none absolute -left-4 -top-10 font-[family-name:var(--font-brand)] text-[160px] leading-none text-[#6D5745]/10 sm:text-[200px]" aria-hidden="true">01</span>
            <div className="relative">
              <p className="text-xs font-semibold text-[#6D5745]">صُنعت لتناسبك</p>
              <p className="mt-5 font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#282B27] sm:text-3xl">
                {madeToOrder[0]?.material || 'تفاصيل تختارها أنت، وقطعة تنتمي إلى بيتك.'}
              </p>
            </div>
            <p className="relative border-t border-[#B8A58E] pt-4 text-xs leading-6 text-[#5F574C]">
              {madeToOrder.length > 0 ? `${madeToOrder.length} قطع متاحة للتنفيذ حسب الطلب` : 'نبدأ من فكرتك، ونراجع التفاصيل معك قبل التنفيذ.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 bg-[#E8E3D9] lg:grid-cols-12">
          <div className="relative flex flex-col justify-center gap-8 overflow-hidden px-6 py-10 sm:px-10 sm:py-14 lg:col-span-4 lg:px-12 lg:py-16">
            <span className="pointer-events-none absolute -left-4 -top-10 font-[family-name:var(--font-brand)] text-[160px] leading-none text-[#A36046]/10 sm:text-[200px]" aria-hidden="true">02</span>
            <div className="relative">
              <p className="text-xs font-semibold text-[#A36046]">اختيارات جاهزة لمساحتك</p>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">مستورد بعناية</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-[#625E57]">قطع بمواصفات وألوان واضحة، جاهزة لتختار منها ما يكمل بيتك.</p>
            </div>
            <div className="relative flex items-center justify-between gap-4 border-t border-[#C9C1B5] pt-4">
              <span className="text-xs text-[#6D6A64]">{imported.length} قطع في المجموعة</span>
              <button type="button" onClick={() => navigateTo('shop')} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#17324A]">
                <span>اكتشف المستورد</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="relative min-h-[360px] overflow-hidden bg-[#6D685F] sm:min-h-[520px] lg:col-span-8">
            <Image src={importedImage} alt="قطعة أثاث مستوردة في غرفة معاصرة" fill sizes="(max-width: 1024px) 100vw, 68vw" className="object-cover transition-transform duration-700 hover:scale-[1.02]" />
            <div className="absolute bottom-4 left-4 border-l border-white/70 ps-3 text-xs text-white sm:bottom-6 sm:left-6">مجموعة مختارة للبيت المعاصر</div>
          </div>
        </div>
      </section>

      {leadProduct && (
        <section id="featured-furniture" className="border-y border-[#DED5C9] bg-[#F3EFE8] py-14 sm:py-20 lg:py-24">
          <div className="relative mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
            <div className="mb-8 flex flex-col gap-5 border-b border-[#DED5C9] pb-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-3 text-xs font-semibold text-[#A36046]">
                  <span className="h-px w-8 bg-[#A36046]" aria-hidden="true" />
                  قطع مختارة
                  <span dir="ltr" className="font-[family-name:var(--font-brand)] text-[#9D9488]">02</span>
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-tight text-[#17324A] sm:text-4xl">تستحق مكانها في بيتك</h2>
              </div>
              <button type="button" onClick={() => navigateTo('shop')} className="inline-flex min-h-10 shrink-0 items-center gap-2 self-start border-b border-[#A36046] text-sm font-semibold text-[#17324A] transition-colors hover:text-[#A36046] sm:self-auto">
                <span>كل القطع</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-7 lg:grid-cols-12 lg:items-center lg:gap-10">
              <button
                type="button"
                onClick={() => navigateTo('product', { productId: leadProduct.id })}
                className="group relative block aspect-[5/4] overflow-hidden border border-[#DED5C9] bg-[#E6DED2] text-right lg:col-span-7 lg:aspect-[4/3]"
                aria-label={`عرض ${leadProduct.name}`}
              >
                <Image src={leadProduct.images[0]} alt={leadProduct.name} fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                <span className="absolute right-4 top-4 bg-[#F7F3EC] px-3 py-2 text-xs font-semibold text-[#17324A] shadow-sm">{leadProduct.price > 0 ? 'قطعة مختارة' : 'تصنيع حسب الطلب'}</span>
                <span className="absolute bottom-4 left-4 grid h-11 w-11 place-items-center bg-[#F7F3EC] text-[#17324A] transition-transform group-hover:-translate-x-1">
                  <ArrowUpLeft className="h-5 w-5" aria-hidden="true" />
                </span>
              </button>

              <div className="flex flex-col justify-end lg:col-span-5">
                <p className="text-xs font-semibold text-[#A36046]">{leadProduct.material || 'من اختيارات مودرن هوم'}</p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">{leadProduct.name}</h3>
                <p className="mt-3 max-w-xl text-sm leading-8 text-[#625E57]">{leadProduct.description}</p>
                {leadProduct.colors?.length > 0 && (
                  <div className="mt-4 flex items-center gap-2" aria-label="الألوان المتاحة">
                    {leadProduct.colors.slice(0, 5).map((color) => (
                      <span key={color.id} className="h-5 w-5 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} title={color.name} />
                    ))}
                  </div>
                )}
                <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#DED5C9] pt-5">
                  <div>
                    <span className="block text-[11px] text-[#6D6A64]">السعر</span>
                    <span className="mt-1 block text-base font-semibold text-[#17324A]">{priceLabel(leadProduct)}</span>
                  </div>
                  <button type="button" onClick={() => navigateTo('product', { productId: leadProduct.id })} className="inline-flex min-h-11 items-center gap-2 bg-[#17324A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#24445E]">
                    <span>تفاصيل القطعة</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {supportingProducts.length > 0 && (
              <div className="mt-10 border-t border-[#DED5C9] pt-7 sm:mt-12 sm:pt-8">
                <p className="mb-5 text-sm font-semibold text-[#17324A]">قطع أخرى من المجموعة</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-6">
                  {supportingProducts.map((product) => (
                    <FeaturePiece key={product.id} product={product} onSelect={() => navigateTo('product', { productId: product.id })} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section id="project-journal" className="border-y border-[#DED5C9] bg-[#E8E3D9] py-14 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-10 lg:px-14">
          <div className="mb-8 flex items-end justify-between gap-5 sm:mb-12">
            <div>
              <p className="text-xs font-semibold text-[#A36046]">من بيوتنا ومشروعاتنا <span className="me-2 font-[family-name:var(--font-brand)] text-[#8F867A]">03</span></p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#17324A] sm:text-4xl">أثاث في مكانه الحقيقي</h2>
            </div>
            <button type="button" onClick={() => navigateTo('projects')} className="hidden min-h-10 shrink-0 items-center gap-2 border-b border-[#A36046] text-sm font-semibold text-[#17324A] sm:inline-flex">
              <span>كل المشروعات</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {leadProject ? (
            <ProjectStory project={leadProject} onSelect={() => navigateTo('projects')} />
          ) : (
            <div className="grid min-h-72 place-items-center border-y border-[#D8CEBF] py-12 text-center">
              <div>
                <p className="text-sm text-[#625E57]">نعمل على تجهيز مشروعات جديدة لعرضها قريبًا.</p>
                <button type="button" onClick={() => navigateTo('custom-design')} className="mt-4 border-b border-[#A36046] pb-1 text-sm font-semibold text-[#17324A]">ناقش مشروعك معنا</button>
              </div>
            </div>
          )}

          {upcomingEvent && (
            <div className="mt-10 border-t border-[#C9C1B5] pt-8">
              <div className="mb-4 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold text-[#A36046]">على أجندة مودرن هوم</p>
                <button type="button" onClick={() => navigateTo('events')} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#17324A]">
                  <span>كل الفعاليات</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <EventCard event={upcomingEvent} onSelect={() => navigateTo('events')} />
            </div>
          )}
        </div>
      </section>

      <section id="custom-design-invitation" className="relative isolate overflow-hidden border-t-4 border-[#C8A77D] bg-[#F3EFE8] text-[#18232D]">
        <div className="relative h-44 w-full overflow-hidden sm:h-56 lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-1/2">
          <Image src={manufacturingImage} alt="تفاصيل خامة وتشطيب أثاث" fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F3EFE8] via-[#F3EFE8]/20 to-transparent lg:bg-gradient-to-l lg:from-[#F3EFE8] lg:via-[#F3EFE8]/70 lg:to-transparent" />
        </div>
        <div className="mh-motif pointer-events-none absolute inset-0 text-[#17324A]/[0.04]" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-5 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-24">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs font-semibold text-[#A36046]">مساحتك، على طريقتك</p>
            <h2 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-5xl">لديك فكرة؟<br />لنصنعها معًا.</h2>
            <p className="max-w-lg text-sm leading-7 text-[#625E57] sm:text-base">أرسل المقاسات والصور المرجعية، وسيتواصل معك فريقنا لمراجعة التفاصيل وخيارات التنفيذ.</p>
            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <button type="button" onClick={() => navigateTo('custom-design')} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#17324A] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#24445E]">
                <span>ابدأ طلبك</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#17324A]/35 px-6 text-sm font-medium text-[#17324A] transition-colors hover:bg-[#17324A]/5">
                <MessageCircle className="h-4 w-4 text-[#65C987]" aria-hidden="true" />
                <span>تحدّث معنا</span>
              </a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-[#D8CEBF] pt-6">
              {TRUST_POINTS.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-xs text-[#625E57]">
                  <Icon className="h-4 w-4 text-[#A36046]" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}