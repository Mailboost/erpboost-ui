import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { AppShellInternal } from "../packages/ui/src/components/appshell/appshell";
import {
  SidebarLayout,
  defineModule,
  useOpenCommandPalette,
} from "@mailboost/erpboost-ui";
import type { AppInfo } from "../packages/ui/src/contexts/appshell-context";

function SearchTrigger() {
  const open = useOpenCommandPalette();
  return <button onClick={() => open()}>Open search</button>;
}

const modules = [
  defineModule({
    path: "",
    meta: { title: "Home" },
    resources: [],
    component: () => <h1>Home</h1>,
  }),
];
function app(appInfo?: AppInfo, path = "/__appinfo") {
  return render(
    <AppShellInternal
      title="Example"
      modules={modules}
      locale="en"
      appInfo={appInfo}
      memory
      initialEntries={[path]}
    >
      <SidebarLayout.Outlet />
      <SearchTrigger />
    </AppShellInternal>,
  );
}

it("preserves the default app-info route and metadata for library consumers", async () => {
  app({ metadata: [{ label: "Release", value: "test-release" }] });
  expect(await screen.findByRole("heading", { name: "App info" })).toBeTruthy();
  expect(screen.getByText("test-release")).toBeTruthy();
});

it("returns the normal not-found view when app-info is disabled", async () => {
  app({ enabled: false });
  expect(
    await screen.findByRole("heading", { name: "404 Not Found" }),
  ).toBeTruthy();
  expect(screen.queryByRole("heading", { name: "App info" })).toBeNull();
});

it.each([true, false])(
  "keeps the search entry consistent with enabled=%s",
  async (enabled) => {
    app({ enabled }, "/");
    await screen.findByRole("heading", { name: "Home" });
    fireEvent.click(screen.getByRole("button", { name: "Open search" }));
    const dialog = await screen.findByRole("dialog");
    await within(dialog).findByText("Home", { exact: true });
    const info = within(dialog).queryByText("App info", { exact: true });
    expect(Boolean(info)).toBe(enabled);
  },
);
