'use client';

import { useToccoStore } from '@/lib/store';

export function useModernHomeContent() {
  const {
    products,
    categories,
    projects,
    events,
  } = useToccoStore();

  return {
    products,
    categories,
    projects,
    events,
  };
}