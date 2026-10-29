import { useState } from "react";
import { Box, Boxes } from "lucide-react";
import { Button, Combobox, ErpHeader } from "@mailboost/erpboost-ui";

// Selection and loading belong to the caller, just as in the consuming app.
export function ErpHeaderDemo() {
  const [organization, setOrganization] = useState<string | null>("Mailboost");
  const [connection, setConnection] = useState<string | null>("検証用ERP接続");
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <ErpHeader
        aria-label="ERPboost"
        brand={<Box aria-label="ERPboost" size={26} />}
        organization={
          loading ? (
            <ErpHeader.Loading
              label="組織を読み込んでいます"
              icon={<Boxes size={17} />}
            />
          ) : (
            <Combobox.Parts.Root
              items={["Mailboost", "株式会社サンプルの長い組織名"]}
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
                  {["Mailboost", "株式会社サンプルの長い組織名"].map((name) => (
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
            <Combobox.Parts.Root
              items={["検証用ERP接続", "長い名前のERP接続・販売管理システム"]}
              value={connection}
              onValueChange={setConnection}
            >
              <Combobox.Parts.Trigger
                aria-label="ERP接続を切り替え"
                render={<ErpHeader.Trigger icon={<Box size={17} />} />}
              >
                {connection}
              </Combobox.Parts.Trigger>
              <Combobox.Parts.Content>
                <Combobox.Parts.Input aria-label="ERP接続を検索" />
                <Combobox.Parts.List>
                  {["検証用ERP接続", "長い名前のERP接続・販売管理システム"].map(
                    (name) => (
                      <Combobox.Parts.Item key={name} value={name}>
                        {name}
                      </Combobox.Parts.Item>
                    ),
                  )}
                </Combobox.Parts.List>
              </Combobox.Parts.Content>
            </Combobox.Parts.Root>
          )
        }
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          padding: "0 16px",
        }}
      >
        <Button
          variant="outline"
          aria-pressed={loading}
          onClick={() => setLoading(!loading)}
        >
          読み込み表示を切り替え
        </Button>
        <span role="status">
          選択中：{organization} / {connection}
        </span>
      </div>
    </div>
  );
}
