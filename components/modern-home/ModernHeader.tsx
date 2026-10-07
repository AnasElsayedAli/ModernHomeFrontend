'use client';

import React, { useState } from 'react';
import { ArrowLeft, Menu, Search, ShoppingBag, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { useToccoStore, type AppView } from '@/lib/store';
import { useAuth } from '@/lib/context/AuthContext';
import { ToccoMark } from '@/components/ToccoLogo';
import { useAccessibleDialog } from '@/hooks/use-accessible-dialog';

const links: { label: string; view: AppView }[] = [
  { label: 'جميع المنتجات', view: 'shop' },
  { label: 'التصنيفات', view: 'shop' },
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { dialogRef, handleDialogKeyDown } = useAccessibleDialog(
    isMobileMenuOpen,
    () => setIsMobileMenuOpen(false),
  );

  const goToView = (view: AppView, categoryId?: string) => {
    if (view === 'shop') {
      navigateTo('shop', { categoryId: categoryId ?? '' });
    } else {
      navigateTo(view);
    }
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateTo('shop', { categoryId: '' });
    setIsSearchOpen(false);
  };

  return (
    <>
      <header id="main-navigation-header" className="sticky top-0 z-50 border-b border-[#E6DED2] bg-[#FBF9F4]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[78px] max-w-[1500px] items-center justify-between gap-4 px-4 sm:h-[82px] sm:px-8 lg:px-12">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => goToView('home')}
              aria-label="الصفحة الرئيسية لمودرن هوم"
              className="flex shrink-0 items-center gap-2.5 text-right"
            >
              <ToccoMark size={40} className="h-9 w-9 sm:h-10 sm:w-10" />
              <span className="flex flex-col leading-none">
                <span className="font-[family-name:var(--font-display)] text-xl text-[#17324A] sm:text-2xl">مودرن هوم</span>
                <span className="mt-1.5 text-[9px] text-[#81786C] sm:text-[10px]">أثاث المساحات المعاصرة</span>
              </span>
            </button>

            <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-7 text-sm font-medium text-[#625E57] lg:flex">
              {links.map((link) => (
                <button
                  key={`${link.view}-${link.label}`}
                  type="button"
                  onClick={() => goToView(link.view, link.view === 'shop' ? '' : undefined)}
                  aria-current={activeView === link.view ? 'page' : undefined}
                  className={`relative py-1 transition-colors hover:text-[#17324A] ${
                    activeView === link.view ? 'font-semibold text-[#17324A]' : ''
                  }`}
                >
                  {link.label}
                  {activeView === link.view && <span className="absolute inset-x-0 -bottom-2 h-px bg-[#A36046]" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsSearchOpen((open) => !open)}
              aria-label={isSearchOpen ? 'إغلاق البحث' : 'بحث في المجموعة'}
              aria-expanded={isSearchOpen}
              className="grid h-10 w-10 place-items-center rounded-none text-[#625E57] transition-colors hover:bg-[#F4EFE6] hover:text-[#17324A]"
            >
              {isSearchOpen ? <X className="h-[18px] w-[18px]" aria-hidden="true" /> : <Search className="h-[18px] w-[18px]" aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={() => goToView('account')}
              aria-label={user ? 'حسابي' : 'تسجيل الدخول'}
              className="hidden h-10 items-center gap-2 rounded-none px-2 text-xs text-[#17324A] transition-colors hover:bg-[#F4EFE6] sm:flex"
            >
              <UserRound className="h-[17px] w-[17px]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label={`حقيبتك، ${cartItemsCount} قطع`}
              className="flex h-10 items-center gap-2 rounded-none px-2 text-xs text-[#625E57] transition-colors hover:bg-[#F4EFE6] hover:text-[#17324A]"
            >
              <div className="relative">
                <ShoppingBag className="h-[18px] w-[18px]" aria-hidden="true" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 grid h-4 min-w-4 place-items-center bg-[#A36046] px-1 text-[9px] font-bold text-white">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden text-[11px] font-medium sm:inline">السلة</span>
            </button>

            {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
              <button
                type="button"
                onClick={() => goToView('admin')}
                aria-label="إدارة المتجر"
                title="إدارة المتجر"
                className="hidden h-10 items-center gap-2 rounded-none text-[#6D6A64] transition-colors hover:bg-[#F4EFE6] hover:text-[#17324A] sm:flex"
              >
                <SlidersHorizontal className="h-[17px] w-[17px]" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
              aria-expanded={isMobileMenuOpen}
              className="p-2.5 text-[#625E57] transition-colors hover:bg-[#F4EFE6] hover:text-[#17324A] lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <form onSubmit={submitSearch} className="border-t border-[#E6DED2] bg-[#FBF9F4] px-4 py-3 sm:px-8">
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <Search className="h-4 w-4 shrink-0 text-[#A36046]" aria-hidden="true" />
              <input
                id="catalog-search-input"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="ابحث عن طاولة، مكتب، أو وحدة تلفزيون..."
                aria-label="ابحث في المجموعة"
                dir="rtl"
                autoFocus
                className="min-h-11 min-w-0 flex-1 border-b border-[#DED5C9] bg-transparent text-right text-sm text-[#17324A] outline-none placeholder:text-[#BEB3A4] focus:border-[#17324A]"
              />
              <button
                type="submit"
                className="inline-flex min-h-10 shrink-0 items-center gap-2 bg-[#17324A] px-4 text-xs font-semibold text-white"
              >
                <span>بحث</span>
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}

      </header>

      {isMobileMenuOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
          tabIndex={-1}
          onKeyDown={handleDialogKeyDown}
          dir="rtl"
          className="fixed inset-0 z-[60] flex h-[100dvh] flex-col overflow-y-auto bg-[#FBF9F4] lg:hidden"
        >
          <div className="flex h-[78px] shrink-0 items-center justify-between border-b border-[#E6DED2] px-4 sm:px-8">
            <h2 id="mobile-menu-title" className="text-base font-semibold text-[#17324A]">القائمة</h2>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="إغلاق القائمة"
              className="grid h-10 w-10 place-items-center text-[#625E57] transition-colors hover:bg-[#F4EFE6] hover:text-[#17324A]"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-1 flex-col px-6 py-6">
            <div className="flex flex-col gap-4 text-base font-medium text-[#18232D]">
              <button type="button" onClick={() => goToView('shop', '')} className="border-b border-[#E6DED2] py-2 text-right hover:text-[#17324A]">جميع المنتجات</button>
              <button type="button" onClick={() => goToView('shop', '')} className="border-b border-[#E6DED2] py-2 text-right hover:text-[#17324A]">تصفح التصنيفات</button>
              <button type="button" onClick={() => goToView('our-story')} className="border-b border-[#E6DED2] py-2 text-right hover:text-[#17324A]">فلسفة الصنع</button>
              <button type="button" onClick={() => goToView('account')} className="border-b border-[#E6DED2] py-2 text-right hover:text-[#17324A]">حسابي</button>
            </div>
            {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
              <div className="mt-auto border-t border-[#E6DED2] pt-5">
                <button
                  type="button"
                  onClick={() => goToView('admin')}
                  className="flex min-h-12 w-full items-center gap-3 border border-[#DED5C9] px-4 text-right text-sm font-semibold text-[#17324A] transition-colors hover:bg-[#F4EFE6]"
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  <span>لوحة الإدارة</span>
                  <ArrowLeft className="ms-auto h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
