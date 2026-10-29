import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  RecordPanel,
  RecordPanelBody,
  RecordPanelFooter,
} from "../record-panel";
import { OptionCard } from "../option-card";
import { Button } from "../button";
import "./style.css";
export type TemplateChoice = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};
export type TemplatePickerProps = {
  title: ReactNode;
  options: readonly TemplateChoice[];
  onChoose: (id: string) => void;
  onClose: () => void;
  closeLabel: ReactNode;
  empty?: ReactNode;
  busy?: boolean;
  width?: number;
  container?: ComponentProps<typeof RecordPanel>["container"];
  confirmation?: {
    title: ReactNode;
    message: (choice: TemplateChoice) => ReactNode;
    backLabel: ReactNode;
    confirmLabel: ReactNode;
  };
};
/** Option selection and optional review step; templates, replacement rules and application remain external. */
export function TemplatePicker({
  title,
  options,
  onChoose,
  onClose,
  closeLabel,
  empty,
  busy = false,
  width = 380,
  container,
  confirmation,
}: TemplatePickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const choice = options.find((option) => option.id === selected);
  const pending = confirmation && choice;
  const confirmRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef(new Map<string, HTMLButtonElement>());
  const returnFocus = useRef<string | null>(null);
  useEffect(() => {
    if (pending) confirmRef.current?.focus();
    else if (returnFocus.current) {
      optionRefs.current.get(returnFocus.current)?.focus();
      returnFocus.current = null;
    }
  }, [pending]);
  useEffect(() => {
    if (selected && !choice) setSelected(null);
  }, [selected, choice]);
  return (
    <RecordPanel
      title={pending ? confirmation.title : title}
      placement="right"
      width={width}
      container={container}
      className="erpui-template-picker"
      closeDisabled={busy}
      onClose={onClose}
    >
      <RecordPanelBody className="erpui-template-picker-body">
        {pending
          ? confirmation.message(choice)
          : options.length
            ? options.map((option) => (
                <OptionCard
                  ref={(element) => {
                    if (element) optionRefs.current.set(option.id, element);
                    else optionRefs.current.delete(option.id);
                  }}
                  key={option.id}
                  title={option.title}
                  description={option.description}
                  icon={option.icon}
                  disabled={busy || option.disabled}
                  onClick={() => {
                    if (busy || option.disabled) return;
                    if (confirmation) setSelected(option.id);
                    else onChoose(option.id);
                  }}
                />
              ))
            : empty}
      </RecordPanelBody>
      <RecordPanelFooter>
        {pending ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => {
                returnFocus.current = selected;
                setSelected(null);
              }}
            >
              {confirmation.backLabel}
            </Button>
            <Button
              ref={confirmRef}
              type="button"
              size="sm"
              disabled={busy || choice.disabled}
              onClick={() => {
                if (!busy && !choice.disabled) onChoose(choice.id);
              }}
            >
              {confirmation.confirmLabel}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={onClose}
          >
            {closeLabel}
          </Button>
        )}
      </RecordPanelFooter>
    </RecordPanel>
  );
}
