import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SensitiveInput } from "../packages/ui/src/components/sensitive-input";
import { ActionConfirmation } from "../packages/ui/src/components/action-confirmation";
import { ValueEditor } from "../packages/ui/src/components/value-editor";
import { LookupInput } from "../packages/ui/src/components/resource-picker";
import { AccountMenu } from "../packages/ui/src/components/action-menu";
it("reveals the consumer input without changing its value and remounts concealed", () => {
  const make = () => (
    <SensitiveInput revealLabel="Show" concealLabel="Hide">
      {({ type }) => (
        <input aria-label="Key" type={type} defaultValue="exact-value" />
      )}
    </SensitiveInput>
  );
  const view = render(make());
  fireEvent.click(screen.getByRole("button", { name: "Show" }));
  expect((screen.getByLabelText("Key") as HTMLInputElement).type).toBe("text");
  expect((screen.getByLabelText("Key") as HTMLInputElement).value).toBe(
    "exact-value",
  );
  view.unmount();
  render(make());
  expect((screen.getByLabelText("Key") as HTMLInputElement).type).toBe(
    "password",
  );
});
it("blocks both confirmation actions while busy", () => {
  const yes = vi.fn(),
    no = vi.fn();
  render(
    <ActionConfirmation
      title="Wait"
      busy
      confirmLabel="Confirm"
      cancelLabel="Cancel"
      onConfirm={yes}
      onCancel={no}
    >
      <p>Pending</p>
    </ActionConfirmation>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(yes).not.toHaveBeenCalled();
  expect(no).not.toHaveBeenCalled();
});
it("preserves exact value strings and refuses duplicate saves while pending", async () => {
  let done!: () => void;
  const close = vi.fn(),
    save = vi.fn(() => new Promise<void>((resolve) => (done = resolve)));
  render(
    <ValueEditor
      name="amount"
      description="Text"
      initialValue="9007199254740993"
      anchor={new DOMRect(0, 0)}
      container={document.body}
      onClose={close}
      onSave={save}
    />,
  );
  const input = screen.getByRole("textbox", { name: "amountの値" });
  fireEvent.keyDown(input, { key: "Enter" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith("9007199254740993");
  expect(close).not.toHaveBeenCalled();
  done();
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
});
it("keeps the editor open when consumer validation rejects a save", async () => {
  const close = vi.fn();
  render(
    <ValueEditor
      name="amount"
      description="Text"
      initialValue="invalid"
      anchor={new DOMRect(0, 0)}
      container={document.body}
      onClose={close}
      onSave={async () => {
        throw new Error("Consumer validation");
      }}
    />,
  );
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getByText("Consumer validation")).toBeTruthy();
  expect(close).not.toHaveBeenCalled();
});
it("retains a selected lookup label when new search results omit it", async () => {
  const props = {
    label: "Customer",
    value: "0001",
    search: "",
    onSearchChange: vi.fn(),
    onValueChange: vi.fn(),
    triggerLabel: "Show customers",
    clearLabel: "Clear",
  };
  const view = render(
    <LookupInput {...props} items={[{ value: "0001", label: "Acme" }]} />,
  );
  await waitFor(() =>
    expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe(
      "Acme",
    ),
  );
  view.rerender(
    <LookupInput {...props} items={[{ value: "0002", label: "Beta" }]} />,
  );
  expect((screen.getByRole("combobox") as HTMLInputElement).value).toBe("Acme");
  expect(props.onValueChange).not.toHaveBeenCalled();
});
it("uses Unicode-aware account initials and delegates authentication actions", () => {
  render(
    <AccountMenu
      displayName="山田 太郎"
      email="user@example.invalid"
      triggerLabel={(name) => name}
      menuLabel="Profile"
      items={[]}
    />,
  );
  expect(screen.getByText("山太")).toBeTruthy();
  expect(screen.getByRole("button", { name: "山田 太郎" })).toBeTruthy();
});
