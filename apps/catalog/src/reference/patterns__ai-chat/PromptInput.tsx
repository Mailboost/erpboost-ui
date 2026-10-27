// Reference example: https://ui.tailor.tech/patterns/ai-chat
import { ArrowUp, Paperclip, Plus, Square, X } from "lucide-react";
import type {
  ChangeEventHandler,
  ComponentProps,
  FormEvent,
  FormHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button, Menu } from "@mailboost/erpboost-ui";
import { cn } from "@/lib/utils";
import { Loader } from "./Loader";

// Chat composer (adapted from AI Elements' PromptInput): a rounded card with
// an auto-growing textarea on top and a toolbar below. Enter submits
// (IME-safe), Shift+Enter inserts a newline, and the submit button flips to a
// stop button while a response is streaming — clicking it should abort the
// request. Attachments flow through a hidden file input opened from the
// action menu; submitted files arrive in `onSubmit` and the list resets.
//
// Minimal usage:
//   <PromptInput onSubmit={(files) => send(text, files)}>
//     <PromptInputBody>
//       <PromptInputTextarea value={text} onChange={(e) => setText(e.target.value)} />
//       <PromptInputFooter>
//         <PromptInputTools>…menus…</PromptInputTools>
//         <PromptInputSubmit status={status} />
//       </PromptInputFooter>
//     </PromptInputBody>
//   </PromptInput>

export type PromptInputAttachmentFile = {
  id: string;
  file: File;
  /** Object URL for image previews; revoked when the attachment is removed. */
  url: string;
  mediaType: string;
  filename?: string;
};

interface PromptInputAttachmentsContextValue {
  files: PromptInputAttachmentFile[];
  add: (files: FileList | File[]) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
}

const PromptInputAttachmentsContext =
  createContext<PromptInputAttachmentsContextValue | null>(null);

export const usePromptInputAttachments = () => {
  const ctx = useContext(PromptInputAttachmentsContext);
  if (!ctx) {
    throw new Error("usePromptInputAttachments must be used within a PromptInput");
  }
  return ctx;
};

export type PromptInputProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & {
  onSubmit?: (files: PromptInputAttachmentFile[], event: FormEvent<HTMLFormElement>) => void;
  /** Accepted file types for the hidden file input. */
  accept?: string;
  multiple?: boolean;
};

export const PromptInput = ({
  className,
  onSubmit,
  accept = "image/*,application/pdf",
  multiple = true,
  children,
  ...props
}: PromptInputProps) => {
  const [files, setFiles] = useState<PromptInputAttachmentFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef(files);
  filesRef.current = files;

  // Revoke object URLs on unmount to avoid leaking blob references.
  useEffect(
    () => () => {
      for (const f of filesRef.current) URL.revokeObjectURL(f.url);
    },
    [],
  );

  const add = (incoming: FileList | File[]) => {
    const next = Array.from(incoming).map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
      mediaType: file.type || "application/octet-stream",
      filename: file.name,
    }));
    setFiles((prev) => [...prev, ...next]);
  };

  const remove = (id: string) =>
    setFiles((prev) => {
      const found = prev.find((f) => f.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((f) => f.id !== id);
    });

  const clear = () =>
    setFiles((prev) => {
      for (const f of prev) URL.revokeObjectURL(f.url);
      return [];
    });

  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.currentTarget.files?.length) add(e.currentTarget.files);
    e.currentTarget.value = "";
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const snapshot = files;
    setFiles([]);
    onSubmit?.(snapshot, e);
  };

  const ctx = useMemo<PromptInputAttachmentsContextValue>(
    // add/remove/clear/openFileDialog close over stable refs, so `files` is
    // the only value consumers need to re-render for.
    () => ({ files, add, remove, clear, openFileDialog }),
    [files],
  );

  return (
    <PromptInputAttachmentsContext.Provider value={ctx}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInputChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
      <form
        className={cn(
          "m-3 mt-0 flex shrink-0 flex-col gap-2 rounded-xl border bg-background p-2 shadow-sm focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
          className,
        )}
        onSubmit={handleSubmit}
        {...props}
      >
        {children}
      </form>
    </PromptInputAttachmentsContext.Provider>
  );
};

export type PromptInputBodyProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputBody = ({ className, ...props }: PromptInputBodyProps) => (
  <div className={cn("contents", className)} {...props} />
);

export type PromptInputHeaderProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputHeader = ({ className, ...props }: PromptInputHeaderProps) => (
  <div className={cn("flex flex-wrap items-center gap-1", className)} {...props} />
);

export type PromptInputFooterProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputFooter = ({ className, ...props }: PromptInputFooterProps) => (
  <div className={cn("flex items-center justify-between gap-2", className)} {...props} />
);

export type PromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const PromptInputTools = ({ className, ...props }: PromptInputToolsProps) => (
  <div className={cn("flex items-center gap-1", className)} {...props} />
);

export type PromptInputButtonProps = ComponentProps<typeof Button>;

export const PromptInputButton = ({
  className,
  variant = "ghost",
  size = "icon",
  type = "button",
  ...props
}: PromptInputButtonProps) => (
  <Button
    type={type}
    variant={variant}
    size={size}
    className={cn(
      "aspect-square size-8 shrink-0 rounded-full p-0 text-muted-foreground hover:text-foreground",
      className,
    )}
    {...props}
  />
);

