import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

async function captureProof(page: Page, name: string) {
  if (process.env.E2E_PROOF !== "1") {
    return;
  }

  const evidenceDir = path.join(process.cwd(), "test-results", "evidence");
  await mkdir(evidenceDir, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDir, `${name}.png`),
    fullPage: true,
  });
}

test("core link flows: create, validate, duplicate, export, resolve/increment and delete", async ({
  context,
  page,
}) => {
  const slug = `pw-${Date.now()}`;
  const originalUrl = `https://example.com/${slug}`;

  await page.goto("/");
  await captureProof(page, "01-home-initial");

  await page.getByLabel("LINK ORIGINAL").fill("https://example.com");
  await page.getByLabel("LINK ENCURTADO").fill("bad slug");
  await expect(page.getByRole("button", { name: "Salvar link" })).toBeDisabled();
  await expect(page.getByText(/Use apenas letras/i)).toBeVisible();
  await captureProof(page, "02-invalid-slug");

  await page.getByLabel("LINK ORIGINAL").fill(originalUrl);
  await page.getByLabel("LINK ENCURTADO").fill(slug);
  await expect(page.getByRole("button", { name: "Salvar link" })).toBeEnabled();
  const createResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/urls") &&
      response.request().method() === "POST" &&
      response.status() === 201,
  );
  await page.getByRole("button", { name: "Salvar link" }).click();
  await createResponsePromise;
  await captureProof(page, "03-created-link");

  const createdItem = page.locator(".link-item").filter({ hasText: slug });
  await expect(createdItem).toBeVisible();
  await expect(createdItem).toContainText("0 acessos");

  await page.getByLabel("LINK ORIGINAL").fill("https://openai.com");
  await page.getByLabel("LINK ENCURTADO").fill(slug);
  const duplicateResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/urls") &&
      response.request().method() === "POST" &&
      response.status() === 409,
  );
  await page.getByRole("button", { name: "Salvar link" }).click();
  await duplicateResponsePromise;
  await expect(page.getByText(/encurtamento.*existe/i)).toBeVisible();
  await captureProof(page, "04-duplicate-slug");

  const reportResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/urls/report") && response.request().method() === "GET",
  );
  await page.getByRole("button", { name: "Baixar CSV" }).click();
  const reportResponse = await reportResponsePromise;
  expect(reportResponse.status()).toBe(200);
  const reportPayload: { reportUrl: string; expiresIn: number } = await reportResponse.json();
  expect(reportPayload.reportUrl).toContain("X-Amz-Signature");
  expect(reportPayload.expiresIn).toBeGreaterThan(0);
  await captureProof(page, "05-export-report");

  const redirectPage = await context.newPage();
  await redirectPage.goto(`/${slug}`);
  await expect(redirectPage).toHaveURL(originalUrl);
  await captureProof(redirectPage, "06-redirect");
  await redirectPage.close();

  await page.goto("/");
  const incrementedItem = page.locator(".link-item").filter({ hasText: slug });
  await expect(incrementedItem).toContainText("1 acessos");

  page.once("dialog", (dialog) => dialog.accept());
  await incrementedItem.getByRole("button", { name: "Excluir link" }).click();
  await expect(page.locator(".link-item").filter({ hasText: slug })).toHaveCount(0);
  await captureProof(page, "07-deleted");
});
