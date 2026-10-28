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
} from "@mailboost/erpboost-ui";

/** Explicit JSX composition. No auth, APIs, schema forms or business operations. */
export function ContextDetailsDemo() {
  const [organization, setOrganization] = useState<string | null>("Mailboost");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const [template, setTemplate] = useState("");
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
      <div style={{ display: "grid", gap: 20, padding: 16 }}>
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
        <div style={{ overflow: "auto" }}>
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
        </div>
      </div>
    </div>
  );
}
