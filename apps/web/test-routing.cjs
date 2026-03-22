const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/employer/profile/edit');
  await page.waitForTimeout(2000);
  const title = await page.title();
  const text = await page.evaluate(() => document.body.innerText);
  console.log('Title:', title);
  console.log('Text:', text.substring(0, 500));
  await browser.close();
})();
