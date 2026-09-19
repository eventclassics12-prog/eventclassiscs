import { ViewTransition } from "react";

/**
 * Route-level crossfade wrapper. Wrap each route's content (in its
 * `page.tsx`, NOT in a layout — layouts persist across navigations, so
 * enter/exit snapshots would never fire there). The `page-fade` class is
 * animated in globals.css via ::view-transition-old/new(keyframes). Falls
 * back to the browser's instant swap on browsers without the View
 * Transitions API.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <ViewTransition default="page-fade">{children}</ViewTransition>;
}
