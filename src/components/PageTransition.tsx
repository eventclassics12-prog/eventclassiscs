import { ViewTransition } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return <ViewTransition default="page-fade">{children}</ViewTransition>;
}
