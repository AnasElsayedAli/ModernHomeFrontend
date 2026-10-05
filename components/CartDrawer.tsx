'use client';

import React from 'react';
import { useToccoStore } from '@/lib/store';
import { X, Plus, Minus, Trash2, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';
import Image from '@/components/SafeImage';
import { useAccessibleDialog } from '@/hooks/use-accessible-dialog';
import { normalizeApiError } from '@/lib/api/errors';

export default function CartDrawer() {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    cartDepositAmount,
    cartRemainingAmount,
    cartDiscountTotal,
    cartFreeShipping,
    isGuestCartSyncing,
    cartSyncError,
    syncGuestCart,
    navigateTo,
    settings,
    products,
  } = useToccoStore();
  const [cartActionError, setCartActionError] = React.useState<string | null>(null);
  const [isCartActionPending, setIsCartActionPending] = React.useState(false);
  const primaryImagesByProductId = new Map(
    products.map((product) => [product.id, product.images[0]] as const)
  );
  const closeDrawer = () => setIsCartDrawerOpen(false);
  const { dialogRef, handleDialogKeyDown } = useAccessibleDialog(isCartDrawerOpen, closeDrawer);

  if (!isCartDrawerOpen) return null;

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigateTo('checkout');
  };

  const runCartAction = async (action: () => Promise<void>) => {
    if (isCartActionPending || isGuestCartSyncing) return;
    setCartActionError(null);
    setIsCartActionPending(true);
    try {
      await action();
    } catch (error) {
      const normalized = normalizeApiError(error);
      const context = normalized.status === 400 || normalized.status === 409
        ? 'That change was not accepted, so your bag was left unchanged.'
        : 'We could not confirm this bag change. Reopen the bag before retrying.';
      setCartActionError(`${context} ${normalized.message}`);
    } finally {
      setIsCartActionPending(false);
    }
  };

  return (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          tabIndex={-1}
          onKeyDown={handleDialogKeyDown}
          dir="rtl"
          className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200"
        >
          <div
            className="fixed inset-0 bg-[#122A3D]/55 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartDrawerOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full">
            <div className="flex h-full w-screen max-w-full flex-col bg-[#F7F3EC] shadow-2xl animate-in slide-in-from-right duration-300 sm:max-w-[520px]">
                <div className="flex items-end justify-between border-b border-[#DED5C9] px-5 py-5 sm:px-7 sm:py-6">
                  <div>
                    <p className="text-[10px] font-semibold text-[#A36046]">اختياراتك من مودرن هوم</p>
                    <h2 id="cart-drawer-title" className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#17324A] sm:text-3xl">
                      الحقيبة <span className="me-1 font-[family-name:var(--font-brand)] text-sm font-normal text-[#81786C]">({cart.reduce((count, item) => count + item.quantity, 0)})</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="grid h-10 w-10 place-items-center text-[#6D6A64] transition-colors hover:bg-[#E8E3D9] hover:text-[#17324A]"
                  aria-label="إغلاق السلة"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                {isGuestCartSyncing && (
                  <p role="status" className="border border-[#D9CEBF] bg-white px-3 py-2 text-xs text-[#42515C]">
                    جارٍ نقل المنتجات المحفوظة إلى حسابك...
                  </p>
                )}
                {cartSyncError && (
                  <div role="alert" className="border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                    <p>{cartSyncError}</p>
                    <button type="button" onClick={() => void syncGuestCart()} disabled={isGuestCartSyncing} className="mt-2 font-semibold underline underline-offset-2 disabled:opacity-50">
                      إعادة المحاولة
                    </button>
                  </div>
                )}
                {cartActionError && (
                  <p role="alert" className="border border-rose-300 bg-rose-50 px-3 py-2.5 text-xs text-rose-900">{cartActionError}</p>
                )}
                {isCartActionPending && <p role="status" className="text-xs text-[#6D6A64]">جارٍ تحديث السلة...</p>}

                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-start justify-center py-12 text-right">
                    <span className="font-[family-name:var(--font-brand)] text-6xl font-light text-[#C8BBA9]">00</span>
                    <div className="mt-3 space-y-2">
                      <p className="font-[family-name:var(--font-display)] text-2xl text-[#17324A]">لم تختر قطعتك بعد</p>
                      <p className="max-w-[260px] text-sm leading-7 text-[#6D6A64]">تصفّح المجموعة، واحفظ القطع التي تناسب مساحتك هنا.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCartDrawerOpen(false);
                        navigateTo('shop');
                      }}
                      className="mt-6 inline-flex min-h-11 items-center gap-3 bg-[#17324A] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#24445E]"
                    >
                      تصفّح المجموعة <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {cart.map((item) => {
                      const itemSubtotal = item.subtotal ?? item.unitPrice * item.quantity;
                      const originalSubtotal = item.originalSubtotal ?? item.unitPrice * item.quantity;
                      return (
                        <article key={item.id} className="space-y-3 border-b border-[#DED5C9] pb-5">
                          <div className="flex gap-3">
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-[#E6DED2] sm:h-28 sm:w-28">
                              <Image
                                src={primaryImagesByProductId.has(item.productId) ? primaryImagesByProductId.get(item.productId) : item.productImage}
                                alt={item.productName}
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="truncate text-sm font-semibold text-[#17324A]">{item.productName}</h3>
                                  <button
                                    type="button"
                                    onClick={() => void runCartAction(() => removeFromCart(item.id))}
                                    disabled={isGuestCartSyncing || isCartActionPending}
                                    className="grid h-8 w-8 shrink-0 place-items-center text-[#817D75] transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:cursor-wait disabled:opacity-50"
                                    title="إزالة المنتج"
                                    aria-label={`إزالة ${item.productName} من السلة`}
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                  </button>
                                </div>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#6D6A64]">
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: item.selectedColor.hex }} />
                                    {item.selectedColor.name}
                                  </span>
                                  <span>·</span>
                                  <span>{item.selectedFinish === 'MATTE' ? 'مطفأ' : 'لامع'}</span>
                                  {item.selectedSize && <><span>·</span><span>{item.selectedSize.name}</span></>}
                                </div>
                              </div>

                              <div className="mt-2 flex items-center justify-between gap-3">
                                <div className="flex items-center border border-[#D9CEBF] bg-white px-1">
                                  <button
                                    type="button"
                                    onClick={() => void runCartAction(() => updateCartQuantity(item.id, item.quantity - 1))}
                                    disabled={isGuestCartSyncing || isCartActionPending}
                                    className="grid h-8 w-8 place-items-center text-[#42515C] hover:text-[#17324A] disabled:cursor-wait disabled:opacity-50"
                                    aria-label="تقليل الكمية"
                                  >
                                    <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                  <span className="min-w-7 text-center text-xs font-semibold text-[#17324A]">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => void runCartAction(() => updateCartQuantity(item.id, item.quantity + 1))}
                                    disabled={isGuestCartSyncing || isCartActionPending}
                                    className="grid h-8 w-8 place-items-center text-[#42515C] hover:text-[#17324A] disabled:cursor-wait disabled:opacity-50"
                                    aria-label="زيادة الكمية"
                                  >
                                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                </div>
                                <p className="text-sm font-semibold text-[#17324A]">
                                  {itemSubtotal > 0 ? `${new Intl.NumberFormat('ar-EG').format(itemSubtotal)} جنيه` : 'السعر عند الطلب'}
                                  {item.discountAmount ? <span className="block text-[10px] font-normal text-[#817D75] line-through">{new Intl.NumberFormat('ar-EG').format(originalSubtotal)} جنيه</span> : null}
                                </p>
                              </div>
                            </div>
                          </div>
                          {item.offerName && <span className="inline-block border-r-2 border-[#A36046] bg-[#F0E7DA] px-2 py-1 text-xs text-[#785132]">{item.offerName}</span>}
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="space-y-4 border-t border-[#DED5C9] bg-[#FBF9F4] px-5 py-5 sm:px-7">
                  <div className="flex items-start gap-2 border-r-2 border-[#C8A77D] bg-[#EEE7DC] px-3 py-2.5 text-xs leading-6 text-[#42515C]">
                    <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-[#17324A]" aria-hidden="true" />
                    <p><span className="font-semibold text-[#17324A]">مقدم {settings.depositPercentage}%.</span> يُستكمل باقي المبلغ عند التسليم.</p>
                  </div>

                  <div className="space-y-2 text-sm text-[#53616A]">
                    {cartDiscountTotal > 0 && (
                      <div className="flex justify-between text-emerald-700">
                        <span>قيمة الخصم</span>
                        <span className="font-medium">−{new Intl.NumberFormat('ar-EG').format(cartDiscountTotal)} جنيه</span>
                      </div>
                    )}
                    {cartFreeShipping && <div className="flex justify-between text-emerald-700"><span>الشحن</span><span className="font-medium">مجاني</span></div>}
                    <div className="flex justify-between">
                      <span>إجمالي الطلب</span>
                      <span className="font-medium text-[#17324A]">{new Intl.NumberFormat('ar-EG').format(cartSubtotal)} جنيه</span>
                    </div>
                    <div className="flex justify-between border-t border-[#E6DED2] pt-2 font-semibold text-[#17324A]">
                      <span>المقدم المستحق الآن</span>
                      <span>{new Intl.NumberFormat('ar-EG').format(cartDepositAmount)} جنيه</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6D6A64]">
                      <span>المتبقي عند التسليم</span>
                      <span>{new Intl.NumberFormat('ar-EG').format(cartRemainingAmount)} جنيه</span>
                    </div>
                  </div>

                  <button
                    id="cart-proceed-checkout-btn"
                    type="button"
                    onClick={handleCheckout}
                    disabled={isGuestCartSyncing || isCartActionPending}
                    className="flex min-h-12 w-full items-center justify-center gap-2 bg-[#17324A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#24445E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>متابعة الطلب</span>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
}
