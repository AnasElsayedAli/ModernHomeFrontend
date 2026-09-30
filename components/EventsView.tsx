'use client';

import React, { useState } from 'react';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import Image from '@/components/SafeImage';
import { CalendarDays, MapPin, ArrowLeft, MessageCircle } from 'lucide-react';
import { useModernHomeContent } from './modern-home/useModernHomeContent';

export default function EventsView() {
  const { settings, isEventsLoading, storeDataErrors, reloadStoreData } = useToccoStore();
  const { events, usingPreviewEvents } = useModernHomeContent();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  const filteredEvents = events.filter((ev) => {
    if (filter === 'upcoming') return ev.isUpcoming;
    if (filter === 'past') return !ev.isUpcoming;
    return true;
  });

  const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    'مرحبًا مودرن هوم، أود الاستفسار عن حضور الفعالية القادمة.'
  )}`;

  return (
    <div id="events-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <header className="bg-[#17324A] py-9 text-white sm:py-14 lg:py-20">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 px-5 sm:px-10 lg:flex-row lg:items-end lg:px-14">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold text-[#E9CBA6]">لقاءات مودرن هوم</p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed sm:text-5xl">نلتقي حول تفاصيل البيت.</h1>
            <p className="max-w-xl text-sm leading-7 text-white/75">معارض ولقاءات نشارك فيها أفكارًا وقطعًا جديدة من عالم الأثاث.</p>
          </div>
          <div role="group" aria-label="تصفية الفعاليات" className="flex w-fit border border-white/30">
            {(['all', 'upcoming', 'past'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`min-h-10 px-3 text-xs transition-colors sm:px-4 ${
                  filter === f
                    ? 'bg-[#E9CBA6] font-semibold text-[#17324A]'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                  {f === 'all' ? 'الكل' : f === 'upcoming' ? 'القادمة' : 'السابقة'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        {usingPreviewEvents && (
          <p role="status" className="mt-5 border-r-2 border-[#A36046] bg-[#EEE7DC] px-3 py-2 text-xs text-[#625E57]">فعاليات معاينة محلية لعرض التصميم فقط.</p>
        )}
        {isEventsLoading ? (
          <div className="flex min-h-64 items-center justify-center py-16 text-sm text-[#6D6A64]" role="status" aria-live="polite">
              جارٍ تحميل الفعاليات...
          </div>
        ) : storeDataErrors.events && !usingPreviewEvents ? (
          <div role="alert" className="my-8 border-y border-[#DED5C9] px-5 py-10 text-center">
              <p className="text-sm font-semibold text-[#17324A]">تعذر تحميل الفعاليات</p>
            <p className="mt-2 text-xs text-[#736B63]">{storeDataErrors.events}</p>
            <button type="button" onClick={() => void reloadStoreData()} className="mt-4 bg-[#17324A] px-5 py-2.5 text-sm font-medium text-white">إعادة المحاولة</button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="grid min-h-72 place-items-center py-16 text-center">
            <p className="text-sm font-medium text-[#17324A]">{events.length === 0 ? 'لا توجد فعاليات مجدولة حاليًا.' : `لا توجد فعاليات ${filter === 'upcoming' ? 'قادمة' : 'سابقة'} حاليًا.`}</p>
            {filter !== 'all' && <button type="button" onClick={() => setFilter('all')} className="mt-3 text-sm font-medium text-[#17324A] underline underline-offset-2">عرض كل الفعاليات</button>}
          </div>
        ) : (
        <section className="py-8 sm:py-12">
          {filteredEvents[0] && (
            <article className="grid grid-cols-1 gap-5 border-b border-[#DED5C9] pb-8 sm:gap-8 sm:pb-12 lg:grid-cols-12 lg:items-end lg:gap-12">
              <div className="relative aspect-[5/4] overflow-hidden bg-[#E6DED2] sm:aspect-[16/10] lg:col-span-8">
                <Image src={filteredEvents[0].coverImage} alt={filteredEvents[0].title} fill priority sizes="(max-width: 1024px) 100vw, 68vw" className="object-cover" />
                <span className="absolute right-4 top-4 bg-[#F7F3EC] px-3 py-1.5 text-xs text-[#17324A]">{filteredEvents[0].isUpcoming ? 'موعد قادم' : 'من أرشيفنا'}</span>
              </div>
              <div className="space-y-4 lg:col-span-4">
                <p className="flex items-center gap-2 text-xs text-[#9A6248]">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" />{filteredEvents[0].date}
                  {filteredEvents[0].location && <><span>·</span><MapPin className="h-3.5 w-3.5" aria-hidden="true" />{filteredEvents[0].location}</>}
                </p>
                <h2 className="font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#17324A] sm:text-3xl">{filteredEvents[0].title}</h2>
                <p className="text-sm leading-7 text-[#625E57]">{filteredEvents[0].description}</p>
                {filteredEvents[0].isUpcoming && (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 border-b border-[#A36046] text-sm font-semibold text-[#17324A]">
                    <MessageCircle className="h-4 w-4 text-[#3A8D62]" aria-hidden="true"/><span>استفسر عن الحضور</span><ArrowLeft className="h-4 w-4" aria-hidden="true"/>
                  </a>
                )}
              </div>
            </article>
          )}

          {filteredEvents.length > 1 && (
            <div className="mt-5 grid grid-cols-1 gap-x-10 lg:grid-cols-2">
              {filteredEvents.slice(1).map((event) => (
                <article key={event.id} className="grid grid-cols-[72px_1fr] gap-4 border-b border-[#DED5C9] py-5 sm:grid-cols-[96px_1fr] sm:gap-6">
                  <div className="relative aspect-square overflow-hidden bg-[#E6DED2]">
                    <Image src={event.coverImage} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <p className="flex items-center gap-2 text-[11px] text-[#9A6248]"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true"/>{event.date}</p>
                    <h3 className="truncate font-[family-name:var(--font-display)] text-lg text-[#17324A]">{event.title}</h3>
                    <p className="line-clamp-2 text-xs leading-6 text-[#6D6A64]">{event.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        )}
      </main>
    </div>
  );
}
