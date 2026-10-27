// Reference example: https://ui.tailor.tech/patterns/grid-view
import { Badge } from "@mailboost/erpboost-ui";

type Card = {
  id: string;
  title: string;
  description: string;
  status: "active" | "draft" | "archived";
  cover: string;
};

type Props = {
  cards: Card[];
};

const statusVariant: Record<
  Card["status"],
  "success" | "neutral" | "outline-neutral"
> = {
  active: "success",
  draft: "outline-neutral",
  archived: "neutral",
};

const statusLabel: Record<Card["status"], string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

export const GridView = ({ cards }: Props) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.id}
          className="group flex flex-col overflow-hidden rounded-xl border bg-card transition hover:shadow-md"
        >
          <div
            className="aspect-[4/3] w-full"
            style={{ background: card.cover }}
            aria-hidden
          />
          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="min-w-0 truncate text-sm font-semibold">
                {card.title}
              </h3>
              <Badge variant={statusVariant[card.status]}>
                {statusLabel[card.status]}
              </Badge>
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {card.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
};

export const sampleCards: Card[] = [
  {
    id: "p-1",
    title: "Cherry Hill Project",
    description: "Major office-building renovation. A full-scope project covering electrical and HVAC.",
    status: "active",
    cover: "linear-gradient(135deg, #fde68a, #fb7185)",
  },
  {
    id: "p-2",
    title: "Maple Bridge Expansion",
    description: "Widening and seismic retrofit of an existing bridge. Sidewalk clearance is the key requirement.",
    status: "active",
    cover: "linear-gradient(135deg, #86efac, #22d3ee)",
  },
  {
    id: "p-3",
    title: "Greenwind Tower Design",
    description: "Design phase for a high-rise mixed-use complex, including a BIM-integration pilot.",
    status: "draft",
    cover: "linear-gradient(135deg, #c4b5fd, #f0abfc)",
  },
  {
    id: "p-4",
    title: "Riverside Promenade",
    description: "Combined development of a riverside walking path and flood-control infrastructure.",
    status: "active",
    cover: "linear-gradient(135deg, #93c5fd, #6ee7b7)",
  },
  {
    id: "p-5",
    title: "Harvest Apartments",
    description: "Renovation of 60 rental units using locally sourced materials.",
    status: "archived",
    cover: "linear-gradient(135deg, #fcd34d, #fda4af)",
  },
  {
    id: "p-6",
    title: "Snowfield Logistics",
    description: "New distribution warehouse with cold-climate insulation and automation.",
    status: "draft",
    cover: "linear-gradient(135deg, #a5b4fc, #67e8f9)",
  },
  {
    id: "p-7",
    title: "Seabreeze Community",
    description: "Mixed project combining multi-family housing and a community facility.",
    status: "active",
    cover: "linear-gradient(135deg, #5eead4, #818cf8)",
  },
  {
    id: "p-8",
    title: "Birchwood Retreat",
    description: "Renovation of a retreat facility, currently in material selection.",
    status: "draft",
    cover: "linear-gradient(135deg, #fda4af, #fdba74)",
  },
];
