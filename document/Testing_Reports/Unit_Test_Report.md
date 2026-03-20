# BÁO CÁO CHI TIẾT TRIỂN KHAI UNIT TESTING - JOBNOW

## 1. Tổng quan
Báo cáo này liệt kê chi tiết các công việc đã thực hiện để thiết lập hệ thống kiểm thử tự động (Unit Testing) cho phần Frontend của dự án JobNow. Mục tiêu là đảm bảo tính ổn định của logic nghiệp vụ và giao diện người dùng (UI).

## 2. Công nghệ & Cấu hình
*   **Framework**: [Vitest](https://vitest.dev/)
*   **Thư viện UI Testing**: [@testing-library/react]
*   **Môi trường giả lập**: [jsdom]

## 3. Các kịch bản kiểm thử chi tiết (Test Cases)

### A. Logic Xử lý Ngày tháng (`src/utils/date.test.ts`)
| ID | Loại | Kịch bản & Bước thực hiện | Kết quả mong đợi | Trạng thái |
|:---:|:---:|:---|:---|:---:|
| UNIT-01 | **Positive** | **Dải ngày hợp lệ**: 1. Set Start = '2023-01-01'. 2. Set End = '2023-01-10'. | `isValidDateRange` trả về `true`. | ✅ Pass |
| UNIT-02 | **Negative** | **Lỗi logic ngược**: 1. Set Start = '2023-01-10'. 2. Set End = '2023-01-01'. | `isValidDateRange` trả về `false`. | ✅ Pass |
| UNIT-03 | **Exception**| **Tự động sửa lỗi**: 1. Có dải ổn định. 2. Đổi Start vượt quá End hiện tại. | `getValidEndDate` gán End = Start mới. | ✅ Pass |

### B. UI Component Ví tiền (`src/components/WalletCard.test.tsx`)
| ID | Loại | Kịch bản & Kỹ thuật | Kết quả hiển thị | Trạng thái |
|:---:|:---:|:---|:---|:---:|
| UNIT-04 | **Positive** | **Hiển thị VND**: Render với balance = 1000000. | Text hiển thị `1.000.000 VND`. | ✅ Pass |
| UNIT-05 | **Positive** | **Đổi đơn vị**: Truyền prop `currency="USD"`. | Text hiển thị `1.000.000 USD`. | ✅ Pass |
| UNIT-06 | **Negative** | **Số dư rỗng/0**: Truyền balance = 0. | Hiển thị `0 VND` (không bị lỗi render). | ✅ Pass |

## 4. Chi tiết Kỹ thuật (Technical Specs)
- **Mocks**: Sử dụng `vi.fn()` để giả lập các Event Handler.
- **Selectors**: Ưu tiên sử dụng `getByRole` và `getByText` để đảm bảo tính tiếp cận.
