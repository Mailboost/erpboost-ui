import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import {
  FormLoadingFields,
  TableLoadingRows,
} from "../packages/ui/src/components/record-loading";
import { Table } from "../packages/ui/src/components/table";
it("keeps valid table structure, headers and blank action cells without fake interactive controls", () => {
  const columns = [
    { key: "name" },
    { key: "actions", shape: "empty" as const },
  ];
  const { container } = render(
    <Table.Root aria-label="Records">
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Actions</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <TableLoadingRows columns={columns} rows={3} />
      </Table.Body>
    </Table.Root>,
  );
  expect(screen.getAllByRole("columnheader")).toHaveLength(2);
  expect(screen.getAllByRole("row")).toHaveLength(1);
  const rows = container.querySelectorAll("tbody > tr");
  expect(rows).toHaveLength(3);
  for (const row of rows) {
    expect(row.getAttribute("aria-hidden")).toBe("true");
    expect(row.children).toHaveLength(2);
    expect(row.lastElementChild?.childElementCount).toBe(0);
  }
  expect(container.querySelector("input,button,[tabindex]")).toBeNull();
});
it("treats caller field labels as text and creates no input labels or focusable controls", () => {
  const { container } = render(
    <FormLoadingFields
      fields={[
        { key: "name", label: "<img src=x>" },
        { key: "note", label: "Notes", shape: "textarea", fullWidth: true },
      ]}
    />,
  );
  expect(container.textContent).toBe("<img src=x>Notes");
  expect(
    container.querySelector("img,input,label,button,[tabindex]"),
  ).toBeNull();
  expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  expect(screen.queryByText("Notes", { selector: "label" })).toBeNull();
});
it("replaces pending rows on rerender and leaves the caller's frozen column data unchanged", () => {
  const columns = Object.freeze([Object.freeze({ key: "code", width: 88 })]);
  const { container, rerender } = render(
    <table>
      <tbody>
        <TableLoadingRows columns={columns} />
      </tbody>
    </table>,
  );
  expect(container.querySelectorAll("tbody > tr")).toHaveLength(8);
  rerender(
    <table>
      <tbody>
        <TableLoadingRows columns={columns} rows={0} />
      </tbody>
    </table>,
  );
  expect(container.querySelectorAll("tbody > tr")).toHaveLength(0);
  expect(columns).toEqual([{ key: "code", width: 88 }]);
});
