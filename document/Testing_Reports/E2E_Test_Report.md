# BÁO CÁO CHI TIẾT KIỂM THỬ CUỐI (END-TO-END TESTING)

## 1. Chiến lược Kiểm thử (Testing Strategy)
Kiểm thử E2E trong JobNow được thiết kế để chạy trên môi trường giả lập Mobile (Viewport: 390x844), phản ánh chính xác thói quen sử dụng ứng dụng của người dùng hiện nay.

## 2. Các kịch bản trọng tâm (Core Scenarios)

### Kịch bản 1: Luồng Đăng tin tuyển dụng (Post Job Flow)
| ID | Loại | Chi tiết các bước thực hiện | Kiểm tra logic (Expectations) | Bằng chứng (Evidence) |
|:---:|:---:|:---|:---|:---|
| E2E-01 | **Positive** | 1. Điền 4 bước form. 2. Nhấn "Đăng tin". | Firebase nhận tài liệu; Chuyển về Dashboard. | `success-post.png` |
| E2E-02 | **Negative** | 1. Tới bước 2. 2. Không chọn vị trí GPS. | Nút "Tiếp tục" bị khóa (Disabled). | `step2-error.png` |
| E2E-03 | **Negative** | 1. Bước 2. 2. Nhập ngày kết thúc < ngày bắt đầu. | Hiển thị Toast cảnh báo logic ngày. | `date-logic-fail.png` |

### Kịch bản 2: Luồng Xác thực & Phân quyền (Auth & RBAC)
| ID | Loại | Hành động người dùng | Kết quả hệ thống | Trạng thái |
|:---:|:---:|:---|:---|:---:|
| E2E-04 | **Positive** | Đăng nhập với quyền Employer. | Được phép vào màn hình `/employer/*`. | ✅ Pass |
| E2E-05 | **Exception**| Tắt kết nối mạng khi đang Login. | Hiển thị thông báo "Kiểm tra kết nối mạng". | ✅ Pass |

## 3. Quy trình nghiệm thu (Acceptance Criteria)
1.  **Chức năng**: 100% test case Positive phải vượt qua.
2.  **Trải nghiệm**: Không có hiện tượng "trắng màn hình" khi lỗi hệ thống xảy ra.
3.  **Báo cáo**: Playwright tự động xuất file `HTML Report` chứa video từng thao tác.
