import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { it, expect, vi } from "vitest";
import { FormDialog } from "../packages/ui/src/components/form-dialog";
import { InlineRename } from "../packages/ui/src/components/inline-rename";
const props = {
  title: "Form",
  cancelLabel: "Cancel",
  submitLabel: "Save",
  onClose: () => {},
};
it("guards programmatic form submissions when disabled or busy", () => {
  const submit = vi.fn();
  const view = render(
    <FormDialog {...props} onSubmit={submit} submitDisabled>
      <input aria-label="Name" />
    </FormDialog>,
  );
  const form = screen.getByRole("textbox", { name: "Name" }).closest("form")!;
  fireEvent.submit(form);
  expect(submit).not.toHaveBeenCalled();
  view.rerender(
    <FormDialog {...props} onSubmit={submit} busy>
      <input aria-label="Name" />
    </FormDialog>,
  );
  fireEvent.submit(form);
  expect(submit).not.toHaveBeenCalled();
  view.rerender(
    <FormDialog {...props} onSubmit={submit}>
      <input aria-label="Name" />
    </FormDialog>,
  );
  fireEvent.submit(form);
  expect(submit).toHaveBeenCalledOnce();
});
it("blocks cancel and Escape during busy state and releases them afterwards", async () => {
  const close = vi.fn();
  const view = render(
    <FormDialog {...props} busy onClose={close} onSubmit={() => {}}>
      <input aria-label="Name" />
    </FormDialog>,
  );
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Name" }),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  fireEvent.keyDown(document.activeElement!, { key: "Escape", code: "Escape" });
  expect(close).not.toHaveBeenCalled();
  view.rerender(
    <FormDialog {...props} onClose={close} onSubmit={() => {}}>
      <input aria-label="Name" />
    </FormDialog>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(close).toHaveBeenCalledOnce();
});
it("keeps auxiliary actions separate from submitting and preserves child values after error", () => {
  const submit = vi.fn(),
    aux = vi.fn();
  const children = <input aria-label="Name" defaultValue="0001" />;
  const view = render(
    <FormDialog
      {...props}
      onSubmit={submit}
      leadingActions={
        <button type="button" onClick={aux}>
          Auxiliary
        </button>
      }
    >
      {children}
    </FormDialog>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Auxiliary" }));
  expect(aux).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
  view.rerender(
    <FormDialog {...props} onSubmit={submit} error="Retry needed">
      {children}
    </FormDialog>,
  );
  expect(
    (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value,
  ).toBe("0001");
  expect(screen.getByRole("alert").textContent).toContain("Retry needed");
  expect(
    (screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).type,
  ).toBe("submit");
});
it("focuses and selects the original controlled name", async () => {
  render(
    <InlineRename
      aria-label="Name"
      value="日本語 title"
      onValueChange={() => {}}
      onCommit={() => {}}
      onCancel={() => {}}
    />,
  );
  const input = screen.getByRole("textbox", {
    name: "Name",
  }) as HTMLInputElement;
  await waitFor(() => expect(document.activeElement).toBe(input));
  expect(input.selectionStart).toBe(0);
  expect(input.selectionEnd).toBe(input.value.length);
});
it("ignores composition Enter/Escape and legacy key code 229", () => {
  const commit = vi.fn(),
    cancel = vi.fn();
  render(
    <InlineRename
      aria-label="Name"
      value="Original"
      onValueChange={() => {}}
      onCommit={commit}
      onCancel={cancel}
    />,
  );
  const input = screen.getByRole("textbox", { name: "Name" });
  for (const key of ["Enter", "Escape"]) {
    fireEvent.keyDown(input, { key, isComposing: true });
    fireEvent.keyDown(input, { key, keyCode: 229 });
  }
  expect(commit).not.toHaveBeenCalled();
  expect(cancel).not.toHaveBeenCalled();
});
it("commits once and keeps Enter out of the parent form and handlers", () => {
  const commit = vi.fn(),
    parent = vi.fn(),
    submit = vi.fn();
  render(
    <form onKeyDown={parent} onSubmit={submit}>
      <InlineRename
        aria-label="Name"
        value="Original"
        onValueChange={() => {}}
        onCommit={commit}
        onCancel={() => {}}
      />
    </form>,
  );
  const input = screen.getByRole("textbox", { name: "Name" });
  fireEvent.keyDown(input, { key: "Enter" });
  fireEvent.blur(input);
  fireEvent.keyDown(input, { key: "Enter" });
  expect(commit).toHaveBeenCalledOnce();
  expect(parent).not.toHaveBeenCalled();
  expect(submit).not.toHaveBeenCalled();
});
it("cancels with the exact original value without a later blur commit", () => {
  const commit = vi.fn(),
    cancel = vi.fn();
  function Fixture() {
    const [value, setValue] = useState("  Original 日本語  ");
    return (
      <InlineRename
        aria-label="Name"
        value={value}
        onValueChange={setValue}
        onCommit={commit}
        onCancel={cancel}
      />
    );
  }
  render(<Fixture />);
  const input = screen.getByRole("textbox", { name: "Name" });
  fireEvent.change(input, { target: { value: "Edited" } });
  fireEvent.keyDown(input, { key: "Escape" });
  fireEvent.blur(input);
  expect(cancel).toHaveBeenCalledExactlyOnceWith("  Original 日本語  ");
  expect(commit).not.toHaveBeenCalled();
});
it("commits on blur while disabled editing emits no completion", () => {
  const commit = vi.fn(),
    cancel = vi.fn();
  const view = render(
    <InlineRename
      aria-label="Name"
      value="A"
      onValueChange={() => {}}
      onCommit={commit}
      onCancel={cancel}
      disabled
    />,
  );
  const input = screen.getByRole("textbox", { name: "Name" });
  fireEvent.blur(input);
  fireEvent.keyDown(input, { key: "Escape" });
  expect(commit).not.toHaveBeenCalled();
  expect(cancel).not.toHaveBeenCalled();
  view.rerender(
    <InlineRename
      aria-label="Name"
      value="A"
      onValueChange={() => {}}
      onCommit={commit}
      onCancel={cancel}
    />,
  );
  fireEvent.blur(input);
  expect(commit).toHaveBeenCalledOnce();
});
