import {
  BookOpen,
  Building2,
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Users,
} from "lucide-react";

/*
 * One definition of the app's navigation, used by both the desktop sidebar and
 * the mobile top bar. Two lists that drift apart is how an app ends up with a
 * link you can only reach on one device.
 */

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** The four places work happens, in the order the job happens in. */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/pricebook", label: "Pricebook", icon: BookOpen },
];

/** Settings. Deliberately ranked below the work rather than beside it. */
export const SECONDARY_NAV: NavItem[] = [
  { href: "/onboarding", label: "Business", icon: Building2 },
];

/** A section stays lit while you're inside one of its pages. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/*
 * DESIGN.md lists "active nav" as a sanctioned use of brand blue, so the
 * current section gets the brand wash. Everything else is ink alpha — no new
 * grays, and no second chromatic colour in the chrome.
 */
export const NAV_ACTIVE_CLASS = "bg-brand-wash text-brand";
export const NAV_IDLE_CLASS =
  "text-ink-60 hover:bg-surface-2 hover:text-ink-90";
