'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useToccoStore, type AppView } from '@/lib/store';
import { useAuth } from '@/lib/context/AuthContext';
import { ToccoMark } from '@/components/ToccoLogo';

const links: { label: string; view: AppView }[] = [
  { label: 'المجموعة', view: 'shop' },
  { label: 'تصنيع حسب الطلب', view: 'custom-design' },
  { label: 'مشروعات الأعمال', view: 'b2b' },
  { label: 'مشروعاتنا', view: 'projects' },
  { label: 'الفعاليات', view: 'events' },
  { label: 'حكايتنا', view: 'our-story' },
];

export default function ModernHeader() {
  const {
    activeView,
    navigateTo,
    cartItemsCount,
    setIsCartDrawerOpen,
    searchQuery,
    setSearchQuery,
  } = useToccoStore();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const goToView = (view: AppView) => {
    if (view === 'shop') {
      navigateTo('shop', { categoryId: '' });
    } else {
      navigateTo(view);
    }
    setIsSearchOpen(false);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateTo('shop', { categoryId: '' });
    setIsSearchOpen(false);
  };

  return (
    <header id="main-navigation-header" className="sticky top-0 z-50 border-b border-[#DED5C9] bg-[#FBF9F4]/96 backdrop-blur-sm">
      <div className="mx-auto flex h-[68px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:h-[76px] sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => goToView('home')}
          aria-label="الصفحة الرئيسية لمودرن هوم"
          className="flex shrink-0 items-center gap-2.5 text-right"
        >
          <span className="grid h-9 w-9 place-items-center bg-[#17324A] sm:h-10 sm:w-10">
            <ToccoMark size={25} fillColor="#F7F3EC" hasCircle={false} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-[family-name:var(--font-display)] text-lg text-[#17324A] sm:text-xl">مودرن هوم</span>
            <span className="mt-1.5 text-[9px] text-[#81786C] sm:text-[10px]">للأثاث والديكور العصري</span>
          </span>
        </button>

        <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-5 lg:flex xl:gap-8">
          {links.map((link) => (
            <button
              key={link.view}
              type="button"
              onClick={() => goToView(link.view)}
              aria-current={activeView === link.view ? 'page' : undefined}
              className={`relative min-h-10 text-xs transition-colors ${activeView === link.view ? 'font-semibold text-[#17324A]' : 'text-[#625E57] hover:text-[#A36046]'}`}
            >
              {link.label}
              {activeView === link.view && <span className="absolute inset-x-0 bottom-0 h-px bg-[#A36046]" />}
            </button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen((open) => !open)}
            aria-label={isSearchOpen ? 'إغلاق البحث' : 'بحث في المجموعة'}
            aria-expanded={isSearchOpen}
            className="grid h-10 w-10 place-items-center text-[#17324A] transition-colors hover:bg-[#EEE7DC]"
          >
            {isSearchOpen ? <X className="h-[18px] w-[18px]" aria-hidden="true" /> : <Search className="h-[18px] w-[18px]" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => goToView('account')}
            aria-label={user ? 'حسابي' : 'تسجيل الدخول'}
            className="hidden h-10 items-center gap-2 px-2 text-xs text-[#17324A] transition-colors hover:bg-[#EEE7DC] sm:flex"
          >
            <UserRound className="h-[17px] w-[17px]" aria-hidden="true" />
            <span>{user ? 'حسابي' : 'دخول'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            aria-label={`حقيبتك، ${cartItemsCount} قطع`}
            className="relative grid h-10 w-10 place-items-center text-[#17324A] transition-colors hover:bg-[#EEE7DC]"
          >
            <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
            {cartItemsCount > 0 && <span className="absolute left-1 top-1 grid h-4 min-w-4 place-items-center bg-[#A36046] px-1 text-[9px] font-semibold text-white">{cartItemsCount}</span>}
          </button>
          {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
            <button
              type="button"
              onClick={() => goToView('admin')}
              className="hidden min-h-9 border-r border-[#DED5C9] pe-3 text-[11px] font-medium text-[#6D6A64] hover:text-[#17324A] xl:block"
            >
              إدارة المتجر
            </button>
          )}
        </div>
      </div>

      {isSearchOpen && (
        <form onSubmit={submitSearch} className="border-t border-[#DED5C9] bg-[#FBF9F4] px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <Search className="h-4 w-4 shrink-0 text-[#A36046]" aria-hidden="true" />
            <input
              id="catalog-search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث عن قطعة أو خامة..."
              aria-label="ابحث في المجموعة"
              dir="rtl"
              autoFocus
              className="min-h-11 min-w-0 flex-1 border-b border-[#BEB3A4] bg-transparent text-right text-sm text-[#18232D] outline-none placeholder:text-[#92897D] focus:border-[#17324A]"
            />
            <button type="submit" className="inline-flex min-h-10 shrink-0 items-center gap-2 bg-[#17324A] px-4 text-xs font-semibold text-white">
              <span>بحث</span><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </form>
      )}
    </header>
  );
}