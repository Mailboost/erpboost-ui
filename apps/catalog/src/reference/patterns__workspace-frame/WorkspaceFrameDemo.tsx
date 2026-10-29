import { useState } from "react";
import { WorkspaceFrame, SidebarPanel, Button } from "@mailboost/erpboost-ui";
export function WorkspaceFrameDemo() {
  const [section, setSection] = useState("Orders");
  return (
    <div style={{ height: 560, width: "100%" }}>
      <WorkspaceFrame.Root style={{ height: "100%" }}>
        <WorkspaceFrame.Header>
          <div style={{ padding: 16, borderBottom: "1px solid var(--border)" }}>
            ERP workspace
          </div>
        </WorkspaceFrame.Header>
        <WorkspaceFrame.Sidebar>
          <SidebarPanel>
            <SidebarPanel.Nav aria-label="Workspace navigation">
              {["Orders", "Products"].map((name) => (
                <SidebarPanel.Button
                  key={name}
                  active={section === name}
                  onClick={() => setSection(name)}
                >
                  {name}
                </SidebarPanel.Button>
              ))}
            </SidebarPanel.Nav>
            <SidebarPanel.Footer>
              <Button variant="ghost">Account</Button>
            </SidebarPanel.Footer>
          </SidebarPanel>
        </WorkspaceFrame.Sidebar>
        <WorkspaceFrame.Workspace>
          <WorkspaceFrame.ScrollArea>
            <WorkspaceFrame.Content>
              <h2>{section}</h2>
              {Array.from({ length: 40 }, (_, i) => (
                <p key={i}>
                  {section} record {i + 1}
                </p>
              ))}
            </WorkspaceFrame.Content>
          </WorkspaceFrame.ScrollArea>
        </WorkspaceFrame.Workspace>
      </WorkspaceFrame.Root>
    </div>
  );
}
