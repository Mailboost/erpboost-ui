// Reference example: https://ui.tailor.tech/page/form-as-page
import {
  AppShell,
  DefaultSidebar,
  SidebarGroup,
  SidebarItem,
  SidebarLayout,
} from "@mailboost/erpboost-ui";
import { CreateTaskPageWithSectionNav } from "./CreateTaskPageWithSectionNav";

// Composition example: mount the page body inside app-shell's SidebarLayout.
// In the catalogue preview this is framed with a flat stripe (and optional dummy
// nav labels that mirror PreviewNav); real apps compose it exactly like below.
export const App = () => (
  <AppShell title="Task board" basePath="">
    <SidebarLayout
      sidebar={
        <DefaultSidebar>
        <SidebarGroup title="Workspace" defaultOpen>
          <SidebarItem to="/home" title="Home" />
          <SidebarItem to="/tasks" title="Tasks" />
          <SidebarItem to="/inbox" title="Inbox" />
        </SidebarGroup>
        <SidebarGroup title="This week" defaultOpen>
          <SidebarItem to="/sprint-alpha" title="Sprint · Alpha" />
          <SidebarItem to="/backlog" title="Backlog" />
        </SidebarGroup>
        </DefaultSidebar>
      }
    >
      {() => <CreateTaskPageWithSectionNav />}
    </SidebarLayout>
  </AppShell>
);
