# Hướng dẫn Kiểm thử Tự động (Testing Guide) - JobNow

## 1. Cấu trúc Kiểm thử
Dự án sử dụng mô hình Kim tự tháp kiểm thửvới 3 lớp công cụ:
- **Unit & Integration**: Vitest + React Testing Library.
- **E2E (Cơ bản)**: Playwright (Đa trình duyệt, Mobile emulation).
- **E2E (Trực quan)**: Cypress (Timeline debugging, Component Testing).

## 2. Cách chạy kiểm thử hiệu quả
- **Unit & Integration Test**: `npm run test`
- **Playwright (E2E)**: `npx playwright test`
- **Cypress (E2E & UI)**:
    - Mở Dashboard: `npx cypress open`
    - Chạy ngầm: `npx cypress run`

## 3. Viết Test Case tiêu chuẩn
Để bài test chuyên nghiệp, hãy luôn bao quát 3 khía cạnh:
- **Positive**: Dữ liệu đúng, luồng chính.
- **Negative**: Dữ liệu sai, ngăn chặn lỗi.
- **Exception**: Các lỗi ngoại lệ (Mất mạng, lỗi Server).
