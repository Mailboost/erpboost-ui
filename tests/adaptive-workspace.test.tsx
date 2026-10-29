import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AdaptiveWorkspace } from "../packages/ui/src/components/adaptive-workspace";
function setup(initialWidth: number) {
  let width = initialWidth;
  const observers: {
    callback: ResizeObserverCallback;
    instance: ResizeObserver;
  }[] = [];
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () => new DOMRect(0, 0, width, 600),
  );
  vi.spyOn(globalThis, "ResizeObserver").mockImplementation(
    class {
      constructor(callback: ResizeObserverCallback) {
        observers.push({ callback, instance: this });
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  const resize = (next: number) =>
    act(() => {
      width = next;
      const current = observers.at(-1)!;
      current.callback([], current.instance);
    });
  return { resize };
}
function Example({
  collapseKey = 0,
  onSubmit = () => {},
}: {
  collapseKey?: number;
  onSubmit?: () => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <AdaptiveWorkspace
        navigationLabel="Files"
        collapseKey={collapseKey}
        sidebar={
          <aside>
            <input aria-label="Sidebar draft" defaultValue="0001" />
          </aside>
        }
      >
        <input aria-label="Editor" defaultValue="9007199254740993" />
      </AdaptiveWorkspace>
    </form>
  );
}
it("toggles compact navigation without remounting either input or submitting its parent form", () => {
  setup(390);
  const submit = vi.fn();
  const view = render(<Example onSubmit={submit} />);
  const editor = screen.getByRole("textbox", { name: "Editor" }),
    sidebar = view.container.querySelector(
      'input[aria-label="Sidebar draft"]',
    )!;
  const toggle = screen.getByRole("button", { name: "Files" });
  const panel = document.getElementById(toggle.getAttribute("aria-controls")!)!;
  expect(panel.hidden).toBe(true);
  fireEvent.click(toggle);
  fireEvent.change(sidebar, { target: { value: "日本語_0001" } });
  fireEvent.click(toggle);
  expect(panel.hidden).toBe(true);
  fireEvent.click(toggle);
  expect(
    view.container.querySelector('input[aria-label="Sidebar draft"]'),
  ).toBe(sidebar);
  expect((sidebar as HTMLInputElement).value).toBe("日本語_0001");
  expect(screen.getByRole("textbox", { name: "Editor" })).toBe(editor);
  expect(submit).not.toHaveBeenCalled();
});
it("uses observed container width and returns focus before hiding a focused sidebar on resize", () => {
  const { resize } = setup(900);
  const view = render(<Example />);
  const sidebar = screen.getByRole("textbox", { name: "Sidebar draft" }),
    editor = screen.getByRole("textbox", { name: "Editor" });
  sidebar.focus();
  expect(screen.queryByRole("button", { name: "Files" })).toBeNull();
  resize(360);
  const toggle = screen.getByRole("button", { name: "Files" });
  expect(document.activeElement).toBe(toggle);
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  resize(900);
  expect(screen.queryByRole("button", { name: "Files" })).toBeNull();
  expect(screen.getByRole("textbox", { name: "Sidebar draft" })).toBe(sidebar);
  expect(screen.getByRole("textbox", { name: "Editor" })).toBe(editor);
  view.unmount();
  resize(300);
});
it("collapses on caller navigation while retaining the editor focus and exact values", () => {
  setup(390);
  const view = render(<Example />);
  fireEvent.click(screen.getByRole("button", { name: "Files" }));
  const editor = screen.getByRole("textbox", { name: "Editor" });
  editor.focus();
  view.rerender(<Example collapseKey={1} />);
  expect(
    screen.getByRole("button", { name: "Files" }).getAttribute("aria-expanded"),
  ).toBe("false");
  expect(document.activeElement).toBe(editor);
  expect((editor as HTMLInputElement).value).toBe("9007199254740993");
});
