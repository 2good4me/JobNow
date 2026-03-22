describe('Wallet Deposit Flow', () => {
  beforeEach(() => {
    // 1. Giả lập Viewport Mobile
    cy.viewport(390, 844);
    
    // 2. Chặn các request Firebase để tăng tốc độ test
    cy.intercept('GET', '**/firebasejs/**', { statusCode: 200, body: {} });
    
    // 3. Skip Onboarding via localStorage (Dùng cơ chế của app)
    cy.on('window:before:load', (win) => {
      win.localStorage.setItem('jobnow_onboarding_seen', 'true');
    });

    // 4. Truy cập trang Chi tiết Ví
    cy.visit('/employer/wallet/primary');
    
    // 5. Mở BottomSheet Nạp tiền
    cy.contains('Nạp tiền', { timeout: 15000 }).should('be.visible').click();
  });

  it('CYP-01: Nên hiển thị mã QR khi chọn số tiền hợp lệ và nhấn Tiếp tục', () => {
    // Nhập trực tiếp số tiền cho chắc chắn
    cy.get('input[inputmode="numeric"]').clear().type('200000');
    
    // Kiểm tra input có đúng 200,000 không (Code dùng en-US locale)
    cy.get('input[inputmode="numeric"]').should('have.value', '200,000');
    
    // Nhấn Tiếp tục
    cy.contains('Tiếp tục').click({ force: true });
    
    // Assert: Phải hiện mã QR
    cy.get('img[alt*="QR"]', { timeout: 10000 }).should('be.visible');
    cy.contains('Thông tin thanh toán').should('be.visible');
  });

  it('CYP-02: Nên báo lỗi khi số tiền rỗng', () => {
    // Xóa sạch input
    cy.get('input[inputmode="numeric"]').clear();
    
    // Nhấn tiếp tục
    cy.contains('Tiếp tục').should('be.disabled');
  });
});
