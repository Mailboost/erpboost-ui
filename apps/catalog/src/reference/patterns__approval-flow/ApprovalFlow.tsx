// Reference example: https://ui.tailor.tech/patterns/approval-flow
import { useState } from "react";
import { Alert, Badge, Button, Card } from "@mailboost/erpboost-ui";
import { Check, RotateCcw } from "lucide-react";

type StepStatus = "APPROVED" | "PENDING" | "WAITING" | "RETURNED";

type ApprovalStep = {
  id: string;
  order: number;
  department: string;
  approver: string;
  status: StepStatus;
  comment?: string;
  decidedAt?: string;
};

const ui = {
  title: "Approval flow",
  waiting: "Waiting",
  pending: "Pending",
  approved: "Approved",
  returned: "Returned",
  commentPlaceholder: "Add a comment (optional)",
  approve: "Approve",
  return: "Return",
  reset: "Reset demo",
  completeTitle: "All steps approved",
  completeBody: "The request has cleared every approval stage.",
  returnedTitle: "Returned to applicant",
  returnedBody: "The request was sent back for revision.",
} as const;

const statusVariant: Record<
  StepStatus,
  "subtle-success" | "subtle-info" | "neutral" | "subtle-warning"
> = {
  APPROVED: "subtle-success",
  PENDING: "subtle-info",
  WAITING: "neutral",
  RETURNED: "subtle-warning",
};

const statusLabel: Record<StepStatus, string> = {
  APPROVED: ui.approved,
  PENDING: ui.pending,
  WAITING: ui.waiting,
  RETURNED: ui.returned,
};

// Square step index, styled like the multi-step form stepper. Settled and
// active stages read as filled; stages still waiting stay muted.
const stepIndexClass: Record<StepStatus, string> = {
  APPROVED: "bg-primary text-primary-foreground",
  PENDING: "bg-primary text-primary-foreground",
  WAITING: "bg-muted text-muted-foreground",
  RETURNED: "bg-muted text-muted-foreground",
};

// A stage node reads as "primary" (filled) once it is settled or active; the
// connector between two such nodes inherits the primary tone to trace progress.
const isPrimaryNode = (status: StepStatus) =>
  status === "APPROVED" || status === "PENDING";

// A fixed timestamp keeps the demo deterministic across renders.
const decidedStamp = "Jul 15, 2026 10:24";

const initialSteps: ApprovalStep[] = [
  {
    id: "step-1",
    order: 1,
    department: "Procurement",
    approver: "Aiko Sato",
    status: "APPROVED",
    comment: "Pricing checked against the framework agreement.",
    decidedAt: "Jul 14, 2026 16:02",
  },
  {
    id: "step-2",
    order: 2,
    department: "Engineering",
    approver: "Taro Tanaka",
    status: "PENDING",
  },
  {
    id: "step-3",
    order: 3,
    department: "Quality Assurance",
    approver: "Mei Kobayashi",
    status: "WAITING",
  },
  {
    id: "step-4",
    order: 4,
    department: "Technical (Final)",
    approver: "Ken Yamada",
    status: "WAITING",
  },
];

/**
 * Sequential multi-approval chain rendered as a titled card. Earlier stages are
 * settled, exactly one stage is Pending, and later stages wait their turn.
 * Approving the pending stage advances the chain to the next department;
 * returning sends the whole request back to the applicant. Drop it into a detail
 * sheet or side column wherever a record routes through a fixed approval order.
 */
