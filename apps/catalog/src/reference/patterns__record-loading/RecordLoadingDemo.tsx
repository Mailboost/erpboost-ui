import { useState } from "react";
import {
  Button,
  Card,
  FormLoadingFields,
  Input,
  RecordPlaceholder,
  Table,
  TableLoadingRows,
} from "@mailboost/erpboost-ui";
const fields = [
  { key: "code", label: "Reference" },
  { key: "account", label: "Account", shape: "lookup" as const },
  { key: "note", label: "Notes", shape: "textarea" as const, fullWidth: true },
];
const columns = [
  { key: "code", header: "Reference", width: 240 },
  { key: "description", header: "Description", width: 260 },
  { key: "quantity", header: "Quantity", width: 120 },
  { key: "action", header: "Actions", width: 80 },
];
export function RecordLoadingDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="astw:grid astw:gap-5 astw:min-w-0">
      <Button type="button" onClick={() => setLoading((value) => !value)}>
        {loading ? "Show loaded" : "Show loading"}
      </Button>
      <section
        aria-label="Record preview"
        aria-busy={loading}
        className="astw:min-w-0"
      >
        <span role="status">
          {loading ? "Loading record…" : "Record ready"}
        </span>
        <Card.Root>
          <Card.Header
            title={loading ? <RecordPlaceholder shape="title" /> : "Record"}
          />
          <Card.Content>
            {loading ? (
              <FormLoadingFields fields={fields} />
            ) : (
              <div className="astw:min-w-0 astw:[container-type:inline-size]">
                <div className="astw:grid astw:grid-cols-2 astw:items-start astw:gap-5 astw:[&>*]:min-w-0 astw:[&_input[type=number]]:text-right astw:[&_input[type=number]]:tabular-nums astw:[@container_(max-width:580px)]:grid-cols-1 astw:max-[520px]:gap-4">
                  <label>
                    Reference
                    <Input defaultValue="0001" />
                  </label>
                  <label>
                    Account
                    <Input defaultValue="Sample account" />
                  </label>
                  <div className="astw:col-span-full">
                    <label>
                      Notes
                      <Input defaultValue="Saved content" />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </Card.Content>
        </Card.Root>
        <div className="astw:mt-5">
          <div className="astw:overflow-auto astw:max-w-full astw:border astw:border-border astw:rounded-[8px] astw:bg-card astw:overscroll-x-contain astw:focus-visible:outline-2 astw:focus-visible:outline astw:focus-visible:outline-offset-2" role="region" aria-label="Record items" tabIndex={0}>
   <Table.Root
     containerClassName="astw:[&&]:overflow-visible astw:[&&]:static"
     style={{ minWidth: 700 }}
     className="astw:table-fixed astw:[&_th]:whitespace-nowrap astw:[&_td]:align-top astw:[&_input[type=number]]:text-right astw:[&_input[type=number]]:tabular-nums astw:[&_:is(input,select,textarea)]:tabular-nums astw:[&_td:last-child]:sticky astw:[&_td:last-child]:right-0 astw:[&_td:last-child]:w-12 astw:[&_td:last-child]:min-w-0 astw:[&_td:last-child]:bg-card astw:[&_td:last-child]:border-l astw:[&_td:last-child]:border-border astw:[&_td:last-child]:text-center astw:[&_td:last-child]:align-middle"
   >
     <colgroup>
       {columns.map((column) => (
         <col key={column.key} style={{ width: column.width }} />
       ))}
     </colgroup>
     <Table.Header>
       <Table.Row>
         {columns.map((column) => (
           <Table.Head key={column.key} scope="col">
             {column.header}
           </Table.Head>
         ))}
       </Table.Row>
     </Table.Header>
     <Table.Body>
       {loading ? (
         <TableLoadingRows
           columns={[
             { key: "code", shape: "lookup" },
             { key: "description", shape: "input" },
             { key: "quantity", shape: "input" },
             { key: "action", shape: "empty" },
           ]}
           rows={3}
         />
       ) : (
         <Table.Row>
           <Table.Cell>0001</Table.Cell>
           <Table.Cell>Sample item</Table.Cell>
           <Table.Cell>3</Table.Cell>
           <Table.Cell>
             <Button type="button" size="sm">
               Edit
             </Button>
           </Table.Cell>
         </Table.Row>
       )}
     </Table.Body>
   </Table.Root>
   </div>
        </div>
      </section>
    </div>
  );
}
