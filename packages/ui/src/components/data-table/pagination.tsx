import { cn } from "@/lib/utils";
import { Pagination } from "@/components/pagination";
import { useDataTableContext } from "./data-table-context";
import { useDataTableT } from "./i18n";
import { isSelectionBarOpen } from "./selection-bar";

export interface DataTablePaginationProps {
  /**
   * Available page-size options shown in a dropdown selector.
   * When provided, a page-size switcher is rendered.
   */
  pageSizeOptions?: number[];
}

/** Use `DataTable.Pagination` instead of calling this directly. */
export function DataTablePagination({
  pageSizeOptions,
}: DataTablePaginationProps = {}) {
  const ctx = useDataTableContext();
  const {
    pageInfo,
    total,
    totalPages,
    currentPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    hasPrevPage,
    hasNextPage,
    pageSize,
    setPageSize,
    selectedIds,
    toggleRowSelection,
  } = ctx;
  const t = useDataTableT();

  const selectionEnabled = toggleRowSelection !== undefined;
  const selectedCount = selectedIds.length;
  // While the footer shows the bulk-action bar, the bar owns the count.
  const barOpen = isSelectionBarOpen(ctx);

  const rowInfoText = (() => {
    if (barOpen) return null;
    if (selectionEnabled && selectedCount > 0 && total !== null) {
      return t("paginationSelectedOfTotal", { selected: selectedCount, total });
    }
    if (selectionEnabled && selectedCount > 0) {
      return t("paginationSelectedRows", { selected: selectedCount });
    }
    if (total !== null) {
      return t("paginationTotalRows", { total });
    }
    return null;
  })();

  return (
    // Beside the bar, flex-1 instead of w-full lets both share one line and
    // wraps the controls onto a line of their own only when they don't fit.
    <div
      className={cn(
        "astw:flex astw:items-center astw:justify-between astw:gap-2",
        barOpen ? "astw:flex-1" : "astw:w-full",
      )}
    >
      {rowInfoText && (
        <div className="astw:text-body-md astw:text-muted-foreground">
          {rowInfoText}
        </div>
      )}
      <Pagination
        className="astw:ml-auto"
        currentPage={currentPage}
        totalPages={totalPages}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        onFirstPage={goToFirstPage}
        onPreviousPage={() => goToPrevPage(pageInfo)}
        onNextPage={() => goToNextPage(pageInfo)}
        onLastPage={goToLastPage}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
DataTablePagination.displayName = "DataTable.Pagination";
