import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Check the archive a consumer installs, without the catalogue's source aliases.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = mkdtempSync(join(tmpdir(), "erpboost-ui-package-"));
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
try {
  const [archive] = JSON.parse(
    execFileSync(
      "npm",
      [
        "pack",
        "-w",
        "@mailboost/erpboost-ui",
        "--ignore-scripts",
        "--pack-destination",
        directory,
        "--json",
      ],
      { cwd: root, encoding: "utf8" },
    ),
  );
  const library = JSON.parse(
    readFileSync(join(root, "packages/ui/package.json"), "utf8"),
  );
  for (const path of Object.values(library.exports).flatMap((entry) =>
    typeof entry === "string" ? [entry] : [entry.types, entry.import],
  )) {
    assert(
      archive.files.some((file) => file.path === path.replace(/^\.\//, "")),
      `Package export missing from archive: ${path}`,
    );
  }
  writeFileSync(
    join(directory, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@mailboost/erpboost-ui": `file:${join(directory, archive.filename)}`,
        react: manifest.devDependencies.react,
        "react-dom": manifest.devDependencies["react-dom"],
      },
      devDependencies: Object.fromEntries(
        ["typescript", "vite", "@types/react", "@types/react-dom"].map(
          (name) => [name, manifest.devDependencies[name]],
        ),
      ),
    }),
  );
  writeFileSync(
    join(directory, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Bundler",
        jsx: "react-jsx",
        strict: true,
        skipLibCheck: true,
        noEmit: true,
      },
      include: ["src.tsx"],
    }),
  );
  writeFileSync(
    join(directory, "index.html"),
    '<div id="root"></div><script type="module" src="/src.tsx"></script>',
  );
  writeFileSync(
    join(directory, "src.tsx"),
    `
    import {createRoot} from "react-dom/client";
    import {AppShell,SidebarLayout,Button,Input,Sheet,ErpHeader,Skeleton,EmptyState} from "@mailboost/erpboost-ui";
    import "@mailboost/erpboost-ui/styles";
    function Sample(){return <><h1>External package</h1><Skeleton/><EmptyState title="No results"/><ErpHeader brand="ERP" organization={<ErpHeader.Trigger>Org</ErpHeader.Trigger>} connection={<ErpHeader.Loading label="Loading connection"/>}/><Button>Package button</Button><Input aria-label="Name"/><Sheet.Root><Sheet.Trigger>Open details</Sheet.Trigger><Sheet.Content><Sheet.Header><Sheet.Title>Package sheet</Sheet.Title></Sheet.Header><p>External consumer works.</p></Sheet.Content></Sheet.Root></>}
    createRoot(document.getElementById("root")!).render(<AppShell title="Package check" modules={[]} rootComponent={Sample} commandPalette={{routeOrder:"definition",showAppInfo:false}}><SidebarLayout/></AppShell>);
  `,
  );
  writeFileSync(
    join(directory, "vite.config.mjs"),
    "export default {build:{rolldownOptions:{checks:{moduleLevelDirective:false}}}};",
  );
  execFileSync(
    "npm",
    ["install", "--ignore-scripts", "--no-audit", "--no-fund"],
    { cwd: directory, stdio: "inherit" },
  );
  for (const [binary, args] of [
    ["tsc", ["--noEmit"]],
    ["vite", ["build"]],
  ]) {
    execFileSync(join(directory, "node_modules/.bin", binary), args, {
      cwd: directory,
      stdio: "inherit",
    });
  }
  // New components can be consumed individually without AppShell integrations.
  writeFileSync(join(directory, "src.tsx"), `
    import {createRoot} from "react-dom/client";
    import {Button} from "@mailboost/erpboost-ui/button";
    import {Input} from "@mailboost/erpboost-ui/input";
    import {LocaleProvider} from "@mailboost/erpboost-ui/locale-provider";
    import {SidebarPanel} from "@mailboost/erpboost-ui/shell-parts";
    import {Skeleton} from "@mailboost/erpboost-ui/skeleton";
    import {EmptyState} from "@mailboost/erpboost-ui/empty-state";
    import {Pagination} from "@mailboost/erpboost-ui/pagination";
    import {CodeWorkspace} from "@mailboost/erpboost-ui/code-workspace";
    import {CodeEditor} from "@mailboost/erpboost-ui/code-editor";
    import {FileList,FileListItem} from "@mailboost/erpboost-ui/file-list";
    import {LogViewer} from "@mailboost/erpboost-ui/log-viewer";
    import {ResizeHandle} from "@mailboost/erpboost-ui/resize-handle";
    import {GraphControls} from "@mailboost/erpboost-ui/graph-controls";
    import {CellEditor} from "@mailboost/erpboost-ui/cell-editor";
    import {DescriptionList} from "@mailboost/erpboost-ui/description-list";
    import {StatusDot} from "@mailboost/erpboost-ui/status-dot";
    import {WorkflowNode} from "@mailboost/erpboost-ui/workflow-node";
    import {SearchField} from "@mailboost/erpboost-ui/search-field";
    import {OptionCard} from "@mailboost/erpboost-ui/option-card";
    import {EditableGrid} from "@mailboost/erpboost-ui/editable-grid";
    import {RecordPanel,RecordPanelBody,RecordPanelFooter,RecordEditor} from "@mailboost/erpboost-ui/record-panel";
    import {LoadingPlaceholder,ConnectionsRowsSkeleton,ContextLoading} from "@mailboost/erpboost-ui/loading-layouts";
    import {WorkflowGraph} from "@mailboost/erpboost-ui/workflow-graph";
    import {ResourcePicker,LookupInput} from "@mailboost/erpboost-ui/resource-picker";
    import {ActionMenu,AccountMenu} from "@mailboost/erpboost-ui/action-menu";
    import {SensitiveInput} from "@mailboost/erpboost-ui/sensitive-input";
    import {ActionConfirmation} from "@mailboost/erpboost-ui/action-confirmation";
    import {CollectionLayout} from "@mailboost/erpboost-ui/collection-layout";
    import {FormGrid,DetailTable,RecordActions} from "@mailboost/erpboost-ui/record-layouts";
    import {HistoryList,HistoryEntry} from "@mailboost/erpboost-ui/record-history";
    import {ValueEditor} from "@mailboost/erpboost-ui/value-editor";
    import {WorkspaceFrame} from "@mailboost/erpboost-ui/workspace-frame";
    import {ResizeControl} from "@mailboost/erpboost-ui/resize-control";
    import {InlineCreate} from "@mailboost/erpboost-ui/inline-create";
    import {DataPreview} from "@mailboost/erpboost-ui/data-preview";
    import {ManagementLayout,ManagementTable,FormStack,SettingsList,SettingsRow,IdentityCell,ResponsiveLabel,SetupPanel} from "@mailboost/erpboost-ui/management-layout";
    import {StatusNotice} from "@mailboost/erpboost-ui/status-notice";
    import {PropertyRow,PropertySection,FormSection} from "@mailboost/erpboost-ui/property-layout";
    import {ResultPanel} from "@mailboost/erpboost-ui/result-panel";
    import {SettingsPanel} from "@mailboost/erpboost-ui/settings-panel";
    import {DetailPanel} from "@mailboost/erpboost-ui/detail-panel";
    import {TemplatePicker} from "@mailboost/erpboost-ui/template-picker";

    import "@mailboost/erpboost-ui/styles";
    createRoot(document.getElementById("root")!).render(<LocaleProvider locale="ja-JP">


      <ResourcePicker options={[]} value={null} selectedLabel="Choose" onSelect={()=>{}} trigger={<Button/>} triggerLabel="Choose resource" searchLabel="Search">Choose</ResourcePicker>
      <LookupInput value={null} label="Lookup" items={[]} search="" onSearchChange={()=>{}} onValueChange={()=>{}} triggerLabel="Show" clearLabel="Clear"/>
      <ActionMenu triggerLabel="Actions" menuLabel="Actions" items={[]}/><AccountMenu email="demo@example.invalid" triggerLabel={name=>name} menuLabel="Profile" items={[]}/>
      <SensitiveInput revealLabel="Show" concealLabel="Hide">{({type})=><Input type={type}/>}</SensitiveInput>
      <ActionConfirmation title="Confirm" cancelLabel="Cancel" confirmLabel="Continue" onCancel={()=>{}} onConfirm={()=>{}}>Confirm action</ActionConfirmation>
      <CollectionLayout.Root><CollectionLayout.Collection><CollectionLayout.Results>Rows</CollectionLayout.Results><CollectionLayout.Footer>Footer</CollectionLayout.Footer></CollectionLayout.Collection></CollectionLayout.Root>
      <FormGrid.Root><Input/><FormGrid.Full><Input/></FormGrid.Full></FormGrid.Root><DetailTable minWidth={600} columns={[]}>Rows</DetailTable><RecordActions status="Draft"><Button>Save</Button></RecordActions>
      <HistoryList><HistoryEntry status="Complete" dateTime="2026-10-29" timeLabel="Today">Result</HistoryEntry></HistoryList>
      <ValueEditor name="amount" description="Text" initialValue="0001" anchor={new DOMRect(0,0)} container={document.body} onSave={async()=>{}} onClose={()=>{}}/>
      <ManagementLayout.Root><ManagementLayout.Heading>Heading</ManagementLayout.Heading><ManagementLayout.Surface><ManagementLayout.Toolbar><ManagementLayout.Search><Input/></ManagementLayout.Search></ManagementLayout.Toolbar><ManagementTable.Root><ManagementTable.Head hideOnCompact>Column</ManagementTable.Head><ManagementTable.Cell muted>Value</ManagementTable.Cell></ManagementTable.Root></ManagementLayout.Surface></ManagementLayout.Root>
      <FormStack><SettingsList><SettingsRow label={<IdentityCell title="Member" description="Email"/>} control={<Input/>}/></SettingsList><ResponsiveLabel full="Add resource" compact="Add"/><SetupPanel title="Prepare"/></FormStack>
      <StatusNotice variant="success" dismiss={{label:"Dismiss",onDismiss:()=>{}}}>Done</StatusNotice>
      <FormSection legend="Properties"><PropertySection title="Optional"/><PropertyRow label="ID" description="Exact text"><Input value="0001" readOnly/></PropertyRow></FormSection>
      <ResultPanel.Root tabs={[{value:"data",label:"Data"}]} value="data" onValueChange={()=>{}} tabListLabel="Result views"><ResultPanel.Body><ResultPanel.Selection>Output</ResultPanel.Selection><ResultPanel.Details><ResultPanel.Item label="Run ID">0001</ResultPanel.Item></ResultPanel.Details><ResultPanel.Message><ResultPanel.ErrorText>Exact error</ResultPanel.ErrorText></ResultPanel.Message></ResultPanel.Body></ResultPanel.Root>
      <SettingsPanel title="Settings" closeLabel="Close" onClose={()=>{}} actions={<Button>Save</Button>}><Input/></SettingsPanel>
      <DetailPanel.Root title="Record" tabs={[{value:"details",label:"Details"}]} value="details" onValueChange={()=>{}} tabListLabel="Sections" onClose={()=>{}}><DetailPanel.Body>Record content</DetailPanel.Body></DetailPanel.Root>
      <TemplatePicker title="Templates" closeLabel="Close" options={[]} onChoose={()=>{}} onClose={()=>{}}/>
      <WorkspaceFrame.Root><WorkspaceFrame.Header>Header</WorkspaceFrame.Header><WorkspaceFrame.Sidebar>Sidebar</WorkspaceFrame.Sidebar><WorkspaceFrame.Workspace><WorkspaceFrame.ScrollArea><WorkspaceFrame.Content>Content</WorkspaceFrame.Content></WorkspaceFrame.ScrollArea></WorkspaceFrame.Workspace></WorkspaceFrame.Root>
      <ResizeControl orientation="horizontal" value={160} min={100} max={300} onValueChange={()=>{}} aria-label="Height"/>
      <InlineCreate label="Name" value="" onValueChange={()=>{}} onSubmit={()=>{}} onCancel={()=>{}} submitLabel="Create" cancelLabel="Cancel"/>
      <DataPreview label="Preview" rows={["0001"]} columns={[{id:"id",header:"ID",cell:row=>row}]}/>
      <LoadingPlaceholder/><ConnectionsRowsSkeleton/><ContextLoading label="Loading"/>
      <RecordPanel title="Info" onClose={()=>{}}><RecordPanelBody>Body</RecordPanelBody><RecordPanelFooter>Footer</RecordPanelFooter></RecordPanel>
      <RecordEditor title="Edit" isNew={false} busy={false} dirty={false} onClose={()=>{}}>Fields</RecordEditor>
      <EditableGrid model={{name:"items",primaryKeys:["id"],columns:[{name:"id",label:"ID",type:"text",editable:false}]}} data={[{id:"0001"}]} relations={[]} pending={false} fetching={false} onStateChange={()=>{}} onRefresh={()=>{}} onOpen={()=>{}} onSaveCell={async()=>{}} renderEditor={()=>null}/>
      <WorkflowGraph docked={false} steps={[{id:"items",title:"Items",subtitle:"Source",state:"idle",statusLabel:"Ready"}]} links={[]} onSelect={()=>{}}/>
      <SidebarPanel><SidebarPanel.Nav aria-label="Menu"><SidebarPanel.Label>Work</SidebarPanel.Label><SidebarPanel.Button active>Orders</SidebarPanel.Button></SidebarPanel.Nav><SidebarPanel.Footer><SidebarPanel.AccountTrigger><SidebarPanel.Identity name="Demo" description="Example"/></SidebarPanel.AccountTrigger></SidebarPanel.Footer></SidebarPanel>
      <Skeleton/><EmptyState title="No orders"><Button>Add</Button></EmptyState>
      <SearchField aria-label="Search" value="orders" onChange={()=>{}} clearLabel="Clear" onClear={()=>{}}/>
      <OptionCard title="Template" description="Use a template"/>
      <CodeWorkspace.PageHeader title={<Input value="Sync" onChange={()=>{}}/>}><Button>Save</Button></CodeWorkspace.PageHeader><CodeWorkspace.CodeToolbar caption="Python"/>
      <CodeWorkspace.Root><CodeWorkspace.Sidebar>Files</CodeWorkspace.Sidebar><CodeWorkspace.Main><CodeWorkspace.Editor><CodeEditor value="print(1)" disabled={false} onChange={()=>{}}/><CodeWorkspace.Results><CodeWorkspace.ResultsHeader>Logs</CodeWorkspace.ResultsHeader><CodeWorkspace.ResultsBody><LogViewer text="Loaded"/></CodeWorkspace.ResultsBody></CodeWorkspace.Results></CodeWorkspace.Editor><CodeWorkspace.Panel width={320}><CodeWorkspace.Header>Graph</CodeWorkspace.Header><GraphControls zoom={100} zoomOutLabel="Out" zoomInLabel="In" fitViewLabel="Fit" onZoomOut={()=>{}} onZoomIn={()=>{}} onFitView={()=>{}}/></CodeWorkspace.Panel></CodeWorkspace.Main></CodeWorkspace.Root>
      <FileList.Editor><Input aria-label="Filename"/><Button>Add file</Button></FileList.Editor><FileList><FileListItem name="pipeline.py" selected onSelect={()=>{}}/></FileList>
      <ResizeHandle orientation="horizontal" aria-label="Size"/><WorkflowNode title="orders" status={<StatusDot tone="success"/>}/>
      <DescriptionList.Root><DescriptionList.Item label="ID">1</DescriptionList.Item></DescriptionList.Root>
      <CellEditor anchor={{left:8,top:8}} container={document.body} title="name" closeLabel="Close" onClose={()=>{}}>Value</CellEditor>
      <Pagination currentPage={1} totalPages={1} hasPrevPage={false} hasNextPage={false} onFirstPage={()=>{}} onPreviousPage={()=>{}} onNextPage={()=>{}} onLastPage={()=>{}} pageSize={25} pageSizeOptions={[25,50]} onPageSizeChange={()=>{}} container={document.body}/>
    </LocaleProvider>);
  `);
  writeFileSync(join(directory, "vite.config.mjs"), `export default {
    plugins: [{name:"consumer-module-audit", generateBundle(){
      this.emitFile({type:"asset",fileName:"consumer-modules.json",source:JSON.stringify([...this.getModuleIds()])});
    }}],
    build:{rolldownOptions:{checks:{moduleLevelDirective:false}}}
  };`);
  for (const [binary, args] of [["tsc", ["--noEmit"]], ["vite", ["build"]]]) {
    execFileSync(join(directory, "node_modules/.bin", binary), args, {cwd: directory, stdio: "inherit"});
  }
  const moduleIds = JSON.parse(readFileSync(join(directory, "dist/consumer-modules.json"), "utf8"));
  for (const dependency of ["openai", "@tailor-platform/auth-public-client", "react-router"]) {
    assert(!moduleIds.some((id) => id.replaceAll("\\", "/").includes(`/node_modules/${dependency}/`)), `New components imported ${dependency}`);
  }
  console.log("Packed library: root API and standalone consumers passed; new components exclude auth, AI and router modules.");
} finally {
  if (process.env.KEEP_PACKAGE_CHECK === "1")
    console.log(`Consumer fixture retained: ${directory}`);
  else rmSync(directory, { recursive: true, force: true });
}
