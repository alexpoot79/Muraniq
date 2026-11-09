import { expect, test } from "@playwright/test";

test("collection → filter → dossier → viewer → enquiry", async ({ page }, info) => {
  await page.goto("/collection/");
  await expect(page.getByRole("heading", { level: 1, name: "The collection" })).toBeVisible();

  // Shareable filter URL works without client interaction.
  await page.goto("/collection/?technique=sommerso");
  await expect(page.getByRole("status")).toContainText("1 work");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  await page.getByRole("link", { name: "Sommerso vase in amber and blue" }).click();
  await expect(page).toHaveURL(/\/collection\/objects\/sommerso-vase-amber-and-blue\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sommerso vase in amber and blue");
  await expect(page.getByText("Probably by Atelier Esempio").first()).toBeVisible();
  await expect(page.getByText("Demonstration record.").first()).toBeVisible();

  // Thumbnails switch views without gestures.
  await page.getByRole("button", { name: /^Base/ }).click();
  await expect(page.getByRole("button", { name: /^Base/ })).toHaveAttribute("aria-pressed", "true");

  // Fullscreen: keyboard operable, Escape closes, focus returns to the trigger.
  const trigger = page.getByRole("button", { name: "View full screen" });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("+");
  await expect(dialog.getByText("175%")).toBeVisible();
  await page.keyboard.press("0");
  await expect(dialog.getByText("100%")).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();

  // Enquiry carries the object reference.
  await page.getByRole("link", { name: /question about this work|Enquire/ }).click();
  await expect(page).toHaveURL(/\/contact\/\?object=MUR-D001/);
  await expect(page.getByRole("heading", { level: 1, name: "Contact" })).toBeVisible();
  await expect(page.getByText("(MUR-D001)")).toBeVisible();
  // Without a configured mail provider the page offers the real address, not a fake form.
  await expect(page.getByRole("link", { name: /Email info@muraniq\.com/ })).toBeVisible();

  expect(info.project.name).toBeTruthy();
});

test("empty results, empty areas and 404 behave honestly", async ({ page }) => {
  await page.goto("/collection/?q=zzzzqq");
  await expect(page.getByRole("heading", { name: "No works match these choices." })).toBeVisible();

  await page.goto("/collection/fine-art/");
  await expect(page.getByRole("heading", { name: "This area of the collection is being documented." })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  const res = await page.goto("/not-a-page/");
  expect(res?.status()).toBe(404);
});

test("drafts never reach public output", async ({ page, request }) => {
  const res = await page.goto("/collection/objects/draft-vase-not-public/");
  expect(res?.status()).toBe(404);
  for (const path of ["/", "/collection/", "/sitemap.xml", "/collection/?q=draft"]) {
    const body = await (await request.get(path)).text();
    expect(body).not.toContain("DRAFT-SENTINEL");
    expect(body).not.toContain("draft-vase-not-public");
  }
});

test("homepage reference: one H1, real HTML intro, no horizontal scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", { name: "Explore the collection" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("contact API validates input server-side", async ({ request }) => {
  const res = await request.post("/api/contact/", {
    headers: { Accept: "application/json" },
    data: { name: "A", email: "bad", message: "x" },
  });
  expect(res.status()).toBe(422);
  const body = await res.json();
  expect(body.status).toBe("invalid");
  expect(body.errors.email).toBeTruthy();
});
