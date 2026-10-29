import { useState } from "react";
import {
  CollectionLayout,
  Layout,
  SearchField,
  Table,
} from "@mailboost/erpboost-ui";
export function CollectionLayoutDemo() {
  const [search, setSearch] = useState("");
  const rows = ["Precision bearing", "Hex bolt"].filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div style={{ height: 450 }}>
      <CollectionLayout.Root aria-label="Products">
        <CollectionLayout.Heading>
          <Layout.Header title="Products" />
        </CollectionLayout.Heading>
        <CollectionLayout.Collection>
          <CollectionLayout.Toolbar aria-label="Product filters">
            <CollectionLayout.SearchActions>
              <SearchField
                aria-label="Search products"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                clearLabel="Clear"
                onClear={() => setSearch("")}
              />
            </CollectionLayout.SearchActions>
          </CollectionLayout.Toolbar>
          <CollectionLayout.Results>
            <CollectionLayout.TableArea interactive>
              <Table.Root containerClassName="erpui-demo-table-container">
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Product</Table.Head>
                    <Table.Head>Code</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {rows.map((name, index) => (
                    <Table.Row key={name}>
                      <Table.Cell>{name}</Table.Cell>
                      <Table.Cell>{index + 1}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </CollectionLayout.TableArea>
          </CollectionLayout.Results>
          <CollectionLayout.Footer>
            <span role="status">{rows.length} products</span>
          </CollectionLayout.Footer>
        </CollectionLayout.Collection>
      </CollectionLayout.Root>
    </div>
  );
}
