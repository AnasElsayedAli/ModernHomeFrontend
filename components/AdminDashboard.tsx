'use client';

import React, { useState, useRef } from 'react';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import CategoriesManagement from '@/components/CategoriesManagement';
import UserManagement from '@/components/UserManagement';
import CloudinaryImageUploader from '@/components/CloudinaryImageUploader';
import CloudinaryImageField from '@/components/CloudinaryImageField';
import {
  Product,
  Category,
  Order,
  EventItem,
  ProjectItem,
  OrderStatus,
  PaymentStatus,
  ProductFinish,
  ProductColor,
  BannerItem,
} from '@/types';
import {
  Layers,
  Package,
  FolderTree,
  Image as ImageIcon,
  Settings,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  DollarSign,
  Eye,
  EyeOff,
  Star,
  RefreshCw,
  Phone,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Flame,
  Tag,
  AlertCircle,
  Loader2,
  Palette,
  Search,
  Users,
} from 'lucide-react';
import Image from '@/components/SafeImage';
import { orderService } from '@/lib/api/services/orderService';
import { offerService } from '@/lib/api/services/offerService';
import { collaborationService } from '@/lib/api/services/collaborationService';
import { colorService } from '@/lib/api/services/colorService';
import { productService } from '@/lib/api/services/productService';
import CustomDesignRequestsManagement from '@/components/CustomDesignRequestsManagement';
import { BackendOrder, BackendOrderStatus } from '@/types/order';
import { BackendOffer, OfferCreateRequest, OfferProductRequest, OfferType } from '@/types/offer';
import { BackendCollaboration, CollaborationCreateRequest } from '@/types/collaboration';
import { BackendColor, BackendProduct, ColorCreateRequest } from '@/types/product';
import { normalizeApiError } from '@/lib/api/errors';
import ConfirmDialog from '@/components/ConfirmDialog';
import { SkeletonTableRows, SkeletonCardGrid, SkeletonListRows } from '@/components/DashboardSkeleton';
import { useAccessibleDialog } from '@/hooks/use-accessible-dialog';

type OfferDraft = {
  id?: number;
  name: string;
  offer_type: OfferType;
  percentage: string;
  bundle_price: string;
  products: { product_id: string; quantity: string }[];
  starts_at: string;
  ends_at: string;
  is_active: boolean;
};

type CollaborationDraft = {
  id?: number;
  title: string;
  image: string;
  public_id: string;
};

type ColorDraft = {
  id?: number;
  name: string;
  hex_code: string;
};

const formatCurrency = (value: string | number | null | undefined) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatOfferType = (type: OfferType) => {
  if (type === 'PERCENTAGE') return 'خصم بنسبة مئوية';
  if (type === 'BUNDLE') return 'سعر مجموعة';
  return 'شحن مجاني';
};

const toDateTimeInputValue = (value: string | null) => (value ? value.slice(0, 16) : '');

const toBackendDateTime = (value: string) => (value ? new Date(value).toISOString() : null);

const getOfferListedValue = (offerProducts: OfferDraft['products'], catalogProducts: Product[]) =>
  offerProducts.reduce((total, item) => {
    const product = catalogProducts.find((candidate) => candidate.id === item.product_id);
    const quantity = Number(item.quantity);
    const price = Number(product?.price);
    if (!product || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price)) return total;
    return total + price * quantity;
  }, 0);

