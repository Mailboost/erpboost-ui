// Reference example: https://ui.tailor.tech/page/simple-master-crud
import {
  AppShell,
  DefaultSidebar,
  SidebarGroup,
  SidebarItem,
  SidebarLayout,
} from "@mailboost/erpboost-ui";
import { CategoriesMasterDialogPage } from "./CategoriesMasterDialogPage";

// Composition example: mount the page body inside app-shell's SidebarLayout.
// In the catalogue preview this is framed with a flat stripe (and optional dummy
// nav labels that mirror PreviewNav); real apps compose it exactly like below.
export const App = () => (
  <AppShell title="Settings" basePath="">
    <SidebarLayout
      sidebar={
        <DefaultSidebar>
        <SidebarGroup title="Reference data" defaultOpen>
          <SidebarItem to="/categories" title="Categories" />
          <SidebarItem to="/units" title="Units & measures" />
          <SidebarItem to="/tax-codes" title="Tax codes" />
        </SidebarGroup>
        <SidebarGroup title="Tenant" defaultOpen>
          <SidebarItem to="/branding" title="Branding" />
          <SidebarItem to="/api-keys" title="API keys" />
        </SidebarGroup>
        </DefaultSidebar>
      }
    >
      {() => <CategoriesMasterDialogPage />}
    </SidebarLayout>
  </AppShell>
);
