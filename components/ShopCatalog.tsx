'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useToccoStore, mapBackendProduct } from '@/lib/store';
import { productService } from '@/lib/api/services/productService';
import { normalizeApiError } from '@/lib/api/errors';
import { Product } from '@/types';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ModernHomeProductCard from './ModernHomeProductCard';
import { useModernHomeContent } from './modern-home/useModernHomeContent';

export default function ShopCatalog() {
  const {
    subcategories,
    selectedCategoryId,
    navigateTo,
    searchQuery,
    setSearchQuery,
    isCatalogLoading,
    storeDataErrors,
    reloadStoreData,
  } = useToccoStore();
  const { products, categories } = useModernHomeContent();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(
    selectedCategoryId || 'all'
  );
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-asc' | 'price-desc'>('featured');

  // Server-side search results (name/description/material), debounced
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchRetryVersion, setSearchRetryVersion] = useState(0);
  const [searchResultsQuery, setSearchResultsQuery] = useState<string | null>(null);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      // filteredProducts falls back to the full `products` list when the query
      // is empty, so any stale searchResults/isSearching values are simply unused.
      return;
    }

    let active = true;
    const handle = setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);
      productService
        .getProducts({ search: query })
        .then((backendProducts) => {
          if (!active) return;
          setSearchResults(backendProducts.map((p) => mapBackendProduct(p, subcategories)));
          setSearchResultsQuery(query);
        })
        .catch((err) => {
          if (!active) return;
          setSearchError(normalizeApiError(err).message);
          setSearchResults(null);
        })
        .finally(() => {
          if (active) setIsSearching(false);
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [searchQuery, searchRetryVersion, subcategories]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim();
    const matchingSubcategoryIds = new Set(
      query
        ? subcategories
            .filter((subcategory) => subcategory.name.toLowerCase().includes(query.toLowerCase()))
            .map((subcategory) => String(subcategory.id))
        : []
    );
    const serverSearchMatches = query && searchResultsQuery === query
      ? searchResults || []
      : [];
    const serverMatchIds = new Set(serverSearchMatches.map((product) => product.id));
    const subcategoryMatches = query
      ? products.filter((product) =>
          product.subcategoryIds.some((id) => matchingSubcategoryIds.has(id))
          && !serverMatchIds.has(product.id)
        )
      : [];
    const baseList = query ? [...serverSearchMatches, ...subcategoryMatches] : products;
    return baseList.filter((product) => {
      // Must be published
      if (!product.isPublished) return false;

      // Category filter
      if (activeCategoryFilter !== 'all' && product.categoryId !== activeCategoryFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'price-asc') {
        return (a.price || 999999) - (b.price || 999999);
      }
      if (sortBy === 'price-desc') {
        return (b.price || 0) - (a.price || 0);
      }
      // 'featured'
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, searchResults, searchResultsQuery, activeCategoryFilter, searchQuery, sortBy, subcategories]);

  const visibleCategories = categories.filter((c) => c.isVisible);
  const hasSearchQuery = Boolean(searchQuery.trim());
  const isSearchWaitingForCurrentQuery = hasSearchQuery
    && !searchError
    && (isSearching || searchResultsQuery !== searchQuery.trim());

  return (
    <div id="shop-catalog-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <header className="border-b border-[#D8CEBF] bg-[#E8E3D9] py-8 sm:py-12 lg:py-16">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 px-5 sm:px-10 lg:flex-row lg:items-end lg:px-14">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold text-[#A36046]">معرض مودرن هوم <span className="me-2 font-[family-name:var(--font-brand)] text-[#8F867A]">04</span></p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-5xl">قطع تُكمل حكاية بيتك</h1>
            <p className="max-w-xl text-sm leading-7 text-[#625E57]">تصفّح القطع الجاهزة، أو ابدأ من قطعة تُصنع على مقاس مساحتك.</p>
          </div>
          <p className="text-xs text-[#6D6A64]">{products.filter((product) => product.isPublished).length} قطعة مختارة</p>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
          <div className="relative mt-6 max-w-2xl">
            <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#817D75]" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث عن كرسي، طاولة، بوفيه..."
              aria-label="ابحث في المنتجات"
              className="min-h-12 w-full border-b border-[#BFB4A6] bg-transparent py-3 pe-11 ps-12 text-right text-sm text-[#18232D] outline-none placeholder:text-[#817D75] focus:border-[#17324A]"
              dir="rtl"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-[#6D6A64] hover:text-[#17324A]"
                aria-label="مسح البحث"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        <section className="border-b border-[#DED5C9] py-5" aria-label="تصفية المنتجات">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <button
                type="button"
                onClick={() => setActiveCategoryFilter('all')}
                aria-pressed={activeCategoryFilter === 'all'}
                className={`shrink-0 border-b-2 px-3 py-2 text-sm transition-colors ${activeCategoryFilter === 'all' ? 'border-[#17324A] font-semibold text-[#17324A]' : 'border-transparent text-[#6D6A64] hover:text-[#17324A]'}`}
              >
                الكل ({products.filter((product) => product.isPublished).length})
              </button>
              {visibleCategories.map((category) => {
                const count = products.filter((product) => product.categoryId === category.id && product.isPublished).length;
                const isSelected = activeCategoryFilter === category.id;
                return (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => setActiveCategoryFilter(category.id)}
                    aria-pressed={isSelected}
                    className={`shrink-0 border-b-2 px-3 py-2 text-sm transition-colors ${isSelected ? 'border-[#17324A] font-semibold text-[#17324A]' : 'border-transparent text-[#6D6A64] hover:text-[#17324A]'}`}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>

            <label className="flex min-h-11 items-center gap-2 border-b border-[#BFB4A6] px-1 text-sm text-[#42515C] lg:min-w-56">
              <SlidersHorizontal className="h-4 w-4 text-[#A36046]" aria-hidden="true" />
              <span className="shrink-0 text-xs">ترتيب حسب</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                aria-label="ترتيب المنتجات"
                className="min-w-0 flex-1 bg-transparent text-right text-xs outline-none"
              >
                <option value="featured">الأكثر تميزًا</option>
                <option value="newest">الأحدث</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
              </select>
            </label>
          </div>
        </section>

        {searchError && (
          <div role="alert" className="mt-4 flex items-center justify-between gap-3 border-y border-[#DED5C9] px-1 py-3 text-sm text-[#42515C]">
            <span>تعذر إتمام البحث. {searchError}</span>
            <button
              type="button"
              onClick={() => setSearchRetryVersion((version) => version + 1)}
              className="shrink-0 font-semibold text-[#17324A] underline underline-offset-4"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {searchQuery && (
          <div className="mt-4 flex items-center justify-between gap-3 border-r-2 border-[#A36046] bg-[#EEE7DC] px-4 py-3 text-xs text-[#42515C]">
            <span>{isSearching ? 'جارٍ البحث...' : `نتائج «${searchQuery}» · ${filteredProducts.length} قطعة`}</span>
            <button type="button" onClick={() => setSearchQuery('')} className="shrink-0 font-semibold text-[#17324A]">
              مسح البحث
            </button>
          </div>
        )}

        {isCatalogLoading && products.length === 0 ? (
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
        ) : storeDataErrors.catalog && products.length === 0 ? (
          <div role="alert" className="my-8 border-y border-[#DED5C9] px-5 py-10 text-center">
            <p className="text-base font-semibold text-[#17324A]">تعذر تحميل المنتجات</p>
            <p className="mt-2 text-sm text-[#6D6A64]">{storeDataErrors.catalog}</p>
            <button type="button" onClick={() => void reloadStoreData()} className="mt-5 bg-[#17324A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#24445E]">
              إعادة المحاولة
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl font-semibold text-[#17324A]">لا توجد منتجات معروضة حاليًا.</p>
          </div>
        ) : isSearchWaitingForCurrentQuery ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-8 md:grid-cols-12 md:gap-x-6 md:gap-y-12" role="status" aria-live="polite">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#E6DED2]" />
                <div className="space-y-3 pt-4">
                  <div className="h-3 w-1/3 bg-[#DED5C9]" />
                  <div className="h-4 w-2/3 bg-[#DED5C9]" />
                </div>
              </div>
            ))}
          </div>
        ) : searchError && filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#6D6A64]">تعذر إتمام البحث. أعد المحاولة من الأعلى.</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl font-semibold text-[#17324A]">لم نجد ما تبحث عنه</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-[#6D6A64]">جرّب كلمة بحث مختلفة أو غيّر التصنيف.</p>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('all');
                setSearchQuery('');
              }}
              className="mt-5 border-b border-[#C8A77D] pb-1 text-sm font-semibold text-[#17324A]"
            >
              عرض كل المنتجات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 pt-8 md:grid-cols-12 md:gap-x-6 md:gap-y-12">
            {filteredProducts.map((product, index) => {
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
      </div>
    </div>
  );
}
