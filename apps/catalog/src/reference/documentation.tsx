import { Translated } from "./shared/component-language";
import { useEffect, useState, type ReactNode } from "react";
import {
  Card,
  SidebarGroup,
  SidebarItem,
  SidebarSeparator,
  useTheme,
} from "@mailboost/erpboost-ui";
const Doc = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) => (
  <Translated>
    <Card.Root>
      <Card.Header title={title} description={description} />
      {children && <Card.Content>{children}</Card.Content>}
    </Card.Root>
  </Translated>
);
const groups = [
  {
    title: "Surfaces",
    description:
      "Backgrounds and surface colors for the page, cards, popovers, and muted regions.",
    tokens: [
      "background / foreground",
      "card / card-foreground",
      "popover / popover-foreground",
      "muted / muted-foreground",
      "accent / accent-foreground",
    ],
  },
  {
    title: "Brand",
    description:
      "Primary, secondary, and destructive accents. Pair foreground tokens with their counterpart for accessible contrast.",
    tokens: [
      "primary / primary-foreground",
      "secondary / secondary-foreground",
      "destructive / destructive-foreground",
    ],
  },
  {
    title: "Border / Input / Ring",
    description: "Outline and focus colors used by form primitives.",
    tokens: ["border", "input", "ring"],
  },
  {
    title: "Status",
    description:
      "Use these instead of palette colors (emerald-500, rose-500, amber-500) for state UI.",
    tokens: [
      "status-default",
      "status-neutral",
      "status-completed",
      "status-attention",
      "status-danger",
    ],
  },
  {
    title: "Charts",
    description: "Sequential palette for chart series.",
    tokens: ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5"],
  },
  {
    title: "Sidebar",
    description:
      "Sidebar-specific tokens. Apply on SidebarLayout / DefaultSidebar surfaces.",
    tokens: [
      "sidebar / sidebar-foreground",
      "sidebar-primary / sidebar-primary-foreground",
      "sidebar-accent / sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ],
  },
  {
    title: "Radius",
    description: "Corner radius scale, derived from --radius.",
    tokens: ["radius-sm", "radius-md", "radius-lg", "radius-xl"],
  },
];
function formatTokenValue(value: string) {
  const rgba = value.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/,
  );
  if (!rgba) return value === "#ffffff" ? "#fff" : value;
  const channels = rgba.slice(1, 4).map(Number);
  if (rgba[4] && Number(rgba[4]) < 1) {
    channels.push(Math.round(Number(rgba[4]) * 255));
  }
  const hex = "#" + channels.map((v) => v.toString(16).padStart(2, "0")).join("");
  return hex === "#ffffff" ? "#fff" : hex;
}
function Token({ label }: { label: string }) {
  const token = label.split(" / ")[0];
  const variable = token.startsWith("status-") ? "color-" + token : token;
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(
      token.startsWith("radius-")
        ? ({
            "radius-sm": "calc(.625rem - 4px)",
            "radius-md": "calc(.625rem - 2px)",
            "radius-lg": ".625rem",
            "radius-xl": "calc(.625rem + 4px)",
          }[token] ?? "")
        : formatTokenValue(
            getComputedStyle(document.documentElement)
              .getPropertyValue("--" + variable)
              .trim(),
          ),
    );
  }, [variable, resolvedTheme]);
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div
        className="size-14 shrink-0 rounded-md border"
        aria-hidden
        style={
          token.startsWith("radius-")
            ? { borderRadius: `var(--${token})`, background: "var(--muted)" }
            : { background: `var(--${variable})` }
        }
      />
      <div className="min-w-0 space-y-0.5">
        <div className="font-mono text-xs font-medium">{label}</div>
        <div className="truncate font-mono text-xs text-muted-foreground">
          var(--{variable})
        </div>
        <div className="truncate font-mono text-[10px] text-muted-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}
