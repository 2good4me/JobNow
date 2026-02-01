# Biểu đồ Use Case (Ca sử dụng)

Biểu đồ dưới đây mô tả tổng quan các chức năng của hệ thống và sự tương tác của các tác nhân (Actors).

## 1. Các Tác nhân (Actors)
*   **Candidate (Người tìm việc):** Người lao động thời vụ, sinh viên.
*   **Employer (Nhà tuyển dụng):** Gồm Cá nhân (Hộ gia đình) và Doanh nghiệp.
*   **Admin (Quản trị viên):** Người vận hành hệ thống.
*   **System (Hệ thống - Time):** Các tác vụ tự động (Bộ lọc, Notify).

## 2. Biểu đồ Use Case Tổng quát

```mermaid
graph LR
    %% Actors
    C[👤 Candidate]:::actor
    E[💼 Employer]:::actor
    A[🛡️ Admin]:::actor

    %% System Boundary
    subgraph "Hệ thống Tuyển dụng GPS"
        direction TB
        %% Common
        UC1((Đăng ký / Đăng nhập))
        UC2((Xác thực eKYC))
        UC3((Quản lý Hồ sơ))
        UC4((Chat / Nhắn tin))
        UC5((Báo cáo vi phạm))

        %% Candidate Specific
        UC7((Tìm việc quanh đây))
        UC8((Ứng tuyển))
        UC9((GPS Check-in))
        UC10((Đánh giá NTD))

        %% Employer Specific
        UC11((Đăng tin tuyển dụng))
        UC12((Quản lý Ứng viên))
        UC13((Xác nhận hoàn thành))
        UC14((Đánh giá Ứng viên))
        UC15((Thanh toán VIP))

        %% Admin Specific
        UC16((Duyệt tin))
        UC17((Khóa tài khoản))
        UC18((Xử lý Báo cáo))
    end

    %% Relationships - Candidate
    C --> UC1
    C --> UC2
    C --> UC3
    C --> UC7
    C --> UC8
    C --> UC9
    C --> UC4
    C --> UC5
    C --> UC10

    %% Relationships - Employer
    E --> UC1
    E --> UC2
    E --> UC3
    E --> UC11
    E --> UC12
    E --> UC13
    E --> UC14
    E --> UC15
    E --> UC5

    %% Relationships - Admin
    A --> UC1
    A --> UC16
    A --> UC17
    A --> UC18

    %% Styling
    classDef actor fill:#f9f,stroke:#333,stroke-width:2px;
```

## 3. Mô tả chi tiết các nhóm chức năng

### Nhóm Candidate (Người tìm việc)
*   **Tìm việc quanh đây:** Hệ thống tự động lấy GPS của Candidate để hiển thị các Job Pin trên bản đồ.
*   **GPS Check-in:** Bắt buộc phải có mặt tại phạm vi bán kính 200m quanh địa điểm làm việc mới bấm được nút Check-in.

### Nhóm Employer (Nhà tuyển dụng)
*   **Đăng tin:** Phải chọn toa độ trên bản đồ. Nếu chọn loại việc "Remote/Online", hệ thống sẽ vô hiệu hóa yêu cầu GPS Check-in.
*   **Xác thực eKYC:** Bắt buộc để nhận tích xanh và tăng giới hạn đăng tin.

### Nhóm Admin
*   **Giải quyết Báo cáo:** Xem bằng chứng (hoặc kết quả AI trả về) để quyết định Trừ điểm uy tín hoặc Khóa tài khoản.
