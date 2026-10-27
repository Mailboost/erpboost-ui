// Reference example: https://ui.tailor.tech/patterns/user-profile-dialog
import { useState } from "react";
import {
  Bell,
  ChevronsUpDown,
  Home as HomeIcon,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Avatar, Badge, SidebarGroup } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";
import { UserProfileDialog, defaultProfile } from "./UserProfileDialog";

const navItems: { id: string; label: string; icon: typeof HomeIcon }[] = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "suppliers", label: "Suppliers", icon: Users },
  { id: "reports", label: "Reports", icon: LayoutDashboard },
];

/**
 * Mock app shell: a sidebar with primary nav and a user menu button anchored
 * to the bottom. Clicking the user menu opens the profile dialog.
 */
export const UserMenuSidebarShowcase = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("orders");

  return (
    <div className="relative flex h-[640px] w-full overflow-hidden rounded-xl border bg-background">
      <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="size-7 rounded-md bg-primary/15 text-center text-sm font-bold leading-7 text-primary">
            T
          </div>
          <span className="text-sm font-semibold">Tailor ERP</span>
          <button
            type="button"
            className="ml-auto inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="size-4" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <SidebarGroup title="Menu" defaultOpen>
            {navItems.map((item) => {
              const isActive = item.id === active;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </SidebarGroup>
        </nav>

        {/* ── User menu (sidebar footer) ── */}
        <div className="border-t p-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={open}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md p-2 text-left transition-colors",
              open
                ? "bg-muted"
                : "hover:bg-muted/60",
            )}
          >
            <Avatar.Root className="size-8 ring-1 ring-border">
              <Avatar.Fallback
                className="text-xs font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg,#fda4af 0%,#fb7185 45%,#f43f5e 100%)",
                }}
              >
                JM
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">
                {defaultProfile.displayName}
              </p>
              <p className="truncate text-xs text-muted-foreground leading-tight">
                {defaultProfile.email}
              </p>
            </div>
            <ChevronsUpDown
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </button>
        </div>
      </aside>

      <main className="flex flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Orders</span>
            <Badge variant="outline-neutral">3 items</Badge>
          </div>
        </header>
        <div className="flex-1 space-y-3 p-6">
          <div className="h-8 w-1/3 rounded bg-muted" />
          <div className="h-32 rounded-lg border" />
          <div className="h-32 rounded-lg border" />
          <div className="h-32 rounded-lg border" />
        </div>
      </main>

      <UserProfileDialog open={open} onOpenChange={setOpen} />
    </div>
  );
};
