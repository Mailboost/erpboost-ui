import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ApprovalRouteBuilder } from "../apps/catalog/src/reference/patterns__approval-route-builder/ApprovalRouteBuilder";
import { FormBuilder } from "../apps/catalog/src/reference/patterns__form-builder/FormBuilder";
import { GanttEditor } from "../apps/catalog/src/reference/patterns__timeline/GanttEditor";
import { PipelineStageManager } from "../apps/catalog/src/reference/patterns__pipeline-stage-manager/PipelineStageManager";
import { PipelineKanbanBoardView } from "../apps/catalog/src/reference/page__pipeline-kanban/KanbanBoard";

function transfer(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    get types() {
      return [...data.keys()];
    },
    effectAllowed: "uninitialized",
    dropEffect: "none",
    setData: (type: string, value: string) => data.set(type, value),
    getData: (type: string) => data.get(type) ?? "",
  } as unknown as DataTransfer;
}

function drop(source: Element, target: Element, after = true) {
  const dataTransfer = transfer();
  // Fix only this row's synthetic geometry so top/bottom drop zones differ.
  vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 100, 400, 100),
  );
  fireEvent.dragStart(source, { dataTransfer });
  fireEvent.dragOver(target, { dataTransfer, clientY: after ? 190 : 110 });
  fireEvent.drop(target, { dataTransfer, clientY: after ? 190 : 110 });
  fireEvent.dragEnd(source, { dataTransfer });
}

const approvalNames = () =>
  screen.getAllByLabelText<HTMLInputElement>("Stage name").map((e) => e.value);

it("moves approval stages in both directions without losing approvers", () => {
  render(<ApprovalRouteBuilder />);
  const handles = screen.getAllByLabelText("Drag to reorder");
  drop(handles[0], handles[2].parentElement!);
  expect(approvalNames()).toEqual([
    "Finance check",
    "Director sign-off",
    "Team lead review",
  ]);
  const reordered = screen.getAllByLabelText("Drag to reorder");
  drop(reordered[2], reordered[0].parentElement!, false);
  expect(approvalNames()).toEqual([
    "Team lead review",
    "Finance check",
    "Director sign-off",
  ]);
  expect(screen.getByText("Requester's manager")).toBeTruthy();
});

it("cancels an approval drag and ignores a drop without a source", () => {
  render(<ApprovalRouteBuilder />);
  const handles = screen.getAllByLabelText("Drag to reorder");
  fireEvent.dragStart(handles[0]);
  fireEvent.dragEnd(handles[0]);
  fireEvent.drop(handles[2].parentElement!, { clientY: 1 });
  expect(approvalNames()).toEqual([
    "Team lead review",
    "Finance check",
    "Director sign-off",
  ]);
});

it("reorders form fields and preserves their schema", () => {
  const { container } = render(<FormBuilder />);
  const handles = screen.getAllByLabelText("Drag to reorder");
  const labels = () =>
    [
      ...container.querySelectorAll<HTMLInputElement>(
        'input[aria-label="Label"]',
      ),
    ].map((e) => e.value);
  const initial = labels();
  expect(initial.length).toBe(5);
  fireEvent.click(
    screen.getByRole("button", { name: "Generated schema (JSON)" }),
  );
  const schema = JSON.parse(container.querySelector("pre")!.textContent!);
  drop(handles[0], handles[4].parentElement!);
  expect(labels()).toEqual([...initial.slice(1), initial[0]]);
  const changed = JSON.parse(container.querySelector("pre")!.textContent!);
  expect(changed.form).toEqual(schema.form);
  expect(changed.fields).toEqual([...schema.fields.slice(1), schema.fields[0]]);
});

it("reorders pipeline stages and leaves an editing row non-draggable", () => {
  const { container } = render(<PipelineStageManager />);
  let rows = [...container.querySelectorAll('[draggable="true"]')];
  drop(rows[0], rows[2]);
  expect(
    [...container.querySelectorAll('[draggable="true"]')].map(
      (e) => e.textContent,
    ),
  ).toEqual([
    "QualifiedActive",
    "ProposalActive",
    "LeadActive",
    "NegotiationActive",
    "WonWon",
    "LostLost",
  ]);
  fireEvent.click(screen.getByRole("button", { name: "Proposal" }));
  expect(
    screen
      .getByDisplayValue("Proposal")
      .closest("[draggable]")!
      .getAttribute("draggable"),
  ).toBe("false");
});

function kanban() {
  const onMove = vi.fn(),
    onReorder = vi.fn();
  const result = render(
    <PipelineKanbanBoardView
      stages={[
        {
          id: "lead",
          name: "Lead",
          category: "OPEN",
          items: [{ id: "a" }, { id: "b" }, { id: "c" }],
        },
        { id: "won", name: "Won", category: "DONE", items: [{ id: "d" }] },
        { id: "empty", name: "Empty", category: "ACTIVE", items: [] },
      ]}
      unavailableTitle="Unavailable"
      unavailableMessage="No stages"
      getItemId={(item) => item.id}
      getStageLabel={(stage) => stage.name}
      renderCard={(item) => <span>{item.id}</span>}
      onMoveItem={onMove}
      onReorderItem={onReorder}
      expandStageLabel={(name) => `Expand ${name}`}
      hideStageLabel={(name) => `Hide ${name}`}
    />,
  );
  return { ...result, onMove, onReorder };
}

