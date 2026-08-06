import assert from 'node:assert/strict';
import test from 'node:test';
import { trackStoreRedirect } from './analytics.js';

test('tracks an App Store redirect with its placement and locale', () => {
  const calls: unknown[][] = [];
  const originalWindow = globalThis.window;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      gtag: (...args: unknown[]) => calls.push(args),
    },
  });

  try {
    trackStoreRedirect({ store: 'app_store', placement: 'hero', locale: 'ko' });

    assert.deepEqual(calls, [[
      'event',
      'store_redirect',
      {
        store: 'app_store',
        placement: 'hero',
        locale: 'ko',
      },
    ]]);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});

test('does not throw when the analytics tag is unavailable', () => {
  const originalWindow = globalThis.window;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {},
  });

  try {
    assert.doesNotThrow(() => {
      trackStoreRedirect({ store: 'google_play', placement: 'navigation', locale: 'en' });
    });
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});

test('queues a redirect when the analytics tag has not loaded yet', () => {
  const dataLayer: unknown[] = [];
  const originalWindow = globalThis.window;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { dataLayer },
  });

  try {
    trackStoreRedirect({ store: 'google_play', placement: 'hero', locale: 'ja' });

    assert.deepEqual(dataLayer, [[
      'event',
      'store_redirect',
      {
        store: 'google_play',
        placement: 'hero',
        locale: 'ja',
      },
    ]]);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});
