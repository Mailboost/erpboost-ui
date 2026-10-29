import { useState } from "react";
import { Boxes, Box, FileCode2, RefreshCw, Eye, EyeOff } from "lucide-react";
import {
  ErpHeader,
  Skeleton,
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
  Fieldset,
  FileList,
  Input,
} from "@mailboost/erpboost-ui";

/** Explicit JSX composition. No auth, APIs, schema forms or business operations. */
export function ContextDetailsDemo() {
  const [organization, setOrganization] = useState<string | null>("Mailboost");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [template, setTemplate] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("orders");
  const [visible, setVisible] = useState(false);
  const [token, setToken] = useState("example-value");
  const [filename, setFilename] = useState("");
  const [title, setTitle] = useState("APIから受注を取得");
  return (
    <div style={{ height: "100%", minHeight: 520, overflow: "auto" }}>
      <ErpHeader
        aria-label="ERPboost"
        brand={<Box size={24} aria-label="ERPboost" />}
        organization={
          loading ? (
            <ErpHeader.Loading
              label="組織を読み込んでいます"
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
                render={<ErpHeader.Trigger icon={<Boxes size={17} />} />}
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
          )
        }
        connection={
          loading ? (
            <ErpHeader.Loading
              label="ERP接続を読み込んでいます"
              icon={<Box size={17} />}
            />
          ) : (
            <ErpHeader.Trigger icon={<Box size={17} />} disabled>
              検証用ERP接続
            </ErpHeader.Trigger>
          )
        }
      />
      <div style={{ display: "flex", minHeight: 520 }}>
        <SidebarPanel style={{ width: 176, flexShrink: 0 }}>
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
              <Input
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
          {loading && (
            <div role="status" aria-label="スケルトンの表示例">
              <Skeleton />
            </div>
          )}
          <Card.Root>
            <Card.Header
              title="基本情報"
              children={
                <Button size="sm" variant="ghost" aria-label="表示を更新">
                  <RefreshCw size={14} />
                </Button>
              }
            />
            <Card.Content>
              <Field.Root>
                <Field.Label>
                  <span>
                    name <Badge variant="neutral">text</Badge>
                  </span>
                </Field.Label>
                <Field.Control defaultValue="S00001" />
              </Field.Root>
            </Card.Content>
          </Card.Root>
          <Fieldset.Root style={{ display: "grid", gap: 16 }}>
            <Fieldset.Legend>接続情報</Fieldset.Legend>
            <div style={{ display: "grid", gap: 16 }}>
              <Field.Root>
                <Field.Label>サンプルの値</Field.Label>
                <div className="astw:grid astw:grid-cols-[minmax(0,1fr)_auto] astw:items-start astw:gap-1.5">
                  <Field.Control
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    type={visible ? "text" : "password"}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={visible ? "値を隠す" : "値を表示"}
                    aria-pressed={visible}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </Button>
                </div>
                <Field.Description>
                  表示切替はこのサンプルが制御します。
                </Field.Description>
              </Field.Root>
            </div>
          </Fieldset.Root>
          <Fieldset.Root style={{ display: "grid", gap: 16 }}>
            <Fieldset.Legend>制約</Fieldset.Legend>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <Badge variant="neutral">必須</Badge>
              <Badge variant="neutral">主キー</Badge>
            </div>
          </Fieldset.Root>
          <FileList.Editor>
            <Input
              aria-label="サンプルのファイル名"
              placeholder="example.py"
              value={filename}
              onChange={(event) => setFilename(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setFilename("");
              }}
            />
            <Button
              disabled={!filename}
              size="sm"
              variant="ghost"
              onClick={() => setFilename("")}
            >
              クリア
            </Button>
          </FileList.Editor>
          <Table.Root aria-label="プレビューの例">
            <Table.Header>
              <Table.Row>
                <Table.Head>#</Table.Head>
                <Table.Head>amount_total</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>1</Table.Cell>
                <Table.Cell>1234567890.123456789</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>2</Table.Cell>
                <Table.Cell>
                  <i>NULL</i>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
          <OptionCard
            title="APIから取り込む"
            description="APIのレスポンスを取り込み、必要なカラムを選びます。"
            icon={<FileCode2 size={17} />}
            onClick={() => setTemplate("APIから取り込む")}
          />
          {template && <p role="status">選択中：{template}</p>}
          <Card.Root>
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
                role="grid"
                aria-label="データの表示例"
                style={{ minWidth: 460 }}
              >
                <Table.Header>
                  <Table.Row>
                    <Table.Head>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>
                          name <Badge variant="neutral">text</Badge>
                        </span>
                      </span>
                    </Table.Head>
                    <Table.Head>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>
                          amount_total <Badge variant="neutral">numeric</Badge>
                        </span>
                      </span>
                    </Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row aria-selected={selected}>
                    <Table.Cell
                      role="gridcell"
                      tabIndex={0}

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
