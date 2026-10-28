import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import type { AppInfo, RootConfiguration } from "./appshell-context";

/**
 * Context for static configuration (title, icon, configurations).
 * Changes to this context will cause RouterContainer to re-render.
 */
type AppShellConfigContextType = {
  title?: string;
  icon?: ReactNode;
  favicon?: string;
  appInfo?: AppInfo;
  configurations: RootConfiguration;
};

export const AppShellConfigContext = createContext<AppShellConfigContextType>({
  configurations: {
    modules: [],
    settingsResources: [],
    locale: DEFAULT_LOCALE,

    // Standalone controls only need configuration; AppShell supplies its
    // error boundary without importing router integrations into this context.
    errorBoundary: null!,
  },
});

/**
 * Hook to access only the static configuration.
 * Use this in components that don't need contextData to avoid unnecessary re-renders.
 */
export const useAppShellConfig = () => {
  return useContext(AppShellConfigContext);
};
