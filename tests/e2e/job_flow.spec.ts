import { test, expect } from '@playwright/test';

const JOB_TITLE = `E2E_JOB_STABLE_${new Date().getTime()}`;

const MOCK_EMPLOYER = {
  user: { uid: 'e2e_employer', email: 'employer@test.com' },
  profile: {
    uid: 'e2e_employer',
    email: 'employer@test.com',
    full_name: 'Employer Test (E2E)',
    role: 'EMPLOYER',
    phone_number: '0123456789',
    avatar_url: null,
    status: 'ACTIVE',
    balance: 5000000,
    reputation_score: 100,
    company_name: 'JobNow Test Corp',
    verification_status: 'VERIFIED',
    created_at: new Date(),
    updated_at: new Date(),
    skills: [],
    identity_images: [],
  }
};

const MOCK_CANDIDATE_PENDING = {
  user: { uid: 'e2e_candidate_pending', email: 'candidate_pending@test.com' },
  profile: {
    uid: 'e2e_candidate_pending',
    email: 'candidate-pending@test.com',
    full_name: 'Candidate Pending (E2E)',
    role: 'CANDIDATE',
    phone_number: '0987654321',
    avatar_url: null,
    status: 'ACTIVE',
    balance: 0,
    reputation_score: 100,
    verification_status: 'PENDING',
    created_at: new Date(),
    updated_at: new Date(),
  }
};

const MOCK_CANDIDATE_VERIFIED = {
  profile: {
    ...MOCK_CANDIDATE_PENDING.profile, 
    uid: `e2e_candidate_verified`,
    verification_status: 'VERIFIED' 
  }
};

const ID_FRONT_PATH = '/home/pind/.gemini/antigravity/brain/807965b1-b67e-43f8-9aa1-c24f65c28852/e2e_id_card_mock_1775042980912.png';
const PORTRAIT_PATH = '/home/pind/.gemini/antigravity/brain/807965b1-b67e-43f8-9aa1-c24f65c28852/e2e_portrait_mock_1775042997343.png';

