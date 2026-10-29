import { act, fireEvent, render, screen } from "@testing-library/react";
import { cloneElement, useId, useState, type ReactElement } from "react";
import { expect, it, vi } from "vitest";
import {
  ResourceActionPicker,
  type ResourceActionPickerProps,
} from "../packages/ui/src/components/resource-action-picker";
// Isolate asynchronous teardown from Base UI's layout, which jsdom cannot render.
vi.mock("../packages/ui/src/components/resource-picker", () => ({
  ResourcePicker: (props: ResourceActionPickerProps) => {
    const [open, setOpen] = useState(true);
    const id = useId();
    return (
      <>
        {cloneElement(props.trigger as ReactElement<Record<string, unknown>>, {
          "aria-controls": id,
          "aria-expanded": open,
          onClick: () => setOpen(true),
        })}
        <div className="erpui-resource-picker">
          <div id={id} />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              props.action?.onSelect();
            }}
          >
            Create
          </button>
        </div>
      </>
    );
  },
}));
function setup() {
  const frames: FrameRequestCallback[] = [];
  vi.spyOn(globalThis, "requestAnimationFrame").mockImplementation(
    (callback) => {
      frames.push(callback);
      return frames.length;
    },
  );
  const action = vi.fn();
  const props: ResourceActionPickerProps = {
    options: [],
    value: "0001",
    selectedLabel: "Resource",
    trigger: <button>Open</button>,
    triggerLabel: "Open",
    searchLabel: "Find",
    children: "Resource",
    onSelect: vi.fn(),
    action: { label: "Create", onSelect: action },
  };
  const view = render(<ResourceActionPicker {...props} />);
  const popup = document.querySelector(".erpui-resource-picker")!;
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  Object.defineProperty(popup, "getAnimations", {
    value: () => [
      { effect: { getComputedTiming: () => ({ iterations: 1 }) }, finished },
      {
        effect: { getComputedTiming: () => ({ iterations: Infinity }) },
        finished: new Promise(() => {}),
      },
    ],
  });
  const frame = async () => {
    const callback = frames.shift();
    expect(callback).toBeTruthy();
    await act(async () => {
      callback!(0);
    });
  };
  return { action, props, view, finish, frame, frames };
}
it("waits for only finite closing animations and coalesces repeated creation into one callback", async () => {
  const state = setup();
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  await state.frame();
  expect(state.action).not.toHaveBeenCalled();
  await act(async () => state.finish());
  await state.frame();
  expect(state.action).toHaveBeenCalledOnce();
});
it("cancels deferred creation when its owner unmounts", async () => {
  const state = setup();
  fireEvent.click(screen.getByRole("button", { name: "Create" }));
  await state.frame();
  state.view.unmount();
  await act(async () => state.finish());
  if (state.frames.length) await state.frame();
  expect(state.action).not.toHaveBeenCalled();
});
for (const change of [
  "disabled",
  "action-disabled",
  "selection",
  "reopened",
] as const)
  it(`cancels a stale action when ${change}`, async () => {
    const state = setup();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));
    await state.frame();
    if (change === "reopened")
      fireEvent.click(screen.getByRole("button", { name: "Open" }));
    else
      state.view.rerender(
        <ResourceActionPicker
          {...state.props}
          disabled={change === "disabled"}
          value={change === "selection" ? "0002" : "0001"}
          action={{
            ...state.props.action!,
            disabled: change === "action-disabled",
          }}
        />,
      );
    await act(async () => state.finish());
    await state.frame();
    expect(state.action).not.toHaveBeenCalled();
  });

it("preserves the caller's trigger ref and clears it on teardown", () => {
  const original = { current: null as HTMLButtonElement | null };
  const view = render(
    <ResourceActionPicker
      options={[]}
      value={null}
      selectedLabel="Resource"
      trigger={<button ref={original}>Ref trigger</button>}
      triggerLabel="Open"
      searchLabel="Find"
      onSelect={() => {}}
    >
      Resource
    </ResourceActionPicker>,
  );
  expect(original.current).toBe(
    screen.getByRole("button", { name: "Ref trigger" }),
  );
  view.unmount();
  expect(original.current).toBeNull();
});
