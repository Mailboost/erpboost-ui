import { useRef, useState } from "react";
import { AdaptiveWorkspace, Button, CodeWorkspace, Textarea, Input, FileList, FileListItem, Tabs } from "@mailboost/erpboost-ui";
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
      className="astw:grid astw:gap-3 astw:min-w-0"
    >
      <Button type="button" onClick={() => setNarrow((current) => !current)}>
        {narrow ? "Use full container" : "Use narrow container"}
      </Button>
      <div
        data-demo-container="adaptive"
        className={`astw:max-w-full ${narrow ? "astw:w-90" : "astw:w-full"}`}
      >
        <CodeWorkspace.Root className="astw:h-150">
          <AdaptiveWorkspace
            navigationLabel="Files"
            collapseKey={navigation}
            sidebar={
              <CodeWorkspace.Sidebar aria-label="Source files">
                <CodeWorkspace.Header
                  actions={
                    <Button
                      type="button"
                      aria-label="Add source"
                      onClick={() => setAdding(true)}
                    >
                      +
                    </Button>
                  }
                >
                  Sources
                </CodeWorkspace.Header>
                <FileList>
                  {files.map((file) => (
                    <FileListItem
                      key={file.name}
                      name={file.name}
                      selected={value === file.name}
                      onSelect={() => {
                        setValue(file.name);
                        setNavigation((count) => count + 1);
                        editor.current?.focus();
                      }}
                    />
                  ))}
                </FileList>
                {adding && (
                  <FileList.Editor>
                    <Input
                      aria-label="Source name"
                      autoFocus
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.nativeEvent.isComposing || event.keyCode === 229) return;
                        if (event.key === "Enter") {
                          event.preventDefault();
                          setAdding(false);
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                          event.stopPropagation();
                          setAdding(false);
                        }
                      }}
                    />
                    <Button type="button" onClick={() => setAdding(false)}>
                      Create
                    </Button>
                    <Button
                      type="button"
                      aria-label="Cancel source"
                      onClick={() => setAdding(false)}
                    >
                      Cancel
                    </Button>
                  </FileList.Editor>
                )}
              </CodeWorkspace.Sidebar>
            }
          >
            <CodeWorkspace.Main>
              <CodeWorkspace.Editor>
                <CodeWorkspace.EditorTabs>
                  <Tabs.Root
                    value={value}
                    onValueChange={(next) => {
                      if (typeof next === "string") setValue(next);
                    }}
                    variant="line"
                  >
                    <Tabs.List aria-label="Open source files">
                      {files.slice(0, 2).map((file) => (
                        <Tabs.Tab key={file.name} value={file.name}>
                          {file.name}
                        </Tabs.Tab>
                      ))}
                    </Tabs.List>
                  </Tabs.Root>
                  <small>Runtime</small>
                </CodeWorkspace.EditorTabs>
                <Textarea
                  ref={editor}
                  aria-label="Editor draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="astw:flex-1 astw:min-h-0 astw:resize-none"
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
