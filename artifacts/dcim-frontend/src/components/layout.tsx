import React, { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Server, Grid, SquareTerminal, HardDrive, LayoutDashboard, AlertTriangle } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Sites & Rooms", href: "/sites", icon: Grid },
    { name: "Assets", href: "/assets", icon: Server },
    { name: "Warranty Alerts", href: "/warranty", icon: AlertTriangle },
  ];

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
            const Icon = item.icon;
            const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
            <span className="font-mono text-xs">SYSTEM ONLINE</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
