import { graphlib, layout } from "@dagrejs/dagre";
export interface ErdColumnDefinition {
  name: string;
  label?: string;
  type: string;
  required?: boolean;
}
export interface ErdTableDefinition {
  name: string;
  label?: string;
  primaryKeys: readonly string[];
  columns: readonly ErdColumnDefinition[];
}
export interface ErdRelationDefinition {
  fromTable: string;
  fromField: string;
  toTable: string;
  toField: string;
  optional?: boolean;
}
export interface ErdSchema {
  models: readonly ErdTableDefinition[];
  relations: readonly ErdRelationDefinition[];
}

export const tableWidth = 300;
export interface ErdColumn extends ErdColumnDefinition {
  primary: boolean;
  foreign: boolean;
  referenced: boolean;
  selfReference: boolean;
}
export interface ErdTable {
  id: string;
  label: string;
  columns: ErdColumn[];
  width: number;
  height: number;
  position: { x: number; y: number };
}
export function buildErdGraph(catalog: ErdSchema, keysOnly = false) {
  const models = new Map(catalog.models.map((model) => [model.name, model]));
  const seen = new Set<string>();
  const relations = catalog.relations
    .filter((relation) => {
      const key = JSON.stringify([
        relation.fromTable,
        relation.fromField,
        relation.toTable,
        relation.toField,
      ]);
      if (
        seen.has(key) ||
        !models
          .get(relation.fromTable)
          ?.columns.some((column) => column.name === relation.fromField) ||
        !models
          .get(relation.toTable)
          ?.columns.some((column) => column.name === relation.toField)
      )
        return false;
      seen.add(key);
      return true;
    })
    .map((relation) => ({
      ...relation,
      id: JSON.stringify([
        relation.fromTable,
        relation.fromField,
        relation.toTable,
        relation.toField,
      ]),
    }));
  const fieldKey = (table: string, field: string) =>
    JSON.stringify([table, field]);
  const foreign = new Set(
    relations.map((relation) =>
      fieldKey(relation.fromTable, relation.fromField),
    ),
  );
  const referenced = new Set(
    relations.map((relation) => fieldKey(relation.toTable, relation.toField)),
  );
  const self = new Set(
    relations
      .filter((relation) => relation.fromTable === relation.toTable)
      .map((relation) => fieldKey(relation.fromTable, relation.fromField)),
  );
  const tables: ErdTable[] = [...models.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((model) => {
      const columns = model.columns
        .map((column) => ({
          ...column,
          primary: model.primaryKeys.includes(column.name),
          foreign: foreign.has(fieldKey(model.name, column.name)),
          referenced: referenced.has(fieldKey(model.name, column.name)),
          selfReference: self.has(fieldKey(model.name, column.name)),
        }))
        .filter(
          (column) =>
            !keysOnly || column.primary || column.foreign || column.referenced,
        );
      return {
        id: model.name,
        label: model.label ?? model.name,
        columns,
        width: tableWidth,
        height: 52 + Math.max(1, columns.length) * 24,
        position: { x: 0, y: 0 },
      };
    });
  if (!tables.length) return { tables, relations };
  const graph = new graphlib.Graph();
  graph.setGraph({
    rankdir: "LR",
    ranksep: 150,
    nodesep: 48,
    marginx: 40,
    marginy: 40,
  });
  graph.setDefaultEdgeLabel(() => ({}));
  for (const table of tables)
    graph.setNode(table.id, { width: table.width, height: table.height });
  // Layout uses table-level links; rendering keeps every field-level foreign key.
  for (const relation of relations) {
    if (relation.fromTable !== relation.toTable)
      graph.setEdge(relation.toTable, relation.fromTable);
  }
  layout(graph);
  for (const table of tables) {
    const node = graph.node(table.id);
    table.position = {
      x: node.x - table.width / 2,
      y: node.y - table.height / 2,
    };
  }
  return { tables, relations };
}
