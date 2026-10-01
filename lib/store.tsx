'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Product,
  Category,
  Order,
  EventItem,
  ProjectItem,
  StoreSettings,
  CartItem,
  CustomerUser,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  BannerItem,
} from '@/types';
import { BackendOrder } from '@/types/order';
import { productService } from '@/lib/api/services/productService';
import { productImageService } from '@/lib/api/services/productImageService';
import { categoryService, subcategoryService } from '@/lib/api/services/categoryService';
import { cartService } from '@/lib/api/services/cartService';
import { orderService } from '@/lib/api/services/orderService';
import { ApiError, normalizeApiError } from '@/lib/api/errors';
import { transferGuestCartItems } from '@/lib/guestCartSync';
import {
  getGuestCart,
  addGuestCartItem,
  removeGuestCartItem,
  updateGuestCartItemQuantity,
  removeGuestCartItems,
  clearGuestCart,
  isGuestCartItemId,
} from '@/lib/guestCart';
import { BackendProduct, BackendProductImage } from '@/types/product';
import { BackendCategory, BackendSubcategory } from '@/types/category';
import { BackendCartItem } from '@/types/cart';
import { eventService } from '@/lib/api/services/eventService';
import { dashboardService } from '@/lib/api/services/dashboardService';
import { collaborationService } from '@/lib/api/services/collaborationService';
import { BackendEvent } from '@/types/event';
import { BackendCollaboration } from '@/types/collaboration';
import { spaceProjectService } from '@/lib/api/services/spaceProjectService';
import { BackendSpaceProject, SpaceProjectRequest } from '@/types/spaceProject';

const EMPTY_SETTINGS: StoreSettings = {
  brandName: 'Modern Home',
  tagline: 'للأثاث والديكور العصري',
  subTagline: 'مودرن هوم',
  depositPercentage: 50,
  defaultLeadTime: 'حسب الطلب',
  defaultShippingTime: 'تُؤكد تفاصيل التوصيل بعد مراجعة الطلب',
  contact: {
    phone: '01080182663',
    whatsapp: '01080182663',
    email: '',
    atelierAddress: 'القاهرة الجديدة، القاهرة، مصر',
    mapUrl: 'https://www.google.com/maps/place/30%C2%B003%2700.6%22N+31%C2%B027%2720.0%22E/@30.0501537,31.4529839,17z/data=!3m1!4b1!4m4!3m3!8m2!3d30.0501537!4d31.4555588?hl=en&entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D',
    instagramHandles: [],
    hours: 'الزيارة بموعد مسبق',
  },
  paymentMethods: {
    instapay: { active: false, address: '', accountName: '', instructions: 'InstaPay details will appear here once configured.' },
    mobileWallet: { active: false, number: '', provider: '', instructions: 'Mobile wallet details will appear here once configured.' },
    vodafoneCash: { active: false, number: '', instructions: 'Vodafone Cash details will appear here once configured.' },
    bankTransfer: {
      active: false,
      bankName: 'Bank details coming soon',
      accountNumber: 'Account number coming soon',
      iban: 'IBAN coming soon',
      swift: '',
      accountHolder: 'Account name coming soon',
      instructions: 'Bank transfer details will be confirmed by our team.',
    },
  },
  homepage: {
    heroHeading: 'أثاث يصنع للمكان شخصية',
    heroSubheading: 'تصميمات عصرية، قطع مختارة، وتنفيذ يراعي تفاصيل بيتك.',
    heroCtaText: 'اكتشف المجموعة',
    heroImage: '/images/hero_villa_clean.jpg',
    storyQuote: 'نصنع مساحة تشبهك',
    storySubtext: 'أثاث يكمّل روح المكان.',
  },
  policies: { shipping: '', returns: '', privacy: '', terms: '', faq: [] },
};

export function mapBackendProduct(product: BackendProduct, subcategories: BackendSubcategory[] = []): Product {
  const subcategoryIds = product.subcategory_ids.map((id) => String(id));
  const primarySubcategory = subcategories.find((subcategory) => subcategory.id === product.subcategory_ids[0]);
  const categoryId = primarySubcategory?.category_id
    ? String(primarySubcategory.category_id)
    : '';
  const imageRecords = product.images
    .map((image: BackendProductImage, index) => ({
      image: image.image,
      public_id: image.public_id,
      is_primary: image.is_primary,
      sort_order: image.sort_order ?? index,
    }))
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);

  return {
    id: String(product.id),
    slug: String(product.id),
    name: product.name,
    categoryId,
    subcategoryIds,
    description: product.description,
    price: Number(product.price),
    images: imageRecords.map((image) => image.image),
    imageRecords,
    dimensions: product.dimensions,
    deliveryDays: product.delivery_days,
    material: product.material,
    finishes: product.finish || [],
    colors: product.colors.map((color) => ({ id: String(color.id), name: color.name, hex: color.hex_code })),
    sizes: [],
    faq: product.faq || [],
    leadTime: product.delivery_days ? `${product.delivery_days} days` : EMPTY_SETTINGS.defaultLeadTime,
    shippingTime: '',
    isFeatured: product.featured,
    isPublished: !product.deleted_at,
    inStock: true,
    allowsCustomization: false,
    createdAt: product.created_at,
    seoTitle: product.name,
    seoDescription: product.description,
  };
}

