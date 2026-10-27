// Reference example: https://ui.tailor.tech/page/detail-2col-action-panel
import {
  AppShell,
  DefaultSidebar,
  SidebarGroup,
  SidebarItem,
  SidebarLayout,
} from "@mailboost/erpboost-ui";
import { DetailPageWithPageTabs } from "./DetailPageWithPageTabs";

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
        <SidebarGroup title="Suppliers" defaultOpen>
          <SidebarItem to="/supplier-tailor-supply" title="Tailor Supply Co." />
          <SidebarItem to="/supplier-east-works" title="East Works Ltd." />
        </SidebarGroup>
        </DefaultSidebar>
      }
    >
      {() => <DetailPageWithPageTabs />}
    </SidebarLayout>
  </AppShell>
);
