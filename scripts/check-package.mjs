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
    import {AppShell,SidebarLayout,Button,Input,Sheet,ErpHeader} from "@mailboost/erpboost-ui";
    import {DatePicker} from "@mailboost/erpboost-ui/date-field";
    import {Field} from "@mailboost/erpboost-ui/field";
    import "@mailboost/erpboost-ui/styles";
    function Sample(){return <><h1>External package</h1><Field.Root><Field.Label>Date</Field.Label><DatePicker/></Field.Root><Field.Root><Field.Label>Reference</Field.Label><Field.Control required/><Field.Description>Help</Field.Description><Field.Error/></Field.Root><ErpHeader brand="ERP" organization={<ErpHeader.Trigger>Org</ErpHeader.Trigger>} connection={<ErpHeader.Loading label="Loading connection"/>}/><Button>Package button</Button><Input aria-label="Name"/><Sheet.Root><Sheet.Trigger>Open details</Sheet.Trigger><Sheet.Content><Sheet.Header><Sheet.Title>Package sheet</Sheet.Title></Sheet.Header><p>External consumer works.</p></Sheet.Content></Sheet.Root></>}
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
  // Controls without legacy Field/DatePicker dependencies exclude AppShell integrations.
  // Those two unchanged entry points are exercised in the root fixture above.
  writeFileSync(join(directory, "src.tsx"), `
    import {createRoot} from "react-dom/client";
    import {Button} from "@mailboost/erpboost-ui/button";
    import {ErpHeader} from "@mailboost/erpboost-ui/erp-header";
    import {Input} from "@mailboost/erpboost-ui/input";
    import {Textarea} from "@mailboost/erpboost-ui/textarea";
    import {Table} from "@mailboost/erpboost-ui/table";
    import {Spinner} from "@mailboost/erpboost-ui/spinner";
    import {Badge} from "@mailboost/erpboost-ui/badge";
    import {Alert} from "@mailboost/erpboost-ui/alert";
    import {Checkbox} from "@mailboost/erpboost-ui/checkbox";
    import {Select} from "@mailboost/erpboost-ui/select";
    import {Combobox} from "@mailboost/erpboost-ui/combobox";
    import {Menu} from "@mailboost/erpboost-ui/menu";
    import {Tabs} from "@mailboost/erpboost-ui/tabs";
    import {Dialog} from "@mailboost/erpboost-ui/dialog";
    import {Sheet} from "@mailboost/erpboost-ui/sheet";
    import {Tooltip} from "@mailboost/erpboost-ui/tooltip";
    import {LocaleProvider} from "@mailboost/erpboost-ui/locale-provider";
    import {Avatar} from "@mailboost/erpboost-ui/avatar";
    import {Card} from "@mailboost/erpboost-ui/card";
    import {Skeleton} from "@mailboost/erpboost-ui/skeleton";
    import {HeaderBar,SidebarPanel} from "@mailboost/erpboost-ui/shell-parts";
    import {Toolbar} from "@mailboost/erpboost-ui/toolbar";
    import {Layout} from "@mailboost/erpboost-ui/layout";
    import {EmptyState} from "@mailboost/erpboost-ui/empty-state";
    import {CodeEditor} from "@mailboost/erpboost-ui/code-editor";
    import {FileList,FileListItem} from "@mailboost/erpboost-ui/file-list";
    import {ResizeHandle} from "@mailboost/erpboost-ui/resize-handle";
    import {WorkflowNode} from "@mailboost/erpboost-ui/workflow-node";
    import {LogViewer} from "@mailboost/erpboost-ui/log-viewer";
    import {CellEditor} from "@mailboost/erpboost-ui/cell-editor";
    import {StatusDot} from "@mailboost/erpboost-ui/status-dot";
    import {DescriptionList} from "@mailboost/erpboost-ui/description-list";
    import {CodeWorkspace} from "@mailboost/erpboost-ui/code-workspace";
    import {OptionCard} from "@mailboost/erpboost-ui/option-card";
    import {SearchField} from "@mailboost/erpboost-ui/search-field";
    import {GraphControls} from "@mailboost/erpboost-ui/graph-controls";
    import {Fieldset} from "@mailboost/erpboost-ui/fieldset";
    import {Pagination} from "@mailboost/erpboost-ui/pagination";
    import {ErdDiagram} from "@mailboost/erpboost-ui/erd-diagram";
    import {DatabaseWorkspace} from "@mailboost/erpboost-ui/database-workspace";
    import "@mailboost/erpboost-ui/styles";
    createRoot(document.getElementById("root")!).render(<LocaleProvider locale="ja-JP"><ErpHeader brand="ERP" organization={<ErpHeader.Trigger>Org</ErpHeader.Trigger>} connection={<ErpHeader.Loading label="Loading connection"/>}/><div className="page-heading"><Layout.Header title="Orders" actions={[<Button key="add">Add</Button>]}/></div><Toolbar.Row aria-label="Order actions"><Input aria-label="Search"/><Button>Refresh</Button></Toolbar.Row><EmptyState title="No orders" description="Add an order"><Button>Add</Button></EmptyState><CodeWorkspace.PageHeader title={<CodeWorkspace.TitleInput value="Sync" onChange={()=>{}}/>}><Button>Save</Button></CodeWorkspace.PageHeader><CodeWorkspace.CodeToolbar caption="Python"/><CodeWorkspace.Root><CodeWorkspace.Sidebar>Files</CodeWorkspace.Sidebar><CodeWorkspace.Main><CodeWorkspace.Editor><CodeWorkspace.Results><CodeWorkspace.ResultsHeader>Logs</CodeWorkspace.ResultsHeader><CodeWorkspace.ResultsBody>Result</CodeWorkspace.ResultsBody></CodeWorkspace.Results></CodeWorkspace.Editor><CodeWorkspace.Panel width={320}><CodeWorkspace.Header>Graph</CodeWorkspace.Header><GraphControls zoom={100} zoomOutLabel="Out" zoomInLabel="In" fitViewLabel="Fit" onZoomOut={()=>{}} onZoomIn={()=>{}} onFitView={()=>{}}/></CodeWorkspace.Panel></CodeWorkspace.Main></CodeWorkspace.Root><CodeEditor value="print(1)" disabled={false} onChange={()=>{}}/><FileList.Editor><Input aria-label="Filename"/><Button>Add file</Button></FileList.Editor><FileList><FileListItem name="pipeline.py" selected onSelect={()=>{}}/></FileList><ResizeHandle orientation="horizontal" aria-label="Size"/><WorkflowNode title="orders" status={<Badge>Success</Badge>}/><LogViewer text="Loaded"/><StatusDot tone="success"/><DescriptionList.Root><DescriptionList.Item label="ID">1</DescriptionList.Item></DescriptionList.Root><CellEditor anchor={{left:8,top:8}} container={document.body} title="name" closeLabel="Close" onClose={()=>{}}>Value</CellEditor><SearchField aria-label="Search" value="orders" onChange={()=>{}} clearLabel="Clear" onClear={()=>{}}/><HeaderBar layout="context"><HeaderBar.Brand>ERP</HeaderBar.Brand><HeaderBar.Separator/><HeaderBar.ContextItem><HeaderBar.ContextTrigger>Org</HeaderBar.ContextTrigger></HeaderBar.ContextItem></HeaderBar><OptionCard title="Template" description="Use a template"/><SidebarPanel><SidebarPanel.Nav aria-label="Menu"><SidebarPanel.Label>Work</SidebarPanel.Label><SidebarPanel.Button active>Orders</SidebarPanel.Button></SidebarPanel.Nav><SidebarPanel.Footer><SidebarPanel.AccountTrigger><SidebarPanel.Identity name="Demo" description="demo@example.com"/></SidebarPanel.AccountTrigger></SidebarPanel.Footer><Avatar.Root><Avatar.Fallback>AB</Avatar.Fallback></Avatar.Root></SidebarPanel><Card.Root><Card.Header title="Status" children={<Button>Refresh</Button>}/><Card.Content><Skeleton/></Card.Content></Card.Root><ErdDiagram schema={{models:[],relations:[]}}/><DatabaseWorkspace tables={[{name:"orders"}]} selectedTable="orders" openedTables={["orders"]} view="records" search="" sidebarOpen canCreate={false} onSearchChange={()=>{}} onSidebarOpenChange={()=>{}} onSelectTable={()=>{}} onCloseTable={()=>{}} onCloseDiagram={()=>{}} onCreateTable={()=>{}}><Badge>Draft</Badge><Alert.Root><Alert.Description>Saved</Alert.Description></Alert.Root></DatabaseWorkspace><Checkbox aria-label="Select"/><Select items={["a"]}/><Combobox items={["a"]}/><Menu.Root><Menu.Trigger>Menu</Menu.Trigger><Menu.Content container={document.body}><Menu.Item>Action</Menu.Item></Menu.Content></Menu.Root><Tabs.Root defaultValue="a"><Tabs.List><Tabs.Tab value="a">Tab</Tabs.Tab></Tabs.List></Tabs.Root><Dialog.Root><Dialog.Content container={document.body} showCloseButton={false}><Dialog.Header><Dialog.Title>Confirm</Dialog.Title></Dialog.Header><div>Fields</div><Dialog.Footer>Actions</Dialog.Footer></Dialog.Content></Dialog.Root><Sheet.Root><Sheet.Content container={document.body}><Sheet.Title>Details</Sheet.Title></Sheet.Content></Sheet.Root><Tooltip.Root><Tooltip.Trigger>Help</Tooltip.Trigger><Tooltip.Content container={document.body}>Help text</Tooltip.Content></Tooltip.Root><form><Table.Root><Table.Body><Table.Row><Table.Cell>1234567890.123456789</Table.Cell></Table.Row></Table.Body></Table.Root><Fieldset.Root><Fieldset.Legend>Connection</Fieldset.Legend><div><Input aria-label="Unchanged fieldset control"/></div></Fieldset.Root><Fieldset.Root><Input aria-label="Unchanged fieldset control"/></Fieldset.Root><Pagination currentPage={1} totalPages={1} hasPrevPage={false} hasNextPage={false} onFirstPage={()=>{}} onPreviousPage={()=>{}} onNextPage={()=>{}} onLastPage={()=>{}} pageSize={25} pageSizeOptions={[25,50]} onPageSizeChange={()=>{}} container={document.body}/><Input aria-label="Name"/><Textarea aria-label="Note"/><Button type="button">Save</Button><Spinner/><Table.Root><Table.Header><Table.Row><Table.Head>name <Badge>text</Badge></Table.Head></Table.Row></Table.Header><Table.Body><Table.Row><Table.Cell>Standalone</Table.Cell></Table.Row></Table.Body></Table.Root></form></LocaleProvider>);
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
    assert(!moduleIds.some((id) => id.replaceAll("\\", "/").includes(`/node_modules/${dependency}/`)), `Standalone controls imported ${dependency}`);
  }
  console.log("Packed library: root API and standalone consumers passed; controls exclude auth, AI and router modules.");
} finally {
  if (process.env.KEEP_PACKAGE_CHECK === "1")
    console.log(`Consumer fixture retained: ${directory}`);
  else rmSync(directory, { recursive: true, force: true });
}
