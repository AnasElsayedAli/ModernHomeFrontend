'use client';

import React from 'react';
import { useToccoStore, AppView } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import ToccoLogo from './ToccoLogo';
import { ArrowUpLeft, Facebook, Instagram, Mail, MapPin, MessageCircle, Music2, Phone } from 'lucide-react';

export default function Footer() {
  const { navigateTo, settings } = useToccoStore();

  const handleLink = (view: AppView) => {
    navigateTo(view);
  };

  const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    'مرحبًا مودرن هوم، أود الاستفسار عن منتجاتكم.'
  )}`;
  const currentYear = React.useMemo(() => new Date().getFullYear(), []);
  const instagramHandles = settings.contact.instagramHandles.filter((handle) => !/tocco/i.test(handle));

  return (
    <footer id="main-site-footer" dir="rtl" className="border-t border-white/15 bg-[#17324A] pb-24 pt-12 text-[#F7F3EC] sm:pb-12 sm:pt-16">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        <div className="grid grid-cols-1 gap-10 pb-10 lg:grid-cols-12 lg:gap-14 lg:pb-14">
          <div className="space-y-5 lg:col-span-5">
            <ToccoLogo size="md" showSubtitle theme="light" />
            <p className="max-w-md text-sm leading-8 text-white/70">
              أثاث وديكور عصري بلمسة مصرية أصيلة، وقطع تُصنع بعناية لتناسب تفاصيل بيتك وحياتك اليومية.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 border-b border-[#E9CBA6] text-sm font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4 text-[#65C987]" aria-hidden="true" />
              <span>ابدأ حديثًا عن مساحتك</span>
              <ArrowUpLeft className="h-4 w-4 text-[#E9CBA6]" aria-hidden="true" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-7 lg:grid-cols-3">
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-[#E9CBA6]">اكتشف</h2>
              <ul className="space-y-3 text-sm text-white/75">
                {([
                  ['custom-design', 'تصنيع محلي'],
                  ['imported', 'أثاث مستورد'],
                  ['shop', 'الكتالوج الكامل'],
                  ['our-story', 'حكايتنا'],
                ] as [AppView, string][]).map(([view, label]) => (
                  <li key={view}>
                    <button type="button" onClick={() => handleLink(view)} className="text-right transition-colors hover:text-white">{label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-[#E9CBA6]">المساعدة</h2>
              <ul className="space-y-3 text-sm text-white/75">
                {([
                  ['shipping', 'الشحن والتوصيل'],
                  ['returns', 'الاستبدال والاسترجاع'],
                  ['faq', 'الأسئلة الشائعة'],
                  ['contact', 'تواصل معنا'],
                ] as [AppView, string][]).map(([view, label]) => (
                  <li key={view}>
                    <button type="button" onClick={() => handleLink(view)} className="text-right transition-colors hover:text-white">{label}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 space-y-4 sm:col-span-1">
              <h2 className="text-xs font-semibold text-[#E9CBA6]">زورونا أو راسلونا</h2>
              <div className="space-y-3 text-sm text-white/75">
                <a href={settings.contact.mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 leading-7 hover:text-white">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#E9CBA6]" aria-hidden="true" />
                  <span>{settings.contact.atelierAddress}</span>
                </a>
                {settings.contact.phone && (
                  <a href={`tel:${settings.contact.phone}`} className="flex items-center gap-2.5 hover:text-white">
                    <Phone className="h-4 w-4 shrink-0 text-[#E9CBA6]" aria-hidden="true" />
                    <span dir="ltr">{settings.contact.phone}</span>
                  </a>
                )}
                {settings.contact.email && (
                  <a href={`mailto:${settings.contact.email}`} className="flex items-center gap-2.5 hover:text-white">
                    <Mail className="h-4 w-4 shrink-0 text-[#E9CBA6]" aria-hidden="true" />
                    <span dir="ltr">{settings.contact.email}</span>
                  </a>
                )}
                {instagramHandles.map((handle) => (
                  <a key={handle} href={`https://instagram.com/${handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white">
                    <Instagram className="h-4 w-4 shrink-0 text-[#E9CBA6]" aria-hidden="true" />
                    <span>{handle}</span>
                  </a>
                ))}
                <a href={settings.contact.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white">
                  <Facebook className="h-4 w-4 shrink-0 text-[#E9CBA6]" aria-hidden="true" />
                  <span>فيسبوك</span>
                </a>
                <a href={settings.contact.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 hover:text-white">
                  <Music2 className="h-4 w-4 shrink-0 text-[#E9CBA6]" aria-hidden="true" />
                  <span>تيك توك</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/15 pt-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} مودرن هوم. جميع الحقوق محفوظة.</p>
          <span>للأثاث والديكور العصري · القاهرة، مصر</span>
        </div>
      </div>
    </footer>
  );
}
