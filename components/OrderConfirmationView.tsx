'use client';

import React, { useState } from 'react';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  MessageCircle,
  ArrowRight,
  Copy,
  Check,
  Package,
} from 'lucide-react';
import Image from '@/components/SafeImage';

export default function OrderConfirmationView() {
  const { lastCreatedOrder, navigateTo, settings, products } = useToccoStore();

  const [whatsappHandoffStarted, setWhatsappHandoffStarted] = useState(false);
  const [copiedOrder, setCopiedOrder] = useState(false);

  if (!lastCreatedOrder) {
    return (
      <div className="pt-32 pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-lg text-[#17324A]">لا يوجد طلب حديث</p>
        <button
          onClick={() => navigateTo('shop')}
          className="bg-[#17324A] px-6 py-2.5 text-sm text-white"
        >
          العودة إلى المنتجات
        </button>
      </div>
    );
  }

  const rawOrder = lastCreatedOrder;

  // Adapt between BackendOrder and legacy Order
  const isBackend = 'order_number' in rawOrder;
  const orderNumber = isBackend ? rawOrder.order_number : rawOrder.orderNumber;
  const totalAmount = isBackend ? Number(rawOrder.total_price) : rawOrder.totalAmount;
  const depositAmount = isBackend ? Number(rawOrder.deposit_amount) : rawOrder.depositAmount;
  const depositPercentage = isBackend ? Number(rawOrder.deposit_percentage) : rawOrder.depositPercentage;
  const paymentMethod = isBackend ? rawOrder.clientPaymentMethod || 'instapay' : rawOrder.paymentMethod;
  const paymentStatus = isBackend
    ? rawOrder.status === 'CONFIRMED'
      ? 'payment_verified'
      : 'pending_deposit'
    : rawOrder.paymentStatus;
  const customerName = isBackend
    ? rawOrder.shipping_address?.title || 'عميلنا العزيز'
    : rawOrder.customer.fullName;
  const customerStreet = isBackend
    ? `${rawOrder.shipping_address?.building_number ? `مبنى ${rawOrder.shipping_address.building_number}، ` : ''}${rawOrder.shipping_address?.street || ''}`
    : rawOrder.customer.street;
  const customerCity = isBackend ? rawOrder.shipping_address?.city || 'القاهرة' : rawOrder.customer.city;
  const customerRegion = isBackend ? rawOrder.shipping_address?.country || 'مصر' : rawOrder.customer.governorate;
  const items = isBackend
    ? rawOrder.items.map((it) => ({
        id: it.id,
        productName: it.product_name,
        productImage: products.find((product) => product.id === String(it.product_id))?.images[0] || '',
        selectedFinish: it.selected_finish || 'غير محدد',
        selectedColor: it.color_name
          ? { id: it.color_name, name: it.color_name, hex: it.color_hex_code || '#EBE3D5' }
          : undefined,
        quantity: it.quantity,
        unitPrice: Number(it.product_price),
        subtotal: Number(it.subtotal),
      }))
    : rawOrder.items;
  const paymentMethodLabel = paymentMethod === 'instapay'
    ? 'إنستا باي'
    : paymentMethod === 'vodafone_cash'
      ? 'المحفظة الإلكترونية'
      : paymentMethod === 'bank_transfer'
        ? 'تحويل بنكي'
        : paymentMethod;

  const handleProofSubmit = () => {
    setWhatsappHandoffStarted(true);
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedOrder(true);
    setTimeout(() => setCopiedOrder(false), 2000);
  };

  // WhatsApp prefilled proof-submission message
  const proofWhatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    `مرحبًا مودرن هوم، أتممت دفع المقدم بنسبة ${depositPercentage}% للطلب رقم ${orderNumber}. أرفق إيصال التحويل للمراجعة.`
  )}`;


  return (
    <div id="order-confirmation-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-[1100px] space-y-6 px-5 sm:space-y-10 sm:px-10">
        {/* Celebratory Header */}
        <div className="grid grid-cols-1 gap-6 border-b border-[#DED5C9] py-7 sm:py-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-3 sm:space-y-4 lg:col-span-7">
          <div className="grid h-12 w-12 place-items-center bg-[#17324A] text-[#E9CBA6] sm:h-14 sm:w-14">
            <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <span className="block text-xs font-semibold text-[#A36046]">
            تم استلام طلبك
          </span>

          <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">
            شكرًا لك، {customerName}
          </h1>

          <p className="max-w-xl text-sm leading-7 text-[#625E57] sm:text-base">
            تم تسجيل طلبك. يمكنك تحويل المقدم ({depositPercentage}%) باستخدام التفاصيل التالية، ثم إرسال الإيصال عبر واتساب.
          </p>
          </div>

          <div className="flex items-center justify-between gap-4 border-y border-[#C9C1B5] py-4 lg:col-span-5 lg:justify-end lg:border-y-0 lg:py-0">
            <div>
              <span className="block text-xs text-[#81786C]">الرقم المرجعي</span>
              <span dir="ltr" className="mt-1 block font-[family-name:var(--font-brand)] text-lg font-semibold text-[#17324A] sm:text-xl">{orderNumber}</span>
            </div>
            <button
              type="button"
              onClick={copyOrderNumber}
              className="grid h-10 w-10 place-items-center text-[#17324A] hover:bg-[#EEE7DC] hover:text-[#A36046]"
              aria-label="نسخ رقم الطلب"
            >
              {copiedOrder ? <Check className="h-4 w-4 text-[#3A8D62]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Deposit Action Card */}
        <div className="space-y-4 border-b border-[#DED5C9] py-6 sm:space-y-6 sm:py-9">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-[#EAE4DC] gap-3 sm:gap-4">
            <div>
              <span className="text-[11px] sm:text-xs uppercase tracking-wider font-semibold text-[#643D26] block">
                المقدم المستحق ({depositPercentage}%):
              </span>
              <span className="text-2xl sm:text-3xl font-normal text-[#1C1A19]">
                {depositAmount.toLocaleString()} EGP
              </span>
            </div>

            <div className="px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#FAF0E6] text-[#B85D38] text-[11px] sm:text-xs uppercase tracking-wider font-semibold self-start sm:self-auto">
              {paymentStatus === 'payment_verified'
                ? 'تم تأكيد الدفع'
                : paymentStatus === 'proof_submitted'
                ? 'تم استلام الإثبات · جارٍ المراجعة'
                : `بانتظار المقدم (${depositPercentage}%)`}
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="space-y-2.5 sm:space-y-3 text-xs text-[#524B45]">
            <h4 className="uppercase tracking-wider font-semibold text-[#1C1A19]">
              تفاصيل التحويل · {paymentMethodLabel}
            </h4>

            {paymentMethod === 'instapay' && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF8F5] border border-[#D8CEBF] flex justify-between items-center">
                <div>
                  <p className="text-[11px] text-[#6D6A64]">عنوان إنستا باي:</p>
                  <p className="font-mono text-xs sm:text-sm font-bold text-[#1C1A19]">
                    {settings.paymentMethods.instapay.address}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#17324A]">تحويل فوري</span>
              </div>
            )}

            {paymentMethod === 'vodafone_cash' && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF8F5] border border-[#D8CEBF] flex justify-between items-center">
                <div>
                  <p className="text-[11px] text-[#6D6A64]">رقم المحفظة:</p>
                  <p className="font-mono text-xs sm:text-sm font-bold text-[#1C1A19]">
                    {settings.paymentMethods.mobileWallet?.number || settings.contact.phone}
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF8F5] border border-[#D8CEBF] space-y-1 font-mono text-[11px] sm:text-xs">
                <p>البنك: {settings.paymentMethods.bankTransfer.bankName}</p>
                <p>اسم الحساب: {settings.paymentMethods.bankTransfer.accountHolder || settings.paymentMethods.bankTransfer.accountName}</p>
                <p className="break-all">رقم الحساب الدولي IBAN: {settings.paymentMethods.bankTransfer.iban}</p>
              </div>
            )}
          </div>

          {/* Proof Submission Form or Confirmation */}
          {whatsappHandoffStarted || paymentStatus !== 'pending_deposit' ? (
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#F5F9F5] border border-[#D1E7DD] flex items-center gap-3 text-xs text-[#0F5132]">
              <CheckCircle2 className="w-5 h-5 text-[#25D366] shrink-0" />
              <div>
                <p className="font-semibold">تم فتح واتساب</p>
                <p className="text-[11px] text-[#146C43]">
                  أرفق إيصال الدفع وأرسله. يظل الطلب قيد المراجعة حتى يؤكد فريقنا استلام المقدم.
                </p>
              </div>
            </div>
          ) : (
            <div className="pt-1">
              <a
                href={proofWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleProofSubmit}
                className="w-full py-3.5 sm:py-4 rounded-lg bg-[#1C1A19] text-white text-[11px] sm:text-xs uppercase tracking-wider font-medium hover:bg-[#332F2D] flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>إرسال إثبات الدفع عبر واتساب</span>
              </a>
            </div>
          )}
        </div>

        {/* Order Details & Summary Card */}
        <div className="space-y-4 border-t-2 border-[#17324A] py-5 sm:space-y-6 sm:py-8">
          <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#17324A] sm:text-2xl">
            منتجات الطلب
          </h3>

          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-[#DED5C9] pb-3 sm:gap-4 sm:pb-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-[#E6DED2] sm:h-20 sm:w-20">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-[#1C1A19]">{item.productName}</h4>
                  <p className="mt-0.5 text-[11px] text-[#6D6A64] sm:text-xs">
                    التشطيب: {item.selectedFinish === 'MATTE' ? 'مطفأ' : item.selectedFinish === 'GLOSSY' ? 'لامع' : item.selectedFinish}{item.selectedColor ? ` · اللون: ${item.selectedColor.name}` : ''} · الكمية: {item.quantity}
                  </p>
                </div>
                <div className="text-sm font-semibold text-[#1C1A19]">
                  {(item.subtotal ?? item.unitPrice * item.quantity).toLocaleString()} EGP
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Destination summary */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#524B45]">
            <div>
              <span className="mb-1 block font-semibold text-[#17324A]">
                عنوان التوصيل:
              </span>
              <p>{customerStreet}</p>
              <p>{customerCity}, {customerRegion}</p>
              {!isBackend && (rawOrder as any).customer.buildingDetails && (
                <p className="text-[#736B63]">{(rawOrder as any).customer.buildingDetails}</p>
              )}
            </div>
            <div>
              <span className="mb-1 block font-semibold text-[#17324A]">
                صاحب الطلب:
              </span>
              <p className="font-medium text-[#1C1A19]">{customerName}</p>
              {!isBackend && (
                <>
                  <p className="font-mono">{(rawOrder as any).customer.phone}</p>
                  <p className="text-[#736B63]">{(rawOrder as any).customer.email}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => navigateTo('account')}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#D8CEBF] text-xs uppercase tracking-wider text-[#1C1A19] hover:bg-[#1C1A19] hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>متابعة الطلبات</span>
          </button>

          <button
            onClick={() => navigateTo('shop')}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FAF8F5] border border-[#D8CEBF] text-xs uppercase tracking-wider text-[#1C1A19] hover:bg-white transition-all"
          >
            متابعة التسوق
          </button>
        </div>
      </div>
    </div>
  );
}
