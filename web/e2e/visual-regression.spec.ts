import { expect, test, type Page } from "@playwright/test";

interface LinkFixture {
  id: string;
  originalUrl: string;
  slug: string;
  accessCount: number;
  createdAt: string;
}

const LINKS_FIXTURE: LinkFixture[] = [
  {
    id: "1",
    slug: "Portfolio-Dev",
    originalUrl: "https://devsite.portfolio.com.br/devname-123456",
    accessCount: 30,
    createdAt: "2026-05-17T00:00:00.000Z",
  },
  {
    id: "2",
    slug: "Linkedin-Profile",
    originalUrl: "https://linkedin.com/in/myprofile",
    accessCount: 15,
    createdAt: "2026-05-17T00:00:00.000Z",
  },
  {
    id: "3",
    slug: "Github-Project",
    originalUrl: "https://github.com/devname/project-name-v2",
    accessCount: 34,
    createdAt: "2026-05-17T00:00:00.000Z",
  },
  {
    id: "4",
    slug: "Figma-Encurtador-de-Links",
    originalUrl: "https://figma.com/design/file/Encurtador-de-Links",
    accessCount: 53,
    createdAt: "2026-05-17T00:00:00.000Z",
  },
];

type HomeState = "empty" | "links";
type StatusState = "redirect" | "not-found";

function expectClose(label: string, actual: number, expected: number, tolerance = 2) {
  expect(
    Math.abs(actual - expected),
    `${label}: expected ${expected}px (+/-${tolerance}), got ${actual}px`,
  ).toBeLessThanOrEqual(tolerance);
}

async function getBox(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  expect(box).not.toBeNull();
  return box as { x: number; y: number; width: number; height: number };
}

async function getCssPx(page: Page, selector: string, property: string) {
  const value = await page.locator(selector).first().evaluate(
    (element, cssProperty) => {
      const style = window.getComputedStyle(element);
      return style.getPropertyValue(cssProperty);
    },
    property,
  );

  return Number.parseFloat(value);
}

async function mockLinksApi(page: Page, links: LinkFixture[]) {
  await page.route(
    (url) => url.hostname === "localhost" && url.port === "3333" && url.pathname.startsWith("/urls"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());

      if (request.method() === "GET" && pathname === "/urls") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(links),
        });
        return;
      }

      if (request.method() === "GET" && pathname === "/urls/report") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            reportUrl:
              "http://localhost:9000/brevly-reports/mock-report.csv?X-Amz-Signature=visual-regression",
            expiresIn: 3600,
          }),
        });
        return;
      }

      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Link nao encontrado.",
        }),
      });
    },
  );
}

async function mockRedirectApi(page: Page, slug = "Linkedin-Profile") {
  await page.addInitScript(() => {
    window.open = () => null;
  });

  await page.route(
    (url) => url.hostname === "localhost" && url.port === "3333" && url.pathname.startsWith("/urls"),
    async (route) => {
      const request = route.request();
      const { pathname } = new URL(request.url());

      if (request.method() === "GET" && pathname === `/urls/${slug}`) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            fullUrl: "https://linkedin.com/in/myprofile",
          }),
        });
        return;
      }

      if (request.method() === "POST" && pathname === `/urls/${slug}/increment`) {
        await route.fulfill({
          status: 204,
          body: "",
        });
        return;
      }

      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Link nao encontrado.",
        }),
      });
    },
  );
}

async function waitForStableVisualState(page: Page) {
  await page.addStyleTag({
    content:
      "*,*::before,*::after{animation:none !important;transition:none !important;caret-color:transparent !important;}",
  });

  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  await page.waitForTimeout(120);
}

async function expectHomeSizing(page: Page, viewport: { width: number; height: number }) {
  const shell = await getBox(page, ".home-shell");
  const panel = await getBox(page, ".panel");
  const input = await getBox(page, ".input-group input");
  const button = await getBox(page, ".primary-btn");
  const secondaryButton = await getBox(page, ".secondary-btn");
  const innerWidth = await page.evaluate(() => window.innerWidth);

  const expectedShellWidth = viewport.width === 1366 ? Math.min(980, innerWidth - 24) : innerWidth - 24;

  expectClose("home-shell width", shell.width, expectedShellWidth);

  if (viewport.width === 1366) {
    expectClose("secondary button height (desktop)", secondaryButton.height, 32);
    expect(panel.height).toBeGreaterThanOrEqual(330);
  } else {
    expectClose("secondary button height (mobile)", secondaryButton.height, 36);
    expect(panel.height).toBeGreaterThanOrEqual(300);
  }

  expectClose("input height", input.height, 48);
  expectClose("primary button height", button.height, 48);
  expectClose(
    "panel padding-left",
    await getCssPx(page, ".panel", "padding-left"),
    viewport.width === 1366 ? 32 : 24,
  );
  expectClose("panel title font-size", await getCssPx(page, ".panel-title", "font-size"), 24);
  expectClose("panel title line-height", await getCssPx(page, ".panel-title", "line-height"), 32);
  expectClose("label font-size", await getCssPx(page, ".input-label", "font-size"), 10);
  expectClose("label line-height", await getCssPx(page, ".input-label", "line-height"), 14);
}

