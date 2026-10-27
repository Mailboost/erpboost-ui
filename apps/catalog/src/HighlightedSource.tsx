import { Highlight, themes } from "prism-react-renderer";
import { useTheme } from "@mailboost/erpboost-ui";

export default function HighlightedSource({
  source,
  language = "tsx",
}: {
  source: string;
  language?: string;
}) {
  const { resolvedTheme } = useTheme();
  return (
    <Highlight
      code={source}
      language={language}
      theme={resolvedTheme === "dark" ? themes.oneDark : themes.oneLight}
    >
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre style={{ color: style.color }}>
          <code>
            {tokens.map((line, index) => (
              <div key={index} {...getLineProps({ line })}>
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  );
}
