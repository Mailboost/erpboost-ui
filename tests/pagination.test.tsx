import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/locale-provider";
import { Pagination } from "@/components/pagination";

it("clamps direct page entry and disables navigation at collection boundaries", () => {
  const page = vi.fn(),
    next = vi.fn();
  const props = {
    currentPage: 1,
    totalPages: 4,
    hasPrevPage: false,
    hasNextPage: true,
    onFirstPage: vi.fn(),
    onPreviousPage: vi.fn(),
    onNextPage: next,
    onLastPage: vi.fn(),
    onPageChange: page,
  };
  const { rerender } = render(
    <LocaleProvider locale="ja-JP">
      <Pagination {...props} />
    </LocaleProvider>,
  );
  expect(
    (screen.getByRole("button", { name: "前のページ" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.change(screen.getByRole("spinbutton", { name: "ページ" }), {
    target: { value: "99" },
  });
  expect(page).toHaveBeenLastCalledWith(4);
  fireEvent.change(screen.getByRole("spinbutton", { name: "ページ" }), {
    target: { value: "0" },
  });
  expect(page).toHaveBeenLastCalledWith(1);
  fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
  expect(next).toHaveBeenCalledOnce();
  rerender(
    <LocaleProvider locale="ja-JP">
      <Pagination {...props} disabled />
    </LocaleProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
  expect(next).toHaveBeenCalledOnce();
});

it("shows the current page without a total and does not offer an unknown last page", () => {
  const next = vi.fn();
  render(
    <LocaleProvider locale="ja-JP">
      <Pagination
        currentPage={3}
        totalPages={null}
        hasPrevPage
        hasNextPage
        onFirstPage={() => {}}
        onPreviousPage={() => {}}
        onNextPage={next}
      />
    </LocaleProvider>,
  );
  expect(screen.getByText(/ページ\s+3/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "最後のページ" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "次のページ" }));
  expect(next).toHaveBeenCalledOnce();
});
