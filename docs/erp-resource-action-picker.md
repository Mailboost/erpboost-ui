# ResourceActionPicker

`@mailboost/erpboost-ui/resource-action-picker` adds a composition around the unchanged ResourcePicker. It accepts the same ResourcePickerProps and preserves the supplied trigger, its ref, selected IDs, search, options, labels, portal container and disabled actions.

Creation (`action.onSelect`) and rename (`onRename`) callbacks run after the trigger's own popup finishes its finite closing animations and restores focus. There are no fixed-duration timers and no query for the first popup in a shared portal. Ordinary selection (`onSelect`) remains immediate.

Repeated pending actions are coalesced. Unmounting cancels the deferred callback. At completion it also checks for a reopened popup, a changed selection and disabled picker/action. Infinite decorative animations do not block it. Input mounting and autofocus belong to the caller, along with names, validation, permissions, selected resources, dirty-state confirmation, routing and API calls.

ERPBoost uses this for pipeline creation/rename and organization/connection management actions. The PipelinePicker adapter no longer queries DOM classes, waits for animations or tracks its own mounted state. All library sources present at the start of this addition remain unchanged; only the root export is appended.
