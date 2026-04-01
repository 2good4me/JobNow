# Hệ Thống Điểm Uy Tín (Trust Score) - JobNow

Tài liệu này tổng hợp các trường hợp cộng/trừ điểm uy tín, xác định các ngưỡng thưởng phạt và đề xuất kế hoạch bổ sung logic còn thiếu trong mã nguồn.

---

## 1. Danh sách các trường hợp (Cases) xử lý điểm uy tín

Dựa trên tài liệu thiết kế và mã nguồn hiện tại (`reputation.ts`), dưới đây là tất cả các tình huống tác động đến điểm uy tín:

### A. Đối với Ứng viên (Candidate)
| Hành động | Mã (Code) | Loại | Điểm | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Hoàn thành ca làm** | `C_COMPLETED` | Thưởng | +2 | Tự động cộng sau khi Check-out thành công. |
| **Đánh giá 5 sao** | `C_RATING_5` | Thưởng | +3 | Nhận được đánh giá 5 sao từ Nhà tuyển dụng. |
| **Đánh giá đối tác** | `C_REVIEW_OTHER` | Thưởng | +1 | Gửi đánh giá cho Nhà tuyển dụng. |
| **Hủy đơn > 24h** | `C_CANCEL_G24` | Phạt | -2 | Hủy ca làm việc trước giờ bắt đầu trên 24 giờ. |
| **Hủy đơn 2h - 24h**| `C_CANCEL_2_24`| Phạt | -10 | Hủy ca làm việc trong khoảng 2h đến 24h trước giờ bắt đầu. |
| **Hủy đơn < 2h** | `C_CANCEL_L2` | Phạt | -30 | Hủy sát giờ (<2h). **Cần bổ sung: Khóa ứng tuyển 3 ngày.** |
| **Bùng ca (No-show)**| `C_NOSHOW` | Phạt | -50 | Không đến check-in (Hệ thống tự động quét sau 30 phút quá giờ). |
| **Chuỗi hành vi tốt**| `SYSTEM_STREAK` | Thưởng | Biến động| Hoàn lại 50% số điểm đã mất nếu có chuỗi 10 hành động tốt liên tiếp. |

### B. Đối với Nhà tuyển dụng (Employer)
| Hành động | Mã (Code) | Loại | Điểm | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Thanh toán đúng hạn**| `E_PAID_ONTIME` | Thưởng | +2 | Thanh toán cho ứng viên ngay sau khi ca làm hoàn thành. |
| **Nhận đánh giá 5 sao**| `E_RATING_5` | Thưởng | +3 | Được ứng viên đánh giá tốt. |
| **Duyệt đơn nhanh** | `E_QUICK_APP` | Thưởng | +1 | Duyệt đơn ứng tuyển trong thời gian ngắn. |
| **Hủy bài đăng** | `E_CANCEL_POST` | Phạt | -10 | Hủy công việc sau khi đã có người ứng tuyển. |
| **Hủy việc sát giờ** | `E_CANCEL_L2` | Phạt | -40 | Hủy ca làm khi chỉ còn dưới 2 giờ (gây thiệt hại cho ứng viên). |
| **Thông tin sai lệch** | `E_REPORT_FALSE`| Phạt | -50 | Bị báo cáo và xác minh đăng tin lừa đảo/sai sự thật. |

### C. Hệ thống (System)
| Hành động | Mã (Code) | Loại | Điểm | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Xác thực eKYC** | `EKYC_VERIFIED` | Thưởng | +20 | Tặng điểm khích lệ sau khi hoàn thành định danh. |

---

## 2. Ngưỡng điểm và Chế tài Thưởng/Phạt (Thresholds)

| Ngưỡng điểm | Xếp hạng (Tier) | Quyền lợi / Hạn chế |
| :--- | :--- | :--- |
| **> 200** | **DIAMOND** | Ưu tiên hiển thị đơn ứng tuyển, phí dịch vụ thấp hơn (nếu có). |
| **150 - 200** | **GOLD** | Huy hiệu vàng trên Avatar, tin cậy cao. |
| **100 - 150** | **STANDARD** | Trạng thái bình thường (Điểm khởi tạo: 100). |
| **60 - 100** | **RISK** | Cảnh báo viền vàng, Employer sẽ cân nhắc kỹ trước khi duyệt. |
| **30 - 60** | **RESTRICTED** | **Viền đỏ cảnh báo.** Giới hạn số ca ứng tuyển tối đa (Ví dụ: tối đa 1 ca Active). |
| **< 30** | **BANNED** | **Khóa tài khoản (Shadow Ban).** Phải nạp tiền "mua lại điểm" để mở khóa. |

---

## 3. Kế hoạch bổ sung Code (Action Plan)

Hiện tại, mã nguồn đã có khung xương (`reputation.ts`), nhưng thiếu các logic thực thi chế tài. Cần thực hiện các bước sau:

### Bước 1: Điều chỉnh giá trị điểm (reputation.ts)
- Cập nhật lại hằng số điểm trong `REPUTATION_ACTIONS` để khớp với tài liệu thiết kế (Ví dụ: `C_CANCEL_G24` từ -5 về -2).

### Bước 2: Bổ sung logic Khóa 3 ngày (withdrawApplication)
- Trong hàm `withdrawApplication` (apps/functions/src/index.ts), nếu `actionCode === 'C_CANCEL_L2'`, thực hiện cập nhật trường `banned_until` trong document User cộng thêm 3 ngày.

### Bước 3: Chặn ứng tuyển khi điểm thấp (applyJob)
- Thêm check logic trong `applyJob`: Nếu `reputation_score < 30` hoặc `banned_until > now`, ném lỗi `permission-denied`.
- Nếu `reputation_score < 60`, kiểm tra số lượng đơn đang `APPROVED/CHECKED_IN`, nếu > 1 thì không cho ứng tuyển thêm.

### Bước 4: Logic "Mua lại điểm"
- Tạo một Cloud Function hoặc bổ sung vào luồng thanh toán: Cho phép user nạp tiền vào ví và đổi lấy điểm uy tín (Ví dụ: 50,000đ = 10 điểm) khi đang ở trạng thái `BANNED/RESTRICTED`.

### Bước 5: UI Indicators
- Cập nhật Frontend để hiển thị màu sắc Avatar dựa theo `current_tier` trả về từ Backend.

---

## 4. Prompt đề xuất để thực hiện triển khai

Dưới đây là prompt bạn có thể sử dụng để yêu cầu AI thực hiện các thay đổi này:

> "Hãy cập nhật hệ thống điểm uy tín dựa trên tệp `reputation.ts` và `index.ts`. 
> 1. Điều chỉnh điểm phạt cho `C_CANCEL_G24` thành -2, `C_CANCEL_2_24` thành -10.
> 2. Trong hàm `withdrawApplication`, nếu ứng viên hủy đơn sát giờ (<2h), hãy set `banned_until` của User đó thêm 3 ngày kể từ hiện tại.
> 3. Cập nhật hàm `applyJob` để chặn người dùng có `reputation_score < 30` hoặc đang trong thời gian `banned_until`. Nếu điểm < 60, chỉ cho phép có tối đa 1 đơn ứng tuyển ở trạng thái Active (APPROVED/CHECKED_IN).
> 4. Đảm bảo mọi thay đổi đều được thực hiện trong Transaction để bảo đảm tính toàn vẹn dữ liệu."

---
*Báo cáo được chuẩn bị bởi Gemini CLI - 2024*
