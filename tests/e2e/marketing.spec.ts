import { test, expect } from "@playwright/test";

test.describe("marketing homepage", () => {
  test("renders the hero and a pricing inquiry CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/TrueBreeds/i);
    await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute(
      "href",
      /icon|favicon|logo2/i
    );
    await expect(
      page.getByRole("heading", { name: /built around the animal breeders community/i })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Memberships that grow with your breeding program" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Basic" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pro" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Premium" })).toBeVisible();
    const inquire = page.getByRole("link", { name: "Ask about pricing" });
    await expect(inquire.first()).toHaveAttribute("href", "#pricing");
    for (const link of await inquire.all()) {
      const href = await link.getAttribute("href");
      expect(href === "#pricing" || href?.startsWith("/start")).toBeTruthy();
    }
    await expect(page.getByText("$49.99")).toHaveCount(0);
    await expect(page.getByText("$69.99")).toHaveCount(0);
    await expect(page.getByText("$99.99")).toHaveCount(0);
    await expect(page.getByText("$297")).toHaveCount(0);

    const ctas = page.getByRole("link", { name: /get started/i });
    await expect(ctas.first()).toBeVisible();
    for (const cta of await ctas.all()) {
      await expect(cta).toHaveAttribute("href", /\/start/);
    }
  });

  test("navigates from the homepage to the contact form", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Get started" }).first().click();
    await expect(page).toHaveURL(/\/start$/);
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