export type PromptInputActionMenuProps = ComponentProps<typeof Menu.Root>;

export const PromptInputActionMenu = (props: PromptInputActionMenuProps) => (
  <Menu.Root {...props} />
);

export type PromptInputActionMenuTriggerProps = PromptInputButtonProps;

export const PromptInputActionMenuTrigger = ({
  className,
  children,
  ...props
}: PromptInputActionMenuTriggerProps) => (
  <Menu.Trigger
    render={
      <PromptInputButton aria-label="Open composer menu" className={className} {...props}>
        {children ?? <Plus className="size-4" aria-hidden />}
      </PromptInputButton>
    }
  />
);

export type PromptInputActionMenuContentProps = ComponentProps<typeof Menu.Content>;

export const PromptInputActionMenuContent = ({
  className,
  ...props
}: PromptInputActionMenuContentProps) => (
  <Menu.Content className={cn("min-w-44", className)} {...props} />
);

export type PromptInputActionAddAttachmentsProps = ComponentProps<typeof Menu.Item> & {
  label?: string;
};

export const PromptInputActionAddAttachments = ({
  label = "Attach files",
  className,
  ...props
}: PromptInputActionAddAttachmentsProps) => {
  const attachments = usePromptInputAttachments();

  return (
    <Menu.Item
      className={cn("gap-2", className)}
      onClick={() => attachments.openFileDialog()}
      {...props}
    >
      <Paperclip className="size-4" aria-hidden />
      {label}
    </Menu.Item>
  );
};

export type PromptInputAttachmentsProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: (file: PromptInputAttachmentFile) => ReactNode;
};

export const PromptInputAttachments = ({
  children,
  className,
  ...props
}: PromptInputAttachmentsProps) => {
  const attachments = usePromptInputAttachments();

  if (attachments.files.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} {...props}>
      {attachments.files.map((file) => (
        <Fragment key={file.id}>{children(file)}</Fragment>
      ))}
    </div>
  );
};

export type PromptInputAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: PromptInputAttachmentFile;
};

export const PromptInputAttachment = ({
  data,
  className,
  ...props
}: PromptInputAttachmentProps) => {
  const attachments = usePromptInputAttachments();
  const isImage = data.mediaType.startsWith("image/");

  return (
    <div
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-md border bg-muted/40 pl-1.5 pr-1 text-xs",
        className,
      )}
      {...props}
    >
      {isImage ? (
        <img
          src={data.url}
          alt={data.filename ?? ""}
          className="size-4 shrink-0 rounded-sm object-cover"
        />
      ) : (
        <Paperclip className="size-3 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <span className="max-w-32 truncate">{data.filename ?? "Attachment"}</span>
      <button
        type="button"
        aria-label="Remove attachment"
        className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        onClick={() => attachments.remove(data.id)}
      >
        <X className="size-3" aria-hidden />
      </button>
    </div>
  );
};

export type PromptInputTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  maxHeight?: number;
};

export const PromptInputTextarea = ({
  className,
  onKeyDown,
  maxHeight = 160,
  value,
  ...props
}: PromptInputTextareaProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const attachments = usePromptInputAttachments();

  // Auto-grow with the content up to maxHeight, then scroll.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value, maxHeight]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing guards IME text entry (e.g. kana→kanji conversion), where
    // Enter confirms a candidate rather than submitting the form.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
    // Backspace in an empty textarea removes the newest attachment.
    if (e.key === "Backspace" && e.currentTarget.value === "" && attachments.files.length > 0) {
      e.preventDefault();
      const last = attachments.files.at(-1);
      if (last) attachments.remove(last.id);
    }
    onKeyDown?.(e);
  };

  return (
    <textarea
      ref={ref}
      value={value}
      onKeyDown={handleKeyDown}
      rows={1}
      className={cn(
        "min-h-9 w-full resize-none border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground focus:ring-0",
        className,
      )}
      {...props}
    />
  );
};

export type PromptInputSubmitStatus = "ready" | "submitted" | "streaming" | "error";

export type PromptInputSubmitProps = Omit<ComponentProps<typeof Button>, "type"> & {
  status?: PromptInputSubmitStatus;
};

// Send button that turns into a stop button while a response streams. The
// parent decides what a click means from its own status ("submit new question"
// vs "abort the stream"); this component only reflects the state visually.
export const PromptInputSubmit = ({
  className,
  status = "ready",
  disabled,
  ...props
}: PromptInputSubmitProps) => {
  const busy = status === "submitted" || status === "streaming";
  return (
    <Button
      type="submit"
      size="icon"
      disabled={disabled || status === "submitted"}
      aria-label={busy ? "Stop" : "Send"}
      className={cn("aspect-square size-9 shrink-0 self-end rounded-full p-0", className)}
      {...props}
    >
      {busy ? (
        status === "streaming" ? (
          <Square className="size-3.5 fill-current" aria-hidden />
        ) : (
          <Loader />
        )
      ) : (
        <ArrowUp className="size-4" aria-hidden />
      )}
    </Button>
  );
};
