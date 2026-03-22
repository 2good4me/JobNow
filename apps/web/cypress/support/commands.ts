/// <reference types="cypress" />

// =========================================================
// Custom Cypress Commands
// =========================================================

// Giả lập đăng nhập bằng cách intercept Firebase Auth listener
// Đây là cách chuẩn để test app dùng Firebase Auth mà không cần login thật
Cypress.Commands.add('loginMockCandidate', () => {
  cy.intercept('POST', 'https://identitytoolkit.googleapis.com/**', {
    statusCode: 200,
    body: { idToken: 'mock-token', localId: 'mock-candidate-uid' }
  });

  // Mock Firestore: trả về profile Ứng viên
  cy.intercept('POST', 'https://firestore.googleapis.com/v1/**', {
    statusCode: 200,
    body: {
      fields: {
        role: { stringValue: 'CANDIDATE' },
        full_name: { stringValue: 'Nguyễn Văn Test' },
        email: { stringValue: 'candidate@test.com' },
        avatar_url: { stringValue: null },
        created_at: { timestampValue: '2024-01-01T00:00:00Z' }
      }
    }
  });
});

Cypress.Commands.add('loginMockEmployer', () => {
  cy.intercept('POST', 'https://identitytoolkit.googleapis.com/**', {
    statusCode: 200,
    body: { idToken: 'mock-token', localId: 'mock-employer-uid' }
  });

  cy.intercept('POST', 'https://firestore.googleapis.com/v1/**', {
    statusCode: 200,
    body: {
      fields: {
        role: { stringValue: 'EMPLOYER' },
        full_name: { stringValue: 'Cafe Highlands' },
        email: { stringValue: 'employer@test.com' },
        company_name: { stringValue: 'Highlands Coffee' },
        created_at: { timestampValue: '2024-01-01T00:00:00Z' }
      }
    }
  });
});

// Khai báo type để TypeScript không báo lỗi
declare global {
  namespace Cypress {
    interface Chainable {
      loginMockCandidate(): Chainable<void>;
      loginMockEmployer(): Chainable<void>;
    }
  }
}

export {};