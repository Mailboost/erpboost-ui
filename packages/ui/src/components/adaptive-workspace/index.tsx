import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { PanelLeft } from "lucide-react";
import { Button } from "../button";
import "./style.css";
const useLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;
export interface AdaptiveWorkspaceProps extends Omit<
  ComponentProps<"div">,
  "children" | "ref"
> {
  sidebar: ReactNode;
  children: ReactNode;
  navigationLabel: string;
  /** Uses this workspace's actual width, rather than the browser viewport. */
  compactBreakpoint?: number;
  /** A caller-owned navigation event key; a change collapses compact navigation. */
  collapseKey?: unknown;
}
/** Keeps sidebar and editor mounted while making narrow workspaces a single column. */
export function AdaptiveWorkspace({
  sidebar,
  children,
  navigationLabel,
  compactBreakpoint = 640,
  collapseKey,
  className = "",
  ...props
}: AdaptiveWorkspaceProps) {
  const root = useRef<HTMLDivElement>(null),
    navigation = useRef<HTMLDivElement>(null),
    toggle = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false),
    previousKey = useRef(collapseKey);
  const [compact, setCompact] = useState(false),
    [open, setOpen] = useState(false);
  const navigationId = useId();
  useLayout(() => {
    const element = root.current;
    if (!element) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      const next = element.getBoundingClientRect().width <= compactBreakpoint;
      if (
        next &&
        !open &&
        navigation.current?.contains(element.ownerDocument.activeElement)
      )
        restoreFocus.current = true;
      setCompact(next);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => {
        active = false;
        window.removeEventListener("resize", measure);
      };
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [compactBreakpoint, open]);
  useLayout(() => {
    if (compact && !open && restoreFocus.current) {
      restoreFocus.current = false;
      toggle.current?.focus();
    }
  }, [compact, open]);
  useEffect(() => {
    if (!Object.is(previousKey.current, collapseKey)) {
      previousKey.current = collapseKey;
      if (
        compact &&
        navigation.current?.contains(
          root.current?.ownerDocument.activeElement ?? null,
        )
      )
        toggle.current?.focus();
      setOpen(false);
    }
  }, [collapseKey, compact]);
  return (
    <div
      {...props}
      ref={root}
      className={`erpui-adaptive-workspace ${className}`}
      data-compact={compact || undefined}
    >
      {compact && (
        <div className="erpui-adaptive-workspace-bar">
          <Button
            ref={toggle}
            type="button"
            variant="ghost"
            size="sm"
            aria-controls={navigationId}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <PanelLeft size={14} aria-hidden="true" />
            <span>{navigationLabel}</span>
          </Button>
        </div>
      )}
      <div className="erpui-adaptive-workspace-body">
        <div
          id={navigationId}
          ref={navigation}
          className="erpui-adaptive-workspace-navigation"
          hidden={compact && !open}
        >
          {sidebar}
        </div>
        <div className="erpui-adaptive-workspace-main">{children}</div>
      </div>
    </div>
  );
}
