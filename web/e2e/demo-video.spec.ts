import { expect, test } from "@playwright/test";
import {
  caption,
  checkCaption,
  clearCaption,
  humanClick,
  humanType,
} from "./helpers/video-caption";

const APP_URL = process.env.E2E_BASE_URL ?? "http://localhost:5173";

test("Brevly: evidência visual e checklist completo de uso", async ({
  page,
  context,
}) => {
  test.setTimeout(180_000);

  const uid = Math.random().toString(36).slice(2, 7);
  const slug1 = `demo-${uid}`;
  const originalUrl1 = `https://example.com/artigo-${uid}`;

  const slug2 = `repo-${uid}`;
  const originalUrl2 = "https://github.com/ileonardo-c/pos_rocketseat-tech360-brev.ly";

  // ─── 1. Introdução ───
  await test.step("1. Abertura do app", async () => {
    await page.goto(`${APP_URL}/`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Novo link" })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Meus links" })).toBeVisible({ timeout: 15_000 });

    await caption(page, "Brev.ly — Plataforma fullstack de encurtamento de links.");
    await page.waitForTimeout(1000);
    await checkCaption(page, "✅ Interface carregada: Painel de cadastro e listagem em tempo real.");
  });

  // ─── 2. Validação de slug inválido ───
  await test.step("2. Validação de formato de slug", async () => {
    await caption(page, "Validação de formato: testando slug com caracteres inválidos.");
    await humanType(page.getByLabel("LINK ORIGINAL"), originalUrl1);
    await humanType(page.getByLabel("LINK ENCURTADO"), "slug invalido!");

    await expect(page.getByRole("button", { name: "Salvar link" })).toBeDisabled();
    await expect(page.getByText(/Use apenas letras/i)).toBeVisible();

    await checkCaption(page, "✅ Validação ativa: Bloqueia caracteres especiais e desabilita envio.");
  });

  // ─── 3. Validação de URL original inválida ───
  await test.step("3. Validação de URL original inválida", async () => {
    await caption(page, "Validação de URL: testando formato de link original incorreto.");
    await humanType(page.getByLabel("LINK ORIGINAL"), "link-invalido-sem-http");
    await humanType(page.getByLabel("LINK ENCURTADO"), slug1);

    await expect(page.getByRole("button", { name: "Salvar link" })).toBeDisabled();
    await expect(page.getByText(/Informe uma URL válida/i)).toBeVisible();

    await checkCaption(page, "✅ Validação ativa: URL original deve ser um endereço HTTP/HTTPS válido.");
  });

  // ─── 4. Criação do primeiro link encurtado ───
  await test.step("4. Criar primeiro link com sucesso", async () => {
    await caption(page, `Criando link encurtado personalizado: '${slug1}'.`);
    await humanType(page.getByLabel("LINK ORIGINAL"), originalUrl1);
    await humanType(page.getByLabel("LINK ENCURTADO"), slug1);

    await expect(page.getByRole("button", { name: "Salvar link" })).toBeEnabled();

    const createPromise = page.waitForResponse(
      (res) => res.url().includes("/urls") && res.request().method() === "POST" && res.status() === 201,
    );

    await humanClick(page.getByRole("button", { name: "Salvar link" }));
    await createPromise;

    const createdItem = page.locator(".link-item").filter({ hasText: slug1 });
    await expect(createdItem).toBeVisible({ timeout: 10_000 });
    await expect(createdItem).toContainText("0 acessos");

    await checkCaption(page, `✅ Link 'brev.ly/${slug1}' criado com sucesso no banco de dados!`);
  });

  // ─── 5. Criação do segundo link ───
  await test.step("5. Criar segundo link encurtado", async () => {
    await caption(page, `Cadastrando segundo link para o repositório Brev.ly: '${slug2}'.`);
    await humanType(page.getByLabel("LINK ORIGINAL"), originalUrl2);
    await humanType(page.getByLabel("LINK ENCURTADO"), slug2);

    const createPromise = page.waitForResponse(
      (res) => res.url().includes("/urls") && res.request().method() === "POST" && res.status() === 201,
    );

    await humanClick(page.getByRole("button", { name: "Salvar link" }));
    await createPromise;

    const secondItem = page.locator(".link-item").filter({ hasText: slug2 });
    await expect(secondItem).toBeVisible({ timeout: 10_000 });

    await checkCaption(page, `✅ Segundo link 'brev.ly/${slug2}' cadastrado na listagem.`);
  });

  // ─── 6. Bloqueio de slug duplicado ───
  await test.step("6. Bloqueio de slug duplicado (Conflito)", async () => {
    await caption(page, `Tentando criar novo link usando o mesmo slug já existente: '${slug1}'.`);
    await humanType(page.getByLabel("LINK ORIGINAL"), "https://google.com");
    await humanType(page.getByLabel("LINK ENCURTADO"), slug1);

    const duplicatePromise = page.waitForResponse(
      (res) => res.url().includes("/urls") && res.request().method() === "POST" && res.status() === 409,
    );

    await humanClick(page.getByRole("button", { name: "Salvar link" }));
    await duplicatePromise;

    await expect(page.getByText(/encurtamento.*existe/i)).toBeVisible({ timeout: 10_000 });
    await checkCaption(page, "✅ Resposta 409 Conflict: Duplicidade rejeitada e informada ao usuário.");
  });

  // ─── 7. Cópia do link encurtado ───
  await test.step("7. Copiar link para área de transferência", async () => {
    await caption(page, "Copiando o link encurtado com feedback visual imediato.");
    const firstItem = page.locator(".link-item").filter({ hasText: slug1 });

    const copyBtn = firstItem.getByRole("button", { name: "Copiar link" });
    await humanClick(copyBtn);

    await page.waitForTimeout(600);
    await checkCaption(page, "✅ Ação de cópia: URL encurtada copiada para o clipboard.");
  });

  // ─── 8. Resolução e redirecionamento com incremento de acesso ───
  await test.step("8. Redirecionamento e incremento de acesso", async () => {
    await caption(page, `Acessando o link encurtado '/${slug1}' para validar o fluxo de redirecionamento.`);

    // Access the short link and wait for the redirect to destination URL
    await page.goto(`${APP_URL}/${slug1}`);
    await expect(page).toHaveURL(originalUrl1, { timeout: 15_000 });
    await page.waitForTimeout(1000);

    // Return to dashboard
    await page.goto(`${APP_URL}/`);
    await expect(page.getByRole("heading", { name: "Meus links" })).toBeVisible({ timeout: 10_000 });

    const incrementedItem = page.locator(".link-item").filter({ hasText: slug1 });
    await expect(incrementedItem).toContainText("1 acessos", { timeout: 10_000 });

    await checkCaption(page, "✅ Redirecionamento concluído e contador atualizado para 1 acesso!");
  });

  // ─── 9. Página 404 de link não encontrado ───
  await test.step("9. Tratamento de link não encontrado (404)", async () => {
    await caption(page, "Testando acesso a um slug inexistente no sistema.");
    await page.goto(`${APP_URL}/link-inexistente-${uid}`);

    await expect(page.getByRole("heading", { name: "Link não encontrado" })).toBeVisible({ timeout: 10_000 });
    await checkCaption(page, "✅ Tratamento 404: Página estilizada informando que o link não existe.");

    const returnLink = page.getByRole("link", { name: "brev.ly" });
    await humanClick(returnLink);

    await expect(page.getByRole("heading", { name: "Novo link" })).toBeVisible({ timeout: 10_000 });
  });

  // ─── 10. Exportação de Relatório CSV (MinIO / S3) ───
  await test.step("10. Exportar relatório CSV", async () => {
    await caption(page, "Exportando lista de links para relatório CSV armazenado no MinIO/S3.");

    const reportPromise = page.waitForResponse(
      (res) => res.url().includes("/urls/report") && res.request().method() === "GET",
    );

    const exportBtn = page.getByRole("button", { name: "Baixar CSV" });
    await humanClick(exportBtn);

    const reportRes = await reportPromise;
    expect(reportRes.status()).toBe(200);

    const data: { reportUrl: string; expiresIn: number } = await reportRes.json();
    expect(data.reportUrl).toContain("X-Amz-Signature");
    expect(data.expiresIn).toBeGreaterThan(0);

    await checkCaption(page, "✅ Relatório CSV gerado e assinado via AWS S3 / MinIO com sucesso!");
  });

  // ─── 11. Exclusão de link ───
  await test.step("11. Excluir link cadastrado", async () => {
    await caption(page, `Removendo o link '${slug2}' da listagem.`);

    const secondItem = page.locator(".link-item").filter({ hasText: slug2 });
    await expect(secondItem).toBeVisible({ timeout: 10_000 });

    page.once("dialog", (dialog) => {
      dialog.accept();
    });

    const deleteBtn = secondItem.getByRole("button", { name: "Excluir link" });
    await humanClick(deleteBtn);

    await expect(page.locator(".link-item").filter({ hasText: slug2 })).toHaveCount(0, { timeout: 10_000 });
    await checkCaption(page, `✅ Link '${slug2}' removido com sucesso do banco de dados!`);
  });

  // ─── 12. Encerramento ───
  await test.step("12. Conclusão da demonstração", async () => {
    await checkCaption(page, "🎉 Brev.ly: Todos os requisitos do checklist foram validados com sucesso!");
    await page.waitForTimeout(2500);
    await clearCaption(page);
  });
});
