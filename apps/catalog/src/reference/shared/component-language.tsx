import {
  createContext,
  useContext,
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";
import { useLocale } from "../../locale";
import translations from "../component-translations.json";
const Dictionary = createContext<Record<string, string>>({});
export function ComponentLanguage({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const { language } = useLocale();
  const dict =
    language === "ja"
      ? ((translations as Record<string, Record<string, string>>)[slug] ?? {})
      : {};
  return <Dictionary value={dict}>{children}</Dictionary>;
}
function translate(node: ReactNode, dict: Record<string, string>): ReactNode {
  return Children.map(node, (child) => {
    if (typeof child === "string") return dict[child] ?? child;
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<Record<string, unknown>>;
    const props: Record<string, unknown> = {};
    for (const name of ["title", "description", "placeholder"]) {
      const value = element.props[name];
      if (typeof value === "string" && dict[value]) props[name] = dict[value];
    }
    if (element.props.children !== undefined)
      props.children = translate(element.props.children as ReactNode, dict);
    return cloneElement(element, props);
  });
}
export function Translated({ children }: { children: ReactNode }) {
  const dict = useContext(Dictionary);
  return <>{translate(children, dict)}</>;
}
