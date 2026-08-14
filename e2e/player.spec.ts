import { expect, test } from "@playwright/test";

// Note: full e2e requires `npx playwright install` (browsers) and either a real
// AzuraCast backend or Playwright route mocks for the BFF endpoints.

test("player page renders the shell and controls", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "LMENT Radio" }),
  ).toBeVisible();

  // Without an AzuraCast backend the player degrades gracefully:
  // either a Play/Pause button or the "Stream unavailable" state.
  await expect(page.getByRole("button", { name: /Play|Pause/ })).toBeVisible();
});

test("offline page renders a branded message", async ({ page }) => {
  await page.goto("/offline");

  await expect(
    page.getByRole("heading", { name: "Sin conexión" }),
  ).toBeVisible();
});
