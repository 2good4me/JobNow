# JobNow Firestore NoSQL Schema

Bản thiết kế này dựa trên schema `init.sql` ban đầu (thiết kế cho PostgreSQL) và được tối ưu hóa cho **Firebase Firestore** (NoSQL).

## 1. Collection `users` (Thay thế `nguoi_dung` & `ho_so`)
Mỗi document trong `users` tương ứng chuỗi `uid` từ Firebase Authentication.

- **Document ID**: `uid` (Ví dụ: `Qx8d9...`)
- **Fields**:
  - `phone_number`: string
  - `email`: string
  - `role`: string (`CANDIDATE`, `EMPLOYER`, `ADMIN`)
  - `balance`: number (mặc định 0)
  - `reputation_score`: number (mặc định 100)
  - `status`: string (`ACTIVE`, `LOCKED`, `BANNED`)
  - `full_name`: string
  - `avatar_url`: string | null
  - `bio`: string | null
  - `address_text`: string | null
  - `skills`: array of strings
  - `identity_images`: array of strings
  - `created_at`: timestamp
  - `updated_at`: timestamp

## 2. Collection `jobs` (Thay thế `viec_lam` & `ca_lam_viec`)
Để giảm thiểu số lượt đọc (reads), các ca làm việc (`shifts`) mang tính phụ thuộc cao sẽ được nhúng thẳng vào mảng `shifts` bên trong document `job`. Tra cứu khoảng cách thông qua Geohash.

- **Document ID**: auto-generated ID
- **Fields**:
  - `employer_id`: string (reference tới `users`)
  - `category_id`: string (reference tới `categories`)
  - `title`: string
  - `description`: string
  - `salary`: number
  - `salary_type`: string (`HOURLY`, `DAILY`, `JOB`)
  - `location`: GeoPoint (vĩ độ, kinh độ)
  - `geohash`: string (sử dụng `geofire-common` để tạo chỉ mục tìm kiếm khoảng cách)
  - `is_gps_required`: boolean
  - `status`: string (`OPEN`, `FULL`, `CLOSED`, `HIDDEN`)
  - `shifts`: array of objects:
    - `id`: string (tự generate ID nhỏ)
    - `name`: string
    - `start_time`: string (ISO hoặc timestamp)
    - `end_time`: string
    - `quantity`: number
  - `created_at`: timestamp
  - `updated_at`: timestamp

## 3. Collection `applications` (Thay thế `don_ung_tuyen`)
Ghi chép các lượt ứng tuyển của ứng viên vào công việc/ca lam việc cụ thể.

- **Document ID**: auto-generated ID
- **Fields**:
  - `job_id`: string
  - `shift_id`: string (trỏ tới 1 phần tử trong mảng `shifts` của `job`)
  - `employer_id`: string (copy để tiện truy vấn cho Employer)
  - `candidate_id`: string
  - `status`: string (`PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`)
  - `payment_status`: string (`UNPAID`, `PAID`)
  - `cover_letter`: string
  - `created_at`: timestamp
  - `updated_at`: timestamp

### Subcollection `checkins` (Thay thế `cham_cong`)
Nằm dưới mỗi document `/applications/{application_id}/checkins`.
- **Fields**:
  - `check_in_time`: timestamp
  - `location`: GeoPoint (vị trí checkin)
  - `status`: string (`VALID`, `INVALID`)

## 4. Collection `transactions` (Thay thế `giao_dich`)
- **Document ID**: auto-generated ID
- **Fields**:
  - `user_id`: string
  - `amount`: number
  - `type`: string (`DEPOSIT`, `PAYMENT`, `REFUND`)
  - `status`: string (`PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`)
  - `payment_method`: string
  - `created_at`: timestamp
  - `updated_at`: timestamp

## 5. Collection `reviews` (Thay thế `danh_gia`)
- **Document ID**: auto-generated ID
- **Fields**:
  - `reviewer_id`: string
  - `reviewee_id`: string
  - `application_id`: string
  - `rating`: number (1-5)
  - `comment`: string
  - `created_at`: timestamp

## 6. Collections phụ trợ khác
- **`categories`** (Thay thế `danh_muc`): Lọc và phân loại công việc.
- **`notifications`** (Thay thế `thong_bao`): Dữ liệu thông báo cho từng tính năng.
- **`follows`** (Thay thế `theo_doi`): Các Candidate lưu trữ/theo dõi nhà tuyển dụng.
- **`analytics`** (Thay thế `thong_ke_doanh_thu` và `log_hoat_dong`): Lấy báo cáo doanh thu & KPIs theo pattern Time Series (Tạo document theo tháng, VD ID: `metrics_2024_03`).
