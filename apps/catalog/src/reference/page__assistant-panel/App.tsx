// Reference example: https://ui.tailor.tech/page/assistant-panel
import {
  AppShell,
  DefaultSidebar,
  SidebarGroup,
  SidebarItem,
  SidebarLayout,
} from "@mailboost/erpboost-ui";
import { AssistantPanelScreen } from "./AssistantPanelScreen";

// Composition example: mount the page body inside app-shell's SidebarLayout.
// In the catalogue preview this is framed with a flat stripe (and optional dummy
// nav labels that mirror PreviewNav); real apps compose it exactly like below.
export const App = () => (
  <AppShell title="Sample app" basePath="">
    <SidebarLayout
      sidebar={
        <DefaultSidebar>
        <SidebarGroup title="Communication" defaultOpen>
          <SidebarItem to="/inbox" title="Inbox" />
          <SidebarItem to="/chat" title="Chat" />
        </SidebarGroup>
        <SidebarGroup title="Operations" defaultOpen>
          <SidebarItem to="/dashboard" title="Dashboard" />
          <SidebarItem to="/orders" title="Orders" />
        </SidebarGroup>
        </DefaultSidebar>
      }
    >
      {() => <AssistantPanelScreen />}
    </SidebarLayout>
  </AppShell>
);
