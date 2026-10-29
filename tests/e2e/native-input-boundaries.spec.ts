import { expect, test, type CDPSession, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

type NativeObservedEvent = {
  name: string;
  trusted: boolean;
  pointerType?: string;
  files?: { name: string; size: number; type: string }[];
  target?: string;
};
type AuditWindow = Window & { nativeInputAudit: NativeObservedEvent[] };
const errors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const messages: string[] = [];
  errors.set(page, messages);
  page.on("pageerror", (error) => messages.push(error.message));
});
test.afterEach(async ({ page }, info) => {
  await info.attach("final-state", {
    body: await page.screenshot({ animations: "disabled" }),
    contentType: "image/png",
  });
  await info.attach("accessible-state", {
    body: await page.locator("body").ariaSnapshot(),
    contentType: "text/plain",
  });
  expect(errors.get(page)).toEqual([]);
});

async function settleSheet(page: Page) {
  await page.evaluate(async () => {
    let previous = "",
      changed = performance.now();
    const start = changed;
    while (performance.now() - start < 5000) {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      const element = document.querySelector('[data-slot="sheet-content"]');
      const rect = element?.getBoundingClientRect();
      const current =
        element && rect
          ? [
              rect.x,
              rect.y,
              rect.width,
              rect.height,
              getComputedStyle(element).transform,
            ].join(",")
          : "closed";
      if (current !== previous) {
        previous = current;
        changed = performance.now();
      }
      if (performance.now() - changed >= 200) return;
    }
    throw new Error("Sheet position did not settle within 5 seconds");
  });
}

async function touch(
  cdp: CDPSession,
  type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
  point?: { x: number; y: number },
) {
  await cdp.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: point
      ? [{ ...point, id: 1, radiusX: 2, radiusY: 2, force: 1 }]
      : [],
  });
}

