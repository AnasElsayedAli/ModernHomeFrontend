'use client';

import React, { useState, useEffect } from 'react';
import { useToccoStore, AppView } from '@/lib/store';
import { useAuth } from '@/lib/context/AuthContext';
import ToccoLogo from './ToccoLogo';
import { ShoppingBag, User, Search, Menu, X, SlidersHorizontal, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const {
    activeView,
    navigateTo,
    cartItemsCount,
    setIsCartDrawerOpen,
    searchQuery,
    setSearchQuery,
  } = useToccoStore();

  const { user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { label: string; view: AppView }[] = [
    { label: 'الرئيسية', view: 'home' },
    { label: 'المنتجات', view: 'shop' },
    { label: 'عن مودرن هوم', view: 'our-story' },
  ];

  const handleNavClick = (view: AppView) => {
    navigateTo(view);
    setMobileMenuOpen(false);
  };

  const isTransparent = !isScrolled && activeView === 'home' && !mobileMenuOpen && !isSearchOpen;

  return (
    <header
      id="main-navigation-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent border-b border-transparent shadow-none'
          : 'bg-[#F7F3EC]/95 backdrop-blur-md border-b border-[#E6DED2] shadow-[0_2px_12px_rgba(23,50,74,0.06)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <button
          id="nav-logo-btn"
          onClick={() => handleNavClick('home')}
          className="group flex items-center text-right focus:outline-none"
          aria-label="الصفحة الرئيسية لمودرن هوم"
        >
          <ToccoLogo size="sm" showSubtitle={false} theme={isTransparent ? 'light' : 'dark'} />
        </button>

        {/* Center: Editorial Navigation Links (Desktop) */}
        <nav
          id="desktop-nav-links"
          className="hidden xl:flex items-center gap-5 2xl:gap-7 text-[13px] font-medium"
        >
          {navLinks.map((link) => {
            const isActive = activeView === link.view;
            return (
              <button
                key={link.view}
                id={`nav-link-${link.view}`}
                onClick={() => handleNavClick(link.view)}
                className={`relative py-1 transition-colors duration-200 ${
                  isTransparent
                    ? isActive
                      ? 'text-white font-semibold'
                      : 'text-white/85 hover:text-white'
                    : isActive
                    ? 'text-[#1C1A19] font-semibold'
                    : 'text-[#42515C] hover:text-[#17324A]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    className={`absolute bottom-0 left-0 w-full h-[1.5px] animate-in fade-in duration-200 ${
                      isTransparent ? 'bg-white' : 'bg-[#17324A]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Search Toggle */}
          <button
            id="nav-search-toggle-btn"
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (activeView !== 'shop' && !isSearchOpen) {
                navigateTo('shop');
              }
            }}
            className={`p-2.5 rounded-full transition-colors focus:outline-none touch-manipulation ${
              isTransparent
                ? 'text-white/90 hover:text-white hover:bg-white/10'
                : 'text-[#42515C] hover:text-[#17324A] hover:bg-[#EEE5D9]'
            }`}
              title="البحث في المنتجات"
              aria-label="بحث"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Account Portal */}
          <button
            id="nav-account-btn"
            onClick={() => handleNavClick('account')}
            className={`p-2 sm:px-3 sm:py-2 rounded-full transition-colors focus:outline-none touch-manipulation flex items-center gap-1.5 ${
              isTransparent
                ? 'text-white/90 hover:text-white hover:bg-white/10'
                : activeView === 'account'
                ? 'text-[#17324A] bg-[#EDE4D7]'
                : 'text-[#42515C] hover:text-[#17324A] hover:bg-[#EEE5D9]'
            }`}
              title="حسابي وطلباتي"
              aria-label=""
          >
            <div className="relative">
              <User className="w-4 h-4" />
              {user && (
                <span className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </div>
            {user && (
              <span className="hidden sm:inline-block text-[11px] font-medium tracking-normal capitalize truncate max-w-[90px]">
                {user.first_name}
              </span>
            )}
          </button>

          {/* Cart Bag */}
          <button
            id="nav-cart-btn"
            onClick={() => setIsCartDrawerOpen(true)}
            className={`relative p-2.5 rounded-full transition-colors focus:outline-none touch-manipulation ${
              isTransparent
                ? 'text-white/90 hover:text-white hover:bg-white/10'
                : 'text-[#42515C] hover:text-[#17324A] hover:bg-[#EEE5D9]'
            }`}
              title="عرض سلة التسوق"
              aria-label="السلة"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartItemsCount > 0 && (
              <span
                id="cart-badge-count"
                className="absolute top-1 left-1 min-w-[17px] h-[17px] px-1 bg-[#17324A] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs ring-1 ring-white/30"
              >
                {cartItemsCount}
              </span>
            )}
          </button>

          {/* Admin Dashboard CMS Toggle (Desktop) */}
          {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && <button
            id="nav-admin-btn"
            onClick={() => handleNavClick('admin')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-[11px] tracking-wider uppercase font-medium rounded-full border transition-all duration-200 ${
              isTransparent
                ? 'text-white border-white/40 bg-white/10 backdrop-blur-xs hover:bg-white/20 hover:border-white/70'
                : activeView === 'admin'
                ? 'bg-[#1C1A19] text-white border-[#1C1A19]'
                : 'text-[#17324A] border-[#D9CEBF] bg-[#F0E7DA] hover:border-[#17324A]'
            }`}
            title="إدارة المتجر والطلبات"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>إدارة المتجر</span>
          </button>}

          {/* Mobile Hamburger Toggle */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2.5 rounded-full focus:outline-none touch-manipulation transition-colors ${
              isTransparent
                ? 'text-white hover:bg-white/10'
                : 'text-[#42515C] hover:text-[#17324A] hover:bg-[#EEE5D9]'
            }`}
              aria-label="فتح القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Inline Search Drawer / Dropdown */}
      {isSearchOpen && (
        <div
          id="nav-search-bar"
          className="border-t border-[#E6DED2] bg-[#F7F3EC] px-4 py-3 animate-in slide-in-from-top-2 duration-200 shadow-inner"
          dir="rtl"
        >
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Search className="w-4 h-4 text-[#736B63] shrink-0" />
            <input
              id="catalog-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'shop') navigateTo('shop');
              }}
              placeholder="Search pieces, categories, mineral finishes..."
              className="w-full bg-transparent text-right text-sm text-[#18232D] placeholder-[#817D75] focus:outline-none"
              dir="rtl"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#6D6A64] hover:text-[#17324A] shrink-0"
              >
                مسح
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-xs text-[#6D6A64] hover:text-[#17324A] p-1 shrink-0"
              aria-label="إغلاق البحث"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Navigation Full Screen Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="md:hidden fixed inset-x-0 top-16 sm:top-20 h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-5rem)] bg-[#F7F3EC] z-50 flex flex-col justify-between p-5 shadow-2xl overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          dir="rtl"
        >
          <div className="space-y-6">
            {/* Navigation links */}
            <nav className="flex flex-col space-y-1 text-sm font-medium text-[#42515C]">
              {navLinks.map((link) => {
                const isActive = activeView === link.view;
                return (
                  <button
                    key={link.view}
                    onClick={() => handleNavClick(link.view)}
                    className={`text-right py-3 px-3 rounded-lg transition-colors flex items-center justify-between ${
                      isActive
                        ? 'bg-[#EDE4D7] text-[#17324A] font-semibold'
                        : 'hover:bg-[#F0E7DA] text-[#18232D]'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowLeft className="h-4 w-4 text-[#9A8A74]" aria-hidden="true" />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions inside Mobile Drawer */}
          <div className="pt-6 border-t border-[#EAE4DC] space-y-3">
            {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && <button
              onClick={() => handleNavClick('admin')}
              className="flex items-center justify-between w-full py-3 px-4 rounded-lg bg-[#EDE4D7] text-sm font-medium text-[#17324A]"
            >
              <span className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4" />
                إدارة المتجر
              </span>
              <span className="text-xs text-[#6D6A64]">فتح</span>
            </button>}

            <div className="flex items-center justify-between pt-2 text-xs text-[#6D6A64]">
              <span>مودرن هوم · القاهرة</span>
              <span>للأثاث والديكور العصري</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
