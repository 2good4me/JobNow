const { test, expect } = require('@playwright/test');

test('Employer flows', async ({ page }) => {
    test.setTimeout(30000);
    await page.setViewportSize({ width: 390, height: 844 });
    console.log("Navigating to register...");
    await page.goto('http://127.0.0.1:3000/register');
    
    // Skip Onboarding if present
    try {
        await page.waitForSelector('button:has-text("Bỏ qua")', { timeout: 3000 });
        await page.click('button:has-text("Bỏ qua")');
        console.log('Skipped onboarding');
    } catch (e) {
        console.log('Onboarding not found or already skipped');
    }

    await page.fill('input[type="email"]', `emp${Date.now()}@jobnow.com`);
    await page.fill('input[type="password"]', 'password123');

    const passwords = await page.$$('input[type="password"]');
    if (passwords.length > 1) {
        await passwords[1].fill('password123');
    }

    // Click Employer role
    console.log("Selecting Employer role...");
    try {
        await page.click('text=Tuyển dụng', { timeout: 5000 });
    } catch (e) {
        console.log("Role selection button not found, maybe already at form.");
    }

    // Submit
    const btns = await page.$$('button');
    for (const btn of btns) {
        const text = await btn.textContent();
        if (text && text.includes('Đăng ký')) {
            await btn.click();
            break;
        }
    }

    // Wait for onboarding
    await page.waitForURL('**/onboarding');

    // Fill onboarding
    const nameInputs = await page.$$('input[type="text"]');
    if (nameInputs.length > 0) {
        await nameInputs[0].fill('Nguyen Tech');
    }

    const nextBtns = await page.$$('button');
    for (const btn of nextBtns) {
        const text = await btn.textContent();
        if (text && (text.includes('Hoàn tất') || text.includes('Xác nhận'))) {
            await btn.click();
            break;
        }
    }

    // Wait for employer dashboard
    await page.waitForURL('**/employer', { timeout: 10000 });
    await page.waitForTimeout(2000); // wait for animations
    await page.screenshot({ path: '/home/pind/.gemini/antigravity/brain/46b4b700-3f3b-4e1b-be29-ef00938d24de/employer_dashboard.png' });

    // Navigate to applicants
    const navSpans = await page.$$('span');
    for (const span of navSpans) {
        const text = await span.textContent();
        if (text && text.includes('Quản lý')) {
            await span.click();
            break;
        }
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e-results/employer_applicants.png' });

    // Navigate to profile
    await page.goto('http://127.0.0.1:3000/employer/profile');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e-results/employer_profile.png' });

});
