import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Server,
  Grid,
  SquareTerminal,
  LayoutDashboard,
  AlertTriangle,
  ShieldAlert,
  Users,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  ADMIN:    { label: "ADMIN",    cls: "text-red-400 border-red-500/30 bg-red-500/10" },
  ENGINEER: { label: "ENGINEER", cls: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  VIEWER:   { label: "VIEWER",   cls: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isAdmin, canViewIncidents, isLoading } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const navItems = [
    { name: "Dashboard",     href: "/",         icon: LayoutDashboard, always: true },
    { name: "Sites & Rooms", href: "/sites",     icon: Grid,            always: true },
    { name: "Assets",        href: "/assets",    icon: Server,          always: true },
    { name: "Warranty Alerts", href: "/warranty", icon: AlertTriangle,  always: true },
    { name: "Incidents",     href: "/incidents", icon: ShieldAlert,     always: false, show: canViewIncidents },
    { name: "Users",         href: "/users",     icon: Users,           always: false, show: isAdmin },
  ];

  const roleBadge = user ? ROLE_BADGE[user.role] : null;

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-md">
              <SquareTerminal size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight uppercase">DCIM</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Mission Control</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (!item.always && !item.show) return null;
            const Icon = item.icon;
            const active =
              location === item.href ||
              (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          {/* User info */}
          {!isLoading && user && (
            <div className="px-3 py-2 rounded-md bg-secondary/30 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-xs font-semibold truncate">{user.username}</p>
                {roleBadge && (
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 border rounded uppercase tracking-widest mt-0.5 inline-block ${roleBadge.cls}`}>
                    {roleBadge.label}
                  </span>
                )}
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
            </div>
          )}
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="font-mono text-xs">SYSTEM ONLINE</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
