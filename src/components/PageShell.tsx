import type { ReactNode } from "react";
import PageCard from "./PageCard";
import "../pages/GalleryPage.css";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  cardClassName?: string;
};

export default function PageShell({ children, className, cardClassName }: PageShellProps) {
  const pageCls = ["gallery-page", className].filter(Boolean).join(" ");
  return (
    <main className={pageCls}>
      <PageCard className={cardClassName}>{children}</PageCard>
    </main>
  );
}
