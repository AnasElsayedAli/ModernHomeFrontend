'use client';

import React, { useState, useEffect } from 'react';
import { useToccoStore } from '@/lib/store';
import { useAuth } from '@/lib/context/AuthContext';
import { PaymentMethod } from '@/types';
import { orderService } from '@/lib/api/services/orderService';
import { cartService } from '@/lib/api/services/cartService';
import { normalizeApiError } from '@/lib/api/errors';
import { EGYPTIAN_PHONE_ERROR, normalizeEgyptianPhone } from '@/lib/utils';
import type { BackendOrder } from '@/types/order';
import Image from '@/components/SafeImage';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  CreditCard,
  MessageCircle,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';

export default function CheckoutView() {
  const {
    cart,
    cartSubtotal,
    cartDepositAmount,
    cartRemainingAmount,
    clearCartAfterOrder,
    syncGuestCart,
    isGuestCartSyncing,
    setLastCreatedOrder,
    settings,
    navigateTo,
    user: legacyUser,
    products,
  } = useToccoStore();
  const primaryImagesByProductId = new Map(
    products.map((product) => [product.id, product.images[0]] as const)
  );

  const { user: authUser, addresses: authAddresses, createAddress, isLoading: isAuthLoading } = useAuth();

  const mobileWalletNumber =
    settings.paymentMethods.mobileWallet.number || settings.paymentMethods.vodafoneCash.number;

  const defaultAddr = authAddresses.find((a) => a.is_default) || authAddresses[0];

  const [userSelectedAddressId, setUserSelectedAddressId] = useState<number | 'new' | null>(null);
  const selectedAddressId: number | 'new' =
    userSelectedAddressId !== null
      ? userSelectedAddressId
      : defaultAddr
      ? defaultAddr.id
      : 'new';

  const setSelectedAddressId = (id: number | 'new') => setUserSelectedAddressId(id);

  // Address fields for new address or fallback (mirrors the backend Address model exactly)
  const [addressTitle, setAddressTitle] = useState('عنوان التوصيل');
  const [city, setCity] = useState(
    () => defaultAddr?.city || legacyUser?.savedAddresses?.[0]?.city || ''
  );
  const [street, setStreet] = useState(
    () => defaultAddr?.street || legacyUser?.savedAddresses?.[0]?.street || ''
  );
  const [buildingNumber, setBuildingNumber] = useState(
    () => defaultAddr?.building_number || '1'
  );
  const [apartmentNumber, setApartmentNumber] = useState(
    () => defaultAddr?.apartment_number || '1'
  );
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('instapay');

  // Submission & API state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiFieldErrors, setApiFieldErrors] = useState<Record<string, string[]>>({});

  // Clipboard feedback
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (cart.length === 0) {
    return (
      <div dir="rtl" className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 pt-32 pb-24 text-center">
        <p className="text-lg text-[#17324A]">السلة فارغة</p>
        <button
          onClick={() => navigateTo('shop')}
          className="bg-[#17324A] px-6 py-2.5 text-sm font-medium text-white"
        >
          تصفح المنتجات
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setApiFieldErrors({});

    if (isAuthLoading) return;

    const normalizedGuestPhone = authUser ? null : normalizeEgyptianPhone(guestPhone);
    if (!authUser && !guestName.trim()) {
      setApiError('أدخل اسم العميل لإتمام الطلب.');
      return;
    }
    if (!authUser && !normalizedGuestPhone) {
      setApiError(EGYPTIAN_PHONE_ERROR);
      return;
    }
    if (!authUser && (!city.trim() || !street.trim())) {
      setApiError('أدخل المدينة والشارع لإتمام الطلب.');
      return;
    }

    setIsSubmitting(true);
    try {
      let createdOrder: BackendOrder;

      if (authUser) {
        const guestCartSynced = await syncGuestCart();
        if (!guestCartSynced) {
          setApiError('تعذر نقل بعض المنتجات إلى حسابك. أعد المحاولة قبل تأكيد الطلب.');
          return;
        }

        const backendCart = await cartService.getCart();
        if (!Array.isArray(backendCart.items) || backendCart.items.length === 0) {
          setApiError('سلة حسابك فارغة. راجع السلة ثم حاول مرة أخرى.');
          return;
        }

        let targetAddressId: number;
        if (selectedAddressId === 'new' || authAddresses.length === 0) {
          const newAddr = await createAddress({
            title: addressTitle.trim() || 'عنوان التوصيل',
            country: 'Egypt',
            city: city.trim(),
            street: street.trim(),
            building_number: buildingNumber.trim() || '1',
            apartment_number: apartmentNumber.trim() || '1',
            is_default: authAddresses.length === 0,
          });
          targetAddressId = newAddr.id;
        } else {
          targetAddressId = Number(selectedAddressId);
        }

        createdOrder = await orderService.createOrder({
          address_id: targetAddressId,
          customer_notes: orderNote.trim(),
        });
      } else {
        const items = cart.map((item) => {
          const productId = Number(item.productId);
          const colorId = item.selectedColor.id ? Number(item.selectedColor.id) : null;
          if (!Number.isInteger(productId) || productId < 1) {
            throw new Error(`تعذر التحقق من المنتج «${item.productName}». أعد تحميل السلة.`);
          }
          if (colorId !== null && (!Number.isInteger(colorId) || colorId < 1)) {
            throw new Error(`تعذر التحقق من لون «${item.productName}». أعد اختيار اللون.`);
          }
          return {
            product_id: productId,
            selected_color_id: colorId,
            selected_finish: item.selectedFinish || null,
            quantity: item.quantity,
          };
        });

        createdOrder = await orderService.createOrder({
          customer_name: guestName.trim(),
          customer_phone: normalizedGuestPhone!,
          customer_email: guestEmail.trim(),
          shipping_address: {
            title: addressTitle.trim() || 'عنوان التوصيل',
            country: 'Egypt',
            city: city.trim(),
            street: street.trim(),
            building_number: buildingNumber.trim(),
            apartment_number: apartmentNumber.trim(),
          },
          items,
          customer_notes: orderNote.trim(),
        });
      }

      const remainingCartItems = [...cart];
      const orderWithFinishes = {
        ...createdOrder,
        items: createdOrder.items.map((orderItem) => {
          const orderColorHex = orderItem.color_hex_code?.toUpperCase();
          const matchesCartItem = (
            cartItem: typeof cart[number],
            requireQuantityMatch: boolean,
            requireColorMatch: boolean
          ) => {
            const parsedProductId = Number(cartItem.productId);
            const cartProductId = Number.isInteger(parsedProductId)
              ? parsedProductId
              : Number(cartItem.productId.replace(/\D/g, '')) || 1;
            return cartProductId === orderItem.product_id
              && (!requireQuantityMatch || cartItem.quantity === orderItem.quantity)
              && (!requireColorMatch || !orderColorHex || cartItem.selectedColor.hex.toUpperCase() === orderColorHex);
          };
          let cartItemIndex = remainingCartItems.findIndex((item) => matchesCartItem(item, true, true));
          if (cartItemIndex < 0) cartItemIndex = remainingCartItems.findIndex((item) => matchesCartItem(item, true, false));
          if (cartItemIndex < 0) cartItemIndex = remainingCartItems.findIndex((item) => matchesCartItem(item, false, false));
          const [cartItem] = cartItemIndex >= 0 ? remainingCartItems.splice(cartItemIndex, 1) : [];
          return { ...orderItem, selected_finish: cartItem?.selectedFinish ?? null };
        }),
      };

      setLastCreatedOrder({ ...orderWithFinishes, clientPaymentMethod: paymentMethod });
      clearCartAfterOrder();
      navigateTo('confirmation');
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      setApiError(normalized.message);
      setApiFieldErrors(normalized.fieldErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="checkout-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        {/* Navigation back */}
        <div className="flex items-center justify-between border-b border-[#DED5C9] py-4 sm:py-5">
          <button
            onClick={() => navigateTo('shop')}
            className="inline-flex items-center gap-2 text-xs text-[#625E57] hover:text-[#17324A]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>متابعة التسوق</span>
          </button>
          <span className="font-[family-name:var(--font-brand)] text-[10px] text-[#9A9185]">MODERN HOME · ORDER</span>
        </div>

        <div className="grid grid-cols-1 gap-5 border-b border-[#DED5C9] py-7 sm:py-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="space-y-2 lg:col-span-8">
            <p className="text-xs font-semibold text-[#A36046]">خطوة أخيرة · تفاصيل الطلب</p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">لنرتّب وصول قطعتك.</h1>
          </div>
          <p className="max-w-md text-sm leading-7 text-[#625E57] lg:col-span-4">
            راجع عنوان التوصيل وطريقة دفع المقدم ({settings.depositPercentage}%) قبل تأكيد طلبك.
          </p>
        </div>

        {!isAuthLoading && !authUser && (
          <div className="mt-5 flex flex-col gap-4 border-r-2 border-[#A36046] bg-[#EEE7DC] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center bg-[#F7F3EC] text-[#A36046]">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-[#17324A]">
                  أكمل الطلب كضيف
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-[#6D6A64]">
                  أدخل بيانات التواصل وعنوان التوصيل، ولا تحتاج إلى إنشاء حساب.
                </p>
              </div>
            </div>
          </div>
        )}

        {isAuthLoading && (
          <div className="mt-5 flex items-center gap-2 border-y border-[#DED5C9] p-4 text-xs text-[#6D6A64]">
            <Loader2 className="h-4 w-4 animate-spin text-[#643D26]" />
            جارٍ التحقق من حسابك...
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 py-6 sm:py-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: Customer & Address Information (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-10">
            {/* Customer Details */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="border-b border-[#DED5C9] pb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A] sm:text-xl">
                ١. بيانات العميل
              </h3>

              {authUser ? (
                <>
                  {/* Read-only: the order API takes contact details from the signed-in account */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                        الاسم بالكامل
                      </label>
                      <div className="w-full text-xs px-3.5 py-3 rounded-lg bg-[#F5F2EB] border border-[#E8E1D5] text-[#1C1A19]">
                        {`${authUser.first_name} ${authUser.last_name}`.trim()}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                        رقم الهاتف
                      </label>
                      <div className="w-full text-xs px-3.5 py-3 rounded-lg bg-[#F5F2EB] border border-[#E8E1D5] text-[#1C1A19]">
                        {authUser.phone || 'غير مسجل'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                        البريد الإلكتروني
                    </label>
                    <div className="w-full text-xs px-3.5 py-3 rounded-lg bg-[#F5F2EB] border border-[#E8E1D5] text-[#1C1A19]">
                      {authUser.email}
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="guest-customer-name" className="block text-[11px] font-medium text-[#1C1A19] sm:text-xs">
                      الاسم بالكامل *
                    </label>
                    <input
                      id="guest-customer-name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={120}
                      value={guestName}
                      onChange={(event) => setGuestName(event.target.value)}
                      className="w-full rounded-lg border border-[#D8CEBF] bg-white px-3.5 py-3 text-xs text-[#1C1A19] focus:border-[#643D26] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="guest-customer-phone" className="block text-[11px] font-medium text-[#1C1A19] sm:text-xs">
                      رقم الهاتف *
                    </label>
                    <input
                      id="guest-customer-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={guestPhone}
                      onChange={(event) => setGuestPhone(event.target.value)}
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                      className="w-full rounded-lg border border-[#D8CEBF] bg-white px-3.5 py-3 text-left text-xs text-[#1C1A19] focus:border-[#643D26] focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="guest-customer-email" className="block text-[11px] font-medium text-[#1C1A19] sm:text-xs">
                      البريد الإلكتروني (اختياري)
                    </label>
                    <input
                      id="guest-customer-email"
                      type="email"
                      autoComplete="email"
                      value={guestEmail}
                      onChange={(event) => setGuestEmail(event.target.value)}
                      className="w-full rounded-lg border border-[#D8CEBF] bg-white px-3.5 py-3 text-xs text-[#1C1A19] focus:border-[#643D26] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {authUser && (
                <p className="text-[11px] text-[#736B63]">
                  هذه البيانات مسجلة في حسابك. لتحديثها، انتقل إلى{' '}
                  <button
                    type="button"
                    onClick={() => navigateTo('account')}
                    className="underline underline-offset-2 hover:text-[#1C1A19]"
                  >
                    إعدادات الحساب
                  </button>
                  .
                </p>
              )}
            </div>

            {/* Delivery Destination */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="border-b border-[#DED5C9] pb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A] sm:text-xl">
                ٢. عنوان التوصيل
              </h3>

              <>
                  {authUser && authAddresses.length > 0 && (
                    <div className="space-y-2.5">
                      <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                        اختر عنوان التوصيل
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {authAddresses.map((addr) => (
                          <button
                            type="button"
                            role="radio"
                            aria-checked={selectedAddressId === addr.id}
                            aria-label={`${addr.title}, ${addr.street}, ${addr.city}, ${addr.country}`}
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`w-full text-left p-3.5 rounded-xl border cursor-pointer transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#643D26] ${
                              selectedAddressId === addr.id
                                ? 'border-[#643D26] bg-[#F5EFEB] ring-1 ring-[#643D26]/10'
                                : 'border-[#D8CEBF] bg-white hover:border-[#1C1A19]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-[#1C1A19] uppercase">{addr.title}</span>
                              {addr.is_default && (
                                <span className="text-[10px] bg-[#EAE4DC] text-[#643D26] px-1.5 py-0.5 rounded font-semibold">
                                  أساسي
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#736B63] mt-1 line-clamp-1">
                              {addr.street}، مبنى {addr.building_number}
                            </p>
                            <p className="text-xs text-[#8F8880]">{addr.city}, {addr.country}</p>
                          </button>
                        ))}

                        <button
                          type="button"
                          role="radio"
                          aria-checked={selectedAddressId === 'new'}
                          onClick={() => setSelectedAddressId('new')}
                          className={`w-full p-3.5 rounded-xl border border-dashed cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#643D26] ${
                            selectedAddressId === 'new'
                              ? 'border-[#643D26] bg-[#FAF8F5] text-[#643D26]'
                              : 'border-[#D8CEBF] text-[#736B63] hover:border-[#1C1A19] hover:text-[#1C1A19]'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                          <span>إضافة عنوان جديد</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {(!authUser || selectedAddressId === 'new' || authAddresses.length === 0) && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                          اسم العنوان *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressTitle}
                          onChange={(e) => setAddressTitle(e.target.value)}
                          placeholder="مثال: المنزل، المكتب"
                          className="w-full text-xs px-3.5 py-3 rounded-lg bg-white border border-[#D8CEBF] text-[#1C1A19] focus:outline-none focus:border-[#643D26]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                            المدينة أو المنطقة *
                          </label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="مثال: القاهرة الجديدة"
                            className="w-full text-xs px-3.5 py-3 rounded-lg bg-white border border-[#D8CEBF] text-[#1C1A19] focus:outline-none focus:border-[#643D26]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                          الشارع أو اسم القرية *
                        </label>
                        <input
                          type="text"
                          required
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="اسم الشارع أو المنطقة"
                          className="w-full text-xs px-3.5 py-3 rounded-lg bg-white border border-[#D8CEBF] text-[#1C1A19] focus:outline-none focus:border-[#643D26]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                            رقم المبنى أو الفيلا *
                          </label>
                          <input
                            type="text"
                            required
                            value={buildingNumber}
                            onChange={(e) => setBuildingNumber(e.target.value)}
                            placeholder="مثال: ٤٢"
                            className="w-full text-xs px-3.5 py-3 rounded-lg bg-white border border-[#D8CEBF] text-[#1C1A19] focus:outline-none focus:border-[#643D26]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                            رقم الشقة أو الوحدة *
                          </label>
                          <input
                            type="text"
                            required
                            value={apartmentNumber}
                            onChange={(e) => setApartmentNumber(e.target.value)}
                            placeholder="مثال: ١"
                            className="w-full text-xs px-3.5 py-3 rounded-lg bg-white border border-[#D8CEBF] text-[#1C1A19] focus:outline-none focus:border-[#643D26]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-[11px] sm:text-xs uppercase tracking-wider font-medium text-[#1C1A19]">
                      ملاحظات التوصيل (اختياري)
                    </label>
                    <textarea
                      rows={2}
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      placeholder="أضف أي تفاصيل تساعدنا في الوصول إليك."
                      className="w-full text-xs p-3 rounded-lg bg-white border border-[#D8CEBF] text-[#1C1A19] focus:outline-none"
                    />
                  </div>
              </>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold text-[#1C1A19]">
                ٣. اختر طريقة دفع المقدم ({settings.depositPercentage}%)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('instapay')}
                  className={`p-3.5 sm:p-4 rounded-xl border text-left flex flex-row sm:flex-col items-center sm:items-start justify-between transition-all ${
                    paymentMethod === 'instapay'
                      ? 'border-[#643D26] bg-[#F5EFEB] shadow-xs'
                      : 'border-[#D8CEBF] bg-white hover:border-[#1C1A19]'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:justify-between sm:w-full">
                    <Smartphone className="w-5 h-5 text-[#643D26]" />
                    <div className="sm:hidden">
                      <span className="block text-xs font-semibold uppercase text-[#1C1A19]">
                        InstaPay
                      </span>
                        <span className="text-[10px] text-[#6D6A64]">تحويل فوري عبر إنستا باي</span>
                    </div>
                  </div>
                  <div className="hidden sm:block mt-3">
                    <span className="block text-xs font-semibold uppercase text-[#1C1A19]">
                      InstaPay
                    </span>
                    <span className="text-[10px] text-[#6D6A64]">تحويل فوري عبر إنستا باي</span>
                  </div>
                  {paymentMethod === 'instapay' && (
                    <Check className="w-4 h-4 text-[#643D26] shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('vodafone_cash')}
                  className={`p-3.5 sm:p-4 rounded-xl border text-left flex flex-row sm:flex-col items-center sm:items-start justify-between transition-all ${
                    paymentMethod === 'vodafone_cash'
                      ? 'border-[#643D26] bg-[#F5EFEB] shadow-xs'
                      : 'border-[#D8CEBF] bg-white hover:border-[#1C1A19]'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:justify-between sm:w-full">
                    <CreditCard className="w-5 h-5 text-[#643D26]" />
                    <div className="sm:hidden">
                      <span className="block text-xs font-semibold uppercase text-[#1C1A19]">
                        Mobile Wallet
                      </span>
                        <span className="text-[10px] text-[#6D6A64]">فودافون، إي آند، وي، أورنج</span>
                    </div>
                  </div>
                  <div className="hidden sm:block mt-3">
                    <span className="block text-xs font-semibold uppercase text-[#1C1A19]">
                      Mobile Wallet
                    </span>
                    <span className="text-[10px] text-[#6D6A64]">فودافون، إي آند، وي، أورنج</span>
                  </div>
                  {paymentMethod === 'vodafone_cash' && (
                    <Check className="w-4 h-4 text-[#643D26] shrink-0" />
                  )}
                </button>

              </div>

              {/* Dynamic Account Details Box */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#F5F2EB] border border-[#E8E1D5] space-y-3">
                {paymentMethod === 'instapay' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider font-semibold text-[#1C1A19]">
                        InstaPay
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-[#D8CEBF] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#736B63] block">
                          عنوان إنستا باي:
                        </span>
                        <span className="text-xs font-mono font-bold text-[#1C1A19]">
                          {settings.paymentMethods.instapay.address}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(settings.paymentMethods.instapay.address, 'instapay')
                        }
                        className="px-3 py-1.5 rounded-md bg-[#FAF8F5] border border-[#D8CEBF] text-[11px] uppercase tracking-wider font-medium text-[#1C1A19] hover:bg-[#EFEBE3] flex items-center gap-1.5"
                      >
                        {copiedField === 'instapay' ? (
                          <>
                            <Check className="w-3 h-3 text-[#25D366]" />
                            <span>تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                )}

                {paymentMethod === 'vodafone_cash' && (
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#1C1A19] block">
                      Mobile Wallet
                    </span>

                    <div className="p-3 bg-white rounded-lg border border-[#D8CEBF] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#6D6A64] block">
                          الرقم:
                        </span>
                        <span className="text-xs font-mono font-bold text-[#1C1A19]">
                          {mobileWalletNumber}
                        </span>
                      </div>
                      {mobileWalletNumber && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(mobileWalletNumber, 'wallet')}
                          className="px-3 py-1.5 rounded-md bg-[#FAF8F5] border border-[#D8CEBF] text-[11px] uppercase tracking-wider font-medium text-[#1C1A19] hover:bg-[#EFEBE3] flex items-center gap-1.5"
                        >
                          {copiedField === 'wallet' ? (
                            <>
                              <Check className="w-3 h-3 text-[#25D366]" />
                              <span>تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>نسخ</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Right: Order Summary & Placement (5 cols) */}
          <div className="space-y-4 sm:space-y-6 lg:col-span-5">
            <div className="space-y-4 border-t-2 border-[#17324A] bg-[#FBF9F4] p-4 sm:space-y-6 sm:p-6">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A] sm:text-xl">
                ملخص الطلب ({cart.length} قطع)
              </h3>

              {/* Items List */}
              <div className="max-h-64 space-y-3 overflow-y-auto pe-1 sm:space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-2.5 border-b border-[#DED5C9] pb-3 text-xs sm:gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-[#E6DED2] sm:h-16 sm:w-16">
                      <Image
                        src={
                          primaryImagesByProductId.has(item.productId)
                            ? primaryImagesByProductId.get(item.productId)
                            : item.productImage
                        }
                        alt={item.productName}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[#1C1A19] truncate">{item.productName}</h4>
                      <p className="text-[10px] sm:text-[11px] text-[#736B63]">
                        {item.selectedFinish === 'MATTE' ? 'مطفأ' : 'لامع'} · {item.selectedColor.name} · الكمية: {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold text-xs text-[#1C1A19]">
                      {item.discountAmount ? (
                        <span className="flex flex-col items-end">
                          <span className="text-[10px] text-[#8F8880] line-through font-normal">
                            {(item.originalSubtotal ?? item.unitPrice * item.quantity).toLocaleString()} EGP
                          </span>
                          <span>{(item.subtotal ?? item.unitPrice * item.quantity).toLocaleString()} EGP</span>
                        </span>
                      ) : (
                        `${(item.subtotal ?? item.unitPrice * item.quantity).toLocaleString()} EGP`
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="space-y-1.5 border-t border-[#DED5C9] pt-3 text-xs text-[#625E57] sm:space-y-2">
                <div className="flex justify-between">
                  <span>إجمالي المنتجات</span>
                  <span className="font-medium text-[#17324A]">{cartSubtotal.toLocaleString()} جنيه</span>
                </div>
                <div className="flex justify-between pt-1 text-xs font-semibold text-[#A36046] sm:text-sm">
                  <span>المقدم المستحق ({settings.depositPercentage}%)</span>
                  <span>{cartDepositAmount.toLocaleString()} جنيه</span>
                </div>
                <div className="flex justify-between text-[10px] sm:text-[11px] text-[#736B63]">
                  <span>المتبقي عند التسليم</span>
                  <span>{cartRemainingAmount.toLocaleString()} جنيه</span>
                </div>
              </div>

              {/* Deposit Guarantee Note */}
              <div className="flex items-start gap-2 border-r-2 border-[#C8A77D] bg-[#EEE7DC] p-3 sm:p-3.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#17324A]" />
                <p className="text-[10px] sm:text-[11px] text-[#524B45] leading-relaxed">
                  بعد تأكيد الطلب سيظهر رقم مرجعي. يمكنك إرسال إثبات دفع المقدم عبر واتساب في الخطوة التالية.
                </p>
              </div>

              {/* API Error Display */}
              {apiError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-red-800">{apiError}</p>
                    {Object.keys(apiFieldErrors).length > 0 && (
                      <ul className="list-disc list-inside text-[11px] text-red-700 space-y-0.5">
                        {Object.entries(apiFieldErrors).map(([field, msgs]) => (
                          <li key={field}>
                            <span className="capitalize">{field.replace('_', ' ')}</span>: {msgs.join(', ')}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Place Order CTA */}
              <button
                id="place-order-submit-btn"
                type="submit"
                disabled={isSubmitting || isAuthLoading || isGuestCartSyncing}
                className="flex min-h-12 w-full items-center justify-center gap-2 bg-[#17324A] px-4 py-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#24445E] disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جارٍ تأكيد الطلب...</span>
                  </>
                ) : (
                  <>
                    <span>تأكيد الطلب ومتابعة المقدم</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
