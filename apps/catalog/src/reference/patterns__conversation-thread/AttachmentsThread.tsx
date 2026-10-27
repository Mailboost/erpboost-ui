// Reference example: https://ui.tailor.tech/patterns/conversation-thread
import { useRef, useState, type ChangeEvent } from "react";
import {
  Avatar,
  Badge,
  Button,
  useAttachment,
  type AttachmentItem,
} from "@mailboost/erpboost-ui";
import { Paperclip, X } from "lucide-react";
import { ThreadComposer } from "../patterns__thread-composer/ThreadComposer";
import { ConversationThreadPanel } from "./ConversationThreadPanel";
import {
  FileAttachmentItem,
  FullscreenFilePreview,
  isPreviewable,
  useFilePreview,
} from "./FilePreview";

type MessageAttachment = AttachmentItem & {
  fileSize: number;
};

type Message = {
  id: string;
  actor: { name: string; initials: string };
  internal: boolean;
  timestamp: string;
  body: string;
  attachments: MessageAttachment[];
};

// Placeholder data URLs — in the catalogue we don't have a real upload backend,
// so we use a tiny inline PNG for thumbnail previews and a dummy PDF link.
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

const messages: Message[] = [
  {
    id: "m-1",
    actor: { name: "Aiko Sato (Customer)", initials: "AS" },
    internal: false,
    timestamp: "Apr 12, 10:14",
    body: "Hi team, attaching the original PO and a screenshot of the error.",
    attachments: [
      {
        id: "att-1",
        fileName: "PO-4421-original.pdf",
        mimeType: "application/pdf",
        previewUrl: undefined,
        fileSize: 184_320,
      },
      {
        id: "att-2",
        fileName: "error-screenshot.png",
        mimeType: "image/png",
        previewUrl: TINY_PNG,
        fileSize: 42_180,
      },
    ],
  },
  {
    id: "m-2",
    actor: { name: "Taro Tanaka", initials: "TT" },
    internal: true,
    timestamp: "Apr 12, 10:31",
    body: "[Internal] Pulled the ERP sync log for reference.",
    attachments: [
      {
        id: "att-3",
        fileName: "erp-sync.log",
        mimeType: "text/plain",
        fileSize: 12_400,
      },
    ],
  },
  {
    id: "m-3",
    actor: { name: "Taro Tanaka", initials: "TT" },
    internal: false,
    timestamp: "Apr 12, 10:34",
    body: "Confirmation attached. Shipping today.",
    attachments: [
      {
        id: "att-4",
        fileName: "PO-4421-confirmation.pdf",
        mimeType: "application/pdf",
        fileSize: 64_200,
      },
    ],
  },
];

export const AttachmentsThread = () => {
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // `useAttachment` buffers items + upload/delete operations until
  // `applyChanges` is called. We reuse its state machine but render a compact
  // composer (Paperclip icon button + a list of pending file rows) rather
  // than the full Attachment drop-tile.
  const attachment = useAttachment({
    accept: "image/*,application/pdf,.log,.txt",
  });
  const { items, onUpload, onDelete, accept } = attachment.props;
  const hasFiles = items.length > 0;

  const { previewState, openPreview, closePreview } = useFilePreview();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    onUpload(Array.from(files));
    event.target.value = "";
  };

  const handleSend = async () => {
    await attachment.applyChanges(async (operations) => {
      // In a real app, POST each operation to your upload backend here.
      console.info("flushing", operations.length, "attachment operations");
    });
    setReply("");
  };

  return (
    <>
      <ConversationThreadPanel
        footer={
          <ThreadComposer
            value={reply}
            onChange={setReply}
            rows={3}
            internal={internal}
            onInternalChange={setInternal}
            header={
              <div className="flex justify-end text-xs text-muted-foreground">
                Images, PDF, and .log files can be attached
              </div>
            }
            betweenBodyAndFooter={
              <>
                {hasFiles ? (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <FileAttachmentItem
                        key={item.id}
                        fileUrl={item.previewUrl ?? "#"}
                        fileName={item.fileName}
                        contentType={item.mimeType}
                        fileSize={null}
                        onPreview={
                          item.previewUrl && isPreviewable(item.mimeType)
                            ? () =>
                                openPreview(
                                  item.previewUrl!,
                                  item.fileName,
                                  item.mimeType,
                                )
                            : undefined
                        }
                        actions={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            aria-label="Remove attachment"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        }
                      />
                    ))}
                  </div>
                ) : null}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={accept}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            }
            footerLeading={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachment.isApplying}
                aria-label="Attach files"
                title="Attach files"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            }
            onDiscard={() => setReply("")}
            onSubmit={handleSend}
            submitDisabled={reply.length === 0 && !hasFiles}
            submitting={attachment.isApplying}
          />
        }
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={
              message.internal
                ? "-mx-2 flex gap-3 rounded-md bg-status-attention/5 px-2 py-2"
                : "flex gap-3"
            }
          >
            <Avatar.Root className="mt-0.5 shrink-0">
              <Avatar.Fallback>{message.actor.initials}</Avatar.Fallback>
            </Avatar.Root>
            <div className="min-w-0 flex-1">
              <header className="flex items-center gap-2 text-sm">
                <span className="font-medium">{message.actor.name}</span>
                {message.internal ? (
                  <Badge variant="warning">Internal</Badge>
                ) : null}
                <time className="text-xs text-muted-foreground">
                  {message.timestamp}
                </time>
              </header>
              <p className="mt-1 text-sm leading-relaxed">{message.body}</p>
              {message.attachments.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((file) => (
                    <FileAttachmentItem
                      key={file.id}
                      fileUrl={file.previewUrl ?? "#"}
                      fileName={file.fileName}
                      contentType={file.mimeType}
                      fileSize={file.fileSize}
                      onPreview={
                        file.previewUrl && isPreviewable(file.mimeType)
                          ? () =>
                              openPreview(
                                file.previewUrl!,
                                file.fileName,
                                file.mimeType,
                              )
                          : undefined
                      }
                      onDownload={() => {
                        console.info("download", file.fileName);
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </ConversationThreadPanel>

      <FullscreenFilePreview
        open={previewState.isOpen}
        onClose={closePreview}
        fileUrl={previewState.fileUrl}
        fileName={previewState.fileName}
        contentType={previewState.contentType}
      />
    </>
  );
};
