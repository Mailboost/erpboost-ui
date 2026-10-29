import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import {
  buildErdGraph,
  ErdDiagram,
  type ErdSchema,
} from "../packages/ui/src/components/erd-diagram";
import { LocaleProvider } from "../packages/ui/src/components/locale-provider";

const schema: ErdSchema = {
  models: [
    {
      name: "customers",
      primaryKeys: ["id"],
      columns: [
        { name: "id", type: "int4" },
        { name: "parent_id", type: "int4" },
        { name: "name", type: "text" },
      ],
    },
    {
      name: "orders",
      primaryKeys: ["id", "line_id"],
      columns: [
        { name: "id", type: "int4" },
        { name: "line_id", type: "int4" },
        { name: "customer_id", type: "int4" },
      ],
    },
  ],
  relations: [
    {
      fromTable: "customers",
      fromField: "parent_id",
      toTable: "customers",
      toField: "id",
      optional: true,
    },
    {
      fromTable: "orders",
      fromField: "customer_id",
      toTable: "customers",
      toField: "id",
    },
  ],
};
it("lays out tables without overlaps and keeps composite keys, FK endpoints and self references", () => {
  const before = JSON.stringify(schema);
  const graph = buildErdGraph(schema, true);
  expect(graph.relations).toHaveLength(2);
  const [customer, order] = graph.tables;
  expect(customer.columns.map((c) => c.name)).toEqual(["id", "parent_id"]);
  expect(
    customer.columns.find((c) => c.name === "parent_id")?.selfReference,
  ).toBe(true);
  expect(order.columns.filter((c) => c.primary).map((c) => c.name)).toEqual([
    "id",
    "line_id",
  ]);
  expect(
    customer.position.x + customer.width <= order.position.x ||
      order.position.x + order.width <= customer.position.x ||
      customer.position.y + customer.height <= order.position.y ||
      order.position.y + order.height <= customer.position.y,
  ).toBe(true);
  expect(JSON.stringify(schema)).toBe(before);
  expect(
    buildErdGraph({
      ...schema,
      models: [...schema.models].reverse(),
    }).tables.map((t) => t.position),
  ).toEqual(buildErdGraph(schema).tables.map((t) => t.position));
});
it("drops duplicate and unknown relationship endpoints without inventing cards or handles", () => {
  const graph = buildErdGraph({
    ...schema,
    relations: [
      ...schema.relations,
      schema.relations[0],
      { ...schema.relations[0], toTable: "hidden" },
      { ...schema.relations[0], toField: "absent" },
    ],
  });
  expect(graph.tables).toHaveLength(2);
  expect(graph.relations).toHaveLength(2);
  expect(new Set(graph.relations.map((r) => r.id)).size).toBe(2);
});
it.each([
  {
    locale: "en-US",
    name: "ER diagram",
    search: "Search diagram tables",
    empty: "No tables",
    keys: "Key fields only",
    controls: "Diagram view controls",
  },
  {
    locale: "ja-JP",
    name: "ER図",
    search: "ER図のテーブルを検索",
    empty: "テーブルがありません",
    keys: "キー項目のみ",
    controls: "ER図の表示操作",
  },
])(
  "uses standalone localization for diagram controls in $locale",
  ({ locale, name, search, empty, keys, controls }) => {
    render(
      <LocaleProvider locale={locale}>
        <div style={{ height: 600 }}>
          <ErdDiagram schema={{ models: [], relations: [] }} />
        </div>
      </LocaleProvider>,
    );
    expect(screen.getByRole("region", { name })).toBeTruthy();
    expect(screen.getByText(empty)).toBeTruthy();
    expect(screen.getByRole("combobox", { name: search })).toBeTruthy();
    expect(screen.getByRole("group", { name: controls })).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: keys }));
    expect(
      screen.getByRole("checkbox", { name: keys }).getAttribute("aria-checked"),
    ).toBe("true");
  },
);
