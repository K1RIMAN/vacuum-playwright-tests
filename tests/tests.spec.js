const { test, expect } = require('@playwright/test');

test.describe('Полное тестирование лендинга', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://polis812.github.io/vacuu/');
  });

  test('Проверка загрузки страницы', async ({ page }) => {
    await expect(page).toHaveTitle(/Vacuu/i);
  });

  test('Проверка ошибок в консоли', async ({ page }) => {
    const errors = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    await page.reload();

    console.log('Ошибки в консоли:', errors);
    expect(errors.length).toBe(0);
  });

  test('Проверка наличия основных элементов', async ({ page }) => {
    const elements = [
      'h1', // Заголовок
      'nav', // Навигация
      'footer', // Подвал
      'button', // Кнопки
      'form', // Формы
    ];

    for (const selector of elements) {
      await expect(page.locator(selector)).toBeVisible();
    }
  });

  test('Проверка работы кнопки "Отправить"', async ({ page }) => {
    const submitButton = page.locator('text=Отправить');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    const errorMsg = page.locator('.error-message');
    await expect(errorMsg).not.toBeVisible();
  });

  test('Проверка адаптивности (мобильные устройства)', async ({ page }) => {
    const viewportSizes = [
      { width: 375, height: 667 }, // iPhone 6/7/8
      { width: 414, height: 896 }, // iPhone XR
      { width: 768, height: 1024 } // iPad
    ];

    for (const size of viewportSizes) {
      await page.setViewportSize(size);
      console.log(`Проверка разрешения: ${size.width}x${size.height}`);
      await expect(page.locator('nav')).toBeVisible();
    }
  });

  test('Проверка скорости загрузки', async ({ page }) => {
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );

    const loadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
    console.log(`Время загрузки страницы: ${loadTime} мс`);

    expect(loadTime).toBeLessThan(5000);
  });

  test('Проверка наличия SSL-сертификата (HTTPS)', async ({ page }) => {
    const url = page.url();
    expect(url.startsWith('https://')).toBeTruthy();
  });

  test('Проверка всех ссылок', async ({ page }) => {
    const links = await page.$$eval('a', links => links.map(link => link.href));

    for (const link of links) {
      const response = await page.goto(link);
      expect(response.status()).toBeLessThan(400);
    }
  });

});
