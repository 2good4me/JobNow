# Các Trường hợp Báo cáo (Report Scenarios)

Tài liệu này liệt kê chi tiết các lý do báo cáo mà hệ thống cần hỗ trợ để người dùng lựa chọn khi xảy ra mâu thuẫn. Đây sẽ là cơ sở để thiết kế **Menu Báo cáo** trên ứng dụng.

## 1. Người tìm việc báo cáo Nhà tuyển dụng (Candidate -> Employer)

Khi ứng viên cảm thấy bị lừa dối, không an toàn hoặc bị đối xử bất công.

| Lý do báo cáo | Mô tả chi tiết | Mức độ nghiêm trọng | Xử lý |
| :--- | :--- | :--- | :--- |
| **Lừa đảo / Đa cấp** | Yêu cầu đóng tiền cọc, dụ dỗ tham gia mạng lưới, công việc không có thật. | 🔴 Cao nhất | Ẩn tin ngay, khóa tài khoản nếu xác thực. |
| **Sai lệch mô tả** | Công việc thực tế khác xa tin đăng (VD: Tuyển bưng bê lại bắt đi tiếp thị), lương thực nhận thấp hơn thỏa thuận. | 🟠 Trung bình | Cảnh báo NTD, yêu cầu sửa tin. |
| **Quỵt tiền / Trả thiếu** | Không thanh toán tiền công, trả không đủ, khất nợ quá hạn. | 🔴 Cao | Yêu cầu giải trình, khóa đăng tin mới. |
| **Thái độ / Quấy rối** | Có hành vi xúc phạm, quấy rối tình dục, đe dọa vũ lực. | 🔴 Cao nhất | Chuyển cơ quan chức năng nếu cần, khóa vĩnh viễn. |
| **Bùng kèo (Ghosting)** | Ứng viên đến nơi nhưng NTD không có mặt, không liên lạc được, cửa hàng đóng cửa. | 🟠 Trung bình | Trừ điểm uy tín nặng. |
| **Địa chỉ không an toàn** | Địa điểm làm việc tồi tàn, nguy hiểm, khác địa chỉ trên map quá xa. | 🟠 Trung bình | Kiểm tra lại tọa độ, Blacklist địa chỉ. |

## 2. Nhà tuyển dụng báo cáo Người tìm việc (Employer -> Candidate)

Khi người làm việc không đáp ứng yêu cầu hoặc gây thiệt hại.

| Lý do báo cáo | Mô tả chi tiết | Mức độ nghiêm trọng | Xử lý |
| :--- | :--- | :--- | :--- |
| **Bùng kèo (No-show)** | Đã nhận việc nhưng không đến, không báo trước. | 🔴 Cao | Trừ 20 điểm uy tín, cấm ứng tuyển tạm thời. |
| **Thái độ kém** | Không trung thực, lười biếng, cãi vã, không tuân thủ nội quy. | 🟠 Trung bình | Trừ điểm uy tín. |
| **Làm việc không đạt** | Không hoàn thành đầu việc, thiếu kỹ năng đã khai báo trong hồ sơ. | 🟡 Thấp | Ghi nhận đánh giá sao thấp. |
| **Hủy phút chót** | Hủy nhận việc quá sát giờ làm khiến chủ không tìm kịp người thay thế. | 🟠 Trung bình | Trừ 10 điểm uy tín. |
| **Trộm cắp / Phá hoại** | Lấy cắp tài sản, cố ý làm hư hỏng đồ đạc. | 🔴 Cao nhất | **Khóa vĩnh viễn**, cung cấp thông tin cho công an. |
| **Người giả mạo** | Người đến làm không phải là người trong hồ sơ (nhờ người khác đi làm hộ). | 🔴 Cao | Từ chối thanh toán, cảnh báo tài khoản. |

## 3. Quy trình Xử lý Báo cáo

1.  **Gửi báo cáo:** Người dùng chọn lý do, viết mô tả và **đính kèm bằng chứng** (ảnh chụp màn hình chat, ảnh hiện trường...).
2.  **Sàng lọc AI (Tự động):** Hệ thống kiểm tra từ khóa, lịch sử của 2 bên.
3.  **Xử lý:**
    *   **Nhẹ (Thái độ, Hủy):** Hệ thống tự động ghi nhận và trừ điểm uy tín (nếu có bằng chứng rõ ràng hoặc bị nhiều người report).
    *   **Nặng (Lừa đảo, Quỵt tiền, Trộm cắp):** Đẩy về cho **Admin** xem xét hồ sơ và bằng chứng để xử lý thủ công (Ban nick).
