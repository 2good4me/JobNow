# JobNow E2E Testing Stabilization

## Phase 1: Infrastructure & Seeding [DONE]
- [x] Phân tích cấu trúc Firestore và Auth.
- [x] Tạo script seed dữ liệu cho các user E2E (employer, candidate_pending, candidate_verified).
- [x] Đảm bảo backend có thể xử lý các request từ mock users.

## Phase 2: Employer Flow (Đăng tin tuyển dụng) [DONE]
- [x] Sửa lỗi selector cho tiêu đề công việc (placeholder chính xác).
- [x] Sử dụng ID cố định cho e2e_employer.
- [x] Đảm bảo tin tuyển dụng được tạo thành công với suffix ngẫu nhiên.

## Phase 3: Candidate Verification (eKYC) [/]
- [x] Debug lỗi Job Search & eKYC E2E
- [/] Sửa lỗi Mock Auth trong Job Service
- [ ] Chạy lại và ổn định E2E Test
- [ ] Hoàn thiện luồng ứng tuyển E2E.

## Phase 4: Candidate Application (Ứng tuyển) [ ]
- [ ] Tìm kiếm tin tuyển dụng vừa đăng.
- [ ] Thực hiện ứng tuyển.
- [ ] Xác nhận trạng thái ứng tuyển trong database.

## Phase 5: Cleanup & Refinement [ ]
- [ ] Xóa dữ liệu rác sau khi test (nếu cần).
- [ ] Tối ưu hóa thời gian chạy test.
