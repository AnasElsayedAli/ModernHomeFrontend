'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { mapBackendProduct, useToccoStore } from '@/lib/store';
import { productService } from '@/lib/api/services/productService';
import { normalizeApiError } from '@/lib/api/errors';
import { toWhatsAppNumber } from '@/lib/utils';
import { Product, ProductFinish, ProductColor, ProductSize } from '@/types';
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
} from 'lucide-react';
import { useModernHomeContent } from './modern-home/useModernHomeContent';
import ModernHomeProductCard from './ModernHomeProductCard';

function pickRandomProducts(products: Product[], excludedProductId: string): Product[] {
  const candidates = products.filter((candidate) => candidate.id !== excludedProductId);
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[randomIndex]] = [candidates[randomIndex], candidates[index]];
  }
  return candidates.slice(0, 4);
}

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
  const { categories } = useModernHomeContent();

  const storeProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return getProductById(selectedProductId) || null;
  }, [selectedProductId, getProductById]);
  const [remoteProduct, setRemoteProduct] = useState<{ id: string; product: Product } | null>(null);
  const [remoteProductError, setRemoteProductError] = useState<{ id: string; message: string } | null>(null);
  const [productRetryVersion, setProductRetryVersion] = useState(0);
  const directProduct = remoteProduct?.id === selectedProductId ? remoteProduct.product : null;
  const product = storeProduct || directProduct;

  useEffect(() => {
    if (isCatalogLoading || !selectedProductId || getProductById(selectedProductId)) return;
    const productId = Number(selectedProductId);
    if (!Number.isSafeInteger(productId)) return;

    let active = true;
    productService.getProduct(productId)
      .then((backendProduct) => {
        if (active) {
          setRemoteProduct({
            id: selectedProductId,
            product: mapBackendProduct(backendProduct, subcategories),
          });
          setRemoteProductError(null);
        }
      })
      .catch((error) => {
        if (active) {
          setRemoteProductError({
            id: selectedProductId,
            message: normalizeApiError(error).message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [getProductById, isCatalogLoading, productRetryVersion, selectedProductId, subcategories]);

  const currentProductError = remoteProductError?.id === selectedProductId ? remoteProductError : null;
  const isDirectProductLoading = Boolean(
    selectedProductId
    && !storeProduct
    && !directProduct
    && !currentProductError
    && Number.isSafeInteger(Number(selectedProductId))
  );
  const [recommendedState, setRecommendedState] = useState<{ productId: string; products: Product[] } | null>(null);

  useEffect(() => {
    if (!product) return;

    let active = true;
    const loadRecommendations = async () => {
      const categoryResponse = await productService.getProductPage({
        page: 1,
        page_size: 100,
        ordering: 'featured',
        ...(product.categoryId ? { category_id: product.categoryId } : {}),
      });
      let alternatives = categoryResponse.results.map((item) => mapBackendProduct(item, subcategories));
      if (!alternatives.some((item) => item.id !== product.id)) {
        const catalogResponse = await productService.getProductPage({
          page: 1,
          page_size: 100,
          ordering: 'featured',
        });
        alternatives = catalogResponse.results.map((item) => mapBackendProduct(item, subcategories));
      }
      if (active) {
        setRecommendedState({
          productId: product.id,
          products: pickRandomProducts(alternatives, product.id),
        });
      }
    };

    loadRecommendations().catch(() => {
      if (active) setRecommendedState({ productId: product.id, products: [] });
    });
    return () => {
      active = false;
    };
  }, [product, subcategories]);

  const recommendedProducts = recommendedState?.productId === product?.id
    ? recommendedState?.products ?? []
    : [];

  // Active state for configurable attributes
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState<ProductFinish>(
    product?.finishes[0] || 'MATTE'
  );
  const [selectedColor, setSelectedColor] = useState<ProductColor>(
    product?.colors[0] || { id: 'c-default', name: 'Default', hex: '#643D26' }
  );
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    product?.sizes?.[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // If no product selected, offer redirect to shop
  if (!product) {
    if (isCatalogLoading || isDirectProductLoading) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 pt-28 text-center" role="status" aria-live="polite">
          <Loader2 className="h-6 w-6 animate-spin text-[#643D26]" aria-hidden="true" />
          <p className="text-sm text-[#6D6A64]">جارٍ تحميل تفاصيل القطعة...</p>
        </div>
      );
    }

    if (currentProductError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 pt-28 text-center" role="alert">
          <p className="text-sm text-[#17324A]">تعذر تحميل تفاصيل القطعة</p>
          <p className="max-w-md text-xs text-[#6D6A64]">{currentProductError.message}</p>
          <button type="button" onClick={() => setProductRetryVersion((version) => version + 1)} className="bg-[#17324A] px-5 py-2.5 text-sm font-medium text-white">
            إعادة المحاولة
          </button>
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

  const activeFinish = product.finishes.includes(selectedFinish)
    ? selectedFinish
    : product.finishes[0] || selectedFinish;
  const activeColor = product.colors.find((color) => color.id === selectedColor.id)
    || product.colors[0]
    || selectedColor;
  const activeSize = selectedSize && product.sizes?.some((size) => size.id === selectedSize.id)
    ? selectedSize
    : product.sizes?.[0];

  const category = categories.find((c) => c.id === product.categoryId)
    || storeCategories.find((c) => c.id === product.categoryId);
  const productSubcategories = subcategories.filter((subcategory) =>
    product.subcategoryIds.includes(String(subcategory.id))
  );

  // Base price + size price delta
  const unitPrice = (product.price || 0) + (activeSize?.priceDelta || 0);
  const depositRatio = settings.depositPercentage / 100;
  const depositDue = Math.round(unitPrice * depositRatio);
  const remainingDue = unitPrice - depositDue;

  // WhatsApp Enquiry URL with contextual product prefill
  const whatsappPrefill = `مرحبًا مودرن هوم، أستفسر عن "${product.name}".
التشطيب: ${activeFinish === 'MATTE' ? 'مطفأ' : 'لامع'}
اللون: ${activeColor.name}
${activeSize ? `المقاس: ${activeSize.name} (${activeSize.dimensions})` : ''}
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
        selectedFinish: activeFinish,
        selectedColor: activeColor,
        selectedSize: activeSize,
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
                  التشطيب <span className="font-normal text-[#6D6A64]">· {activeFinish === 'MATTE' ? 'مطفأ' : 'لامع'}</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {product.finishes.map((finish) => (
                    <button
                      key={finish}
                      type="button"
                      onClick={() => setSelectedFinish(finish)}
                      aria-pressed={activeFinish === finish}
                      className={`min-h-10 border px-4 text-sm transition-colors ${activeFinish === finish ? 'border-[#17324A] bg-[#17324A] text-white' : 'border-[#D9CEBF] bg-white text-[#42515C] hover:border-[#17324A]'}`}
                    >
                      {finish === 'MATTE' ? 'مطفأ' : 'لامع'}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {product.colors.length > 0 && (
              <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-[#17324A]">
                  اللون <span className="font-normal text-[#6D6A64]">· {activeColor.name}</span>
                </legend>
                <div className="flex flex-wrap items-center gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`اختيار اللون ${color.name}`}
                      aria-pressed={activeColor.id === color.id}
                      title={color.name}
                      className={`grid h-10 w-10 place-items-center rounded-full border-2 ${activeColor.id === color.id ? 'border-[#17324A]' : 'border-transparent'}`}
                    >
                      <span className="h-7 w-7 rounded-full border border-black/15" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                </div>
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
                      aria-pressed={activeSize?.id === size.id}
                      className={`flex w-full items-center justify-between gap-4 border px-4 py-3 text-right ${activeSize?.id === size.id ? 'border-[#17324A] bg-[#F0E7DA]' : 'border-[#D9CEBF] bg-white hover:border-[#17324A]'}`}
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
                    disabled={isAddingToCart}
                    className="flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#17324A] px-3 text-sm font-semibold text-white transition-colors hover:bg-[#24445E] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAddingToCart ? <Loader2 className="h-4 w-4 animate-spin" /> : addedAnimation ? <Check className="h-4 w-4 text-[#65C987]" /> : null}
                    <span>{isAddingToCart ? 'جارٍ الإضافة...' : addedAnimation ? 'أُضيفت للحقيبة' : 'أضف إلى الحقيبة'}</span>
                  </button>
                )}
              </div>

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

        {recommendedProducts.length > 0 && (
          <section className="mt-12 border-t border-[#E6DED2] pt-8 sm:mt-16" aria-labelledby="related-products-heading">
            <h2 id="related-products-heading" className="mb-5 font-[family-name:var(--font-display)] text-xl font-semibold text-[#17324A] sm:text-2xl">
              أيضا قد ينال إعجابك
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
              {recommendedProducts.map((recommendedProduct) => {
                const subcategoryName = subcategories.find((subcategory) =>
                  recommendedProduct.subcategoryIds.includes(String(subcategory.id))
                )?.name;
                const categoryName = subcategoryName
                  || categories.find((item) => item.id === recommendedProduct.categoryId)?.name;
                return (
                  <ModernHomeProductCard
                    key={recommendedProduct.id}
                    product={recommendedProduct}
                    categoryLabel={categoryName}
                    onSelect={() => navigateTo('product', { productId: recommendedProduct.id })}
                    compact
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
