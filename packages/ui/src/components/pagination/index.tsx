import type { ComponentProps } from "react";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { Select } from "../select";
import { useDataTableT } from "../data-table/i18n";
import { cn } from "@/lib/utils";

/** Pagination controls shared with DataTable; the consumer owns fetching. */
export interface PaginationProps {
  currentPage: number;
  totalPages: number | null;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onFirstPage: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onLastPage: () => void;
  /** Enables direct page entry for offset-based collections. */
  onPageChange?: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  disabled?: boolean;
  container?: ComponentProps<typeof Select.Parts.Content>["container"];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onFirstPage,
  onPreviousPage,
  onNextPage,
  onLastPage,
  onPageChange,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  disabled = false,
  container,
  className,
}: PaginationProps) {
  const t = useDataTableT();
  return (
    <div
      data-slot="pagination"
      className={cn(
        "astw:flex astw:items-center astw:justify-end astw:gap-2",
        className,
      )}
    >
      {pageSizeOptions && pageSizeOptions.length > 0 && onPageSizeChange && (
        <div className="astw:flex astw:items-center astw:gap-1.5">
          <span className="astw:text-body-md astw:text-muted-foreground astw:whitespace-nowrap">
            {t("paginationRowsPerPage")}
          </span>
          <Select.Parts.Root
            value={String(pageSize)}
            disabled={disabled}
            onValueChange={(value) => {
              if (value) onPageSizeChange(Number(value));
            }}
          >
            <Select.Parts.Trigger
              aria-label={t("paginationRowsPerPage")}
              className="astw:w-17.5"
            >
              <Select.Parts.Value />
            </Select.Parts.Trigger>
            <Select.Parts.Content container={container}>
              {pageSizeOptions.map((size) => (
                <Select.Parts.Item key={size} value={String(size)}>
                  {size}
                </Select.Parts.Item>
              ))}
            </Select.Parts.Content>
          </Select.Parts.Root>
        </div>
      )}
      {totalPages !== null && (
        <span className="astw:flex astw:items-center astw:gap-1 astw:text-body-md astw:text-muted-foreground astw:tabular-nums astw:whitespace-nowrap">
          {t("paginationPage")}{" "}
          {onPageChange ? (
            <Input
              aria-label={t("paginationPage")}
              className="astw:w-14"
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              disabled={disabled}
              onChange={(event) =>
                onPageChange(
                  Math.max(
                    1,
                    Math.min(totalPages, Number(event.target.value) || 1),
                  ),
                )
              }
            />
          ) : (
            currentPage
          )}{" "}
          / {totalPages}
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onFirstPage}
        disabled={disabled || !hasPrevPage}
        aria-label={t("paginationFirst")}
      >
        <ChevronsLeft className="astw:size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onPreviousPage}
        disabled={disabled || !hasPrevPage}
        aria-label={t("paginationPrevious")}
      >
        <ChevronLeft className="astw:size-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onNextPage}
        disabled={
          disabled ||
          !hasNextPage ||
          (totalPages !== null && currentPage >= totalPages)
        }
        aria-label={t("paginationNext")}
      >
        <ChevronRight className="astw:size-4" />
      </Button>
      {totalPages !== null && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onLastPage}
          disabled={disabled || !hasNextPage}
          aria-label={t("paginationLast")}
        >
          <ChevronsRight className="astw:size-4" />
        </Button>
      )}
    </div>
  );
}
