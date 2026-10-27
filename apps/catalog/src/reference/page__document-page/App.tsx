// Reference example: https://ui.tailor.tech/page/document-page
import {
  AppShell,
  DefaultSidebar,
  SidebarGroup,
  SidebarItem,
  SidebarLayout,
} from "@mailboost/erpboost-ui";
import { DocumentEditorPage } from "./DocumentEditorPage";

// Composition example: mount the page body inside app-shell's SidebarLayout.
// In the catalogue preview this is framed with a flat stripe (and optional dummy
// nav labels that mirror PreviewNav); real apps compose it exactly like below.
export const App = () => (
  <AppShell title="Knowledge" basePath="">
    <SidebarLayout
      sidebar={
        <DefaultSidebar>
        <SidebarGroup title="Workspace" defaultOpen>
          <SidebarItem to="/home" title="Home" />
          <SidebarItem to="/docs" title="Docs" />
          <SidebarItem to="/recent" title="Recent" />
          <SidebarItem to="/starred" title="Starred" />
        </SidebarGroup>
        <SidebarGroup title="Manage" defaultOpen>
          <SidebarItem to="/members" title="Members" />
          <SidebarItem to="/settings" title="Settings" />
        </SidebarGroup>
        </DefaultSidebar>
      }
    >
      {() => <DocumentEditorPage />}
    </SidebarLayout>
  </AppShell>
);
