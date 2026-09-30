'use client';

import React from 'react';
import { useToccoStore } from '@/lib/store';
import Image from '@/components/SafeImage';
import { MapPin, ArrowLeft } from 'lucide-react';
import { useModernHomeContent } from './modern-home/useModernHomeContent';

export default function ProjectsView() {
  const { navigateTo, isProjectsLoading, storeDataErrors, reloadStoreData } = useToccoStore();
  const { projects, usingPreviewProjects } = useModernHomeContent();
  const leadProject = projects[0];

  return (
    <div id="projects-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <section className="grid grid-cols-1 bg-[#E8E3D9] lg:min-h-[560px] lg:grid-cols-12">
        <div className="flex flex-col justify-center px-5 py-10 sm:px-10 sm:py-14 lg:col-span-5 lg:px-14 lg:py-20">
          <p className="text-xs font-semibold text-[#A36046]">دفتر المساحات · مودرن هوم</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl leading-[1.55] text-[#17324A] sm:text-5xl">
            أثاث في مكانه الحقيقي.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-8 text-[#625E57] sm:text-base">
            مساحات صُممت لتُعاش، وقطع تجد مكانها بين تفاصيل البيت اليومية.
          </p>
          <button type="button" onClick={() => navigateTo('custom-design')} className="mt-7 inline-flex min-h-10 w-fit items-center gap-2 border-b border-[#A36046] text-sm font-semibold text-[#17324A]">
            <span>ناقش مساحة مشروعك</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="relative min-h-[320px] overflow-hidden bg-[#6A5A48] sm:min-h-[500px] lg:col-span-7">
          <Image
            src={leadProject?.coverImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1500&q=85'}
            alt={leadProject?.title || 'مساحة منزلية نفذتها مودرن هوم'}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17324A]/40 to-transparent" />
          <span className="absolute bottom-4 right-4 text-xs text-white sm:bottom-6 sm:right-7">القاهرة · مصر</span>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        {usingPreviewProjects && (
          <p role="status" className="mt-5 border-r-2 border-[#A36046] bg-[#EEE7DC] px-3 py-2 text-xs text-[#625E57]">مشروعات معاينة محلية لعرض التصميم فقط.</p>
        )}
        <div className="space-y-12 py-8 sm:space-y-20 sm:py-14">
          {isProjectsLoading ? (
            <div className="flex min-h-64 items-center justify-center py-16 text-xs uppercase tracking-wider text-[#736B63]" role="status" aria-live="polite">
              جارٍ تحميل المشروعات...
            </div>
          ) : storeDataErrors.projects && !usingPreviewProjects ? (
            <div role="alert" className="rounded-xl border border-rose-200 bg-white p-8 text-center">
              <p className="text-sm font-semibold text-[#17324A]">تعذر تحميل المشروعات</p>
              <p className="mt-2 text-xs text-[#736B63]">{storeDataErrors.projects}</p>
              <button type="button" onClick={() => void reloadStoreData()} className="mt-4 bg-[#17324A] px-5 py-2.5 text-sm font-medium text-white">إعادة المحاولة</button>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-[#6D6A64]">لا توجد مشروعات معروضة حاليًا.</p>
              <button type="button" onClick={() => navigateTo('custom-design')} className="mt-3 text-sm font-medium text-[#17324A] underline underline-offset-2">ناقش مشروعك</button>
            </div>
          ) : (
          <>
          {projects.map((project, idx) => (
            <article key={project.id} className="grid grid-cols-1 items-center gap-5 border-b border-[#DED5C9] pb-8 sm:gap-8 sm:pb-12 lg:grid-cols-12 lg:gap-12">
              <div className={`relative aspect-[5/4] overflow-hidden bg-[#E6DED2] sm:aspect-[16/10] ${idx % 2 === 1 ? 'lg:order-2 lg:col-span-8' : 'lg:col-span-8'}`}>
                <Image src={project.coverImage} alt={project.title} fill sizes="(max-width: 1024px) 100vw, 68vw" className="object-cover transition-transform duration-700 hover:scale-[1.02]" />
                <span className="absolute bottom-4 right-4 font-[family-name:var(--font-brand)] text-xs text-white drop-shadow">{String(idx + 1).padStart(2, '0')}</span>
              </div>

              <div className={`space-y-4 sm:space-y-5 ${idx % 2 === 1 ? 'lg:order-1 lg:col-span-4' : 'lg:col-span-4'}`}>
                <p className="flex items-center gap-2 text-xs text-[#9A6248]">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{project.location || 'القاهرة، مصر'}</span>
                  {project.year && <span className="text-[#9A9185]">· {project.year}</span>}
                </p>
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl leading-relaxed text-[#17324A] sm:text-3xl">{project.title}</h2>
                  <p className="mt-1 text-xs text-[#A36046]">{project.subtitle}</p>
                </div>
                <p className="text-sm leading-7 text-[#625E57]">{project.description}</p>

                {(project.featuredPieces || project.productsUsed || []).length > 0 && (
                  <div className="border-t border-[#DED5C9] pt-3">
                    <p className="mb-2 text-[11px] text-[#81786C]">قطع من المجموعة</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      {(project.featuredPieces || project.productsUsed || []).map((piece, pieceIndex) => (
                        project.productId ? (
                          <button key={`${piece}-${pieceIndex}`} type="button" onClick={() => navigateTo('product', { productId: project.productId })} className="border-b border-[#C8A77D] pb-0.5 text-xs text-[#42515C] hover:text-[#17324A]">{piece}</button>
                        ) : <span key={`${piece}-${pieceIndex}`} className="text-xs text-[#625E57]">{piece}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button type="button" onClick={() => navigateTo('custom-design')} className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#17324A] hover:text-[#A36046]">
                  <span>ناقش تصميمًا مشابهًا</span><ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
