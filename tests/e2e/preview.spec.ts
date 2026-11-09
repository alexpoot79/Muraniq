import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Draft preview: secret link → Draft Mode → drafts visible with status and
 * blockers, never cached or indexed, never leaking to other visitors.
 * Needs the server's SANITY_PREVIEW_SECRET in E2E_PREVIEW_SECRET (set
 * automatically for local runs; remote runs skip without it).
 */
const secret = process.env.E2E_PREVIEW_SECRET;
const DRAFT = "/collection/objects/draft-vase-not-public/";

test.skip(!secret, "E2E_PREVIEW_SECRET not provided");

test("preview link is rejected without the right secret or with an unsafe slug", async ({ request }) => {
  const wrong = await request.get(`/api/draft/?secret=wrong&slug=draft-vase-not-public`, { maxRedirects: 0 });
  expect(wrong.status()).toBe(401);
  expect(wrong.headers()["set-cookie"] ?? "").not.toContain("__prerender_bypass");
  const unsafe = await request.get(`/api/draft/?secret=${secret}&slug=${encodeURIComponent("//evil.example")}`, {
    maxRedirects: 0,
  });
  expect(unsafe.status()).toBe(400);
});

test("editor previews a draft, sees why it is blocked, and leaves preview", async ({ page, request }) => {
  const res = await page.goto(`/api/draft/?secret=${secret}&slug=draft-vase-not-public`);
  await expect(page).toHaveURL(new RegExp(`${DRAFT}$`));
  expect(res?.headers()["cache-control"]).toMatch(/no-store/);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Draft vase (must never be public)");
  await expect(page.getByRole("status").filter({ hasText: "You are seeing unpublished drafts" })).toBeVisible();
  await expect(page.getByText("Draft · not published.")).toBeVisible();
  await expect(page.getByText("state the attribution explicitly")).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"])
    .analyze();
  expect(violations.map((v) => v.id)).toEqual([]);

  // Other pages show the banner too; published works carry no draft note.
  await page.goto("/collection/objects/sommerso-vase-amber-and-blue/");
  await expect(page.getByRole("status").filter({ hasText: "You are seeing unpublished drafts" })).toBeVisible();
  await expect(page.getByText("not published.")).toHaveCount(0);

  // Meanwhile an ordinary visitor (no preview cookie) still cannot see the draft.
  expect((await request.get(DRAFT)).status()).toBe(404);
  for (const path of ["/", "/collection/", "/collection/?q=draft", "/sitemap.xml"]) {
    const body = await (await request.get(path)).text();
    expect(body).not.toContain("DRAFT-SENTINEL");
    expect(body).not.toContain("draft-vase-not-public");
  }

  // Leaving preview returns to the same page, now without the banner.
  await page.goto(DRAFT);
  await page.getByRole("button", { name: "Leave preview" }).click();
  await expect(page).toHaveURL(new RegExp(`${DRAFT}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This page is not in the collection.");
  await expect(page.getByText("You are seeing unpublished drafts")).toHaveCount(0);
});
