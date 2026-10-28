import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { Dialog } from "../packages/ui/src/components/dialog";
import { Sheet } from "../packages/ui/src/components/sheet";
import { Menu } from "../packages/ui/src/components/menu";

it("keeps a guarded dialog in the consumer portal and lets the app own its close action", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const close = vi.fn();
  const view = render(
    <Dialog.Root
      open
      onOpenChange={(open, details) => {
        if (!open) {
          details.cancel();
          close();
        }
      }}
    >
      <Dialog.Content container={container} showCloseButton={false}>
        <Dialog.Title>変更を破棄しますか</Dialog.Title>
        <button>編集を続ける</button>
      </Dialog.Content>
    </Dialog.Root>,
  );
  const dialog = await screen.findByRole("dialog", {
    name: "変更を破棄しますか",
  });
  expect(container.contains(dialog)).toBe(true);
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  fireEvent.keyDown(dialog, { key: "Escape" });
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(
    screen.getByRole("dialog", { name: "変更を破棄しますか" }),
  ).toBeTruthy();
  view.unmount();
  container.remove();
});
it("keeps sheet content inside the scoped consumer portal", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const view = render(
    <Sheet.Root open>
      <Sheet.Content container={container}>
        <Sheet.Title>受注詳細</Sheet.Title>
        <input aria-label="受注番号" />
      </Sheet.Content>
    </Sheet.Root>,
  );
  expect(
    container.contains(await screen.findByRole("dialog", { name: "受注詳細" })),
  ).toBe(true);
  view.unmount();
  container.remove();
});
it("renders a menu in the scoped portal and delegates its action once", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const action = vi.fn();
  const view = render(
    <Menu.Root open>
      <Menu.Trigger>操作</Menu.Trigger>
      <Menu.Content container={container}>
        <Menu.Item onClick={action}>編集</Menu.Item>
      </Menu.Content>
    </Menu.Root>,
  );
  const item = await screen.findByRole("menuitem", { name: "編集" });
  expect(container.contains(item)).toBe(true);
  fireEvent.click(item);
  expect(action).toHaveBeenCalledOnce();
  view.unmount();
  container.remove();
});
