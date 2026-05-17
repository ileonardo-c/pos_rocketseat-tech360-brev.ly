import { expect, test } from "@playwright/test";

test("core link flows: create, validate, duplicate, export, resolve/increment and delete", async ({
  context,
  page,
}) => {
  const slug = `pw-${Date.now()}`;
  const originalUrl = `https://example.com/${slug}`;

  await page.goto("/");

  await page.getByPlaceholder("https://www.exemplo.com").fill("https://example.com");
  await page.getByPlaceholder("meu-link").fill("bad slug");
  await expect(page.getByRole("button", { name: "Salvar link" })).toBeDisabled();
  await expect(page.getByText("Use apenas letras, números, _ e -.")).toBeVisible();

  await page.getByPlaceholder("https://www.exemplo.com").fill(originalUrl);
  await page.getByPlaceholder("meu-link").fill(slug);
  await expect(page.getByRole("button", { name: "Salvar link" })).toBeEnabled();
  const createResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/urls") &&
      response.request().method() === "POST" &&
      response.status() === 201,
  );
  await page.getByRole("button", { name: "Salvar link" }).click();
  await createResponsePromise;

  const createdItem = page.locator(".link-item").filter({ hasText: slug });
  await expect(createdItem).toBeVisible();
  await expect(createdItem).toContainText("0 acessos");

  await page.getByPlaceholder("https://www.exemplo.com").fill("https://openai.com");
  await page.getByPlaceholder("meu-link").fill(slug);
  const duplicateResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/urls") &&
      response.request().method() === "POST" &&
      response.status() === 400,
  );
  await page.getByRole("button", { name: "Salvar link" }).click();
  await duplicateResponsePromise;
  await expect(page.getByText("Slug already exists")).toBeVisible();

  const reportResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes("/urls/report") &&
      response.request().method() === "GET",
  );
  await page.getByRole("button", { name: "Baixar CSV" }).click();
  const reportResponse = await reportResponsePromise;
  expect(reportResponse.status()).toBe(200);
  const reportPayload: { reportUrl: string; expiresIn: number } = await reportResponse.json();
  expect(reportPayload.reportUrl).toContain("https://signed.example/");
  expect(reportPayload.expiresIn).toBeGreaterThan(0);

  const redirectPage = await context.newPage();
  await redirectPage.goto(`/${slug}`);
  await expect(redirectPage).toHaveURL(originalUrl);
  await redirectPage.close();

  await page.goto("/");
  const incrementedItem = page.locator(".link-item").filter({ hasText: slug });
  await expect(incrementedItem).toContainText("1 acessos");

  page.once("dialog", (dialog) => dialog.accept());
  await incrementedItem.getByRole("button", { name: "Excluir" }).click();
  await expect(page.locator(".link-item").filter({ hasText: slug })).toHaveCount(0);
});
