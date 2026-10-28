import { useState } from "react";
import { DatabaseWorkspace, Table, Badge } from "@mailboost/erpboost-ui";

export function DatabaseWorkspaceDemo() {
  const [selected, setSelected] = useState("sale_order");
  const [opened, setOpened] = useState(["sale_order", "res_partner"]);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const tables = [
    { name: "sale_order", label: "受注" },
    { name: "res_partner", label: "得意先" },
  ];
  return (
    <div className="astw:h-[600px] astw:overflow-hidden astw:rounded-lg astw:border astw:border-border">
      <DatabaseWorkspace
        tables={tables}
        selectedTable={selected}
        openedTables={opened}
        view="records"
        search={search}
        sidebarOpen={sidebarOpen}
        canCreate={false}
        onSidebarOpenChange={setSidebarOpen}
        onSearchChange={setSearch}
        onSelectTable={(name) => {
          setSelected(name);
          setOpened((previous) =>
            previous.includes(name) ? previous : [...previous, name],
          );
        }}
        onCloseTable={(name) => {
          const next = opened.filter((item) => item !== name);
          setOpened(next);
          if (selected === name) setSelected(next[0] ?? "");
        }}
        onCloseDiagram={() => {}}
        onCreateTable={() => {}}
      >
        <div className="astw:flex astw:items-center astw:gap-2 astw:border-b astw:border-border astw:p-3">
          <span className="astw:text-label-md">
            {selected || "テーブルを選択"}
          </span>
          <Badge variant="neutral">閲覧者</Badge>
        </div>
        {selected && (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>id</Table.Head>
                <Table.Head>
                  {selected === "sale_order" ? "name" : "display_name"}
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>1</Table.Cell>
                <Table.Cell>
                  {selected === "sale_order" ? "S00001" : "東都設備株式会社"}
                </Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>2</Table.Cell>
                <Table.Cell>
                  {selected === "sale_order" ? "S00002" : "西日本商事株式会社"}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        )}
      </DatabaseWorkspace>
    </div>
  );
}
