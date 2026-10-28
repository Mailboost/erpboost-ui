import type { ReactNode } from "react";
import {
  AppShellConfigContext,
  useAppShellConfig,
} from "@/contexts/appshell-config-context";
import { toLanguageSubtag } from "@/lib/i18n";

/** Set the existing label locale without mounting AppShell or its router. */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const context = useAppShellConfig();
  return (
    <AppShellConfigContext.Provider
      value={{
        ...context,
        configurations: {
          ...context.configurations,
          locale: toLanguageSubtag(locale),
          resolvedLocale: locale,
        },
      }}
    >
      {children}
    </AppShellConfigContext.Provider>
  );
}
