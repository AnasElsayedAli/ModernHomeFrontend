'use client';

import React, { useEffect } from 'react';
import { StoreProvider, useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import { AuthProvider } from '@/lib/context/AuthContext';
import { useAuth } from '@/lib/context/AuthContext';
import ModernHeader from '@/components/modern-home/ModernHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import ModernHomeHomepage from '@/components/modern-home/ModernHomeHomepage';
import ShopCatalog from '@/components/ShopCatalog';
import ProductDetailView from '@/components/ProductDetailView';
import OurStoryView from '@/components/OurStoryView';
import ProjectsView from '@/components/ProjectsView';
import CheckoutView from '@/components/CheckoutView';
import OrderConfirmationView from '@/components/OrderConfirmationView';
import AccountView from '@/components/AccountView';
import AdminDashboard from '@/components/AdminDashboard';
import {
  ShippingView,
  ReturnsView,
  FaqView,
  ContactView,
  PrivacyView,
  TermsView,
} from '@/components/ContentPages';
import { MessageCircle, X } from 'lucide-react';

function ToccoApp() {
  const {
    activeView,
    navigateTo,
    settings,
    syncGuestCart,
    forgetAuthenticatedCart,
    storeDataErrors,
    reloadStoreData,
    reloadDashboardSettings,
  } = useToccoStore();
  const { user, isLoading } = useAuth();
  const [isStoreDataAlertDismissed, setIsStoreDataAlertDismissed] = React.useState(false);
  const failedDataLoads = Object.entries(storeDataErrors).filter(([key, message]) => key !== 'projects' && message);
  const failedDataSignature = failedDataLoads.map(([key, message]) => `${key}:${message}`).join('|');

  useEffect(() => {
    if (!failedDataSignature || isStoreDataAlertDismissed) return;

    const timeoutId = window.setTimeout(() => {
      setIsStoreDataAlertDismissed(true);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [failedDataSignature, isStoreDataAlertDismissed]);

  // Push any locally-held guest cart items into the real backend cart once a user signs in.
  const wasAuthenticated = React.useRef(false);
  useEffect(() => {
    if (isLoading) return;

    if (user && !wasAuthenticated.current) {
      void syncGuestCart();
    } else if (!user && wasAuthenticated.current) {
      forgetAuthenticatedCart();
    }
    wasAuthenticated.current = Boolean(user);
  }, [forgetAuthenticatedCart, isLoading, syncGuestCart, user]);

  useEffect(() => {
    if (!isLoading && user) {
      void reloadDashboardSettings();
    }
  }, [isLoading, reloadDashboardSettings, user]);

  const canAccessAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  useEffect(() => {
    if (!isLoading && activeView === 'admin' && !canAccessAdmin) {
      navigateTo('home');
    }
  }, [activeView, canAccessAdmin, isLoading, navigateTo]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeView]);

  const whatsappConciergeUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    'مرحبًا مودرن هوم، أود الاستفسار عن منتجاتكم.'
  )}`;

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#F7F3EC] text-[#18232D]">
      {/* Navigation */}
      <ModernHeader />

      {failedDataLoads.length > 0 && !isStoreDataAlertDismissed && (
        <section
          role="alert"
          className="fixed left-3 right-3 top-20 z-[45] mx-auto max-w-3xl rounded-lg border border-rose-300 bg-white px-4 py-3 shadow-lg sm:left-6 sm:right-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-rose-900">تعذر تحميل بعض بيانات المتجر.</p>
              <ul className="mt-1 space-y-0.5 text-xs text-rose-800">
                {failedDataLoads.map(([key, message]) => {
                  const labels: Record<string, string> = {
                    catalog: 'المنتجات والتصنيفات',
                    cart: 'السلة',
                    projects: 'المشروعات',
                    settings: 'الإعدادات',
                  };
                  return <li key={key}><span className="font-medium">{labels[key] || key}:</span> {message}</li>;
                })}
              </ul>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:ml-4 sm:self-auto">
              <button
                type="button"
                onClick={() => void reloadStoreData()}
                className="text-left text-xs font-semibold text-rose-900 underline underline-offset-2 sm:text-right"
              >
                إعادة المحاولة
              </button>
              <button
                type="button"
                onClick={() => setIsStoreDataAlertDismissed(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rose-900 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="إغلاق التنبيه"
                title="إغلاق التنبيه"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div
            key={failedDataSignature}
            className="notification-progress-track absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-b-lg bg-[#F1EAE4]"
            aria-hidden="true"
          >
            <div className="notification-progress-fill h-full w-full bg-[#A88E7A]" />
          </div>
        </section>
      )}

      {/* Main Content Body */}
      <main className="flex-1">
        {activeView === 'home' && (
          <ModernHomeHomepage />
        )}

        {activeView === 'shop' && <ShopCatalog />}

        {activeView === 'featured' && <ShopCatalog featuredOnly />}

        {activeView === 'product' && <ProductDetailView />}

        {activeView === 'our-story' && <OurStoryView />}

        {activeView === 'projects' && <ProjectsView />}

        {activeView === 'checkout' && <CheckoutView />}

        {activeView === 'confirmation' && <OrderConfirmationView />}

        {activeView === 'account' && <AccountView />}

        {activeView === 'admin' && canAccessAdmin && <AdminDashboard />}

        {activeView === 'shipping' && <ShippingView />}

        {activeView === 'returns' && <ReturnsView />}

        {activeView === 'faq' && <FaqView />}

        {activeView === 'contact' && <ContactView />}

        {activeView === 'privacy' && <PrivacyView />}

        {activeView === 'terms' && <TermsView />}
      </main>

      {/* Footer (hidden in admin to keep CMS focused) */}
      {activeView !== 'admin' && <Footer />}

      {/* Slide-over Bag Drawer */}
      <CartDrawer />

      {activeView !== 'admin' && <MobileBottomNav />}

      {/* Floating WhatsApp contact (hidden in admin) */}
      {activeView !== 'admin' && (
        <aside
          aria-label="تواصل واتساب"
            className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6"
        >
          <a
            id="floating-whatsapp-concierge"
            href={whatsappConciergeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تواصل مع مودرن هوم على واتساب"
            className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#17324A] text-white shadow-[0_12px_26px_rgba(23,50,74,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#24445E] active:scale-95"
            title="تواصل مع مودرن هوم على واتساب"
          >
            <MessageCircle className="h-5 w-5 text-[#25D366]" aria-hidden="true" />
          </a>
        </aside>
      )}

    </div>
  );
}

export default function Page() {
  return (
    <StoreProvider>
      <AuthProvider>
        <ToccoApp />
      </AuthProvider>
    </StoreProvider>
  );
}
