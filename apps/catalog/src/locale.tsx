import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
type Language = "en" | "ja";
const languageKey = "erpboost-ui-language";
function readLanguage(): Language {
  try {
    return localStorage.getItem(languageKey) === "ja" ? "ja" : "en";
  } catch {
    return "en";
  }
}
const Locale = createContext({
  language: "en" as Language,
  setLanguage: (_: Language) => {},
});
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(readLanguage);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === languageKey || event.key === null)
        updateLanguage(readLanguage());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  function setLanguage(value: Language) {
    try {
      localStorage.setItem(languageKey, value);
    } catch {
      // The current tab still works when browser storage is unavailable.
    }
    updateLanguage(value);
  }
  return <Locale value={{ language, setLanguage }}>{children}</Locale>;
}
export function useLocale() {
  const state = useContext(Locale);
  return {
    ...state,
    t: (en: string, ja: string) => (state.language === "ja" ? ja : en),
  };
}
