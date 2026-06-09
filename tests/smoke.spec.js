import { test, expect } from '@playwright/test';

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

  test('DE Ransomware Demo laedt', async ({ page }) => {
    await page.goto('/de/pages/ransomware.html');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#rw-start')).toBeVisible();
  });

  test('EN Ransomware Demo laedt', async ({ page }) => {
    await page.goto('/en/pages/ransomware.html');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#rw-start')).toBeVisible();
  });

  test('DE MFA-Bypass Demo laedt', async ({ page }) => {
    await page.goto('/de/pages/mfa-bypass.html');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#mfa-approve')).toBeVisible();
    await expect(page.locator('#mfa-deny')).toBeVisible();
  });

  test('EN MFA-Bypass Demo laedt', async ({ page }) => {
    await page.goto('/en/pages/mfa-bypass.html');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#mfa-approve')).toBeVisible();
    await expect(page.locator('#mfa-deny')).toBeVisible();
  });

  test('DE Feedback Formular laedt', async ({ page }) => {
    await page.goto('/de/pages/feedback.html');
    await expect(page.locator('#feedback-form')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('EN Feedback Formular laedt', async ({ page }) => {
    await page.goto('/en/pages/feedback.html');
    await expect(page.locator('#feedback-form')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('DE News Seite laedt', async ({ page }) => {
    await page.goto('/de/pages/news.html');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('EN News Seite laedt', async ({ page }) => {
    await page.goto('/en/pages/news.html');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('DE Notizen Seite laedt', async ({ page }) => {
    await page.goto('/de/pages/notizen.html');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('EN Notizen Seite laedt', async ({ page }) => {
    await page.goto('/en/pages/notizen.html');
    await expect(page.locator('h1')).toBeVisible();
  });

  // ===== Alle Info- und sonstigen Seiten (h1 sichtbar, kein 404) =====
  const alleSeiten = [
    'angriff', 'bruteforce', 'keylogger', 'phishing', 'socialengineering',
    'wörterbuchangriff', 'ransomware', 'mfa-bypass', '2fa', 'mitm', 'quishing',
    'analysator', 'generator', 'tresor', 'tutorials', 'übersns',
    'login', 'register', 'reset-password', 'einstellungen', 'meine-stats',
    'kontakt', 'feedback', 'news', 'notizen',
    'datenschutzerklärung', 'haftungsausschluss', 'impressum',
  ];

  for (const seite of alleSeiten) {
    test(`DE ${seite} laedt ohne Fehler`, async ({ page }) => {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));

      const response = await page.goto(`/de/pages/${seite}.html`);
      expect(response.status(), `HTTP-Status fuer /de/pages/${seite}.html`).toBe(200);
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

      // Hintergrundfarbe darf nicht schwarz sein
      await page.waitForLoadState('load');
      const bg = await page.evaluate(() =>
        getComputedStyle(document.body).backgroundColor
      ).catch(() => null);
      if (bg) expect(bg, `Body-Hintergrund auf /de/pages/${seite}.html ist schwarz!`).not.toBe('rgb(0, 0, 0)');

      // Keine JS-Fehler (SyntaxError etc.)
      const kritisch = errors.filter(
        (e) => e.includes('SyntaxError') || e.includes('ReferenceError') || e.includes('TypeError')
      );
      expect(kritisch, `JS-Fehler auf /de/pages/${seite}.html: ${kritisch.join(', ')}`).toHaveLength(0);
    });

    test(`EN ${seite} laedt ohne Fehler`, async ({ page }) => {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));

      const response = await page.goto(`/en/pages/${seite}.html`);
      expect(response.status(), `HTTP-Status fuer /en/pages/${seite}.html`).toBe(200);
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

      await page.waitForLoadState('load');
      const bg = await page.evaluate(() =>
        getComputedStyle(document.body).backgroundColor
      ).catch(() => null);
      if (bg) expect(bg, `Body-Hintergrund auf /en/pages/${seite}.html ist schwarz!`).not.toBe('rgb(0, 0, 0)');

      const kritisch = errors.filter(
        (e) => e.includes('SyntaxError') || e.includes('ReferenceError') || e.includes('TypeError')
      );
      expect(kritisch, `JS-Fehler auf /en/pages/${seite}.html: ${kritisch.join(', ')}`).toHaveLength(0);
    });
  }

  // ===== Interaktive Demo-Tests =====

  test('DE Woerterbuchangriff Demo funktioniert', async ({ page }) => {
    await page.goto('/de/pages/wörterbuchangriff.html');
    await expect(page.locator('#wb-start')).toBeVisible();
    await page.fill('#wb-target', '123456');
    await page.click('#wb-start');
    // Warten bis Ergebnis erscheint (gefunden oder nicht gefunden)
    await expect(page.locator('#wb-result')).not.toBeEmpty({ timeout: 15000 });
    const result = await page.locator('#wb-result').innerText();
    expect(result).toContain('Gefunden');
  });

  test('EN Woerterbuchangriff Demo funktioniert', async ({ page }) => {
    await page.goto('/en/pages/wörterbuchangriff.html');
    await expect(page.locator('#wb-start')).toBeVisible();
    await page.fill('#wb-target', '123456');
    await page.click('#wb-start');
    await expect(page.locator('#wb-result')).not.toBeEmpty({ timeout: 15000 });
    const result = await page.locator('#wb-result').innerText();
    expect(result.toLowerCase()).toMatch(/found|gefunden/);
  });

  test('DE Passwortanalysator gibt Bewertung aus', async ({ page }) => {
    await page.goto('/de/pages/analysator.html');
    const input = page.locator('input[type="password"], input[type="text"]').first();
    await expect(input).toBeVisible();
    await input.fill('Test1234!');
    // Bewertung sollte sichtbar werden
    await expect(page.locator('.strength-bar, #strength-bar, #result, .result, [id*="result"], [id*="strength"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('DE Bruteforce Demo startet', async ({ page }) => {
    await page.goto('/de/pages/bruteforce.html');
    await expect(page.locator('h1')).toBeVisible();
    // Start-Button muss vorhanden sein
    const startBtn = page.locator('button').filter({ hasText: /start|angriff/i }).first();
    await expect(startBtn).toBeVisible();
  });

  test('Navbar wird injiziert (DE Startseite)', async ({ page }) => {
    await page.goto('/de/index.html');
    await expect(page.locator('.navbar')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('.nav-links')).toBeVisible();
  });

  test('Footer wird injiziert (DE Startseite)', async ({ page }) => {
    await page.goto('/de/index.html');
    await expect(page.locator('#footer footer, footer').first()).toBeVisible({ timeout: 8000 });
  });

  test('404 Seite wird angezeigt', async ({ page }) => {
    const response = await page.goto('/de/404.html');
    expect([200, 404]).toContain(response.status());
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