async function expectStatusSizing(page: Page, viewport: { width: number; height: number }) {
  const card = await getBox(page, ".status-card");
  const innerWidth = await page.evaluate(() => window.innerWidth);
  const expectedCardWidth = Math.min(734, innerWidth - 32);

  expectClose("status card width", card.width, expectedCardWidth);

  if (viewport.width === 1366) {
    expectClose("status text font-size (desktop)", await getCssPx(page, ".status-text", "font-size"), 14);
    expectClose("status text line-height (desktop)", await getCssPx(page, ".status-text", "line-height"), 18);
  } else {
    expectClose("status text font-size (mobile)", await getCssPx(page, ".status-text", "font-size"), 14);
    expectClose("status text line-height (mobile)", await getCssPx(page, ".status-text", "line-height"), 18);
  }

  expectClose("status title font-size", await getCssPx(page, ".status-title", "font-size"), 24);
  expectClose("status title line-height", await getCssPx(page, ".status-title", "line-height"), 32);
}

async function assertHomeVisual(
  page: Page,
  state: HomeState,
  viewport: { width: number; height: number },
  snapshotName: string,
  maxDiffPixelRatio: number,
) {
  await page.setViewportSize(viewport);
  await mockLinksApi(page, state === "links" ? LINKS_FIXTURE : []);
  await page.goto("/");

  if (state === "links") {
    await page.evaluate(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>(".new-link-form input");
      const originalInput = inputs[0];
      const slugInput = inputs[1];

      if (originalInput) {
        originalInput.value = "linkedin.com/in/myprofile";
      }

      if (slugInput) {
        slugInput.value = "Linkedin-Profile";
      }

      document
        .querySelectorAll(".input-group.has-error")
        .forEach((group) => group.classList.remove("has-error"));

      document.querySelectorAll(".input-group small, .form-error").forEach((node) => node.remove());

      const submitButton = document.querySelector<HTMLButtonElement>(".primary-btn");
      if (submitButton) {
        submitButton.disabled = false;
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }

  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  await waitForStableVisualState(page);
  await expectHomeSizing(page, viewport);
  const screenshot = await page.screenshot({
    fullPage: false,
    scale: "css",
  });
  expect(screenshot).toMatchSnapshot(["figma", snapshotName], {
    maxDiffPixelRatio,
    threshold: 0.08,
  });
}

async function assertStatusVisual(
  page: Page,
  state: StatusState,
  viewport: { width: number; height: number },
  snapshotName: string,
  maxDiffPixelRatio: number,
) {
  await page.setViewportSize(viewport);

  if (state === "redirect") {
    await mockRedirectApi(page);
    await page.goto("/Linkedin-Profile");
    await expect(page.getByRole("heading", { name: "Redirecionando..." })).toBeVisible();
  } else {
    await page.goto("/not-found");
    await expect(page.getByRole("heading", { name: "Link não encontrado" })).toBeVisible();
  }

  await waitForStableVisualState(page);
  await expectStatusSizing(page, viewport);
  const screenshot = await page.screenshot({
    fullPage: false,
    scale: "css",
  });
  expect(screenshot).toMatchSnapshot(["figma", snapshotName], {
    maxDiffPixelRatio,
    threshold: 0.08,
  });
}

test.describe("visual regression from figma baselines", () => {
  test("empty state desktop 1366x720", async ({ page }) => {
    await assertHomeVisual(
      page,
      "empty",
      { width: 1366, height: 720 },
      "empty.desktop.1366x720.png",
      0.025,
    );
  });

  test("links state desktop 1366x720", async ({ page }) => {
    await assertHomeVisual(
      page,
      "links",
      { width: 1366, height: 720 },
      "links.desktop.1366x720.png",
      0.03,
    );
  });

  test("redirect desktop 1366x720", async ({ page }) => {
    await assertStatusVisual(
      page,
      "redirect",
      { width: 1366, height: 720 },
      "redirect.desktop.1366x720.png",
      0.01,
    );
  });

  test("not found desktop 1366x720", async ({ page }) => {
    await assertStatusVisual(
      page,
      "not-found",
      { width: 1366, height: 720 },
      "not-found.desktop.1366x720.png",
      0.01,
    );
  });

  test("empty state mobile 390x788", async ({ page }) => {
    await assertHomeVisual(
      page,
      "empty",
      { width: 390, height: 788 },
      "empty.mobile.390x788.png",
      0.06,
    );
  });

  test("links state mobile 390x788", async ({ page }) => {
    await assertHomeVisual(
      page,
      "links",
      { width: 390, height: 788 },
      "links.mobile.390x788.png",
      0.09,
    );
  });

  test("redirect mobile 390x784", async ({ page }) => {
    await assertStatusVisual(
      page,
      "redirect",
      { width: 390, height: 784 },
      "redirect.mobile.390x784.png",
      0.03,
    );
  });

  test("not found mobile 390x784", async ({ page }) => {
    await assertStatusVisual(
      page,
      "not-found",
      { width: 390, height: 784 },
      "not-found.mobile.390x784.png",
      0.04,
    );
  });
});
