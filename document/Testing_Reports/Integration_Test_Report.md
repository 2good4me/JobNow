# BÁO CÁO CHI TIẾT KIỂM THỬ TÍCH HỢP (INTEGRATION TESTING)

## 1. Mục tiêu (Goals)
Đảm bảo sự phối hợp trơn tru giữa các thành phần giao diện, trạng thái (State) và các dịch vụ ngoại vi (Firebase, Auth).

## 2. Kiến trúc Kiểm thử (Test Architecture)
- **Framework**: Vitest + React Testing Library.
- **Kỹ thuật**: TestWrapper, Mocking, User Simulation.

## 3. Các kịch bản kiểm thử chi tiết (Detailed Scenarios)

### Kịch bản 1: Chọn doanh mục (Post Job Flow)
| ID | Loại | Chi tiết các bước | Tiêu chí đạt (Success Criteria) | Trạng thái |
|:---:|:---:|:---|:---|:---:|
| INT-01 | **Positive** | 1. Render `Step1`. 2. Click "Chọn danh mục". 3. Chờ 300ms. | BottomSheet phải xuất hiện trong DOM. | ✅ Pass |
| INT-02 | **Positive** | 1. Mở bảng chọn. 2. Click vào text "Retail". | Bảng chọn đóng. Form hiện chữ "Retail". | ✅ Pass |

### Kịch bản 2: Nạp tiền vào ví (Wallet Deposit Flow)
| ID | Loại | Dữ liệu giả lập (Mocking) | Kết quả thực tế | Trạng thái |
|:---:|:---:|:---|:---|:---:|
| INT-03 | **Positive** | Mock `useDeposit` trả về success. | UI hiển thị mã QR và STK chuyển khoản. | ✅ Pass |
| INT-04 | **Negative** | Nhập '9999' (< 10k). | Nút "Tiếp tục" bị disable/báo đỏ. | ✅ Pass |
| INT-05 | **Exception** | Mock lỗi Timeout mạng. | Hiển thị thông báo "Vui lòng thử lại sau". | ✅ Pass |

### Kịch bản 3: Đăng nhập (Auth Login Flow)
| ID | Loại | Hành động chi tiết | Kết quả nghiệp vụ | Trạng thái |
|:---:|:---:|:---|:---|:---:|
| INT-06 | **Positive** | Mock Firebase trả về Role `Employer`. | Tự động chuyển trang về `/employer`. | ✅ Pass |
| INT-07 | **Negative** | Mock Firebase trả lỗi `invalid-password`. | Hiển thị thông báo sai mật khẩu. | ✅ Pass |

## 4. Phương pháp Kiểm thử (Methodology)
- **Môi trường**: Giả lập API bằng các biến `mockReturnValue` để cô lập UI.
- **Wrapper**: Bọc Component trong các Provider (AuthContext, QueryClient) để giống môi trường thật 99%.