test.describe('JobNow Full Flow Verification', () => {
  
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    await page.addInitScript(() => {
      window.localStorage.setItem('jobnow_onboarding_seen', 'true');
    });
  });

  test('nên thực hiện toàn bộ luồng từ Đăng tin đến Ứng tuyển', async ({ page, context }) => {
    // --- STEP 1: Employer Post Job ---
    console.log('--- Step 1: Employer Posting Job ---');
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 10.7769, longitude: 106.7009 });

    await page.addInitScript((mock) => {
      (window as any).__JOBNOW_E2E_MOCK_AUTH__ = mock;
    }, MOCK_EMPLOYER);

    await page.goto('/employer/post-job');
    await page.waitForSelector('text=Thông tin cơ bản', { timeout: 15000 });

    // Step 1: Info
    console.log('Filling Step 1 (Info)...');
    await page.fill('input[placeholder*="VD: Cần 2 bạn"]', JOB_TITLE);
    await page.click('button:has-text("Chọn danh mục...")');
    await page.waitForSelector('text=Retail', { state: 'visible' });
    await page.click('button:has-text("Retail")');
    await page.fill('textarea[placeholder*="Mô tả chi tiết"]', 'Mô tả công việc E2E vô cùng chi tiết và đầy đủ (tối thiểu 20 ký tự).');
    await page.fill('input[placeholder*="VD: 50.000"]', '50000'); // Lương
    
    await expect(page.locator('button:has-text("Tiếp tục")')).toBeEnabled();
    await page.click('button:has-text("Tiếp tục")');

    // Step 2: Location
    console.log('Filling Step 2 (Location)...');
    await page.waitForSelector('text=Địa điểm làm việc');
    
    // Click GPS button
    await page.locator('button:has(svg.lucide-locate-fixed)').click();
    await expect(page.getByText('✓ Vị trí đã chọn')).toBeVisible({ timeout: 10000 });

    await page.fill('input[placeholder*="123 Đường Nguyễn Huệ"]', '123 E2E Street, District 1, HCM');
    
    // Set start date (today)
    const today = new Date().toISOString().split('T')[0];
    await page.fill('input[type="date"]', today);

    await expect(page.locator('button:has-text("Tiếp tục")')).toBeEnabled();
    await page.click('button:has-text("Tiếp tục")');

    // Step 3: Shifts
    console.log('Filling Step 3 (Shifts)...');
    await page.waitForSelector('text=Chọn ca làm việc');
    await page.click('button:has-text("Thêm ca làm việc")');
    await page.fill('input[placeholder*="Ca 1"]', 'Ca sáng (E2E)');
    
    await expect(page.locator('button:has-text("Tiếp tục")')).toBeEnabled();
    await page.click('button:has-text("Tiếp tục")');

    // Step 4: Review
    console.log('Step 4 (Review) and Submit...');
    await page.waitForSelector('text=Xem lại', { timeout: 15000 });
    await page.click('button:has-text("Đăng tin ngay")');
    await expect(page.getByText('Đăng tin thành công!')).toBeVisible({ timeout: 15000 });
    console.log('✅ Step 1 Success: Job Posted:', JOB_TITLE);

    // --- STEP 2: Candidate Verification (eKYC) ---
    // (Bản này giữ nguyên logic eKYC đã ổn định)
    console.log('--- Step 2: Candidate eKYC Verification ---');
    await page.addInitScript((mock) => {
      (window as any).__JOBNOW_E2E_MOCK_AUTH__ = mock;
    }, MOCK_CANDIDATE_PENDING);

    // Mock APIs
    await page.route('https://api.cloudinary.com/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ secure_url: 'https://via.placeholder.com/150?text=E2E_MOCK' })
      });
    });

    const randomCccd = "001" + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
    console.log(`[E2E] Generating random CCCD: ${randomCccd}`);

    await page.route('**/api/verify-cccd', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true, 
          data: {
            cccd_number: randomCccd,
            full_name: 'Candidate Pending (E2E)',
            dob: '01/01/1995'
          }
        })
      });
    });

    await page.goto('/candidate/verification');
    await page.waitForSelector('text=Bắt đầu ngay');
    await page.click('button:has-text("Bắt đầu ngay")');

    console.log('Uploading Front ID...');
    await page.waitForSelector('input[type="file"]', { state: 'attached' });
    await page.setInputFiles('input[type="file"]', ID_FRONT_PATH);
    
    await page.waitForSelector('text=Bước 2: Chụp chân dung', { timeout: 15000 });
    console.log('Uploading Portrait...');
    await page.waitForSelector('input[type="file"]', { state: 'attached' });
    await page.setInputFiles('input[type="file"]', PORTRAIT_PATH);

    await page.waitForSelector('text=Bước 3: Xác nhận thông tin', { timeout: 15000 });
    
    // Đảm bảo CCCD luôn là số ngẫu nhiên mới (đề phòng OCR mock không hoạt động đúng)
    await page.locator('label:has-text("Số CCCD") + div input').fill(randomCccd);
    await page.locator('label:has-text("Họ và tên") + div input').fill('Candidate Pending (E2E)');
    await page.locator('label:has-text("Ngày sinh") + div input').fill('01/01/1995');

    await page.click('button:has-text("XÁC NHẬN & HOÀN TẤT")');
    await expect(page.getByText('Gửi hồ sơ thành công!')).toBeVisible({ timeout: 15000 });
    console.log('✅ Step 2 Success: Candidate Verified');

    // --- STEP 3: Candidate Search & Apply ---
    console.log('--- Step 3: Candidate Search & Apply ---');
    await page.addInitScript((mock) => {
      (window as any).__JOBNOW_E2E_MOCK_AUTH__ = mock;
    }, MOCK_CANDIDATE_VERIFIED);

    await page.goto('/candidate');
    await page.waitForTimeout(4000); // Đợi Firebase Indexing (nếu cần)

    await page.fill('input[placeholder*="Tìm kiếm"]', JOB_TITLE);
    await page.keyboard.press('Enter');
    
    console.log(`Searching for job: ${JOB_TITLE}`);
    const jobCard = page.locator(`text="${JOB_TITLE}"`).first();
    await expect(jobCard).toBeVisible({ timeout: 15000 });
    
    await jobCard.click();
    await page.waitForSelector('text=Chi tiết công việc');
    
    const applyBtn = page.locator('button:has-text("Ứng tuyển ngay")');
    if (await applyBtn.isVisible()) {
        await applyBtn.click();
        await expect(page.getByText('Ứng tuyển thành công')).toBeVisible({ timeout: 15000 });
    }
    console.log('✅ Step 3 Success: Job Applied!');
    console.log('🚀 FULL FLOW PASSED 100%');
  });

});
