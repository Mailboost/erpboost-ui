import { useState } from "react";
import { Boxes, Box, FileCode2, KeyRound, RefreshCw } from "lucide-react";
import {
  HeaderBar,
  Card,
  OptionCard,
  Table,
  Field,
  Button,
  Combobox,
  Checkbox,
  SidebarPanel,
  SearchField,
  Badge,
  CodeWorkspace,
  Toolbar,
} from "@mailboost/erpboost-ui";

/** Explicit JSX composition. No auth, APIs, schema forms or business operations. */
export function ContextDetailsDemo() {
  const [organization, setOrganization] = useState<string | null>("Mailboost");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [template, setTemplate] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("orders");
  const [title, setTitle] = useState("APIから受注を取得");
  return (
    <div style={{ height: "100%", minHeight: 520, overflow: "auto" }}>
      <HeaderBar layout="context">
        <HeaderBar.Brand>
          <Box size={24} aria-label="ERPboost" />
        </HeaderBar.Brand>
        <HeaderBar.Separator />
        <HeaderBar.ContextItem>
          {loading ? (
            <HeaderBar.ContextLoading
              aria-label="組織を読み込んでいます"
              icon={<Boxes size={17} />}
            />
          ) : (
            <Combobox.Parts.Root
              items={["Mailboost", "テスト組織"]}
              value={organization}
              onValueChange={setOrganization}
            >
              <Combobox.Parts.Trigger
                aria-label="組織を切り替え"
                render={<HeaderBar.ContextTrigger icon={<Boxes size={17} />} />}
              >
                {organization}
              </Combobox.Parts.Trigger>
              <Combobox.Parts.Content>
                <Combobox.Parts.Input aria-label="組織を検索" />
                <Combobox.Parts.List>
                  {["Mailboost", "テスト組織"].map((name) => (
                    <Combobox.Parts.Item key={name} value={name}>
                      {name}
                    </Combobox.Parts.Item>
                  ))}
                </Combobox.Parts.List>
              </Combobox.Parts.Content>
            </Combobox.Parts.Root>
          )}
        </HeaderBar.ContextItem>
        <HeaderBar.Separator />
        <HeaderBar.ContextItem>
          <HeaderBar.ContextTrigger icon={<Box size={17} />} disabled>
            検証用ERP接続
          </HeaderBar.ContextTrigger>
        </HeaderBar.ContextItem>
      </HeaderBar>
      <div style={{ display: "flex", minHeight: 520 }}>
        <SidebarPanel layout="compact" style={{ width: 176, flexShrink: 0 }}>
          <SidebarPanel.Nav aria-label="サンプルのメニュー">
            <SidebarPanel.Label>業務</SidebarPanel.Label>
            <SidebarPanel.Button
              active={view === "orders"}
              onClick={() => setView("orders")}
            >
              <Box size={18} />
              <span>受注一覧</span>
            </SidebarPanel.Button>
            <SidebarPanel.Label>データ連携</SidebarPanel.Label>
            <SidebarPanel.Button
              active={view === "sync"}
              onClick={() => setView("sync")}
            >
              <FileCode2 size={18} />
              <span>データ同期</span>
            </SidebarPanel.Button>
          </SidebarPanel.Nav>
          <SidebarPanel.Footer>
            <SidebarPanel.AccountTrigger aria-label="サンプルアカウント">
              <SidebarPanel.Identity
                compact
                name="Demo user"
                description="demo@example.com"
              />
            </SidebarPanel.AccountTrigger>
          </SidebarPanel.Footer>
        </SidebarPanel>
        <div
          style={{
            display: "grid",
            gap: 20,
            padding: 16,
            minWidth: 0,
            flex: 1,
          }}
        >
          <Toolbar.Row aria-label="サンプルの検索">
            <SearchField
              aria-label="サンプルを検索"
              placeholder="検索…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              clearLabel="検索をクリア"
              onClear={() => setSearch("")}
            />
          </Toolbar.Row>
          <CodeWorkspace.PageHeader
            title={
              <CodeWorkspace.TitleInput
                aria-label="サンプルの連携名"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            }
          >
            <Toolbar.Row aria-label="サンプルの操作">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTitle("APIから受注を取得")}
              >
                名前を戻す
              </Button>
            </Toolbar.Row>
          </CodeWorkspace.PageHeader>
          <Checkbox
            checked={loading}
            onCheckedChange={setLoading}
            aria-label="読み込み表示を確認"
          />
          <Card.Root density="compact">
            <Card.Header
              title="基本情報"
              actions={
                <Button size="sm" variant="ghost" aria-label="表示を更新">
                  <RefreshCw size={14} />
                </Button>
              }
            />
            <Card.Content>
              <Field.Root>
                <Field.Label>
                  <Table.ColumnLabel
                    stacked
                    name="name"
                    type="text"
                    icon={<KeyRound size={12} />}
                    description="受注番号"
                  />
                </Field.Label>
                <Field.Control defaultValue="S00001" />
              </Field.Root>
            </Card.Content>
          </Card.Root>
          <OptionCard
            title="APIから取り込む"
            description="APIのレスポンスを取り込み、必要なカラムを選びます。"
            icon={<FileCode2 size={17} />}
            onClick={() => setTemplate("APIから取り込む")}
          />
          {template && <p role="status">選択中：{template}</p>}
          <Card.Root density="compact" variant="plain">
            <Card.Header
              title={
                <span>
                  明細
                  <Badge variant="neutral" aria-label="1件">
                    1
                  </Badge>
                </span>
              }
            />
            <Card.Content padding="none" style={{ overflow: "auto" }}>
              <Table.Root
                variant="grid"
                role="grid"
                aria-label="データの表示例"
                style={{ minWidth: 460 }}
              >
                <Table.Header>
                  <Table.Row>
                    <Table.Head frozenEdge>
                      <Table.ColumnHeading>
                        <Table.ColumnLabel
                          name="name"
                          type="text"
                          icon={<KeyRound size={14} />}
                        />
                      </Table.ColumnHeading>
                    </Table.Head>
                    <Table.Head>
                      <Table.ColumnHeading>
                        <Table.ColumnLabel name="amount_total" type="numeric" />
                      </Table.ColumnHeading>
                    </Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row aria-selected={selected}>
                    <Table.Cell
                      role="gridcell"
                      tabIndex={0}
                      frozenEdge
                      aria-selected={selected}
                      onFocus={() => setSelected(true)}
                      onClick={() => setSelected(true)}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") setSelected(false);
                      }}
                    >
                      <span>S00001</span>
                    </Table.Cell>
                    <Table.Cell>
                      <span>1234567890.123456789</span>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Card.Content>
          </Card.Root>
        </div>
      </div>
    </div>
  );
}
