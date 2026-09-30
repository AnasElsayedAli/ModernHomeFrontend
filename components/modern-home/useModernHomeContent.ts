'use client';

import { useToccoStore } from '@/lib/store';
import {
  previewCategories,
  previewEvents,
  previewProducts,
  previewProjects,
} from '@/mock-data/previewFixtures';

export function useModernHomeContent() {
  const {
    products,
    categories,
    projects,
    events,
    storeDataErrors,
  } = useToccoStore();
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const usePreviewCatalog = isDevelopment && Boolean(storeDataErrors.catalog);
  const usePreviewProjects = isDevelopment && Boolean(storeDataErrors.projects);
  const usePreviewEvents = isDevelopment && Boolean(storeDataErrors.events);

  return {
    products: usePreviewCatalog ? previewProducts : products,
    categories: usePreviewCatalog ? previewCategories : categories,
    projects: usePreviewProjects ? previewProjects : projects,
    events: usePreviewEvents ? previewEvents : events,
    usingPreviewCatalog: usePreviewCatalog,
    usingPreviewProjects: usePreviewProjects,
    usingPreviewEvents: usePreviewEvents,
    isPreviewMode: usePreviewCatalog || usePreviewProjects || usePreviewEvents,
  };
}