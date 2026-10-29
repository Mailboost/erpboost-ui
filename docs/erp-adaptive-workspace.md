# AdaptiveWorkspace

`@mailboost/erpboost-ui/adaptive-workspace` adds a layout around caller-supplied sidebar and editor content. Existing CodeWorkspace, SourceNavigation, Button and editor components remain unchanged.

The sidebar is inline in wide containers. At the configured `compactBreakpoint` (default 640px), measured with ResizeObserver against the workspace itself, a `navigationLabel` disclosure button toggles the sidebar above the editor. Navigation has a bounded scroll area. The sidebar and main children stay mounted throughout toggling/resizing, preserving unsaved text, input state and editor state. No modal or duplicate sidebar is introduced.

The button has type=button, aria-expanded and aria-controls. Resizing a focused inline sidebar into a closed compact one restores focus to its toggle. An optional caller-owned `collapseKey` closes compact navigation on selection; existing caller editor focus is preserved. Window resize is a fallback when ResizeObserver is unavailable.

ERPBoost passes its existing file sidebar and CodeWorkspace.Main, with the code-focus request as collapseKey. Selecting a file returns to the full-width editor; opening/closing navigation does not save, execute or clear pending filename/code values. File validation, limits, contents, selection, permissions and all requests remain in the app.
