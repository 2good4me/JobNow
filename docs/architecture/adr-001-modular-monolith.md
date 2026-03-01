# ADR-001: Lựa chọn Monolithic Architecture cho JobNow Backend

## Status
Accepted

## Context
Dự án JobNow cần hoàn thiện phiên bản thử nghiệm có thể demo được trong vòng 1 tuần và một phiên bản Release trong vòng 1 tháng. Quy mô dự kiến ban đầu khoảng 1000 người dùng với khối lượng dữ liệu truy vấn cơ bản. Đội ngũ phát triển bao gồm 1 Main Developer và một vài thành viên phụ trách các chức năng nhỏ. Hệ thống không có ràng buộc chặt chẽ với các công nghệ bên thứ 3 phức tạp.

## Decision
Sử dụng mô hình kiến trúc **Modular Monolith** kết hợp **Layered Architecture**.
Cụ thể, toàn bộ logic Backend sẽ nằm trong `apps/api` của một Monorepo. Các nghiệp vụ (Auth, Jobs, Applications) sẽ được chia tách rõ ràng thành các domains/modules độc lập bên trong project. Tương tác cơ sở dữ liệu sẽ chạy trực tiếp qua **Prisma ORM** cho tới khi cần nghiệp vụ cực kỳ phức tạp thì tiến hóa lên **Repository Pattern**. Không áp dụng kiến trúc Microservices.

## Rationale
- **Time to Market:** Cần hoàn thành MVP nhanh (1 tuần). Một hệ thống Monolith rút ngắn thiểu tối đa thời gian setup infra và deploy.
- **Team Size & Skill:** Với 1 Main Dev, việc chia nhỏ thành Microservices là gánh nặng khổng lồ về bảo trì, làm gián đoạn hiệu suất code.
- **YAGNI (You Aren't Gonna Need It):** Quy mô ~1000 user không đủ lớn để hệ thống nghẽn hay cần scale các services một cách riêng biệt.
- **Tuân thủ Pattern Selection Guidelines:** *Simpler = Better, Faster*. Monolith là điểm khởi đầu, dễ dàng bẻ gãy thành Microservices về sau khi hệ thống chứng minh được tiềm năng và có tài nguyên.

## Trade-offs
- Các domain hiện thời chia sẻ chung một Database. Nếu sau này có một module quá tải (VD: Notification spam), nó có thể ảnh hưởng đến hiệu năng của toàn bộ app.
- Khi team phình to ở mức (20-30 người), có thể gây xung đột khi merge source code.

## Consequences
- **Positive**: Triển khai nhanh, dễ debug, dễ tracking (Sentry chỉ cần check 1 project).
- **Negative**: Thiếu sự cô lập vững chắc (Hard boundary isolation).
- **Mitigation**: Áp dụng triệt để *Layered Architecture* với *Backend Dev Guidelines*. Tổ chức các thư mục Controller/Service theo domain để tách bạch logic. Phân quyền review chặt chẽ theo Git.
