-- PostgreSQL Schema for JobNow
-- Dựa trên Best Practices từ postgres-patterns và Supabase
-- =========================================================================

-- Kích hoạt extension cần thiết
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS postgis; -- Hỗ trợ truy vấn khoảng cách GPS mạnh mẽ

-- =========================================================================
-- ENUMS
-- =========================================================================
CREATE TYPE user_role AS ENUM ('CANDIDATE', 'EMPLOYER', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'LOCKED', 'BANNED');
CREATE TYPE salary_type AS ENUM ('HOURLY', 'DAILY', 'JOB');
CREATE TYPE job_status AS ENUM ('OPEN', 'FULL', 'CLOSED', 'HIDDEN');
CREATE TYPE application_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE payment_status AS ENUM ('UNPAID', 'PAID');
CREATE TYPE checkin_status AS ENUM ('VALID', 'INVALID');
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'PAYMENT', 'REFUND');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED');
CREATE TYPE notification_type AS ENUM ('JOB_ALERT', 'APPLICATION_UPDATE', 'SYSTEM');

-- =========================================================================
-- PHẦN 1: QUẢN LÝ NGƯỜI DÙNG & HỒ SƠ
-- =========================================================================
CREATE TABLE nguoi_dung (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    phone_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    balance NUMERIC(15,2) DEFAULT 0.00,
    reputation_score INT DEFAULT 100,
    status user_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial index: Giúp tìm kiếm user đang ACTIVE (khi login) nhanh hơn, tiết kiệm dung lượng index
CREATE INDEX idx_nguoi_dung_phone_active ON nguoi_dung (phone_number) WHERE status = 'ACTIVE';

CREATE TABLE ho_so (
    user_id BIGINT PRIMARY KEY REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    address_text TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    identity_images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index: Cực kỳ tối ưu cho việc tìm kiếm bên trong mảng JSONB (VD: tìm ng có skill "Pha chế")
CREATE INDEX idx_ho_so_skills ON ho_so USING GIN (skills);

-- =========================================================================
-- PHẦN 5.1: DANH MỤC CÔNG VIỆC
-- =========================================================================
CREATE TABLE danh_muc (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id BIGINT REFERENCES danh_muc(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- PHẦN 2: NGHIỆP VỤ VIỆC LÀM & CHẤM CÔNG
-- =========================================================================
CREATE TABLE viec_lam (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    employer_id BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES danh_muc(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    salary NUMERIC(15,2) NOT NULL,
    salary_type salary_type NOT NULL,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    -- Nếu dùng PostGIS thì bật trường bên dưới, tạm thời để comment:
    -- location geometry(Point, 4326),
    is_gps_required BOOLEAN DEFAULT TRUE,
    status job_status DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Composite Index Pattern: Equality column (status) first, then range/other
-- Tối ưu khi query load tin mới nhất đang mờ
CREATE INDEX idx_viec_lam_status_created ON viec_lam (status, created_at DESC);
CREATE INDEX idx_viec_lam_employer ON viec_lam (employer_id);

-- B-tree index cho tọa độ nếu giới hạn không dùng PostGIS (tìm kiếm khoang hẹp bounds box)
CREATE INDEX idx_viec_lam_location ON viec_lam (latitude, longitude) WHERE status = 'OPEN';


CREATE TABLE ca_lam_viec (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES viec_lam(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_ca_lam_viec_job ON ca_lam_viec (job_id);


CREATE TABLE don_ung_tuyen (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES viec_lam(id) ON DELETE CASCADE,
    shift_id BIGINT NOT NULL REFERENCES ca_lam_viec(id) ON DELETE CASCADE,
    candidate_id BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    status application_status DEFAULT 'PENDING',
    payment_status payment_status DEFAULT 'UNPAID',
    cover_letter TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(shift_id, candidate_id) -- Điền Constraint: Ứng viên chỉ nộp 1 lần cho 1 ca (Tránh spam xin việc)
);

-- Index cho Employer: Lọc danh sách đơn cụ thể theo ca và xem trạng thái
CREATE INDEX idx_don_ung_tuyen_shift_status ON don_ung_tuyen (shift_id, status);
-- Index cho Candidate: Xem Lịch sử các đơn xin việc của mình
CREATE INDEX idx_don_ung_tuyen_candidate ON don_ung_tuyen (candidate_id, status);


CREATE TABLE cham_cong (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id BIGINT NOT NULL REFERENCES don_ung_tuyen(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_in_lat NUMERIC(10,8) NOT NULL,
    check_in_long NUMERIC(11,8) NOT NULL,
    status checkin_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_cham_cong_application ON cham_cong (application_id);

-- =========================================================================
-- PHẦN 3: KẾ TOÁN & KINH DOANH
-- =========================================================================
CREATE TABLE goi_dich_vu (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(15,2) NOT NULL,
    duration_days INT NOT NULL,
    benefits JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE giao_dich (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL,
    type transaction_type NOT NULL,
    status transaction_status DEFAULT 'PENDING',
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_giao_dich_user_created ON giao_dich (user_id, created_at DESC);

-- =========================================================================
-- PHẦN 4: HỆ THỐNG PHÂN TÍCH (ANALYTICS)
-- =========================================================================
CREATE TABLE thong_ke_doanh_thu (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    report_date DATE NOT NULL,
    category_id BIGINT REFERENCES danh_muc(id) ON DELETE SET NULL,
    total_revenue NUMERIC(15,2) DEFAULT 0,
    total_jobs INT DEFAULT 0,
    total_applications INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(report_date, category_id)
);

-- BRIN Index: Tối ưu CỰC TỐT cho dữ liệu time-series/date tuần tự, dung lượng siêu nhẹ
CREATE INDEX idx_thong_ke_doanh_thu_date ON thong_ke_doanh_thu USING BRIN (report_date);


CREATE TABLE log_hoat_dong (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES nguoi_dung(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_id BIGINT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- BRIN index chặn phình to cho bảng Log (Append-only logs table)
CREATE INDEX idx_log_hoat_dong_time ON log_hoat_dong USING BRIN (created_at);

-- =========================================================================
-- PHẦN 5.2: TIỆN ÍCH KHÁC (THÔNG BÁO, THEO DÕI, ĐÁNH GIÁ)
-- =========================================================================
CREATE TABLE thong_bao (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partial index: Tối ưu đếm (count) thông báo chưa đọc mà không cần scan cả bảng
CREATE INDEX idx_thong_bao_user_unread ON thong_bao (user_id) WHERE is_read = FALSE;

CREATE TABLE theo_doi (
    candidate_id BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    employer_id BIGINT NOT NULL REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(candidate_id, employer_id)
);
CREATE INDEX idx_theo_doi_employer ON theo_doi (employer_id);

CREATE TABLE danh_gia (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reviewer_id BIGINT NOT NULL REFERENCES nguoi_dung(id),
    reviewee_id BIGINT NOT NULL REFERENCES nguoi_dung(id),
    application_id BIGINT NOT NULL REFERENCES don_ung_tuyen(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reviewer_id, application_id)
);

-- Index hỗ trợ việc tổng hợp tính điểm Rate trung bình nhanh cho 1 Employer hoặc Candidate
CREATE INDEX idx_danh_gia_reviewee_rating ON danh_gia (reviewee_id, rating);

-- =========================================================================
-- TRIGGERS CẬP NHẬT updated_at TỰ ĐỘNG
-- =========================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nguoi_dung_modtime BEFORE UPDATE ON nguoi_dung FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER update_ho_so_modtime BEFORE UPDATE ON ho_so FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER update_viec_lam_modtime BEFORE UPDATE ON viec_lam FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER update_don_ung_tuyen_modtime BEFORE UPDATE ON don_ung_tuyen FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER update_giao_dich_modtime BEFORE UPDATE ON giao_dich FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
