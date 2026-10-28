import { expect, test, type Locator, type Page } from "@playwright/test";

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
const preview = (page: Page, name: string) =>
  page.getByRole("tabpanel", { name: `${name} preview`, exact: true });
const button = (scope: Locator, name: string) =>
  scope.getByRole("button", { name, exact: true });
const input = (scope: Locator) => scope.getByRole("textbox");
function note(type: string, description: string) {
  test.info().annotations.push({ type, description });
}
const pdf = {
  name: "order.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4\nUI test only"),
};
const png = {
  name: "diagram.png",
  mimeType: "image/png",
  buffer: Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    "base64",
  ),
};
async function open(page: Page) {
  await page.goto("patterns/ai-chat");
  const panel = preview(page, "Assistant panel (assembled)");
  await expect(
    button(panel, "How do I create a purchase order?"),
  ).toBeVisible();
  return panel;
}
async function settled(panel: Locator) {
  await expect(button(panel, "Stop")).toHaveCount(0, { timeout: 15_000 });
}

for (const mode of [
  {
    name: "desktop light",
    viewport: { width: 1280, height: 900 },
    colorScheme: "light" as const,
    mobile: false,
  },
  {
    name: "mobile dark",
    viewport: { width: 375, height: 812 },
    colorScheme: "dark" as const,
    mobile: true,
  },
]) {
  test.describe(mode.name, () => {
    test.use({ viewport: mode.viewport, colorScheme: mode.colorScheme });

    test("assembled assistant completes scripted tools and citations, copies raw markdown, and Retry appends a fresh turn", async ({
      page,
      context,
    }) => {
      note(
        "scripted-demo",
        "The answer, tools and citations are local scripted data; this does not test a model or real backend calls.",
      );
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      const panel = await open(page);
      await button(panel, "How do I create a purchase order?").click();
      await expect(button(panel, "Used 2 sources")).toBeVisible({
        timeout: 15_000,
      });
      await settled(panel);
      const tool = button(panel, "Search help articles Done");
      await expect(tool).toHaveAttribute("aria-expanded", "false");
      await tool.click();
      await expect(
        panel.getByRole("heading", { name: "Parameters", exact: true }),
      ).toBeVisible();
      await expect(panel.locator("pre").first()).toContainText(
        '"query": "create purchase order"',
      );
      await expect(panel.locator("pre").last()).toContainText('"id": "kb-31"');
      await button(panel, "Used 2 sources").click();
      await expect(button(panel, "Creating purchase orders")).toBeVisible();
      await expect(button(panel, "Order approval workflow")).toBeVisible();
      await button(panel, "Copy").click();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toContain("**Submit for approval**");
      const answer = await page.evaluate(() => navigator.clipboard.readText());
      expect(answer).toContain("`PENDING_APPROVAL`");
      expect(answer).toContain("¥1,000,000");
      await button(panel, "Retry").click();
      await expect(
        panel.getByText("How do I create a purchase order?", { exact: true }),
      ).toHaveCount(2);
      await expect(button(panel, "Used 2 sources")).toHaveCount(2, {
        timeout: 15_000,
      });
      await settled(panel);
      await expect(button(panel, "Copy")).toHaveCount(2);
      await expect(button(panel, "Search help articles Done")).toHaveCount(2);
    });

    test("assistant Stop and Clear cancel pending work, expose an unfinished tool label, and recover from the scripted error", async ({
      page,
    }) => {
      note(
        "scripted-demo",
        "429 and tool timeout are scripted states, not external provider errors.",
      );
      note(
        "reference-limitation",
        "Stopping during a tool leaves its Preparing or Running label in the transcript instead of marking it canceled.",
      );
      const panel = await open(page);
      await button(panel, "How do I create a purchase order?").click();
      await expect(button(panel, "Stop")).toBeEnabled({ timeout: 5000 });
      await button(panel, "Stop").click();
      await expect(button(panel, "Send")).toBeDisabled();
      await page.waitForTimeout(1600);
      await expect(
        panel.getByRole("button", {
          name: /Search help articles (Preparing|Running)/,
        }),
      ).toHaveCount(1);
      await expect(button(panel, "Used 2 sources")).toHaveCount(0);
      await button(panel, "Clear conversation").click();
      await button(panel, "Why is my order still pending?").click();
      await button(panel, "Clear conversation").click();
      await page.waitForTimeout(700);
      await expect(
        panel.getByRole("heading", { name: "Ask the assistant", exact: true }),
      ).toBeVisible();
      await expect(button(panel, "Stop")).toHaveCount(0);
      await button(panel, "Show me an error state").click();
      await expect(
        panel.getByText(/The model endpoint returned 429/),
      ).toBeVisible({ timeout: 10_000 });
      await button(panel, "Search help articles Error").click();
      await expect(panel.locator("pre").last()).toHaveText(
        "Upstream search timed out after 10s.",
      );
      await expect(button(panel, "Copy")).toHaveCount(0);
      await input(panel).fill("Summarize this week's inbound orders");
      await button(panel, "Send").click();
      await expect(
        panel.getByText(/The model endpoint returned 429/),
      ).toHaveCount(0);
      await expect(
        panel.getByText("24 inbound orders", { exact: true }),
      ).toBeVisible({ timeout: 15_000 });
      await settled(panel);
      await expect(button(panel, "Query orders Done")).toHaveCount(1);
    });

    test("assistant history retains draft and cosmetic model but unmounts attachments, and Clear preserves the draft", async ({
      page,
    }) => {
      note(
        "reference-limitation",
        "The model picker is cosmetic; history is a fixed fixture, opening history discards composer attachments, and Clear does not clear the typed draft.",
      );
      const panel = await open(page);
      await button(panel, "GPT-5").click();
      await page
        .getByRole("menuitem", { name: "Gemini 2.5 Pro", exact: true })
        .click();
      await input(panel).fill("Unsaved question");
      await panel.locator('input[type="file"]').setInputFiles(pdf);
      await expect(button(panel, "Remove attachment")).toHaveCount(1);
      await button(panel, "Conversation history").click();
      await expect(button(panel, "Conversation history")).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(
        panel
          .getByRole("navigation", {
            name: "Conversation history",
            exact: true,
          })
          .getByRole("button"),
      ).toHaveCount(4);
      await expect(panel.getByRole("button", { name: /^Delete / })).toHaveCount(
        0,
      );
      await button(panel, "Creating a purchase order").click();
      await expect(
        panel.getByText("How do I create a purchase order?", { exact: true }),
      ).toBeVisible();
      await expect(input(panel)).toHaveValue("Unsaved question");
      await expect(button(panel, "Gemini 2.5 Pro")).toBeVisible();
      await expect(button(panel, "Remove attachment")).toHaveCount(0);
      await button(panel, "Conversation history").click();
      await button(panel, "Inbound order summary").click();
      await expect(
        panel.getByText("19 inbound orders", { exact: true }),
      ).toBeVisible();
      await expect(
        panel.getByText("How do I create a purchase order?", { exact: true }),
      ).toHaveCount(0);
      await button(panel, "Clear conversation").click();
      await expect(
        panel.getByRole("heading", { name: "Ask the assistant", exact: true }),
      ).toBeVisible();
      await expect(input(panel)).toHaveValue("Unsaved question");
      await expect(button(panel, "Gemini 2.5 Pro")).toBeVisible();
      await page.reload();
      await expect(input(panel)).toHaveValue("");
      await expect(button(panel, "GPT-5")).toBeVisible();
    });

    test("prompt keyboard submit supports files and multiline text, while file-only Send and Stop retain reference limitations", async ({
      page,
    }) => {
      note(
        "scripted-demo",
        "The prompt status cycle and last-submission text are local demo state, not an upload or network request.",
      );
      note(
        "reference-limitation",
        "With files only, Send is disabled but Enter submits. Stop clears newly added attachments while retaining newly typed text.",
      );
      await open(page);
      const panel = preview(page, "Prompt input");
      const file = panel.locator('input[type="file"]');
      await expect(file).toHaveAttribute("accept", "image/*,application/pdf");
      await file.setInputFiles([pdf, png]);
      await expect(button(panel, "Remove attachment")).toHaveCount(2);
      await expect(button(panel, "Send")).toBeDisabled();
      await input(panel).press("Backspace");
      await expect(button(panel, "Remove attachment")).toHaveCount(1);
      await expect(panel.getByText("order.pdf", { exact: true })).toBeVisible();
      await file.setInputFiles(png);
      await button(panel, "Remove attachment").first().click();
      await expect(
        panel.getByText("diagram.png", { exact: true }),
      ).toBeVisible();
      await input(panel).press("Enter");
      await expect(
        panel.getByText(/Last submitted: \(no text\).*diagram.png/),
      ).toBeVisible();
      await expect(button(panel, "Remove attachment")).toHaveCount(0);
      await expect(button(panel, "Stop")).toBeEnabled();
      await input(panel).fill("Draft while streaming");
      await file.setInputFiles(pdf);
      await button(panel, "Stop").click();
      await expect(button(panel, "Remove attachment")).toHaveCount(0);
      await expect(input(panel)).toHaveValue("Draft while streaming");
      await expect(button(panel, "Send")).toBeEnabled();
      await input(panel).fill("  First line");
      await input(panel).press("Shift+Enter");
      await input(panel).pressSequentially("Second line  ");
      await expect(input(panel)).toHaveValue("  First line\nSecond line  ");
      await input(panel).press("Enter");
      await expect(input(panel)).toHaveValue("");
      await expect(panel.locator("p")).toContainText(
        "Last submitted: First line\nSecond line",
      );
      await settled(panel);
      await expect(button(panel, "Send")).toBeDisabled();
    });

    test("reasoning replay follows automatic open and close until manually toggled, and chain replay restores its default", async ({
      page,
    }) => {
      await open(page);
      const panel = preview(page, "Reasoning (thinking)");
      await expect(button(panel, "Thought for 3s")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await button(panel, "Replay streaming").click();
      await expect(button(panel, "Thinking…")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(button(panel, "Thought for 3s")).toHaveAttribute(
        "aria-expanded",
        "false",
        { timeout: 5000 },
      );
      await button(panel, "Replay streaming").click();
      await button(panel, "Thinking…").click();
      await expect(button(panel, "Thinking…")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await button(panel, "Thinking…").click();
      await expect(button(panel, "Thought for 3s")).toHaveAttribute(
        "aria-expanded",
        "true",
        { timeout: 5000 },
      );
      await expect(
        panel.getByText(/The user is asking about an order stuck/),
      ).toBeVisible();
      const chain = preview(page, "Chain of thought");
      await button(chain, "Chain of thought").click();
      await expect(button(chain, "Chain of thought")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
      await button(chain, "Replay steps").click();
      await expect(button(chain, "Chain of thought")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await expect(chain.locator("svg.animate-pulse")).toHaveCount(1);
      await expect(
        chain.getByText("Creating purchase orders", { exact: true }),
      ).toBeVisible({ timeout: 5000 });
      await expect(
        chain.getByText("Draft the answer with citations", { exact: true }),
      ).toBeVisible();
      await expect(
        chain.getByText("Order approval workflow", { exact: true }),
      ).toBeVisible();
      await expect(chain.locator("svg.animate-pulse")).toHaveCount(0, {
        timeout: 5000,
      });
    });

    test("tool lifecycle cards expand independently and citations toggle while source buttons have no document handler", async ({
      page,
    }) => {
      note(
        "reference-limitation",
        "Source buttons have no document-opening handler in this demo. Their click is not successful source navigation.",
      );
      await open(page);
      const panel = preview(page, "Tool calls");
      await expect(button(panel, "Search help articles Done")).toHaveAttribute(
        "aria-expanded",
        "true",
      );
      await button(panel, "Search help articles Running").click();
      await button(panel, "Search help articles Error").click();
      await expect(
        panel.getByRole("heading", { name: "Parameters", exact: true }),
      ).toHaveCount(3);
      await expect(
        panel.getByRole("heading", { name: "Result", exact: true }),
      ).toHaveCount(1);
      await expect(
        panel.getByRole("heading", { name: "Error", exact: true }),
      ).toHaveCount(1);
      await expect(
        panel.getByText("Upstream search timed out after 10s.", {
          exact: true,
        }),
      ).toBeVisible();
      await button(panel, "Search help articles Done").click();
      await expect(
        panel.getByRole("heading", { name: "Result", exact: true }),
      ).toHaveCount(0);
      await expect(
        button(panel, "Search help articles Running"),
      ).toHaveAttribute("aria-expanded", "true");
      const sources = preview(page, "Sources (citations)");
      await button(sources, "Used 3 sources").press("Enter");
      const before = page.url();
      for (const title of [
        "Creating purchase orders",
        "Order approval workflow",
        "Supplier master data policy",
      ])
        await button(sources, title).click();
      await expect(page).toHaveURL(before);
      await button(sources, "Used 3 sources").press("Space");
      await expect(button(sources, "Creating purchase orders")).toHaveCount(0);
      const response = preview(page, "Message & response");
      await expect(
        response.getByRole("link", {
          name: "Order approval workflow",
          exact: true,
        }),
      ).toHaveAttribute("href", "https://example.com/kb/31");
      await expect(response.getByRole("link")).toHaveAttribute(
        "target",
        "_blank",
      );
    });

    test("standalone history deletes records and empty groups, while message feedback, copy and suggestions stay independent", async ({
      page,
      context,
    }) => {
      note(
        "reference-limitation",
        "Standalone Retry has no handler; deleted history is in-memory and returns on reload. Feedback is local UI state.",
      );
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await open(page);
      const history = preview(page, "Conversation history");
      await button(history, "Pending order troubleshooting").click();
      await expect(button(history, "Pending order troubleshooting")).toHaveCSS(
        "font-weight",
        "500",
      );
      for (const title of [
        "Creating a purchase order",
        "Pending order troubleshooting",
        "Inbound order summary",
        "Supplier onboarding checklist",
      ]) {
        await button(history, title).hover();
        await button(history, `Delete "${title}"`).click();
      }
      await expect(
        history.getByRole("navigation").getByRole("button"),
      ).toHaveCount(0);
      await expect(history.getByText("Today", { exact: true })).toHaveCount(0);
      await expect(
        history.getByText("Previous 7 days", { exact: true }),
      ).toHaveCount(0);
      const actions = preview(page, "Message actions");
      const up = button(actions, "Good response");
      const down = button(actions, "Bad response");
      await up.click();
      await expect(up).toHaveAttribute("aria-pressed", "true");
      await down.click();
      await expect(up).toHaveAttribute("aria-pressed", "false");
      await expect(down).toHaveAttribute("aria-pressed", "true");
      await down.click();
      await expect(down).toHaveAttribute("aria-pressed", "false");
      const before = await actions.ariaSnapshot();
      await button(actions, "Retry").click();
      expect(await actions.ariaSnapshot()).toBe(before);
      await button(actions, "Copy").click();
      await expect(button(actions, "Copied")).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe(
          "The approval limit for purchase orders is **¥1,000,000** — anything above that also needs a finance sign-off.",
        );
      const suggestions = preview(page, "Suggestions");
      await button(suggestions, "Why is my order still pending?").click();
      await expect(suggestions.locator("p")).toContainText(
        "Why is my order still pending?",
      );
      await expect(
        input(preview(page, "Assistant panel (assembled)")),
      ).toHaveValue("");
      await page.reload();
      await expect(
        history.getByRole("button", { name: /^Delete / }),
      ).toHaveCount(0);
      await expect(button(history, "Creating a purchase order")).toBeVisible();
      await expect(up).toHaveAttribute("aria-pressed", "false");
    });

    test("docked assistant closes and remounts independently of the knowledge base, and records narrow-screen clipping", async ({
      page,
    }) => {
      note(
        "scripted-demo",
        "Closing the docked panel unmounts and cancels the mock, then reopening creates fresh panel state; no backend conversation is persisted.",
      );
      if (mode.mobile)
        note(
          "reference-limitation",
          "The docked assistant is fixed at 360px inside a 333px work area, clips its right-side controls and compresses the work page to zero width.",
        );
      await page.goto("page/assistant-panel");
      const panel = page.getByRole("tabpanel", {
        name: "Preview",
        exact: true,
      });
      await expect(panel.getByRole("article")).toHaveCount(6);
      if (mode.mobile) {
        const assistant = panel
          .getByRole("complementary")
          .filter({
            has: page.getByRole("button", {
              name: "Close assistant",
              exact: true,
            }),
          });
        const bounds = await assistant.boundingBox();
        const outer = await panel.boundingBox();
        expect(bounds!.width).toBe(360);
        expect(bounds!.x + bounds!.width).toBeGreaterThan(
          outer!.x + outer!.width,
        );
      }
      await input(panel).fill("Draft to discard on close");
      await button(panel, "Conversation history").click();
      await button(panel, "Creating a purchase order").click();
      await button(panel, "Close assistant").click();
      await expect(button(panel, "Conversation history")).toHaveCount(0);
      await expect(
        panel.getByRole("heading", { name: "Knowledge base", exact: true }),
      ).toBeVisible();
      await expect(panel.getByRole("article")).toHaveCount(6);
      await button(panel, "Ask assistant").click();
      await expect(input(panel)).toHaveValue("");
      await expect(button(panel, "GPT-5")).toHaveCount(1);
      await expect(
        panel.getByRole("heading", { name: "Ask the assistant", exact: true }),
      ).toHaveCount(1);
      await button(panel, "Why is my order still pending?").click();
      await button(panel, "Close assistant").click();
      await page.waitForTimeout(700);
      await button(panel, "Ask assistant").click();
      await expect(
        panel.getByRole("heading", { name: "Ask the assistant", exact: true }),
      ).toHaveCount(1);
      await expect(button(panel, "Stop")).toHaveCount(0);
    });
  });
}
