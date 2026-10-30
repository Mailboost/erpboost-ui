import type { ComponentProps, ReactNode } from "react";
import { MoreVertical } from "lucide-react";
import { Menu } from "../menu";
import { Button } from "../button";
export type ActionMenuItem =
  | { separator: true }
  | {
      label: string;
      icon?: ReactNode;
      trailing?: ReactNode;
      disabled?: boolean;
      onSelect: () => void;
    };
export interface ActionMenuProps {
  triggerLabel: string;
  triggerIcon?: ReactNode;
  menuLabel: string;
  title?: string;
  disabled?: boolean;
  items: ActionMenuItem[];
  container?: ComponentProps<typeof Menu.Content>["container"];
}
export function ActionMenu({
  triggerLabel,
  triggerIcon,
  menuLabel,
  title,
  disabled = false,
  items,
  container,
}: ActionMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="erpui-action-menu-trigger astw:opacity-100 astw:shrink-0"
          />
        }
        aria-label={triggerLabel}
        title={title}
        disabled={disabled}
      >
        {triggerIcon ?? <MoreVertical size={15} />}
      </Menu.Trigger>
      <Menu.Content
        container={container}
        position={{ align: "end" }}
        className="erpui-action-menu astw:[&_small]:ml-auto astw:[&_small]:text-muted-foreground"
        aria-label={menuLabel}
      >
        {items.map((item, index) =>
          "separator" in item ? (
            <Menu.Separator key={`separator-${index}`} />
          ) : (
            <Menu.Item
              key={item.label}
              disabled={item.disabled}
              onClick={item.onSelect}
            >
              {item.icon}
              {item.label}
              {item.trailing && <small>{item.trailing}</small>}
            </Menu.Item>
          ),
        )}
      </Menu.Content>
    </Menu.Root>
  );
}
export { AccountMenu, type AccountMenuProps } from "./account-menu";
