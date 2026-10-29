import { useRef, useState } from "react";
import {
  AdaptiveWorkspace,
  Button,
  CodeWorkspace,
  InlineCreate,
  SourceNavigation,
  Textarea,
} from "@mailboost/erpboost-ui";
const files = [
  { name: "main.py" },
  { name: "helpers.py" },
  ...Array.from({ length: 12 }, (_, index) => ({ name: `module_${index}.py` })),
];
export function AdaptiveWorkspaceDemo() {
  const [narrow, setNarrow] = useState(false),
    [value, setValue] = useState("main.py"),
    [navigation, setNavigation] = useState(0),
    [adding, setAdding] = useState(false),
    [name, setName] = useState(""),
    [draft, setDraft] = useState("0001 — 日本語"),
    [submissions, setSubmissions] = useState(0);
  const editor = useRef<HTMLTextAreaElement | null>(null);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmissions((count) => count + 1);
      }}
      style={{ display: "grid", gap: 12, minWidth: 0 }}
    >
      <Button type="button" onClick={() => setNarrow((current) => !current)}>
        {narrow ? "Use full container" : "Use narrow container"}
      </Button>
      <div
        data-demo-container="adaptive"
        style={{ width: narrow ? 360 : "100%", maxWidth: "100%" }}
      >
        <CodeWorkspace.Root style={{ height: 600 }}>
          <AdaptiveWorkspace
            navigationLabel="Files"
            collapseKey={navigation}
            sidebar={
              <SourceNavigation.Files
                aria-label="Source files"
                files={files}
                value={value}
                title="Sources"
                onValueChange={(name) => {
                  setValue(name);
                  setNavigation((count) => count + 1);
                  editor.current?.focus();
                }}
                addAction={{
                  label: "Add source",
                  onSelect: () => setAdding(true),
                }}
              >
                {adding && (
                  <InlineCreate
                    label="Source name"
                    value={name}
                    onValueChange={setName}
                    submitLabel="Create"
                    cancelLabel="Cancel source"
                    onSubmit={() => setAdding(false)}
                    onCancel={() => setAdding(false)}
                  />
                )}
              </SourceNavigation.Files>
            }
          >
            <CodeWorkspace.Main>
              <CodeWorkspace.Editor>
                <SourceNavigation.Tabs
                  files={files.slice(0, 2)}
                  value={value}
                  label="Open source files"
                  meta="Runtime"
                  onValueChange={setValue}
                />
                <Textarea
                  ref={editor}
                  aria-label="Editor draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  style={{ flex: 1, minHeight: 0, resize: "none" }}
                />
              </CodeWorkspace.Editor>
            </CodeWorkspace.Main>
          </AdaptiveWorkspace>
        </CodeWorkspace.Root>
      </div>
      <output aria-label="Selected source">{value}</output>
      <output aria-label="Form submissions">{submissions}</output>
    </form>
  );
}
