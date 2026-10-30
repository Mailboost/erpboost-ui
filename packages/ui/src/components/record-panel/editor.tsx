import { cn } from "@/lib/utils";
import { Alert } from "../alert";
import { Fieldset } from "../fieldset";
import { Button } from "../button";
import { RefreshCw } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  RecordPanel as Dialog,
  RecordPanelBody as DialogBody,
  RecordPanelFooter as DialogFooter,
} from "./index";
import type { ComponentProps } from "react";

export function RecordEditor({
  title,
  isNew,
  container,
  busy,
  dirty,
  error,
  children,
  onClose,
  onSave,
}: {
  title: ReactNode;
  isNew: boolean;
  container?: ComponentProps<typeof Dialog>["container"];
  busy: boolean;
  dirty: boolean;
  error?: string;
  children: ReactNode;
  onClose: () => void;
  onSave?: () => void;
}) {
  const [discard, setDiscard] = useState(false);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const close = () => {
    if (busy) return;
    if (dirty) setDiscard(true);
    else onClose();
  };
  return (
    <>
      <Dialog
        container={container}
        title={title}
        placement="right"
        className="erpui-record-editor"
        closeDisabled={busy}
        onClose={close}
      >
        <form
          className="erpui-record-editor-form astw:flex astw:flex-1 astw:flex-col astw:min-h-0"
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              if (!busy && onSave && (isNew || dirty)) onSave();
            }
          }}
          onSubmit={(event) => {
            event.preventDefault();
            if (!busy && onSave && (isNew || dirty)) onSave();
          }}
        >
          {error && (
            <Alert.Root
              className="erpui-record-editor-error astw:shrink-0 astw:mt-3.5 astw:mx-5 astw:mb-0"
              variant="error"
              role="alert"
            >
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}
          <DialogBody
            className={cn(
              "erpui-record-editor-body astw:[&>fieldset]:grid astw:[&>fieldset]:gap-6 astw:[&>fieldset]:min-w-0",
              "astw:[&>fieldset]:m-0 astw:[&>fieldset]:p-0 astw:[&>fieldset]:border-0",
            )}
          >
            <Fieldset.Root disabled={busy}>{children}</Fieldset.Root>
          </DialogBody>
          <DialogFooter className="erpui-record-editor-footer astw:[&_kbd]:ml-[3px] astw:[&_kbd]:[font-family:inherit] astw:[&_kbd]:text-[11px]">
            <Button
              variant="outline"
              size="sm"
              type="button"

              disabled={busy}
              onClick={close}
            >
              閉じる
            </Button>
            <Button
              variant="default"
              size="sm"
              type="submit"

              disabled={busy || !onSave || (!isNew && !dirty)}
            >
              {busy && (
                <RefreshCw
                  size={14}
                  className="erpui-record-editor-spin astw:animate-spin astw:motion-reduce:animate-none"
                />
              )}
              {busy ? "保存中…" : "保存"}
              <kbd aria-hidden="true">⌘↵</kbd>
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
      {discard && (
        <Dialog
          container={container}
          title="変更を破棄しますか？"
          className="erpui-record-confirm"
          onClose={() => setDiscard(false)}
        >
          <DialogBody
            className={cn(
              "erpui-record-panel-body astw:min-w-0 astw:min-h-0 astw:overflow-auto",
              "astw:[.erpui-record-panel-side_&]:flex-1 astw:[.erpui-record-panel-side_&]:p-4",
            )}
          >
            <p>保存していない変更があります。</p>
          </DialogBody>
          <DialogFooter className="erpui-record-panel-actions">
            <Button
              variant="outline"
              size="sm"
              type="button"

              onClick={() => setDiscard(false)}
            >
              編集を続ける
            </Button>
            <Button
              variant="default"
              size="sm"
              type="button"

              onClick={onClose}
            >
              変更を破棄
            </Button>
          </DialogFooter>
        </Dialog>
      )}
    </>
  );
}
