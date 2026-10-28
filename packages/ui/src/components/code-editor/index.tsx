import { useEffect, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightSpecialChars,
  drawSelection,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { python } from "@codemirror/lang-python";
import {
  HighlightStyle,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  indentOnInput,
} from "@codemirror/language";

// Preserve CodeMirror's token assignments while adapting their contrast to the CSS color scheme.
const editorHighlightStyle = HighlightStyle.define(
  defaultHighlightStyle.specs.map((rule) =>
    typeof rule.color === "string"
      ? {
          ...rule,
          color: `light-dark(${rule.color}, color-mix(in srgb, ${rule.color}, white 60%))`,
        }
      : rule,
  ),
);

export function CodeEditor({
  value,
  disabled,
  onChange,
  focusRequest,
  focusLine,
  language = "python",
  label = "Code",
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  focusRequest?: number;
  focusLine?: number;
  language?: "python" | "json";
  label?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | undefined>(undefined);
  const editable = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          ...(language === "python" ? [python()] : []),
          lineNumbers(),
          history(),
          highlightSpecialChars(),
          drawSelection(),
          highlightActiveLine(),
          syntaxHighlighting(editorHighlightStyle),
          bracketMatching(),
          indentOnInput(),
          keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
          editable.current.of(EditorView.editable.of(!disabled)),
          EditorView.contentAttributes.of({
            "aria-label": label,
            role: "textbox",
            "aria-multiline": "true",
            spellcheck: "false",
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged)
              onChangeRef.current(update.state.doc.toString());
          }),
          EditorView.theme({
            "&": {
              height: "100%",
              fontSize: "12px",
              backgroundColor: "var(--background,#fff)",
              color: "var(--foreground,#1f2937)",
            },
            ".cm-scroller": {
              fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
              lineHeight: "22px",
              overflow: "auto",
            },
            ".cm-content": { padding: "12px 0 30px" },
            ".cm-line": { padding: "0 18px" },
            ".cm-gutters": {
              backgroundColor: "var(--background,#fff)",
              color: "var(--muted-foreground,#b0b8c4)",
              border: "none",
              paddingRight: "5px",
            },
            ".cm-activeLine,.cm-activeLineGutter": {
              backgroundColor: "var(--muted,#f8fafc)",
            },
            "&.cm-focused": { outline: "none" },
            ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
              backgroundColor:
                "color-mix(in srgb, var(--ring,#3b82f6) 25%, transparent)",
            },
            ".cm-cursor": { borderLeftColor: "var(--ring,#3b82f6)" },
          }),
        ],
      }),
    });
    view.current = editor;
    return () => {
      editor.destroy();
      view.current = undefined;
    };
  }, [language, label]);
  useEffect(() => {
    const editor = view.current;
    if (editor && editor.state.doc.toString() !== value)
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: value },
      });
  }, [value]);
  useEffect(() => {
    view.current?.dispatch({
      effects: editable.current.reconfigure(EditorView.editable.of(!disabled)),
    });
  }, [disabled]);
  useEffect(() => {
    const editor = view.current;
    if (!editor || !focusRequest) return;
    const line = editor.state.doc.line(
      Math.max(1, Math.min(editor.state.doc.lines, focusLine ?? 1)),
    );
    editor.dispatch({
      selection: { anchor: line.from },
      effects: EditorView.scrollIntoView(line.from, { y: "center" }),
    });
    editor.focus();
  }, [focusRequest, focusLine]);
  return (
    <div data-slot="code-editor" className="erpui-code-editor" ref={host} />
  );
}
