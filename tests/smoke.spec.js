const { test, expect } = require('@playwright/test');

test.describe('SafeNet Smoke', () => {
  test('Startseite laedt und leitet auf Sprache um', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(de|en)(\/index\.html)?$/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('EN Generator erzeugt Passwort', async ({ page }) => {
    await page.goto('/en/pages/generator.html');

    const output = page.locator('#password-output');
    await expect(output).toBeVisible();

    const generateBtn = page.locator('#generate-btn');
    await generateBtn.click();

    const wert = await output.inputValue();
    expect(wert).toBeTruthy();
    expect(wert).not.toContain('Click Generate');
  });

  test('DE Generator erzeugt Passwort', async ({ page }) => {
    await page.goto('/de/pages/generator.html');

    const output = page.locator('#password-output');
    await expect(output).toBeVisible();

    const generateBtn = page.locator('#generate-btn');
    await generateBtn.click();

    const wert = await output.inputValue();
    expect(wert).toBeTruthy();
    expect(wert).not.toContain('Klicke auf Generieren');
  });

  test('EN Tresor laedt Grundlayout', async ({ page }) => {
    await page.goto('/en/pages/tresor.html');
    await expect(page.locator('#saved-passwords-list')).toBeVisible();

    // Ohne Login kann entweder ein Hinweis oder eine Liste angezeigt werden.
    const text = await page.locator('#saved-passwords-list').innerText();
    expect(typeof text).toBe('string');
  });

  test('DE Kontaktformular laedt', async ({ page }) => {
    await page.goto('/de/pages/kontakt.html');
    await expect(page.locator('#kontakt-form')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('EN Kontaktformular laedt', async ({ page }) => {
    await page.goto('/en/pages/kontakt.html');
    await expect(page.locator('#kontakt-form')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
