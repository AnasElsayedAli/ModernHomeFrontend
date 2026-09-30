'use client';

import React, { useEffect } from 'react';
import { StoreProvider, useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import { AuthProvider } from '@/lib/context/AuthContext';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import BannersSection from '@/components/BannersSection';
import {
  HomeHero,
  SignaturePiecesSection,
  StoryTeaserSection,
  CategoriesShowcase,
  CollaborationsSection,
  CustomDesignTeaser,
  ProjectsAndInstagramSection,
} from '@/components/HomeSections';
import ShopCatalog from '@/components/ShopCatalog';
import ProductDetailView from '@/components/ProductDetailView';
import CustomDesignView from '@/components/CustomDesignView';
import B2BView from '@/components/B2BView';
import OurStoryView from '@/components/OurStoryView';
import EventsView from '@/components/EventsView';
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
  const failedDataLoads = Object.entries(storeDataErrors).filter(([, message]) => message);
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
    if (user && !wasAuthenticated.current) {
      void syncGuestCart();
    } else if (!user && wasAuthenticated.current) {
      forgetAuthenticatedCart();
    }
    wasAuthenticated.current = Boolean(user);
  }, [user, syncGuestCart, forgetAuthenticatedCart]);

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
    'Hello Tocco House, I am inquiring about your handcrafted fiberglass design pieces.'
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1A19]">
      {/* Navigation */}
      <Navbar />

      {failedDataLoads.length > 0 && !isStoreDataAlertDismissed && (
        <section
          role="alert"
          className="fixed left-3 right-3 top-20 z-[45] mx-auto max-w-3xl rounded-lg border border-rose-300 bg-white px-4 py-3 shadow-lg sm:left-6 sm:right-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-900">Some store information could not be loaded.</p>
              <ul className="mt-1 space-y-0.5 text-xs text-rose-800">
                {failedDataLoads.map(([key, message]) => (
                  <li key={key}><span className="font-medium capitalize">{key}:</span> {message}</li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end sm:ml-4 sm:self-auto">
              <button
                type="button"
                onClick={() => void reloadStoreData()}
                className="text-left text-xs font-semibold text-rose-900 underline underline-offset-2 sm:text-right"
              >
                Retry loading
              </button>
              <button
                type="button"
                onClick={() => setIsStoreDataAlertDismissed(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rose-900 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                aria-label="Dismiss notification"
                title="Dismiss notification"
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
          <div>
            <HomeHero />
            <BannersSection />
            <SignaturePiecesSection />
            <StoryTeaserSection />
            <CategoriesShowcase />
            <CustomDesignTeaser />
            <CollaborationsSection />
            <ProjectsAndInstagramSection />
          </div>
        )}

        {activeView === 'shop' && <ShopCatalog />}

        {activeView === 'product' && <ProductDetailView />}

        {activeView === 'custom-design' && <CustomDesignView />}

        {activeView === 'b2b' && <B2BView />}

        {activeView === 'our-story' && <OurStoryView />}

        {activeView === 'events' && <EventsView />}

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

      {/* Floating Tocco House WhatsApp Concierge (visible everywhere except Admin) */}
      {activeView !== 'admin' && (
        <aside
          aria-label="Tocco House Concierge"
          className="fixed bottom-6 right-6 z-40"
        >
          <a
            id="floating-whatsapp-concierge"
            href={whatsappConciergeUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Tocco House Concierge on WhatsApp"
            className="group flex items-center justify-center p-3 rounded-full bg-[#1C1A19] text-white shadow-xl hover:bg-[#332F2D] active:scale-95 transition-all border border-white/10"
            title="Chat with Tocco House Concierge"
          >
            <MessageCircle className="w-5 h-5 text-[#25D366]" aria-hidden="true" />
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
