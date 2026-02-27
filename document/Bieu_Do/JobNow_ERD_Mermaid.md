# Sơ đồ JobNow ERD (Mermaid)

Dưới đây là sơ đồ Thực thể - Mối quan hệ (ERD) hoàn chỉnh của hệ thống JobNow, được tạo tự động bằng cú pháp Mermaid. Sơ đồ mô tả 16 bảng dữ liệu cốt lõi chia thành 4 phân hệ chính:

```mermaid
erDiagram
    %% [Cụm 1: Lõi Tài khoản & Thông tin cá nhân]
    NGUOI_DUNG ||--|| HO_SO : "có 1"
    NGUOI_DUNG ||--o{ THEO_DOI : "follower_id"
    NGUOI_DUNG ||--o{ THEO_DOI : "following_id"
    NGUOI_DUNG ||--o{ THIET_BI_VI_PHAM : "sở hữu thiết bị gian lận"

    %% [Cụm 2: Công việc & Ca làm]
    DANH_MUC ||--o{ VIEC_LAM : "phân loại"
    NGUOI_DUNG ||--o{ VIEC_LAM : "đăng tuyển"
    VIEC_LAM ||--|{ CA_LAM_VIEC : "chia thành"
    CA_LAM_VIEC ||--o{ DON_UNG_TUYEN : "nhận"
    NGUOI_DUNG ||--o{ DON_UNG_TUYEN : "nộp"
    DON_UNG_TUYEN ||--o{ CHAM_CONG : "sinh ra"

    %% [Cụm 3: Tương tác & Lịch sử]
    NGUOI_DUNG ||--o{ LICH_SU_GIAO_DICH : "thực hiện"
    VIEC_LAM ||--o{ DANH_GIA : "nhận được"
    NGUOI_DUNG ||--o{ DANH_GIA : "viết (reviewer)"
    NGUOI_DUNG ||--o{ DANH_GIA : "bị nhận xét (reviewee)"
    NGUOI_DUNG ||--o{ BAO_CAO : "tố cáo"
    NGUOI_DUNG ||--o{ BAO_CAO : "bị tố cáo"
    NGUOI_DUNG ||--o{ TIN_NHAN : "gửi"
    NGUOI_DUNG ||--o{ TIN_NHAN : "nhận"
    VIEC_LAM ||--o{ TIN_NHAN : "đính kèm trong chat"
    NGUOI_DUNG ||--o{ THONG_BAO : "nhận được"
    NGUOI_DUNG ||--o{ VIEC_DA_LUU : "bookmark"
    VIEC_LAM ||--o{ VIEC_DA_LUU : "được bookmark"

    %% [Cụm 4: Hệ thống]
    %% (MA_XAC_THUC và THONG_KE_DOANH_THU là bảng độc lập, ít tham chiếu trực tiếp)


    %% ==========================================
    %% CHI TIẾT CÁC BẢNG (SCHEMA)
    %% ==========================================

    NGUOI_DUNG {
        INT id PK
        VARCHAR phone_number UK
        ENUM role "CANDIDATE / EMPLOYER / ADMIN"
        INT reputation_score
        DECIMAL wallet_balance
        ENUM status "ACTIVE / BANNED"
        TINYINT account_tier "0, 1, 2"
    }

    HO_SO {
        INT user_id PK, FK
        VARCHAR full_name
        DATE date_of_birth
        VARCHAR address_text
        JSON skills
    }

    THEO_DOI {
        INT follower_id PK, FK "Ứng viên"
        INT following_id PK, FK "Chủ tiệm"
        DATETIME created_at
    }

    THIET_BI_VI_PHAM {
        VARCHAR device_id PK
        VARCHAR ip_address
        VARCHAR reason
    }

    DANH_MUC {
        INT id PK
        VARCHAR name
    }

    VIEC_LAM {
        INT id PK
        INT employer_id FK
        INT category_id FK
        VARCHAR title
        DECIMAL salary
        ENUM status "OPEN / FULL / CLOSED"
        DOUBLE latitude
        DOUBLE longitude
    }

    CA_LAM_VIEC {
        INT id PK
        INT job_id FK "Thuộc Job nào"
        DATE work_date "Ngày làm"
        TIME start_time
        TIME end_time
        INT needed_quantity "Số lượng người cần"
        ENUM status "OPEN, FULL, CANCELLED"
    }

    DON_UNG_TUYEN {
        INT id PK
        INT shift_id FK "Xin vào Ca nào"
        INT candidate_id FK "Người nộp nộp"
        ENUM status "PENDING / APPROVED"
        ENUM payment_status "Chưa trả / Đã trả"
    }

    CHAM_CONG {
        INT id PK
        INT application_id FK
        DATETIME check_in_time
        DOUBLE check_in_lat
        DOUBLE check_in_long
        DATETIME check_out_time
        ENUM status "VALID / PENDING / INVALID"
    }

    LICH_SU_GIAO_DICH {
        INT id PK
        INT user_id FK
        DECIMAL amount
        ENUM type "DEPOSIT, BOOST, PLATFORM_FEE"
        INT reference_id
    }

    DANH_GIA {
        INT id PK
        INT job_id FK
        INT reviewer_id FK
        INT reviewee_id FK
        TINYINT rating "1-5 sao"
    }

    BAO_CAO {
        INT id PK
        INT reporter_id FK
        INT reported_user_id FK
        VARCHAR reason
        ENUM status
    }

    TIN_NHAN {
        INT id PK
        INT sender_id FK
        INT receiver_id FK
        INT job_id FK "Hỏi về Job nào"
        TEXT content
    }

    THONG_BAO {
        INT id PK
        INT user_id FK
        VARCHAR title
        VARCHAR content
        BOOLEAN is_read
    }

    VIEC_DA_LUU {
        INT id PK
        INT user_id FK
        INT job_id FK
    }

    MA_XAC_THUC {
        INT id PK
        VARCHAR phone
        VARCHAR otp_code
        DATETIME expired_at
    }

    THONG_KE_DOANH_THU {
        DATE date PK
        DECIMAL total_revenue
        INT active_users
        INT new_jobs
    }
```
