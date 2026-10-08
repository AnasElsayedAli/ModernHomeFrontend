'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { userService } from '@/lib/api/services/userService';
import { UserRole, UserManagementUser } from '@/types/auth';
import { normalizeApiError } from '@/lib/api/errors';
import ConfirmDialog from '@/components/ConfirmDialog';
import { RefreshCw, AlertCircle, KeyRound, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const { user } = useAuth();

  const [userList, setUserList] = useState<UserManagementUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [roleChangeLoadingId, setRoleChangeLoadingId] = useState<number | null>(null);
  const [statusChangeLoadingId, setStatusChangeLoadingId] = useState<number | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserManagementUser | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [userToSetPassword, setUserToSetPassword] = useState<UserManagementUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [settingPasswordUserId, setSettingPasswordUserId] = useState<number | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadUsers = useCallback(async (search?: string) => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const data = await userService.listUsers(search ? { search } : undefined);
      setUserList(data);
    } catch (err) {
      setUsersError(normalizeApiError(err).message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Load immediately on mount, then debounce reloads as the search box changes.
  const didMount = useRef(false);
  useEffect(() => {
    const query = userSearchQuery.trim();
    if (!didMount.current) {
      didMount.current = true;
      loadUsers(query);
      return;
    }
    const handle = setTimeout(() => loadUsers(query), 350);
    return () => clearTimeout(handle);
  }, [userSearchQuery, loadUsers]);

  const handleRoleChange = async (targetUserId: number, newRole: UserRole) => {
    setRoleChangeLoadingId(targetUserId);
    try {
      await userService.changeUserRole(targetUserId, newRole);
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert(`تعذر تغيير الصلاحية: ${normalizeApiError(err).message}`);
    } finally {
      setRoleChangeLoadingId(null);
    }
  };

  const handleStatusChange = async (targetUserId: number, nextIsActive: boolean) => {
    setStatusChangeLoadingId(targetUserId);
    try {
      await userService.changeUserStatus(targetUserId, nextIsActive);
      setUserList((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, is_active: nextIsActive } : u))
      );
    } catch (err) {
      alert(`تعذر تحديث الحالة: ${normalizeApiError(err).message}`);
    } finally {
      setStatusChangeLoadingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeletingUserId(userToDelete.id);
    setDeleteError(null);
    try {
      await userService.deleteManagedUser(userToDelete.id);
      setUserList((current) => current.filter((item) => item.id !== userToDelete.id));
      setActionSuccess(`تم حذف حساب «${userToDelete.first_name} ${userToDelete.last_name}».`);
      setUserToDelete(null);
    } catch (error) {
      setDeleteError(normalizeApiError(error).message);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleSetUserPassword = async () => {
    if (!userToSetPassword) return;
    if (newPassword.length < 8) {
      setPasswordError('يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين.');
      return;
    }

    setSettingPasswordUserId(userToSetPassword.id);
    setPasswordError(null);
    try {
      await userService.setManagedUserPassword(userToSetPassword.id, newPassword);
      setActionSuccess(`تم تغيير كلمة مرور «${userToSetPassword.first_name} ${userToSetPassword.last_name}».`);
      setUserToSetPassword(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordError(normalizeApiError(error).message);
    } finally {
      setSettingPasswordUserId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1C1A19]">
            المستخدمون والصلاحيات
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            placeholder="ابحث عن مستخدم..."
            className="text-xs px-3 py-1.5 rounded-lg border border-[#D8CEBF] bg-white focus:outline-none"
          />
          <button
            onClick={() => loadUsers(userSearchQuery.trim())}
            className="p-2 rounded-lg border border-[#D8CEBF] bg-white text-[#736B63] hover:text-[#1C1A19]"
            title="تحديث قائمة المستخدمين"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {usersError && (
        <div className="p-3 rounded-lg bg-[#FDF3F2] border border-[#F5C2C0] text-[#9E4A2B] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{usersError}</span>
        </div>
      )}

      {actionSuccess && (
        <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} aria-label="إغلاق التنبيه" className="text-emerald-800">×</button>
        </div>
      )}

      {usersLoading ? (
        <div className="py-12 text-center text-xs uppercase tracking-wider text-[#736B63]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#643D26]" />
          جارٍ تحميل المستخدمين...
        </div>
      ) : userList.length === 0 ? (
        <div className="py-12 bg-white rounded-xl border border-[#EAE4DC] text-center text-xs text-[#736B63]">
          لا توجد حسابات مستخدمين.
        </div>
      ) : (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-[#EAE4DC] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EAE4DC] text-[10px] uppercase tracking-wider text-[#736B63]">
                <tr>
                  <th className="py-3 px-4">المستخدم</th>
                  <th className="py-3 px-4">البريد الإلكتروني</th>
                  <th className="py-3 px-4">الهاتف</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">الصلاحية</th>
                  <th className="py-3 px-4">تاريخ التسجيل</th>
                  <th className="py-3 px-4">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF8F5]">
                {userList.map((u) => (
                  <tr key={u.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#1C1A19]">
                      {u.first_name} {u.last_name}
                      {u.id === user?.id && (
                        <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-[#EFEBE3] text-[#643D26]">
                          أنت
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#524B45]">{u.email}</td>
                    <td className="py-3.5 px-4 font-mono text-[#736B63]">{u.phone}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                            u.is_active
                              ? 'bg-[#EBF7EE] text-[#155724]'
                              : 'bg-[#FDF3F2] text-[#9E4A2B]'
                          }`}
                        >
                          {u.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                        {user?.role === 'ADMIN' && u.id !== user?.id && (
                          <button
                            onClick={() => handleStatusChange(u.id, !u.is_active)}
                            disabled={statusChangeLoadingId === u.id}
                            className="text-[10px] px-1.5 py-0.5 rounded border border-[#D8CEBF] text-[#736B63] hover:text-[#1C1A19] disabled:opacity-50"
                          >
                            {statusChangeLoadingId === u.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : u.is_active ? (
                              'إيقاف'
                            ) : (
                              'تفعيل'
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {user?.role === 'ADMIN' ? (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={u.role === 'MODERATOR' ? 'CUSTOMER' : u.role}
                            disabled={roleChangeLoadingId === u.id}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value as UserRole)
                            }
                            className="text-[11px] p-1.5 rounded border border-[#D8CEBF] bg-[#FAF8F5] text-[#1C1A19] focus:outline-none focus:border-[#1C1A19]"
                          >
                            <option value="CUSTOMER">مستخدم</option>
                            <option value="ADMIN">مدير</option>
                          </select>
                          {roleChangeLoadingId === u.id && (
                            <RefreshCw className="w-3 h-3 animate-spin text-[#643D26]" />
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#1C1A19]">
                          {u.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#8F8880] text-[11px]">
                      {new Date(u.created_at).toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      {user?.role === 'ADMIN' && u.id !== user.id && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setUserToSetPassword(u);
                              setNewPassword('');
                              setConfirmPassword('');
                              setPasswordError(null);
                            }}
                            disabled={settingPasswordUserId === u.id || deletingUserId === u.id}
                            aria-label={`تغيير كلمة مرور ${u.first_name} ${u.last_name}`}
                            title="تغيير كلمة المرور"
                            className="grid h-8 w-8 place-items-center rounded-full border border-[#D8CEBF] text-[#524B45] hover:bg-[#EFEBE3] disabled:opacity-50"
                          >
                            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserToDelete(u);
                              setDeleteError(null);
                            }}
                            disabled={deletingUserId === u.id || settingPasswordUserId === u.id}
                            aria-label={`حذف ${u.first_name} ${u.last_name}`}
                            title="حذف المستخدم"
                            className="grid h-8 w-8 place-items-center rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(userToDelete)}
        title={`حذف حساب: ${userToDelete?.first_name || ''} ${userToDelete?.last_name || ''}`}
        description="سيتم حذف الحساب نهائيًا. إذا كانت للمستخدم طلبات محفوظة، سيرفض الخادم الحذف مع توضيح السبب."
        confirmLabel="حذف المستخدم"
        isLoading={deletingUserId !== null}
        onCancel={() => {
          setUserToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteUser}
      >
        {deleteError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-900">{deleteError}</p>}
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={Boolean(userToSetPassword)}
        title={`تغيير كلمة مرور: ${userToSetPassword?.first_name || ''} ${userToSetPassword?.last_name || ''}`}
        description="سيتم تعيين كلمة مرور جديدة وإبطال جلسات المستخدم الحالية."
        confirmLabel="تغيير كلمة المرور"
        confirmDisabled={!newPassword || !confirmPassword}
        isLoading={settingPasswordUserId !== null}
        onCancel={() => {
          setUserToSetPassword(null);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError(null);
        }}
        onConfirm={handleSetUserPassword}
      >
        <label className="block space-y-1.5">
          <span>كلمة المرور الجديدة</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setPasswordError(null);
            }}
            className="w-full rounded-lg border border-[#D8CEBF] bg-white px-3 py-2 text-sm text-[#1C1A19] outline-none focus:border-[#643D26]"
          />
        </label>
        <label className="block space-y-1.5">
          <span>تأكيد كلمة المرور</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setPasswordError(null);
            }}
            className="w-full rounded-lg border border-[#D8CEBF] bg-white px-3 py-2 text-sm text-[#1C1A19] outline-none focus:border-[#643D26]"
          />
        </label>
        {passwordError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-900">{passwordError}</p>}
      </ConfirmDialog>
    </div>
  );
}
