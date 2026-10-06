'use client';

import React from 'react';
import { useToccoStore, AppView } from '@/lib/store';
import { House, Armchair, ShoppingBag, UserRound } from 'lucide-react';

export default function MobileBottomNav() {
  const {
    activeView,
    navigateTo,
    cartItemsCount,
    setIsCartDrawerOpen,
  } = useToccoStore();

  // Hide in admin CMS so it doesn't collide with table/form controls
  if (activeView === 'admin') {
    return null;
  }

  const tabs: {
    id: string;
    label: string;
    icon: React.ElementType;
    action: () => void;
    isActive: boolean;
    badge?: number;
  }[] = [
    {
      id: 'home',
      label: 'الرئيسية',
      icon: House,
      action: () => navigateTo('home'),
      isActive: activeView === 'home',
    },
    {
      id: 'shop',
      label: 'المنتجات',
      icon: Armchair,
      action: () => navigateTo('shop', { categoryId: '' }),
      isActive: activeView === 'shop',
    },
    {
      id: 'account',
      label: 'حسابي',
      icon: UserRound,
      action: () => navigateTo('account'),
      isActive: activeView === 'account',
    },
    {
      id: 'bag',
      label: 'الحقيبة',
      icon: ShoppingBag,
      action: () => setIsCartDrawerOpen(true),
      isActive: false,
      badge: cartItemsCount,
    },
  ];

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      aria-label="التنقل الرئيسي"
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#D8CEBF] bg-[#FBF9F4]/96 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(23,50,74,0.07)] backdrop-blur-lg md:hidden"
    >
      <div className="mx-auto flex h-[62px] max-w-lg items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isCurrent = tab.isActive;
          return (
            <button
              key={tab.id}
              id={`mobile-tab-${tab.id}`}
              onClick={tab.action}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center py-1.5 transition-colors duration-200 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#A36046] ${
                isCurrent ? 'text-[#17324A]' : 'text-[#81786C] hover:text-[#17324A]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-[18px] w-[18px] transition-transform duration-200 ${isCurrent ? 'stroke-[2.2]' : 'stroke-[1.7]'}`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center bg-[#A36046] px-1 text-[9px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 truncate text-[10px] transition-all ${
                  isCurrent ? 'font-semibold text-[#17324A]' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
              {isCurrent && (
                <span className="absolute inset-x-1/3 top-0 h-[2px] bg-[#A36046]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
