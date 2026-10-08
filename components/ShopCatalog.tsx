'use client';

import React, { useState, useEffect } from 'react';
import { useToccoStore, mapBackendProduct } from '@/lib/store';
import { productService } from '@/lib/api/services/productService';
import { normalizeApiError } from '@/lib/api/errors';
import { Product } from '@/types';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import Image from '@/components/SafeImage';
import ModernHomeProductCard from './ModernHomeProductCard';
import { useModernHomeContent } from './modern-home/useModernHomeContent';

const PRODUCT_PAGE_SIZE = process.env.NODE_ENV === 'development' ? 10 : 100;

export default function ShopCatalog({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const {
    subcategories,
    selectedCategoryId,
    navigateTo,
    searchQuery,
    setSearchQuery,
    isCatalogLoading,
    catalogProductCount,
    storeDataErrors,
    reloadStoreData,
  } = useToccoStore();
  const { products, categories } = useModernHomeContent();

  const activeCategoryFilter = featuredOnly ? 'all' : selectedCategoryId || 'all';
  const [activeSubcategoryFilter, setActiveSubcategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc'>('featured');
  const visibleCategories = categories.filter((c) => c.isVisible);
  const selectedCategory = visibleCategories.find((category) => category.id === activeCategoryFilter);
  const visibleSubcategories = activeCategoryFilter === 'all'
    ? []
    : subcategories.filter((subcategory) => String(subcategory.category_id) === activeCategoryFilter);
  const hasSearchQuery = Boolean(searchQuery.trim());
  const showCategoryLanding = !featuredOnly && activeCategoryFilter === 'all' && !hasSearchQuery;
  const filterKey = [activeCategoryFilter, activeSubcategoryFilter, sortBy, searchQuery.trim(), featuredOnly].join('|');
  const [requestedPage, setRequestedPage] = useState({ filterKey: '', page: 1 });
  const requestedPageNumber = requestedPage.filterKey === filterKey ? requestedPage.page : 1;
  const [loadedPage, setLoadedPage] = useState<{
    key: string;
    products: Product[];
    count: number;
  } | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [pageError, setPageError] = useState<{ key: string; message: string } | null>(null);
  const [pageRetryVersion, setPageRetryVersion] = useState(0);
  const isDefaultCatalogFilter = activeCategoryFilter === 'all'
    && activeSubcategoryFilter === 'all'
    && !hasSearchQuery
    && !featuredOnly
    && sortBy === 'featured';
  const knownResultCount = isDefaultCatalogFilter
    ? catalogProductCount
    : loadedPage?.key.startsWith(`${filterKey}|`) ? loadedPage.count : null;
  const actualTotalPages = knownResultCount === null
    ? 0
    : Math.ceil(knownResultCount / PRODUCT_PAGE_SIZE);
  const currentPage = knownResultCount === null
    ? requestedPageNumber
    : Math.min(requestedPageNumber, Math.max(actualTotalPages, 1));
  const pageRequestKey = `${filterKey}|${currentPage}`;
  const isInitialCatalogPage = isDefaultCatalogFilter && currentPage === 1;

  useEffect(() => {
    if (showCategoryLanding || isInitialCatalogPage || isCatalogLoading) return;

    let active = true;
    const handle = setTimeout(() => {
      setIsPageLoading(true);
      setPageError(null);
      productService.getProductPage({
        page: currentPage,
        page_size: PRODUCT_PAGE_SIZE,
        ordering: sortBy,
        ...(featuredOnly ? { featured: true } : {}),
        ...(activeCategoryFilter !== 'all' ? { category_id: activeCategoryFilter } : {}),
        ...(activeSubcategoryFilter !== 'all' ? { subcategory_id: activeSubcategoryFilter } : {}),
        ...(searchQuery.trim() ? { search: searchQuery.trim() } : {}),
      })
        .then((response) => {
          if (!active) return;
          setLoadedPage({
            key: pageRequestKey,
            products: response.results.map((product) => mapBackendProduct(product, subcategories)),
            count: response.count,
          });
        })
        .catch((error) => {
          if (active) {
            setPageError({ key: pageRequestKey, message: normalizeApiError(error).message });
          }
        })
        .finally(() => {
          if (active) setIsPageLoading(false);
        });
    }, hasSearchQuery ? 350 : 0);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [
    activeCategoryFilter,
    activeSubcategoryFilter,
    currentPage,
    featuredOnly,
    hasSearchQuery,
    isCatalogLoading,
    isInitialCatalogPage,
    pageRequestKey,
    pageRetryVersion,
    searchQuery,
    showCategoryLanding,
    sortBy,
    subcategories,
  ]);

  const isLoadedPageCurrent = loadedPage?.key === pageRequestKey;
  const currentPageError = pageError?.key === pageRequestKey ? pageError.message : null;
  const pageProducts = isInitialCatalogPage
    ? products.slice(0, PRODUCT_PAGE_SIZE)
    : isLoadedPageCurrent ? loadedPage.products : [];
  const resultCount = knownResultCount ?? 0;
  const isCurrentPageLoading = isCatalogLoading
    || (!isInitialCatalogPage && !currentPageError && (isPageLoading || !isLoadedPageCurrent));
  const totalPages = actualTotalPages;

  return (
    <div id="shop-catalog-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <header className="border-b border-[#D8CEBF] bg-[#E8E3D9] py-5 sm:py-7 lg:py-9">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-4 px-5 sm:px-10 lg:flex-row lg:items-end lg:px-14">
          <div className="max-w-3xl space-y-2">
            <p className="text-xs font-semibold text-[#A36046]">معرض مودرن هوم</p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-[#17324A] sm:text-3xl">
              {featuredOnly ? 'مختارات مودرن هوم' : showCategoryLanding ? 'اختر التصنيف' : selectedCategory?.name || (hasSearchQuery ? 'نتائج البحث' : 'المنتجات')}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-[#625E57]">
              {featuredOnly
                ? 'قطع اختارها فريق مودرن هوم لتكون من أبرز اختيارات التشكيلة.'
                : showCategoryLanding
                ? 'ابدأ باختيار التصنيف لتستعرض المنتجات والتصنيفات الفرعية.'
                : selectedCategory?.description || 'اكتشف المنتجات واختر التصنيف الفرعي المناسب لك.'}
            </p>
          </div>
          <p className="text-xs text-[#6D6A64]">
            {showCategoryLanding
              ? `${visibleCategories.length} تصنيف`
              : featuredOnly
                ? `${resultCount} قطعة مختارة`
                : `${resultCount} منتج`}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        {!showCategoryLanding && (
          <div className="mt-6 rounded-[22px] border border-[#E9E0D4] bg-[#FBF9F4] p-3 shadow-[0_8px_18px_rgba(23,50,74,0.03)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#817D75]" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="بحث..."
                  aria-label="ابحث في المنتجات"
                  className="min-h-11 w-full rounded-full border border-[#E3D9CC] bg-white py-2.5 pe-11 ps-11 text-right text-sm text-[#18232D] outline-none placeholder:text-[#817D75] transition-colors focus:border-[#17324A]"
                  dir="rtl"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-[#6D6A64] transition-colors hover:bg-[#F2E9E1] hover:text-[#17324A]"
                    aria-label="مسح البحث"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex w-fit shrink-0 items-center gap-2 rounded-full border border-[#E5DCCB] bg-[#F7F3EE] px-2 py-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#A36046] shadow-sm">
                  <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
                <div className="relative flex items-center rounded-full bg-white px-2 py-1.5">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                    aria-label="ترتيب المنتجات"
                    className="cursor-pointer appearance-none bg-transparent py-1 pl-5 pr-2 text-right text-sm font-medium text-[#17324A] outline-none"
                  >
                    <option value="featured">الأكثر تميزًا</option>
                    <option value="newest">الأحدث</option>
                    <option value="price-asc">السعر: الأقل</option>
                    <option value="price-desc">السعر: الأعلى</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6D6A64]" aria-hidden="true" />
                </div>
              </div>
            </div>

            {visibleSubcategories.length > 0 && (
              <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1" aria-label="التصنيفات الفرعية">
                <button
                  type="button"
                  onClick={() => setActiveSubcategoryFilter('all')}
                  aria-pressed={activeSubcategoryFilter === 'all'}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${activeSubcategoryFilter === 'all' ? 'border-[#17324A] bg-[#17324A] text-white' : 'border-[#E3D9CC] bg-white text-[#625E57] hover:border-[#17324A]'}`}
                >
                  الكل
                </button>
                {visibleSubcategories.map((subcategory) => {
                  const subcategoryId = String(subcategory.id);
                  const isSelected = activeSubcategoryFilter === subcategoryId;
                  return (
                    <button
                      type="button"
                      key={subcategoryId}
                      onClick={() => setActiveSubcategoryFilter(subcategoryId)}
                      aria-pressed={isSelected}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${isSelected ? 'border-[#17324A] bg-[#17324A] text-white' : 'border-[#E3D9CC] bg-white text-[#625E57] hover:border-[#17324A]'}`}
                    >
                      {subcategory.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentPageError && (
          <div role="alert" className="mt-4 flex items-center justify-between gap-3 border-y border-[#DED5C9] px-1 py-3 text-sm text-[#42515C]">
            <span>تعذر تحميل المنتجات. {currentPageError}</span>
            <button
              type="button"
              onClick={() => setPageRetryVersion((version) => version + 1)}
              className="shrink-0 font-semibold text-[#17324A] underline underline-offset-4"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {searchQuery && (
          <div className="mt-4 flex items-center justify-between gap-3 border-r-2 border-[#A36046] bg-[#EEE7DC] px-4 py-3 text-xs text-[#42515C]">
            <span>{isCurrentPageLoading ? 'جارٍ البحث...' : `نتائج «${searchQuery}» · ${resultCount} قطعة`}</span>
            <button type="button" onClick={() => setSearchQuery('')} className="shrink-0 font-semibold text-[#17324A]">
              مسح البحث
            </button>
          </div>
        )}

        {showCategoryLanding ? (
          isCatalogLoading && visibleCategories.length === 0 ? (
            <div className="grid grid-cols-2 gap-3 pt-8 sm:grid-cols-3 lg:grid-cols-4" role="status" aria-live="polite">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[4/3] bg-[#E6DED2]" />
                  <div className="mt-3 h-4 w-2/3 bg-[#DED5C9]" />
                </div>
              ))}
            </div>
          ) : storeDataErrors.catalog && visibleCategories.length === 0 ? (
            <div role="alert" className="my-8 border-y border-[#DED5C9] px-5 py-10 text-center">
              <p className="text-base font-semibold text-[#17324A]">تعذر تحميل التصنيفات</p>
              <p className="mt-2 text-sm text-[#6D6A64]">{storeDataErrors.catalog}</p>
              <button type="button" onClick={() => void reloadStoreData()} className="mt-5 bg-[#17324A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24445E]">
                إعادة المحاولة
              </button>
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-xl font-semibold text-[#17324A]">لا توجد تصنيفات متاحة حاليًا.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {visibleCategories.map((category) => {
                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => {
                      setActiveSubcategoryFilter('all');
                      navigateTo('shop', { categoryId: category.id });
                    }}
                    className="group relative aspect-[4/3] overflow-hidden bg-[#17324A] text-right text-white"
                  >
                    <Image
                      src={category.image || '/images/apple_hero_living_1790845941555.jpg'}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#112334]/95 via-[#17324A]/15 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
                      <span>
                        <span className="block font-[family-name:var(--font-display)] text-base font-semibold sm:text-xl">{category.name}</span>
                        <span className="mt-1 block text-[10px] text-white/75 sm:text-xs">استكشف المجموعة</span>
                      </span>
                      <ArrowLeft className="mb-1 h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                    </span>
                  </button>
                );
              })}
            </div>
          )
        ) : currentPageError && !isLoadedPageCurrent ? (
          <div className="py-16 text-center text-sm text-[#6D6A64]">تعذر تحميل المنتجات. استخدم زر إعادة المحاولة بالأعلى.</div>
        ) : isCurrentPageLoading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-8 md:grid-cols-12 md:gap-x-6 md:gap-y-12" role="status" aria-live="polite">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#E6DED2]" />
                <div className="space-y-3 pt-4">
                  <div className="h-3 w-1/3 bg-[#DED5C9]" />
                  <div className="h-4 w-2/3 bg-[#DED5C9]" />
                  <div className="h-3 w-1/2 bg-[#DED5C9]" />
                </div>
              </div>
            ))}
          </div>
        ) : storeDataErrors.catalog && isInitialCatalogPage && products.length === 0 ? (
          <div role="alert" className="my-8 border-y border-[#DED5C9] px-5 py-10 text-center">
            <p className="text-base font-semibold text-[#17324A]">تعذر تحميل المنتجات</p>
            <p className="mt-2 text-sm text-[#6D6A64]">{storeDataErrors.catalog}</p>
            <button type="button" onClick={() => void reloadStoreData()} className="mt-5 bg-[#17324A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24445E]">
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {pageProducts.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-xl font-semibold text-[#17324A]">{featuredOnly && !hasSearchQuery ? 'لا توجد مختارات معروضة حاليًا' : 'لم نجد ما تبحث عنه'}</p>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[#6D6A64]">{featuredOnly && !hasSearchQuery ? 'ستظهر هنا المنتجات التي يحددها فريق مودرن هوم من لوحة التحكم.' : 'جرّب كلمة بحث مختلفة أو غيّر التصنيف.'}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveSubcategoryFilter('all');
                    navigateTo('shop', { categoryId: '' });
                  }}
                  className="mt-5 border-b border-[#C8A77D] pb-1 text-sm font-semibold text-[#17324A]"
                >
                  {featuredOnly ? 'عرض كل المنتجات' : 'العودة للتصنيفات'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 pt-8 md:grid-cols-12 md:gap-x-6 md:gap-y-12">
                {pageProducts.map((product, index) => {
                  const productSubcategory = subcategories.find((subcategory) =>
                    product.subcategoryIds.includes(String(subcategory.id))
                  )?.name;
                  const categoryLabel = productSubcategory || categories.find((category) => category.id === product.categoryId)?.name;
                  return (
                    <div key={product.id} className={index % 6 === 0 ? 'col-span-2 md:col-span-6 md:row-span-2' : 'col-span-1 md:col-span-3'}>
                      <ModernHomeProductCard
                        product={product}
                        categoryLabel={categoryLabel}
                        onSelect={() => navigateTo('product', { productId: product.id })}
                        editorial={index % 6 === 0}
                        ordinal={index + 1}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          {totalPages > 1 && (
            <nav aria-label="صفحات المنتجات" className="flex items-center justify-center gap-3 pt-8">
              <button
                type="button"
                onClick={() => setRequestedPage({ filterKey, page: currentPage - 1 })}
                disabled={currentPage <= 1 || isCurrentPageLoading}
                aria-label="الصفحة السابقة"
                title="الصفحة السابقة"
                className="grid h-9 w-11 place-items-center rounded-full border border-[#E5DCCB] bg-[#FBF9F4] text-[#17324A] transition-colors hover:border-[#C8A77D] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <span aria-live="polite" aria-label={`الصفحة ${currentPage} من ${totalPages}`} dir="ltr" className="min-w-12 text-center text-sm font-medium tabular-nums text-[#6D6A64]">
                {new Intl.NumberFormat('ar-EG', { useGrouping: false }).format(currentPage)} / {new Intl.NumberFormat('ar-EG', { useGrouping: false }).format(totalPages)}
              </span>
              <button
                type="button"
                onClick={() => setRequestedPage({ filterKey, page: currentPage + 1 })}
                disabled={currentPage >= totalPages || isCurrentPageLoading}
                aria-label="الصفحة التالية"
                title="الصفحة التالية"
                className="grid h-9 w-11 place-items-center rounded-full border border-[#E5DCCB] bg-[#FBF9F4] text-[#17324A] transition-colors hover:border-[#C8A77D] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          )}
          </>
        )}
      </div>
    </div>
  );
}
