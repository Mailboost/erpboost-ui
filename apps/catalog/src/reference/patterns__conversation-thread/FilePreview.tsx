// Reference example: https://ui.tailor.tech/patterns/conversation-thread
// Catalogue-local port of ODK's file-preview components (FileThumbnail /
// FileAttachmentItem / FullscreenFilePreview / useFilePreview). The original
// in `frontend-shared/components/ui/file-preview.tsx` fetches blobs through
// an auth-aware client; for the catalogue we just consume URLs directly so
// the component is self-contained.
import { Button } from "@mailboost/erpboost-ui";
import {
  Download,
  FileText,
  Image as ImageIcon,
  Maximize2,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const isImageFile = (contentType: string | null | undefined) =>
  contentType?.startsWith("image/") ?? false;

export const isPdfFile = (contentType: string | null | undefined) =>
  contentType === "application/pdf";

export const isPreviewable = (contentType: string | null | undefined) =>
  isImageFile(contentType) || isPdfFile(contentType);

export const formatFileSize = (
  bytes: number | null | undefined,
): string | null => {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
} as const;

type FileThumbnailProps = {
  fileUrl?: string | null;
  fileName: string;
  contentType?: string | null;
  size?: keyof typeof sizeClasses;
  onClick?: () => void;
};

export const FileThumbnail = ({
  fileUrl,
  fileName,
  contentType,
  size = "md",
  onClick,
}: FileThumbnailProps) => {
  const [failed, setFailed] = useState(false);
  const container = `bg-muted flex ${sizeClasses[size]} items-center justify-center rounded ${onClick ? "cursor-pointer hover:opacity-80" : ""}`;
  const icon = `text-muted-foreground ${iconSizeClasses[size]}`;

  if (!fileUrl || !isImageFile(contentType) || failed) {
    return (
      <div className={container} onClick={onClick}>
        {failed ? (
          <ImageIcon className={icon} />
        ) : (
          <FileText className={icon} />
        )}
      </div>
    );
  }

  return (
    <img
      src={fileUrl}
      alt={fileName}
      className={`${sizeClasses[size]} rounded object-cover ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={onClick}
      onError={() => setFailed(true)}
    />
  );
};

type FileAttachmentItemProps = {
  fileUrl?: string | null;
  fileName: string;
  contentType?: string | null;
  fileSize?: number | null;
  extraInfo?: ReactNode;
  onPreview?: () => void;
  onDownload?: () => void;
  actions?: ReactNode;
};

export const FileAttachmentItem = ({
  fileUrl,
  fileName,
  contentType,
  fileSize,
  extraInfo,
  onPreview,
  onDownload,
  actions,
}: FileAttachmentItemProps) => {
  const size = formatFileSize(fileSize);
  return (
    <div className="flex items-center justify-between rounded-md border bg-card p-3">
      <div className="flex items-center gap-3">
        {fileUrl ? (
          <FileThumbnail
            fileUrl={fileUrl}
            fileName={fileName}
            contentType={contentType}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{fileName}</span>
          <span className="text-xs text-muted-foreground">
            {size}
            {size && extraInfo ? " · " : null}
            {extraInfo}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {fileUrl && isPreviewable(contentType) && onPreview ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onPreview}
            aria-label="Preview"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        ) : null}
        {fileUrl && onDownload ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onDownload}
            aria-label="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        ) : null}
        {actions}
      </div>
    </div>
  );
};

type FullscreenFilePreviewProps = {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  contentType?: string | null;
};

export const FullscreenFilePreview = ({
  open,
  onClose,
  fileUrl,
  fileName,
  contentType,
}: FullscreenFilePreviewProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={fileName}
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={onClose}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </Button>
      <div
        className="flex flex-1 items-center justify-center p-4"
        onClick={(event) => event.stopPropagation()}
      >
        {isImageFile(contentType) ? (
          <img
            src={fileUrl}
            alt={fileName}
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />
        ) : isPdfFile(contentType) ? (
          <iframe
            src={fileUrl}
            title={fileName}
            className="h-[85vh] w-[90vw] max-w-6xl rounded-lg bg-white"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/70">
            <ImageIcon className="h-10 w-10" />
            <p>Preview is not available for this file</p>
          </div>
        )}
      </div>
      <div
        className="flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-6 py-4"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="max-w-[70%] truncate text-sm text-white">
          {fileName}
        </span>
        <a
          href={fileUrl}
          download={fileName}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>
    </div>
  );
};

type FilePreviewState = {
  isOpen: boolean;
  fileUrl: string;
  fileName: string;
  contentType?: string | null;
};

export const useFilePreview = () => {
  const [previewState, setPreviewState] = useState<FilePreviewState>({
    isOpen: false,
    fileUrl: "",
    fileName: "",
    contentType: null,
  });

  const openPreview = useCallback(
    (fileUrl: string, fileName: string, contentType?: string | null) => {
      setPreviewState({ isOpen: true, fileUrl, fileName, contentType });
    },
    [],
  );

  const closePreview = useCallback(
    () => setPreviewState((prev) => ({ ...prev, isOpen: false })),
    [],
  );

  return { previewState, openPreview, closePreview };
};
