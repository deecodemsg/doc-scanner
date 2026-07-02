/**
 * DynamicWebTWAIN Micro Frontend
 *
 * Two usage modes:
 *
 * 1. React import (plug-and-play component):
 *    import DWTApp from 'dynamic-web-twain-mfe';
 *    <DWTApp config={{ dwtProductKey: '...', uploadTargetURL: '...' }} />
 *
 * 2. Vanilla JS / non-React host (mount helper):
 *    import { mount, unmount } from 'dynamic-web-twain-mfe';
 *    const teardown = mount('#my-container', { dwtProductKey: '...' });
 *    // later:
 *    teardown();
 */

import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import DWTApp, { DWTAppProps } from './components/App';
import { DWTEnvironment } from './environments/environment';

// ── React component (default export) ────────────────────────────────────────
export { DWTApp as default, DWTApp };
export type { DWTAppProps };
export type { DWTEnvironment };

// ── Vanilla-JS mount helper ──────────────────────────────────────────────────
const _roots = new Map<Element, Root>();

/**
 * Mount the DWT micro-frontend into any DOM container — no React required in
 * the host application.
 *
 * @param container  CSS selector string or HTMLElement
 * @param props      Same props as the React <DWTApp /> component
 * @returns          A teardown function; call it to unmount and clean up
 */
export function mount(
  container: string | HTMLElement,
  props: DWTAppProps = {},
): () => void {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) throw new Error(`[DWT-MFE] Container not found: ${container}`);

  const root = createRoot(el);
  _roots.set(el, root);
  root.render(React.createElement(DWTApp, props));

  return () => unmount(el);
}

/**
 * Unmount a previously mounted DWT instance.
 */
export function unmount(container: string | HTMLElement): void {
  const el = typeof container === 'string'
    ? document.querySelector(container)
    : container;

  if (!el) return;
  const root = _roots.get(el);
  if (root) {
    root.unmount();
    _roots.delete(el);
  }
}
