'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useToccoStore, mapBackendProduct } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import { productService } from '@/lib/api/services/productService';
import { normalizeApiError } from '@/lib/api/errors';
import { Product } from '@/types';
import Image from '@/components/SafeImage';
import { Search, Filter, SlidersHorizontal, ArrowRight, MessageCircle } from 'lucide-react';

export default function ShopCatalog() {
  const {
    products,
    categories,
    subcategories,
    selectedCategoryId,
    navigateTo,
    searchQuery,
    setSearchQuery,
    settings,
    isCatalogLoading,
    storeDataErrors,
    reloadStoreData,
  } = useToccoStore();

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
    <div id="shop-catalog-page" className="pt-20 sm:pt-28 pb-16 sm:pb-24 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Editorial Header */}
        <div className="py-6 sm:py-12 border-b border-[#EAE4DC] space-y-2 sm:space-y-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.3em] font-medium text-[#B85D38]">
            CATALOG
          </span>
          <h1 className="text-2xl sm:text-5xl font-normal tracking-tight text-[#1C1A19]">
            Our Products
          </h1>
        </div>

        {/* Search Bar */}
        <div className="pt-4 sm:pt-6">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pieces, subcategories, mineral finishes..."
              className="w-full bg-white border border-[#D8CEBF] rounded-full px-4 py-2.5 pl-10 text-xs sm:text-sm text-[#1C1A19] placeholder-[#8F8880] focus:outline-none focus:border-[#643D26]"
            />
            <Search className="w-4 h-4 text-[#736B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-wider text-[#736B63] hover:text-[#1C1A19]"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="py-4 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-[#EAE4DC]">
          {/* Category Chips - smooth touch scrolling */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#1C1A19] text-white'
                  : 'bg-[#EFEBE3] text-[#524B45] hover:bg-[#E5DFD4]'
              }`}
            >
              All Objects ({products.filter((p) => p.isPublished).length})
            </button>

            {visibleCategories.map((cat) => {
              const count = products.filter((p) => p.categoryId === cat.id && p.isPublished).length;
              const isSelected = activeCategoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#1C1A19] text-white'
                      : 'bg-[#EFEBE3] text-[#524B45] hover:bg-[#E5DFD4]'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto bg-[#FAF8F5] border border-[#D8CEBF] text-[11px] sm:text-xs uppercase tracking-wider text-[#1C1A19] rounded-full px-3 py-2 focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Releases</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active search banner if query present */}
        {searchError && (
          <div role="alert" className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2.5 text-xs text-rose-900">
            <span>Search could not be completed: {searchError}</span>
            <button
              type="button"
              onClick={() => setSearchRetryVersion((version) => version + 1)}
              className="shrink-0 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {searchQuery && (
          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg bg-[#F2EDE4] flex items-center justify-between text-xs text-[#524B45]">
            <span>
              {isSearching
                ? 'Searching...'
                : `Matching \u201C${searchQuery}\u201D (${filteredProducts.length} pieces)`}
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="font-medium text-[#B85D38] hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Products Grid: 2 columns on mobile, 3 columns on desktop */}
        {isCatalogLoading && products.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16 text-center" role="status" aria-live="polite">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#D8CEBF] border-t-[#643D26]" aria-hidden="true" />
            <p className="text-xs uppercase tracking-wider text-[#736B63]">Loading the catalog...</p>
          </div>
        ) : storeDataErrors.catalog && products.length === 0 ? (
          <div role="alert" className="my-8 rounded-xl border border-rose-200 bg-white p-8 text-center">
            <p className="text-sm font-medium text-[#1C1A19]">The catalog could not be loaded.</p>
            <p className="mt-2 text-xs text-[#736B63]">{storeDataErrors.catalog}</p>
            <button type="button" onClick={() => void reloadStoreData()} className="mt-4 rounded-full bg-[#1C1A19] px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-white">
              Retry catalog
            </button>
          </div>
        ) : isSearchWaitingForCurrentQuery ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 py-16 text-center" role="status" aria-live="polite">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#D8CEBF] border-t-[#643D26]" aria-hidden="true" />
            <p className="text-xs uppercase tracking-wider text-[#736B63]">Searching the catalog...</p>
          </div>
        ) : searchError && filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#736B63]">Search could not be completed. Retry the search above.</div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 sm:py-24 text-center space-y-4">
            <p className="text-base sm:text-lg text-[#1C1A19] font-medium">No design pieces found</p>
            <p className="text-xs sm:text-sm text-[#736B63] max-w-sm mx-auto font-light">
              Try adjusting your category filters or search to explore our available objects.
            </p>
            <button
              onClick={() => {
                setActiveCategoryFilter('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-widest font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 pt-6 sm:pt-10">
            {filteredProducts.map((product) => {
              const productSubcategories = subcategories
                .filter((subcategory) => product.subcategoryIds.includes(String(subcategory.id)))
                .map((subcategory) => subcategory.name);
              const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
                `Hello Tocco House, I am interested in inquiring about the "${product.name}".`
              )}`;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col bg-[#FAF8F5] rounded-xl sm:rounded-2xl overflow-hidden border border-[#EAE4DC] hover:shadow-[0_12px_40px_rgba(40,25,15,0.07)] transition-all duration-300"
                >
                  {/* Image Presentation */}
                  <button
                    type="button"
                    aria-label={`View ${product.name}`}
                    onClick={() => navigateTo('product', { productId: product.id })}
                    className="relative aspect-[4/5] w-full bg-[#EFEBE3] overflow-hidden text-left"
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1">
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/90 backdrop-blur-sm text-[8px] sm:text-[10px] uppercase tracking-wider text-[#524B45] font-medium shadow-2xs">
                        {product.deliveryDays ? `${product.deliveryDays} days` : product.leadTime}
                      </span>
                    </div>

                  </button>

                  {/* Product Info Block */}
                  <div className="p-3 sm:p-6 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
                    <div className="space-y-1 sm:space-y-2">
                      {/* Available Colors Palette Swatches */}
                      <div className="flex items-center gap-1">
                        {product.colors.slice(0, 3).map((c) => (
                          <span
                            key={c.id}
                            title={c.name}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/15 shadow-2xs inline-block"
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-[9px] sm:text-[10px] text-[#8F8880] font-mono">
                            +{product.colors.length - 3}
                          </span>
                        )}
                        <span className="text-[9px] sm:text-[11px] text-[#8F8880] ml-1 sm:ml-2 truncate">
                          {product.finishes[0]}
                        </span>
                      </div>

                      <h3 className="line-clamp-1">
                        <button
                          type="button"
                          onClick={() => navigateTo('product', { productId: product.id })}
                          className="text-left text-xs sm:text-lg font-normal text-[#1C1A19] group-hover:text-[#643D26] transition-colors"
                        >
                          {product.name}
                        </button>
                      </h3>
                      {productSubcategories.length > 0 && (
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-[#B85D38] line-clamp-1">
                          {productSubcategories.join(', ')}
                        </p>
                      )}

                      <p className="text-[11px] sm:text-xs text-[#736B63] line-clamp-2 font-light leading-relaxed hidden sm:block">
                        {product.description}
                      </p>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="pt-2 sm:pt-4 border-t border-[#EAE4DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex flex-col">
                          <span className="text-xs sm:text-base font-semibold text-[#1C1A19]">
                            {product.price?.toLocaleString()} EGP
                          </span>
                          <span className="text-[8px] sm:text-[10px] text-[#8F8880]">
                            Deposit: {Math.round((product.price || 0) * settings.depositPercentage / 100).toLocaleString()} EGP
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigateTo('product', { productId: product.id })}
                        className="w-full sm:w-auto text-center px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#D8CEBF] text-[9px] sm:text-[11px] uppercase tracking-wider font-medium text-[#1C1A19] hover:bg-[#1C1A19] hover:text-white hover:border-[#1C1A19] transition-all"
                      >
                        View Piece
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
