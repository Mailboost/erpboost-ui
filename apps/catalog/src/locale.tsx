import { createContext, useContext, useState, type ReactNode } from "react";
type Language = "en" | "ja";
const Locale = createContext({
  language: "en" as Language,
  setLanguage: (_: Language) => {},
});
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(() =>
    localStorage.getItem("erpboost-ui-language") === "ja" ? "ja" : "en",
  );
  function setLanguage(value: Language) {
    localStorage.setItem("erpboost-ui-language", value);
    updateLanguage(value);
    document.documentElement.lang = value;
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
