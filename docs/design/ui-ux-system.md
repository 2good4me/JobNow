# JobNow Design System & UI/UX Guidelines

Tài liệu này định nghĩa hệ thống thiết kế (Design System) và các tiêu chuẩn UI/UX cho nền tảng tìm việc làm JobNow, được phân tích dựa trên công cụ `ui-ux-pro-max`.

## 1. Phong cách Thiết kế (Design Style)

JobNow là nền tảng kết nối việc làm (Employment/Corporate SaaS), do đó phong cách thiết kế sẽ hướng tới sự **Chuyên nghiệp, Tối giản và Đáng tin cậy**.

- **Primary Style:** Minimalism (Tối giản)
- **Mood (Cảm xúc):** Modern (hiện đại), Professional (chuyên nghiệp), Clean (sạch sẽ), Trustworthy (đáng tin cậy).
- **Đặc trưng:** 
  - Giao diện phẳng (Flat Design) kết hợp ánh sáng mềm mại (Soft Shadows).
  - Khoảng trắng (Whitespace) rộng rãi giúp tập trung vào nội dung công việc.
  - Hạn chế sử dụng gradient sặc sỡ, thay vào đó là các mảng màu trơn (Solid colors).

## 2. Bảng Màu (Color Palette)

Hệ thống màu sắc mượn cảm hứng từ các nền tảng doanh nghiệp (Corporate/SaaS) tạo cảm giác uy tín:

- **Primary (Thương hiệu gốc):** `#2563EB` (Blue 600) - Thể hiện sự tin cậy, an toàn, phù hợp cho ngành tuyển dụng.
- **Secondary (Phụ trợ):** `#3B82F6` (Blue 500) - Dùng cho các hiệu ứng hover, active.
- **Accent (Nhấn mạnh):** `#F59E0B` (Amber 500) - Dùng cho các nút kêu gọi hành động (Apply Now) hoặc các nhãn Nổi bật (Hot Job/Urgent).
- **Background (Nền Tối/Sáng):**
  - Light mode: Nền chính `#F8FAFC` (Slate 50), Nền thẻ (Card) `#FFFFFF` (Trắng).
  - Dark mode (Tùy chọn): Nền chính `#0F172A` (Slate 900), Nền thẻ `#1E293B` (Slate 800).
- **Text (Văn bản):**
  - Tiêu đề (Headings): `#0F172A` (Slate 900).
  - Nội dung thường (Body text): `#475569` (Slate 600).
  - Văn bản phụ (Muted): `#64748B` (Slate 500).

## 3. Nghệ thuật chữ (Typography)

Sử dụng phông chữ không chân (Sans-serif) để tối ưu khả năng đọc tren màn hình điện thoại (vì ứng dụng có bản đồ GPS).

- **Heading Font:** `Poppins` (Weights: 500, 600, 700) - Tạo điểm nhấn hiện đại, đậm đà cho các Tên Công Việc, Tên Công Ty.
- **Body Font:** `Open Sans` hoặc `Inter` (Weights: 400, 500) - Đảm bảo dễ đọc với kích thước nhỏ (mô tả công việc, yêu cầu).
- **Kích thước cơ bản (Base size):** 16px (1rem).

## 4. UI/UX Rules (Quy tắc phát triển Frontend)

Trong quá trình code React/Tailwind, cần tuyệt đối tuân thủ các quy tắc sau:

### Tương tác (Interaction & Touch)
- **Kích thước chạm (Touch target):** Các nút bấm (Button), icon trên bản đồ phải có kích thước tối thiểu `44x44px` (Tailwind: `min-h-[44px] min-w-[44px]`) để bấm dễ trên điện thoại.
- **Con trỏ (Cursor):** Mọi thành phần tương tác (Card công việc, Nút bấm) phải có class `cursor-pointer`.
- **Trạng thái (States):** Phải có hiệu ứng thị giác mượt mà cho `hover`, `focus`, và `active` (vd: `transition-colors duration-200`). Nút loading phải ở trạng thái truy cập không được (disabled).

### Trình bày form & bảng (Forms & Layout)
- **Input Forms:** Mỗi thẻ `input` phải đi kèm `label` đúng chuẩn trợ năng (Accessibility) và báo lỗi (`error-feedback`) ngay bên dưới trường đó nếu sai.
- **Card Layout:** Sử dụng hệ thống Grid/Flex với khoảng cách đều nhau (vd: `gap-4 sm:gap-6 lg:gap-8`). Chú ý text dài (như mô tả công việc) cần cắt gọn (Truncation) bằng `line-clamp-2` hoặc `truncate`.
- **Floating Elements:** Bản đồ (Map) và các nút trôi nổi phải thiết lập `z-index` rõ ràng (vd: Nav 50, Modal 50, Map pin 30) để không bị đè chéo.

## 5. Danh sách kiểm tra trước khi bàn giao (Pre-Delivery Checklist)

- [ ] KHÔNG dùng Emojis làm icon. Phải dùng file SVG chuẩn (như thư viện Lucide React).
- [ ] Test độ tương phản văn bản ở Light mode phải > 4.5:1.
- [ ] Chế độ thu phóng Responsive phải hoạt động tốt ở các mốc: `375px` (Mobile), `768px` (Tablet), `1024px` (Laptop).
- [ ] Mọi hình ảnh (Logo công ty, Avatar user) phải có thuộc tính `alt-text`.
