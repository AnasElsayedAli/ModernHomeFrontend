'use client';

import React, { useState } from 'react';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import {
  Truck,
  ShieldCheck,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Music2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';

export function ShippingView() {
  const { settings } = useToccoStore();

  return (
    <div id="shipping-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-3xl space-y-10 px-5 sm:space-y-12 sm:px-10">
        <div className="space-y-3 border-b border-[#DED5C9] py-8 sm:py-12">
          <span className="text-xs font-semibold text-[#A36046]">
            خدمة العملاء
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">
            الشحن والتوصيل
          </h1>
          <p className="text-sm leading-7 text-[#6D6A64] sm:text-base">
            نحرص على وصول طلبك إلى منزلك بعناية.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-7 text-[#53616A]">
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A]">١. التنفيذ والتوصيل</h2>
            <p>
              تُنفذ القطع حسب الطلب، ومدة التوصيل المعتادة من أسبوعين إلى ثلاثة أسابيع.
            </p>
            <p>
              قد يستغرق تنفيذ التصميمات الخاصة ثلاثة أسابيع أو أكثر، وفقًا للتصميم والمواصفات.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A]">٢. مناطق ورسوم التوصيل</h2>
            <p>
              نوصل الطلبات إلى مختلف أنحاء مصر. تختلف رسوم الشحن بحسب موقع التوصيل وحجم الطلب.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A]">٣. المعاينة وسداد المبلغ المتبقي ({100 - settings.depositPercentage}%)</h2>
            <p>
              عند التوصيل، يرجى معاينة القطعة والتأكد من التشطيب والحالة قبل الاستلام وسداد المبلغ المتبقي ({100 - settings.depositPercentage}%) عبر إنستا باي أو وسيلة الدفع المتفق عليها. يرجى إبلاغ فريقنا بأي ملاحظات وقت التسليم.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export function ReturnsView() {
  return (
    <div id="returns-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-3xl space-y-10 px-5 sm:space-y-12 sm:px-10">
        <div className="space-y-3 border-b border-[#DED5C9] py-8 sm:py-12">
          <span className="text-xs font-semibold text-[#A36046]">
            خدمة العملاء
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">
            سياسة الاستبدال والاسترجاع
          </h1>
          <p className="text-sm leading-7 text-[#6D6A64] sm:text-base">
            يتاح الاستبدال أو الاسترجاع للقطع التي تصل تالفة فقط.
          </p>
        </div>

        <div className="space-y-8 text-sm leading-7 text-[#53616A]">
          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A]">١. المنتجات التالفة فقط</h2>
            <p>
              يُقبل الاستبدال أو الاسترجاع عند وصول القطعة تالفة فقط. يرجى إبلاغ فريقنا أثناء معاينة التوصيل، مع صور أو مقطع فيديو واضح لحالة المنتج.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A]">٢. الحلول المتاحة</h2>
            <p>
              بعد التحقق من التلف، يمكنك اختيار أحد الحلول التالية:
            </p>
            <ul className="list-disc pe-5 space-y-1 text-sm">
              <li>تنفيذ قطعة بديلة دون تكلفة إضافية</li>
              <li>استرداد قيمة المقدم المدفوع</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function FaqView() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const { settings } = useToccoStore();

  const faqs = [
    {
      q: 'هل يمكنني طلب مقاسات أو ألوان مخصصة؟',
      a: 'نعم. يمكنك مشاركة المقاسات واللون المطلوب، بما في ذلك درجات RAL، عبر صفحة التصنيع حسب الطلب أو واتساب.',
    },
    {
      q: 'ما الفرق بين التشطيب المطفأ واللامع؟',
      a: 'التشطيب المطفأ هادئ وغير عاكس للضوء، أما اللامع فيمنح السطح انعكاسًا يبرز اللون وتفاصيل القطعة.',
    },
    {
      q: 'كيف أعتني بقطع الأثاث؟',
      a: 'استخدم قطعة قماش ناعمة وماءً دافئًا مع صابون لطيف، وتجنب أدوات التنظيف الخشنة. يمكن تلميع الأسطح اللامعة بمنتج مناسب للعناية بها.',
    },
    {
      q: 'هل يمكن وضع القطع في الخارج؟',
      a: 'تختلف ملاءمة الاستخدام الخارجي بحسب خامة كل قطعة وتشطيبها. راجع مواصفات المنتج أو تواصل معنا قبل الاستخدام.',
    },
  ];

  return (
    <div id="faq-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-3xl space-y-10 px-5 sm:space-y-12 sm:px-10">
        <div className="space-y-3 border-b border-[#DED5C9] py-8 sm:py-12">
          <span className="text-xs font-semibold text-[#A36046]">
            مساعدة ومعلومات
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">
            الأسئلة الشائعة
          </h1>
          <p className="text-sm leading-7 text-[#6D6A64] sm:text-base">
            إجابات عن التصنيع والمقاسات والعناية بالمنتجات.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden border-b border-[#DED5C9] transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="flex min-h-16 w-full items-center justify-between gap-4 py-4 text-right font-[family-name:var(--font-display)] text-base font-semibold text-[#17324A] sm:text-lg"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#643D26] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-[#8F8880] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="border-t border-[#E6DED2] px-5 pb-5 pt-4 text-sm leading-7 text-[#53616A]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ContactView() {
  const { settings } = useToccoStore();

  const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    'مرحبًا مودرن هوم، أود الاستفسار عن منتجاتكم أو ترتيب استشارة.'
  )}`;

  return (
    <div id="contact-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-[1500px] space-y-10 px-5 sm:space-y-12 sm:px-10 lg:px-14">
        <div className="max-w-3xl space-y-3 border-b border-[#DED5C9] py-8 sm:py-12">
          <span className="text-xs font-semibold text-[#A36046]">
            تواصل معنا
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">
            فريق مودرن هوم في خدمتك
          </h1>
          <p className="text-sm leading-7 text-[#6D6A64] sm:text-base">
            للاستفسارات أو تنسيق زيارة، تواصل معنا عبر البيانات التالية.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-6 border-t-2 border-[#17324A] py-6 lg:col-span-7 lg:col-start-3">
            <div className="space-y-6">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#B85D38]" />
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1C1A19]">
                      العنوان
                    </h2>
                    <a
                      href={settings.contact.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-xs leading-relaxed text-[#524B45] underline decoration-[#D8CEBF] underline-offset-2 hover:text-[#643D26]"
                    >
                      {settings.contact.atelierAddress}
                    </a>
                    <p className="mt-1 text-[11px] text-[#8F8880]">
                      {settings.contact.hours || 'الزيارات بموعد مسبق'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-[#B85D38]" />
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1C1A19]">
                      الهاتف
                    </h2>
                    <a href={`tel:${settings.contact.phone}`} className="mt-0.5 text-xs font-mono text-[#524B45] hover:text-[#643D26]">
                      {settings.contact.phone}
                    </a>
                  </div>
                </div>

                {settings.contact.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 shrink-0 text-[#B85D38]" />
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1C1A19]">
                        البريد الإلكتروني
                      </h2>
                      <a href={`mailto:${settings.contact.email}`} className="mt-0.5 text-xs font-mono text-[#524B45] hover:text-[#643D26]">
                        {settings.contact.email}
                      </a>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-x-5 gap-y-3 border-t border-[#DED5C9] pt-5 text-xs">
                  <a href={settings.contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#524B45] hover:text-[#643D26]">
                    <Facebook className="h-4 w-4" aria-hidden="true" />
                    <span>فيسبوك</span>
                  </a>
                  <a href={`https://instagram.com/${settings.contact.instagramHandles[0]?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#524B45] hover:text-[#643D26]">
                    <Instagram className="h-4 w-4" aria-hidden="true" />
                    <span>إنستجرام</span>
                  </a>
                  <a href={settings.contact.tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#524B45] hover:text-[#643D26]">
                    <Music2 className="h-4 w-4" aria-hidden="true" />
                    <span>تيك توك</span>
                  </a>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 w-full items-center justify-center gap-2 bg-[#17324A] py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#24445E]"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                <span>تواصل معنا على واتساب</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyView() {
  return (
    <div id="privacy-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-3xl space-y-8 px-5 text-sm leading-8 text-[#625E57] sm:px-10">
        <div className="space-y-2 border-b border-[#DED5C9] py-8 sm:py-10">
          <span className="text-xs font-semibold text-[#A36046]">معلومات قانونية</span>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#17324A]">سياسة الخصوصية</h1>
          <p className="text-xs text-[#6D6A64]">آخر تحديث: مارس ٢٠٢٦</p>
        </div>

        <p>
          تحترم مودرن هوم خصوصية عملائها. نستخدم بيانات التواصل وعنوان التوصيل اللازمة لمتابعة الطلب وتسليمه.
        </p>
        <p>
          لا نبيع بياناتك الشخصية أو نؤجرها للغير. تُحفظ سجلات الطلبات وإثباتات الدفع وفق الإجراءات التجارية المعمول بها.
        </p>
      </div>
    </div>
  );
}

export function TermsView() {
  const { settings } = useToccoStore();

  return (
    <div id="terms-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-3xl space-y-8 px-5 text-sm leading-8 text-[#625E57] sm:px-10">
        <div className="space-y-2 border-b border-[#DED5C9] py-8 sm:py-10">
          <span className="text-xs font-semibold text-[#A36046]">معلومات قانونية</span>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-[#17324A]">الشروط والأحكام</h1>
          <p className="text-xs text-[#6D6A64]">مودرن هوم · القاهرة، مصر</p>
        </div>

        <p>
          <strong>١. المقدم وتنفيذ الطلب:</strong> يُؤكد الطلب بعد استلام مقدم بنسبة {settings.depositPercentage}%. بعد بدء تخصيص الخامات والتنفيذ، لا يُسترد المقدم.
        </p>
        <p>
          <strong>٢. اختلافات التصنيع:</strong> قد تظهر اختلافات بسيطة في الملمس أو اللون أو التشطيب بين القطع، ولا تُعد عيوبًا بحد ذاتها.
        </p>
        <p>
          <strong>٣. المبلغ المتبقي:</strong> يُسدد المبلغ المتبقي ({100 - settings.depositPercentage}%) عند وصول فريق التوصيل وقبل استلام الطلب.
        </p>
      </div>
    </div>
  );
}
