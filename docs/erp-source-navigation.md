# Source navigation composition

`@mailboost/erpboost-ui/source-navigation` exports SourceNavigation.Files and SourceNavigation.Tabs. Both consume the same readonly SourceFile list, selected name and onValueChange handler. Files composes existing CodeWorkspace, FileList, Button and Tooltip; Tabs composes CodeWorkspace.EditorTabs and Tabs. Existing primitives and CSS remain unchanged.

The caller supplies add/remove labels and callbacks, disabled action state, group/title, runtime metadata, tooltip container and optional inline editor content. Removal is only offered for files explicitly marked removable. File names are passed through exactly and rendered as text. Native action buttons do not submit a parent form; disabling mutations leaves file selection available.

No file validation, contents, suffix completion, file count limit, saving or selected-file fallback is implemented here. ERPBoost keeps those responsibilities in PythonPipelineEditor, including its protected pipeline.py and 16-file limit. The former file-list spacing/error-wrap CSS moves into this new composition; unused app styles are removed only after checking references.

Verification covers caller-controlled actions and selection, exact string names, parent-form isolation, disabled controls, draft preservation, long-name truncation and keyboard access to overflowing tabs at desktop/390px widths. It does not verify live Python execution or persistence.
