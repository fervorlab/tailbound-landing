'use client';

import type { ReactNode } from 'react';
import { STORE_URLS, trackStoreRedirect, type Store, type StoreRedirect } from '@/lib/analytics';

type StoreLinkProps = {
  children: ReactNode;
  className: string;
  store: Store;
  placement: StoreRedirect['placement'];
  locale: string;
};

export default function StoreLink({ children, className, store, placement, locale }: StoreLinkProps) {
  return (
    <a
      href={STORE_URLS[store]}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      data-analytics-event="store_redirect"
      data-store={store}
      data-placement={placement}
      onClick={() => trackStoreRedirect({ store, placement, locale })}
    >
      {children}
    </a>
  );
}
