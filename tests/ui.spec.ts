import { expect, test } from "@playwright/test";

test("post creation, reload, editing and history remain connected", async ({
  page,
}) => {
  await page.goto("/posts/new");
  await page
    .getByRole("textbox", { name: "Пост атауы" })
    .fill("Junior React Developer");
  await page
    .getByRole("textbox", { name: "Компания", exact: true })
    .fill("Demo Team");
  await page.getByRole("textbox", { name: "Қала", exact: true }).fill("Алматы");
  await page
    .getByRole("textbox", { name: "Сипаттама" })
    .fill("React компоненттерін жасау және мобильді интерфейстерді дамыту.");
  await expect(page.locator(".live-preview")).toContainText(
    "Junior React Developer",
  );
  await page.getByRole("button", { name: "Жоба ретінде сақтау" }).click();
  await expect(page).toHaveURL(/\/posts\/(?!new)[^/?]+\?saved=1/);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Junior React Developer",
  );
  await page.getByRole("link", { name: "Постты өңдеу" }).click();
  await page
    .getByRole("textbox", { name: "Пост атауы" })
    .fill("React Developer — Updated");
  await page.getByRole("button", { name: "Жоба ретінде сақтау" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "React Developer — Updated",
  );
  await page.goto("/dashboard");
  await page
    .getByRole("combobox", { name: "Әрекет сүзгісі" })
    .selectOption("UPDATE");
  await expect(page.getByTestId("history-row")).toHaveCount(1);
  await expect(page.getByTestId("history-row")).toContainText(
    "React Developer — Updated",
  );
  await page.getByRole("textbox", { name: "Тарихтан іздеу" }).fill("not-found");
  await expect(page.getByRole("status")).toContainText(
    "Тарихтан ештеңе табылмады",
  );
});

test("360px UI supports navigation and the three weekly pages", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  for (const path of [
    "/",
    "/dashboard",
    "/posts/new",
    "/posts/demo-frontend",
    "/posts/demo-frontend?edit=1",
  ]) {
    await page.goto(path);
    await expect(page.locator("main")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.getByRole("button", { name: "Мәзір" }).click();
  await page.getByRole("link", { name: "Мамандықтар", exact: true }).click();
  await expect(page).toHaveURL("/careers");
});

test("URL filters survive reload and reduced motion disables the illustration", async ({
  page,
}) => {
  await page.goto("/jobs");
  await page
    .getByRole("combobox", { name: "Формат", exact: true })
    .selectOption("REMOTE");
  await expect(page).toHaveURL(/format=REMOTE/);
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Формат", exact: true }),
  ).toHaveValue("REMOTE");
  await expect(page.getByTestId("job-card")).toHaveCount(2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dashboard");
  await expect(page.locator(".art-core")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".page-enter")).toHaveCSS("animation-name", "none");
});
