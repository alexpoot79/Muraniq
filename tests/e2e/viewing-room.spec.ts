import { expect, test } from "@playwright/test";

/**
 * The Private Viewing Room: history anchors, the Private Selection with
 * comparison, the way back to a filtered listing, and the Glass Guide links
 * between technique, history, example, maker and source.
 */

test("history: period index jumps to each period and every period lists its sources", async ({ page }) => {
  await page.goto("/glass-guide/history/");
  const index = page.getByRole("navigation", { name: "Periods" });
  await expect(index.getByRole("link")).toHaveCount(7);
  await index.getByRole("link", { name: /The move to Murano/ }).click();
  await expect(page).toHaveURL(/#murano$/);
  await expect(page.getByRole("heading", { level: 2, name: "The move to Murano" })).toBeInViewport();
  await expect(page.getByRole("complementary", { name: "Sources for this period" })).toHaveCount(7);
  // Readable without motion: the text is in the HTML, not revealed by script.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/glass-guide/history/#today");
  await expect(page.getByRole("heading", { level: 2, name: /today/i })).toBeInViewport();
});

test("private selection: save, compare up to three, scale view, remove", async ({ page }) => {
  await page.goto("/collection/objects/chalcedony-ewer-venice/");
  const save = page.getByRole("button", { name: /Save to Private Selection/ });
  await save.click();
  await expect(page.getByRole("button", { name: /Saved in your Private Selection/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/is saved in your Private Selection/)).toBeVisible();
  // Dimensions: centimetres first, inches computed from the recorded millimetres.
  await expect(page.getByText(/\d+(\.\d)? cm \(\d+(\.\d)? in\)/).first()).toBeVisible();

  await page.goto("/collection/objects/chalcedony-bottle-miotti/");
  await page.getByRole("button", { name: /Save to Private Selection/ }).click();
  await page.getByRole("link", { name: /Selection\s*2/ }).first().click();
  await expect(page).toHaveURL(/\/selection\/$/);
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(2);

  for (const name of [/Compare Ewer in chalcedony glass/, /Compare Bottle in chalcedony glass/]) {
    await page.getByRole("button", { name }).click();
  }
  await expect(page).toHaveURL(/compare=MUR-/);
  await expect(page.getByRole("table", { name: /Comparison of 2 works/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /^Relative size:/ })).toBeVisible();
  await expect(page.getByText(/compares size only/)).toBeVisible();

  // The selection survives a reload: it lives in this browser.
  await page.reload();
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(2);

  await page.getByRole("button", { name: "Clear selection" }).click();
  await page.getByRole("button", { name: "Yes, clear" }).click();
  await expect(page.getByText(/Nothing saved yet|no works saved|is empty/i).first()).toBeVisible();
});

test("object page: back to the filtered listing restores filters and scroll position", async ({ page }) => {
  await page.goto("/collection/murano-glass/?technique=sommerso");
  await expect(page.getByRole("status")).toContainText("6 works");
  const last = page.getByRole("list").filter({ has: page.getByRole("heading", { level: 2 }) }).last().getByRole("link").last();
  await last.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const y = await page.evaluate(() => window.scrollY);
  expect(y).toBeGreaterThan(200);
  await last.click();
  await expect(page).toHaveURL(/\/collection\/objects\//);
  const back = page.getByRole("link", { name: /Back to Murano Glass · Sommerso/ });
  await expect(back).toBeVisible();
  await back.click();
  await expect(page).toHaveURL(/\/collection\/murano-glass\/\?technique=sommerso$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y - 150);
});

test("glass guide connects technique → history → example → maker → source", async ({ page }) => {
  await page.goto("/glass-guide/");
  const thread = page.getByRole("region", { name: /One thread through the archive/ });
  await expect(thread.getByRole("listitem")).toHaveCount(5);
  await page.goto("/glass-guide/techniques/calcedonia/");
  const across = page.getByRole("navigation", { name: /Calcedonia across the archive/ });
  await expect(across.getByRole("link", { name: "The nineteenth-century revival" })).toHaveAttribute("href", "/glass-guide/history/#revival");
  await expect(across.getByRole("link", { name: "Miotti Glasshouse" })).toBeVisible();
  await across.getByRole("link", { name: "Murano Glass" }).click();
  await expect(page).toHaveURL(/\/collection\/murano-glass\/\?technique=calcedonia$/);
});
