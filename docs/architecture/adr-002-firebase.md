# ADR-002: Lựa chọn Firebase làm Cơ sở dữ liệu và Dịch vụ xác thực

## Status
Accepted

## Context
Dự án JobNow cần phát hành bản MVP trong 1 tuần (để demo) và bản hoàn thiện trong vòng 1 tháng. Quy mô người dùng dự kiến ở mốc 1.000 users. Team chỉ có 1 main dev. Yêu cầu của hệ thống bao gồm quản lý (nhà tuyển dụng, ứng viên, khách), đăng tin tuyển dụng, và tìm việc theo vị trí GPS. Ban đầu dự kiến dùng PostgreSQL và Prisma, tuy nhiên developer đề xuất muốn sử dụng Firebase để tối ưu quy trình.

## Decision
Chuyển đổi hoàn toàn cơ sở dữ liệu từ **PostgreSQL** sang **Firebase (Firestore)** và sử dụng **Firebase Authentication** cho hệ thống đăng nhập.

## Rationale
- **Time to Market:** Firebase cung cấp Auth (Authentication) và Database (Firestore) out-of-the-box mà không cần setup Database server, cấu hình CI/CD, migration schema dài dòng. Rất phù hợp với deadline "1 tuần có bản demo".
- **Real-time GPS Tracking / Job Alert:** Hệ thống liên quan đến JobNow có thể tận dụng lợi thế Real-time listeners của Firestore để cập nhật trực tiếp cho người dùng trạng thái công việc và thông báo ứng tuyển ngay tức thì.
- **Scale:** Với mức độ 1.000 user, Firebase hoàn toàn dư dả trong chế độ miễn phí (Spark plan) hoặc phí cực thấp, không phải lo lắng về việc duy trì hoặc tối ưu SQL query phức tạp.
- **Giảm tải Backend Complexity:** Developer chỉ cần 1 API mỏng (hoặc thậm chí truy vấn trực tiếp từ phía Frontend React) thay vì xây dựng hàng đống routes/controllers cho việc Auth và CRUD cơ bản.

## Trade-offs
- Các Data Relationship (Join nhiều bảng như ứng tuyển với job và thông tin ứng viên) trên NoSQL Firestore sẽ khó khăn hơn SQL truyền thống. Quá trình thiết kế DB sẽ cần chuyển từ Normalized (chuẩn hóa dữ liệu SQL) sang Denormalized (lưu trùng lặp dữ liệu trên Firebase để truy vấn nhanh).
- Cần tuân thủ chặt rule giới hạn Query của NoSQL (chỉ quét (where/in) đúng index).
- **Về vấn đề GPS (Geospatial queries):** Khác với thư viện PostGIS rất mạnh trên PostgreSQL với khả năng truy vấn phức tạp, Firestore không hỗ trợ native spatial queries ở cấp độ cao. Thay vào đó, để tìm những "Công việc gần tôi trong bán kính 5km", chúng ta phải áp dụng kỹ thuật **Geohashing**. Kỹ thuật này đổi (vĩ độ, kinh độ) thành 1 string. Tuy nhiên nó sẽ cần cài thêm thư viện phụ trợ như `geofire-common` trên backend.

## Consequences
- **Positive**: Setup cực nhanh, xử lý real-time tốt, tích hợp Auth xịn xò với vài dòng code.
- **Negative**: Thiết kế schema DB sẽ tốn công denormalize dữ liệu; Không tận dụng được Prisma Typesafe ORM.
- **Mitigation**: Design các NoSQL collections hợp lý. Khai báo TypeScript explicitly (rõ ràng) trên React frontend và Express backend thay cho Prisma client. Cấu hình Firebase Security Rules thật chặt chẽ.
