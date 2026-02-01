# Thiết kế Hệ thống Điểm Uy tín (Reputation System)

Để hệ thống hoạt động công bằng và giảm thiểu tình trạng "bùng kèo", chúng ta cần một cơ chế tính điểm rõ ràng, minh bạch và đủ sức răn đe.

## 1. Nguyên tắc chung
*   **Điểm khởi tạo:** Mỗi tài khoản mới (đã xác thực SĐT) bắt đầu với **100 điểm**.
*   **Thang điểm:** 0 - 200+ (Không giới hạn trần, nhưng dưới mức sàn sẽ bị khóa).
*   **Cập nhật:** Điểm được cộng/trừ ngay lập tức sau khi hành động hoàn tất (Real-time).

## 2. Công thức Cộng/Trừ điểm (Scoring Rules)

Chúng ta chia thành 2 nhóm hành động chính: **Hoàn thành công việc** và **Hủy bỏ/Vi phạm**.

### A. Đối với Người tìm việc (Candidate)

| Hành động | Điểm thay đổi | Ghi chú |
| :--- | :--- | :--- |
| **Hoàn thành** | | |
| Hoàn thành công việc (được Employer xác nhận) | **+2 điểm** | Điểm cơ bản cho sự cam kết. |
| Nhận đánh giá 5 sao từ Employer | **+3 điểm** | Thưởng chất lượng làm việc tốt. |
| Nhận đánh giá 4 sao | **+1 điểm** | Tốt nhưng còn điểm cần cải thiện. |
| **Vi phạm / Tiêu cực** | | |
| Nhận đánh giá 1-2 sao | **-5 điểm** | Làm việc kém, thái độ xấu. |
| Hủy nhận việc (báo trước > 24h) | **-2 điểm** | Có báo trước, mức phạt nhẹ. |
| Hủy nhận việc (báo trước < 2h) | **-10 điểm** | Gây khó khăn cho chủ, phạt nặng. |
| **Bùng kèo (No-show)** (Không đến, không báo) | **-20 điểm** | **Vi phạm nghiêm trọng nhất.** |

### B. Đối với Nhà tuyển dụng (Employer)

| Hành động | Điểm thay đổi | Ghi chú |
| :--- | :--- | :--- |
| **Hoàn thành** | | |
| Tuyển dụng thành công & Thanh toán đầy đủ | **+2 điểm** | |
| Nhận đánh giá 5 sao từ Candidate | **+3 điểm** | Môi trường tốt, chủ thân thiện. |
| **Vi phạm / Tiêu cực** | | |
| Hủy lịch làm (báo trước < 2h) | **-10 điểm** | Làm lỡ việc của người lao động. |
| Bùng kèo (Không xác nhận, quỵt lương) | **-30 điểm** | Phạt nặng hơn vì là người nắm chuôi. |
| Báo cáo sai sự thật (Report false) | **-15 điểm** | Cố tình hại ứng viên. |

## 3. Phân hạng & Đặc quyền (Tiers & Rewards)

Điểm số không chỉ để phạt, mà phải dùng để **kích thích** người dùng phấn đấu.

| Hạng | Điểm số | Quyền lợi & Hạn chế |
| :--- | :--- | :--- |
| **Uy tín cao (Diamond)** | **> 150** | - Tin đăng/Hồ sơ luôn hiển thị trên cùng (Top 1).<br>- Huy hiệu "Diamond" lấp lánh.<br>- Ưu tiên giải quyết khiếu nại. |
| **Tin cậy (Gold)** | **120 - 149** | - Hiển thị ưu tiên sau Diamond.<br>- Được ứng tuyển nhiều việc cùng lúc. |
| **Tiêu chuẩn (Standard)** | **80 - 119** | - Quyền lợi cơ bản. |
| **Rủi ro (Risk)** | **50 - 79** | - **Cảnh báo vàng:** Tài khoản bị gắn mác "Tỉ lệ hủy cao".<br>- Chỉ được ứng tuyển/đăng 1 tin tại một thời điểm. |
| **Hạn chế (Restricted)** | **30 - 49** | - Bị cấm đăng tin/ứng tuyển trong 7 ngày.<br>- Phải làm thủ tục cam kết để mở lại. |
| **Cấm (Banned)** | **< 30** | - **Khóa tài khoản vĩnh viễn.** |

## 4. Cơ chế Khen thưởng & Gamification (Khuyến khích người tích cực)

Ngoài điểm số, hệ thống cần các phần thưởng phụ để khuyến khích sự "Duy trì" và "Tương tác".

### A. Huy hiệu thành tựu (Badges)
Những huy hiệu này sẽ hiển thị đẹp mắt trên hồ sơ người dùng, giúp họ dễ được tuyển/tuyển được người hơn.

*   **🏆 Ong Chăm Chỉ:** Dành cho ứng viên hoàn thành > 20 công việc/tháng.
*   **⚡ Phản hồi siêu tốc:** Dành cho NTD trả lời tin nhắn/duyệt đơn trong vòng 15 phút.
*   **🌟 Nhà phê bình tích cực:** Dành cho người (cả 2 bên) thường xuyên viết đánh giá chi tiết (có tâm) sau mỗi công việc. **Thưởng: +1 điểm mỗi lần đánh giá.**
*   **🛡️ Chiến binh uy tín:** Không hủy/bùng kèo lần nào trong suốt 6 tháng.

### B. Thưởng điểm Viết Đánh giá (Review Incentive)
Hệ thống khuyến khích người dùng Review người khác để làm sạch cộng đồng.
*   **Quy tắc:** Mỗi khi hoàn thành công việc, nếu bạn bỏ thời gian đánh giá người kia => Hệ thống tặng bạn **+1 điểm uy tín**.
*   -> Điều này kích thích họ không "lười" bấm đánh giá.

