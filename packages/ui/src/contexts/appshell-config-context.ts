import {
  getLocalTimeZone,
  today,
  now,
  type CalendarDate,
  type ZonedDateTime,
} from "@internationalized/date";
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

/**
 * Returns the full BCP-47 locale (e.g. "en-GB") for Intl / date formatting.
 * Also returns the language code (e.g. "en") used for label resolution.
 *
 * Falls back to browser detection when used outside an AppShell.
 */
export const useResolvedLocale = (): { locale: string; language: string } => {
  const { configurations } = useContext(AppShellConfigContext);
  return {
    locale: configurations.resolvedLocale ?? configurations.locale,
    language: configurations.locale,
  };
};

/**
 * Resolved timezone object with helpers bound to the configured timezone.
 */
export interface TimeZone {
  /** Raw IANA timezone string (e.g. "America/Los_Angeles"). */
  value: string;
  /** Today's date in this timezone. */
  today: () => CalendarDate;
  /** Current instant in this timezone. */
  now: () => ZonedDateTime;
}

/**
 * Returns the configured timezone with bound `today()` and `now()` helpers.
 * Falls back to the user's local timezone when not configured.
 */
export const useTimeZone = (): TimeZone => {
  const { configurations } = useContext(AppShellConfigContext);
  const timeZone = configurations.timeZone ?? getLocalTimeZone();
  return {
    value: timeZone,
    today: () => today(timeZone),
    now: () => now(timeZone),
  };
};
