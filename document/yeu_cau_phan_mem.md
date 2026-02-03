1.1. Mục đích
Tài liệu đặc tả yêu cầu phần mềm này mô tả chi tiết các yêu cầu chức năng và phi chức năng của Hệ thống Quản lý và Tuyển dụng Việc làm Thời vụ theo định vị GPS. Mục đích của tài liệu là cung cấp một cơ sở thống nhất cho việc phát triển, kiểm thử và triển khai hệ thống, đồng thời giúp các bên liên quan như đội phát triển, kiểm thử, nhà đầu tư và quản lý dự án hiểu rõ các yêu cầu của hệ thống. Tài liệu này sẽ là cơ sở để xác định rõ các yêu cầu chức năng và phi chức năng, định hướng cho quá trình thiết kế, phát triển, kiểm thử và bảo trì, giảm thiểu rủi ro hiểu sai yêu cầu giữa các bên, đảm bảo hệ thống được xây dựng đúng với mục tiêu kết nối việc làm nhanh chóng và thuận tiện dựa trên vị trí địa lý.

1.2. Phạm vi
1.2.1. Phạm vi của hệ thống
Hệ thống là một nền tảng trực tuyến (tập trung vào ứng dụng di động) được thiết kế để kết nối Nhà tuyển dụng và Người tìm việc dựa trên vị trí địa lý thực (GPS) và nhu cầu "làm ngay", hướng đến đối tượng là sinh viên, lao động phổ thông và các chủ cửa hàng, doanh nghiệp cần nhân sự thời vụ. Hệ thống hỗ trợ các chức năng dành cho nhiều đối tượng người dùng khác nhau bao gồm:
●	Người tìm việc (Candidate) có chức năng đăng ký, đăng nhập, tạo hồ sơ (kỹ năng, thời gian rảnh), tìm kiếm việc làm trên bản đồ xung quanh vị trí hiện tại, ứng tuyển nhanh, lưu công việc và nhận thông báo việc làm mới.
●	Nhà tuyển dụng (Employer) có chức năng đăng tin tuyển dụng gắn với vị trí bản đồ, thực hiện xác thực danh tính (eKYC) để tăng uy tín, quản lý hồ sơ ứng viên, liên hệ trực tiếp và đánh giá nhân viên.
●	Quản trị viên (Admin) có chức năng quản lý tài khoản người dùng, kiểm duyệt tin đăng để loại bỏ nội dung xấu/lừa đảo, quản lý danh mục ngành nghề và xem báo cáo thống kê.

Hệ thống được thiết kế với khả năng xử lý trơn tru các tác vụ liên quan đến bản đồ và định vị theo thời gian thực. Các tính năng quan trọng bao gồm tìm kiếm việc làm theo bán kính, gợi ý việc làm gần nhất, cơ chế xác thực danh tính (eKYC) để đảm bảo an toàn, và khả năng chịu tải cao vào các khung giờ cao điểm tuyển dụng.

1.2.2. Phạm vi của tài liệu
Tài liệu này được xây dựng nhằm mô tả các yêu cầu hệ thống chi tiết phục vụ cho quá trình phát triển, kiểm thử và triển khai hệ thống tuyển dụng việc làm thời vụ. Tài liệu sẽ được sử dụng bởi:
●	Nhóm phát triển phần mềm: Sử dụng tài liệu làm cơ sở để thiết kế, lập trình và triển khai hệ thống (Mobile App & Backend) theo đúng yêu cầu.
●	Nhóm kiểm thử: Kiểm tra tính đúng đắn và đầy đủ của hệ thống, đặc biệt là tính chính xác của thuật toán tìm kiếm theo vị trí và quy trình ứng tuyển.
●	Nhóm quản lý dự án: Đánh giá phạm vi, tiến độ và kiểm soát chất lượng sản phẩm trước khi đưa vào vận hành.
●	Khách hàng/Nhà đầu tư: Hiểu rõ các tính năng, phạm vi và giới hạn của hệ thống trong giai đoạn đầu.

Tài liệu này xác định phạm vi phát triển của phiên bản đầu tiên của hệ thống. Bất kỳ yêu cầu bổ sung hoặc thay đổi nào sẽ được xem xét và cập nhật trong các phiên bản tài liệu sau.

2. Mô tả chung
2.1. Bối cảnh sản phẩm
Hệ thống Quản lý và Tuyển dụng Việc làm Thời vụ theo định vị GPS là một nền tảng công nghệ kết hợp giữa ứng dụng di động (Mobile App) và Website quản trị. Ứng dụng di động được phát triển đa nền tảng (Android, iOS) để phục vụ người dùng cuối (Người tìm việc và Nhà tuyển dụng) với tính năng cốt lõi là định vị GPS thời gian thực. Website quản trị dành cho Quản trị viên để vận hành hệ thống. Hệ thống tương tác với các dịch vụ bản đồ số (Google Maps/Mapbox) để cung cấp dữ liệu vị trí chính xác. Dữ liệu người dùng và việc làm được lưu trữ tập trung trên máy chủ đám mây (Cloud Server), đảm bảo tính sẵn sàng cao và bảo mật thông tin cá nhân.

2.2. Các lớp người dùng và đặc điểm
Người dùng | Đặc điểm
--- | ---
**Người tìm việc (Candidate)** | ● **Đặc điểm:** Là sinh viên, lao động phổ thông, người cần việc làm thêm linh hoạt. Số lượng dự kiến lớn, có thể lên hàng chục nghìn người.<br>● **Tương tác:** Đăng ký/đăng nhập, cập nhật hồ sơ, bật định vị để tìm việc làm xung quanh, ứng tuyển "một chạm", nhận thông báo việc làm mới.<br>● **Tần suất sử dụng:** Cao (hàng ngày hoặc khi có nhu cầu tìm việc gấp).<br>● **Yêu cầu đặc biệt:** Giao diện đơn giản, dễ sử dụng (dành cho cả người ít am hiểu công nghệ), định vị chính xác, hoạt động mượt mà trên các dòng điện thoại phổ thông.
**Nhà tuyển dụng (Employer)** | ● **Đặc điểm:** Cá nhân, chủ hộ kinh doanh, cửa hàng, hoặc doanh nghiệp vừa và nhỏ cần tuyển nhân sự thời vụ/bán thời gian gấp.<br>● **Tương tác:** Đăng tin tuyển dụng (có gắn vị trí bản đồ), duyệt hồ sơ ứng viên, liên hệ ứng viên, thanh toán phí dịch vụ (nếu có).<br>● **Tần suất sử dụng:** Trung bình (khi phát sinh nhu cầu nhân sự).<br>● **Yêu cầu đặc biệt:** Quy trình đăng tin nhanh gọn, công cụ quản lý ứng viên trực quan, cơ chế xác thực danh tính (eKYC) nhanh chóng để tạo niềm tin.
**Quản trị viên (Admin)** | ● **Đặc điểm:** Đội ngũ vận hành hệ thống.<br>● **Tương tác:** Quản lý người dùng, kiểm duyệt tin đăng, giải quyết khiếu nại, xem báo cáo thống kê.<br>● **Tần suất sử dụng:** Thường xuyên (hàng ngày).<br>● **Yêu cầu đặc biệt:** Công cụ quản trị mạnh mẽ, báo cáo chi tiết, khả năng can thiệp nhanh khi có báo cáo lừa đảo/vi phạm.
