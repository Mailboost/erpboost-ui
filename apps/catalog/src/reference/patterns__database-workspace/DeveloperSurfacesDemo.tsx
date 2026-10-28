import { useState } from "react";
import {
  CodeEditor,
  FileList,
  FileListItem,
  ResizeHandle,
  WorkflowNode,
  LogViewer,
  DescriptionList,
  CellEditor,
  StatusDot,
  Badge,
  Button,
  Textarea,
} from "@mailboost/erpboost-ui";
import { FileCode2, X } from "lucide-react";
export function DeveloperSurfacesDemo() {
  const [file, setFile] = useState("pipeline.py");
  const [source, setSource] = useState("def run():\n    return []\n");
  const [height, setHeight] = useState(200);
  const [cell, setCell] = useState<{ left: number; top: number } | null>(null);
  const [value, setValue] = useState("S00001");
  return (
    <section className="astw:mt-8" aria-label="Developer surfaces">
      <h2 className="astw:mb-3 astw:text-heading-sm">
        コード・ファイル・実行結果・セル編集
      </h2>
      <div className="astw:flex astw:overflow-hidden astw:rounded-lg astw:border astw:border-border">
        <FileList
          className="astw:w-44 astw:shrink-0 astw:border-r astw:border-border astw:p-2"
          aria-label="Example files"
        >
          {["pipeline.py", "helpers.py"].map((name) => (
            <FileListItem
              key={name}
              name={name}
              selected={file === name}
              icon={<FileCode2 size={13} />}
              onSelect={() => setFile(name)}
              actions={
                name === "helpers.py" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Remove example file"
                    onClick={() => setFile("pipeline.py")}
                  >
                    <X size={12} />
                  </Button>
                ) : undefined
              }
            />
          ))}
        </FileList>
        <div className="astw:min-w-0 astw:flex-1">
          <div style={{ height, display: "flex" }}>
            <CodeEditor
              value={source}
              onChange={setSource}
              disabled={false}
              label="Example Python code"
            />
          </div>
          <ResizeHandle
            orientation="horizontal"
            aria-label="Example editor height"
            aria-valuenow={height}
            aria-valuemin={120}
            aria-valuemax={360}
            onKeyDown={(event) => {
              if (["ArrowUp", "ArrowDown"].includes(event.key)) {
                event.preventDefault();
                setHeight((value) =>
                  Math.max(
                    120,
                    Math.min(360, value + (event.key === "ArrowUp" ? -20 : 20)),
                  ),
                );
              }
            }}
          />
          <LogViewer text={"Loaded 2 records\n<result> is plain text"} />
        </div>
      </div>
      <div className="astw:my-4 astw:flex astw:flex-wrap astw:items-center astw:gap-4">
        <WorkflowNode
          title="sale_order"
          subtitle="pipeline.py:12"
          icon={<FileCode2 size={15} />}
          status={<Badge variant="subtle-success">成功</Badge>}
          metric="2件 · 0.21s"
        />
        <span>
          <StatusDot tone="success" role="img" aria-label="同期成功" /> 同期成功
        </span>
        <Button
          variant="outline"
          onClick={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setCell({ left: rect.left, top: rect.top });
          }}
        >
          セル編集を開く
        </Button>
      </div>
      <DescriptionList.Root>
        <DescriptionList.Item label="状態">成功</DescriptionList.Item>
        <DescriptionList.Item label="実行ID">example-run</DescriptionList.Item>
        <DescriptionList.Item label="件数">2</DescriptionList.Item>
      </DescriptionList.Root>
      {cell && (
        <CellEditor
          anchor={cell}
          container={document.body}
          title={<code>name</code>}
          description="text"
          closeLabel="セル編集を閉じる"
          onClose={() => setCell(null)}
          actions={<Button onClick={() => setCell(null)}>閉じる</Button>}
        >
          <Textarea
            autoFocus
            aria-label="Example cell value"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </CellEditor>
      )}
    </section>
  );
}