it("reorders a Kanban card with one position callback", () => {
  const { onMove, onReorder } = kanban();
  const column = screen.getByRole("region", { name: "Lead3" });
  const cards = within(column)
    .getAllByRole("button")
    .filter((e) => e.draggable);
  drop(cards[0], cards[2].closest("li")!);
  expect(onReorder).toHaveBeenCalledExactlyOnceWith({
    itemId: "a",
    currentStageId: "lead",
    position: 3,
  });
  expect(
    within(column)
      .getAllByRole("button")
      .filter((e) => e.draggable)
      .map((e) => e.textContent),
  ).toEqual(["b", "c", "a"]);
  expect(onMove).not.toHaveBeenCalled();
});

it("moves a Kanban card onto a card and an empty column without bubbling twice", () => {
  const { onMove } = kanban();
  drop(
    screen.getByRole("button", { name: "a" }),
    screen.getByRole("button", { name: "d" }).closest("li")!,
  );
  expect(onMove).toHaveBeenCalledExactlyOnceWith({
    itemId: "a",
    currentStageId: "lead",
    targetStageId: "won",
    position: 2,
  });
  onMove.mockClear();
  drop(
    screen.getByRole("button", { name: "b" }),
    screen.getByRole("region", { name: "Empty0" }),
  );
  expect(onMove).toHaveBeenCalledExactlyOnceWith({
    itemId: "b",
    currentStageId: "lead",
    targetStageId: "empty",
  });
});

it("ignores a foreign or malformed Kanban drop without a runtime error", () => {
  const { onMove, onReorder } = kanban();
  const errors: unknown[] = [];
  const capture = (event: ErrorEvent) => {
    errors.push(event.error);
    event.preventDefault();
  };
  window.addEventListener("error", capture);
  try {
    for (const target of [
      screen.getByRole("region", { name: "Empty0" }),
      screen.getByRole("button", { name: "d" }).closest("li")!,
    ]) {
      fireEvent.drop(target, {
        dataTransfer: transfer({ "text/plain": "external text" }),
      });
      for (const payload of [
        "{bad json",
        "null",
        "{}",
        '{"id":42}',
        '{"id":""}',
      ]) {
        fireEvent.drop(target, {
          dataTransfer: transfer({ "kanban-board-card": payload }),
        });
      }
    }
    expect(onMove).not.toHaveBeenCalled();
    expect(onReorder).not.toHaveBeenCalled();
    expect(errors).toEqual([]);
  } finally {
    window.removeEventListener("error", capture);
  }
});

it("announces a cancelled Kanban drag and keeps a successful drop announcement", () => {
  const { onMove, onReorder } = kanban();
  const first = screen.getByRole("button", { name: "a" });
  fireEvent.dragStart(first, { dataTransfer: transfer() });
  expect(screen.getByRole("status").textContent).toBe(
    "Picked up draggable item a.",
  );
  fireEvent.dragEnd(first, { dataTransfer: transfer() });
  expect(screen.getByRole("status").textContent).toBe(
    "Dragging was cancelled. Draggable item a was dropped.",
  );
  expect(onMove).not.toHaveBeenCalled();
  expect(onReorder).not.toHaveBeenCalled();
  drop(first, screen.getByRole("region", { name: "Empty0" }));
  expect(screen.getByRole("status").textContent).toBe(
    "Draggable item a was dropped over droppable area empty",
  );
});

it("moves a timeline bar between lanes without changing its time range", () => {
  const { container } = render(<GanttEditor />);
  const bar = screen.getByRole("button", { name: "Phase 1" });
  const interval = bar.closest<HTMLElement>('[data-slot="timeline-interval"]')!;
  const initialRange = {
    left: interval.style.left,
    width: interval.style.width,
  };
  const rows = [...container.querySelectorAll('[data-slot="timeline-row"]')];
  drop(bar, rows[1].firstElementChild!);
  expect(
    within(rows[1] as HTMLElement).getByRole("button", { name: "Phase 1" }),
  ).toBeTruthy();
  const moved = screen
    .getByRole("button", { name: "Phase 1" })
    .closest<HTMLElement>('[data-slot="timeline-interval"]')!;
  expect({ left: moved.style.left, width: moved.style.width }).toEqual(
    initialRange,
  );
  const dataTransfer = transfer({ "text/plain": "unknown-bar" });
  fireEvent.drop(rows[2].firstElementChild!, { dataTransfer });
  expect(
    within(rows[1] as HTMLElement).getByRole("button", { name: "Phase 1" }),
  ).toBeTruthy();
});
