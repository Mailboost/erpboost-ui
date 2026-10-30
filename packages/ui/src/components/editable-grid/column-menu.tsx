import { Button } from "../button";
import { Menu } from "../menu";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  LockKeyhole,
  Pencil,
  Trash2,
  UnlockKeyhole,
} from "lucide-react";
import type { ComponentProps } from "react";

export function GridColumnMenu({
  name,
  onSort,
  onEdit,
  frozen,
  onFreeze,
  container,
}: {
  container?: ComponentProps<typeof Menu.Content>["container"];
  name: string;
  onSort: (direction: "asc" | "desc") => void;
  onEdit?: () => void;
  frozen: boolean;
  onFreeze: () => void;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="erpui-column-menu-trigger"
          />
        }
        aria-label={`${name}のメニュー`}
      >
        <ChevronDown size={13} />
      </Menu.Trigger>
      <Menu.Content
        container={container}
        position={{ align: "end" }}
        aria-label={`${name}の操作`}
      >
        <Menu.Item onClick={() => onSort("asc")}>
          <ArrowUp size={15} />
          昇順で並び替え
        </Menu.Item>
        <Menu.Item onClick={() => onSort("desc")}>
          <ArrowDown size={15} />
          降順で並び替え
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item onClick={() => void navigator.clipboard.writeText(name)}>
          <Copy size={15} />
          名前をコピー
        </Menu.Item>
        <Menu.Item disabled={!onEdit} onClick={onEdit}>
          <Pencil size={15} />
          カラムを編集
        </Menu.Item>
        <Menu.Item onClick={onFreeze}>
          {frozen ? <UnlockKeyhole size={15} /> : <LockKeyhole size={15} />}{" "}
          {frozen ? "カラムの固定を解除" : "このカラムまで固定"}
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item disabled title="カラムの削除は未対応です">
          <Trash2 size={15} />
          カラムを削除
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
}
