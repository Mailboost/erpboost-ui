import type { ReactNode, ComponentProps } from "react";
import type { Dialog } from "../dialog";
import type { EditableGridState } from "./index";
export type GridValue = string | number | boolean | null;
export type GridRow = Record<string, GridValue>;
export interface GridColumn {
  name: string;
  label: string;
  type: string;
  editable: boolean;
}
export interface GridModel<C extends GridColumn = GridColumn> {
  name: string;
  primaryKeys: string[];
  columns: C[];
}
export interface GridRelation {
  fromTable: string;
  fromField: string;
}
export interface GridEditorProps<C extends GridColumn> {
  column: C;
  row: GridRow;
  anchor: DOMRect;
  onClose: () => void;
  onSave: (value: GridValue) => Promise<void>;
}
export interface EditableGridProps<C extends GridColumn> {
  model: GridModel<C>;
  data: GridRow[];
  relations: GridRelation[];
  pending: boolean;
  fetching: boolean;
  error?: string;
  viewSwitch?: ReactNode;
  initialState?: EditableGridState;
  onStateChange: (state: EditableGridState) => void;
  rowKey?: (row: GridRow) => string;
  rowLimit?: number;
  onRefresh: () => void;
  onOpen: (row: GridRow, trigger: HTMLButtonElement) => void;
  onAdd?: (trigger: HTMLButtonElement) => void;
  onAddColumn?: () => void;
  onEditColumn?: (column: C) => void;
  onSaveCell: (row: GridRow, column: C, value: GridValue) => Promise<void>;
  onDelete?: (rows: GridRow[]) => Promise<void>;
  renderEditor: (props: GridEditorProps<C>) => ReactNode;
  container?: ComponentProps<typeof Dialog.Content>["container"];
}
