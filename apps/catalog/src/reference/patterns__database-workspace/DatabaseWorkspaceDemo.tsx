import { useState } from "react";
import {
  DatabaseWorkspace,
  HeaderBar,
  SidebarPanel,
  Avatar,
  Card,
  Skeleton,
  Toolbar,
  Input,
  Layout,
  EmptyState,
  Table,
  Badge,
  Button,
  ErdDiagram,
  type ErdSchema,
} from "@mailboost/erpboost-ui";

const schema: ErdSchema = {
  models: [
    {
      name: "sale_order",
      label: "受注",
      primaryKeys: ["id"],
      columns: [
        { name: "id", type: "int4", required: true },
        { name: "name", type: "text", required: true },
        { name: "partner_id", type: "int4", required: true },
      ],
    },
    {
      name: "res_partner",
      label: "得意先",
      primaryKeys: ["id"],
      columns: [
        { name: "id", type: "int4", required: true },
        { name: "display_name", type: "text" },
        { name: "parent_id", type: "int4" },
      ],
    },
  ],
  relations: [
    {
      fromTable: "sale_order",
      fromField: "partner_id",
      toTable: "res_partner",
      toField: "id",
    },
    {
      fromTable: "res_partner",
      fromField: "parent_id",
      toTable: "res_partner",
      toField: "id",
      optional: true,
    },
  ],
};

export function DatabaseWorkspaceDemo() {
  const [view, setView] = useState<"records" | "erd">("records");
  const [selected, setSelected] = useState("sale_order");
  const [opened, setOpened] = useState(["sale_order", "res_partner"]);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const tables = [
    { name: "sale_order", label: "受注" },
    { name: "res_partner", label: "得意先" },
  ];
  return (
    <>
      <div className="astw:h-[600px] astw:overflow-hidden astw:rounded-lg astw:border astw:border-border">
        <DatabaseWorkspace
          tables={tables}
          selectedTable={selected}
          openedTables={opened}
          view={view}
          search={search}
          sidebarOpen={sidebarOpen}
          canCreate={false}
          onSidebarOpenChange={setSidebarOpen}
          onSearchChange={setSearch}
          onSelectTable={(name) => {
            setView("records");
            setSidebarOpen(true);
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
          onCloseDiagram={() => {
            setView("records");
            setSidebarOpen(true);
          }}
          onCreateTable={() => {}}
        >
          <div className="astw:flex astw:items-center astw:gap-2 astw:border-b astw:border-border astw:p-3">
            <span className="astw:text-label-md">
              {selected || "テーブルを選択"}
            </span>
            <Badge variant="neutral">閲覧者</Badge>
            {view === "records" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="astw:ml-auto"
                onClick={() => {
                  setView("erd");
                  setSidebarOpen(false);
                }}
              >
                ER図
              </Button>
            )}
          </div>
          {view === "erd" ? (
            <ErdDiagram
              schema={schema}
              initialTable={selected}
              onOpenTable={(name) => {
                setView("records");
                setSidebarOpen(true);
                setSelected(name);
                setOpened((previous) =>
                  previous.includes(name) ? previous : [...previous, name],
                );
              }}
            />
          ) : (
            selected && (
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
                      {selected === "sale_order"
                        ? "S00001"
                        : "東都設備株式会社"}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>2</Table.Cell>
                    <Table.Cell>
                      {selected === "sale_order"
                        ? "S00002"
                        : "西日本商事株式会社"}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            )
          )}
        </DatabaseWorkspace>
      </div>
      <section className="astw:mt-8" aria-label="Standalone shell parts">
        <h2 className="astw:mb-3 astw:text-heading-sm">
          Standalone header, sidebar and loading states
        </h2>
        <div className="astw:overflow-hidden astw:rounded-lg astw:border astw:border-border">
          <HeaderBar>
            <span>ERPboost / 組織 / ERP接続</span>
            <Avatar.Root>
              <Avatar.Fallback>AB</Avatar.Fallback>
            </Avatar.Root>
          </HeaderBar>
          <div className="astw:flex astw:min-h-56">
            <SidebarPanel className="astw:w-40 astw:border-r astw:border-border astw:p-3">
              <nav aria-label="Example navigation">
                <Button variant="ghost">受注一覧</Button>
                <Button variant="ghost">データベース</Button>
              </nav>
            </SidebarPanel>
            <div className="astw:flex-1 astw:p-4">
              <Layout.Header title="受注一覧" actions={[<Button key="create">新規追加</Button>]}/>
              <Toolbar.Row aria-label="Example order actions" className="astw:my-3"><Input aria-label="受注を検索" placeholder="受注を検索"/><Button variant="outline">再読み込み</Button></Toolbar.Row>
              <EmptyState title="受注がありません" headingLevel={3} description="新規追加から受注を登録できます。"/>

              <Card.Root>
                <Card.Header title="送信履歴" />
                <Card.Content>
                  <div role="status" aria-label="履歴を読み込んでいます">
                    <Skeleton className="astw:mb-3" />
                    <Skeleton />
                  </div>
                </Card.Content>
              </Card.Root>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
