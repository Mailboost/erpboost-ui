import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SourceNavigation } from "../packages/ui/src/components/source-navigation";
const files = [{ name: "0001.py" }, { name: "helper.py", removable: true }];
it("delegates exact file selection without mutating the supplied list", () => {
  const select = vi.fn();
  render(
    <SourceNavigation.Files
      files={files}
      value="0001.py"
      onValueChange={select}
      title="Files"
    />,
  );
  expect(
    screen
      .getByRole("button", { name: "0001.py" })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "helper.py" }));
  expect(select).toHaveBeenCalledWith("helper.py");
  expect(files).toHaveLength(2);
});
it("only renders caller-enabled removal and keeps it separate from selection and parent submit", () => {
  const select = vi.fn(),
    remove = vi.fn(),
    submit = vi.fn();
  render(
    <form onSubmit={submit}>
      <SourceNavigation.Files
        files={files}
        value="0001.py"
        onValueChange={select}
        title="Files"
        removeAction={{ label: (name) => `Remove ${name}`, onSelect: remove }}
      />
    </form>,
  );
  expect(screen.queryByRole("button", { name: "Remove 0001.py" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Remove helper.py" }));
  expect(remove).toHaveBeenCalledWith("helper.py");
  expect(select).not.toHaveBeenCalled();
  expect(submit).not.toHaveBeenCalled();
});
it("honors disabled add/remove actions while file selection stays available", () => {
  const add = vi.fn(),
    remove = vi.fn(),
    select = vi.fn();
  const props = {
    files,
    value: "0001.py",
    onValueChange: select,
    title: "Files",
    addAction: { label: "Add", onSelect: add, disabled: true },
    removeAction: {
      label: (name: string) => `Remove ${name}`,
      onSelect: remove,
      disabled: true,
    },
  };
  const view = render(<SourceNavigation.Files {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove helper.py" }));
  expect(add).not.toHaveBeenCalled();
  expect(remove).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "helper.py" }));
  expect(select).toHaveBeenCalledWith("helper.py");
  view.rerender(
    <SourceNavigation.Files
      {...props}
      addAction={{ ...props.addAction, disabled: false }}
      removeAction={{ ...props.removeAction, disabled: false }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Add" }));
  fireEvent.click(screen.getByRole("button", { name: "Remove helper.py" }));
  expect(add).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledOnce();
});
it("delegates tabs and renders caller selection without reading or changing code", () => {
  const select = vi.fn();
  const view = render(
    <SourceNavigation.Tabs
      files={files}
      value="0001.py"
      onValueChange={select}
      label="Open files"
      meta="Runtime"
    />,
  );
  fireEvent.click(screen.getByRole("tab", { name: "helper.py" }));
  expect(select).toHaveBeenCalledWith("helper.py");
  view.rerender(
    <SourceNavigation.Tabs
      files={files}
      value="helper.py"
      onValueChange={select}
      label="Open files"
      meta="Runtime"
    />,
  );
  expect(
    screen
      .getByRole("tab", { name: "helper.py" })
      .getAttribute("aria-selected"),
  ).toBe("true");
  expect(screen.getByText("Runtime")).toBeTruthy();
});
it("keeps supplied child fields when the selected file changes and treats names as text", () => {
  const children = <input aria-label="New name" defaultValue="0001" />;
  const options = [{ name: "<img>.py" }, { name: "日本語.py" }];
  const props = {
    files: options,
    value: "<img>.py",
    onValueChange: () => {},
    title: "Files",
  };
  const view = render(
    <SourceNavigation.Files {...props}>{children}</SourceNavigation.Files>,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "New name" }), {
    target: { value: "9007199254740993" },
  });
  view.rerender(
    <SourceNavigation.Files {...props} value="日本語.py">
      {children}
    </SourceNavigation.Files>,
  );
  expect(
    (screen.getByRole("textbox", { name: "New name" }) as HTMLInputElement)
      .value,
  ).toBe("9007199254740993");
  expect(view.container.querySelector("img")).toBeNull();
  expect(screen.getByRole("button", { name: "<img>.py" })).toBeTruthy();
});
