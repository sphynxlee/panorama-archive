import type { ReactNode } from "react";
import "./PageCard.css";

type PageCardProps = {
  children: ReactNode;
  className?: string;
};

export default function PageCard({ children, className }: PageCardProps) {
  const cls = ["page-card", className].filter(Boolean).join(" ");
  return <div className={cls}>{children}</div>;
}