export default function AdminDashboard() {
  const {
    products,
    categories,
    subcategories,
    orders,
    events,
    projects,
    banners,
    settings,
    isCatalogLoading,
    isEventsLoading,
    isProjectsLoading,
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
    updateOrderStatus,
    updatePaymentStatus,
    navigateTo,
    reloadStoreData,
  } = useToccoStore();

  const [depositPercentageDraft, setDepositPercentageDraft] = useState({
    source: settings.depositPercentage,
    value: String(settings.depositPercentage),
  });
  const [instapayAddressDraft, setInstapayAddressDraft] = useState({
    source: settings.paymentMethods.instapay.address,
    value: settings.paymentMethods.instapay.address,
  });
  const [mobileWalletDraft, setMobileWalletDraft] = useState({
    source: settings.paymentMethods.mobileWallet.number,
    value: settings.paymentMethods.mobileWallet.number,
  });

  const depositPercentageValue =
    depositPercentageDraft.source === settings.depositPercentage
      ? depositPercentageDraft.value
      : String(settings.depositPercentage);
  const instapayAddressValue =
    instapayAddressDraft.source === settings.paymentMethods.instapay.address
      ? instapayAddressDraft.value
      : settings.paymentMethods.instapay.address;
  const mobileWalletValue =
    mobileWalletDraft.source === settings.paymentMethods.mobileWallet.number
      ? mobileWalletDraft.value
      : settings.paymentMethods.mobileWallet.number;

  const [activeTab, setActiveTab] = useState<
    | 'products'
    | 'banners'
    | 'categories'
    | 'orders'
    | 'events'
    | 'offers'
    | 'collaborations'
    | 'custom-requests'
    | 'projects'
    | 'colors'
    | 'users'
    | 'settings'
  >('products');

  // Banner Modal states
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);

  const handleNewBanner = () => {
    setEditingBanner({
      id: `ban-${Date.now()}`,
      type: 'new_product',
      categoryLabel: 'إصدار جديد',
      badgeText: 'إصدار جديد · ٢٠٢٦',
      title: '',
      subtitle: '',
      tagHighlight: '',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'اكتشف القطعة الجديدة',
      actionType: 'navigate',
      targetView: 'shop',
      targetId: '',
      promoCode: '',
      isActive: true,
      displayOrder: banners.length + 1,
    });
    setIsBannerModalOpen(true);
  };

  // Real Backend Orders Management State
  const [backendOrders, setBackendOrders] = useState<BackendOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const [offers, setOffers] = useState<BackendOffer[]>([]);
  const [collaborations, setCollaborations] = useState<BackendCollaboration[]>([]);
  const [colors, setColors] = useState<BackendColor[]>([]);
  const [isOffersLoading, setIsOffersLoading] = useState(true);
  const [isCollaborationsLoading, setIsCollaborationsLoading] = useState(true);
  const [isColorsLoading, setIsColorsLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [collaborationsError, setCollaborationsError] = useState<string | null>(null);
  const [colorsError, setColorsError] = useState<string | null>(null);
  const [editingOffer, setEditingOffer] = useState<OfferDraft | null>(null);
  const [editingCollaboration, setEditingCollaboration] = useState<CollaborationDraft | null>(null);
  const [editingColor, setEditingColor] = useState<ColorDraft | null>(null);
  const [isOfferSaving, setIsOfferSaving] = useState(false);
  const [isCollaborationSaving, setIsCollaborationSaving] = useState(false);
  const [isColorSaving, setIsColorSaving] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState<number | null>(null);
  const [deletingCollaborationId, setDeletingCollaborationId] = useState<number | null>(null);
  const [deletingColorId, setDeletingColorId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
  } | null>(null);
  const [isDeleteProcessing, setIsDeleteProcessing] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isArchivedProductsOpen, setIsArchivedProductsOpen] = useState(false);
  const [archivedProducts, setArchivedProducts] = useState<BackendProduct[]>([]);
  const [isArchivedProductsLoading, setIsArchivedProductsLoading] = useState(false);
  const [archivedProductsError, setArchivedProductsError] = useState<string | null>(null);
  const [archivedProductsSuccess, setArchivedProductsSuccess] = useState<string | null>(null);
  const [restoringProductId, setRestoringProductId] = useState<number | null>(null);

  const loadArchivedProducts = async () => {
    setIsArchivedProductsLoading(true);
    setArchivedProductsError(null);
    try {
      setArchivedProducts(await productService.getDeletedProducts());
    } catch (err) {
      setArchivedProductsError(normalizeApiError(err).message);
    } finally {
      setIsArchivedProductsLoading(false);
    }
  };

  const handleRestoreProduct = async (product: BackendProduct) => {
    setRestoringProductId(product.id);
    setArchivedProductsError(null);
    try {
      const result = await productService.restoreProduct(product.id);
      setArchivedProducts((current) => current.filter((item) => item.id !== product.id));
      await reloadStoreData();
      setArchivedProductsSuccess(`تمت استعادة المنتج «${product.name}».`);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setArchivedProductsError(
        `تعذرت استعادة المنتج «${product.name}». تأكد من أن التصنيفات والأقسام المرتبطة به نشطة، ثم حاول مرة أخرى. ${normalized.message}`
      );
    } finally {
      setRestoringProductId(null);
    }
  };

  const requestDeleteConfirmation = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>
  ) => {
    setPendingDelete({ title, description, onConfirm });
  };

  const handlePendingDelete = async () => {
    if (!pendingDelete || isDeleteProcessing) return;
    setIsDeleteProcessing(true);
    try {
      await pendingDelete.onConfirm();
      setPendingDelete(null);
    } catch (err) {
      setDashboardError(normalizeApiError(err).message);
    } finally {
      setIsDeleteProcessing(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setDashboardError(null);
    try {
      await deleteProduct(productId);
    } catch (err) {
      setDashboardError(normalizeApiError(err).message);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct || !editingProduct.name.trim()) return;
    setDashboardError(null);
    try {
      await saveProduct(editingProduct);
      setIsProductModalOpen(false);
    } catch (err) {
      setDashboardError(normalizeApiError(err).message);
    }
  };

  React.useEffect(() => {
    let active = true;

    offerService
      .getOffers()
      .then((data) => {
        if (active) setOffers(data);
      })
      .catch((err) => {
        if (active) setOffersError(normalizeApiError(err).message);
      })
      .finally(() => {
        if (active) setIsOffersLoading(false);
      });

    collaborationService
      .getCollaborations()
      .then((data) => {
        if (active) setCollaborations(data);
      })
      .catch((err) => {
        if (active) setCollaborationsError(normalizeApiError(err).message);
      })
      .finally(() => {
        if (active) setIsCollaborationsLoading(false);
      });

    colorService
      .getColors()
      .then((data) => {
        if (active) setColors(data);
      })
      .catch((err) => {
        if (active) setColorsError(normalizeApiError(err).message);
      })
      .finally(() => {
        if (active) setIsColorsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchBackendOrders = React.useCallback(async (search?: string) => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await orderService.getAllOrders(search ? { search } : undefined);
      setBackendOrders(data);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setOrdersError(normalized.message);
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  // Load immediately on mount, then debounce reloads as the search box changes.
  const didMountOrders = useRef(false);
  React.useEffect(() => {
    const query = orderSearchQuery.trim();
    if (!didMountOrders.current) {
      didMountOrders.current = true;
      fetchBackendOrders(query);
      return;
    }
    const handle = setTimeout(() => fetchBackendOrders(query), 350);
    return () => clearTimeout(handle);
  }, [orderSearchQuery, fetchBackendOrders]);

  const handleUpdateOrderStatus = async (orderId: number, newStatus: BackendOrderStatus) => {
    setUpdatingOrderId(orderId);
    setOrdersError(null);
    setStatusUpdateSuccess(null);
    try {
      const updated = await orderService.updateOrderStatus(orderId, { status: newStatus });
      setBackendOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      const statusLabel = newStatus === 'CONFIRMED' ? 'مؤكد' : newStatus === 'CANCELLED' ? 'ملغي' : 'غير مؤكد';
      setStatusUpdateSuccess(`تم تحديث حالة الطلب رقم ${updated.order_number} إلى «${statusLabel}».`);
      setTimeout(() => setStatusUpdateSuccess(null), 4000);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setOrdersError(normalized.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const createOfferDraft = (offer?: BackendOffer): OfferDraft => ({
    id: offer?.id,
    name: offer?.name || '',
    offer_type: offer?.offer_type || 'PERCENTAGE',
    percentage: offer?.percentage != null ? String(offer.percentage) : '',
    bundle_price: offer?.bundle_price != null ? String(offer.bundle_price) : '',
    products: offer?.products.length
      ? offer.products.map((item) => ({
          product_id: String(item.product_id),
          quantity: String(item.quantity),
        }))
      : [{ product_id: products[0]?.id || '', quantity: '1' }],
    starts_at: toDateTimeInputValue(offer?.starts_at || null),
    ends_at: toDateTimeInputValue(offer?.ends_at || null),
    is_active: offer?.is_active ?? true,
  });

  const createCollaborationDraft = (collaboration?: BackendCollaboration): CollaborationDraft => ({
    id: collaboration?.id,
    title: collaboration?.title || '',
    image: collaboration?.image || '',
    public_id: collaboration?.public_id || '',
  });

  const buildOfferPayload = (draft: OfferDraft): OfferCreateRequest => {
    const selectedProducts: OfferProductRequest[] = draft.products
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity || 1),
      }))
      .filter((item) => Number.isInteger(item.product_id) && item.product_id > 0 && item.quantity > 0);

    if (!draft.name.trim()) throw new Error('أدخل اسم العرض.');
    if (!selectedProducts.length) throw new Error('اختر منتجًا واحدًا على الأقل لهذا العرض.');
    if (draft.offer_type === 'PERCENTAGE' && (!Number.isFinite(Number(draft.percentage)) || Number(draft.percentage) <= 0)) {
      throw new Error('أدخل نسبة خصم أكبر من صفر لهذا العرض.');
    }
    if (draft.offer_type === 'BUNDLE') {
      const bundlePrice = Number(draft.bundle_price);
      if (!Number.isFinite(bundlePrice) || bundlePrice <= 0) {
        throw new Error('أدخل سعر مجموعة أكبر من صفر.');
      }

    }

    return {
      name: draft.name.trim(),
      offer_type: draft.offer_type,
      percentage: draft.offer_type === 'PERCENTAGE' ? Number(draft.percentage) : null,
      bundle_price: draft.offer_type === 'BUNDLE' ? Number(draft.bundle_price) : null,
      products: selectedProducts,
      starts_at: toBackendDateTime(draft.starts_at),
      ends_at: toBackendDateTime(draft.ends_at),
      is_active: draft.is_active,
    };
  };

  const handleSaveOffer = async () => {
    if (!editingOffer) return;
    setIsOfferSaving(true);
    setOffersError(null);
    try {
      const payload = buildOfferPayload(editingOffer);
      const saved = editingOffer.id
        ? await offerService.updateOffer(editingOffer.id, payload)
        : await offerService.createOffer(payload);
      setOffers((prev) => {
        const exists = prev.some((offer) => offer.id === saved.id);
        return exists ? prev.map((offer) => (offer.id === saved.id ? saved : offer)) : [saved, ...prev];
      });
      setEditingOffer(null);
    } catch (err) {
      setOffersError(normalizeApiError(err).message);
    } finally {
      setIsOfferSaving(false);
    }
  };

  const handleDeleteOffer = async (offer: BackendOffer) => {
    setDeletingOfferId(offer.id);
    setOffersError(null);
    try {
      await offerService.deleteOffer(offer.id);
      setOffers((prev) => prev.filter((item) => item.id !== offer.id));
    } catch (err) {
      setOffersError(normalizeApiError(err).message);
    } finally {
      setDeletingOfferId(null);
    }
  };

  const handleSaveCollaboration = async () => {
    if (!editingCollaboration) return;
    setIsCollaborationSaving(true);
    setCollaborationsError(null);
    try {
      if (!editingCollaboration.title.trim()) throw new Error('أدخل اسم الشريك.');
      if (!editingCollaboration.image || !editingCollaboration.public_id) {
        throw new Error('ارفع صورة الشريك قبل الحفظ.');
      }
      const payload: CollaborationCreateRequest = {
        title: editingCollaboration.title.trim(),
        image: editingCollaboration.image,
        public_id: editingCollaboration.public_id,
      };
      const saved = await collaborationService.createCollaboration(payload);
      setCollaborations((prev) => [saved, ...prev]);
      setEditingCollaboration(null);
    } catch (err) {
      setCollaborationsError(normalizeApiError(err).message);
    } finally {
      setIsCollaborationSaving(false);
    }
  };

  const handleDeleteCollaboration = async (collaboration: BackendCollaboration) => {
    setDeletingCollaborationId(collaboration.id);
    setCollaborationsError(null);
    try {
      await collaborationService.deleteCollaboration(collaboration.id);
      setCollaborations((prev) => prev.filter((item) => item.id !== collaboration.id));
    } catch (err) {
      setCollaborationsError(normalizeApiError(err).message);
    } finally {
      setDeletingCollaborationId(null);
    }
  };

  const createColorDraft = (color?: BackendColor): ColorDraft => ({
    id: color?.id,
    name: color?.name || '',
    hex_code: color?.hex_code || '#EBE3D5',
  });

  const handleSaveColor = async () => {
    if (!editingColor) return;
    setIsColorSaving(true);
    setColorsError(null);
    try {
      if (!editingColor.name.trim()) throw new Error('أدخل اسم اللون.');
      const payload: ColorCreateRequest = {
        name: editingColor.name.trim(),
        hex_code: editingColor.hex_code.trim(),
      };
      const saved = editingColor.id
        ? await colorService.updateColor(editingColor.id, payload)
        : await colorService.createColor(payload);
      setColors((prev) => {
        const exists = prev.some((color) => color.id === saved.id);
        return exists ? prev.map((color) => (color.id === saved.id ? saved : color)) : [saved, ...prev];
      });
      setEditingColor(null);
    } catch (err) {
      setColorsError(normalizeApiError(err).message);
    } finally {
      setIsColorSaving(false);
    }
  };

  const handleDeleteColor = async (color: BackendColor) => {
    setDeletingColorId(color.id);
    setColorsError(null);
    try {
      await colorService.deleteColor(color.id);
      setColors((prev) => prev.filter((item) => item.id !== color.id));
    } catch (err) {
      setColorsError(normalizeApiError(err).message);
    } finally {
      setDeletingColorId(null);
    }
  };

  const toggleProductColor = (color: BackendColor) => {
    if (!editingProduct) return;
    const colorIdStr = String(color.id);
    const exists = editingProduct.colors.some((c) => c.id === colorIdStr);
    const nextColors: ProductColor[] = exists
      ? editingProduct.colors.filter((c) => c.id !== colorIdStr)
      : [...editingProduct.colors, { id: colorIdStr, name: color.name, hex: color.hex_code }];
    setEditingProduct({ ...editingProduct, colors: nextColors });
  };

  // Product Modal / Form states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const productDraftSequence = useRef(0);

  // Category Modal states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Event Modal states
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isEventSaving, setIsEventSaving] = useState(false);
  const [eventSaveError, setEventSaveError] = useState<string | null>(null);

  // Project Modal states
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const isAdminEditDialogOpen = isProductModalOpen || isCategoryModalOpen || isEventModalOpen
    || isProjectModalOpen || isBannerModalOpen || Boolean(editingOffer)
    || Boolean(editingCollaboration) || Boolean(editingColor);
  const closeAdminEditDialog = () => {
    if (isProductModalOpen) setIsProductModalOpen(false);
    else if (isCategoryModalOpen) setIsCategoryModalOpen(false);
    else if (isEventModalOpen) setIsEventModalOpen(false);
    else if (isProjectModalOpen) setIsProjectModalOpen(false);
    else if (isBannerModalOpen) setIsBannerModalOpen(false);
    else if (editingOffer) setEditingOffer(null);
    else if (editingCollaboration) setEditingCollaboration(null);
    else if (editingColor) setEditingColor(null);
  };
  const { dialogRef, handleDialogKeyDown } = useAccessibleDialog(
    isAdminEditDialogOpen,
    closeAdminEditDialog
  );

  // Helper to open new product
  const handleNewProduct = () => {
    productDraftSequence.current += 1;
    const draftId = `prod-draft-${productDraftSequence.current}`;
    setEditingProduct({
      id: draftId,
      name: '',
      slug: draftId,
      categoryId: categories[0]?.id || 'cat-tables',
      subcategoryIds: [],
      description: '',
      price: 25000,
      images: [],
      finishes: ['MATTE', 'GLOSSY'],
      colors: [],
      dimensions: '80 x 80 x 42 cm',
      deliveryDays: 21,
      height: '',
      material: 'ألياف زجاجية بحرية معززة بطبقة جل مقاومة للأشعة فوق البنفسجية',
      faq: [],
      leadTime: '٢١ يومًا',
      shippingTime: 'توصيل وتركيب خلال ٥–٧ أيام',
      isFeatured: false,
      isPublished: true,
      inStock: true,
      allowsCustomization: true,
      createdAt: new Date().toISOString(),
    });
    setIsProductModalOpen(true);
  };

  // Helper to open new category
  const handleNewCategory = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: '',
      slug: `category-${Date.now()}`,
      description: '',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
      isFeatured: false,
      isVisible: true,
      displayOrder: categories.length + 1,
    });
    setIsCategoryModalOpen(true);
  };

  // Helper to open new event
  const handleNewEvent = () => {
    setEditingEvent({
      id: `ev-${Date.now()}`,
      title: '',
      location: 'استوديو القاهرة',
      city: 'القاهرة',
      date: '2026-05-01',
      description: '',
      coverImage: '',
      publicId: '',
      status: 'upcoming',
    });
    setEventSaveError(null);
    setIsEventModalOpen(true);
  };

  // Helper to open new project
  const handleNewProject = () => {
    setEditingProject({
      id: `proj-${Date.now()}`,
      title: '',
      subtitle: 'مشروع مودرن هوم',
      location: '',
      year: String(new Date().getFullYear()),
      description: '',
      coverImage: '',
      gallery: [],
      productsUsed: [],
      customerName: '',
      publicId: '',
      productId: undefined,
    });
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async () => {
    if (!editingProject || !editingProject.title.trim()) return;
    setDashboardError(null);
    try {
      await saveProject(editingProject);
      setIsProjectModalOpen(false);
    } catch (err) {
      setDashboardError(normalizeApiError(err).message);
    }
  };

  return (
    <div id="admin-studio-dashboard" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {dashboardError && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <span>{dashboardError}</span>
            <button
              type="button"
              onClick={() => setDashboardError(null)}
              className="text-rose-700 hover:text-rose-950"
                aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Top Bar with Live Return link and reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE4DC]">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('home')}
                className="text-xs uppercase tracking-wider text-[#736B63] hover:text-[#1C1A19] flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>العودة إلى المتجر</span>
              </button>
            </div>
            <h1 className="text-3xl font-normal tracking-tight text-[#1C1A19] mt-2">
              إدارة مودرن هوم
            </h1>
            <p className="text-xs text-[#736B63]">
              إدارة المنتجات والطلبات والمحتوى.
            </p>
          </div>

        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-[#EAE4DC] gap-1 overflow-x-auto pb-1 text-xs uppercase tracking-wider font-medium scrollbar-none">
          {[
            { key: 'products', label: `المنتجات (${products.length})`, icon: Package },
            { key: 'orders', label: `الطلبات (${backendOrders.length})`, icon: DollarSign },
            { key: 'categories', label: 'التصنيفات والأقسام الفرعية', icon: FolderTree },
            { key: 'offers', label: `العروض (${offers.length})`, icon: Tag },
            { key: 'projects', label: `المشروعات (${projects.length})`, icon: ImageIcon },
            { key: 'colors', label: `الألوان (${colors.length})`, icon: Palette },
            { key: 'users', label: 'المستخدمون والصلاحيات', icon: Users },
            { key: 'settings', label: 'إعدادات المتجر والمقدم', icon: Settings },
          ].map((t) => {
            const Icon = t.icon;
            const isCurrent = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key as any)}
                className={`px-4 py-3 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-[#1C1A19] text-white shadow-xs'
                    : 'text-[#524B45] hover:bg-[#EFEBE3]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab === 'custom-requests' && <CustomDesignRequestsManagement />}

        {/* ----------------- TAB 1: PRODUCTS ----------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
                  أرشيف كتالوج المنتجات
                </h3>
                <p className="text-xs text-[#736B63]">
                  إدارة المنتجات النشطة واستعادة المنتجات المؤرشفة.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const isOpening = !isArchivedProductsOpen;
                    setIsArchivedProductsOpen(isOpening);
                    if (isOpening) void loadArchivedProducts();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#D8CEBF] px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-[#524B45] hover:bg-[#F5F2EB]"
                >
                  {isArchivedProductsOpen ? 'إخفاء المؤرشف' : 'عرض المؤرشف'}
                </button>
                <button
                  type="button"
                  onClick={handleNewProduct}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#332F2D] shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة منتج</span>
                </button>
              </div>
            </div>

            {isArchivedProductsOpen && (
              <section className="rounded-xl border border-[#D8CEBF] bg-[#F5F2EB] p-4 sm:p-5" aria-label="المنتجات المؤرشفة">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-[#17324A]">المنتجات المؤرشفة</h4>
                    <p className="mt-1 text-xs text-[#6D6A64]">لاستعادة المنتج، يجب أن تكون التصنيفات المرتبطة به نشطة.</p>
                  </div>
                  <button type="button" onClick={() => void loadArchivedProducts()} disabled={isArchivedProductsLoading} className="text-xs font-medium text-[#643D26] underline underline-offset-2 disabled:opacity-50">
                    {isArchivedProductsLoading ? 'جارٍ التحديث...' : 'تحديث'}
                  </button>
                </div>
                {archivedProductsSuccess && (
                  <p role="status" className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                    {archivedProductsSuccess}
                  </p>
                )}
                {archivedProductsError && (
                  <div role="alert" className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
                    <span>{archivedProductsError}</span>
                    <button type="button" onClick={() => void loadArchivedProducts()} className="shrink-0 font-semibold underline underline-offset-2">إعادة المحاولة</button>
                  </div>
                )}
                {isArchivedProductsLoading ? (
                  <p className="py-5 text-center text-sm text-[#6D6A64]" role="status">جارٍ تحميل المنتجات المؤرشفة...</p>
                ) : archivedProducts.length === 0 && !archivedProductsError ? (
                  <p className="py-5 text-center text-sm text-[#6D6A64]">لا توجد منتجات مؤرشفة.</p>
                ) : (
                  <ul className="divide-y divide-[#EAE4DC] rounded-lg border border-[#EAE4DC] bg-white">
                    {archivedProducts.map((product) => (
                      <li key={product.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          {product.images[0]?.image && (
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[#EFEBE3]">
                              <Image src={product.images[0].image} alt="" fill sizes="48px" className="object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-[#1C1A19]">{product.name}</p>
                            <p className="text-[10px] text-[#6D6A64]">رقم {product.id} · {formatCurrency(product.price)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleRestoreProduct(product)}
                          disabled={restoringProductId !== null}
                          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#BFD7C4] bg-[#EEF5EE] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#28633D] disabled:cursor-wait disabled:opacity-50"
                        >
                          {restoringProductId === product.id && <Loader2 className="h-3 w-3 animate-spin" />}
                          استعادة المنتج
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            <div className="bg-white rounded-2xl border border-[#EAE4DC] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EAE4DC] text-[#736B63] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">المنتج</th>
                      <th className="py-3 px-4">التصنيف</th>
                      <th className="py-3 px-4">السعر / مقدم {settings.depositPercentage}%</th>
                      <th className="py-3 px-4">التشطيب</th>
                      <th className="py-3 px-4">مميز</th>
                      <th className="py-3 px-4 text-right">الإجراءات</th>
                    </tr>
                  </thead>
                  {isCatalogLoading ? (
                    <SkeletonTableRows rows={5} columns={6} />
                  ) : (
                  <tbody className="divide-y divide-[#EAE4DC]">
                    {products.map((p) => {
                      const cat = categories.find((c) => c.id === p.categoryId);

                      return (
                        <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#EFEBE3] shrink-0 border border-[#E0D8CB]">
                                <Image
                                  src={p.images[0]}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <span className="font-medium text-[#1C1A19] block">{p.name}</span>
                                <span className="text-[10px] text-[#8F8880] font-mono">{p.slug}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-[#524B45]">{cat?.name || '—'}</td>

                          <td className="py-3 px-4">
                            <div>
                              <span className="font-semibold text-[#1C1A19]">
                                {p.price?.toLocaleString()} EGP
                              </span>
                              <span className="text-[10px] text-[#736B63] block">
                                المقدم: {Math.round((p.price || 0) * settings.depositPercentage / 100).toLocaleString('ar-EG')} جنيه
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-[#736B63]">
                            {p.finishes.map((finish) => finish === 'MATTE' ? 'مطفي' : 'لامع').join('، ')}
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleProductFeatured(p.id)}
                              className={`p-1 rounded-md ${
                                p.isFeatured ? 'text-[#B85D38]' : 'text-[#D8CEBF] hover:text-[#736B63]'
                              }`}
                              title="إظهار المنتج المميز في الصفحة الرئيسية أو إخفاؤه"
                            >
                              <Star className="w-4 h-4 fill-current" />
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-[#524B45] hover:text-[#1C1A19]"
                              title="تعديل المنتج"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => requestDeleteConfirmation(
                                `حذف المنتج: «${p.name}»`,
                                'سيؤدي هذا الإجراء إلى حذف المنتج نهائيًا من الكتالوج، ولا يمكن التراجع عنه.',
                                () => { void handleDeleteProduct(p.id); }
                              )}
                              className="p-1.5 text-[#B85D38] hover:text-red-700"
                              title="حذف المنتج"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: BANNERS & HIGHLIGHTS ----------------- */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
                  الإعلانات واللافتات
                </h3>
                <p className="text-xs text-[#736B63]">
                  أدر الإعلانات الدوارة للمنتجات الجديدة والعروض الحصرية والفعاليات القادمة وطلبات التصنيع حسب الطلب.
                </p>
              </div>
              <button
                id="admin-add-banner-btn"
                onClick={handleNewBanner}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#332F2D] shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إنشاء إعلان</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-[#EAE4DC] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#EAE4DC] text-[#736B63] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">الإعلان</th>
                      <th className="py-3 px-4">التصنيف والشارة</th>
                      <th className="py-3 px-4">العنوان أو الكود</th>
                      <th className="py-3 px-4">الإجراء</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4 text-right">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE4DC]">
                    {banners.map((b) => {
                      return (
                        <tr key={b.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#1C1A19] shrink-0 border border-[#E0D8CB]">
                                <Image
                                  src={b.image}
                                  alt={b.title}
                                  fill
                                  className="object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div className="max-w-xs">
                                <span className="font-medium text-[#1C1A19] block truncate">
                                  {b.title}
                                </span>
                                <span className="text-[11px] text-[#736B63] line-clamp-1">
                                  {b.subtitle}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-[#EFEBE3] text-[#524B45] text-[10px] font-semibold uppercase tracking-wider">
                              {b.categoryLabel}
                            </span>
                            <span className="block text-[10px] text-[#8E867D] mt-0.5">
                              {b.badgeText}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {b.tagHighlight ? (
                              <span className="inline-block px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[11px]">
                                {b.tagHighlight}
                              </span>
                            ) : (
                              <span className="text-[#8E867D]">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-[#524B45]">
                            <span>{b.actionType === 'copy_code' ? 'نسخ الكود' : `الانتقال إلى ${b.targetView === 'shop' ? 'المنتجات' : b.targetView === 'events' ? 'الفعاليات' : b.targetView === 'custom-design' ? 'التصنيع حسب الطلب' : b.targetView === 'our-story' ? 'عن مودرن هوم' : 'الرابط'}`}</span>
                            <span className="block text-[10px] text-[#8E867D]">{b.ctaText}</span>
                          </td>

                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleBannerActive(b.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                                b.isActive
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                              }`}
                            >
                              {b.isActive ? 'منشور' : 'مخفي'}
                            </button>
                          </td>

                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setEditingBanner(b);
                                setIsBannerModalOpen(true);
                              }}
                              className="p-1.5 text-[#524B45] hover:text-[#1C1A19]"
                              title="تعديل الإعلان"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => requestDeleteConfirmation(
                                `حذف الإعلان: «${b.title}»`,
                                'سيؤدي هذا الإجراء إلى حذف الإعلان نهائيًا، ولا يمكن التراجع عنه.',
                                () => deleteBanner(b.id)
                              )}
                              className="p-1.5 text-[#B85D38] hover:text-red-700"
                              title="حذف الإعلان"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 2: ORDERS ----------------- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
                  طلبات العملاء وحالة التصنيع
                </h3>
                <p className="text-xs text-[#736B63]">
                  سجل الطلبات المعتمد: أكّد الطلبات، وراجع تفاصيل التوصيل، وتابع انتقال الطلبات إلى التصنيع.
                </p>
              </div>

              <button
                onClick={() => fetchBackendOrders(orderSearchQuery.trim())}
                disabled={isOrdersLoading}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-full border border-[#D8CEBF] text-xs text-[#524B45] hover:text-[#1C1A19] hover:border-[#1C1A19] flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isOrdersLoading ? 'animate-spin' : ''}`} />
                <span>تحديث الطلبات</span>
              </button>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-[#8F8880] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث برقم الطلب أو اسم العميل أو بريده الإلكتروني أو هاتفه أو حالته"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 rounded-lg border border-[#D8CEBF] bg-white text-xs font-mono text-[#1C1A19] placeholder:font-sans placeholder:text-[#8F8880] focus:outline-none focus:border-[#1C1A19]"
              />
              {orderSearchQuery && (
                <button
                  onClick={() => setOrderSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8F8880] hover:text-[#1C1A19]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {statusUpdateSuccess && (
              <div className="p-4 rounded-xl bg-[#EBF5EE] border border-[#C5E5D0] text-[#1E6B3A] text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1E6B3A] shrink-0" />
                <span>{statusUpdateSuccess}</span>
              </div>
            )}

            {ordersError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{ordersError}</span>
                </div>
                <button
                  onClick={() => fetchBackendOrders(orderSearchQuery.trim())}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-800 font-semibold"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {isOrdersLoading ? (
              <SkeletonListRows count={4} />
            ) : backendOrders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-[#EAE4DC] text-xs text-[#736B63] space-y-2">
                {orderSearchQuery.trim() ? (
                  <>
                    <p>لا توجد طلبات تطابق «{orderSearchQuery}».</p>
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="text-[#643D26] underline underline-offset-2"
                    >
                      مسح البحث
                    </button>
                  </>
                ) : (
                  <p>لا توجد طلبات عملاء حتى الآن.</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {backendOrders.map((ord) => {
                  const deposit = Number(ord.deposit_amount);
                  const isUpdating = updatingOrderId === ord.id;
                  const clientWhatsAppNumber = toWhatsAppNumber(ord.user?.phone);
                  const whatsappUrl = `https://wa.me/${clientWhatsAppNumber}?text=${encodeURIComponent(
                    `مرحبًا، معك فريق مودرن هوم بخصوص الطلب رقم ${ord.order_number}.`
                  )}`;

                  return (
                    <div
                      key={ord.id}
                      className="p-6 rounded-2xl bg-white border border-[#EAE4DC] shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EAE4DC] gap-2">
                        <div>
                          <span className="text-xs font-mono font-bold text-[#1C1A19]">
                            الطلب رقم {ord.order_number}
                          </span>
                          <span className="text-xs text-[#736B63] ml-2">
                            · {new Date(ord.created_at).toLocaleString('ar-EG')}
                          </span>
                        </div>

                        {/* Status Pickers */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-[#6D6A64]">الحالة:</span>
                            <select
                              value={ord.status}
                              disabled={isUpdating}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as BackendOrderStatus)}
                              className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-[#D8CEBF] bg-[#FAF8F5] focus:outline-none disabled:opacity-50"
                            >
                              <option value="NOT_CONFIRMED">غير مؤكد (قيد الانتظار)</option>
                              <option value="CONFIRMED">مؤكد (قيد التنفيذ)</option>
                              <option value="CANCELLED">ملغي</option>
                            </select>
                            {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#643D26]" />}
                          </div>
                        </div>
                      </div>

                      {/* Customer & Address Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#524B45]">
                        <div>
                          <span className="font-semibold text-[#17324A] block">العنوان والمستلم:</span>
                          <p className="font-medium text-[#1C1A19]">{ord.shipping_address?.title || 'سكن خاص'}</p>
                          <p className="text-[#736B63]">
                            {ord.user ? `${ord.user.first_name} ${ord.user.last_name}`.trim() || ord.user.email : 'عميل غير معروف'}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-[#17324A] block">عنوان التوصيل:</span>
                          {ord.shipping_address ? (
                            <>
                              <p>
                                {ord.shipping_address.building_number ? `مبنى ${ord.shipping_address.building_number}، ` : ''}
                                {ord.shipping_address.street}
                              </p>
                              <p>
                                {ord.shipping_address.apartment_number ? `شقة ${ord.shipping_address.apartment_number}، ` : ''}
                                {ord.shipping_address.city}, {ord.shipping_address.country}
                              </p>
                            </>
                          ) : (
                            <p className="text-[#817D75]">لا يوجد عنوان مرتبط بالطلب</p>
                          )}
                        </div>

                        <div>
                          <span className="font-semibold text-[#1C1A19] block">مقدم التصنيع {Number(ord.deposit_percentage)}٪:</span>
                          <p className="text-[#643D26] font-semibold text-sm font-mono">
                            {deposit.toLocaleString('ar-EG')} جنيه
                          </p>
                          <p className="text-[#736B63] font-mono">
                            الإجمالي: {Number(ord.total_price).toLocaleString('ar-EG')} جنيه
                          </p>
                        </div>
                      </div>

                      {ord.customer_notes && (
                        <div className="text-xs text-[#524B45] bg-[#FAF8F5] border border-[#EAE4DC] rounded-xl p-3">
                          <span className="font-semibold text-[#17324A] block mb-0.5">ملاحظات العميل:</span>
                          <p>{ord.customer_notes}</p>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="pt-2 border-t border-[#EAE4DC] flex flex-wrap items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          {ord.items.map((it) => (
                            <div
                              key={it.id}
                              className="inline-flex items-center gap-2 mr-4 text-xs text-[#1C1A19] font-medium"
                            >
                              {it.color_hex_code && (
                                <div
                                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                                  style={{ backgroundColor: it.color_hex_code }}
                                  title={it.color_name || undefined}
                                />
                              )}
                              <span>
                                {it.product_name}
                                {it.color_name ? ` (${it.color_name})` : ''} x{it.quantity}
                              </span>
                              <span className="font-mono text-[#736B63]">
                                · {Number(it.subtotal).toLocaleString('ar-EG')} جنيه
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          {ord.status === 'NOT_CONFIRMED' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'CONFIRMED')}
                              disabled={isUpdating}
                              className="px-3 py-1.5 rounded-lg bg-[#D1E7DD] text-[#0F5132] text-xs font-semibold hover:bg-[#C3E6CB] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                              <span>تأكيد الطلب</span>
                            </button>
                          )}

                          {clientWhatsAppNumber ? (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-[#2A2624] text-white text-xs font-medium flex items-center gap-1.5 hover:bg-[#3E3835] transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                              <span>مراسلة العميل</span>
                            </a>
                          ) : (
                            <span className="px-3 py-1.5 rounded-lg bg-[#EFEBE3] text-[#8F8880] text-xs font-medium">
                              لا يوجد رقم هاتف للعميل
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 4: CATEGORIES & SUBCATEGORIES ----------------- */}
        {activeTab === 'categories' && (
          <CategoriesManagement />
        )}

        {/* ----------------- USERS & ROLES ----------------- */}
        {activeTab === 'users' && (
          <UserManagement />
        )}

        {/* ----------------- TAB 6: EVENTS ----------------- */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
                  المعارض والفعاليات
                </h3>
                <p className="text-xs text-[#736B63]">
                  أدر المشاركة في الفعاليات والمعارض وزيارات الاستوديو الخاصة.
                </p>
              </div>
              <button
                onClick={handleNewEvent}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة فعالية</span>
              </button>
            </div>

            {isEventsLoading ? (
              <SkeletonCardGrid count={3} imageAspectClassName="aspect-[16/9]" />
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 rounded-2xl bg-white border border-[#EAE4DC] shadow-sm space-y-4"
                >
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#EFEBE3]">
                    <Image
                      src={ev.coverImage}
                      alt={ev.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 text-[10px] uppercase font-semibold text-[#1C1A19]">
                      {ev.isUpcoming ? 'قادمة' : 'سابقة'}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-[#B85D38] font-mono block">
                      {ev.date} · {ev.location}
                    </span>
                    <h4 className="text-base font-semibold text-[#1C1A19]">{ev.title}</h4>
                    <p className="text-xs text-[#736B63] line-clamp-2">{ev.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[#EAE4DC] flex justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditingEvent(ev);
                        setEventSaveError(null);
                        setIsEventModalOpen(true);
                      }}
                      className="p-1.5 text-[#524B45] hover:text-[#1C1A19]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => requestDeleteConfirmation(
                        `حذف الفعالية: «${ev.title}»`,
                        'سيؤدي هذا الإجراء إلى حذف الفعالية نهائيًا، ولا يمكن التراجع عنه.',
                        () => deleteEvent(ev.id)
                      )}
                      className="p-1.5 text-[#B85D38] hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 7: PROJECTS ----------------- */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
                  مشروعاتنا في المساحات (أعمال معمارية)
                </h3>
                <p className="text-xs text-[#736B63]">
                  استعرض تنفيذات حقيقية للمنازل ومشروعات الضيافة.
                </p>
              </div>
              <button
                onClick={handleNewProject}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مشروع</span>
              </button>
            </div>

            {isProjectsLoading ? (
              <SkeletonCardGrid count={3} imageAspectClassName="aspect-[16/9]" />
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-white border border-[#EAE4DC] shadow-sm space-y-4"
                >
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-[#EFEBE3]">
                    <Image
                      src={proj.coverImage}
                      alt={proj.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-[#B85D38] font-semibold">
                      {proj.subtitle} · {proj.location}
                    </span>
                    <h4 className="text-base font-semibold text-[#1C1A19]">{proj.title}</h4>
                    <p className="text-xs text-[#736B63] line-clamp-2">{proj.description}</p>
                  </div>

                  <div className="pt-2 border-t border-[#EAE4DC] flex justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditingProject(proj);
                        setIsProjectModalOpen(true);
                      }}
                      className="p-1.5 text-[#524B45] hover:text-[#1C1A19]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => requestDeleteConfirmation(
                        `حذف المشروع: «${proj.title}»`,
                        'سيؤدي هذا الإجراء إلى حذف المشروع نهائيًا، ولا يمكن التراجع عنه.',
                        () => deleteProject(proj.id)
                      )}
                      className="p-1.5 text-[#B85D38] hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 8: OFFERS ----------------- */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
                  العروض
                </h3>
                <p className="text-xs text-[#736B63]">
                  أنشئ عروض الخصم والمجموعات والشحن المجاني باستخدام منتجات الكتالوج.
                </p>
              </div>
              <button
                onClick={() => setEditingOffer(createOfferDraft())}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#332F2D]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة عرض</span>
              </button>
            </div>

            {offersError && (
              <div className="flex items-start gap-2 rounded-2xl border border-[#E2B6A2] bg-[#FFF5F0] px-4 py-3 text-xs text-[#8A3D25]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{offersError}</span>
              </div>
            )}

            {isOffersLoading ? (
              <SkeletonCardGrid count={4} columnsClassName="grid-cols-1 lg:grid-cols-2" showImage={false} />
            ) : offers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D8CEBF] bg-white p-8 text-center">
                <p className="text-sm text-[#17324A]">لا توجد عروض حاليًا.</p>
                <p className="text-xs text-[#6D6A64] mt-1">أنشئ عرضًا ليظهر للعملاء.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {offers.map((offer) => (
                  <div key={offer.id} className="rounded-2xl bg-white border border-[#EAE4DC] shadow-sm p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] uppercase tracking-widest text-[#B85D38] font-semibold">
                            {formatOfferType(offer.offer_type)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${offer.is_active ? 'bg-[#EAF4EA] text-[#2F6B3F]' : 'bg-[#EFEBE3] text-[#736B63]'}`}>
                            {offer.is_active ? 'نشط' : 'متوقف مؤقتًا'}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-[#1C1A19]">{offer.name}</h4>
                        <p className="text-xs text-[#736B63]">
                          {offer.products.length} {offer.products.length === 1 ? 'منتج' : 'منتجات'} · سعر العرض {formatCurrency(offer.offer_price)}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setEditingOffer(createOfferDraft(offer))}
                          className="p-2 rounded-full text-[#524B45] hover:bg-[#FAF8F5] hover:text-[#1C1A19]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => requestDeleteConfirmation(
                            `حذف العرض: «${offer.name}»`,
                            'سيؤدي هذا الإجراء إلى حذف العرض نهائيًا، ولا يمكن التراجع عنه.',
                            () => { void handleDeleteOffer(offer); }
                          )}
                          disabled={deletingOfferId === offer.id}
                          className="p-2 rounded-full text-[#B85D38] hover:bg-[#FFF5F0] disabled:opacity-60"
                        >
                          {deletingOfferId === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-xl bg-[#FAF8F5] p-3 min-w-0">
                        <span className="block text-[#817D75]">السعر الأصلي</span>
                        <span className="font-mono text-[#1C1A19] break-words">{formatCurrency(offer.original_price)}</span>
                      </div>
                      <div className="rounded-xl bg-[#FAF8F5] p-3 min-w-0">
                        <span className="block text-[#817D75]">الخصم</span>
                        <span className="font-mono text-[#1C1A19] break-words">{formatCurrency(offer.discount_amount)}</span>
                      </div>
                      <div className="rounded-xl bg-[#FAF8F5] p-3 min-w-0">
                        <span className="block text-[#817D75]">بعد الخصم</span>
                        <span className="font-mono text-[#1C1A19] break-words">{formatCurrency(offer.offer_price)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {offer.products.map((item) => (
                        <div key={`${offer.id}-${item.product_id}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#EAE4DC] px-3 py-2 text-xs">
                          <span className="text-[#1C1A19] line-clamp-1">{item.product_name}</span>
                          <span className="font-mono text-[#736B63] shrink-0">× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 9: COLLABORATIONS ----------------- */}
        {activeTab === 'collaborations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
                  الشراكات
                </h3>
                <p className="text-xs text-[#736B63]">
                  أدر صور الجهات الشريكة ومحتواها.
                </p>
              </div>
              <button
                onClick={() => setEditingCollaboration(createCollaborationDraft())}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#332F2D]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة شريك</span>
              </button>
            </div>

            {collaborationsError && (
              <div className="flex items-start gap-2 rounded-2xl border border-[#E2B6A2] bg-[#FFF5F0] px-4 py-3 text-xs text-[#8A3D25]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{collaborationsError}</span>
              </div>
            )}

            {isCollaborationsLoading ? (
              <SkeletonCardGrid count={6} imageAspectClassName="aspect-[4/3]" />
            ) : collaborations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D8CEBF] bg-white p-8 text-center">
                <p className="text-sm text-[#17324A]">لا توجد جهات تعاون منشورة.</p>
                <p className="text-xs text-[#6D6A64] mt-1">ارفع صورة لإضافة أول جهة تعاون.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborations.map((collaboration) => (
                  <div key={collaboration.id} className="rounded-2xl bg-white border border-[#EAE4DC] shadow-sm overflow-hidden">
                    <div className="relative aspect-[4/3] bg-[#EFEBE3]">
                      <Image
                        src={collaboration.image}
                        alt={collaboration.title}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-semibold text-[#A36046]">شريك مودرن هوم</span>
                        <h4 className="text-base font-semibold text-[#1C1A19] mt-1">{collaboration.title}</h4>
                      </div>
                      <div className="pt-2 border-t border-[#EAE4DC] flex justify-end">
                        <button
                          onClick={() => requestDeleteConfirmation(
                            `حذف الشراكة: «${collaboration.title}»`,
                            'سيؤدي هذا الإجراء إلى حذف الشراكة نهائيًا، ولا يمكن التراجع عنه.',
                            () => { void handleDeleteCollaboration(collaboration); }
                          )}
                          disabled={deletingCollaborationId === collaboration.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs uppercase tracking-wider text-[#B85D38] hover:bg-[#FFF5F0] disabled:opacity-60"
                        >
                          {deletingCollaborationId === collaboration.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB: COLORS ----------------- */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
                  الألوان
                </h3>
                <p className="text-xs text-[#736B63]">
                  أدر مجموعة الألوان المتاحة لاختيارها في المنتجات.
                </p>
              </div>
              <button
                onClick={() => setEditingColor(createColorDraft())}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#332F2D]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة لون</span>
              </button>
            </div>

            {colorsError && (
              <div className="flex items-start gap-2 rounded-2xl border border-[#E2B6A2] bg-[#FFF5F0] px-4 py-3 text-xs text-[#8A3D25]">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{colorsError}</span>
              </div>
            )}

            {isColorsLoading ? (
              <SkeletonCardGrid count={6} columnsClassName="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" showImage={false} />
            ) : colors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#D8CEBF] bg-white p-8 text-center">
                <p className="text-sm text-[#17324A]">لم تتم إضافة ألوان بعد.</p>
                <p className="text-xs text-[#6D6A64] mt-1">أضف لونًا لإتاحته في نماذج المنتجات.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {colors.map((color) => (
                  <div key={color.id} className="rounded-2xl bg-white border border-[#EAE4DC] shadow-sm p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="w-9 h-9 rounded-full border border-[#D8CEBF] shrink-0"
                        style={{ backgroundColor: color.hex_code }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#1C1A19] truncate">{color.name}</p>
                        <p className="text-[11px] font-mono text-[#736B63]">{color.hex_code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingColor(createColorDraft(color))}
                        className="p-1.5 text-[#524B45] hover:text-[#1C1A19] hover:bg-[#EFEBE3] rounded-lg transition-colors"
                        title="تعديل اللون"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => requestDeleteConfirmation(
                          `حذف اللون: «${color.name}»`,
                          'سيؤدي هذا الإجراء إلى حذف اللون نهائيًا، ولا يمكن التراجع عنه.',
                          () => { void handleDeleteColor(color); }
                        )}
                        disabled={deletingColorId === color.id}
                        className="p-1.5 text-[#B85D38] hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-60"
                        title="حذف اللون"
                      >
                        {deletingColorId === color.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 10: SETTINGS & CMS ----------------- */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
                إعدادات المتجر والدفع العامة
              </h3>
              <p className="text-xs text-[#736B63]">
                أدر نسبة المقدم وبيانات وسائل الدفع المحفوظة.
              </p>
            </div>

            {/* Deposit Configuration */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DC] shadow-sm space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1C1A19]">
                إعدادات المقدم
              </h4>
              <div className="text-xs">
                <div>
                  <label className="block text-[#6D6A64] mb-1">نسبة المقدم (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={depositPercentageValue}
                    onChange={(e) =>
                      setDepositPercentageDraft({ source: settings.depositPercentage, value: e.target.value })
                    }
                    onBlur={() => {
                      const value = Number(depositPercentageValue);
                      if (depositPercentageValue !== '' && Number.isFinite(value) && value >= 0 && value <= 100) {
                        updateSettings({ depositPercentage: value });
                      } else {
                        setDepositPercentageDraft({
                          source: settings.depositPercentage,
                          value: String(settings.depositPercentage),
                        });
                      }
                    }}
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Payment Methods Configuration */}
            <div className="p-6 rounded-2xl bg-white border border-[#EAE4DC] shadow-sm space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1C1A19]">
                وسائل الدفع
              </h4>

              {/* InstaPay */}
              <div className="space-y-2 text-xs">
                <label className="block font-medium text-[#17324A]">عنوان إنستا باي</label>
                <input
                  type="text"
                  value={instapayAddressValue}
                  onChange={(e) =>
                    setInstapayAddressDraft({
                      source: settings.paymentMethods.instapay.address,
                      value: e.target.value,
                    })
                  }
                  onBlur={() =>
                    updateSettings({
                      paymentMethods: {
                        ...settings.paymentMethods,
                        instapay: { ...settings.paymentMethods.instapay, address: instapayAddressValue },
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                />
              </div>

              {/* Mobile Wallet */}
              <div className="space-y-2 text-xs">
                <label className="block font-medium text-[#17324A]">المحفظة الإلكترونية (فودافون، أورنج، إي آند، وي)</label>
                <input
                  type="text"
                  value={mobileWalletValue}
                  onChange={(e) =>
                    setMobileWalletDraft({
                      source: settings.paymentMethods.mobileWallet.number,
                      value: e.target.value,
                    })
                  }
                  onBlur={() =>
                    updateSettings({
                      paymentMethods: {
                        ...settings.paymentMethods,
                        mobileWallet: {
                          ...settings.paymentMethods.mobileWallet,
                          number: mobileWalletValue,
                        },
                      },
                    })
                  }
                  className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                />
              </div>

            </div>
          </div>
        )}

        {/* ----------------- MODAL: EDIT PRODUCT ----------------- */}
        {isProductModalOpen && editingProduct && (
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="محرر المنتج" tabIndex={-1} onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 border border-[#EAE4DC] shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-4 border-b border-[#EAE4DC]">
                <h3 className="text-lg font-medium text-[#1C1A19]">
                  {editingProduct.name ? `تعديل: ${editingProduct.name}` : 'إنشاء منتج جديد'}
                </h3>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="p-1 text-[#736B63] hover:text-[#1C1A19]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">اسم المنتج *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          name: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">التصنيف</label>
                    <select
                      value={editingProduct.categoryId}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, categoryId: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4DC]">
                  <label className="block text-[#17324A] font-medium mb-1">السعر (جنيه)</label>
                  <input
                    type="number"
                    value={editingProduct.price || 0}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#17324A] font-medium mb-1">الوصف</label>
                  <textarea
                    rows={3}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">الأبعاد</label>
                    <input
                      type="text"
                      value={editingProduct.dimensions}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, dimensions: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">أيام التوصيل</label>
                    <input
                      type="number"
                      min="0"
                      value={editingProduct.deliveryDays ?? ''}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setEditingProduct({
                          ...editingProduct,
                          deliveryDays: nextValue === '' ? null : Number(nextValue),
                          leadTime: nextValue === '' ? '' : `${Number(nextValue)} يوم`,
                        });
                      }}
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">الخامة</label>
                    <input
                      type="text"
                      value={editingProduct.material}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, material: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">التشطيب</label>
                    <div className="flex gap-2 p-2.5 rounded-lg border border-[#D8CEBF] bg-white">
                      {(['MATTE', 'GLOSSY'] as ProductFinish[]).map((finish) => {
                        const checked = editingProduct.finishes.includes(finish);
                        return (
                          <label key={finish} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setEditingProduct({
                                  ...editingProduct,
                                  finishes: checked
                                    ? editingProduct.finishes.filter((item) => item !== finish)
                                    : [...editingProduct.finishes, finish],
                                })
                              }
                              className="rounded border-[#D8CEBF]"
                            />
                            <span>{finish === 'MATTE' ? 'مطفي' : 'لامع'}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#17324A] font-medium mb-1">الأقسام الفرعية *</label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-[#D8CEBF] bg-[#FAF8F5] max-h-32 overflow-y-auto">
                    {subcategories.length === 0 ? (
                      <p className="text-[#817D75]">لا توجد أقسام فرعية متاحة.</p>
                    ) : (
                      subcategories.map((sub) => {
                        const subId = String(sub.id);
                        const checked = editingProduct.subcategoryIds.includes(subId);
                        const parentCategory = categories.find((c) => c.id === String(sub.category_id));
                        return (
                          <label
                            key={sub.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] cursor-pointer ${
                              checked ? 'bg-[#1C1A19] text-white border-[#1C1A19]' : 'bg-white border-[#D8CEBF] text-[#524B45]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setEditingProduct({
                                  ...editingProduct,
                                  subcategoryIds: checked
                                    ? editingProduct.subcategoryIds.filter((id) => id !== subId)
                                    : [...editingProduct.subcategoryIds, subId],
                                })
                              }
                              className="hidden"
                            />
                            <span>{parentCategory ? `${parentCategory.name} · ${sub.name}` : sub.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[#17324A] font-medium mb-1">الألوان</label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-[#D8CEBF] bg-[#FAF8F5] max-h-32 overflow-y-auto">
                    {colors.length === 0 ? (
                      <p className="text-[#8F8880]">
                        لا توجد ألوان متاحة بعد. أضف لونًا من تبويب الألوان.
                      </p>
                    ) : (
                      colors.map((color) => {
                        const checked = editingProduct.colors.some((c) => c.id === String(color.id));
                        return (
                          <label
                            key={color.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] cursor-pointer ${
                              checked ? 'bg-[#1C1A19] text-white border-[#1C1A19]' : 'bg-white border-[#D8CEBF] text-[#524B45]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProductColor(color)}
                              className="hidden"
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: color.hex_code }}
                            />
                            <span>{color.name}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Direct Cloudinary Image Uploader & Gallery */}
                <div className="pt-2">
                  <CloudinaryImageUploader
                    productId={editingProduct.id}
                    images={editingProduct.images || []}
                    onImagesChange={(newImages) =>
                      setEditingProduct({
                        ...editingProduct,
                        images: newImages,
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isFeatured}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })
                      }
                      className="rounded border-[#D8CEBF]"
                    />
                    <span>إظهار في الصفحة الرئيسية</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE4DC] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#736B63]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => { void handleSaveProduct(); }}
                  className="px-6 py-2.5 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium"
                >
                  حفظ المنتج
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MODAL: EDIT CATEGORY ----------------- */}
        {isCategoryModalOpen && editingCategory && (
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="محرر التصنيف" tabIndex={-1} onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#EAE4DC] shadow-xl">
              <h3 className="text-base font-semibold text-[#17324A]">تفاصيل التصنيف</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#17324A] mb-1">اسم التصنيف</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>
                <div>
                  <label className="block text-[#17324A] mb-1">الوصف</label>
                  <textarea
                    rows={2}
                    value={editingCategory.description}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, description: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>
                <CloudinaryImageField
                  label="صورة الغلاف"
                  value={editingCategory.image}
                  folder="tocco/categories"
                  onChange={(image) => setEditingCategory({ ...editingCategory, image })}
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#736B63]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingCategory.name.trim()) {
                      saveCategory(editingCategory);
                      setIsCategoryModalOpen(false);
                    }
                  }}
                  className="px-5 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider"
                >
                  حفظ التصنيف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MODAL: EDIT EVENT ----------------- */}
        {isEventModalOpen && editingEvent && (
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="محرر الفعالية" tabIndex={-1} onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setEventSaveError(null);
                if (!editingEvent.title.trim()) {
                  setEventSaveError('أدخل اسم الفعالية.');
                  return;
                }
                if (!editingEvent.date) {
                  setEventSaveError('اختر تاريخ الفعالية.');
                  return;
                }
                if (!editingEvent.coverImage || !editingEvent.publicId) {
                  setEventSaveError('ارفع صورة الغلاف قبل الحفظ.');
                  return;
                }

                setIsEventSaving(true);
                try {
                  await saveEvent(editingEvent);
                  setIsEventModalOpen(false);
                } catch (err) {
                  setEventSaveError(normalizeApiError(err).message);
                } finally {
                  setIsEventSaving(false);
                }
              }}
              className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 my-8 border border-[#EAE4DC] shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 space-y-1">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-[#1C1A19]">
                    {Number.isInteger(Number(editingEvent.id)) ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#736B63]">
                    الحقول المميزة بعلامة <span className="text-rose-600">*</span> مطلوبة. ارفع صورة الغلاف قبل الحفظ.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEventSaveError(null);
                    setIsEventModalOpen(false);
                  }}
                  className="p-1 text-[#736B63] hover:text-[#1C1A19] shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {eventSaveError && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{eventSaveError}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <label className="mb-1 block font-medium text-[#1C1A19]">
                    اسم الفعالية <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingEvent.title}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    placeholder="مثال: معرض مودرن هوم للأثاث"
                    className="w-full rounded-lg border border-[#D8CEBF] p-2.5 text-[#1C1A19] outline-none focus:border-[#1C1A19]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-medium text-[#17324A]">الموقع <span className="font-normal text-[#817D75]">(اختياري)</span></label>
                    <input
                      type="text"
                      value={editingEvent.location}
                      onChange={(e) =>
                        setEditingEvent({ ...editingEvent, location: e.target.value })
                      }
                      placeholder="مثال: القاهرة الجديدة"
                      className="w-full rounded-lg border border-[#D8CEBF] p-2.5 text-[#1C1A19] outline-none focus:border-[#1C1A19]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-[#1C1A19]">
                      تاريخ الفعالية <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={editingEvent.date}
                      onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                      className="w-full rounded-lg border border-[#D8CEBF] p-2.5 text-[#1C1A19] outline-none focus:border-[#1C1A19]"
                    />
                  </div>
                </div>
                <CloudinaryImageField
                  label="صورة الغلاف"
                  required
                  value={editingEvent.coverImage}
                  folder="tocco/events"
                  onChange={(coverImage) =>
                    setEditingEvent({
                      ...editingEvent,
                      coverImage,
                      publicId: coverImage ? editingEvent.publicId : '',
                    })
                  }
                  onUploadResult={(result) =>
                    setEditingEvent({
                      ...editingEvent,
                      coverImage: result.secure_url || result.url,
                      publicId: result.public_id,
                    })
                  }
                />
                <div>
                  <label className="mb-1 block font-medium text-[#1C1A19]">
                    الوصف <span className="font-normal text-[#817D75]">(اختياري)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={editingEvent.description}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, description: e.target.value })
                    }
                    placeholder="أضف وصفًا مختصرًا للفعالية."
                    className="w-full rounded-lg border border-[#D8CEBF] p-2.5 text-[#1C1A19] outline-none focus:border-[#1C1A19]"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEventSaveError(null);
                    setIsEventModalOpen(false);
                  }}
                  disabled={isEventSaving}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#736B63] disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isEventSaving}
                  className="inline-flex min-w-32 items-center justify-center gap-2 rounded-full bg-[#1C1A19] px-5 py-2 text-xs uppercase tracking-wider text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEventSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isEventSaving ? 'جارٍ الحفظ...' : 'حفظ الفعالية'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------- MODAL: EDIT PROJECT ----------------- */}
        {isProjectModalOpen && editingProject && (
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="محرر المشروع" tabIndex={-1} onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 my-8 border border-[#EAE4DC] shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#17324A]">صورة المشروع</h3>
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="p-1 text-[#736B63] hover:text-[#1C1A19]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#17324A] mb-1">اسم العميل أو المشروع</label>
                  <input
                    type="text"
                    value={editingProject.customerName || editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, customerName: e.target.value, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>
                <div>
                  <label className="block text-[#17324A] mb-1">وصف المشروع</label>
                  <textarea
                    rows={3}
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>
                <div>
                  <label className="block text-[#17324A] mb-1">الموقع <span className="font-normal text-[#817D75]">(اختياري)</span></label>
                  <input
                    type="text"
                    value={editingProject.location}
                    onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>
                <CloudinaryImageField
                  label="صورة المشروع"
                  required
                  value={editingProject.coverImage}
                  folder="space_projects"
                  onChange={(coverImage) => setEditingProject({ ...editingProject, coverImage })}
                  onUploadResult={(result) => setEditingProject({ ...editingProject, publicId: result.public_id, coverImage: result.secure_url || result.url })}
                />
                <div>
                  <label className="block text-[#17324A] mb-1">منتج مرتبط (اختياري)</label>
                  <select
                    value={editingProject.productId || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, productId: e.target.value || undefined })}
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF] bg-white"
                  >
                    <option value="">بدون منتج مرتبط</option>
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#736B63]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleSaveProject();
                  }}
                  className="px-5 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider"
                >
                  حفظ المشروع
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ----------------- MODAL: EDIT OFFER ----------------- */}
        {editingOffer && (
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="محرر العرض" tabIndex={-1} onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 border border-[#EAE4DC] shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EAE4DC]">
                <div>
                  <h3 className="text-lg font-medium text-[#1C1A19]">
                    {editingOffer.id ? 'تعديل العرض' : 'إنشاء عرض'}
                  </h3>
                  <p className="text-xs text-[#6D6A64] mt-1">أنشئ عرضًا ليظهر للعملاء في المنتجات.</p>
                </div>
                <button
                  onClick={() => setEditingOffer(null)}
                  className="p-1 text-[#736B63] hover:text-[#1C1A19]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {offersError && (
                <div className="flex items-start gap-2 rounded-xl border border-[#E2B6A2] bg-[#FFF5F0] px-3 py-2 text-xs text-[#8A3D25]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{offersError}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">اسم العرض *</label>
                    <input
                      type="text"
                      value={editingOffer.name}
                      onChange={(e) => setEditingOffer({ ...editingOffer, name: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">نوع العرض</label>
                    <select
                      value={editingOffer.offer_type}
                      onChange={(e) => setEditingOffer({
                        ...editingOffer,
                        offer_type: e.target.value as OfferType,
                        percentage: e.target.value === 'PERCENTAGE' ? '' : editingOffer.percentage,
                        bundle_price: e.target.value === 'BUNDLE' ? '' : editingOffer.bundle_price,
                      })}
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF] bg-white"
                    >
                      <option value="PERCENTAGE">خصم بنسبة مئوية</option>
                      <option value="BUNDLE">سعر مجموعة</option>
                      <option value="FREE_SHIPPING">شحن مجاني</option>
                    </select>
                    <p className="mt-1 text-[10px] text-[#736B63]">
                      يتطلب تغيير نوع العرض إدخال قيمة جديدة مناسبة.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE4DC]">
                  {editingOffer.offer_type === 'PERCENTAGE' && (
                    <div>
                      <label className="block text-[#17324A] font-medium mb-1">نسبة الخصم (%) *</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={editingOffer.percentage}
                        onChange={(e) => {
                          setOffersError(null);
                          setEditingOffer({ ...editingOffer, percentage: e.target.value });
                        }}
                        className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono bg-white"
                      />
                      <p className="mt-1 text-[10px] text-[#736B63]">
                        القيمة الإجمالية الحالية للمنتجات: {formatCurrency(getOfferListedValue(editingOffer.products, products))}. يشمل ذلك تكرار المنتجات والكميات. لا يمكن أن يتجاوز سعر المجموعة هذه القيمة.
                      </p>
                    </div>
                  )}
                  {editingOffer.offer_type === 'BUNDLE' && (
                    <div>
                      <label className="block text-[#17324A] font-medium mb-1">سعر المجموعة (جنيه) *</label>
                      <input
                        type="number"
                        min="1"
                        value={editingOffer.bundle_price}
                        onChange={(e) => {
                          setOffersError(null);
                          setEditingOffer({ ...editingOffer, bundle_price: e.target.value });
                        }}
                        className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono bg-white"
                      />
                      <p className="mt-1 text-[10px] text-[#736B63]">
                        القيمة الإجمالية للكميات المختارة: {formatCurrency(getOfferListedValue(editingOffer.products, products))}. يجب ألا يتجاوز سعر المجموعة هذا المبلغ.
                      </p>
                    </div>
                  )}
                  <label className="flex items-center gap-2 self-end pb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingOffer.is_active}
                      onChange={(e) => setEditingOffer({ ...editingOffer, is_active: e.target.checked })}
                      className="rounded border-[#D8CEBF]"
                    />
                    <span className="font-medium text-[#17324A]">نشط</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-[#17324A] font-medium">المنتجات المشمولة *</label>
                    <button
                      type="button"
                      onClick={() => setEditingOffer({
                        ...editingOffer,
                        products: [...editingOffer.products, { product_id: products[0]?.id || '', quantity: '1' }],
                      })}
                      className="text-[11px] uppercase tracking-wider text-[#B85D38] hover:text-[#1C1A19]"
                    >
                      إضافة منتج
                    </button>
                  </div>
                  {editingOffer.products.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_84px_32px] gap-2 items-center">
                      <select
                        value={item.product_id}
                        onChange={(e) => {
                          const nextProducts = editingOffer.products.map((current, itemIndex) =>
                            itemIndex === index ? { ...current, product_id: e.target.value } : current
                          );
                          setEditingOffer({ ...editingOffer, products: nextProducts });
                        }}
                        className="w-full p-2.5 rounded-lg border border-[#D8CEBF] bg-white min-w-0"
                      >
                        <option value="">اختر منتجًا</option>
                        {products
                          .filter((product) => Number.isInteger(Number(product.id)))
                          .map((product) => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const nextProducts = editingOffer.products.map((current, itemIndex) =>
                            itemIndex === index ? { ...current, quantity: e.target.value } : current
                          );
                          setEditingOffer({ ...editingOffer, products: nextProducts });
                        }}
                        className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingOffer({
                          ...editingOffer,
                          products: editingOffer.products.filter((_, itemIndex) => itemIndex !== index),
                        })}
                        disabled={editingOffer.products.length === 1}
                        className="p-2 text-[#B85D38] disabled:text-[#C9C0B4]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">يبدأ في</label>
                    <input
                      type="datetime-local"
                      value={editingOffer.starts_at}
                      onChange={(e) => setEditingOffer({ ...editingOffer, starts_at: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">ينتهي في</label>
                    <input
                      type="datetime-local"
                      value={editingOffer.ends_at}
                      onChange={(e) => setEditingOffer({ ...editingOffer, ends_at: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE4DC] flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingOffer(null)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#736B63]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveOffer}
                  disabled={isOfferSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium disabled:opacity-70"
                >
                  {isOfferSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ العرض</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- MODAL: EDIT COLLABORATION ----------------- */}
        {editingCollaboration && (
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="محرر الشريك" tabIndex={-1} onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 my-8 border border-[#EAE4DC] shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EAE4DC]">
                <div>
                  <h3 className="text-base font-semibold text-[#17324A]">تفاصيل الشريك</h3>
                  <p className="text-xs text-[#6D6A64] mt-1">ارفع صورة الشريك وراجعها قبل الحفظ.</p>
                </div>
                <button
                  onClick={() => setEditingCollaboration(null)}
                  className="p-1 text-[#736B63] hover:text-[#1C1A19]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {collaborationsError && (
                <div className="flex items-start gap-2 rounded-xl border border-[#E2B6A2] bg-[#FFF5F0] px-3 py-2 text-xs text-[#8A3D25]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{collaborationsError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#17324A] font-medium mb-1">الاسم *</label>
                  <input
                    type="text"
                    value={editingCollaboration.title}
                    onChange={(e) => setEditingCollaboration({ ...editingCollaboration, title: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>
                <CloudinaryImageField
                  label="صورة الشريك"
                  required
                  value={editingCollaboration.image}
                  folder="tocco/collaborations"
                  onChange={(image) =>
                    setEditingCollaboration({
                      ...editingCollaboration,
                      image,
                      public_id: image ? editingCollaboration.public_id : '',
                    })
                  }
                  onUploadResult={(result) =>
                    setEditingCollaboration({
                      ...editingCollaboration,
                      image: result.secure_url || result.url,
                      public_id: result.public_id,
                    })
                  }
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCollaboration(null)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#736B63]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveCollaboration}
                  disabled={isCollaborationSaving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider disabled:opacity-70"
                >
                  {isCollaborationSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ الشريك</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ----------------- MODAL: EDIT COLOR ----------------- */}
        {editingColor && (
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="محرر اللون" tabIndex={-1} onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 my-8 border border-[#EAE4DC] shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EAE4DC]">
                <div>
                  <h3 className="text-base font-medium text-[#1C1A19]">
                    {editingColor.id ? 'تعديل اللون' : 'إضافة لون'}
                  </h3>
                  <p className="text-xs text-[#6D6A64] mt-1">ستظهر الألوان في نماذج المنتجات.</p>
                </div>
                <button
                  onClick={() => setEditingColor(null)}
                  className="p-1 text-[#736B63] hover:text-[#1C1A19]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {colorsError && (
                <div className="flex items-start gap-2 rounded-xl border border-[#E2B6A2] bg-[#FFF5F0] px-3 py-2 text-xs text-[#8A3D25]">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{colorsError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#17324A] font-medium mb-1">اسم اللون *</label>
                  <input
                    type="text"
                    value={editingColor.name}
                    onChange={(e) => setEditingColor({ ...editingColor, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>
                <div>
                  <label className="block text-[#17324A] font-medium mb-1">رمز اللون *</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={editingColor.hex_code}
                      onChange={(e) => setEditingColor({ ...editingColor, hex_code: e.target.value.toUpperCase() })}
                      className="w-10 h-10 rounded-lg border border-[#D8CEBF] p-0.5 shrink-0"
                    />
                    <input
                      type="text"
                      value={editingColor.hex_code}
                      onChange={(e) => setEditingColor({ ...editingColor, hex_code: e.target.value.toUpperCase() })}
                      placeholder="#EBE3D5"
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingColor(null)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#736B63]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleSaveColor}
                  disabled={isColorSaving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider disabled:opacity-70"
                >
                  {isColorSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ اللون</span>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ----------------- MODAL: EDIT BANNER ----------------- */}
        {isBannerModalOpen && editingBanner && (
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="محرر الإعلان" tabIndex={-1} onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-5 my-8 border border-[#EAE4DC] shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-4 border-b border-[#EAE4DC]">
                <h3 className="text-lg font-medium text-[#1C1A19]">
                  {editingBanner.title ? `تعديل: ${editingBanner.title}` : 'إنشاء إعلان جديد'}
                </h3>
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  className="p-1 text-[#736B63] hover:text-[#1C1A19]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">نوع الإعلان *</label>
                    <select
                      value={editingBanner.type}
                      onChange={(e) => {
                        const t = e.target.value as any;
                        let catLabel = 'وصل حديثًا';
                        if (t === 'special_offer') catLabel = 'عرض خاص';
                        if (t === 'upcoming_event') catLabel = 'فعالية';
                        if (t === 'custom_service') catLabel = 'تصنيع حسب الطلب';
                        setEditingBanner({
                          ...editingBanner,
                          type: t,
                          categoryLabel: catLabel,
                        });
                      }}
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF] bg-white"
                    >
                      <option value="new_product">منتج جديد</option>
                      <option value="special_offer">عرض خاص</option>
                      <option value="upcoming_event">فعالية قادمة</option>
                      <option value="custom_service">تصنيع حسب الطلب</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">نص الشارة *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مجموعة جديدة"
                      value={editingBanner.badgeText}
                      onChange={(e) =>
                        setEditingBanner({ ...editingBanner, badgeText: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#17324A] font-medium mb-1">عنوان الإعلان *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: طاولة سفرة مودرن"
                    value={editingBanner.title}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, title: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>

                <div>
                  <label className="block text-[#17324A] font-medium mb-1">الوصف *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="أضف تفاصيل المنتج أو الفعالية أو العرض..."
                    value={editingBanner.subtitle}
                    onChange={(e) =>
                      setEditingBanner({ ...editingBanner, subtitle: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">عنوان مختصر أو وسم</label>
                    <input
                      type="text"
                      placeholder="مثال: عرض لفترة محدودة أو رمز: عيد١٠"
                      value={editingBanner.tagHighlight || ''}
                      onChange={(e) =>
                        setEditingBanner({ ...editingBanner, tagHighlight: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">كود العرض (إن وجد)</label>
                    <input
                      type="text"
                      placeholder="عيد١٠"
                      value={editingBanner.promoCode || ''}
                      onChange={(e) =>
                        setEditingBanner({
                          ...editingBanner,
                          promoCode: e.target.value,
                          actionType: e.target.value ? 'copy_code' : 'navigate',
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">نص الزر *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: اكتشف المنتج"
                      value={editingBanner.ctaText}
                      onChange={(e) =>
                        setEditingBanner({ ...editingBanner, ctaText: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#17324A] font-medium mb-1">الصفحة المستهدفة</label>
                    <select
                      value={editingBanner.targetView || 'shop'}
                      onChange={(e) =>
                        setEditingBanner({ ...editingBanner, targetView: e.target.value })
                      }
                      className="w-full p-2.5 rounded-lg border border-[#D8CEBF] bg-white"
                    >
                      <option value="shop">المنتجات</option>
                      <option value="events">الفعاليات والمعارض</option>
                      <option value="custom-design">التصنيع حسب الطلب</option>
                      <option value="our-story">عن مودرن هوم</option>
                    </select>
                  </div>
                </div>

                <CloudinaryImageField
                  label="صورة الخلفية"
                  required
                  value={editingBanner.image}
                  folder="tocco/banners"
                  onChange={(image) => setEditingBanner({ ...editingBanner, image })}
                />

                <div className="flex items-center gap-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingBanner.isActive}
                      onChange={(e) =>
                        setEditingBanner({ ...editingBanner, isActive: e.target.checked })
                      }
                      className="rounded border-[#D8CEBF]"
                    />
                    <span className="font-medium text-[#17324A]">نشط (يظهر في الصفحة الرئيسية)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE4DC] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#736B63]"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingBanner.title.trim()) {
                      saveBanner(editingBanner);
                      setIsBannerModalOpen(false);
                    }
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#332F2D]"
                >
                  حفظ الإعلان
                </button>
              </div>
            </div>
          </div>
        )}
        <ConfirmDialog
          isOpen={Boolean(pendingDelete)}
          title={pendingDelete?.title || 'تأكيد الحذف'}
          description={pendingDelete?.description || ''}
          confirmLabel="حذف"
          isLoading={isDeleteProcessing}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handlePendingDelete}
        />
      </div>
    </div>
  );
}
