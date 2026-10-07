'use client';

import { useToccoStore } from '@/lib/store';
import Image from '@/components/SafeImage';
import { ArrowLeft } from 'lucide-react';

export default function OurStoryView() {
  const { navigateTo } = useToccoStore();

  return (
    <div id="our-story-page" dir="rtl" className="bg-[#F7F3EC] text-[#18232D]">
      <section className="relative isolate h-[72svh] min-h-[520px] max-h-[760px] overflow-hidden bg-[#17324A] text-white" aria-labelledby="story-hero-title">
        <Image
          src="/images/apple_hero_living_1790845941555.jpg"
          alt="مساحة معيشة معاصرة تطل على أفق القاهرة"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#101D29]/85 via-[#142B3D]/20 to-[#142B3D]/5" aria-hidden="true" />
        <div className="mx-auto flex h-full max-w-[1500px] flex-col justify-end px-5 pb-9 sm:px-10 sm:pb-12 lg:px-14 lg:pb-14">
          <p className="text-xs font-medium text-[#F0D6B1]">أثاث منزلي ومكتبي <span className="mx-2 text-white/50">/</span> القاهرة</p>
          <h1 id="story-hero-title" className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl leading-[1.2] text-white sm:text-6xl lg:text-7xl">
            مساحة تشبهك،<br className="hidden sm:block" /> وتترك للحياة مجالًا.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
            نؤمن أن الأثاث الجيد لا يملأ المكان؛ بل يمنحه توازنًا وراحةً تشعر بهما كل يوم.
          </p>
          <button type="button" onClick={() => navigateTo('shop')} className="mt-5 inline-flex min-h-10 w-fit items-center gap-2 border-b border-[#F0D6B1] pb-1 text-sm font-semibold text-white transition-colors hover:text-[#F0D6B1]">
            <span>اكتشف اختياراتنا</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p dir="ltr" className="absolute left-5 top-5 font-[family-name:var(--font-brand)] text-[10px] uppercase text-white/80 sm:left-10 sm:top-8 lg:left-14">Modern Home <span className="mx-2 text-[#F0D6B1]">—</span> Cairo</p>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-7 px-5 py-16 sm:px-10 sm:py-20 md:grid-cols-12 md:gap-10 lg:px-14 lg:py-24" aria-labelledby="story-belief-title">
        <p className="text-xs font-semibold text-[#A36046] md:col-span-2 md:pt-3">فلسفتنا</p>
        <h2 id="story-belief-title" className="font-[family-name:var(--font-display)] text-3xl leading-[1.45] text-[#17324A] sm:text-5xl md:col-span-6">
          الأثاث ليس ما نضيفه للمكان،<br className="hidden sm:block" /> بل ما يتيحه لنا.
        </h2>
        <p className="max-w-md text-sm leading-8 text-[#625E57] sm:text-base md:col-span-4 md:pt-3">
          لحظة هدوء في البيت. تركيز أكبر في مساحة العمل. نختار قطعًا تجمع الراحة والعملية، وتترك لكل مكان طابعه الخاص.
        </p>
      </section>

      <section className="grid bg-[#17324A] text-white md:grid-cols-12" aria-labelledby="story-craft-title">
        <figure className="relative aspect-[5/4] overflow-hidden bg-[#8D7057] md:col-span-7 md:aspect-auto md:min-h-[540px]">
          <Image
            src="/images/apple_craft_details_1790845954723.jpg"
            alt="تفصيلة التقاء الخشب الطبيعي في قطعة أثاث"
            fill
            sizes="(max-width: 768px) 100vw, 58vw"
            className="object-cover object-center"
          />
          <figcaption className="absolute bottom-4 right-5 text-xs text-white/85 sm:bottom-6 sm:right-8">الملمس جزء من الحكاية</figcaption>
        </figure>
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-14 md:col-span-5 lg:px-16">
          <p className="text-xs font-medium text-[#E9CBA6]">من الخامة إلى التفصيلة</p>
          <h2 id="story-craft-title" className="mt-4 max-w-lg font-[family-name:var(--font-display)] text-3xl leading-[1.45] sm:text-4xl">
            الجمال الذي يدوم، يبدأ من طريقة صنعه.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-8 text-white/75 sm:text-base">
            نهتم بتوازن الخامة والخط والوظيفة؛ حتى تبدو القطعة جميلة في المكان، وتظل مريحة في تفاصيل استخدامها.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-10 px-5 py-16 sm:px-10 sm:py-20 md:grid-cols-12 md:gap-12 lg:px-14 lg:py-24" aria-labelledby="story-spaces-title">
        <div className="md:col-span-5">
          <p className="text-xs font-semibold text-[#A36046]">من البيت إلى العمل</p>
          <h2 id="story-spaces-title" className="mt-3 max-w-lg font-[family-name:var(--font-display)] text-3xl leading-[1.45] text-[#17324A] sm:text-4xl">
            لكل مساحة إيقاعها.
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:col-span-7 md:pt-10">
          <div>
            <p className="text-xs text-[#A36046]">المنزل</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[#17324A]">راحةٌ تُعاش.</h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-[#625E57]">
              قطع تضيف دفئًا وشخصية لغرف المعيشة والطعام، وتنسجم مع لحظات البيت اليومية.
            </p>
          </div>
          <div>
            <p className="text-xs text-[#A36046]">المكتب</p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[#17324A]">تركيزٌ يَسَع.</h3>
            <p className="mt-3 max-w-sm text-sm leading-7 text-[#625E57]">
              أثاث عملي للمكاتب ومساحات الضيافة، يساعد المكان أن يعمل بكفاءة ويظل مرحّبًا.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[#DED5C9]" aria-label="استكشف مودرن هوم">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-5 py-8 sm:px-10 sm:py-10 md:flex-row md:items-center md:justify-between lg:px-14">
          <p className="font-[family-name:var(--font-display)] text-xl text-[#17324A] sm:text-2xl">ابدأ من المساحة التي تعني لك.</p>
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            <button type="button" onClick={() => navigateTo('shop')} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#17324A] transition-colors hover:text-[#A36046]">
              <span>استكشف المجموعة</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
