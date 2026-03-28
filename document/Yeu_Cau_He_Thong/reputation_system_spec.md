# ĐẶC TẢ KỸ THUẬT: HỆ THỐNG ĐIỂM UY TÍN (REPUTATION SYSTEM 2.0)

## 1. TỔNG QUAN (OVERVIEW)
Hệ thống Điểm Uy tín là "xương sống" để điều tiết hành vi người dùng trên nền tảng JobNow. Nó thay thế hình phạt tiền mặt bằng "quyền lợi hiển thị" và "hạn chế tính năng", giúp giảm rào cản gia nhập cho người dùng mới nhưng vẫn đảm bảo tính răn đe.

## 2. CÁC THÔNG SỐ CƠ BẢN (CORE METRICS)
*   **Điểm khởi tạo (Default):** 100 điểm.
*   **Thưởng eKYC:** +20 điểm sau khi xác thực CCCD thành công.
*   **Thang điểm:** 0 - 500.
*   **Đơn vị cập nhật:** Real-time (ngay khi hành động kết thúc).

## 3. LOGIC TÍNH ĐIỂM CHI TIẾT (SCORING LOGIC)

### 3.1. Đối với Ứng viên (Candidate)
| Mã hành động | Hành động | Điểm | Ghi chú |
| :--- | :--- | :--- | :--- |
| `C_COMPLETED` | Hoàn thành ca làm (Check-out hợp lệ) | **+2** | |
| `C_RATING_5` | Được Employer đánh giá 5* | **+3** | |
| `C_REVIEW_OTHER`| Viết đánh giá cho Employer | **+1** | |
| `C_CANCEL_G24` | Hủy ca trước > 24h | **-5** | |
| `C_CANCEL_2_24` | Hủy ca trong khoảng 2h - 24h | **-15** | |
| `C_CANCEL_L2` | Hủy ca sát giờ (< 2h) | **-30** | |
| `C_NOSHOW` | Bùng kèo (Không đến, không báo) | **-50** | Vi phạm nặng nhất. |

### 3.2. Đối với Nhà tuyển dụng (Employer)
| Mã hành động | Hành động | Điểm | Ghi chú |
| :--- | :--- | :--- | :--- |
| `E_PAID_ONTIME` | Thanh toán đúng hạn cho Candidate | **+2** | |
| `E_RATING_5` | Được Candidate đánh giá 5* | **+3** | |
| `E_QUICK_APP` | Duyệt hồ sơ nhanh (< 30p) | **+1** | |
| `E_CANCEL_POST` | Hủy ca đã chốt (> 24h) | **-10** | |
| `E_CANCEL_L2` | Hủy ca sát giờ (< 2h) | **-40** | |
| `E_REPORT_FALSE`| Báo cáo sai sự thật (hại ứng viên) | **-50** | |

## 4. PHÂN HẠNG & TÁC ĐỘNG HỆ THỐNG (TIER SYSTEM)

| Hạng (Rank) | Khoảng điểm | Đặc quyền / Hạn chế |
| :--- | :--- | :--- |
| **DIAMOND** | **> 200** | Ưu tiên hiển thị Top 1, huy hiệu lấp lánh, miễn phí đẩy tin. |
| **GOLD** | **150 - 200** | Ưu tiên hiển thị Top 2, huy hiệu tin cậy. |
| **STANDARD** | **100 - 149** | Tài khoản bình thường. |
| **RISK** | **60 - 99** | **Shadow Ban:** Hồ sơ/Tin đăng bị đẩy xuống cuối. Gắn nhãn "Tỉ lệ hủy cao". |
| **RESTRICTED** | **30 - 59** | Chỉ được ứng tuyển/đăng 1 tin tại một thời điểm. Cảnh báo đỏ. |
| **BANNED** | **< 30** | Khóa tài khoản vĩnh viễn, Blacklist SĐT/CCCD. |

## 5. CƠ CHẾ THÔNG MINH (SMART ALGORITHMS)

### 5.1. Phục hồi Uy tín (Reputation Recovery)
*   **Streak Bonus:** Nếu hoàn thành 10 ca liên tiếp không có bất kỳ hành động tiêu cực nào, hệ thống tự động xóa bỏ **50% tổng điểm đã bị trừ** trước đó (giúp người dùng có cơ hội làm lại).

### 5.2. Chống Đánh giá Ảo (Toxic Rating Protection)
*   Nếu một Employer thường xuyên đánh giá 1-2 sao cho > 80% ứng viên, hệ thống sẽ gắn cờ "Toxic Employer".
*   Điểm trừ uy tín do Employer này gây ra cho ứng viên sẽ ở trạng thái `PENDING` và cần Admin duyệt thủ công.

### 5.3. Kháng nghị (Appeals)
*   Người dùng có **24h** để nhấn nút "Kháng nghị" sau khi bị trừ điểm.
*   Điểm bị trừ sẽ được tạm hoàn nếu kháng nghị được chấp nhận (do thiên tai, tai nạn có minh chứng).

## 6. YÊU CẦU KỸ THUẬT (TECHNICAL REQUIREMENTS)

### 6.1. Database Schema (Gợi ý)
*   Table `users`: Thêm field `reputation_score` (int), `current_tier` (string).
*   Table `reputation_history`:
    *   `id`: UUID
    *   `user_id`: ForeignKey
    *   `action_code`: String (ví dụ: `C_NOSHOW`)
    *   `score_change`: Int (ví dụ: -50)
    *   `balance_after`: Int
    *   `related_job_id`: ForeignKey (optional)
    *   `created_at`: Timestamp

### 6.2. API Endpoints
*   `GET /api/reputation/me`: Lấy điểm hiện tại, thứ hạng và lịch sử biến động.
*   `POST /api/reputation/appeal`: Gửi yêu cầu kháng nghị cho một record cụ thể.

### 6.3. Triggers/Events
*   Lắng nghe Event từ hệ thống Check-in: Nếu `status` của ca làm là `NOSHOW` -> Gọi Service trừ điểm.
*   Lắng nghe Event từ Rating: Nếu `rating` < 3 -> Tính toán trừ điểm dựa trên quy tắc.

## 7. UI/UX GUIDELINES CHO MOBILE APP
1.  **Màn hình Dashboard Uy tín:** Hiển thị biểu đồ hình tròn hoặc thanh bar biểu diễn vị trí điểm trong các phân hạng.
2.  **Notification:** Mỗi khi điểm thay đổi, bắn Push Noti kèm nội dung khích lệ/cảnh báo.
3.  **Cảnh báo trước hành động:** Khi người dùng định bấm "Hủy ca", hiện Popup: *"Nếu hủy bây giờ, bạn sẽ bị trừ -15 điểm uy tín. Bạn vẫn muốn tiếp tục?"*.

---
**Note cho AI Agent:** Hãy triển khai các hàm tính toán điểm trong một Service riêng biệt (`ReputationService`) để dễ dàng bảo trì và unit test. Đảm bảo tính nhất quán (Atomicity) khi cập nhật điểm và lưu lịch sử.
