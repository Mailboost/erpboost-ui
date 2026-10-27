import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@mailboost/erpboost-ui";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("json", json);

export default function HighlightedSource({
  source,
  language = "tsx",
}: {
  source: string;
  language?: string;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <div className="max-h-[640px] overflow-auto">
      <SyntaxHighlighter
        language={language}
        style={resolvedTheme === "dark" ? oneDark : oneLight}
        PreTag="div"
        customStyle={{
          background: "transparent",
          padding: "0.75rem 1rem",
          margin: 0,
          fontSize: "0.75rem",
        }}
        codeTagProps={{
          style: {
            whiteSpace: "pre",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            background: "transparent",
          },
        }}
      >
        {source}
      </SyntaxHighlighter>
    </div>
  );
}
