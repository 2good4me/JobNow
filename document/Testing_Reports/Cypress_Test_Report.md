# BÁO CÁO CHI TIẾT TỐI ƯU KIỂM THỬ CYPRESS

## 1. Cấu hình Môi trường
- **Base URL**: `http://localhost:3000`
- **Viewport**: 390 x 844 (Mobile-first view)

## 2. Danh mục kịch bản kiểm thử (Test Scenarios)

### A. Luồng Nạp tiền (Wallet Deposit Flow)
| ID | Loại | Kịch bản & Quy trình | Kết quả mong đợi (Expected) | Trạng thái |
|:---:|:---:|:---|:---|:---:|
| CYP-01 | **Positive** | 1. Chọn mốc '200k'. 2. Nhấn 'Tiếp tục'. | UI hiển thị đúng mã QR. | ✅ Pass |
| CYP-02 | **Negative** | 1. Nhập số tiền rỗng. 2. Submit. | Nút bị khóa / báo nội dung rỗng. | ✅ Pass |
| CYP-04 | **Exception**| 1. Giả lập Server lỗi 500. | Hiển thị màn hình lỗi thân thiện. | ✅ Pass |

### B. Luồng Đăng nhập (Auth Flow)
| ID | Loại | Kịch bản & Quy trình | Kết quả mong đợi | Trạng thái |
|:---:|:---:|:---|:---|:---:|
| CYP-05 | **Positive** | 1. Nhập tài khoản Employer. 2. Login. | Điều hướng về Dashboard. | ✅ Pass |
| CYP-06 | **Negative** | 1. Email sai định dạng. | Msg "Email không đúng định dạng". | ✅ Pass |

## 3. Lợi ích kỹ thuật
1.  **Tính trực quan**: Xem lại từng frame thao tác.
2.  **Độ tin cậy**: Chặn đứng các lỗi UI/Hành vi thực tế.
3.  **Hỗ trợ TDD**: Vừa Code vừa xem UI tự động cập nhật.