function mapBackendCategory(category: BackendCategory): Category {
  return {
    id: String(category.id),
    name: category.name,
    slug: String(category.id),
    description: '',
    image: category.image || '',
    isFeatured: false,
    displayOrder: category.id,
    isVisible: true,
  };
}

function mapBackendEvent(event: BackendEvent): EventItem {
  const eventDate = new Date(`${event.event_date}T00:00:00`);
  const isUpcoming = eventDate.getTime() >= Date.now();
  return {
    id: String(event.id),
    title: event.title,
    subtitle: '',
    description: event.description || '',
    location: '',
    city: '',
    date: event.event_date,
    time: undefined,
    coverImage: event.image,
    publicId: event.public_id,
    status: isUpcoming ? 'upcoming' : 'past',
    isUpcoming,
  };
}

function mapBackendSpaceProject(project: BackendSpaceProject): ProjectItem {
  const createdYear = new Date(project.created_at).getFullYear();
  return {
    id: String(project.id),
    title: project.customer_name || 'مساحة من بيوتنا',
    subtitle: project.product_name || 'تنفيذ مودرن هوم',
    description: project.caption || '',
    location: project.location || '',
    coverImage: project.image,
    gallery: [],
    productsUsed: project.product_name ? [project.product_name] : [],
    featuredPieces: project.product_name ? [project.product_name] : [],
    year: Number.isNaN(createdYear) ? '' : String(createdYear),
    customerName: project.customer_name,
    publicId: project.public_id,
    productId: project.product_id ? String(project.product_id) : undefined,
  };
}

function mapBackendCartItem(item: BackendCartItem, products: Product[] = []): CartItem {
  const product = products.find((p) => p.id === String(item.product_id));
  return {
    id: String(item.id),
    productId: String(item.product_id),
    productName: item.product_name,
    productImage: product?.images[0] || '',
    unitPrice: Number(item.product_price),
    selectedFinish: item.selected_finish || product?.finishes[0] || 'MATTE',
    selectedColor: item.color_id
      ? { id: String(item.color_id), name: item.color_name || '', hex: item.color_hex_code || '#000000' }
      : { id: '', name: '', hex: '#000000' },
    quantity: item.quantity,
    subtotal: item.subtotal !== undefined ? Number(item.subtotal) : undefined,
    originalSubtotal: item.original_subtotal !== undefined ? Number(item.original_subtotal) : undefined,
    discountAmount: item.discount_amount !== undefined ? Number(item.discount_amount) : undefined,
    offerName: item.offer?.name,
  };
}

export type AppView =
  | 'home'
  | 'shop'
  | 'product'
  | 'custom-design'
  | 'imported'
  | 'b2b'
  | 'our-story'
  | 'events'
  | 'projects'
  | 'cart'
  | 'checkout'
  | 'confirmation'
  | 'account'
  | 'shipping'
  | 'returns'
  | 'faq'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'admin';

const APP_VIEWS = new Set<AppView>([
  'home', 'shop', 'product', 'custom-design', 'imported', 'b2b', 'our-story', 'events', 'projects',
  'cart', 'checkout', 'confirmation', 'account', 'shipping', 'returns', 'faq', 'contact',
  'privacy', 'terms', 'admin',
]);

function isAppView(value: string | null): value is AppView {
  return value !== null && APP_VIEWS.has(value as AppView);
}

function parseAppLocation(url: URL): { view: AppView; productId: string | null; categoryId: string | null; openCart: boolean } {
  const requestedView = url.searchParams.get('route');
  const productId = url.searchParams.get('product');
  const openCart = requestedView === 'cart';
  const view: AppView = productId
    ? 'product'
    : openCart
      ? 'home'
      : isAppView(requestedView)
        ? requestedView
        : 'home';

  return {
    view,
    productId: view === 'product' ? productId : null,
    categoryId: view === 'shop' ? url.searchParams.get('category') : null,
    openCart,
  };
}

export type StoreDataKey = 'catalog' | 'cart' | 'events' | 'projects' | 'collaborations' | 'settings';
export type StoreDataErrors = Record<StoreDataKey, string | null>;

const EMPTY_STORE_DATA_ERRORS: StoreDataErrors = {
  catalog: null,
  cart: null,
  events: null,
  projects: null,
  collaborations: null,
  settings: null,
};

interface StoreContextType {
  // Navigation & View
  activeView: AppView;
  selectedProductId: string | null;
  selectedCategoryId: string | null;
  searchQuery: string;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  navigateTo: (
    view: AppView,
    options?: { productId?: string; categoryId?: string }
  ) => void;
  setSearchQuery: (query: string) => void;