for (const mode of [
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
  },
  {
    name: "tablet light",
    viewport: { width: 768, height: 1024 },
    colorScheme: "light" as const,
  },
]) {
  test.describe(mode.name, () => {
    test.use({
      viewport: mode.viewport,
      colorScheme: mode.colorScheme,
      hasTouch: true,
      isMobile: true,
    });
    test("native touch swipes dismiss only in the closing direction and cancellation restores the panel", async ({
      page,
      context,
    }, info) => {
      // Five gestures include real duration and the opening/return transitions.
      test.setTimeout(60_000);
      await page.goto("components/sheet?preview=fullscreen");
      const cdp = await context.newCDPSession(page);
      const trigger = page.getByRole("button", {
        name: "Open sheet",
        exact: true,
      });
      const panel = page.getByRole("dialog", {
        name: "Approval detail",
        exact: true,
      });
      await page.evaluate(() => {
        const state = window as unknown as AuditWindow;
        state.nativeInputAudit = [];
        for (const name of [
          "pointerdown",
          "pointermove",
          "pointerup",
          "pointercancel",
          "touchstart",
          "touchmove",
          "touchend",
          "touchcancel",
        ]) {
          document.addEventListener(
            name,
            (event) =>
              state.nativeInputAudit.push({
                name,
                trusted: event.isTrusted,
                pointerType:
                  event instanceof PointerEvent ? event.pointerType : undefined,
              }),
            true,
          );
        }
      });
      for (const [name, dx, dy, cancel] of [
        ["short", 24, 0, false],
        ["reverse", -100, 0, false],
        ["vertical", 0, 160, false],
        ["cancel", 80, 0, true],
        ["dismiss", 210, 0, false],
      ] as const) {
        await trigger.tap();
        await expect(panel).toBeVisible();
        await settleSheet(page);
        const before = (await panel.boundingBox())!;
        const start = { x: before.x + 32, y: 180 };
        await page.evaluate(() => {
          (window as unknown as AuditWindow).nativeInputAudit = [];
        });
        await touch(cdp, "touchStart", start);
        for (let step = 1; step <= 12; step++) {
          // Gesture duration is part of the input: avoid a fast fling turning
          // a deliberately short drag into a valid velocity-based dismissal.
          await new Promise((resolve) => setTimeout(resolve, 25));
          await touch(cdp, "touchMove", {
            x: Math.max(
              2,
              Math.min(mode.viewport.width - 2, start.x + (dx * step) / 12),
            ),
            y: start.y + (dy * step) / 12,
          });
        }
        await page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve()),
              ),
            ),
        );
        const movement = await panel.evaluate(
          (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41,
        );
        if (name === "vertical") expect(movement).toBe(0);
        else if (name === "reverse") expect(movement).toBeLessThan(0);
        else expect(movement).toBeGreaterThan(0);
        await touch(cdp, cancel ? "touchCancel" : "touchEnd");
        await settleSheet(page);
        const events = await page.evaluate(
          () => (window as unknown as AuditWindow).nativeInputAudit,
        );
        expect(events.length).toBeGreaterThan(0);
        expect(events.every((event) => event.trusted)).toBe(true);
        expect(events.some((event) => event.pointerType === "touch")).toBe(
          true,
        );
        expect(
          events.some(
            (event) => event.name === (cancel ? "touchcancel" : "touchend"),
          ),
        ).toBe(true);
        await info.attach(`touch-${name}`, {
          body: JSON.stringify({ before, movement, events }),
          contentType: "application/json",
        });
        if (name === "dismiss") {
          await expect(panel).not.toBeVisible();
          await expect(trigger).toBeFocused();
          await expect(page.locator("body")).toHaveCSS(
            "pointer-events",
            "auto",
          );
        } else {
          await expect(panel).toBeVisible();
          expect(await panel.boundingBox()).toEqual(before);
          await page.keyboard.press("Escape");
          await expect(panel).not.toBeVisible();
        }
      }
      // Verify that background input actually works after gesture dismissal.
      await trigger.tap();
      await expect(panel).toBeVisible();
      await panel.getByRole("button", { name: "Close", exact: true }).tap();
      await expect(panel).not.toBeVisible();
    });
  });
}

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
  },
  {
    name: "narrow dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
  },
]) {
  test.describe(mode.name, () => {
    test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });
    test("native file drag preserves nested hover, clears on cancellation and appends decoded attachments in order", async ({
      page,
      context,
    }, info) => {
      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==",
        "base64",
      );
      await mkdir(info.outputPath(), { recursive: true });
      const files = [
        info.outputPath("drop-図.png"),
        info.outputPath("drop-手順.txt"),
      ];
      await writeFile(files[0], png);
      await writeFile(files[1], "Native browser drag audit\n");
      await page.goto("components/attachment?preview=fullscreen");
      const cdp = await context.newCDPSession(page);
      const tile = page.getByRole("button", {
        name: "Drop files or click to upload",
        exact: true,
      });
      const items = page.getByRole("button", {
        name: /^Attachment options for/,
      });
      await tile.scrollIntoViewIfNeeded();
      const box = (await tile.boundingBox())!;
      const originalBorder = await tile.evaluate(
        (el) => getComputedStyle(el).borderColor,
      );
      await page.evaluate(() => {
        const state = window as unknown as AuditWindow;
        state.nativeInputAudit = [];
        for (const name of ["dragenter", "dragleave", "dragover", "drop"]) {
          document.addEventListener(
            name,
            (event) => {
              const drag = event as DragEvent;
              state.nativeInputAudit.push({
                name,
                trusted: event.isTrusted,
                files: Array.from(drag.dataTransfer?.files ?? []).map(
                  (file) => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                  }),
                ),
                target: (event.target as Element).tagName,
              });
            },
            true,
          );
        }
      });
      const drag = (
        type: "dragEnter" | "dragOver" | "drop" | "dragCancel",
        x: number,
        y: number,
      ) =>
        cdp.send("Input.dispatchDragEvent", {
          type,
          x,
          y,
          data: { items: [], files, dragOperationsMask: 1 },
        });
      await drag("dragEnter", box.x + 60, box.y + 45);
      await expect(tile).toHaveCSS(
        "border-color",
        mode.colorScheme === "dark" ? "rgb(229, 229, 229)" : "rgb(23, 23, 23)",
      );
      const activeBorder = await tile.evaluate(
        (el) => getComputedStyle(el).borderColor,
      );
      for (const point of [
        { x: box.x + 22, y: box.y + 22 },
        { x: box.x + 100, y: box.y + 90 },
      ]) {
        await drag("dragOver", point.x, point.y);
        await expect(tile).toHaveCSS("border-color", activeBorder);
        await expect(tile).not.toHaveCSS("box-shadow", "none");
      }
      await drag("dragOver", box.x + box.width + 12, box.y + 40);
      await drag("dragCancel", box.x + box.width + 12, box.y + 40);
      await expect(tile).toHaveCSS("border-color", originalBorder);
      await expect(tile).toHaveCSS("box-shadow", "none");
      await expect(items).toHaveCount(2);
      await drag("dragEnter", box.x + 70, box.y + 50);
      await drag("dragOver", box.x + 70, box.y + 50);
      await drag("drop", box.x + 70, box.y + 50);
      await expect(items).toHaveCount(4);
      expect(
        await items.evaluateAll((elements) =>
          elements.map((el) => el.getAttribute("aria-label")),
        ),
      ).toEqual([
        "Attachment options for supplier-tax-cert.pdf",
        "Attachment options for logo.png",
        "Attachment options for drop-図.png",
        "Attachment options for drop-手順.txt",
      ]);
      await expect
        .poll(() =>
          page
            .getByAltText("drop-図.png", { exact: true })
            .evaluate((el) => (el as HTMLImageElement).naturalWidth),
        )
        .toBe(5);
      await expect(tile).toHaveCSS("border-color", originalBorder);
      await expect(tile).toHaveCSS("box-shadow", "none");
      const events = await page.evaluate(
        () => (window as unknown as AuditWindow).nativeInputAudit,
      );
      expect(events.every((event) => event.trusted)).toBe(true);
      expect(events.some((event) => event.name === "dragleave")).toBe(true);
      expect(
        events
          .filter((event) => event.name === "drop")
          .map((event) => event.files),
      ).toEqual([
        [
          { name: "drop-図.png", size: png.length, type: "image/png" },
          {
            name: "drop-手順.txt",
            size: Buffer.byteLength("Native browser drag audit\n"),
            type: "text/plain",
          },
        ],
      ]);
      await info.attach("native-file-events", {
        body: JSON.stringify(events),
        contentType: "application/json",
      });
    });
  });
}
