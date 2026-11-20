import { test, expect } from "playwright/test";
import data from "../data/parliament.json";
test("Portuguese flow: choose a representative, edit, save, print and recover from email failure", async ({
  page,
}) => {
  await page.route("**/api/representatives", (r) => r.fulfill({ json: data }));
  await page.route("**/api/generate-letter", async (r) => {
    const input = r.request().postDataJSON();
    expect(input.constituencyId).toBe("11");
    expect(input.consent).toBe(true);
    await r.fulfill({
      json: {
        letter:
          "À atenção do deputado escolhido\nAssembleia da República\n1249-068 Lisboa\n\nExmo. Senhor Deputado,\n\nGostava de ter transportes públicos mais frequentes.\n\nCom os melhores cumprimentos,\n[O teu nome]",
        ticket: "test-ticket",
        recipient: data.representatives.find((p) => p.constituencyId === "11"),
      },
    });
  });
  await page.route("**/api/send-letter", (r) =>
    r.fulfill({
      status: 503,
      json: {
        error:
          "Não foi possível enviar o email. A tua carta continua disponível para copiar ou descarregar.",
      },
    }),
  );
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-PT");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Começar a minha carta" }).click();
  await page
    .getByLabel("O teu assunto", { exact: true })
    .fill(
      "Gostava de ter transportes públicos mais frequentes na minha região.",
    );
  await page.getByRole("button", { name: "Escolher destinatário" }).click();
  await page.getByLabel("O teu círculo eleitoral").selectOption("11");
  await page
    .getByLabel("Deputado ou deputada", { exact: true })
    .selectOption(
      data.representatives.find((p) => p.constituencyId === "11")!.id,
    );
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Criar o meu rascunho" }).click();
  const editor = page.getByLabel("A tua carta — podes editar tudo");
  await expect(editor).toHaveValue(/Assembleia/);
  await editor.fill(
    (await editor.inputValue()).replace("[O teu nome]", "Pessoa de teste"),
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descarregar .txt" }).click();
  expect((await download).suggestedFilename()).toBe("carta-a-assembleia.txt");
  await page.getByText("Receber uma cópia por email", { exact: true }).click();
  await page
    .getByLabel("O teu email", { exact: true })
    .fill("test@example.com");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Enviar a minha cópia" }).click();
  await expect(page.locator(".alert[role=alert]")).toContainText(
    "continua disponível",
  );
  await expect(editor).toHaveValue(/Pessoa de teste/);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".print-letter")).toBeVisible();
  await expect(page.locator(".site-header")).toBeHidden();
});
test("does not silently offer recipients if official data is unavailable", async ({
  page,
}) => {
  await page.route("**/api/representatives", (r) =>
    r.fulfill({ status: 503, json: { error: "Unavailable" } }),
  );
  await page.goto("/escrever");
  await page
    .getByLabel("O teu assunto", { exact: true })
    .fill("Um assunto de teste suficientemente longo para continuar.");
  await page.getByRole("button", { name: "Escolher destinatário" }).click();
  await expect(page.locator(".alert[role=alert]")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Criar o meu rascunho" }),
  ).toBeDisabled();
});