  // Data
  products: Product[];
  categories: Category[];
  subcategories: BackendSubcategory[];
  orders: Order[];
  events: EventItem[];
  projects: ProjectItem[];
  banners: BannerItem[];
  collaborations: BackendCollaboration[];
  settings: StoreSettings;
  isCatalogLoading: boolean;
  isEventsLoading: boolean;
  isProjectsLoading: boolean;
  storeDataErrors: StoreDataErrors;
  reloadStoreData: () => Promise<void>;
  reloadDashboardSettings: () => Promise<void>;
  cart: CartItem[];
  user: CustomerUser | null;
  lastCreatedOrder: (BackendOrder & { clientPaymentMethod?: PaymentMethod }) | Order | null;
  setLastCreatedOrder: (order: (BackendOrder & { clientPaymentMethod?: PaymentMethod }) | Order | null) => void;

  // Cart operations
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncGuestCart: () => Promise<boolean>;
  isGuestCartSyncing: boolean;
  cartSyncError: string | null;
  forgetAuthenticatedCart: () => void;
  clearCartAfterOrder: () => void;
  cartSubtotal: number;
  cartDepositAmount: number;
  cartRemainingAmount: number;
  cartItemsCount: number;
  cartOriginalTotal: number;
  cartDiscountTotal: number;
  cartFreeShipping: boolean;

  // Checkout & Orders
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  submitPaymentProof: (orderId: string, proofNote: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;

  // Admin CRUD operations
  saveProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleProductFeatured: (productId: string) => Promise<void>;
  saveCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;

  saveEvent: (event: EventItem) => void;
  deleteEvent: (eventId: string) => void;

  saveProject: (project: ProjectItem) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;

  saveBanner: (banner: BannerItem) => void;
  deleteBanner: (bannerId: string) => void;
  toggleBannerActive: (bannerId: string) => void;

  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // User auth & profile
  loginUser: (email: string, fullName: string, phone: string) => void;
  logoutUser: () => void;
  saveUserAddress: (address: CustomerUser['savedAddresses'][0]) => void;
  deleteUserAddress: (addressId: string) => void;

  // Helper getters
  getProductById: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getCategoryById: (id: string) => Category | undefined;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Navigation
  const [activeView, setActiveView] = useState<AppView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const selectedProductIdRef = useRef<string | null>(null);
  const selectedCategoryIdRef = useRef<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  // Entities
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<BackendSubcategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [collaborations, setCollaborations] = useState<BackendCollaboration[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(EMPTY_SETTINGS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hasBackendCart, setHasBackendCart] = useState(false);
  const [isGuestCartSyncing, setIsGuestCartSyncing] = useState(false);
  const [cartSyncError, setCartSyncError] = useState<string | null>(null);
  const guestCartSyncPromise = useRef<Promise<boolean> | null>(null);
  const [cartPricing, setCartPricing] = useState({
    originalTotal: 0,
    discountTotal: 0,
    total: 0,
    freeShipping: false,
  });
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<(BackendOrder & { clientPaymentMethod?: PaymentMethod }) | Order | null>(null);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [storeDataErrors, setStoreDataErrors] = useState<StoreDataErrors>(EMPTY_STORE_DATA_ERRORS);
  const storeDataLoadVersion = useRef(0);
  const dashboardSettingsRequestVersion = useRef(0);

  const reloadDashboardSettings = useCallback(async (isCurrentRequest: () => boolean = () => true) => {
    const requestVersion = ++dashboardSettingsRequestVersion.current;
    const isCurrentSettingsRequest = () =>
      requestVersion === dashboardSettingsRequestVersion.current && isCurrentRequest();
    try {
      const data = await dashboardService.getSettings();
      if (!isCurrentSettingsRequest()) return;
      setSettings((current) => ({
        ...current,
        depositPercentage: Number(data.deposit_percentage),
        paymentMethods: {
          ...current.paymentMethods,
          mobileWallet: {
            ...current.paymentMethods.mobileWallet,
            number: data.payment_wallets.mobile_wallet || current.paymentMethods.mobileWallet.number,
          },
          instapay: {
            ...current.paymentMethods.instapay,
            address: data.payment_wallets.instapay || current.paymentMethods.instapay.address,
          },
          vodafoneCash: {
            ...current.paymentMethods.vodafoneCash,
            number: data.payment_wallets.vodafone_cash || current.paymentMethods.vodafoneCash.number,
          },
        },
      }));
      setStoreDataErrors((current) => ({ ...current, settings: null }));
    } catch (err) {
      if (!isCurrentSettingsRequest()) return;
      if (err instanceof ApiError && err.status === 401) {
        setStoreDataErrors((current) => ({ ...current, settings: null }));
        return;
      }
      setStoreDataErrors((current) => ({
        ...current,
        settings: normalizeApiError(err).message,
      }));
    }
  }, []);

  const reloadStoreData = useCallback(async () => {
    const requestVersion = ++storeDataLoadVersion.current;
    const isCurrentRequest = () => requestVersion === storeDataLoadVersion.current;
    let mappedCatalogProducts: Product[] = [];
    const setLoadError = (key: StoreDataKey, error: unknown) => {
      if (!isCurrentRequest()) return;
      setStoreDataErrors((current) => ({
        ...current,
        [key]: normalizeApiError(error).message,
      }));
    };

    setStoreDataErrors(EMPTY_STORE_DATA_ERRORS);
    setIsCatalogLoading(true);
    setIsEventsLoading(true);
    setIsProjectsLoading(true);

    const catalogLoad = (async () => {
      try {
        const [backendProducts, backendCategories, backendSubcategories] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
          subcategoryService.getSubcategories(),
        ]);
        if (!isCurrentRequest()) return;

        mappedCatalogProducts = backendProducts.map((product) => mapBackendProduct(product, backendSubcategories));
        setSubcategories(backendSubcategories);
        setProducts(mappedCatalogProducts);
        setCategories(backendCategories.map(mapBackendCategory));
      } catch (err) {
        setLoadError('catalog', err);
      } finally {
        if (isCurrentRequest()) setIsCatalogLoading(false);
      }

      if (!isCurrentRequest()) return;
      try {
        const backendCart = await cartService.getCart();
        if (!isCurrentRequest()) return;
        setHasBackendCart(true);
        setCart([
          ...backendCart.items.map((item) => mapBackendCartItem(item, mappedCatalogProducts)),
          ...getGuestCart(),
        ]);
        setCartPricing({
          originalTotal: Number(backendCart.original_total),
          discountTotal: Number(backendCart.discount_amount),
          total: Number(backendCart.total_price),
          freeShipping: backendCart.free_shipping,
        });
      } catch (err) {
        if (!isCurrentRequest()) return;
        if (err instanceof ApiError && err.status === 401) {
          setHasBackendCart(false);
          setCart(getGuestCart());
          setCartPricing({ originalTotal: 0, discountTotal: 0, total: 0, freeShipping: false });
        } else {
          setLoadError('cart', err);
        }
      }
    })();

    const eventsLoad = eventService.getEvents()
      .then((items) => {
        if (isCurrentRequest()) setEvents(items.map(mapBackendEvent));
      })
      .catch((err) => setLoadError('events', err))
      .finally(() => {
        if (isCurrentRequest()) setIsEventsLoading(false);
      });

    const collaborationsLoad = collaborationService.getCollaborations()
      .then((items) => {
        if (isCurrentRequest()) setCollaborations(items);
      })
      .catch((err) => setLoadError('collaborations', err));

    const projectsLoad = spaceProjectService.getProjects()
      .then((items) => {
        if (isCurrentRequest()) setProjects(items.map(mapBackendSpaceProject));
      })
      .catch((err) => setLoadError('projects', err))
      .finally(() => {
        if (isCurrentRequest()) setIsProjectsLoading(false);
      });

    const settingsLoad = reloadDashboardSettings(isCurrentRequest);

    await Promise.all([catalogLoad, eventsLoad, collaborationsLoad, projectsLoad, settingsLoad]);
  }, [reloadDashboardSettings]);

