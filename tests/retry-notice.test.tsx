import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { RetryNotice } from "../packages/ui/src/components/retry-notice";
it("does not retry automatically and delegates clicks without submitting a parent form", () => {
  const retry = vi.fn(),
    submit = vi.fn();
  render(
    <form onSubmit={submit}>
      <RetryNotice retryLabel="Retry" onRetry={retry}>
        Failure
      </RetryNotice>
    </form>,
  );
  expect(retry).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(retry).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: "Retry" }).getAttribute("type"),
  ).toBe("button");
});
it("honors caller pending and disabled states, then releases retry after failure", () => {
  const retry = vi.fn();
  const view = render(
    <RetryNotice retryLabel="Retry" onRetry={retry} retrying>
      First failure
    </RetryNotice>,
  );
  expect(screen.getByRole("alert").getAttribute("aria-busy")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(retry).not.toHaveBeenCalled();
  view.rerender(
    <RetryNotice retryLabel="Retry" onRetry={retry} retryDisabled>
      First failure
    </RetryNotice>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(retry).not.toHaveBeenCalled();
  view.rerender(
    <RetryNotice retryLabel="Retry" onRetry={retry}>
      Second failure
    </RetryNotice>,
  );
  expect(screen.getByRole("alert").hasAttribute("aria-busy")).toBe(false);
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(retry).toHaveBeenCalledOnce();
});
it("renders error content as text and keeps the message keyboard focusable", () => {
  const { container } = render(
    <RetryNotice retryLabel="Retry" onRetry={() => {}}>
      {"<img src=x>\n0001"}
    </RetryNotice>,
  );
  expect(container.querySelector("img")).toBeNull();
  const message = container.querySelector('[data-slot="alert-description"]')!;
  expect(message.textContent).toBe("<img src=x>\n0001");
  expect(message.getAttribute("tabindex")).toBe("0");
});
it("keeps caller-owned field values when error state changes", () => {
  const child = <input aria-label="Draft" defaultValue="0001" />;
  const view = render(
    <div>
      {child}
      <RetryNotice retryLabel="Retry" onRetry={() => {}}>
        Failure
      </RetryNotice>
    </div>,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Draft" }), {
    target: { value: "9007199254740993" },
  });
  view.rerender(
    <div>
      {child}
      <RetryNotice retryLabel="Retry" onRetry={() => {}} retrying>
        Failure
      </RetryNotice>
    </div>,
  );
  view.rerender(
    <div>
      {child}
      <p>Loaded</p>
    </div>,
  );
  expect(
    (screen.getByRole("textbox", { name: "Draft" }) as HTMLInputElement).value,
  ).toBe("9007199254740993");
});
