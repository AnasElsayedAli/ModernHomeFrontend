'use client';

import React from 'react';
import CustomDesignRequestForm from '@/components/CustomDesignRequestForm';
import Image from '@/components/SafeImage';
import { Building2, Ruler, Truck, ShieldCheck } from 'lucide-react';

export default function B2BView() {
  return (
    <div id="b2b-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <section className="grid grid-cols-1 bg-[#17324A] text-white lg:min-h-[600px] lg:grid-cols-12">
        <div className="flex flex-col justify-center px-5 py-10 sm:px-10 sm:py-14 lg:col-span-5 lg:px-14 lg:py-20">
          <p className="text-xs font-semibold text-[#E9CBA6]">حلول للمشروعات والأعمال</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-[1.55] sm:text-5xl">مساحة عمل<br />لها حضورها.</h1>
          <p className="mt-4 max-w-lg text-sm leading-8 text-white/75 sm:text-base">
            أثاث للمكاتب والضيافة والمساحات التجارية، يُختار أو يُصنع ليناسب طبيعة مشروعك.
          </p>
          <span className="mt-8 border-t border-white/25 pt-4 text-xs text-[#E9CBA6]">شاركنا المخططات والمقاسات والموعد المطلوب.</span>
        </div>
        <figure className="relative min-h-[320px] overflow-hidden bg-[#6A5A48] sm:min-h-[500px] lg:col-span-7">
          <Image src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1500&q=85" alt="مساحة عمل معاصرة مجهزة بالأثاث" fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
          <figcaption className="absolute bottom-4 right-4 border-r border-white/70 pe-3 text-xs text-white sm:bottom-6 sm:right-7">مشروعات · ضيافة · مكاتب</figcaption>
        </figure>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        <section className="border-b border-[#DED5C9] py-7 sm:py-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[#17324A] sm:text-2xl">من المخطط إلى المكان</h2>
            <span className="text-xs text-[#81786C]">خطوات واضحة، مناقشة مباشرة</span>
          </div>
          <ol className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { num: '01', title: 'تفاصيل المشروع', desc: 'أرسل المخططات والكميات والموعد المطلوب وطبيعة الاستخدام.' },
              { num: '02', title: 'مراجعة التصميم', desc: 'نراجع المقاسات والألوان والتشطيبات والتفاصيل الفنية معك.' },
              { num: '03', title: 'التنفيذ', desc: 'يتابع فريقنا مراحل التصنيع ومراجعة الجودة والتشطيب.' },
              { num: '04', title: 'التوصيل والتركيب', desc: 'ننسق التسليم والتركيب بما يتناسب مع جدول المشروع.' },
            ].map((step) => (
              <li key={step.num} className="border-t border-[#C9C1B5] py-4 sm:py-5">
                <span className="font-[family-name:var(--font-brand)] text-xs text-[#A36046]">{step.num}</span>
                <h3 className="mt-2 text-sm font-semibold text-[#17324A]">{step.title}</h3>
                <p className="mt-1 text-xs leading-6 text-[#6D6A64]">{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <div className="grid grid-cols-1 gap-8 py-8 sm:py-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <CustomDesignRequestForm requestType="BUSINESS" />
          </div>

          <aside className="space-y-5 border-t-2 border-[#17324A] py-5 sm:space-y-6 lg:col-span-4">
            <p className="text-xs font-semibold text-[#A36046]">دعم فريق مودرن هوم</p>
            <div className="space-y-4 text-sm text-[#53616A]">
              {[
                { icon: Building2, title: 'تواصل مباشر', desc: 'يتابع فريقنا تفاصيل الطلب مع فريق التصميم أو المشتريات لديك.' },
                { icon: Ruler, title: 'مقاسات حسب الحاجة', desc: 'ناقش المقاسات والألوان والتشطيبات المناسبة للمكان.' },
                { icon: Truck, title: 'تنسيق التوصيل', desc: 'نرتب تفاصيل التسليم بما يتناسب مع موقع المشروع وجدوله.' },
                { icon: ShieldCheck, title: 'اختيارات عملية', desc: 'نساعدك في اختيار القطع والتشطيبات المناسبة لطبيعة الاستخدام.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3 border-b border-[#DED5C9] pb-4">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#A36046]" />
                  <div><h3 className="font-semibold text-[#17324A]">{title}</h3><p className="mt-0.5 text-xs leading-6 text-[#6D6A64]">{desc}</p></div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}