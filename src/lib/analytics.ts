export const GA_MEASUREMENT_ID = 'G-CXHM6ETJHJ';

export const STORE_URLS = {
  app_store: 'https://apps.apple.com/app/id6754251416',
  google_play: 'https://play.google.com/store/apps/details?id=com.oxkkun.tailbound',
} as const;

export type Store = keyof typeof STORE_URLS;

export type StoreRedirect = {
  store: Store;
  placement: 'navigation' | 'hero';
  locale: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackStoreRedirect({ store, placement, locale }: StoreRedirect) {
  if (typeof window === 'undefined') {
    return;
  }

  const event = ['event', 'store_redirect', { store, placement, locale }];

  if (typeof window.gtag === 'function') {
    window.gtag(...event);
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}