export const ApprovalFlow = () => {
  const [steps, setSteps] = useState<ApprovalStep[]>(initialSteps);
  const [comment, setComment] = useState("");

  const pendingIndex = steps.findIndex((s) => s.status === "PENDING");
  const isComplete = pendingIndex === -1 && steps.every((s) => s.status === "APPROVED");
  const isReturned = steps.some((s) => s.status === "RETURNED");

  const approve = () => {
    if (pendingIndex === -1) return;
    setSteps((prev) =>
      prev.map((step, index) => {
        if (index === pendingIndex) {
          return {
            ...step,
            status: "APPROVED",
            comment: comment.trim() || step.comment,
            decidedAt: decidedStamp,
          };
        }
        // Promote the next waiting stage to pending.
        if (index === pendingIndex + 1) {
          return { ...step, status: "PENDING" };
        }
        return step;
      }),
    );
    setComment("");
  };

  const returnRequest = () => {
    if (pendingIndex === -1) return;
    setSteps((prev) =>
      prev.map((step, index) =>
        index === pendingIndex
          ? {
              ...step,
              status: "RETURNED",
              comment: comment.trim() || step.comment,
              decidedAt: decidedStamp,
            }
          : step,
      ),
    );
    setComment("");
  };

  const reset = () => {
    setSteps(initialSteps);
    setComment("");
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card.Root>
        <Card.Header>
          <div className="flex w-full items-center justify-between">
            <h3 className="text-card-foreground text-lg font-semibold leading-none">
              {ui.title}
            </h3>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="size-4" aria-hidden />
              {ui.reset}
            </Button>
          </div>
        </Card.Header>
        <Card.Content className="space-y-3">
          {isReturned ? (
            <Alert.Root variant="warning">
              <Alert.Title>{ui.returnedTitle}</Alert.Title>
              <Alert.Description>{ui.returnedBody}</Alert.Description>
            </Alert.Root>
          ) : null}

          {isComplete ? (
            <Alert.Root variant="success">
              <Alert.Title>{ui.completeTitle}</Alert.Title>
              <Alert.Description>{ui.completeBody}</Alert.Description>
            </Alert.Root>
          ) : null}

          <ol className="space-y-2">
            {steps.map((step, index) => {
              const isPending = step.status === "PENDING";
              const isLast = index === steps.length - 1;
              const connectorPrimary =
                !isLast &&
                isPrimaryNode(step.status) &&
                isPrimaryNode(steps[index + 1].status);
              return (
                <li key={step.id} className="flex gap-3">
                  {/* Step index + flow connector: the line links each stage to
                      the next so the chain reads as a single sequence. */}
                  <div className="relative flex flex-col items-center pt-3">
                    {/* Connector runs node-center to node-center and is hidden
                        behind the opaque squares, so the chain reads unbroken. */}
                    {!isLast ? (
                      <div
                        className={`absolute top-6 -bottom-8 w-px ${connectorPrimary ? "bg-primary" : "bg-border"}`}
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className={`relative z-10 flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${stepIndexClass[step.status]}`}
                      aria-hidden
                    >
                      {step.status === "APPROVED" ? (
                        <Check className="size-3.5" aria-hidden />
                      ) : (
                        step.order
                      )}
                    </span>
                  </div>

                  {/* Step card */}
                  <div
                    className={
                      isPending
                        ? "flex-1 rounded-md border border-primary/40 p-3"
                        : "flex-1 rounded-md border p-3"
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{step.department}</p>
                        <p className="text-muted-foreground text-xs">
                          {step.approver}
                        </p>
                      </div>
                      <Badge variant={statusVariant[step.status]}>
                        {statusLabel[step.status]}
                        {step.decidedAt ? ` · ${step.decidedAt}` : ""}
                      </Badge>
                    </div>

                    {step.comment ? (
                      <p className="mt-2 text-sm">{step.comment}</p>
                    ) : null}

                    {isPending ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          className="border-input focus-visible:ring-ring w-full rounded-md border bg-transparent px-2 py-1.5 text-sm outline-none focus-visible:ring-2"
                          placeholder={ui.commentPlaceholder}
                          rows={2}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={returnRequest}>
                            {ui.return}
                          </Button>
                          <Button size="sm" onClick={approve}>
                            {ui.approve}
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </Card.Content>
      </Card.Root>
    </div>
  );
};
