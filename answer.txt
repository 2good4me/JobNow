# BÁO CÁO PHÂN TÍCH VÀ BỔ SUNG TÀI LIỆU DỰ ÁN
## Đề tài: Hệ thống Tuyển dụng Việc làm Thời vụ theo GPS

### 1. Tổng quan Dự án (Hiện trạng)
Dựa trên các tài liệu trong thư mục `document`, dự án hướng tới việc xây dựng một nền tảng **"Uber cho việc làm"**, kết nối Nhà tuyển dụng và Người tìm việc dựa trên vị trí thực (GPS).
*   **Đối tượng:** Candidate (Người tìm việc), Employer (Nhà tuyển dụng), Admin.
*   **Tính năng cốt lõi:** Tìm việc trên bản đồ, Ứng tuyển nhanh, Chat, eKYC (xác thực danh tính), Hệ thống tính điểm uy tín.
*   **Công nghệ dự kiến:** Flutter/React Native (Mobile), NodeJS (Backend), Firebase (Chat).

### 2. Các nội dung bổ sung (Supplementary Content)
Dưới đây là các tài liệu và kiến thức bổ trợ cho những phần còn thiếu hoặc chưa chi tiết trong dự án:

#### 2.1. Mô hình Kinh doanh & Doanh thu (Business Model)
Tài liệu hiện tại chỉ nhắc sơ qua về "Gói VIP". Để tối ưu hóa doanh thu cho mô hình Gig Economy, bạn có thể tham khảo các luồng doanh thu sau:
*   **Phí hoa hồng (Commission Fee):** Thu % trên lương của mỗi ca làm việc thành công (Ví dụ: 5-10%). Đây là mô hình bền vững nhất nhưng khó triển khai nếu trả lương tiền mặt.
*   **Phí đăng tin ưu tiên (Pay-to-post / Featured Listing):**
    *   Ghim tin lên đầu danh sách trong 24h.
    *   Làm nổi bật icon trên bản đồ (To hơn, màu khác).
*   **Gói thành viên (Subscription):**
    *   *Employer:* Đăng tin không giới hạn, xem số điện thoại ứng viên không giới hạn.
    *   *Candidate:* Được ứng tuyển sớm hơn người thường 1 tiếng, có huy hiệu "Pro".
*   **Bán dữ liệu (Data Monetization):** (Giai đoạn sau) Cung cấp báo cáo thị trường lao động cho các doanh nghiệp lớn (ẩn danh tính người dùng).

#### 2.2. Chiến lược Marketing: Bài toán "Con gà - Quả trứng"
Làm sao để có User khi chưa có Job, và ngược lại?
*   **Chiến lược "Tập trung một bên" (Single-side Focus):** Hãy tập trung kiếm **Job (Nguồn cung)** trước. Có việc thì người sẽ tự đến.
    *   *Hành động:* Tự đi "cào" (crawl) tin tuyển dụng từ các Group Facebook, Website khác về để lấp đầy bản đồ (Cần ghi rõ nguồn để tránh pháp lý).
*   **Chiến lược "Địa phương hóa" (Hyper-local):** Đừng đánh cả nước ngay. Hãy chọn **1 Quận** hoặc **1 Khu vực trường Đại học** để làm pilot. Mật độ tin đăng dày đặc ở 1 khu vực nhỏ sẽ tạo hiệu ứng tốt hơn là rải rác cả thành phố.
*   **Trợ giá (Subsidies):** Tặng tiền/thẻ cào cho 100 Employer đầu tiên đăng tin thật và tuyển được người.

#### 2.3. Giải pháp Kỹ thuật chuyên sâu (Technical Supplement)
Để giải quyết vấn đề hiệu năng bản đồ (khi có hàng nghìn tin đăng):
*   **Marker Clustering (Gom nhóm):**
    *   *Vấn đề:* Hiển thị 1000 cái ghim (pin) sẽ làm lag ứng dụng.
    *   *Giải pháp:* Sử dụng kỹ thuật Clustering. Khi zoom out, các điểm gần nhau gom thành 1 vòng tròn số (VD: "10+"). Khi zoom in mới tách ra.
    *   *Thư viện Flutter:* `google_maps_cluster_manager` hoặc `fluster`.
*   **Tối ưu pin cho GPS:**
    *   Không bật GPS liên tục (Real-time tracking) nếu không cần thiết. Chỉ lấy vị trí khi mở App hoặc khi Check-in.
    *   Sử dụng `Geofencing` (Hàng rào ảo) để chỉ đánh thức App khi người dùng đi vào khu vực làm việc (Tiết kiệm pin hơn tracking liên tục).

#### 2.4. Pháp lý & Tuân thủ (Legal)
Dự án thu thập dữ liệu nhạy cảm (CCCD, Khuôn mặt, Vị trí), cần tuân thủ nghiêm ngặt **Nghị định 13/2023/NĐ-CP** (và Luật Bảo vệ dữ liệu cá nhân mới sắp có hiệu lực).
*   **Chính sách quyền riêng tư (Privacy Policy):** Cần có văn bản dài, nêu rõ:
    *   Dữ liệu nào được thu thập? (Vị trí, SĐT, Ảnh CCCD).
    *   Mục đích là gì? (Xác thực, tìm việc).
    *   Dữ liệu được chia sẻ cho ai? (Chỉ Employer khi nhận việc).
    *   Quyền rút lại sự đồng ý (Xóa tài khoản).
*   **Quyền lãng quên:** Người dùng có quyền yêu cầu xóa sạch dữ liệu khỏi hệ thống khi họ không dùng nữa.

### 3. Tài liệu tham khảo & Từ khóa tìm kiếm
Bạn có thể tìm kiếm thêm với các từ khóa sau để mở rộng kiến thức:
*   *Business:* "Hyper-local gig economy business model", "Marketplace liquidity strategies".
*   *Tech:* "Flutter Google Maps Clustering", "Geofencing battery optimization".
*   *Legal:* "Mẫu chính sách bảo mật Nghị định 13/2023".

---
*Báo cáo được tổng hợp bởi Gemini CLI Agent vào ngày 07/02/2026.*