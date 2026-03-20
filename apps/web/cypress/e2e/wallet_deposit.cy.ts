describe('Wallet Deposit Flow', () => {
  beforeEach(() => {
    // 1. Giả lập Viewport Mobile
    cy.viewport(390, 844);
    
    // 2. Chặn các request Firebase để tăng tốc độ test
    cy.intercept('GET', '**/firebasejs/**', { statusCode: 200, body: {} });
    
    // 3. Truy cập trang Ví
    cy.visit('/wallet');
  });

  it('CYP-01: Nên hiển thị mã QR khi chọn số tiền hợp lệ và nhấn Tiếp tục', () => {
    // Chọn mốc 200k
    cy.contains('200.000').click();
    
    // Kiểm tra input có đúng 200.000 không
    cy.get('input[inputmode="numeric"]').should('have.value', '200.000');
    
    // Nhấn Tiếp tục
    cy.contains('Tiếp tục').click();
    
    // Assert: Phải hiện mã QR
    cy.get('img[alt*="QR"]').should('be.visible');
    cy.contains('Thông tin chuyển khoản').should('be.visible');
  });

  it('CYP-02: Nên báo lỗi khi số tiền rỗng', () => {
    // Xóa sạch input
    cy.get('input[inputmode="numeric"]').clear();
    
    // Nhấn tiếp tục
    cy.contains('Tiếp tục').should('be.disabled');
  });
});
