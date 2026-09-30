import type { CartItem } from '@/types';

export interface GuestCartSyncOutcome<T> {
  backendCart: T | null;
  syncedItemIds: string[];
  failedItems: CartItem[];
  authenticationFailed: boolean;
}

export async function transferGuestCartItems<T>(
  items: CartItem[],
  addItem: (item: CartItem) => Promise<unknown>,
  loadBackendCart: () => Promise<T>,
  isAuthenticationFailure: (error: unknown) => boolean
): Promise<GuestCartSyncOutcome<T>> {
  const syncedItemIds: string[] = [];
  const failedItems: CartItem[] = [];

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    try {
      await addItem(item);
      syncedItemIds.push(item.id);
    } catch (error) {
      failedItems.push(item);
      if (isAuthenticationFailure(error)) {
        failedItems.push(...items.slice(index + 1));
        return {
          backendCart: null,
          syncedItemIds,
          failedItems,
          authenticationFailed: true,
        };
      }
    }
  }

  const backendCart = await loadBackendCart();
  return { backendCart, syncedItemIds, failedItems, authenticationFailed: false };
}