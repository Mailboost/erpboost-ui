// Reference example: https://ui.tailor.tech/page/pipeline-kanban
import {
  AppShell,
  DefaultSidebar,
  SidebarGroup,
  SidebarItem,
  SidebarLayout,
} from "@mailboost/erpboost-ui";
import { PipelineKanbanPage } from "./PipelineKanbanPage";

// Composition example: mount the page body inside app-shell's SidebarLayout.
// In the catalogue preview this is framed with a flat stripe (and optional dummy
// nav labels that mirror PreviewNav); real apps compose it exactly like below.
export const App = () => (
  <AppShell title="CRM" basePath="">
    <SidebarLayout
      sidebar={
        <DefaultSidebar>
        <SidebarGroup title="Revenue" defaultOpen>
          <SidebarItem to="/home" title="Home" />
          <SidebarItem to="/leads" title="Leads" />
          <SidebarItem to="/deals" title="Deals" />
        </SidebarGroup>
        <SidebarGroup title="Customer success" defaultOpen>
          <SidebarItem to="/tickets" title="Tickets" />
          <SidebarItem to="/accounts" title="Accounts" />
        </SidebarGroup>
        </DefaultSidebar>
      }
    >
      {() => <PipelineKanbanPage />}
    </SidebarLayout>
  </AppShell>
);
