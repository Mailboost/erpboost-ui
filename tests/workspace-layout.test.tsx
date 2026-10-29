import { fireEvent, render, screen } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import {
  CodeWorkspace,
  GraphControls,
  Button,
  Dialog,
  Sheet,
} from "@mailboost/erpboost-ui";
it("keeps zoom state and graph actions controlled, and skips disabled controls with arrow keys", () => {
  const out = vi.fn(),
    inside = vi.fn(),
    fit = vi.fn(),
    orientation = vi.fn();
  const { rerender } = render(
    <GraphControls
      aria-label="Graph view"
      zoom={5}
      zoomOutLabel="Out"
      zoomInLabel="In"
      fitViewLabel="Fit"
      onZoomOut={out}
      onZoomIn={inside}
      onFitView={fit}
    >
      <Button onClick={orientation}>Direction</Button>
    </GraphControls>,
  );
  expect(
    (screen.getByRole("button", { name: "Out" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Direction" }));
  expect(orientation).toHaveBeenCalledOnce();
  screen.getByRole("button", { name: "Direction" }).focus();
  fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "In" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "In" }));
  expect(inside).toHaveBeenCalledOnce();
  expect(screen.getByText("5%")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Fit" }));
  expect(fit).toHaveBeenCalledOnce();
  rerender(
    <GraphControls
      zoom={150}
      zoomOutLabel="Out"
      zoomInLabel="In"
      fitViewLabel="Fit"
      onZoomOut={out}
      onZoomIn={inside}
      onFitView={fit}
    />,
  );
  expect(
    (screen.getByRole("button", { name: "In" }) as HTMLButtonElement).disabled,
  ).toBe(true);
});
it("keeps editor and results mounted while the controlled graph panel closes", () => {
  const view = (panel: boolean) => (
    <CodeWorkspace.Root>
      <CodeWorkspace.Sidebar aria-label="Files">
        pipeline.py
      </CodeWorkspace.Sidebar>
      <CodeWorkspace.Main>
        <CodeWorkspace.Editor>
          <input aria-label="Code" defaultValue="original" />
          <CodeWorkspace.Results>
            <CodeWorkspace.ResultsHeader actions={<button>Action</button>}>
              Logs
            </CodeWorkspace.ResultsHeader>
            <CodeWorkspace.ResultsBody>Result</CodeWorkspace.ResultsBody>
          </CodeWorkspace.Results>
        </CodeWorkspace.Editor>
        {panel && (
          <CodeWorkspace.Panel width={440} aria-label="Graph">
            <CodeWorkspace.Header>Graph</CodeWorkspace.Header>
            <div>Nodes</div>
          </CodeWorkspace.Panel>
        )}
      </CodeWorkspace.Main>
    </CodeWorkspace.Root>
  );
  const { rerender } = render(view(true));
  fireEvent.change(screen.getByRole("textbox", { name: "Code" }), {
    target: { value: "unsaved" },
  });
  rerender(view(false));
  expect(
    (screen.getByRole("textbox", { name: "Code" }) as HTMLInputElement).value,
  ).toBe("unsaved");
  expect(screen.getByText("Result")).toBeTruthy();
  expect(screen.queryByRole("complementary", { name: "Graph" })).toBeNull();
});
it("preserves form submission and the application's close cancellation in the default dialog", () => {
  const save = vi.fn(),
    close = vi.fn();
  render(
    <Dialog.Root
      open
      onOpenChange={(_open, details) => {
        close();
        details.cancel();
      }}
    >
      <Dialog.Content showCloseButton={false}>
        <Dialog.Header>
          <Dialog.Title>Edit</Dialog.Title>
        </Dialog.Header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <div>
            <input aria-label="Name" />
          </div>
          <Dialog.Footer>
            <button type="submit">Save</button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog.Root>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  expect(save).toHaveBeenCalledOnce();
  expect(close).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Name" }), {
    key: "Escape",
  });
  expect(close).toHaveBeenCalledOnce();
  expect(screen.getByRole("dialog", { name: "Edit" })).toBeTruthy();
});
it("keeps the existing sheet close button alongside a disabled application action", () => {
  render(
    <Sheet.Root open>
      <Sheet.Content>
        <Sheet.Header action={<Button disabled>Custom close</Button>}>
          <Sheet.Title>Settings</Sheet.Title>
        </Sheet.Header>
        <div>Fields</div>
        <Sheet.Footer>Actions</Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>,
  );
  expect(screen.getAllByRole("button")).toHaveLength(2);
  expect(
    (screen.getByRole("button", { name: "Custom close" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  expect(screen.getByRole("dialog", { name: "Settings" })).toBeTruthy();
});