export function Foundation() {
  return (
    <div className="space-y-8">
      <Doc
        title="How to use"
        description="Refer to tokens through Tailwind utilities; never reach for raw palette colors."
      >
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
          {
            '/* Good — references the token via Tailwind utility */\n<div className="bg-card text-card-foreground border" />\n<div className="bg-status-completed" />\n\n/* Bad — bypasses tokens with a palette color */\n<div className="bg-white text-neutral-900 border-neutral-200" />\n<div className="bg-emerald-500" />'
          }
        </pre>
      </Doc>
      {groups.map((g) => (
        <Doc key={g.title} title={g.title} description={g.description}>
          <div className="grid gap-2 md:grid-cols-2">
            {g.tokens.map((t) => (
              <Token key={t} label={t} />
            ))}
          </div>
        </Doc>
      ))}
    </div>
  );
}
const rootCard = (
  <Doc
    title="Composition Level Component"
    description="This export is used at the application shell level rather than as a leaf widget."
  >
    <p className="text-sm text-muted-foreground">
      This catalogue also uses it at the application root.
    </p>
  </Doc>
);
export function SidebarDocs() {
  return (
    <Translated>
      <div className="space-y-10">
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">SidebarLayout</h2>
            <p className="text-sm text-muted-foreground">
              Main application layout that positions sidebar and content.
            </p>
          </div>
          {rootCard}
          <Doc
            title="Header slot"
            description="Extend or replace the built-in top bar via the header prop and SidebarLayout.DefaultHeader."
          >
            <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
              {
                '<SidebarLayout\n  header={\n    <SidebarLayout.DefaultHeader\n      actions={[\n        <NotificationBell key="bell" />,\n        <AppearanceSwitcher key="appearance" />,\n      ]}\n    />\n  }\n/>'
              }
            </pre>
            <p className="mt-3 text-sm text-muted-foreground">
              actions defaults to [&lt;AppearanceSwitcher /&gt;]; passing
              actions replaces the whole cluster, so include AppearanceSwitcher
              explicitly to keep it.
            </p>
          </Doc>
          <Doc
            title="useAppShellScrollContainer"
            description="Returns a ref to the element that actually scrolls now that the shell is viewport-bounded. Use it instead of window/document scroll."
          >
            <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
              {
                'const scrollRef = useAppShellScrollContainer();\n\nuseEffect(() => {\n  const el = scrollRef.current;\n  if (!el) return;\n  const onScroll = () => setProgress(el.scrollTop);\n  el.addEventListener("scroll", onScroll, { passive: true });\n  return () => el.removeEventListener("scroll", onScroll);\n}, [scrollRef]);'
              }
            </pre>
          </Doc>
        </section>
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">DefaultSidebar</h2>
            <p className="text-sm text-muted-foreground">
              Default navigation UI rendered inside SidebarLayout.
            </p>
          </div>
          {rootCard}
        </section>
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Group / Item / Separator</h2>
            <p className="text-sm text-muted-foreground">
              The building blocks rendered inside a sidebar: groups of items,
              individual navigable items, and dividers between them.
            </p>
          </div>
          <Doc
            title="Preview"
            description="SidebarGroup wraps a titled section; SidebarItem is a single link; SidebarSeparator divides sections."
          >
            <div className="max-w-sm rounded-xl border p-3">
              <SidebarGroup title={() => "Components"} defaultOpen={false}>
                <SidebarItem to="/components/button" />
                <SidebarItem to="/components/table" />
              </SidebarGroup>
            </div>
          </Doc>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["SidebarGroup", "Sidebar navigation group wrapper."],
              ["SidebarItem", "Single navigable item inside the sidebar."],
              ["SidebarSeparator", "Visual separator between sidebar items."],
            ].map(([title, description]) => (
              <Doc key={title} title={title} description={description}>
                <p className="text-xs text-muted-foreground">
                  See the preview above for this primitive in context.
                </p>
              </Doc>
            ))}
          </div>
        </section>
      </div>
    </Translated>
  );
}
