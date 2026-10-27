// Reference example: https://ui.tailor.tech/patterns/notification-panel
import { useEffect, useRef, useState } from "react";
import { Button, SidebarGroup } from "@mailboost/erpboost-ui";
import { Bell } from "lucide-react";
import { NotificationPanel, sampleNotifications } from "./NotificationPanel";

// Mock sidebar nav items. In a real app these come from the app-shell modules.
const navItems = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "orders", label: "Orders", icon: "▤" },
  { id: "suppliers", label: "Suppliers", icon: "☷" },
  { id: "reports", label: "Reports", icon: "▦" },
];

export const NotificationPanelWithSidebar = () => {
  const [open, setOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("orders");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = sampleNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="relative flex h-[640px] w-full overflow-hidden rounded-xl border bg-background">
      {/* === Sidebar (uses app-shell SidebarGroup primitive) === */}
      <aside className="flex w-56 shrink-0 flex-col border-r bg-card">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="size-7 rounded-md bg-primary/15 text-center text-sm font-bold leading-7 text-primary">
            T
          </div>
          <span className="text-sm font-semibold">Tailor ERP</span>
        </div>

        <nav className="flex-1 p-2">
          <SidebarGroup title="Menu" defaultOpen>
            {/* Notification: top-most menu item, just below the app name. */}
            <Button
              ref={triggerRef}
              type="button"
              variant="ghost"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-label="Open notifications"
              className={
                open
                  ? "relative flex h-auto w-full items-center gap-2 rounded-md bg-muted px-2 py-2 text-sm font-medium"
                  : "relative flex h-auto w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/60"
              }
            >
              <Bell className="size-4 shrink-0" aria-hidden />
              <span>Notifications</span>
              {unreadCount > 0 ? (
                <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {unreadCount}
                </span>
              ) : null}
            </Button>

            {navItems.map((item) => {
              const active = item.id === activeNav;
              return (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveNav(item.id)}
                  className={
                    active
                      ? "flex h-auto w-full items-center gap-2 rounded-md bg-muted px-2 py-2 text-sm font-medium"
                      : "flex h-auto w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/60"
                  }
                >
                  <span aria-hidden className="w-4 text-center">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </SidebarGroup>
        </nav>
      </aside>

      {/* === Main content (placeholder) === */}
      <main className="flex flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b px-6 text-sm font-medium">
          Orders
        </header>
        <div className="flex-1 space-y-3 p-6 text-sm text-muted-foreground">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="h-32 rounded-lg border" />
          <div className="h-32 rounded-lg border" />
        </div>
      </main>

      {/* === Notification panel popover ===
          Anchored to the right edge of the sidebar; spans the full height of
          the container so it feels like a dedicated inbox column. */}
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute inset-y-0 left-56 z-20 w-[22rem]"
        >
          <NotificationPanel notifications={sampleNotifications} />
        </div>
      ) : null}
    </div>
  );
};
