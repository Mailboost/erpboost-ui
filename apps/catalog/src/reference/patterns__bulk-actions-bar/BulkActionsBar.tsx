// Reference example: https://ui.tailor.tech/patterns/bulk-actions-bar
import { Button } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";

type Props = {
  selectedCount: number;
  /** `toolbar`: inline row inside DataTable.Toolbar; default: floating bar at bottom */
  variant?: "floating" | "toolbar";
  onApprove?: () => void;
  onReject?: () => void;
  onClear?: () => void;
};

export const BulkActionsBar = ({
  selectedCount,
  variant = "floating",
  onApprove,
  onReject,
  onClear,
}: Props) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4",
        variant === "floating" &&
          "sticky bottom-4 z-10 mx-auto max-w-3xl rounded-full border bg-card px-4 py-2 shadow-lg",
        variant === "toolbar" && "min-w-0 shrink gap-3",
      )}
    >
      <p className="text-sm text-muted-foreground">{selectedCount} selected</p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
        <Button variant="secondary" size="sm" onClick={onReject}>
          Reject
        </Button>
        <Button size="sm" onClick={onApprove}>
          Approve
        </Button>
      </div>
    </div>
  );
};
