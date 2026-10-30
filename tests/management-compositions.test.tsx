import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { TemplatePicker } from "../packages/ui/src/components/template-picker";
import {
  SettingsRow,
  SettingsList,
  IdentityCell,
  ResponsiveLabel,
} from "../packages/ui/src/components/management-layout";
import { Field } from "../packages/ui/src/components/field";
const choices = [
  { id: "one", title: "First" },
  { id: "two", title: "Disabled", disabled: true },
];
const confirmation = {
  title: "Review",
  message: () => <p>Replace existing content?</p>,
  backLabel: "Back",
  confirmLabel: "Apply",
};
it("requires confirmation and returns focus to the selected option on Back", async () => {
  const choose = vi.fn();
  render(
    <TemplatePicker
      title="Choose"
      closeLabel="Close picker"
      options={choices}
      confirmation={confirmation}
      onChoose={choose}
      onClose={() => {}}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "First" }));
  expect(choose).not.toHaveBeenCalled();
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Apply" }),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "First" }),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "First" }));
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(choose).toHaveBeenCalledExactlyOnceWith("one");
});
it("delegates exact IDs directly and refuses disabled options", () => {
  const choose = vi.fn();
  render(
    <TemplatePicker
      title="Choose"
      closeLabel="Close picker"
      options={choices}
      onChoose={choose}
      onClose={() => {}}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Disabled" }),
  );
  expect(choose).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "First" }));
  expect(choose).toHaveBeenCalledExactlyOnceWith("one");
});
it("drops a removed selection and blocks a selection disabled during review", () => {
  const choose = vi.fn(),
    close = vi.fn();
  const props = {
    title: "Choose",
    closeLabel: "Close picker",
    confirmation,
    onChoose: choose,
    onClose: close,
  };
  const view = render(<TemplatePicker {...props} options={choices} />);
  fireEvent.click(screen.getByRole("button", { name: "First" }));
  view.rerender(
    <TemplatePicker {...props} options={[{ ...choices[0], disabled: true }]} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(choose).not.toHaveBeenCalled();
  view.rerender(
    <TemplatePicker {...props} options={[]} empty={<p>No options</p>} />,
  );
  expect(
    screen.queryByRole("button", { name: "Apply" }),
  ).toBeNull();
  expect(screen.getByText("No options")).toBeTruthy();
});
it("keeps confirmation and closing disabled while consumer work is pending", () => {
  const choose = vi.fn(),
    close = vi.fn();
  const props = {
    title: "Choose",
    closeLabel: "Close picker",
    options: choices,
    confirmation,
    onChoose: choose,
    onClose: close,
  };
  const view = render(<TemplatePicker {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "First" }));
  view.rerender(<TemplatePicker {...props} busy />);
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(choose).not.toHaveBeenCalled();
  expect(close).not.toHaveBeenCalled();
});
it("retains Field label associations and the full accessible action name", () => {
  render(
    <>
      <SettingsList>
        <Field.Root>
          <SettingsRow
            label={
              <Field.Label>
                <IdentityCell title="Jordan" description="j@example.invalid" />
              </Field.Label>
            }
            control={<Field.Control defaultValue="Viewer" />}
          />
        </Field.Root>
      </SettingsList>
      <button>
        <ResponsiveLabel full="Add resource" compact="Add" />
      </button>
    </>,
  );
  expect((screen.getByRole("textbox", { name: /Jordan/ }) as HTMLInputElement).value).toBe("Viewer");
  expect(
    screen.getByRole("button", { name: "Add resource" }),
  ).toBeTruthy();
});
