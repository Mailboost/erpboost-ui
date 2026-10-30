import { useState } from "react";
import {
  ManagementLayout,
  ManagementTable,
  IdentityCell,
  FormStack,
  SettingsList,
  SettingsRow,
  ResponsiveLabel,
  SetupPanel,
  Input,
  Button,
  SearchField,
  Table,
  Badge,
} from "@mailboost/erpboost-ui";
export function ManagementLayoutDemo() {
  const [search, setSearch] = useState(""),
    [role, setRole] = useState("Viewer"),
    [ready, setReady] = useState(false),
    [selected, setSelected] = useState("");
  const rows = [
    {
      id: "one",
      name: "Demo workspace",
      provider: "Provider A",
      url: "https://example.invalid",
    },
    {
      id: "two",
      name: "Second workspace",
      provider: "Provider B",
      url: "https://two.invalid",
    },
  ].filter((row) => row.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <ManagementLayout.Root>
      <ManagementLayout.Heading>
        <h2>Resources</h2>
        <Button
          aria-label="Add resource"
          onClick={() => setSelected("New resource")}
        >
          <ResponsiveLabel full="Add resource" compact="Add" />
        </Button>
      </ManagementLayout.Heading>
      <ManagementLayout.Surface aria-label="Resource list">
        <ManagementLayout.Toolbar aria-label="Resource search">
          <ManagementLayout.Search>
            <SearchField
              aria-label="Search resources"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              clearLabel="Clear search"
              onClear={() => setSearch("")}
            />
          </ManagementLayout.Search>
        </ManagementLayout.Toolbar>
        <ManagementTable.Root aria-label="Resources">
          <Table.Header>
            <Table.Row>
              <ManagementTable.Head>Name</ManagementTable.Head>
              <ManagementTable.Head hideOnCompact>
                Provider
              </ManagementTable.Head>
              <ManagementTable.Head hideOnCompact>
                Endpoint
              </ManagementTable.Head>
              <ManagementTable.Head width={100} align="right">
                Action
              </ManagementTable.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {rows.map((row) => (
              <Table.Row key={row.id}>
                <ManagementTable.Cell>
                  <IdentityCell
                    title={row.name}
                    badges={<Badge>Ready</Badge>}
                  />
                </ManagementTable.Cell>
                <ManagementTable.Cell hideOnCompact>
                  {row.provider}
                </ManagementTable.Cell>
                <ManagementTable.Cell hideOnCompact muted>
                  {row.url}
                </ManagementTable.Cell>
                <ManagementTable.Cell align="right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelected(row.name)}
                  >
                    Edit {row.id}
                  </Button>
                </ManagementTable.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </ManagementTable.Root>
      </ManagementLayout.Surface>
      <p role="status" aria-label="Selection result">
        {selected || `${rows.length} resources`}
      </p>
      <FormStack className="astw:mt-6">
        <SettingsList>
          <SettingsRow
            label={
              <label htmlFor="demo-role">
                <IdentityCell
                  title="Jordan Mitchell"
                  description="j.mitchell@example.invalid"
                />
              </label>
            }
            control={
              <Input
                id="demo-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              />
            }
          />
        </SettingsList>
        <SetupPanel
          title="Prepare workspace"
          description="A reusable setup surface. The consumer implements the action."
        >
          <Button onClick={() => setReady(true)}>Prepare</Button>
        </SetupPanel>
        <output aria-label="Preparation result">
          {ready ? "Ready" : "Pending"}
        </output>
      </FormStack>
    </ManagementLayout.Root>
  );
}
