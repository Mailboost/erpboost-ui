import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import { it, expect, vi } from "vitest";
import { ResultPanel } from "../packages/ui/src/components/result-panel";
import { Field } from "../packages/ui/src/components/field";
function Results() {
  const [value, setValue] = useState("data");
  return (
    <ResultPanel.Root
      tabs={[
        { value: "data", label: "Data" },
        { value: "logs", label: "Logs" },
        { value: "graph", label: "Graph", graph: true },
        { value: "locked", label: "Locked", disabled: true },
      ]}
      value={value}
      onValueChange={setValue}
      tabListLabel="Results"
    >
      <ResultPanel.Body>{value}</ResultPanel.Body>
    </ResultPanel.Root>
  );
}
it("maintains active-tab relationships and graph semantics across controlled result views", () => {
  render(<Results />);
  const panel = screen.getByRole("tabpanel");
  expect(panel.tabIndex).toBe(0);
  expect(panel.getAttribute("aria-labelledby")).toBe(
    screen.getByRole("tab", { name: "Data" }).id,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Graph" }));
  expect(panel.getAttribute("data-graph")).toBe("true");
  expect(panel.getAttribute("aria-labelledby")).toBe(
    screen.getByRole("tab", { name: "Graph" }).id,
  );
  fireEvent.click(screen.getByRole("tab", { name: "Logs" }));
  expect(panel.hasAttribute("data-graph")).toBe(false);
  expect(panel.textContent).toBe("logs");
});
it("does not select disabled result tabs", () => {
  render(<Results />);
  fireEvent.click(screen.getByRole("tab", { name: "Locked" }));
  expect(screen.getByRole("tabpanel").textContent).toBe("data");
});
it("keeps result selection label/description associations and exact input values", () => {
  render(
    <ResultPanel.Selection>
      <Field.Root>
        <Field.Label>Output</Field.Label>
        <Field.Control defaultValue="0001" />
        <Field.Description>Exact identifier</Field.Description>
      </Field.Root>
    </ResultPanel.Selection>,
  );
  const input = screen.getByRole("textbox", {
    name: "Output",
  }) as HTMLInputElement;
  expect(input.value).toBe("0001");
  expect(
    document.getElementById(input.getAttribute("aria-describedby")!)
      ?.textContent,
  ).toBe("Exact identifier");
});
it("renders caller error text as inert text and retains notice roles", () => {
  const { container } = render(
    <>
      <ResultPanel.Message>
        <ResultPanel.ErrorText>
          {"<img src=x>\nSecond line"}
        </ResultPanel.ErrorText>
      </ResultPanel.Message>
      <ResultPanel.Message variant="warning" role="note">
        Preview
      </ResultPanel.Message>
      <ResultPanel.Details>
        <ResultPanel.Item label="ID">9007199254740993</ResultPanel.Item>
      </ResultPanel.Details>
    </>,
  );
  expect(screen.getByRole("alert").textContent).toContain(
    "<img src=x>\nSecond line",
  );
  expect(container.querySelector("img")).toBeNull();
  expect(screen.getByRole("note").textContent).toContain("Preview");
  expect(container.querySelector("dd")?.textContent).toBe("9007199254740993");
});
