import { expect, test } from "@playwright/test";

/**
 * Signatures & Marks, end to end: maker card → section → enlarged view →
 * documented object → back to the reference. Runs on desktop and mobile.
 */
test("maker → signature reference → enlarged view → documented object → back", async ({ page }) => {
  await page.goto("/glass-guide/makers/");

  // Only makers with a released, suitable photograph count for the filter and get a thumbnail.
  const filter = page.getByRole("button", { name: /^With signature references \(1\)$/ });
  await filter.click();
  await expect(filter).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: "Loredano Rosin" })).toBeHidden();
  await page.getByRole("link", { name: "View signatures of Pietro Bigaglia" }).click();
  await expect(page).toHaveURL(/\/glass-guide\/makers\/pietro-bigaglia\/#signatures$/);
  await expect(page.getByRole("heading", { level: 2, name: "Signatures & Marks" })).toBeInViewport();

  // The compact block by the introduction uses the same record and links to the section.
  const compact = page.getByRole("region", { name: "Inscription reference" });
  await expect(compact).toContainText("Lettered glass cane");
  await expect(compact.getByRole("link", { name: "View all signature references" })).toHaveAttribute("href", "#signatures");

  // An inscription is not presented as a signature, and the museum object is not presented as MURANIQ's.
  const card = page.locator("#sig-SIG-BIGAGLIA-R009-INSCRIPTION");
  await expect(card).toContainText("Inscription");
  await expect(card).toContainText("IX CONGRESSO");
  await expect(card).toContainText("not in the MURANIQ collection");
  await expect(card).not.toContainText(/authentic/i);

  // A mark known only from the source is a text reference; the notice is about the photograph only.
  await expect(page.getByRole("heading", { name: "Recorded in sources" })).toBeVisible();
  await expect(page.getByText("P.B.", { exact: false }).first()).toBeVisible();
  await expect(page.getByText("No photograph of this mark can be shown yet.")).toBeVisible();

  // Enlarged view: keyboard operable, credit and transcription beside the image, Escape returns focus.
  const enlarge = card.getByRole("button", { name: /^Enlarge/ });
  await enlarge.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("IX CONGRESSO");
  await expect(dialog).toContainText("The Art Institute of Chicago, 1979.904");
  await expect(dialog.getByRole("link", { name: "Original photograph" })).toBeVisible();
  const img = dialog.locator("img");
  await expect(img).toHaveCSS("object-fit", "contain");
  await page.keyboard.press("+");
  await expect(dialog.getByText("175%")).toBeVisible();
  await dialog.getByRole("button", { name: "Reset" }).click();
  await expect(dialog.getByText("100%")).toBeVisible();
  // Next view: the whole paperweight from above.
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog).toContainText("(2/2)");
  await page.keyboard.press("ArrowLeft");
  await expect(dialog).toContainText("(1/2)");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(enlarge).toBeFocused();

  // Documented object, and from its mark back to the reference.
  await card.getByRole("link", { name: /^View documented object/ }).click();
  await expect(page).toHaveURL(/\/collection\/objects\/millefiori-paperweight-bigaglia\/$/);
  await expect(page.getByText(/^Reference work\. Held by The Art Institute of Chicago/).first()).toBeVisible();
  await page.getByRole("link", { name: "Signature reference on the Pietro Bigaglia profile" }).click();
  await expect(page).toHaveURL(/\/glass-guide\/makers\/pietro-bigaglia\/#sig-SIG-BIGAGLIA-R009-INSCRIPTION$/);
  await expect(page.locator("#sig-SIG-BIGAGLIA-R009-INSCRIPTION")).toBeInViewport();

  // Browser back returns to the object.
  await page.goBack();
  await expect(page).toHaveURL(/\/collection\/objects\/millefiori-paperweight-bigaglia\/$/);
});

test("a maker without references says so, with no compact block or thumbnail", async ({ page }) => {
  await page.goto("/glass-guide/makers/loredano-rosin/");
  await expect(page.getByText("No documented signature reference is currently available.")).toBeVisible();
  await expect(page.locator("#signature-reference-title")).toHaveCount(0);

  await page.goto("/glass-guide/makers/");
  await expect(page.getByRole("link", { name: /View signatures of Loredano Rosin/ })).toHaveCount(0);
});

test("research directory keeps text-only marks apart by kind", async ({ page }) => {
  await page.goto("/glass-guide/makers-and-workshops/m-v-m-cappellin-and-c/#signatures");
  const section = page.locator("section#signatures");
  await expect(section).toContainText("Factory mark");
  await expect(section).toContainText("Acid-etched stamp");
  await expect(section).toContainText("no photograph of this mark can be shown yet");

  await page.goto("/glass-guide/makers-and-workshops/ercole-barovier/");
  await expect(page.locator("section#signatures")).toContainText("Personal signature");
});
