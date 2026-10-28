import {
  expect,
  test,
  type CDPSession,
  type Locator,
  type Page,
} from "@playwright/test";

type InputEventRecord = {
  type: string;
  key?: string;
  keyCode?: number;
  composing?: boolean;
  trusted: boolean;
};
type IMEWindow = Window & { catalogueIMEEvents?: InputEventRecord[] };

async function beginComposition(page: Page, input: Locator, text: string) {
  await input.focus();
  await input.evaluate((element) => {
    const state = window as IMEWindow;
    state.catalogueIMEEvents = [];
    for (const name of [
      "compositionstart",
      "compositionend",
      "keydown",
      "input",
    ]) {
      element.addEventListener(name, (event) => {
        const key = event as KeyboardEvent;
        state.catalogueIMEEvents!.push({
          type: event.type,
          key: key.key,
          keyCode: key.keyCode,
          composing: key.isComposing,
          trusted: event.isTrusted,
        });
      });
    }
  });
  const session = await page.context().newCDPSession(page);
  await session.send("Input.imeSetComposition", {
    text,
    selectionStart: text.length,
    selectionEnd: text.length,
  });
  await expect(input).toHaveValue(text);
  return session;
}

async function composingEnter(session: CDPSession) {
  // Exercise both normal Enter and the IME process-key code while Chromium
  // itself has an active composition, rather than dispatching DOM events.
  for (const keyCode of [13, 229]) {
    for (const type of ["keyDown", "keyUp"] as const) {
      await session.send("Input.dispatchKeyEvent", {
        type,
        key: "Enter",
        code: "Enter",
        windowsVirtualKeyCode: keyCode,
        nativeVirtualKeyCode: keyCode,
      });
    }
  }
}

async function commit(session: CDPSession, input: Locator, text: string) {
  await session.send("Input.insertText", { text });
  await expect(input).toHaveValue(text);
  await session.detach();
}

test.afterEach(async ({ page }, info) => {
  const events = await page.evaluate(
    () => (window as IMEWindow).catalogueIMEEvents ?? [],
  );
  await info.attach("chromium-ime-events", {
    body: JSON.stringify(events, null, 2),
    contentType: "application/json",
  });
  expect(events).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ type: "compositionstart", trusted: true }),
      ...[13, 229].map((keyCode) =>
        expect.objectContaining({
          type: "keydown",
          keyCode,
          composing: true,
          trusted: true,
        }),
      ),
      expect.objectContaining({
        type: "keydown",
        keyCode: 13,
        composing: false,
        trusted: true,
      }),
    ]),
  );
});

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
  },
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
  },
]) {
  test.describe(mode.name, () => {
    test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });

    for (const language of ["en", "ja"]) {
      test(`global search ${language} ignores composing Enter and navigates only after commitment`, async ({
        page,
      }) => {
        await page.goto("components/button", { waitUntil: "domcontentloaded" });
        await expect(
          page.getByRole("button", { name: "Primary", exact: true }),
        ).toBeVisible();
        if (language === "ja") {
          if (mode.viewport.width < 768)
            await page
              .getByRole("button", { name: "Toggle Sidebar", exact: true })
              .click();
          await page.getByRole("button", { name: "JA", exact: true }).click();
          if (mode.viewport.width < 768) await page.keyboard.press("Escape");
          await expect(page.locator("html")).toHaveAttribute("lang", "ja");
        }
        await page.keyboard.press("ControlOrMeta+k");
        const dialog = page.getByRole("dialog");
        const input = dialog.getByRole("textbox");
        await expect(input).toBeFocused();
        const query = language === "ja" ? "差分" : "field diff";
        const initialURL = page.url();
        const session = await beginComposition(page, input, query);
        const result = dialog.locator("button[data-index]");
        await expect(result).toHaveCount(1);
        await expect(result).toContainText("/patterns/field-diff-table");
        await composingEnter(session);
        await expect(page).toHaveURL(initialURL);
        await expect(dialog).toBeVisible();
        await expect(input).toHaveValue(query);
        await commit(session, input, query);
        await input.press("Enter");
        await expect(page).toHaveURL(/patterns\/field-diff-table\/?$/);
      });
    }

    for (const kind of ["combobox", "autocomplete"] as const) {
      test(`${kind} commits an IME query before keyboard suggestion selection`, async ({
        page,
      }) => {
        test.info().annotations.push({
          type: "chromium-ime-reference-behavior",
          description:
            "Wait for the real popup animation to finish. In this exact composition sequence the reference single Combobox needs two ArrowDown presses; the first does not highlight an option. Autocomplete needs one. This is not an OS IME test.",
        });
        await page.goto(`components/${kind}?preview=fullscreen`);
        await page.waitForLoadState("networkidle");
        const input = page.locator(`[data-slot="${kind}-input"]`).first();
        await input.fill("");
        const settlePopup = async () => {
          await page.evaluate(async () => {
            await Promise.all(
              document
                .getAnimations()
                .filter(
                  (animation) =>
                    animation.effect?.getTiming().iterations !== Infinity,
                )
                .map((animation) => animation.finished.catch(() => {})),
            );
          });
        };
        const session = await beginComposition(page, input, "Su");
        await expect(page.getByRole("option")).toHaveText([
          "Tanaka",
          "Sato",
          "Suzuki",
          "Yamada",
        ]);
        await settlePopup();
        await composingEnter(session);
        await expect(input).toHaveValue("Su");
        await expect(input).not.toHaveAttribute("aria-activedescendant");
        await commit(session, input, "Suz");
        const suggestion = page.getByRole("option", {
          name: "Suzuki",
          exact: true,
        });
        await expect(page.getByRole("option")).toHaveCount(1);
        await expect(suggestion).toBeVisible();
        await settlePopup();
        await input.press("ArrowDown");
        if (kind === "combobox") {
          await expect(input).not.toHaveAttribute("aria-activedescendant");
          await expect(suggestion).not.toHaveAttribute("data-highlighted");
          await input.press("ArrowDown");
        }
        await expect(suggestion).toHaveAttribute("data-highlighted", "");
        await expect(input).toHaveAttribute(
          "aria-activedescendant",
          (await suggestion.getAttribute("id"))!,
        );
        await input.press("Enter");
        await expect(input).toHaveValue("Suzuki");
        await expect(input).toBeFocused();
        await expect(page.getByRole("listbox")).not.toBeVisible();
      });
    }

    test("prompt does not submit Japanese text while composing and submits it once after commitment", async ({
      page,
    }) => {
      test.info().annotations.push({
        type: "scripted-demo",
        description:
          "Chromium IME protocol and local demo state; no real OS input method, AI request, or upload.",
      });
      await page.goto("patterns/ai-chat", { waitUntil: "domcontentloaded" });
      const panel = page.getByRole("tabpanel", {
        name: "Prompt input preview",
        exact: true,
      });
      const input = panel.getByRole("textbox");
      const text = "納期を確認したい";
      const session = await beginComposition(page, input, text);
      await composingEnter(session);
      await expect(input).toHaveValue(text);
      await expect(panel.locator("p")).toHaveText("Status: ready");
      await expect(
        panel.getByRole("button", { name: "Send", exact: true }),
      ).toBeEnabled();
      await commit(session, input, text);
      await input.press("Enter");
      await expect(input).toHaveValue("");
      await expect(panel.locator("p")).toContainText(`Last submitted: ${text}`);
      await expect(
        panel.getByRole("button", { name: "Send", exact: true }),
      ).toBeDisabled({ timeout: 5000 });
    });
  });
}
