import { useEffect, useRef, useState, type ComponentProps } from "react";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { CellEditor } from "../cell-editor";
import { Alert } from "../alert";
import { Button } from "../button";
import { Select } from "../select";
import { Textarea } from "../textarea";
import "./style.css";
export type EditorValue = string | number | boolean | null;
export interface ValueEditorProps {
  name: string;
  description: string;
  initialValue: EditorValue;
  boolean?: boolean;
  nullable?: boolean;
  anchor: DOMRect;
  container: ComponentProps<typeof CellEditor>["container"];
  onSave: (value: EditorValue) => Promise<void>;
  onClose: () => void;
}
/** The consumer validates/parses values and implements persistence. */
export function ValueEditor({
  name,
  description,
  initialValue,
  boolean = false,
  nullable = false,
  anchor,
  container,
  onSave,
  onClose,
}: ValueEditorProps) {
  const input = useRef<HTMLTextAreaElement>(null),
    saving = useRef(false);
  const [value, setValue] = useState<EditorValue>(initialValue),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    input.current?.focus();
  }, []);
  async function save(next = value) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      await onSave(next);
      onClose();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "保存できませんでした。",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return (
    <CellEditor
      anchor={anchor}
      container={container}
      title={<code>{name}</code>}
      description={description}
      closeLabel="セルの編集を閉じる"
      busy={busy}
      onClose={onClose}
      actions={
        <>
          <div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={busy}
              onClick={() => void save()}
            >
              {busy ? (
                <Loader2 size={13} className="erpui-value-editor-spin" />
              ) : (
                <CornerDownLeft size={13} />
              )}
              保存<span>Enter</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={busy}
              onClick={onClose}
            >
              <kbd>Esc</kbd>キャンセル
            </Button>
          </div>
          {nullable && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              disabled={busy}
              onClick={() => {
                setValue(null);
                void save(null);
              }}
            >
              NULLにする
            </Button>
          )}
        </>
      }
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          !event.shiftKey &&
          !event.nativeEvent.isComposing
        ) {
          event.preventDefault();
          void save();
        }
      }}
    >
      {boolean ? (
        <Select.Parts.Root
          itemToStringLabel={(value) =>
            value === "true" ? "TRUE" : value === "false" ? "FALSE" : "NULL"
          }
          disabled={busy}
          value={String(value === null ? "null" : String(value))}
          onValueChange={(value) =>
            setValue((value ?? "") === "null" ? null : (value ?? "") === "true")
          }
        >
          <Select.Parts.Trigger autoFocus aria-label={`${name}の値`}>
            <Select.Parts.Value />
          </Select.Parts.Trigger>
          <Select.Parts.Content container={container}>
            <Select.Parts.Item value="null">NULL</Select.Parts.Item>
            <Select.Parts.Item value="true">TRUE</Select.Parts.Item>
            <Select.Parts.Item value="false">FALSE</Select.Parts.Item>
          </Select.Parts.Content>
        </Select.Parts.Root>
      ) : (
        <Textarea
          ref={input}
          aria-label={`${name}の値`}
          spellCheck={false}
          disabled={busy}
          placeholder="NULL"
          value={value === null ? "" : String(value)}
          onChange={(event) => setValue(event.target.value)}
        />
      )}
      {error && (
        <Alert.Root
          className="erpui-value-editor-error"
          variant="error"
          role="alert"
        >
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      )}
    </CellEditor>
  );
}
