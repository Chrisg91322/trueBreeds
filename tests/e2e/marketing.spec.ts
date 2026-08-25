import { test, expect } from "@playwright/test";

test.describe("marketing homepage", () => {
  test("renders the hero, pricing, and primary CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/TrueBreeds/i);
    await expect(
      page.getByRole("heading", { name: /a premium website for your kennel/i })
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "Simple, one-tier pricing" })).toBeVisible();
    await expect(page.getByText("$297", { exact: true })).toBeVisible();
    await expect(page.getByText("$29/mo")).toBeVisible();

    // Every "get started"-style CTA should route to signup.
    const ctas = page.getByRole("link", { name: /start your site|get started/i });
    await expect(ctas.first()).toBeVisible();
    for (const cta of await ctas.all()) {
      await expect(cta).toHaveAttribute("href", "/signup");
    }
  });

  test("navigates from the homepage to signup", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Start your site" }).click();
    await expect(page).toHaveURL(/\/signup$/);
  });
});

test.describe("auth pages", () => {
  test("login page renders the sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /truebreeds/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();
  });

  test("signup page renders the create-account form", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("button", { name: /sign up|create account|get started/i })).toBeVisible();
  });
});

test.describe("legal pages", () => {
  for (const path of ["/terms", "/privacy"]) {
    test(`${path} renders without error`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.ok()).toBeTruthy();
    });
  }
});