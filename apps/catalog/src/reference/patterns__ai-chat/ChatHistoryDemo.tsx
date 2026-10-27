// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { useState } from "react";
import { ChatHistory, type ChatHistoryGroupData } from "./ChatHistory";
import { MOCK_HISTORY } from "./mockAssistant";

const initialGroups: ChatHistoryGroupData[] = MOCK_HISTORY.map((group) => ({
  title: group.title,
  items: group.items.map(({ id, title }) => ({ id, title })),
}));

// Selecting highlights the conversation (in the assembled panel it also loads
// the transcript); hovering reveals the delete button because `onDelete` is
// provided.
export const ChatHistoryDemo = () => {
  const [groups, setGroups] = useState(initialGroups);
  const [activeId, setActiveId] = useState(initialGroups[0]?.items[0]?.id);

  const handleDelete = (id: string) =>
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.filter((item) => item.id !== id),
      })),
    );

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border p-2">
      <ChatHistory
        groups={groups}
        activeId={activeId}
        onSelect={setActiveId}
        onDelete={handleDelete}
      />
    </div>
  );
};
