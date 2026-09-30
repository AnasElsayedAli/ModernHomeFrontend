'use client';

import React, { useState, useEffect } from 'react';
import { useToccoStore } from '@/lib/store';
import { toWhatsAppNumber } from '@/lib/utils';
import { useAuth } from '@/lib/context/AuthContext';
import { Order, OrderStatus, PaymentStatus } from '@/types';
import { Address } from '@/types/auth';
import { orderService } from '@/lib/api/services/orderService';
import { BackendOrder, BackendOrderStatus } from '@/types/order';
import { normalizeApiError } from '@/lib/api/errors';
import ProfileSection from './ProfileSection';
import SafeImage from './SafeImage';
import { useAccessibleDialog } from '@/hooks/use-accessible-dialog';
import {
  User,
  Package,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Check,
  Lock,
  Star,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  MessageCircle,
  X,
  Copy,
} from 'lucide-react';


export default function AccountView() {
  const { orders, submitPaymentProof, settings, navigateTo } = useToccoStore();
  const {
    user,
    profile,
    addresses,
    isLoading: isAuthLoading,
    isAddressesLoading,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAuth();

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');
  const [copiedReferenceId, setCopiedReferenceId] = useState<number | null>(null);

  // Auth Mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutNeedsRetry, setLogoutNeedsRetry] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authFieldErrors, setAuthFieldErrors] = useState<Record<string, string[]>>({});

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Address Modals & Forms
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressTitle, setAddressTitle] = useState('');
  const [addressCountry, setAddressCountry] = useState('Egypt');
  const [addressCity, setAddressCity] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressBuildingNumber, setAddressBuildingNumber] = useState('');
  const [addressApartmentNumber, setAddressApartmentNumber] = useState('');
  const [addressIsDefault, setAddressIsDefault] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressFieldErrors, setAddressFieldErrors] = useState<Record<string, string[]>>({});

  // Delete Address Confirm
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

  // Order Details & Proof
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [proofInput, setProofInput] = useState('');

  // Real Backend Orders state
  const [backendOrders, setBackendOrders] = useState<BackendOrder[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersLoadedForUser, setOrdersLoadedForUser] = useState<typeof user>(null);
  const isOrdersViewLoading = isOrdersLoading || Boolean(user && ordersLoadedForUser !== user);
  const closeAddressDialog = () => {
    if (showAddressModal) {
      setShowAddressModal(false);
    } else {
      setDeletingAddressId(null);
    }
  };
  const { dialogRef, handleDialogKeyDown } = useAccessibleDialog(
    showAddressModal || deletingAddressId !== null,
    closeAddressDialog,
    addressLoading
  );

  const handleLogout = async () => {
    setAuthError(null);
    setIsLoggingOut(true);
    try {
      await logout();
      setLogoutNeedsRetry(false);
    } catch (err) {
      setLogoutNeedsRetry(true);
      setAuthError(normalizeApiError(err).message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const fetchMyOrders = React.useCallback(async () => {
    if (!user) return;
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await orderService.getMyOrders();
      setBackendOrders(data);
      setOrdersLoadedForUser(user);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setOrdersError(normalized.message);
      setOrdersLoadedForUser(user);
    } finally {
      setIsOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const timer = window.setTimeout(() => {
      setIsOrdersLoading(true);
      setOrdersError(null);
      orderService
        .getMyOrders()
        .then((data) => {
          if (!active) return;
          setBackendOrders(data);
          setOrdersLoadedForUser(user);
        })
        .catch((err) => {
          if (!active) return;
          setOrdersError(normalizeApiError(err).message);
          setOrdersLoadedForUser(user);
        })
        .finally(() => {
          if (active) setIsOrdersLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [user]);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthFieldErrors({});
    setAuthLoading(true);
    try {
      await login({
        email: loginEmail,
        password: loginPassword,
      });
      setLogoutNeedsRetry(false);
      setLoginPassword('');
    } catch (err) {
      const normalized = normalizeApiError(err);
      setAuthError(normalized.message);
      setAuthFieldErrors(normalized.fieldErrors);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthFieldErrors({});
    setAuthLoading(true);
    try {
      await register({
        first_name: regFirstName,
        last_name: regLastName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });
      setLogoutNeedsRetry(false);
      setRegPassword('');
    } catch (err) {
      const normalized = normalizeApiError(err);
      setAuthError(normalized.message);
      setAuthFieldErrors(normalized.fieldErrors);
    } finally {
      setAuthLoading(false);
    }
  };

  // Address Modal opener
  const openCreateAddressModal = () => {
    setEditingAddress(null);
    setAddressTitle('Sahel Summer Villa');
    setAddressCountry('Egypt');
    setAddressCity('Matrouh');
    setAddressStreet('Catania Village, Villa 42');
    setAddressBuildingNumber('42');
    setAddressApartmentNumber('1');
    setAddressIsDefault(addresses.length === 0);
    setAddressError(null);
    setAddressFieldErrors({});
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr: Address) => {
    setEditingAddress(addr);
    setAddressTitle(addr.title);
    setAddressCountry(addr.country);
    setAddressCity(addr.city);
    setAddressStreet(addr.street);
    setAddressBuildingNumber(addr.building_number);
    setAddressApartmentNumber(addr.apartment_number);
    setAddressIsDefault(addr.is_default);
    setAddressError(null);
    setAddressFieldErrors({});
    setShowAddressModal(true);
  };

  // Save Address (Create or Update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressLoading(true);
    setAddressError(null);
    setAddressFieldErrors({});

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, {
          title: addressTitle,
          country: addressCountry,
          city: addressCity,
          street: addressStreet,
          building_number: addressBuildingNumber,
          apartment_number: addressApartmentNumber,
          is_default: addressIsDefault,
        });
      } else {
        await createAddress({
          title: addressTitle,
          country: addressCountry,
          city: addressCity,
          street: addressStreet,
          building_number: addressBuildingNumber,
          apartment_number: addressApartmentNumber,
          is_default: addressIsDefault,
        });
      }
      setShowAddressModal(false);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setAddressError(normalized.message);
      setAddressFieldErrors(normalized.fieldErrors);
    } finally {
      setAddressLoading(false);
    }
  };

  // Handle Set Default Address
  const handleSetDefaultAddress = async (id: number) => {
    try {
      await setDefaultAddress(id);
    } catch (err) {
      const normalized = normalizeApiError(err);
      alert(normalized.message);
    }
  };

  // Handle Delete Address
  const handleDeleteAddress = async (id: number) => {
    try {
      await deleteAddress(id);
      setDeletingAddressId(null);
    } catch (err) {
      const normalized = normalizeApiError(err);
      alert(normalized.message);
    }
  };

  // Handle Deposit Proof Submit for Orders
  const handleProofSubmit = (orderId: string) => {
    if (!proofInput.trim()) return;
    submitPaymentProof(orderId, proofInput);
    setProofInput('');
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: 'proof_submitted',
              orderStatus: 'proof_submitted',
              paymentProofNote: proofInput,
            }
          : null
      );
    }
  };

  const getStatusBadge = (orderStatus: OrderStatus, paymentStatus: PaymentStatus) => {
    if (paymentStatus === 'pending_deposit') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3CD] text-[#856404] text-[11px] font-semibold uppercase tracking-wider">
          <AlertCircle className="w-3 h-3" />
          بانتظار المقدم ({settings.depositPercentage}%)
        </span>
      );
    }
    if (paymentStatus === 'proof_submitted' && orderStatus === 'proof_submitted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2E3E5] text-[#383D41] text-[11px] font-semibold uppercase tracking-wider">
          <Clock className="w-3 h-3" />
          تم استلام إثبات الدفع
        </span>
      );
    }
    if (orderStatus === 'in_production') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D1E7DD] text-[#0F5132] text-[11px] font-semibold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3" />
          جارٍ التنفيذ
        </span>
      );
    }
    if (orderStatus === 'ready_for_shipping') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCE5FF] text-[#004085] text-[11px] font-semibold uppercase tracking-wider">
          <Package className="w-3 h-3" />
          جاهز للتوصيل
        </span>
      );
    }
    if (orderStatus === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4EDDA] text-[#155724] text-[11px] font-semibold uppercase tracking-wider">
          <Check className="w-3 h-3" />
          تم التوصيل والتركيب
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEBE3] text-[#524B45] text-[11px] font-semibold uppercase tracking-wider">
        {orderStatus}
      </span>
    );
  };

  const getBackendStatusBadge = (status: BackendOrderStatus) => {
    if (status === 'CONFIRMED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5EE] text-[#1E6B3A] border border-[#C5E5D0] text-[11px] font-semibold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3" />
          مؤكد · جارٍ التنفيذ
        </span>
      );
    }
    if (status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F2EF] text-[#736B63] border border-[#D8CEBF] text-[11px] font-semibold uppercase tracking-wider">
          <AlertCircle className="w-3 h-3" />
          ملغي
        </span>
      );
    }
    // NOT_CONFIRMED
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E6] text-[#B85D38] border border-[#E8D5C4] text-[11px] font-semibold uppercase tracking-wider">
        <Clock className="w-3 h-3" />
        بانتظار التأكيد
      </span>
    );
  };

  return (
    <div id="account-portal-page" dir="rtl" className="min-h-screen bg-[#F7F3EC] pb-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-10 lg:px-14">
        {/* Portal Header */}
        <div className="grid grid-cols-1 gap-5 border-b border-[#DED5C9] py-7 sm:py-10 md:grid-cols-12 md:items-end md:gap-6">
          <div className="space-y-1.5 sm:space-y-2 md:col-span-8">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#A36046]">
                حساب مودرن هوم
              </span>
              {user && (
                <span
                  className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                    user.role === 'ADMIN'
                      ? 'bg-[#17324A] text-white'
                      : user.role === 'MODERATOR'
                        ? 'bg-[#A36046] text-white'
                        : 'bg-[#E8E3D9] text-[#524B45]'
                  }`}
                >
                  {user.role === 'ADMIN' ? 'مدير' : user.role === 'MODERATOR' ? 'مشرف' : 'عميل'}
                </span>
              )}
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl leading-relaxed text-[#17324A] sm:text-4xl">
              {user ? `${user.first_name} ${user.last_name}` : 'حسابي'}
            </h1>
          </div>

          {user && (
            <div className="flex flex-col items-start gap-2 md:col-span-4 md:items-end">
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="min-h-10 border-b border-[#A36046] px-1 text-xs font-semibold text-[#A36046] transition-colors hover:text-[#17324A] disabled:cursor-wait disabled:opacity-60"
              >
                {isLoggingOut ? 'جارٍ تسجيل الخروج...' : 'تسجيل الخروج'}
              </button>
              {authError && (
                <p role="alert" className="max-w-xs text-[11px] text-rose-700">{authError}</p>
              )}
            </div>
          )}
        </div>

        {/* LOADING STATE */}
        {isAuthLoading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#643D26] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#6D6A64]">جارٍ التحقق من الحساب...</p>
          </div>
        ) : !user ? (
          /* =========================================================================
             UNAUTHENTICATED: SIGN IN & REGISTRATION
             ========================================================================= */
          <div className="grid grid-cols-1 gap-0 py-7 sm:py-12 lg:grid-cols-12">
            <aside className="relative isolate flex min-h-[300px] flex-col justify-end overflow-hidden bg-[#17324A] p-6 text-white sm:min-h-[420px] sm:p-10 lg:col-span-5">
              <SafeImage
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85"
                alt="أثاث مودرن هوم داخل مساحة منزلية"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="-z-10 object-cover opacity-55"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#122A3D] via-[#17324A]/35 to-transparent" />
              <p className="text-xs font-semibold text-[#E9CBA6]">مساحة تخصك</p>
              <h2 className="mt-3 max-w-md font-[family-name:var(--font-display)] text-3xl leading-relaxed sm:text-4xl">كل تفاصيل طلبك، في مكان واحد.</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-white/80">تابع طلباتك، واحفظ عناوينك، وحدّث بيانات حسابك بسهولة.</p>
            </aside>
            <div className="py-7 sm:py-10 lg:col-span-7 lg:px-10 lg:py-8">
            <div className="space-y-5 sm:space-y-6">
              {/* Tabs: Sign In / Create Account */}
              <div className="flex border-b border-[#DED5C9] text-sm font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                    setAuthFieldErrors({});
                  }}
                  className={`flex-1 pb-3 text-center transition-all ${
                    authMode === 'login'
                      ? 'border-b-2 border-[#A36046] text-[#17324A] font-semibold'
                      : 'text-[#81786C] hover:text-[#17324A]'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                    setAuthFieldErrors({});
                  }}
                  className={`flex-1 pb-3 text-center transition-all ${
                    authMode === 'register'
                      ? 'border-b-2 border-[#A36046] text-[#17324A] font-semibold'
                      : 'text-[#81786C] hover:text-[#17324A]'
                  }`}
                >
                  إنشاء حساب
                </button>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="p-3 rounded-lg bg-[#FDF3F2] border border-[#F5C2C0] text-[#9E4A2B] text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">{authError}</p>
                    {authFieldErrors.non_field_errors && (
                      <p className="text-[11px]">{authFieldErrors.non_field_errors.join(' ')}</p>
                    )}
                    {logoutNeedsRetry && (
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        disabled={isLoggingOut}
                        className="mt-2 font-semibold underline underline-offset-2 disabled:opacity-50"
                      >
                        {isLoggingOut ? 'جارٍ تسجيل الخروج...' : 'إعادة محاولة تسجيل الخروج'}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* SIGN IN FORM */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] sm:text-xs uppercase tracking-wider text-[#1C1A19] font-medium">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full text-xs px-3.5 py-3 rounded-lg bg-[#FAF8F5] border text-[#1C1A19] focus:outline-none focus:border-[#1C1A19] ${
                        authFieldErrors.email ? 'border-red-400' : 'border-[#D8CEBF]'
                      }`}
                    />
                    {authFieldErrors.email && (
                      <p className="text-[10px] text-red-600">{authFieldErrors.email[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] sm:text-xs uppercase tracking-wider text-[#1C1A19] font-medium">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full text-xs px-3.5 py-3 rounded-lg bg-[#FAF8F5] border text-[#1C1A19] focus:outline-none focus:border-[#1C1A19] ${
                        authFieldErrors.password ? 'border-red-400' : 'border-[#D8CEBF]'
                      }`}
                    />
                    {authFieldErrors.password && (
                      <p className="text-[10px] text-red-600">{authFieldErrors.password[0]}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#332F2D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جارٍ تسجيل الدخول...</span>
                      </>
                    ) : (
                      <span>تسجيل الدخول</span>
                    )}
                  </button>

                </form>
              )}

              {/* REGISTRATION FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] uppercase tracking-wider text-[#1C1A19] font-medium">
                        الاسم الأول
                      </label>
                      <input
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="الاسم الأول"
                        className={`w-full text-xs px-3 py-2.5 rounded-lg bg-[#FAF8F5] border text-[#1C1A19] focus:outline-none focus:border-[#1C1A19] ${
                          authFieldErrors.first_name ? 'border-red-400' : 'border-[#D8CEBF]'
                        }`}
                      />
                      {authFieldErrors.first_name && (
                        <p className="text-[10px] text-red-600">{authFieldErrors.first_name[0]}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] uppercase tracking-wider text-[#1C1A19] font-medium">
                        اسم العائلة
                      </label>
                      <input
                        type="text"
                        required
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="اسم العائلة"
                        className={`w-full text-xs px-3 py-2.5 rounded-lg bg-[#FAF8F5] border text-[#1C1A19] focus:outline-none focus:border-[#1C1A19] ${
                          authFieldErrors.last_name ? 'border-red-400' : 'border-[#D8CEBF]'
                        }`}
                      />
                      {authFieldErrors.last_name && (
                        <p className="text-[10px] text-red-600">{authFieldErrors.last_name[0]}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[#1C1A19] font-medium">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className={`w-full text-xs px-3 py-2.5 rounded-lg bg-[#FAF8F5] border text-[#1C1A19] focus:outline-none focus:border-[#1C1A19] ${
                        authFieldErrors.email ? 'border-red-400' : 'border-[#D8CEBF]'
                      }`}
                    />
                    {authFieldErrors.email && (
                      <p className="text-[10px] text-red-600">{authFieldErrors.email[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[#1C1A19] font-medium">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                        inputMode="numeric"
                        maxLength={11}
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="01012345678"
                      className={`w-full text-xs px-3 py-2.5 rounded-lg bg-[#FAF8F5] border text-[#1C1A19] focus:outline-none focus:border-[#1C1A19] ${
                        authFieldErrors.phone ? 'border-red-400' : 'border-[#D8CEBF]'
                      }`}
                    />
                    {authFieldErrors.phone && (
                      <p className="text-[10px] text-red-600">{authFieldErrors.phone[0]}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-[#1C1A19] font-medium">
                      كلمة المرور (٨ أحرف على الأقل)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full text-xs px-3 py-2.5 rounded-lg bg-[#FAF8F5] border text-[#1C1A19] focus:outline-none focus:border-[#1C1A19] ${
                        authFieldErrors.password ? 'border-red-400' : 'border-[#D8CEBF]'
                      }`}
                    />
                    {authFieldErrors.password && (
                      <p className="text-[10px] text-red-600">{authFieldErrors.password[0]}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#332F2D] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {authLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جارٍ إنشاء الحساب...</span>
                      </>
                    ) : (
                      <span>إنشاء الحساب</span>
                    )}
                  </button>
                </form>
              )}
            </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             AUTHENTICATED CLIENT DASHBOARD
             ========================================================================= */
          <div className="space-y-6 py-6 sm:space-y-8 sm:py-10">
            {/* Tabs */}
            <div role="tablist" aria-label="أقسام الحساب" className="flex w-fit max-w-full overflow-x-auto border border-[#DED5C9] bg-[#EEE7DC] scrollbar-none">
              <button
                onClick={() => setActiveTab('orders')}
                role="tab"
                aria-selected={activeTab === 'orders'}
                className={`min-h-11 px-4 text-xs transition-colors whitespace-nowrap sm:px-6 ${
                  activeTab === 'orders' ? 'bg-[#17324A] font-semibold text-white' : 'text-[#625E57] hover:text-[#17324A]'
                }`}
              >
                الطلبات ({backendOrders.length})
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                role="tab"
                aria-selected={activeTab === 'addresses'}
                className={`min-h-11 px-4 text-xs transition-colors whitespace-nowrap sm:px-6 ${
                  activeTab === 'addresses' ? 'bg-[#17324A] font-semibold text-white' : 'text-[#625E57] hover:text-[#17324A]'
                }`}
              >
                عناوين التوصيل ({addresses.length})
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                role="tab"
                aria-selected={activeTab === 'profile'}
                className={`min-h-11 px-4 text-xs transition-colors whitespace-nowrap sm:px-6 ${
                  activeTab === 'profile' ? 'bg-[#17324A] font-semibold text-white' : 'text-[#625E57] hover:text-[#17324A]'
                }`}
              >
                بياناتي
              </button>
            </div>

            {/* TAB 1: COMMISSIONS & ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4 sm:space-y-6">
                {isOrdersViewLoading ? (
                  <div className="py-12 sm:py-16 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#643D26] mx-auto" />
                    <p className="text-xs uppercase tracking-wider text-[#736B63]">
                      جارٍ تحميل الطلبات...
                    </p>
                  </div>
                ) : ordersError ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{ordersError}</span>
                    </div>
                    <button
                      onClick={fetchMyOrders}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-red-800 font-semibold"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                ) : backendOrders.length === 0 ? (
                  <div className="py-12 sm:py-16 text-center space-y-4">
                    <p className="text-sm sm:text-base text-[#17324A]">لا توجد طلبات حتى الآن.</p>
                    <button
                      onClick={() => navigateTo('shop')}
                      className="min-h-11 bg-[#17324A] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#24445E]"
                    >
                      تصفح المنتجات
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {backendOrders.map((ord) => {
                      const whatsappUrl = `https://wa.me/${toWhatsAppNumber(settings.contact.whatsapp)}?text=${encodeURIComponent(
                        `مرحبًا مودرن هوم، أستفسر عن الطلب رقم ${ord.order_number}.`
                      )}`;
                      const depositPercentage = Number(ord.deposit_percentage);
                      const deposit = Math.round(Number(ord.total_price) * depositPercentage / 100);

                      return (
                        <div
                          key={ord.id}
                          className="border-b border-[#DED5C9] bg-[#FBF9F4] p-5 sm:p-7 space-y-5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EAE4DC]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] sm:text-xs uppercase tracking-wider font-mono text-[#736B63]">
                                  رقم الطلب: {ord.order_number}
                                </span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await navigator.clipboard.writeText(String(ord.order_number));
                                    setCopiedReferenceId(ord.id);
                                    window.setTimeout(() => setCopiedReferenceId(null), 1500);
                                  }}
                                  aria-label={`نسخ رقم الطلب ${ord.order_number}`}
                                  title={copiedReferenceId === ord.id ? 'تم النسخ' : 'نسخ رقم الطلب'}
                                  className="inline-flex items-center justify-center rounded-md p-1 text-[#736B63] hover:bg-[#F5F1EA] hover:text-[#1C1A19]"
                                >
                                  {copiedReferenceId === ord.id ? (
                                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                  )}
                                </button>
                              </div>
                              <p className="text-xs text-[#8F8880] mt-0.5">
                                تاريخ الطلب: {new Date(ord.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getBackendStatusBadge(ord.status)}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {ord.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-4 py-2 border-b border-[#FAF8F5] last:border-0">
                                <div className="w-12 h-12 rounded-lg bg-[#F5F1EA] overflow-hidden shrink-0 relative flex items-center justify-center border border-[#EAE4DC]">
                                  {item.color_hex_code && (
                                    <div
                                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs"
                                      style={{ backgroundColor: item.color_hex_code }}
                                      title={item.color_name || undefined}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-xs sm:text-sm font-medium text-[#1C1A19] truncate">{item.product_name}</h4>
                                  <p className="text-[11px] text-[#736B63] flex items-center gap-1.5 mt-0.5">
                                    {item.color_name && (
                                      <>
                                        <span>اللون: {item.color_name}</span>
                                        <span>•</span>
                                      </>
                                    )}
                                    <span>الكمية: {item.quantity}</span>
                                    <span>•</span>
                                    <span className="font-mono">{Number(item.product_price).toLocaleString()} جنيه للقطعة</span>
                                  </p>
                                </div>
                                <span className="text-xs font-mono font-medium text-[#1C1A19]">
                                  {Number(item.subtotal).toLocaleString()} EGP
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#EAE4DC] text-xs">
                            <div>
                              <span className="text-[#6D6A64]">المقدم ({depositPercentage}%): </span>
                              <span className="font-semibold text-[#643D26] font-mono">{deposit.toLocaleString()} EGP</span>
                              <span className="text-[#817D75] text-[11px] ml-2 font-mono">الإجمالي: {Number(ord.total_price).toLocaleString()} جنيه</span>
                              {ord.shipping_address && (
                                <p className="text-[11px] text-[#8F8880] mt-1">
                                  التوصيل إلى: {ord.shipping_address.title} ({ord.shipping_address.street}، {ord.shipping_address.city})
                                </p>
                              )}
                            </div>

                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D8CEBF] text-[11px] uppercase tracking-wider text-[#524B45] hover:bg-[#F5F1EA] transition-colors self-start sm:self-auto"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                              <span>تواصل معنا</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: ADDRESSES */}
            {activeTab === 'addresses' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col justify-between gap-3 border-b border-[#DED5C9] pb-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A] sm:text-xl">
                      عناوين التوصيل
                    </h3>
                    <p className="text-xs text-[#736B63]">
                      تُرتب العناوين المحفوظة حسب العنوان الأساسي.
                    </p>
                  </div>
                  <button
                    onClick={openCreateAddressModal}
                    className="inline-flex min-h-10 items-center gap-1.5 bg-[#17324A] px-3.5 text-xs font-semibold text-white transition-colors hover:bg-[#24445E] sm:px-4"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة عنوان</span>
                  </button>
                </div>

                {isAddressesLoading ? (
                  <div className="py-12 text-center text-xs uppercase tracking-wider text-[#736B63]">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#643D26]" />
                    جارٍ تحميل العناوين...
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="space-y-3 border-y border-[#DED5C9] py-12 text-center">
                    <MapPin className="w-8 h-8 text-[#D8CEBF] mx-auto" />
                    <p className="text-sm text-[#6D6A64]">لا توجد عناوين محفوظة.</p>
                    <button
                      onClick={openCreateAddressModal}
                      className="min-h-10 bg-[#17324A] px-4 py-2 text-sm font-semibold text-white"
                    >
                      إضافة أول عنوان
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#DED5C9] border-y border-[#DED5C9]">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center ${addr.is_default ? 'bg-[#EEE7DC]/55' : ''}`}
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-[#17324A]">
                                {addr.title}
                              </span>
                              {addr.is_default && (
                                <span className="inline-flex items-center gap-1 border-r-2 border-[#A36046] bg-[#F7F3EC] px-2 py-1 text-[10px] font-semibold text-[#72583C]">
                                  <Star className="h-2.5 w-2.5 fill-[#A36046]" />
                                  أساسي
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditAddressModal(addr)}
                                className="text-[#8F8880] hover:text-[#1C1A19] p-1 transition-colors"
                                title="تعديل العنوان"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingAddressId(addr.id)}
                                className="text-[#8F8880] hover:text-[#B85D38] p-1 transition-colors"
                                title="حذف العنوان"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h4 className="mt-2 text-sm font-semibold text-[#17324A]">{addr.city}، {addr.country}</h4>
                          <p className="text-xs text-[#625E57]">{addr.street}</p>
                          <p className="text-[11px] text-[#81786C]">
                            مبنى {addr.building_number}، شقة {addr.apartment_number}
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 sm:justify-start">
                          {!addr.is_default ? (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="min-h-10 border-b border-[#A36046] px-1 text-xs font-semibold text-[#17324A] hover:text-[#A36046]"
                            >
                              جعله العنوان الأساسي
                            </button>
                          ) : (
                            <span className="text-xs text-[#81786C]">
                              عنوان التوصيل الأساسي
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Delete Address Confirmation Dialog */}
                {deletingAddressId !== null && (
                  <div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="تأكيد حذف العنوان"
                    tabIndex={-1}
                    onKeyDown={handleDialogKeyDown}
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
                  >
                    <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 border border-[#EAE4DC] shadow-xl">
                      <div className="flex items-center gap-2 text-[#B85D38]">
                        <AlertTriangle className="w-5 h-5" />
                        <h4 className="text-sm font-semibold">حذف العنوان؟</h4>
                      </div>
                      <p className="text-xs text-[#736B63]">
                        هل تريد حذف عنوان التوصيل؟ إذا كان العنوان أساسيًا، سيصبح عنوان آخر هو الأساسي تلقائيًا.
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setDeletingAddressId(null)}
                          className="px-3.5 py-1.5 text-xs uppercase tracking-wider text-[#736B63] hover:text-[#1C1A19]"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(deletingAddressId)}
                          className="px-4 py-1.5 rounded-full bg-[#B85D38] text-white text-xs uppercase tracking-wider font-medium"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add / Edit Address Modal */}
                {showAddressModal && (
                  <div
                    ref={dialogRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={editingAddress ? 'تعديل عنوان التوصيل' : 'إضافة عنوان توصيل'}
                    tabIndex={-1}
                    onKeyDown={handleDialogKeyDown}
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-4 overflow-y-auto"
                  >
                    <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 my-8 border border-[#EAE4DC] shadow-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
                      <div className="flex justify-between items-center border-b border-[#EAE4DC] pb-3">
                        <h3 className="text-base font-medium text-[#1C1A19]">
                          {editingAddress ? 'تعديل عنوان التوصيل' : 'إضافة عنوان توصيل'}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowAddressModal(false)}
                          className="text-[#8F8880] hover:text-[#1C1A19]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {addressError && (
                        <div className="p-3 rounded-lg bg-[#FDF3F2] border border-[#F5C2C0] text-[#9E4A2B] text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{addressError}</span>
                        </div>
                      )}

                      <form onSubmit={handleSaveAddress} className="space-y-3">
                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
                            اسم العنوان
                          </label>
                          <input
                            type="text"
                            required
                            value={addressTitle}
                            onChange={(e) => setAddressTitle(e.target.value)}
                            placeholder="مثال: المنزل أو المكتب"
                            className="w-full text-xs p-2.5 rounded-lg border border-[#D8CEBF] bg-[#FAF8F5]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
                              الدولة
                            </label>
                            <input
                              type="text"
                              required
                              value={addressCountry}
                              onChange={(e) => setAddressCountry(e.target.value)}
                              placeholder="Egypt"
                              className="w-full text-xs p-2.5 rounded-lg border border-[#D8CEBF] bg-[#FAF8F5]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
                              المدينة أو المحافظة
                            </label>
                            <input
                              type="text"
                              required
                              value={addressCity}
                              onChange={(e) => setAddressCity(e.target.value)}
                              placeholder="القاهرة"
                              className="w-full text-xs p-2.5 rounded-lg border border-[#D8CEBF] bg-[#FAF8F5]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
                            الشارع أو المنطقة
                          </label>
                          <input
                            type="text"
                            required
                            value={addressStreet}
                            onChange={(e) => setAddressStreet(e.target.value)}
                            placeholder="اسم الشارع أو المنطقة"
                            className="w-full text-xs p-2.5 rounded-lg border border-[#D8CEBF] bg-[#FAF8F5]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
                              رقم المبنى
                            </label>
                            <input
                              type="text"
                              required
                              value={addressBuildingNumber}
                              onChange={(e) => setAddressBuildingNumber(e.target.value)}
                              placeholder="رقم المبنى أو الفيلا"
                              className="w-full text-xs p-2.5 rounded-lg border border-[#D8CEBF] bg-[#FAF8F5]"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
                              رقم الشقة أو الوحدة
                            </label>
                            <input
                              type="text"
                              required
                              value={addressApartmentNumber}
                              onChange={(e) => setAddressApartmentNumber(e.target.value)}
                              placeholder="رقم الشقة"
                              className="w-full text-xs p-2.5 rounded-lg border border-[#D8CEBF] bg-[#FAF8F5]"
                            />
                          </div>
                        </div>

                        <div className="pt-1 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="addr-default-check"
                            checked={addressIsDefault}
                            onChange={(e) => setAddressIsDefault(e.target.checked)}
                            className="rounded border-[#D8CEBF] text-[#643D26] focus:ring-[#643D26]"
                          />
                          <label htmlFor="addr-default-check" className="text-xs text-[#524B45]">
                            تعيينه عنوانًا أساسيًا للتوصيل
                          </label>
                        </div>

                        <div className="pt-3 flex justify-end gap-2 border-t border-[#EAE4DC]">
                          <button
                            type="button"
                            onClick={() => setShowAddressModal(false)}
                            className="px-4 py-2 text-xs uppercase tracking-wider text-[#736B63]"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            disabled={addressLoading}
                            className="px-5 py-2 rounded-full bg-[#1C1A19] text-white text-xs uppercase tracking-wider font-medium disabled:opacity-50 flex items-center gap-2"
                          >
                            {addressLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                            <span>حفظ العنوان</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CLIENT PROFILE */}
            {activeTab === 'profile' && (
              <ProfileSection
                user={user}
                profile={profile}
                updateProfile={updateProfile}
                deleteAccount={deleteAccount}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
