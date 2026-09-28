import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Bot,
  Boxes,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Settings,
  ShieldPlus,
  Siren,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/predictions", label: "AI Predictions", icon: Activity },
  { to: "/network", label: "Hospital Network", icon: Network },
  { to: "/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/alerts", label: "Alerts", icon: AlertTriangle },
  { to: "/assistant", label: "AI Assistant", icon: Bot },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const mobileNav = nav.slice(0, 4).concat(nav[7]);

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="brand-gradient flex size-9 items-center justify-center rounded-xl shadow-[var(--shadow-glow)]">
        <ShieldPlus className="size-5 text-primary-foreground" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-base font-extrabold tracking-tight">MediResQ AI</span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Supply Resilience
          </span>
        </span>
      )}
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { session, ready, logout, emergencyMode, alerts } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !session) navigate({ to: "/" });
  }, [ready, session, navigate]);

  useEffect(() => setOpen(false), [pathname]);

  const unread = alerts.filter((a) => !a.acknowledged).length;

  if (!ready || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading MediResQ AI…
        </div>
      </div>
    );
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 bg-sidebar p-4">
      <div className="flex items-center justify-between px-1 pt-1">
        <Logo />
        <button
          className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
              activeProps={{
                className:
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--color-sidebar-primary)]",
              }}
            >
              <Icon className="size-[18px] opacity-80" />
              <span className="flex-1">{n.label}</span>
              {n.to === "/alerts" && unread > 0 && (
                <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl border border-sidebar-border bg-background/60 p-3">
        <p className="truncate text-sm font-semibold">{session.name}</p>
        <p className="truncate text-xs text-muted-foreground">{session.email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start gap-2 px-2 text-muted-foreground"
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border lg:block">
        {sidebar}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 border-r border-sidebar-border shadow-[var(--shadow-lift)]">
            {sidebar}
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        {emergencyMode && (
          <div className="flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-destructive-foreground">
            <Siren className="size-4" /> Emergency supply mode active — demand projections raised 35%
          </div>
        )}

        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              className="rounded-lg border border-border p-2 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
              )}
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-warning/40 bg-warning/12 px-2.5 py-1 text-[11px] font-semibold text-warning-foreground sm:inline-flex">
              <span className="size-1.5 animate-pulse rounded-full bg-warning" /> Demo Mode
            </span>
            {actions}
          </div>
        </header>

        <main className="stagger-in px-4 pb-24 pt-5 sm:px-6 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        {mobileNav.map((n) => {
          const Icon = n.icon;
          const active = pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-[18px]" />
              {n.label.replace("AI ", "")}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
