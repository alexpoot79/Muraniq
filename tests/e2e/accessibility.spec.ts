import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Automated WCAG 2.2 A/AA rules (axe-core). Manual checks remain necessary; see docs/GOALS-STATUS.md. */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];

async function audit(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  const summary = violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
  }));
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
}

const PAGES = [
  "/",
  "/collection/",
  "/collection/?technique=sommerso&sort=date-asc",
  "/collection/?q=nothing-matches-this",
  "/collection/murano-glass/",
  "/collection/fine-art/",
  "/collection/objects/sommerso-vase-amber-and-blue/",
  "/glass-guide/",
  "/glass-guide/makers/",
  "/glass-guide/makers/arnaldo-zanella/",
  "/glass-guide/techniques/",
  "/glass-guide/techniques/sommerso/",
  "/glass-guide/attribution/",
  "/glass-guide/signatures-and-labels/",
  "/about/",
  "/contact/",
  "/contact/?object=MUR-D001",
  "/privacy/",
  "/this-page-does-not-exist/",
];

for (const path of PAGES) {
  test(`no automated WCAG violations: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("main h1").first()).toBeVisible();
    await audit(page);
  });
}

test("no automated WCAG violations: viewer in full screen", async ({ page }) => {
  await page.goto("/collection/objects/sommerso-vase-amber-and-blue/");
  await page.getByRole("button", { name: "View full screen" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("+");
  await audit(page, "dialog[open]");
});

test("no automated WCAG violations: mobile menu open", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "The menu button only exists at narrow widths.");
  await page.goto("/");
  await page.getByRole("button", { name: /menu/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await audit(page, "dialog[open]");
});

test("keyboard: skip link is first, visible on focus, and moves focus to the content", async ({ page }) => {
  await page.goto("/collection/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /skip to content/i });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

test("keyboard: focused controls show a visible outline", async ({ page }) => {
  await page.goto("/contact/");
  // Tab past the skip link to the first header control.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const s = getComputedStyle(el);
    return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
  });
  expect(outline).not.toBeNull();
  expect(outline!.style).not.toBe("none");
  expect(outline!.width).toBeGreaterThanOrEqual(2);
});
