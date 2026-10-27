/**
 * Internal file-based routing implementation.
 *
 * This module is internal and should not be imported directly by users.
 * Use @mailboost/erpboost-ui for public types like AppShellPageProps.
 *
 * @internal
 */

// Types
export type {
  AppShellPageProps,
  PageComponent,
  PageEntry,
  VirtualPagesModule,
  AppShellRoutesPluginOptions,
  ValidationLevel,
  PathSegmentType,
} from "./types";

// Converter
export { convertPagesToModules, validateExclusiveRouteConfig } from "./converter";

// Typed paths
export { createTypedPaths } from "./typed-paths";
