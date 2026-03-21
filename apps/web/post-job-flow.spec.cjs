const { test, expect } = require('@playwright/test');
const { chromium } = require('@playwright/test');

test('Complete Post Job Flow', async ({ page, context }) => {
  // Cấp quyền Geolocation
  await context.grantPermissions(['geolocation']);
  // Thiết lập vị trí mặc định (TP.HCM)
  await context.setGeolocation({ latitude: 10.7769, longitude: 106.7009 });

  // 1. Cấu hình viewport cho Mobile
  await page.setViewportSize({ width: 390, height: 844 });

  // 2. Clear state and Navigate
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('http://localhost:3000/employer/post-job');
  
  // 3. Skip Onboarding if present
  try {
    await page.waitForSelector('button:has-text("Bỏ qua")', { timeout: 3000 });
    await page.click('button:has-text("Bỏ qua")');
    console.log('Skipped onboarding');
  } catch (e) {
    console.log('Onboarding not found or already skipped');
  }

  // Handle redirect to register
  if (page.url().includes('/register')) {
    console.log('At register page, navigating to login then back...');
    try {
        await page.click('text=Đăng nhập');
        await page.goto('http://localhost:3000/employer/post-job');
    } catch (e) {}
  }

  // Chờ trang Đăng tin load hoàn toàn
  await page.waitForSelector('input[placeholder*="VD: Cần"]', { timeout: 10000 });

  console.log('--- BƯỚC 1: THÔNG TIN CƠ BẢN ---');
  // 1. Điền tiêu đề
  console.log('Filling title...');
  await page.getByPlaceholder(/VD: Cần|Tiêu đề/).fill('Chuyên viên Tư vấn Tài chính');
  
  // 2. Điền mô tả
  console.log('Filling description...');
  await page.locator('textarea[placeholder*="Mô tả"]').fill('Mô tả công việc chi tiết cho vị trí tư vấn tài chính chuyên nghiệp với môi trường tốt.');

  // 3. Điền số lượng tuyển
  console.log('Filling vacancies...');
  await page.getByPlaceholder('VD: 2').fill('2');

  // 4. Điền lương
  console.log('Filling salary...');
  await page.getByPlaceholder('VD: 50.000').fill('50.000');
  
  // 5. Chọn danh mục (Làm cuối cùng để tránh overlay)
  console.log('Opening categories...');
  const catBtn = page.locator('button:has-text("danh mục"), button:has-text("Bán lẻ"), button:has-text("Retail")').first();
  await catBtn.click({ force: true });
  await page.waitForTimeout(1000);
  
  console.log('Picking Retail...');
  const retailOpt = page.locator('button', { hasText: /Retail|Bán lẻ/ }).first();
  await retailOpt.click({ force: true }); 
  await page.waitForTimeout(1500); // Chờ BottomSheet đóng hẳn

  // 6. Nhấn Tiếp tục
  console.log('Clicking Next (Step 1)...');
  const nextBtn1 = page.locator('button:has-text("Tiếp tục")').last();
  await nextBtn1.scrollIntoViewIfNeeded();
  await nextBtn1.focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000); 

  console.log('--- BƯỚC 2: ĐỊA ĐIỂM & THỜI GIAN ---');
  // Chờ hiển thị bước 2 (Sử dụng text đặc trưng của bước 2)
  await expect(page.locator('text=Địa điểm làm việc')).toBeVisible({ timeout: 10000 });
  
  // 1. Điền địa chỉ
  console.log('Filling address...');
  await page.getByPlaceholder(/Nguyễn Huệ/).fill('72 Lê Thánh Tôn, Quận 1, TP.HCM');
  
  // 2. Click GPS (Bắt buộc để tiếp tục)
  console.log('Clicking GPS button...');
  const gpsBtn = page.locator('button:has(.lucide-locate-fixed), button:has(svg.lucide-locate-fixed)').first(); 
  await gpsBtn.click({ force: true });
  await page.waitForTimeout(2000); // Chờ lấy tọa độ
  
  // 3. Chọn ngày bắt đầu (VD: ngày mai)
  console.log('Filling dates...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split('T')[0];
  await page.locator('input[type="date"]').first().fill(dateStr);
  
  // 4. Nhấn Tiếp tục (Bước 2)
  console.log('Clicking Next (Step 2)...');
  const nextBtn2 = page.locator('button:has-text("Tiếp tục")').last();
  await nextBtn2.click({ force: true });
  await page.waitForTimeout(2000);

  console.log('--- BƯỚC 3: CA LÀM VIỆC ---');
  test.slow(); // Nhân 3 timeout cho các bước chậm
  await expect(page.locator('text=Ca làm việc')).toBeVisible({ timeout: 20000 });
  
  // 1. Thêm ca làm việc
  console.log('Adding a shift...');
  const addShiftBtn = page.locator('button:has-text("Thêm ca làm việc")').first();
  await addShiftBtn.scrollIntoViewIfNeeded();
  await addShiftBtn.click({ force: true });
  await page.waitForTimeout(2000);
  
  // Kiểm tra và điền tên ca nếu cần (để activate button Tiếp tục)
  const shiftInput = page.locator('input[placeholder*="Ca 1"]');
  try {
    if (await shiftInput.isVisible({ timeout: 5000 })) {
        console.log('Filling shift name...');
        await shiftInput.fill('Ca làm việc sáng');
        await page.waitForTimeout(1000);
    }
  } catch (e) {
    console.log('Shift input not found, retrying click...');
    await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find(el => el.innerText.includes('Thêm ca làm việc'));
        if (b) b.click();
    });
    await page.waitForTimeout(2000);
  }

  // 2. Nhấn Tiếp tục (Bước 3)
  console.log('Clicking Next (Step 3)...');
  const nextBtn3 = page.locator('button:has-text("Tiếp tục")').last();
  await nextBtn3.click({ force: true });
  await page.waitForTimeout(2000);

  console.log('--- BƯỚC 4: XEM LẠI & ĐĂNG TIN ---');
  await expect(page.locator('text=Xem lại tin đăng')).toBeVisible({ timeout: 20000 });
  
  // Screenshot kết quả cuối cùng
  await page.screenshot({ path: 'post-job-review-final.png' });
  console.log('Test completed successfully!');
  
  // Chụp ảnh màn hình bước cuối
  await page.screenshot({ path: 'e2e-results/post-job-review.png' });

  // Nhấn Đăng tin ngay
  // await page.click('button:has-text("Đăng tin ngay")');
  
  console.log('--- KẾT THÚC LUỒNG E2E ---');
});
