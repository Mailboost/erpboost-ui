import { useState } from "react";
import {
  Button,
  CodeWorkspace,
  InlineCreate,
  SourceNavigation,
  Textarea,
  type SourceFile,
} from "@mailboost/erpboost-ui";
const initialFiles: SourceFile[] = [
  { name: "main.py" },
  { name: "helpers.py", removable: true },
  { name: "a_long_source_filename_for_horizontal_scroll.py", removable: true },
];
export function SourceNavigationDemo() {
  const [files, setFiles] = useState(initialFiles),
    [value, setValue] = useState("main.py"),
    [adding, setAdding] = useState(false),
    [name, setName] = useState(""),
    [error, setError] = useState(""),
    [locked, setLocked] = useState(false),
    [submissions, setSubmissions] = useState(0),
    [contents, setContents] = useState<Record<string, string>>({
      "main.py": "main value",
      "helpers.py": "helper value",
    });
  function add() {
    if (!name || files.some((file) => file.name === name)) {
      setError("Already exists");
      return;
    }
    setFiles((current) => [...current, { name, removable: true }]);
    setValue(name);
    setAdding(false);
    setName("");
    setError("");
  }
  function remove(name: string) {
    setFiles((current) => current.filter((file) => file.name !== name));
    if (value === name) setValue("main.py");
  }
  return (
    <form
      className="astw:grid astw:gap-4 astw:min-w-0"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmissions((count) => count + 1);
      }}
    >
      <Button type="button" onClick={() => setLocked((value) => !value)}>
        {locked ? "Enable actions" : "Disable actions"}
      </Button>
      <CodeWorkspace.Root className="astw:h-90">
        <SourceNavigation.Files
          aria-label="Source files"
          title="Sources"
          group="src"
          files={files}
          value={value}
          onValueChange={setValue}
          addAction={{
            label: "Add source",
            tooltip: "Add file",
            disabled: locked,
            onSelect: () => {
              setAdding(true);
              setError("");
            },
          }}
          removeAction={{
            label: (name) => `Remove ${name}`,
            tooltip: "Remove file",
            disabled: locked,
            onSelect: remove,
          }}
        >
          {adding && (
            <InlineCreate
              label="Source name"
              placeholder="module.py"
              value={name}
              onValueChange={setName}
              submitLabel="Add"
              cancelLabel="Cancel add"
              disabled={locked}
              error={error}
              onSubmit={add}
              onCancel={() => {
                setAdding(false);
                setError("");
              }}
            />
          )}
        </SourceNavigation.Files>
        <CodeWorkspace.Main>
          <CodeWorkspace.Editor>
            <SourceNavigation.Tabs
              label="Open sources"
              files={files}
              value={value}
              onValueChange={setValue}
              meta="Runtime"
            />
            <div className="astw:p-4 astw:min-w-0">
              <Textarea
                aria-label="Editor draft"
                value={contents[value] ?? ""}
                onChange={(event) =>
                  setContents((current) => ({
                    ...current,
                    [value]: event.target.value,
                  }))
                }
              />
            </div>
          </CodeWorkspace.Editor>
        </CodeWorkspace.Main>
      </CodeWorkspace.Root>
      <output aria-label="Selected source">{value}</output>
      <output aria-label="Form submissions">{submissions}</output>
    </form>
  );
}
