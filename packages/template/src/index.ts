// Types
export * from "./types";

// Store
export {
  useTemplateStore,
  type TemplateStore,
  type TemplateStoreData,
} from "./store/useTemplateStore";

// Components: Data Table
export {
  TemplatesTable,
  useTemplateColumns,
  type TemplatesTableProps,
} from "./components/data-table";

// Components: Editor & Visualizer
export { TemplateEditor } from "./components/editor";
export { TemplateVisualizer } from "./components/visualizer";

// Components: Forms
export {
  TemplateCreateForm,
  TemplateUpdateForm,
  useCreateTemplateFormStructure,
  useUpdateTemplateFormStructure,
} from "./components/forms";

// Components: Modals & Sheets
export {
  useTemplateDeleteDialog,
  useTemplatePreviewSheet,
  useTemplateCreateSheet,
  useTemplateUpdateSheet,
  type TemplateDeleteDialogProps,
  type TemplatePreviewSheetProps,
  type TemplateCreateSheetProps,
  type TemplateUpdateSheetProps,
} from "./components/modals";

// Portals & Views
export {
  TemplatesPortal,
  TemplateCreatePortal,
  TemplateEditPortal,
} from "./portals";

