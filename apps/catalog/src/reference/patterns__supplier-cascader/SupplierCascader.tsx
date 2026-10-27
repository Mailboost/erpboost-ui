// Reference example: https://ui.tailor.tech/patterns/supplier-cascader
import { Button } from "@mailboost/erpboost-ui";
import { Loader2, X } from "lucide-react";
import type { SyntheticEvent } from "react";
import { Checkbox } from "../shared/checkbox";
import { cn } from "@/lib/utils";
import { CompanyNameSearch } from "./CompanyNameSearch";
import type { useSupplierCascader } from "./useSupplierCascader";

type CascaderState = ReturnType<typeof useSupplierCascader>;

const stopRowSelection = (event: SyntheticEvent) => {
  event.stopPropagation();
};

interface SupplierCascaderProps {
  cascader: CascaderState;
  disabled?: boolean;
}

export const SupplierCascader = ({
  cascader,
  disabled,
}: SupplierCascaderProps) => {
  if (cascader.loading) {
    return (
      <div className="flex items-center justify-center rounded-md border p-8">
        <Loader2 className="text-muted-foreground size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex h-96 flex-col overflow-hidden rounded-md border">
        <div className="flex w-full items-center gap-2 border-b px-2 py-2">
          <CompanyNameSearch
            value={cascader.searchText}
            onChange={cascader.setSearchText}
            disabled={disabled}
          />
          <div className="flex-1" />
          <span className="text-muted-foreground shrink-0 text-xs">
            {cascader.totalSelectedCount} selected
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 shrink-0 text-xs"
            disabled={disabled === true || cascader.totalSelectedCount === 0}
            onClick={cascader.handleClearAll}
          >
            Clear all
          </Button>
        </div>

        <div className="flex min-h-0 flex-1">
          {!cascader.isSearchActive && (
            <div className="flex w-[35%] flex-col border-r">
              <div className="overflow-y-auto">
                <div className="text-muted-foreground px-3 pt-4 pb-2 text-sm font-medium">
                  Groups
                </div>
                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                    cascader.activeGroupId === "unaffiliated"
                      ? "bg-accent"
                      : "hover:bg-accent/50",
                  )}
                  onClick={() => cascader.setActiveGroupId("unaffiliated")}
                >
                  <Checkbox checked={false} disabled />
                  <span className="flex-1 truncate">Unaffiliated</span>
                </div>
                {cascader.groups.map((group) => {
                  const checkState = cascader.getGroupCheckState(group.id);
                  const isActive = cascader.activeGroupId === group.id;
                  return (
                    <div
                      key={group.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                        isActive ? "bg-accent" : "hover:bg-accent/50",
                      )}
                      onClick={() => cascader.setActiveGroupId(group.id)}
                    >
                      <div
                        className="flex self-center"
                        onPointerDownCapture={stopRowSelection}
                        onClick={stopRowSelection}
                      >
                        <Checkbox
                          checked={
                            checkState === "checked"
                              ? true
                              : checkState === "indeterminate"
                                ? "indeterminate"
                                : false
                          }
                          onCheckedChange={(checked) =>
                            cascader.handleGroupToggle(
                              group.id,
                              checked === true,
                            )
                          }
                          disabled={disabled || group.memberCount === 0}
                        />
                      </div>
                      <span className="flex-1 truncate">{group.name}</span>
                      <span className="text-muted-foreground text-sm">
                        {group.memberCount}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div
            className={cn(
              "flex flex-col",
              cascader.isSearchActive ? "w-full" : "w-[65%]",
            )}
          >
            <div className="overflow-y-auto">
              {!cascader.isSearchActive && cascader.activeGroupId === null ? (
                <div className="text-muted-foreground flex flex-1 items-center justify-center p-4 text-sm">
                  Select a group or search by company name
                </div>
              ) : cascader.fetching ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="text-muted-foreground size-5 animate-spin" />
                </div>
              ) : cascader.suppliers.length === 0 ? (
                <p className="text-muted-foreground p-3 text-center text-sm">
                  {cascader.isSearchActive
                    ? "No suppliers match your search"
                    : "No suppliers in this group"}
                </p>
              ) : (
                <>
                  {cascader.suppliers.map((supplier) => (
                    <label
                      key={supplier.id}
                      className="hover:bg-accent flex cursor-pointer items-center gap-2 px-3 py-2 text-sm"
                    >
                      <Checkbox
                        checked={cascader.selectedSupplierIds.has(supplier.id)}
                        onCheckedChange={(checked) =>
                          cascader.handleToggle(
                            supplier.id,
                            checked === true,
                            supplier.companyName,
                          )
                        }
                        disabled={disabled}
                      />
                      {supplier.companyName}
                    </label>
                  ))}
                  {cascader.fetchMoreError && (
                    <p className="text-destructive p-2 text-center text-xs">
                      Failed to load
                    </p>
                  )}
                  {cascader.hasNextPage && (
                    <div className="flex justify-center border-t p-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        disabled={cascader.fetchingMore || disabled}
                        onClick={cascader.fetchNextPage}
                      >
                        {cascader.fetchingMore ? (
                          <Loader2 className="mr-1 size-3 animate-spin" />
                        ) : null}
                        Load more
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {cascader.totalSelectedCount > 0 && (
        <div className="rounded-md border">
          <div className="border-b bg-muted/50 px-3 py-2">
            <div className="text-sm font-medium">
              Selected suppliers ({cascader.totalSelectedCount})
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto p-2">
            <div className="flex flex-wrap gap-2">
              {cascader.selectedSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm"
                >
                  <span className="max-w-48 truncate">
                    {supplier.companyName}
                  </span>
                  <button
                    type="button"
                    className="hover:bg-secondary-foreground/10 rounded p-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => cascader.handleRemoveSupplier(supplier.id)}
                    disabled={disabled}
                    aria-label={`Deselect ${supplier.companyName}`}
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
