import { createPortal } from "react-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import {
  CodeEditor,
  FileList,
  FileListItem,
  CellEditor,
  LogViewer,
  ResizeHandle,
} from "@mailboost/erpboost-ui";
import { EditorView } from "@codemirror/view";
it("keeps editor selection on unchanged values and reconfigures editability without replacing the view", () => {
  const onChange = vi.fn();
  const { container, rerender, unmount } = render(
    <CodeEditor
      value={"first\nsecond"}
      onChange={onChange}
      disabled={false}
      label="Code"
    />,
  );
  const element = container.querySelector(".cm-editor")!;
  const view = EditorView.findFromDOM(element as HTMLElement)!;
  act(() => view.dispatch({ selection: { anchor: 3 } }));
  rerender(
    <CodeEditor
      value={"first\nsecond"}
      onChange={onChange}
      disabled
      label="Code"
    />,
  );
  expect(EditorView.findFromDOM(element as HTMLElement)).toBe(view);
  expect(view.state.selection.main.head).toBe(3);
  expect(view.contentDOM.getAttribute("contenteditable")).toBe("false");
  rerender(
    <CodeEditor
      value={"first\nsecond"}
      onChange={onChange}
      disabled={false}
      label="Code"
      focusRequest={1}
      focusLine={99}
    />,
  );
  expect(view.state.selection.main.head).toBe(6);
  act(() => view.dispatch({ changes: { from: 6, to: 12, insert: "changed" } }));
  expect(onChange).toHaveBeenLastCalledWith("first\nchanged");
  unmount();
  expect(container.querySelector(".cm-editor")).toBeNull();
});
it("keeps file removal separate from file selection", () => {
  const select = vi.fn(),
    remove = vi.fn();
  render(
    <FileList>
      <FileListItem
        name="helpers.py"
        selected
        icon="file"
        onSelect={select}
        actions={<button onClick={remove}>Remove</button>}
      />
    </FileList>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove" }));
  expect(remove).toHaveBeenCalledOnce();
  expect(select).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: /helpers.py/ }));
  expect(select).toHaveBeenCalledOnce();
});
it("keeps the cell surface open while saving, and handles Escape and outside clicks after saving", () => {
  const close = vi.fn(),
    key = vi.fn();
  const props = {
    anchor: { left: 9999, top: 9999 },
    container: document.body,
    title: "name",
    closeLabel: "Close",
    onClose: close,
    onKeyDown: key,
  };
  const { rerender } = render(
    <CellEditor {...props} busy>
      <textarea aria-label="Value" />
    </CellEditor>,
  );
  const dialog = screen.getByRole("dialog");
  expect(dialog.style.left).toBe(`${innerWidth - 304}px`);
  fireEvent.keyDown(dialog, { key: "Escape" });
  fireEvent.pointerDown(document.body);
  expect(close).not.toHaveBeenCalled();
  rerender(
    <CellEditor {...props}>
      <textarea aria-label="Value" />
    </CellEditor>,
  );
  fireEvent.pointerDown(screen.getByRole("textbox"));
  expect(close).not.toHaveBeenCalled();
  fireEvent.keyDown(dialog, { key: "Enter" });
  expect(key).toHaveBeenCalledOnce();
  fireEvent.keyDown(dialog, { key: "Escape" });
  expect(close).toHaveBeenCalledOnce();
  fireEvent.pointerDown(document.body);
  expect(close).toHaveBeenCalledTimes(2);
});
it("renders logs literally and leaves resize keys controlled by the caller", () => {
  const key = vi.fn();
  const { rerender } = render(<LogViewer text="<script>not html</script>" />);
  expect(screen.getByText("<script>not html</script>").tagName).toBe("PRE");
  rerender(<LogViewer text="" empty={<p>No logs</p>} />);
  expect(screen.getByText("No logs")).toBeTruthy();
  rerender(
    <ResizeHandle
      orientation="vertical"
      aria-label="Column width"
      aria-valuenow={120}
      onKeyDown={key}
    />,
  );
  fireEvent.keyDown(screen.getByRole("separator"), { key: "ArrowRight" });
  expect(key).toHaveBeenCalledOnce();
});

it("treats portalled child controls as inside the cell editor", () => {
  const close = vi.fn();
  const { unmount } = render(
    <CellEditor
      anchor={{ left: 8, top: 8 }}
      container={document.body}
      title="active"
      closeLabel="Close"
      onClose={close}
    >
      <textarea aria-label="Cell value" />
      {createPortal(<button>Portalled option</button>, document.body)}
    </CellEditor>,
  );
  fireEvent.pointerDown(
    screen.getByRole("button", { name: "Portalled option" }),
  );
  expect(close).not.toHaveBeenCalled();
  fireEvent.pointerDown(document.body);
  expect(close).toHaveBeenCalledOnce();
  unmount();
  fireEvent.pointerDown(document.body);
  expect(close).toHaveBeenCalledOnce();
});
