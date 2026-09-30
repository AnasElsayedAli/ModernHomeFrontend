'use client';

import { useToccoStore } from '@/lib/store';
import Image from '@/components/SafeImage';
import { ArrowLeft } from 'lucide-react';

export default function OurStoryView() {
  const { navigateTo } = useToccoStore();

  return (
    <div id="our-story-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <section className="grid grid-cols-1 bg-[#E8E3D9] lg:min-h-[650px] lg:grid-cols-12">
        <div className="flex flex-col justify-center px-5 py-10 sm:px-10 sm:py-14 lg:col-span-5 lg:px-14 lg:py-20">
          <p className="text-xs font-semibold text-[#A36046]">فلسفة مودرن هوم · صُنعت بأيدٍ مصرية في القاهرة</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-[1.55] text-[#17324A] sm:text-5xl">
            بيتك ليس مساحة فقط.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-8 text-[#625E57] sm:text-base">
            هو تفاصيل تتكرر كل يوم؛ قطعة تختارها بعناية، خامة تلمسها، وركن يحمل دفء البيت المصري ويشبهك.
          </p>
          <button type="button" onClick={() => navigateTo('shop')} className="mt-7 inline-flex min-h-10 w-fit items-center gap-2 border-b border-[#A36046] text-sm font-semibold text-[#17324A]">
            <span>اكتشف المجموعة</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <figure className="relative min-h-[320px] overflow-hidden bg-[#6A5A48] sm:min-h-[500px] lg:col-span-7">
          <Image src="https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1500&q=85" alt="أثاث عصري في مساحة منزلية دافئة" fill sizes="(max-width: 1024px) 100vw, 58vw" priority className="object-cover" />
          <figcaption className="absolute bottom-4 right-4 border-r border-white/70 pe-3 text-xs text-white sm:bottom-6 sm:right-7">تصميم معاصر · حياة يومية</figcaption>
        </figure>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        <section className="grid grid-cols-1 gap-8 border-b border-[#DED5C9] py-10 sm:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20">
          <p className="text-xs font-semibold text-[#A36046] lg:col-span-3">01 · كيف نختار</p>
          <div className="space-y-4 lg:col-span-7">
            <h2 className="font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#17324A] sm:text-4xl">التصميم يبدأ من طريقة عيشك.</h2>
            <p className="max-w-2xl text-sm leading-8 text-[#625E57] sm:text-base">
              نبحث عن التوازن بين الراحة والخطوط الواضحة والخامات المناسبة. قطعة جميلة يجب أن تكون عملية، وأن تبدو طبيعية في المكان الذي تعيش فيه.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-0 border-b border-[#DED5C9] lg:grid-cols-12">
          <figure className="relative min-h-[320px] overflow-hidden bg-[#786854] sm:min-h-[500px] lg:col-span-7">
            <Image src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1400&q=85" alt="خامات وألوان أثاث مودرن هوم" fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
          </figure>
          <div className="flex flex-col justify-center gap-5 bg-[#FBF9F4] px-5 py-8 sm:px-10 sm:py-12 lg:col-span-5 lg:px-12">
            <p className="text-xs font-semibold text-[#A36046]">02 · ما يناسب مساحتك</p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#17324A] sm:text-3xl">قطعة جاهزة، أو تفصيل يبدأ منك.</h2>
            <p className="text-sm leading-8 text-[#625E57]">
              في مجموعتنا قطع مختارة بمواصفات واضحة. وللمساحات ذات الاحتياج الخاص، نراجع المقاسات والخامات والتفاصيل معك قبل التنفيذ.
            </p>
            <button type="button" onClick={() => navigateTo('custom-design')} className="inline-flex min-h-10 w-fit items-center gap-2 border-b border-[#A36046] text-sm font-semibold text-[#17324A]">
              <span>ناقش تصميمك</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-5 py-10 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:py-20">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold text-[#A36046]">مودرن هوم · للأثاث والديكور العصري</p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#17324A] sm:text-4xl">اختيارات تعيش معك كل يوم.</h2>
            <p className="text-sm leading-7 text-[#625E57]">اكتشف المجموعة، أو أخبرنا عن القطعة التي تتخيلها.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => navigateTo('shop')} className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#17324A] px-6 text-sm font-semibold text-white hover:bg-[#24445E]">
              <span>اكتشف المجموعة</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => navigateTo('custom-design')} className="min-h-12 border border-[#BFB4A6] px-6 text-sm font-semibold text-[#17324A] hover:border-[#17324A]">
              صمّم قطعتك
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
