import { expect, test, type Locator } from "@playwright/test";

/**
 * MURANIQ's own photographs: a 1600 px web version with the corner mark, no
 * right-click menu and no drag-out. Museum reference images are untouched.
 */
const prevented = (img: Locator, type: "contextmenu" | "dragstart") =>
  img.evaluate((el, t) => {
    const ev = t === "contextmenu" ? new MouseEvent(t, { bubbles: true, cancelable: true }) : new DragEvent(t, { bubbles: true, cancelable: true });
    el.dispatchEvent(ev);
    return ev.defaultPrevented;
  }, type);

test("own photographs cannot be right-clicked or dragged; the full-screen file is the web version", async ({ page }) => {
  await page.goto("/collection/objects/monumental-aquamarine-scavo-corroso-vase/");
  const photo = page.locator("figure img[data-own-photo]:not([aria-hidden])").first();
  await expect(photo).toBeVisible();
  await expect(photo).toHaveAttribute("draggable", "false");
  expect(await prevented(photo, "contextmenu")).toBe(true);
  expect(await prevented(photo, "dragstart")).toBe(true);

  await page.getByRole("button", { name: "View full screen" }).click();
  const full = page.locator("dialog img[data-own-photo]");
  await expect(full).toBeVisible();
  await expect.poll(() => full.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  const size = await full.evaluate((el: HTMLImageElement) => Math.max(el.naturalWidth, el.naturalHeight));
  expect(size).toBeLessThanOrEqual(1600);
  expect(await prevented(full, "contextmenu")).toBe(true);
});

test("museum reference images keep the normal right-click menu", async ({ page }) => {
  await page.goto("/collection/objects/chalcedony-ewer-venice/");
  const photo = page.locator("figure img:not([aria-hidden])").first();
  await expect(photo).toBeVisible();
  await expect(photo).not.toHaveAttribute("data-own-photo");
  expect(await prevented(photo, "contextmenu")).toBe(false);
});
