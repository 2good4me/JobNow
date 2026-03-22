// =========================================================
// AUTH - Luồng Đăng Nhập & Đăng Ký (Toàn diện)
// =========================================================
describe('AUTH: Đăng nhập / Đăng ký / Quên mật khẩu', () => {

  // ── Màn hình Đăng nhập ──────────────────────────────────
  describe('Màn hình Đăng nhập (Login)', () => {
    beforeEach(() => cy.visit('/login'));

    it('Hiển thị đầy đủ UI: Logo, tiêu đề, form Email & Tab Điện thoại', () => {
      cy.contains('Đăng nhập').should('be.visible');
      cy.contains('Chào mừng bạn trở lại JobNow!').should('be.visible');
      cy.contains('Email').should('be.visible');
      cy.contains('Điện thoại').should('be.visible');
      cy.get('input#login-email').should('be.visible');
      cy.get('input#login-pw').should('be.visible');
      cy.contains('Tiếp tục với Google').should('be.visible');
      cy.contains('Quên mật khẩu?').should('be.visible');
      cy.contains('Đăng ký miễn phí').should('be.visible');
    });

    it('Chuyển sang tab Điện thoại → hiện ô nhập số điện thoại + hướng dẫn OTP', () => {
      cy.contains('Điện thoại').click();
      cy.get('input#login-phone').should('be.visible');
      cy.contains('Mã xác thực 6 số sẽ được gửi qua SMS').should('be.visible');
      cy.get('button[type="submit"]').contains('Gửi mã OTP').should('be.visible');
    });

    it('Nhập sai mật khẩu → Hệ thống trả lỗi bằng tiếng Việt (Firebase error mapping)', () => {
      cy.get('input#login-email').type('user.khong.ton.tai@test.vn');
      cy.get('input#login-pw').type('matkhausai999');
      cy.get('button[type="submit"]').click();
      cy.contains(/sai mật khẩu|không tìm thấy|không đúng/i, { timeout: 8000 }).should('be.visible');
    });

    it('Nhấn "Quên mật khẩu?" → Điều hướng sang trang Reset Password', () => {
      cy.contains('Quên mật khẩu?').click();
      cy.url().should('include', '/forgot-password');
    });

    it('Nhấn "Đăng ký miễn phí" → Điều hướng sang trang tạo tài khoản', () => {
      cy.contains('Đăng ký miễn phí').click();
      cy.url().should('include', '/register');
    });
  });

  // ── Màn hình Đăng Ký ───────────────────────────────────
  describe('Màn hình Đăng ký (Register)', () => {
    beforeEach(() => cy.visit('/register'));

    it('Hiển thị 2 lựa chọn vai trò: Ứng viên (Tìm việc) & Nhà Tuyển Dụng', () => {
      cy.contains('Tạo tài khoản').should('be.visible');
      cy.contains('Bạn muốn sử dụng JobNow để...').should('be.visible');
      cy.contains('Tìm việc').should('be.visible');
      cy.contains('Tìm việc thời vụ gần bạn').should('be.visible');
      cy.contains('Tuyển dụng').should('be.visible');
      cy.contains('Đăng tin & tìm ứng viên').should('be.visible');
    });

    it('Chọn "Tìm việc" (Candidate) → Hiển thị form điền thông tin cá nhân', () => {
      cy.contains('Tìm việc').click();
      cy.get('input').should('have.length.at.least', 2);
    });

    it('Chọn "Tuyển dụng" (Employer) → Hiển thị form điền thông tin cửa hàng', () => {
      cy.contains('Tuyển dụng').click();
      cy.get('input').should('have.length.at.least', 2);
    });

    it('Có link quay lại Đăng nhập', () => {
      cy.contains('Đăng nhập').click();
      cy.url().should('include', '/login');
    });
  });

  // ── Hệ thống Phân Quyền (RBAC) ─────────────────────────
  describe('Bảo mật: Chặn truy cập trang nội bộ khi chưa đăng nhập', () => {
    beforeEach(() => {
      // Đảm bảo trạng thái chưa đăng nhập hoàn toàn
      cy.clearAllCookies();
      cy.clearAllLocalStorage();
      cy.clearAllSessionStorage();
    });

    it('/candidate → Redirect về trang xác thực', () => {
      cy.visit('/candidate');
      // Tùy vào logic thực tế, có thể redirect về /login, /register hoặc /onboarding
      cy.url({ timeout: 10000 }).should('match', /\/(login|register|onboarding|register\/candidate)/);
    });

    it('/employer → Redirect về trang xác thực', () => {
      cy.visit('/employer');
      cy.url({ timeout: 10000 }).should('match', /\/(login|register|onboarding|register\/employer)/);
    });
  });
});
