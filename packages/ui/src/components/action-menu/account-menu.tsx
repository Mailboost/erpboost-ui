import type { ComponentProps } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Avatar } from "../avatar";
import { SidebarPanel } from "../shell-parts";
import { Menu } from "../menu";
import type { ActionMenuItem } from "./index";
export interface AccountMenuProps {
  displayName?: string | null;
  email: string;
  photoUrl?: string | null;
  disabled?: boolean;
  triggerLabel: (name: string) => string;
  menuLabel: string;
  items: ActionMenuItem[];
  container?: ComponentProps<typeof Menu.Content>["container"];
}
export function AccountMenu({
  displayName,
  email,
  photoUrl,
  disabled = false,
  triggerLabel,
  menuLabel,
  items,
  container,
}: AccountMenuProps) {
  const name = displayName?.trim() || email.split("@")[0] || email,
    words = name.split(/\s+/u);
  const initials = (
    words.length > 1
      ? Array.from(words[0]!)[0]! + Array.from(words[words.length - 1]!)[0]!
      : Array.from(name).slice(0, 2).join("")
  ).toLocaleUpperCase();
  return (
    <SidebarPanel.Footer>
      <Menu.Root>
        <Menu.Trigger
          disabled={disabled}
          aria-label={triggerLabel(name)}
          render={<SidebarPanel.AccountTrigger />}
        >
          <Avatar.Root aria-hidden="true">
            {photoUrl && (
              <Avatar.Image
                src={photoUrl}
                alt=""
                referrerPolicy="no-referrer"
              />
            )}
            <Avatar.Fallback>{initials}</Avatar.Fallback>
          </Avatar.Root>
          <SidebarPanel.Identity name={name} description={email} />
          <ChevronsUpDown size={13} />
        </Menu.Trigger>
        <Menu.Content
          container={container}
          position={{ side: "top" }}
          aria-label={menuLabel}
        >
          <SidebarPanel.Identity name={name} description={email} />
          {items.map((item, index) =>
            "separator" in item ? (
              <Menu.Separator key={index} />
            ) : (
              <Menu.Item
                key={item.label}
                disabled={disabled || item.disabled}
                onClick={item.onSelect}
              >
                {item.icon}
                {item.label}
              </Menu.Item>
            ),
          )}
        </Menu.Content>
      </Menu.Root>
    </SidebarPanel.Footer>
  );
}
