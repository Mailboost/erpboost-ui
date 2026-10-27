// Reference example: https://ui.tailor.tech/page/dashboard-with-charts
import {
  AppShell,
  DefaultSidebar,
  SidebarGroup,
  SidebarItem,
  SidebarLayout,
} from "@mailboost/erpboost-ui";
import { SpendDashboardPage } from "./SpendDashboardPage";

// Composition example: mount the page body inside app-shell's SidebarLayout.
// In the catalogue preview this is framed with a flat stripe (and optional dummy
// nav labels that mirror PreviewNav); real apps compose it exactly like below.
export const App = () => (
  <AppShell title="Procurement" basePath="">
    <SidebarLayout
      sidebar={
        <DefaultSidebar>
        <SidebarGroup title="Procurement" defaultOpen>
          <SidebarItem to="/home" title="Home" />
          <SidebarItem to="/spend-dashboard" title="Spend dashboard" />
          <SidebarItem to="/suppliers" title="Suppliers" />
          <SidebarItem to="/orders" title="Orders" />
        </SidebarGroup>
        <SidebarGroup title="Reports" defaultOpen>
          <SidebarItem to="/monthly-summary" title="Monthly summary" />
          <SidebarItem to="/category-breakdown" title="Category breakdown" />
        </SidebarGroup>
        </DefaultSidebar>
      }
    >
      {() => <SpendDashboardPage />}
    </SidebarLayout>
  </AppShell>
);
