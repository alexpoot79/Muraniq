import { expect, test } from "@playwright/test";

test("collection → filter → dossier → viewer → museum record", async ({ page }, info) => {
  await page.goto("/collection/");
  await expect(page.getByRole("heading", { level: 1, name: "Works, seen closely." })).toBeVisible();

  // Shareable filter URL works without client interaction.
  await page.goto("/collection/murano-glass/?technique=avventurina");
  await expect(page.getByRole("status")).toContainText("2 works");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  await page.goto("/collection/murano-glass/?technique=calcedonia");
  await expect(page.getByRole("status")).toContainText("4 works");
  await page.getByRole("link", { name: "Bottle in chalcedony glass" }).click();
  await expect(page).toHaveURL(/\/collection\/objects\/chalcedony-bottle-miotti\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bottle in chalcedony glass");
  // Certainty wording follows the record: the glasshouse is a probable attribution, never stated as fact.
  await expect(page.getByText("Probably by Miotti Glasshouse").first()).toBeVisible();

  // Reference works say plainly who holds them and are never offered for enquiry or sale.
  await page.goto("/collection/objects/chalcedony-ewer-venice/");
  await expect(page.getByText(/^Reference work\. Held by The Cleveland Museum of Art/).first()).toBeVisible();
  await expect(page.getByText("Maker unidentified").first()).toBeVisible();
  const record = page.getByRole("link", { name: /View the museum record/ }).first();
  await expect(record).toHaveAttribute("href", /^https:\/\/clevelandart\.org\/art\/1985\.141$/);
  await expect(page.getByRole("link", { name: /question about this work|Enquire/ })).toHaveCount(0);

  // Thumbnails switch views without gestures.
  const side = page.getByRole("button", { name: /^Side/ });
  await side.click();
  await expect(side).toHaveAttribute("aria-pressed", "true");

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

  // The contact page ignores a museum object reference instead of implying it can be enquired about.
  await page.goto("/contact/?object=MUR-R001");
  await expect(page.getByRole("heading", { level: 1, name: /Contact/ })).toBeVisible();
  await expect(page.getByText("(MUR-R001)")).toHaveCount(0);
  // Without a configured mail provider the page offers the real address, not a fake form.
  await expect(page.getByRole("link", { name: /Email info@muraniq\.com/ })).toBeVisible();

  expect(info.project.name).toBeTruthy();
});

test("empty results, empty areas and 404 behave honestly", async ({ page }) => {
  await page.goto("/collection/murano-glass/?q=zzzzqq");
  await expect(page.getByRole("heading", { name: "No works match these choices." })).toBeVisible();

  await page.goto("/collection/other-glass/");
  await expect(page.getByRole("heading", { name: "This area is being documented." })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  const res = await page.goto("/not-a-page/");
  expect(res?.status()).toBe(404);
});

test("drafts never reach public output", async ({ page, request }) => {
  const res = await page.goto("/collection/objects/draft-vase-not-public/");
  expect(res?.status()).toBe(404);
  for (const path of ["/", "/collection/", "/sitemap.xml", "/collection/murano-glass/?q=draft"]) {
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

  // A valid enquiry about a museum reference work is refused: MURANIQ does not hold it.
  const ref = await request.post("/api/contact/", {
    headers: { Accept: "application/json" },
    data: {
      name: "Ada Lovelace",
      email: "ada@example.org",
      message: "Is this ewer available?",
      consent: "yes",
      objectId: "MUR-R001",
    },
  });
  expect(ref.status()).toBe(422);
});
