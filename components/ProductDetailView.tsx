'use client';

import React, { useState, useMemo } from 'react';
import { useToccoStore } from '@/lib/store';
import { normalizeApiError } from '@/lib/api/errors';
import { colorService } from '@/lib/api/services/colorService';
import { toWhatsAppNumber } from '@/lib/utils';
import { ProductFinish, ProductColor, ProductSize } from '@/types';
import { BackendColor } from '@/types/product';
import Image from '@/components/SafeImage';
import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  Truck,
  Check,
  Layers,
  Ruler,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { useModernHomeContent } from './modern-home/useModernHomeContent';

export default function ProductDetailView() {
  const {
    selectedProductId,
    getProductById,
    navigateTo,
    addToCart,
    categories: storeCategories,
    subcategories,
    settings,
    isCatalogLoading,
    storeDataErrors,
    reloadStoreData,
  } = useToccoStore();
  const { products, categories, usingPreviewCatalog } = useModernHomeContent();

  const product = useMemo(() => {
    if (!selectedProductId) return null;
    return usingPreviewCatalog
      ? products.find((item) => item.id === selectedProductId) || null
      : getProductById(selectedProductId) || null;
  }, [selectedProductId, getProductById, products, usingPreviewCatalog]);

  // Active state for configurable attributes
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState<ProductFinish>(
    product?.finishes[0] || 'MATTE'
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product?.colors[0] || { id: 'c-default', name: 'Default', hex: '#643D26' }
  );
  const [sharedColors, setSharedColors] = useState<BackendColor[]>([]);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isSharedColorsLoading, setIsSharedColorsLoading] = useState(false);
  const [isCustomColorSelected, setIsCustomColorSelected] = useState(false);
  const [isCreatingCustomColor, setIsCreatingCustomColor] = useState(false);
  const [customColorDraft, setCustomColorDraft] = useState('#A1B2C3');
  const [hasChosenCustomColor, setHasChosenCustomColor] = useState(false);
  const [customColorError, setCustomColorError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    product?.sizes?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // If no product selected, offer redirect to shop
  if (!product) {
    if (isCatalogLoading) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 pt-28 text-center" role="status" aria-live="polite">
          <Loader2 className="h-6 w-6 animate-spin text-[#643D26]" aria-hidden="true" />
          <p className="text-sm text-[#6D6A64]">جارٍ تحميل تفاصيل القطعة...</p>
        </div>
      );
    }

    if (storeDataErrors.catalog) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 pt-28 text-center" role="alert">
          <p className="text-sm text-[#17324A]">تعذر تحميل تفاصيل القطعة</p>
          <p className="max-w-md text-xs text-[#6D6A64]">{storeDataErrors.catalog}</p>
          <button type="button" onClick={() => void reloadStoreData()} className="bg-[#17324A] px-5 py-2.5 text-sm font-medium text-white">
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return (
      <div className="pt-32 pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-lg text-[#17324A]">لم نعثر على هذه القطعة</p>
        <button
          onClick={() => navigateTo('shop')}
          className="bg-[#17324A] px-6 py-2.5 text-sm text-white"
        >
          العودة إلى المنتجات
        </button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId)
    || storeCategories.find((c) => c.id === product.categoryId);
  const productSubcategories = subcategories.filter((subcategory) =>
    product.subcategoryIds.includes(String(subcategory.id))
  );

  const toggleColorMenu = async () => {
    if (isColorMenuOpen) {
      setIsColorMenuOpen(false);
      return;
    }
    setIsColorMenuOpen(true);
    setCustomColorError(null);
    setIsSharedColorsLoading(true);
    try {
      setSharedColors(await colorService.getColors());
    } catch (err) {
      setCustomColorError(normalizeApiError(err).message);
    } finally {
      setIsSharedColorsLoading(false);
    }
  };

  const selectSharedColor = (color: BackendColor) => {
    setSelectedColor({ id: String(color.id), name: color.name, hex: color.hex_code });
    setIsCustomColorSelected(true);
    setIsColorMenuOpen(false);
    setCustomColorError(null);
  };

  const createCustomColor = async (hexCode: string) => {
    setIsCreatingCustomColor(true);
    setCustomColorError(null);
    try {
      const color = await colorService.createCustomColor(hexCode.toUpperCase());
      setSharedColors((current) =>
        current.some((item) => item.id === color.id) ? current : [color, ...current]
      );
      selectSharedColor(color);
    } catch (err) {
      setCustomColorError(normalizeApiError(err).message);
    } finally {
      setIsCreatingCustomColor(false);
    }
  };

  // Base price + size price delta
  const unitPrice = (product.price || 0) + (selectedSize?.priceDelta || 0);
  const depositRatio = settings.depositPercentage / 100;
  const depositDue = Math.round(unitPrice * depositRatio);
  const remainingDue = unitPrice - depositDue;

  // WhatsApp Enquiry URL with contextual product prefill
  const whatsappPrefill = `مرحبًا مودرن هوم، أستفسر عن "${product.name}".
التشطيب: ${selectedFinish === 'MATTE' ? 'مطفأ' : 'لامع'}
اللون: ${selectedColor.name}
${selectedSize ? `المقاس: ${selectedSize.name} (${selectedSize.dimensions})` : ''}
أرجو إرسال تفاصيل السعر والتنفيذ.`;

  const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
    whatsappPrefill
  )}`;

  const handleAddToCart = async () => {
    setCartError(null);
    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        unitPrice,
        selectedFinish,
        selectedColor,
        selectedSize,
        quantity,
      });

      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 2000);
    } catch (err) {
      setCartError(normalizeApiError(err).message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div id="product-detail-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        <nav aria-label="مسار التنقل" className="flex items-center gap-2 overflow-x-auto whitespace-nowrap border-b border-[#E6DED2] py-3 text-xs text-[#6D6A64]">
          <button type="button" onClick={() => navigateTo('shop')} className="inline-flex items-center gap-1.5 hover:text-[#17324A]">
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span>المنتجات</span>
          </button>
          {category && (
            <>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <button type="button" onClick={() => navigateTo('shop', { categoryId: category.id })} className="hover:text-[#17324A]">
                {category.name}
              </button>
            </>
          )}
          {productSubcategories.map((subcategory) => (
            <React.Fragment key={subcategory.id}>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <span>{subcategory.name}</span>
            </React.Fragment>
          ))}
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="max-w-[180px] truncate font-medium text-[#17324A]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-7 pt-5 sm:gap-10 lg:grid-cols-12 lg:gap-12 lg:pt-8">
          <section className="space-y-4 lg:col-span-8" aria-label="صور المنتج ومواصفاته">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#E6DED2] sm:aspect-[5/4]">
              <Image
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
              <span className="absolute right-3 top-3 bg-[#F7F3EC]/95 px-3 py-1.5 text-xs font-medium text-[#17324A]">
                {product.material?.split(',')[0] || 'خامة مختارة'}
              </span>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1" aria-label="صور إضافية للمنتج">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIdx(index)}
                    aria-label={`عرض الصورة ${index + 1}`}
                    aria-pressed={selectedImageIdx === index}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden border-2 sm:h-20 sm:w-20 ${selectedImageIdx === index ? 'border-[#17324A]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <Image src={image} alt={`${product.name} ${index + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            <dl className="grid grid-cols-1 divide-y divide-[#E6DED2] border-y border-[#E6DED2] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="space-y-2 py-4 sm:pl-5 sm:pr-0">
                <dt className="flex items-center gap-2 text-xs font-semibold text-[#17324A]">
                  <Layers className="h-4 w-4 text-[#A36046]" aria-hidden="true" /> الخامة
                </dt>
                <dd className="text-sm leading-6 text-[#6D6A64]">{product.material || 'غير محددة'}</dd>
              </div>
              <div className="space-y-2 py-4 sm:pr-5 sm:pl-0">
                <dt className="flex items-center gap-2 text-xs font-semibold text-[#17324A]">
                  <Ruler className="h-4 w-4 text-[#A36046]" aria-hidden="true" /> الأبعاد
                </dt>
                <dd className="text-sm leading-6 text-[#6D6A64]">
                  {product.dimensions || 'غير محددة'}
                  {product.height && <span className="block">الارتفاع: {product.height} سم</span>}
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-6 lg:col-span-4 sm:space-y-8">
            <header className="space-y-2 border-b border-[#E6DED2] pb-5">
              <span className="text-xs font-semibold text-[#A36046]">{category?.name || 'مودرن هوم'}</span>
              <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">{product.name}</h1>
              {productSubcategories.length > 0 && (
                <p className="text-sm text-[#6D6A64]">{productSubcategories.map((subcategory) => subcategory.name).join(' · ')}</p>
              )}
            </header>

            <div className="space-y-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-semibold text-[#17324A] sm:text-3xl">
                  {unitPrice > 0
                    ? `${new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(unitPrice)} جنيه`
                    : 'السعر عند الطلب'}
                </span>
                {product.inStock && <span className="text-xs text-[#6D6A64]">متاح للطلب</span>}
              </div>
              {unitPrice > 0 && (
                <div className="border-r-2 border-[#C8A77D] bg-[#F0E7DA] px-4 py-3">
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[#17324A]">
                    <span>مقدم {settings.depositPercentage}%</span>
                    <span>{new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(depositDue)} جنيه</span>
                  </div>
                  <p className="mt-1 text-xs leading-6 text-[#53616A]">
                    المتبقي {new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(remainingDue)} جنيه عند التسليم.
                  </p>
                </div>
              )}
            </div>

            {product.finishes.length > 0 && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-[#17324A]">
                  التشطيب <span className="font-normal text-[#6D6A64]">· {selectedFinish === 'MATTE' ? 'مطفأ' : 'لامع'}</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.finishes.map((finish) => (
                    <button
                      key={finish}
                      type="button"
                      onClick={() => setSelectedFinish(finish)}
                      aria-pressed={selectedFinish === finish}
                      className={`min-h-10 border px-4 text-sm transition-colors ${selectedFinish === finish ? 'border-[#17324A] bg-[#17324A] text-white' : 'border-[#D9CEBF] bg-white text-[#42515C] hover:border-[#17324A]'}`}
                    >
                      {finish === 'MATTE' ? 'مطفأ' : 'لامع'}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {(product.colors.length > 0 || product.allowsCustomization) && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-[#17324A]">
                  اللون <span className="font-normal text-[#6D6A64]">· {selectedColor.name}</span>
                </legend>
                <div className="flex flex-wrap items-center gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => {
                        setSelectedColor(color);
                        setIsCustomColorSelected(false);
                      }}
                      aria-label={`اختيار اللون ${color.name}`}
                      aria-pressed={selectedColor.id === color.id}
                      title={color.name}
                      className={`grid h-10 w-10 place-items-center rounded-full border-2 ${selectedColor.id === color.id ? 'border-[#17324A]' : 'border-transparent'}`}
                    >
                      <span className="h-7 w-7 rounded-full border border-black/15" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                  {!usingPreviewCatalog && (
                    <button
                      type="button"
                      onClick={() => void toggleColorMenu()}
                      className={`grid h-10 w-10 place-items-center rounded-full border ${isCustomColorSelected ? 'border-[#17324A]' : 'border-[#D9CEBF]'}`}
                      title="اختيار لون آخر"
                      aria-label="اختيار لون آخر"
                      aria-expanded={isColorMenuOpen}
                    >
                      {isCustomColorSelected
                        ? <span className="h-7 w-7 rounded-full border border-black/15" style={{ backgroundColor: selectedColor.hex }} />
                        : <Plus className="h-4 w-4 text-[#17324A]" aria-hidden="true" />}
                    </button>
                  )}
                </div>

                {isColorMenuOpen && (
                  <div className="space-y-4 border border-[#E6DED2] bg-white p-4">
                    <p className="text-xs text-[#6D6A64]">ألوان إضافية</p>
                    {isSharedColorsLoading ? (
                      <div className="flex justify-center py-2" aria-label="جارٍ تحميل الألوان">
                        <Loader2 className="h-4 w-4 animate-spin text-[#17324A]" />
                      </div>
                    ) : sharedColors.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {sharedColors.map((color) => (
                          <button
                            key={color.id}
                            type="button"
                            onClick={() => selectSharedColor(color)}
                            className={`h-9 w-9 rounded-full border-2 ${selectedColor.id === String(color.id) ? 'border-[#17324A]' : 'border-[#D9CEBF]'}`}
                            style={{ backgroundColor: color.hex_code }}
                            title={color.hex_code}
                            aria-label={`اختيار اللون ${color.hex_code}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#6D6A64]">لا توجد ألوان إضافية حاليًا.</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 border-t border-[#E6DED2] pt-3">
                      <span className="text-xs text-[#6D6A64]">تبحث عن درجة محددة؟</span>
                      <label className="relative inline-flex min-h-10 cursor-pointer items-center gap-2 border border-[#D9CEBF] px-3 text-xs text-[#42515C]">
                        <span className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: customColorDraft }} />
                        <span>اختر درجة</span>
                        <input
                          type="color"
                          value={customColorDraft}
                          aria-label="اختيار درجة لون مخصصة"
                          disabled={isCreatingCustomColor}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          onChange={(event) => {
                            setCustomColorDraft(event.target.value.toUpperCase());
                            setHasChosenCustomColor(true);
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => void createCustomColor(customColorDraft)}
                        disabled={!hasChosenCustomColor || isCreatingCustomColor}
                        className="inline-flex min-h-10 items-center gap-2 bg-[#17324A] px-3 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {isCreatingCustomColor ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                        <span>{isCreatingCustomColor ? 'جارٍ الإضافة...' : 'إضافة اللون'}</span>
                      </button>
                    </div>
                    {customColorError && <p role="alert" className="text-xs text-[#A33B2B]">{customColorError}</p>}
                  </div>
                )}
              </fieldset>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-[#17324A]">المقاس</legend>
                <div className="space-y-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize?.id === size.id}
                      className={`flex w-full items-center justify-between gap-4 border px-4 py-3 text-right ${selectedSize?.id === size.id ? 'border-[#17324A] bg-[#F0E7DA]' : 'border-[#D9CEBF] bg-white hover:border-[#17324A]'}`}
                    >
                      <span>
                        <span className="block text-sm font-semibold text-[#17324A]">{size.name}</span>
                        <span className="mt-1 block text-xs text-[#6D6A64]">{size.dimensions}</span>
                      </span>
                      {size.priceDelta !== 0 && (
                        <span className="shrink-0 text-xs font-medium text-[#17324A]">
                          +{new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(size.priceDelta)} جنيه
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="flex items-start gap-2 border-t border-[#E6DED2] pt-4 text-sm text-[#53616A]">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#A36046]" aria-hidden="true" />
              <span><strong className="font-semibold text-[#17324A]">موعد التنفيذ:</strong> {product.deliveryDays ? `${product.deliveryDays} يوم` : 'يُحدد عند تأكيد الطلب'}</span>
            </div>

            <div className="space-y-3 border-t border-[#E6DED2] pt-5">
              <div className="flex gap-3">
                <div className="flex min-h-12 shrink-0 items-center border border-[#D9CEBF] bg-white px-2">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-8 w-8 place-items-center text-[#42515C] hover:text-[#17324A]" aria-label="تقليل الكمية">−</button>
                  <span className="min-w-7 text-center text-sm font-semibold text-[#17324A]">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="grid h-8 w-8 place-items-center text-[#42515C] hover:text-[#17324A]" aria-label="زيادة الكمية">+</button>
                </div>
                {product.price <= 0 ? (
                  <button
                    id="add-to-cart-btn"
                    type="button"
                    onClick={() => navigateTo('custom-design')}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#17324A] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#24445E]"
                  >
                    <span>اطلبها حسب مساحتك</span>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    id="add-to-cart-btn"
                    type="button"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || usingPreviewCatalog}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#17324A] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#24445E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAddingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : addedAnimation ? <Check className="h-4 w-4 text-[#65C987]" /> : null}
                    <span>{usingPreviewCatalog ? 'للمعاينة فقط' : isAddingToCart ? 'جارٍ الإضافة...' : addedAnimation ? 'أُضيفت للحقيبة' : 'أضف إلى الحقيبة'}</span>
                  </button>
                )}
              </div>

              {usingPreviewCatalog && product.price > 0 && <p className="text-xs leading-6 text-[#6D6A64]">بيانات القطعة تجريبية في وضع التطوير؛ لن تُرسل إلى سلة المتجر.</p>}

              {cartError && (
                <div role="alert" className="flex items-start gap-2 border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p>{cartError}</p>
                </div>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#D9CEBF] px-4 text-sm font-medium text-[#17324A] transition-colors hover:bg-[#EEE5D9]"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden="true" />
                <span>اسألنا على واتساب</span>
              </a>
            </div>

            {product.description && (
              <div className="space-y-2 border-t border-[#E6DED2] pt-5">
                <h2 className="text-sm font-semibold text-[#17324A]">عن القطعة</h2>
                <p className="whitespace-pre-line text-sm leading-7 text-[#53616A]">{product.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-[#6D6A64]">
              <ShieldCheck className="h-4 w-4 text-[#A36046]" aria-hidden="true" />
              <span>تفاصيل الطلب تؤكد مع فريق مودرن هوم.</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
