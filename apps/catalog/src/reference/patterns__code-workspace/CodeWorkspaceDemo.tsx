import { useState } from "react";
import {
  CodeWorkspace,
  CodeEditor,
  FileList,
  FileListItem,
  ResizeHandle,
  GraphControls,
  WorkflowNode,
  LogViewer,
  Badge,
  Button,
  Dialog,
  Sheet,
} from "@mailboost/erpboost-ui";
import { FileCode2, FolderOpen, Workflow, X } from "lucide-react";
export function CodeWorkspaceDemo() {
  const [code, setCode] = useState("def run():\n    return []\n"),
    [height, setHeight] = useState(150),
    [width, setWidth] = useState(320),
    [zoom, setZoom] = useState(100),
    [docked, setDocked] = useState(true),
    [modal, setModal] = useState(false),
    [sheet, setSheet] = useState(false);
  return (
    <>
      <div className="astw:h-[600px] astw:overflow-hidden astw:rounded-lg astw:border astw:border-border astw:flex">
        <CodeWorkspace.Root>
          <CodeWorkspace.Sidebar aria-label="サンプルのファイル">
            <CodeWorkspace.Header icon={<FolderOpen size={13} />}>
              パイプライン
            </CodeWorkspace.Header>
            <FileList>
              <FileListItem
                name="pipeline.py"
                selected
                icon={<FileCode2 size={13} />}
                onSelect={() => {}}
              />
            </FileList>
          </CodeWorkspace.Sidebar>
          <CodeWorkspace.Main>
            <CodeWorkspace.Editor>
              <CodeWorkspace.EditorTabs>
                <span className="astw:px-3">pipeline.py</span>
                <small>Python 3.13</small>
              </CodeWorkspace.EditorTabs>
              <CodeEditor
                value={code}
                disabled={false}
                onChange={setCode}
                label="サンプルPythonコード"
              />
              <ResizeHandle
                orientation="horizontal"
                aria-label="サンプル結果パネルの高さ"
                aria-valuenow={height}
                aria-valuemin={130}
                aria-valuemax={300}
                onPointerDown={(event) =>
                  event.currentTarget.setPointerCapture(event.pointerId)
                }
                onPointerMove={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId))
                    setHeight((v) =>
                      Math.max(130, Math.min(300, v - event.movementY)),
                    );
                }}
                onKeyDown={(event) => {
                  if (["ArrowUp", "ArrowDown"].includes(event.key)) {
                    event.preventDefault();
                    setHeight((v) =>
                      Math.max(
                        130,
                        Math.min(300, v + (event.key === "ArrowUp" ? 20 : -20)),
                      ),
                    );
                  }
                }}
              />
              <CodeWorkspace.Results
                style={{ height }}
                aria-label="サンプル実行結果"
              >
                <CodeWorkspace.ResultsHeader
                  actions={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDocked((v) => !v)}
                    >
                      {docked ? "グラフを閉じる" : "グラフを右に表示"}
                    </Button>
                  }
                >
                  <span className="astw:self-center astw:text-xs">
                    実行ログ
                  </span>
                </CodeWorkspace.ResultsHeader>
                <CodeWorkspace.ResultsBody>
                  <LogViewer text="Loaded 2 records" />
                </CodeWorkspace.ResultsBody>
              </CodeWorkspace.Results>
            </CodeWorkspace.Editor>
            {docked && (
              <CodeWorkspace.Panel width={width} aria-label="サンプルグラフ">
                <ResizeHandle
                  orientation="vertical"
                  aria-label="サンプルグラフの幅"
                  aria-valuemin={260}
                  aria-valuemax={500}
                  aria-valuenow={width}
                  onKeyDown={(event) => {
                    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
                      event.preventDefault();
                      setWidth((v) =>
                        Math.max(
                          260,
                          Math.min(
                            500,
                            v + (event.key === "ArrowLeft" ? 20 : -20),
                          ),
                        ),
                      );
                    }
                  }}
                />
                <CodeWorkspace.Header
                  icon={<Workflow size={13} />}
                  actions={
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="サンプルグラフを閉じる"
                      onClick={() => setDocked(false)}
                    >
                      <X size={13} />
                    </Button>
                  }
                >
                  パイプライングラフ
                </CodeWorkspace.Header>
                <div className="astw:relative astw:flex astw:items-center astw:justify-center astw:overflow-hidden">
                  <div style={{ transform: `scale(${zoom / 100})` }}>
                    <WorkflowNode
                      title="sale_order"
                      subtitle="pipeline.py:1"
                      status={<Badge variant="subtle-success">成功</Badge>}
                      metric="2件"
                    />
                  </div>
                  <GraphControls
                    className="astw:absolute astw:bottom-3 astw:right-3"
                    aria-label="サンプルグラフの操作"
                    zoom={zoom}
                    minZoom={20}
                    maxZoom={150}
                    zoomOutLabel="サンプルグラフを縮小"
                    zoomInLabel="サンプルグラフを拡大"
                    fitViewLabel="サンプルグラフを全体表示"
                    onZoomOut={() => setZoom((v) => Math.max(20, v - 20))}
                    onZoomIn={() => setZoom((v) => Math.min(150, v + 20))}
                    onFitView={() => setZoom(100)}
                  />
                </div>
              </CodeWorkspace.Panel>
            )}
          </CodeWorkspace.Main>
        </CodeWorkspace.Root>
      </div>
      <div className="astw:mt-4 astw:flex astw:gap-2">
        <Button variant="outline" onClick={() => setModal(true)}>
          区切り付きダイアログ
        </Button>
        <Button variant="outline" onClick={() => setSheet(true)}>
          区切り付き右パネル
        </Button>
      </div>
      <Dialog.Root open={modal} onOpenChange={setModal}>
        <Dialog.Content layout="sectioned" showCloseButton={false}>
          <Dialog.Header
            action={
              <Button
                variant="ghost"
                aria-label="サンプルダイアログを閉じる"
                onClick={() => setModal(false)}
              >
                <X />
              </Button>
            }
          >
            <Dialog.Title>操作の確認</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <p>表示部品は共通化し、操作はアプリが制御します。</p>
          </Dialog.Body>
          <Dialog.Footer>
            <Button variant="outline" onClick={() => setModal(false)}>
              閉じる
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
      <Sheet.Root open={sheet} onOpenChange={setSheet}>
        <Sheet.Content layout="sectioned">
          <Sheet.Header>
            <Sheet.Title>設定</Sheet.Title>
          </Sheet.Header>
          <Sheet.Body>
            <p>右パネルの本文は独立してスクロールします。</p>
          </Sheet.Body>
          <Sheet.Footer>
            <Button onClick={() => setSheet(false)}>閉じる</Button>
          </Sheet.Footer>
        </Sheet.Content>
      </Sheet.Root>
    </>
  );
}
