'use client';

import React, { useState } from 'react';
import { BackendUser, ProfileResponse, ProfileUpdateRequest } from '@/types/auth';
import { normalizeApiError } from '@/lib/api/errors';
import { EGYPTIAN_PHONE_ERROR, normalizeEgyptianPhone } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAccessibleDialog } from '@/hooks/use-accessible-dialog';

interface ProfileSectionProps {
  user: BackendUser;
  profile: ProfileResponse | null;
  updateProfile: (
    data: ProfileUpdateRequest,
    method?: 'PUT' | 'PATCH'
  ) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export default function ProfileSection({
  user,
  profile,
  updateProfile,
  deleteAccount,
}: ProfileSectionProps) {
  const [profileFirstName, setProfileFirstName] = useState(
    () => profile?.first_name || user.first_name || ''
  );
  const [profileLastName, setProfileLastName] = useState(
    () => profile?.last_name || user.last_name || ''
  );
  const [profilePhone, setProfilePhone] = useState(
    () => profile?.phone || user.phone || ''
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const { dialogRef, handleDialogKeyDown } = useAccessibleDialog(
    showDeleteAccountModal,
    () => setShowDeleteAccountModal(false),
    deleteAccountLoading
  );

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizeEgyptianPhone(profilePhone);
    if (!normalizedPhone) {
      setProfileMessage({ type: 'error', text: EGYPTIAN_PHONE_ERROR });
      return;
    }

    setProfileLoading(true);
    setProfileMessage(null);
    try {
      await updateProfile(
        {
          first_name: profileFirstName,
          last_name: profileLastName,
          phone: normalizedPhone,
        }
      );
      setProfilePhone(normalizedPhone);
      setProfileMessage({ type: 'success', text: 'تم تحديث بياناتك بنجاح.' });
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setProfileMessage({ type: 'error', text: normalized.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setDeleteAccountLoading(true);
    try {
      await deleteAccount();
      setShowDeleteAccountModal(false);
    } catch (err) {
      const normalized = normalizeApiError(err);
      alert(normalized.message);
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  return (
    <div dir="rtl" className="max-w-2xl space-y-6">
      {/* Profile Card */}
      <div className="space-y-6 border-y border-[#DED5C9] bg-[#FBF9F4] py-5 sm:py-7">
        <div className="flex items-center justify-between border-b border-[#DED5C9] px-5 pb-4 sm:px-7">
          <div>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#17324A]">
              بيانات الحساب
            </h3>
            <p className="text-xs text-[#736B63]">
              حدّث اسمك وبيانات التواصل.
            </p>
          </div>
        </div>

        {profileMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              profileMessage.type === 'success'
                ? 'bg-[#EBF7EE] text-[#155724] border border-[#C3E6CB]'
                : 'bg-[#FDF3F2] text-[#9E4A2B] border border-[#F5C2C0]'
            }`}
          >
            {profileMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{profileMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4 px-5 sm:px-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
                الاسم الأول
              </label>
              <input
                type="text"
                required
                value={profileFirstName}
                onChange={(e) => setProfileFirstName(e.target.value)}
                className="w-full border-b border-[#BFB4A6] bg-transparent px-1 py-2.5 text-sm text-[#18232D] focus:outline-none focus:border-[#17324A]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
                اسم العائلة
              </label>
              <input
                type="text"
                required
                value={profileLastName}
                onChange={(e) => setProfileLastName(e.target.value)}
                className="w-full border-b border-[#BFB4A6] bg-transparent px-1 py-2.5 text-sm text-[#18232D] focus:outline-none focus:border-[#17324A]"
              />
            </div>
          </div>

          {/* Email is READ-ONLY as required */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
                البريد الإلكتروني
              </label>
            </div>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full border-b border-[#DED5C9] bg-[#EEE7DC]/60 px-1 py-2.5 text-sm font-mono text-[#81786C] cursor-not-allowed"
            />
            <p className="text-[10px] text-[#8F8880]">
              لا يمكن تغيير البريد الإلكتروني من هنا.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] uppercase tracking-wider text-[#736B63] font-medium">
              رقم الهاتف
            </label>
            <input
              type="tel"
              required
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              className="w-full border-b border-[#BFB4A6] bg-transparent px-1 py-2.5 text-sm text-[#18232D] focus:outline-none focus:border-[#17324A]"
            />
          </div>

          <div className="flex justify-end border-t border-[#DED5C9] pt-4">
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#17324A] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#24445E] disabled:opacity-50"
            >
              {profileLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>حفظ التغييرات</span>
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3 border-t border-rose-200 py-5 sm:py-6">
        <div className="flex items-center gap-2 text-[#9E4A2B]">
          <AlertTriangle className="w-4 h-4" />
          <h4 className="text-xs uppercase tracking-wider font-semibold">
            إيقاف الحساب
          </h4>
        </div>
        <p className="text-xs text-[#736B63]">
          سيؤدي إيقاف الحساب إلى تسجيل خروجك.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteAccountModal(true)}
          className="min-h-10 border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-800 transition-colors hover:bg-rose-50"
        >
          إيقاف الحساب وحذفه
        </button>
      </div>

      {/* Confirm Account Delete Modal */}
      {showDeleteAccountModal && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="تأكيد إيقاف الحساب"
          tabIndex={-1}
          onKeyDown={handleDialogKeyDown}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 border border-[#F5C2C0] shadow-xl">
            <div className="flex items-center gap-2 text-[#B85D38]">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-semibold">تأكيد إيقاف الحساب</h4>
            </div>
            <p className="text-xs text-[#736B63] leading-relaxed">
              هل تريد إيقاف حسابك؟ سيتم تسجيل خروجك مباشرة.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE4DC]">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="px-3.5 py-1.5 text-xs uppercase tracking-wider text-[#736B63]"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={deleteAccountLoading}
                onClick={handleConfirmDeleteAccount}
                className="px-4 py-1.5 rounded-full bg-[#B85D38] text-white text-xs uppercase tracking-wider font-medium disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleteAccountLoading && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>تأكيد الإيقاف</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