  useEffect(() => {
    const timer = window.setTimeout(() => void reloadStoreData(), 0);
    return () => {
      window.clearTimeout(timer);
      storeDataLoadVersion.current += 1;
    };
  }, [reloadStoreData]);

  useEffect(() => {
    const syncFromLocation = () => {
      const location = parseAppLocation(new URL(window.location.href));
      selectedProductIdRef.current = location.productId;
      selectedCategoryIdRef.current = location.categoryId;
      setActiveView(location.view);
      setSelectedProductId(location.productId);
      setSelectedCategoryId(location.categoryId);
      setIsCartDrawerOpen(location.openCart);
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, []);

  // Navigation action
  const navigateTo = useCallback(
    (
      view: AppView,
      options?: { productId?: string; categoryId?: string }
    ) => {
      setActiveView(view);
      if (options?.productId !== undefined) {
        selectedProductIdRef.current = options.productId;
        setSelectedProductId(options.productId);
      }
      if (options?.categoryId !== undefined) {
        selectedCategoryIdRef.current = options.categoryId;
        setSelectedCategoryId(options.categoryId);
      }

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        const productId = options?.productId ?? selectedProductIdRef.current;
        const categoryId = options?.categoryId ?? selectedCategoryIdRef.current;

        if (view === 'home') {
          url.searchParams.delete('route');
        } else {
          url.searchParams.set('route', view);
        }

        if (view === 'product' && productId) {
          url.searchParams.set('product', productId);
        } else {
          url.searchParams.delete('product');
        }

        if (view === 'shop' && categoryId) {
          url.searchParams.set('category', categoryId);
        } else {
          url.searchParams.delete('category');
        }

        window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    []
  );

  // Cart logic
  const refreshCart = useCallback(async () => {
    const backendCart = await cartService.getCart();
    setHasBackendCart(true);
    setCart([
      ...backendCart.items.map((item) => mapBackendCartItem(item, products)),
      ...getGuestCart(),
    ]);
    setCartPricing({
      originalTotal: Number(backendCart.original_total),
      discountTotal: Number(backendCart.discount_amount),
      total: Number(backendCart.total_price),
      freeShipping: backendCart.free_shipping,
    });
  }, [products]);

  const addToCart = useCallback(async (itemData: Omit<CartItem, 'id'>) => {
    if (guestCartSyncPromise.current) {
      await guestCartSyncPromise.current;
    }

    const productId = Number(itemData.productId);
    const colorId = itemData.selectedColor.id ? Number(itemData.selectedColor.id) : null;
    if (!Number.isInteger(productId)) {
      throw new Error('This product is unavailable. Please refresh the page and try again.');
    }

    try {
      await cartService.addItem({
        product_id: productId,
        selected_color_id: Number.isInteger(colorId) ? colorId : null,
        selected_finish: itemData.selectedFinish || null,
        quantity: itemData.quantity,
      });
      await refreshCart();
    } catch (err) {
      // Not signed in: keep the item in a local guest cart instead of losing it.
      // It gets pushed to the real backend cart once the user signs in (syncGuestCart).
      if (err instanceof ApiError && err.status === 401) {
        setHasBackendCart(false);
        setCartPricing({ originalTotal: 0, discountTotal: 0, total: 0, freeShipping: false });
        setCart(addGuestCartItem(itemData));
      } else {
        throw err;
      }
    }

    setIsCartDrawerOpen(true);
  }, [refreshCart]);

  const removeFromCart = useCallback(async (cartItemId: string) => {
    if (isGuestCartItemId(cartItemId)) {
      const guestItems = removeGuestCartItem(cartItemId);
      setCart((current) => [
        ...current.filter((item) => !isGuestCartItemId(item.id)),
        ...guestItems,
      ]);
      return;
    }
    await cartService.removeItem(Number(cartItemId));
    await refreshCart();
  }, [refreshCart]);

  const updateCartQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    if (isGuestCartItemId(cartItemId)) {
      const guestItems = updateGuestCartItemQuantity(cartItemId, quantity);
      setCart((current) => [
        ...current.filter((item) => !isGuestCartItemId(item.id)),
        ...guestItems,
      ]);
      return;
    }
    if (quantity <= 0) {
      await cartService.removeItem(Number(cartItemId));
    } else {
      await cartService.updateItem(Number(cartItemId), { quantity });
    }
    await refreshCart();
  }, [refreshCart]);

  const clearCart = useCallback(async () => {
    if (hasBackendCart) await cartService.clearCart();
    clearGuestCart();
    setCart([]);
    setCartPricing({ originalTotal: 0, discountTotal: 0, total: 0, freeShipping: false });
  }, [hasBackendCart]);

  const clearCartAfterOrder = useCallback(() => {
    clearGuestCart();
    setCart([]);
    setCartPricing({ originalTotal: 0, discountTotal: 0, total: 0, freeShipping: false });
    setHasBackendCart(true);
    setCartSyncError(null);
  }, []);

  const forgetAuthenticatedCart = useCallback(() => {
    setHasBackendCart(false);
    setCart(getGuestCart());
    setCartPricing({ originalTotal: 0, discountTotal: 0, total: 0, freeShipping: false });
    setCartSyncError(null);
  }, []);

  // Keep failed items locally and only remove an item after a backend cart read confirms
  // that the synchronization pass completed against the authenticated cart.
  const syncGuestCart = useCallback((): Promise<boolean> => {
    if (guestCartSyncPromise.current) return guestCartSyncPromise.current;

    const syncPromise = (async () => {
      const guestItems = getGuestCart();
      if (guestItems.length === 0) {
        setCartSyncError(null);
        return true;
      }

      setIsGuestCartSyncing(true);
      setCartSyncError(null);

      try {
        const outcome = await transferGuestCartItems(
          guestItems,
          (item) => {
          const productId = Number(item.productId);
          if (!Number.isInteger(productId)) {
              throw new Error('This product is unavailable. Please refresh the page and try again.');
          }

          const colorId = item.selectedColor.id ? Number(item.selectedColor.id) : null;
            return cartService.addItem({
              product_id: productId,
              selected_color_id: Number.isInteger(colorId) ? colorId : null,
              selected_finish: item.selectedFinish || null,
              quantity: item.quantity,
            });
          },
          () => cartService.getCart(),
          (err) => err instanceof ApiError && (err.status === 401 || err.status === 403)
        );

        if (outcome.authenticationFailed) {
          setHasBackendCart(false);
          setCart(getGuestCart());
          setCartPricing({ originalTotal: 0, discountTotal: 0, total: 0, freeShipping: false });
          setCartSyncError('Your bag is still saved on this device. Sign in again, then retry the transfer.');
          return false;
        }

        const backendCart = outcome.backendCart;
        if (!backendCart) throw new Error('We could not confirm your bag. Please try again.');
        const backendItems = backendCart.items.map((item) => mapBackendCartItem(item, products));
        const remainingGuestItems = removeGuestCartItems(outcome.syncedItemIds);

        setHasBackendCart(true);
        setCart([...backendItems, ...remainingGuestItems]);
        setCartPricing({
          originalTotal: Number(backendCart.original_total),
          discountTotal: Number(backendCart.discount_amount),
          total: Number(backendCart.total_price),
          freeShipping: backendCart.free_shipping,
        });

        if (remainingGuestItems.length > 0) {
          setCartSyncError('Some bag items could not be transferred. They remain saved in your bag; retry or remove unavailable items before checkout.');
          return false;
        }

        setCartSyncError(null);
        return true;
      } catch (err) {
        setHasBackendCart(false);
        setCart(getGuestCart());
        setCartPricing({ originalTotal: 0, discountTotal: 0, total: 0, freeShipping: false });
        setCartSyncError(normalizeApiError(err).message);
        return false;
      } finally {
        setIsGuestCartSyncing(false);
      }
    })();

    guestCartSyncPromise.current = syncPromise;
    void syncPromise.then(
      () => {
        if (guestCartSyncPromise.current === syncPromise) guestCartSyncPromise.current = null;
      },
      () => {
        if (guestCartSyncPromise.current === syncPromise) guestCartSyncPromise.current = null;
      }
    );
    return syncPromise;
  }, [products]);

  // Cart calculations
  // The backend total includes offer pricing; unsynced local items are added separately.
  const localGuestSubtotal = cart
    .filter((item) => isGuestCartItemId(item.id))
    .reduce((sum, item) => sum + (item.subtotal ?? item.unitPrice * item.quantity), 0);
  const cartSubtotal = hasBackendCart
    ? cartPricing.total + localGuestSubtotal
    : cart.reduce((sum, item) => sum + (item.subtotal ?? item.unitPrice * item.quantity), 0);
  const depositRatio = settings.depositPercentage / 100;
  const cartDepositAmount = Math.round(cartSubtotal * depositRatio);
  const cartRemainingAmount = cartSubtotal - cartDepositAmount;
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Order creation
  const createOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
      const orderNumber = `TH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newOrder: Order = {
        ...orderData,
        id: `ord-${Date.now()}`,
        orderNumber,
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [newOrder, ...prev]);
      setLastCreatedOrder(newOrder);
      setCart([]); // Clear cart after placing order
      return newOrder;
    },
    []
  );

  const submitPaymentProof = useCallback((orderId: string, proofNote: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updated: Order = {
            ...ord,
            paymentStatus: 'proof_submitted',
            orderStatus: 'proof_submitted',
            paymentProofNote: proofNote,
            paymentProofDate: new Date().toISOString(),
          };
          if (lastCreatedOrder?.id === orderId) {
            setLastCreatedOrder(updated);
          }
          return updated;
        }
        return ord;
      })
    );
  }, [lastCreatedOrder]);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, orderStatus: status } : ord))
    );
  }, []);

  const updatePaymentStatus = useCallback((orderId: string, status: PaymentStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          let updatedOrderStatus = ord.orderStatus;
          if (status === 'payment_verified' && ord.orderStatus === 'proof_submitted') {
            updatedOrderStatus = 'payment_verified';
          }
          return {
            ...ord,
            paymentStatus: status,
            orderStatus: updatedOrderStatus,
          };
        }
        return ord;
      })
    );
  }, []);

  // Admin CRUD for Products
  const saveProduct = useCallback(async (productToSave: Product) => {
    const subcategoryIds = productToSave.subcategoryIds
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id));
    const colorIds = productToSave.colors
      .map((color) => Number(color.id))
      .filter((id) => Number.isInteger(id));

    const payload = {
      name: productToSave.name.trim(),
      description: productToSave.description.trim(),
      dimensions: productToSave.dimensions.trim(),
      price: productToSave.price || 0,
      delivery_days: productToSave.deliveryDays ?? null,
      material: productToSave.material.trim(),
      finish: productToSave.finishes,
      faq: (productToSave.faq || []).filter((item) => item.question.trim() || item.answer.trim()),
      subcategory_ids: subcategoryIds,
      color_ids: colorIds,
      featured: productToSave.isFeatured,
    };
    const productId = Number(productToSave.id);
    let saved = Number.isInteger(productId)
      ? await productService.updateProduct(productId, payload)
      : await productService.createProduct(payload);

    if (!Number.isInteger(productId) && productToSave.images.length > 0) {
      const createdImages = await Promise.all(
        productToSave.images.map((imageUrl, index) => {
          const imageRecord = productToSave.imageRecords?.find((record) => record.image === imageUrl);
          return productImageService.createProductImage({
            product: saved.id,
            image: imageUrl,
            public_id: imageRecord?.public_id || '',
            is_primary: index === 0,
            sort_order: index,
          });
        })
      );
      saved = {
        ...saved,
        images: createdImages,
      };
    }

    const mapped = mapBackendProduct(saved, subcategories);
    setProducts((prev) => {
      const exists = prev.some((product) => product.id === mapped.id);
      return exists ? prev.map((product) => (product.id === mapped.id ? mapped : product)) : [mapped, ...prev];
    });
  }, [subcategories]);

  const deleteProduct = useCallback(async (productId: string) => {
    const numericId = Number(productId);
    if (!Number.isInteger(numericId)) throw new Error('This product is unavailable. Please refresh the page and try again.');
    await productService.deleteProduct(numericId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const toggleProductFeatured = useCallback(async (productId: string) => {
    const product = products.find((item) => item.id === productId);
    const numericId = Number(productId);
    if (!product || !Number.isInteger(numericId)) throw new Error('This product is unavailable. Please refresh the page and try again.');

    const nextFeatured = !product.isFeatured;
    const saved = await productService.updateProduct(numericId, { featured: nextFeatured });
    const mapped = mapBackendProduct(saved, subcategories);
    setProducts((prev) => prev.map((item) => (item.id === productId ? mapped : item)));
  }, [products, subcategories]);

  // Admin CRUD for Categories
  const saveCategory = useCallback(async (categoryToSave: Category) => {
    const payload = { name: categoryToSave.name, image: categoryToSave.image || null };
    const categoryId = Number(categoryToSave.id);
    const saved = Number.isInteger(categoryId)
      ? await categoryService.updateCategory(categoryId, payload)
      : await categoryService.createCategory(payload);
    const mapped = mapBackendCategory(saved);
    setCategories((prev) => {
      const exists = prev.some((category) => category.id === mapped.id);
      return exists ? prev.map((category) => (category.id === mapped.id ? mapped : category)) : [...prev, mapped];
    });
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    const numericId = Number(categoryId);
    if (!Number.isInteger(numericId)) throw new Error('This category is unavailable. Please refresh the page and try again.');
    await categoryService.deleteCategory(numericId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  }, []);

  // Admin CRUD for Events
  const saveEvent = useCallback(async (eventToSave: EventItem) => {
    const eventId = Number(eventToSave.id);
    const payload = {
      title: eventToSave.title,
      description: eventToSave.description,
      image: eventToSave.coverImage,
      public_id: eventToSave.publicId || '',
      event_date: eventToSave.date,
    };
    if (!payload.public_id) {
      throw new Error('Upload the event image before saving the event.');
    }
    const saved = Number.isInteger(eventId)
      ? await eventService.updateEvent(eventId, payload)
      : await eventService.createEvent(payload);
    const mapped = mapBackendEvent(saved);
    setEvents((prev) => {
      const exists = prev.some((event) => event.id === mapped.id);
      return exists ? prev.map((event) => (event.id === mapped.id ? mapped : event)) : [mapped, ...prev];
    });
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    const numericId = Number(eventId);
    if (!Number.isInteger(numericId)) throw new Error('This event is unavailable. Please refresh the page and try again.');
    await eventService.deleteEvent(numericId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  // Admin CRUD for Projects
  const saveProject = useCallback(async (projectToSave: ProjectItem) => {
    const numericId = Number(projectToSave.id);
    const payload: SpaceProjectRequest = {
      customer_name: projectToSave.customerName || projectToSave.title,
      caption: projectToSave.description,
      location: projectToSave.location || '',
      image: projectToSave.coverImage,
      public_id: projectToSave.publicId || '',
      product_id: projectToSave.productId ? Number(projectToSave.productId) : null,
    };
    const saved = Number.isInteger(numericId)
      ? await spaceProjectService.updateProject(numericId, payload)
      : await spaceProjectService.createProject(payload);
    const mapped = mapBackendSpaceProject(saved);
    setProjects((prev) => {
      const exists = prev.some((project) => project.id === mapped.id);
      return exists ? prev.map((project) => (project.id === mapped.id ? mapped : project)) : [mapped, ...prev];
    });
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    const numericId = Number(projectId);
    if (!Number.isInteger(numericId)) throw new Error('This project is unavailable. Please refresh the page and try again.');
    await spaceProjectService.deleteProject(numericId);
    setProjects((prev) => prev.filter((project) => project.id !== projectId));
  }, []);

  // Banners CRUD
  const saveBanner = useCallback((bannerToSave: BannerItem) => {
    setBanners((prev) => {
      const exists = prev.some((b) => b.id === bannerToSave.id);
      if (exists) {
        return prev.map((b) => (b.id === bannerToSave.id ? bannerToSave : b));
      }
      return [bannerToSave, ...prev];
    });
  }, []);

  const deleteBanner = useCallback((bannerId: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== bannerId));
  }, []);

  const toggleBannerActive = useCallback((bannerId: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === bannerId ? { ...b, isActive: !b.isActive } : b))
    );
  }, []);

  // Settings
  const updateSettings = useCallback(async (newSettings: Partial<StoreSettings>) => {
    // PATCH merges by key: untouched wallet keys are left as-is server-side, so only send
    // keys that actually changed; a key cleared to '' is sent as `null` to delete it.
    let paymentWallets: Record<string, string | null> | undefined;
    if (newSettings.paymentMethods) {
      const candidates: Array<[string, string | undefined, string]> = [
        ['mobile_wallet', newSettings.paymentMethods.mobileWallet?.number, settings.paymentMethods.mobileWallet.number],
        ['vodafone_cash', newSettings.paymentMethods.vodafoneCash?.number, settings.paymentMethods.vodafoneCash.number],
        ['instapay', newSettings.paymentMethods.instapay?.address, settings.paymentMethods.instapay.address],
      ];
      const changed: Record<string, string | null> = {};
      for (const [key, next, current] of candidates) {
        if (next === undefined || next === current) continue;
        changed[key] = next.trim() === '' ? null : next.trim();
      }
      paymentWallets = Object.keys(changed).length > 0 ? changed : undefined;
    }

    const dashboardPatch = {
      deposit_percentage: newSettings.depositPercentage,
      payment_wallets: paymentWallets,
    };
    if (dashboardPatch.deposit_percentage === undefined && !dashboardPatch.payment_wallets) {
      return;
    }

    const saved = await dashboardService.updateSettings(dashboardPatch);
    setSettings((prev) => ({
      ...prev,
      depositPercentage: Number(saved.deposit_percentage),
      paymentMethods: {
        ...prev.paymentMethods,
        mobileWallet: {
          ...prev.paymentMethods.mobileWallet,
          number: saved.payment_wallets.mobile_wallet || '',
        },
        vodafoneCash: {
          ...prev.paymentMethods.vodafoneCash,
          number: saved.payment_wallets.vodafone_cash || '',
        },
        instapay: {
          ...prev.paymentMethods.instapay,
          address: saved.payment_wallets.instapay || '',
        },
      },
    }));
  }, [settings]);

  // User auth & profile
  const loginUser = useCallback((email: string, fullName: string, phone: string) => {
    const u: CustomerUser = {
      id: `usr-${Date.now()}`,
      fullName,
      email,
      phone,
      savedAddresses: [
        {
          id: 'addr-main',
          label: 'Primary Delivery Address',
          governorate: 'Cairo',
          city: 'New Cairo',
          street: 'Main District Boulevard',
          building: 'Villa 12',
        },
      ],
    };
    setUser(u);
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
  }, []);

  const saveUserAddress = useCallback((address: CustomerUser['savedAddresses'][0]) => {
    setUser((prev) => {
      if (!prev) return prev;
      const exists = prev.savedAddresses.some((a) => a.id === address.id);
      const updatedList = exists
        ? prev.savedAddresses.map((a) => (a.id === address.id ? address : a))
        : [...prev.savedAddresses, address];
      return { ...prev, savedAddresses: updatedList };
    });
  }, []);

  const deleteUserAddress = useCallback((addressId: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        savedAddresses: prev.savedAddresses.filter((a) => a.id !== addressId),
      };
    });
  }, []);

  // Helper getters
  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );

  const getProductBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products]
  );

  const getCategoryById = useCallback(
    (id: string) => categories.find((c) => c.id === id),
    [categories]
  );

  return (
    <StoreContext.Provider
      value={{
        activeView,
        selectedProductId,
        selectedCategoryId,
        searchQuery,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        navigateTo,
        setSearchQuery,
        products,
        categories,
        subcategories,
        orders,
        events,
        projects,
        banners,
        collaborations,
        settings,
        isCatalogLoading,
        isEventsLoading,
        isProjectsLoading,
        storeDataErrors,
        reloadStoreData,
        reloadDashboardSettings,
        cart,
        user,
        lastCreatedOrder,
        setLastCreatedOrder,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        syncGuestCart,
        isGuestCartSyncing,
        cartSyncError,
        forgetAuthenticatedCart,
        clearCartAfterOrder,
        cartSubtotal,
        cartDepositAmount,
        cartRemainingAmount,
        cartItemsCount,
        cartOriginalTotal: cartPricing.originalTotal + localGuestSubtotal,
        cartDiscountTotal: cartPricing.discountTotal,
        cartFreeShipping: cartPricing.freeShipping,
        createOrder,
        submitPaymentProof,
        updateOrderStatus,
        updatePaymentStatus,
        saveProduct,
        deleteProduct,
        toggleProductFeatured,
        saveCategory,
        deleteCategory,
        saveEvent,
        deleteEvent,
        saveProject,
        deleteProject,
        saveBanner,
        deleteBanner,
        toggleBannerActive,
        updateSettings,
        loginUser,
        logoutUser,
        saveUserAddress,
        deleteUserAddress,
        getProductById,
        getProductBySlug,
        getCategoryById,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useToccoStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useToccoStore must be used within a StoreProvider');
  }
  return context;
}
