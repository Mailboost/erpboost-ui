import {
  FormGrid,
  DetailTable,
  RecordActions,
  Input,
  Field,
  Table,
  Button,
  Card,
} from "@mailboost/erpboost-ui";
export function RecordLayoutsDemo() {
  return (
    <Card.Root>
      <Card.Content>
        <FormGrid.Root>
          <Field.Root>
            <Field.Label>Name</Field.Label>
            <Field.Control defaultValue="Sample" />
          </Field.Root>
          <Field.Root>
            <Field.Label>Reference</Field.Label>
            <Field.Control defaultValue="REF-1" />
          </Field.Root>
          <FormGrid.Full>
            <Field.Root>
              <Field.Label>Notes</Field.Label>
              <Field.Control defaultValue="Full-width field" />
            </Field.Root>
          </FormGrid.Full>
        </FormGrid.Root>
      </Card.Content>
      <Card.Content padding="none">
        <DetailTable
          minWidth={768}
          scrollLabel="Line items"
          stickyActions
          columns={[
            { key: "product", header: "Product", width: 240 },
            { key: "quantity", header: "Quantity", width: 120 },
            { key: "price", header: "Price", width: 240 },
            { key: "actions", header: "Actions", width: 48 },
          ]}
        >
          <Table.Row>
            <Table.Cell>
              <Input aria-label="Product" defaultValue="Precision bearing" />
            </Table.Cell>
            <Table.Cell>
              <Input aria-label="Quantity" defaultValue="2" />
            </Table.Cell>
            <Table.Cell>
              <Input aria-label="Price" defaultValue="123456789012345678.90" />
            </Table.Cell>
            <Table.Cell>
              <Button aria-label="Remove line" variant="ghost">
                ×
              </Button>
            </Table.Cell>
          </Table.Row>
        </DetailTable>
      </Card.Content>
      <RecordActions status={<span>Draft</span>}>
        <Button variant="outline">Save draft</Button>
        <Button>Submit</Button>
      </RecordActions>
    </Card.Root>
  );
}
