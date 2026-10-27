// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { Source, Sources, SourcesContent, SourcesTrigger } from "./Sources";

const CITED = [
  { id: "kb-12", title: "Creating purchase orders" },
  { id: "kb-31", title: "Order approval workflow" },
  { id: "kb-07", title: "Supplier master data policy" },
];

// Collapsed by default — click the trigger to expand. Each source takes an
// onClick, typically used to open the cited document next to the chat.
export const SourcesDemo = () => (
  <div className="mx-auto w-full max-w-md">
    <Sources>
      <SourcesTrigger count={CITED.length} />
      <SourcesContent>
        {CITED.map((source) => (
          <Source key={source.id} title={source.title} />
        ))}
      </SourcesContent>
    </Sources>
  </div>
);
