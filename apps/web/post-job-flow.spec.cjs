const { test, expect } = require('@playwright/test');

test('Complete Post Job Flow', async ({ page }) => {
  // 1. Cấu hình viewport cho Mobile (phù hợp với thiết kế của JobNow)
  await page.setViewportSize({ width: 390, height: 844 });

  // 2. Điều hướng tới trang Đăng tin (Giả sử đã đăng nhập hoặc truy cập trực tiếp)
  // Lưu ý: Trong môi trường thật, cần có bước Login trước.
  await page.goto('http://localhost:3000/employer/post-job');

  console.log('--- BƯỚC 1: THÔNG TIN CƠ BẢN ---');
  // Điền tiêu đề
  await page.fill('input[placeholder*="Tiêu đề"]', 'Chuyên viên Tư vấn Tài chính');
  
  // Chọn danh mục (Mở BottomSheet)
  await page.click('button:has-text("Chọn danh mục")');
  await page.click('button:has-text("Retail")'); // Giả sử chọn Retail
  
  // Điền mô tả
  await page.fill('textarea[placeholder*="Mô tả"]', 'Mô tả công việc chi tiết cho vị trí tư vấn...');
  
  // Nhấn Tiếp tục
  await page.click('button:has-text("Tiếp tục")');

  console.log('--- BƯỚC 2: ĐỊA ĐIỂM & THỜI GIAN ---');
  // Chờ hiển thị bước 2
  await expect(page.locator('text=Địa điểm làm việc')).toBeVisible();
  
  // Điền địa chỉ
  await page.fill('input[placeholder*="Nguyễn Huệ"]', '72 Lê Thánh Tôn, Quận 1, TP.HCM');
  
  // Chọn ngày bắt đầu (Giả sử điền ngày hôm nay)
  // Lưu ý: Tùy vào định dạng input date của trình duyệt
  
  // Nhấn Tiếp tục
  await page.click('button:has-text("Tiếp tục")');

  console.log('--- BƯỚC 3: CA LÀM VIỆC ---');
  await expect(page.locator('text=Ca làm việc')).toBeVisible();
  
  // Nhấn Tiếp tục (Giả sử đã có ca mặc định hoặc nhấn thêm)
  await page.click('button:has-text("Tiếp tục")');

  console.log('--- BƯỚC 4: XEM LẠI & ĐĂNG TIN ---');
  await expect(page.locator('text=Xem lại tin đăng')).toBeVisible();
  
  // Chụp ảnh màn hình bước cuối
  await page.screenshot({ path: 'e2e-results/post-job-review.png' });

  // Nhấn Đăng tin ngay
  // await page.click('button:has-text("Đăng tin ngay")');
  
  console.log('--- KẾT THÚC LUỒNG E2E ---');
});
