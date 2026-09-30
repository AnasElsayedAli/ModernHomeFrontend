'use client';

import React from 'react';
import CustomDesignRequestForm from '@/components/CustomDesignRequestForm';
import Image from '@/components/SafeImage';

export default function CustomDesignView() {
  return (
    <div id="custom-design-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <section className="grid grid-cols-1 bg-[#E8E3D9] lg:min-h-[540px] lg:grid-cols-12">
        <div className="flex flex-col justify-center px-5 py-10 sm:px-10 sm:py-14 lg:col-span-5 lg:px-14 lg:py-20">
          <p className="text-xs font-semibold text-[#A36046]">تصنيع حسب الطلب · مودرن هوم</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-[1.55] text-[#17324A] sm:text-5xl">
            من الفكرة<br />إلى القطعة.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-8 text-[#625E57] sm:text-base">
            شاركنا المقاسات والخامات والألوان التي تناسب مساحتك. نراجع التفاصيل معك ونحوّل فكرتك إلى قطعة تعيش في بيتك.
          </p>
          <span className="mt-8 border-t border-[#C9C1B5] pt-4 text-xs text-[#756B5D]">
            أثاث يُصنع على احتياجك، لا على مقاس واحد.
          </span>
        </div>
        <figure className="relative min-h-[300px] overflow-hidden bg-[#6A5A48] sm:min-h-[480px] lg:col-span-7">
          <Image
            src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1500&q=85"
            alt="تفاصيل أثاث وخامات طبيعية في مساحة معاصرة"
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          <figcaption className="absolute bottom-4 right-4 border-r border-white/75 pe-3 text-xs text-white sm:bottom-6 sm:right-7">
            خامة · مقاس · تشطيب
          </figcaption>
        </figure>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        <section className="border-b border-[#DED5C9] py-7 sm:py-10" aria-label="مراحل التصنيع">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[#17324A] sm:text-2xl">رحلة القطعة</h2>
            <span className="text-xs text-[#81786C]">من أول تفصيلة حتى التسليم</span>
          </div>
          <ol className="grid grid-cols-2 gap-x-5 sm:grid-cols-5 sm:gap-0">
            {['الفكرة', 'التصميم', 'مراجعة التفاصيل', 'التنفيذ', 'القطعة النهائية'].map((stage, index) => (
              <li key={stage} className="flex items-center gap-3 border-t border-[#C9C1B5] py-3 sm:me-4 sm:gap-3 sm:pt-4">
                <span className="font-[family-name:var(--font-brand)] text-xs text-[#A36046]">0{index + 1}</span>
                <span className="text-xs font-medium text-[#42515C] sm:text-sm">{stage}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid grid-cols-1 gap-8 py-8 sm:py-12 lg:grid-cols-12 lg:gap-14">
          <aside className="space-y-5 lg:col-span-4 lg:py-4">
            <p className="text-xs font-semibold text-[#A36046]">ابدأ من مساحتك</p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#17324A] sm:text-3xl">ما الذي تريد أن تصنعه؟</h2>
            <p className="text-sm leading-7 text-[#625E57]">
              أخبرنا عن القطعة والاستخدام والمقاسات التقريبية. أرفق صورًا أو رسومات تساعدنا على فهم اتجاهك.
            </p>
            <p className="border-r-2 border-[#C8A77D] bg-[#EEE7DC] px-4 py-3 text-xs leading-6 text-[#625E57]">
              سيتواصل معك فريقنا خلال يومي عمل لمراجعة ما أرسلته.
            </p>
          </aside>
          <div className="lg:col-span-8">
            <CustomDesignRequestForm requestType="CLIENT" />
          </div>
        </div>
      </div>
    </div>
  );
}
