import { test, expect } from '@playwright/test';

// Use same IDs as the main job_flow.spec.ts to ensure data exists
const MOCK_UID_EMPLOYER = 'e2e_employer'; 
const MOCK_UID_CANDIDATE = 'e2e_candidate';

test.describe('Quick Health Check (Smoke Test)', () => {
  
  test.beforeEach(async ({ context }) => {
    // Inject Mock Auth globally
    await context.addInitScript((uid) => {
      window.localStorage.setItem('__JOBNOW_E2E_MOCK_AUTH__', uid);
    }, MOCK_UID_EMPLOYER);
  });

  test('Employer Pages', async ({ page }) => {
    const pages = [
      { url: '/employer', title: 'Dashboard' },
      { url: '/employer/jobs', title: 'Tin tuyển dụng' },
      { url: '/employer/wallet', title: 'Ví' },
      { url: '/employer/applicants', title: 'Người ứng tuyển' },
      { url: '/profile', title: 'Hồ sơ' },
    ];

    for (const p of pages) {
      console.log(`Checking Employer Page: ${p.url}`);
      await page.goto(p.url);
      
      // Wait for Root to have actual text (bypass skeletons)
      // We expect some common Vietnamese text to appear like "Chào" or "Tin"
      await page.waitForFunction(() => document.body.innerText.trim().length > 100, { timeout: 20000 }).catch(() => {
        console.warn(`Wait for content timed out on ${p.url}, proceeding anyway...`);
      });
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('404');
      expect(bodyText.length).toBeGreaterThan(20);
      
      console.log(`✅ Employer ${p.url} looks good.`);
      await page.screenshot({ path: `tests/e2e/screenshots/smoke_employer_${p.url.replace(/\//g, '_') || 'index'}.png` });
    }
  });

  test('Candidate Pages', async ({ page, context }) => {
    // Override with Candidate Mock
    await context.addInitScript((uid) => {
      window.localStorage.setItem('__JOBNOW_E2E_MOCK_AUTH__', uid);
    }, MOCK_UID_CANDIDATE);

    const pages = [
      { url: '/candidate', title: 'Dashboard' },
      { url: '/candidate/applications', title: 'Việc đã ứng tuyển' },
      { url: '/candidate/wallet', title: 'Ví' },
      { url: '/profile', title: 'Hồ sơ' },
    ];

    for (const p of pages) {
      console.log(`Checking Candidate Page: ${p.url}`);
      await page.goto(p.url);
      
      await page.waitForFunction(() => document.body.innerText.trim().length > 100, { timeout: 20000 }).catch(() => {
        console.warn(`Wait for content timed out on ${p.url}, proceeding anyway...`);
      });
      
      const bodyText = await page.innerText('body');
      expect(bodyText).not.toContain('404');
      expect(bodyText.length).toBeGreaterThan(20);
      
      console.log(`✅ Candidate ${p.url} looks good.`);
      await page.screenshot({ path: `tests/e2e/screenshots/smoke_candidate_${p.url.replace(/\//g, '_') || 'index'}.png` });
    }
  });
});
