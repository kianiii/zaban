"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/today", label: "امروز" },
  { href: "/", label: "داشبورد" },
  { href: "/plan", label: "برنامه" },
  { href: "/lessons", label: "درس‌ها" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="app-shell">
      <nav className="nav-bottom">
        <div className="hidden md:block px-2 pb-6">
          <div className="text-xs text-[var(--gold)] mb-1">Eteach Tracker</div>
          <div className="text-lg font-black">برنامه آبان</div>
        </div>
        {links.map((link) => {
          const active = link.href === "/" ? path === "/" : path.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} className={`nav-item ${active ? "active" : ""}`}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <main className="w-full max-w-3xl mx-auto px-3 pt-4 pb-4 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
