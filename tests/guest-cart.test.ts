import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '../types';
import {
  addGuestCartItem,
  getGuestCart,
  removeGuestCartItems,
} from '../lib/guestCart';
import { transferGuestCartItems } from '../lib/guestCartSync';

function makeItem(id: string, productId: string): CartItem {
  return {
    id,
    productId,
    productName: `Piece ${productId}`,
    productImage: '/piece.jpg',
    unitPrice: 100,
    selectedFinish: 'MATTE',
    selectedColor: { id: '1', name: 'Ivory', hex: '#FFFFFF' },
    quantity: 1,
    subtotal: 100,
  };
}

describe('guest cart persistence and transfer', () => {
  let values: Map<string, string>;

  beforeEach(() => {
    values = new Map();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('merges matching guest items and persists the combined quantity', () => {
    const item = makeItem('unused', '17');
    const first = addGuestCartItem(item);
    const second = addGuestCartItem(item);

    expect(second).toHaveLength(1);
    expect(second[0].id).toBe(first[0].id);
    expect(second[0].quantity).toBe(2);
    expect(getGuestCart()).toEqual(second);
  });

  it('removes only confirmed item IDs and leaves failed/new items saved', () => {
    const first = addGuestCartItem(makeItem('unused', '17'));
    const both = addGuestCartItem(makeItem('unused', '18'));

    const remaining = removeGuestCartItems([first[0].id]);

    expect(remaining.map((item) => item.productId)).toEqual(['18']);
    expect(getGuestCart().map((item) => item.id)).toEqual([both[1].id]);
  });

  it('returns successful IDs only after a backend cart snapshot succeeds', async () => {
    const items = [makeItem('guest-1', '17'), makeItem('guest-2', '18')];
    const loadBackendCart = vi.fn(async () => ({ items: [] }));
    const outcome = await transferGuestCartItems(
      items,
      async (item) => {
        if (item.id === 'guest-2') throw new Error('Product unavailable');
      },
      loadBackendCart,
      () => false
    );

    expect(outcome.syncedItemIds).toEqual(['guest-1']);
    expect(outcome.failedItems.map((item) => item.id)).toEqual(['guest-2']);
    expect(outcome.backendCart).toEqual({ items: [] });
    expect(loadBackendCart).toHaveBeenCalledOnce();
  });

  it('stops after authorization failure and retains unsent entries', async () => {
    const items = [makeItem('guest-1', '17'), makeItem('guest-2', '18'), makeItem('guest-3', '19')];
    const loadBackendCart = vi.fn(async () => ({ items: [] }));
    const outcome = await transferGuestCartItems(
      items,
      async (item) => {
        if (item.id === 'guest-2') throw { status: 401 };
      },
      loadBackendCart,
      (error) => typeof error === 'object' && error !== null && 'status' in error && error.status === 401
    );

    expect(outcome.authenticationFailed).toBe(true);
    expect(outcome.syncedItemIds).toEqual(['guest-1']);
    expect(outcome.failedItems.map((item) => item.id)).toEqual(['guest-2', 'guest-3']);
    expect(loadBackendCart).not.toHaveBeenCalled();
  });

  it('does not report successful transfers when the confirmation read fails', async () => {
    const items = [makeItem('guest-1', '17')];
    const readError = new Error('network unavailable');

    await expect(transferGuestCartItems(
      items,
      async () => undefined,
      async () => { throw readError; },
      () => false
    )).rejects.toBe(readError);
  });
});