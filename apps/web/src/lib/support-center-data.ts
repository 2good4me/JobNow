import { FileText, ShieldCheck, HelpCircle, MapPin } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ── Types ─────────────────────────────────────── */
export interface GuideArticle {
    id: string;
    title: string;
    summary: string;
    content: string;
    categoryId: string;
    categoryName: string;
}

export interface GuideCategory {
    id: string;
    name: string;
    icon: LucideIcon;
    articles: GuideArticle[];
}

/* ── Data ──────────────────────────────────────── */
export const GUIDE_CATEGORIES: GuideCategory[] = [
    {
        id: 'getting-started',
        name: 'Bắt đầu sử dụng',
        icon: HelpCircle,
        articles: [
            {
                id: 'gs-1',
                title: 'Cách tạo tài khoản JobNow',
                summary: 'Hướng dẫn đăng ký tài khoản nhanh chóng trên nền tảng JobNow',
                categoryId: 'getting-started',
                categoryName: 'Bắt đầu sử dụng',
                content: `
                    <h2>Đăng ký tài khoản</h2>
                    <p>Để bắt đầu sử dụng JobNow, bạn cần tạo một tài khoản miễn phí. Quy trình đăng ký rất đơn giản và chỉ mất vài phút.</p>
                    <h3>Bước 1: Truy cập trang đăng ký</h3>
                    <p>Nhấn vào nút <strong>"Đăng ký"</strong> ở góc trên bên phải của trang chủ, hoặc truy cập trực tiếp tại <strong>jobnow.vn/register</strong>.</p>
                    <h3>Bước 2: Nhập thông tin</h3>
                    <p>Điền đầy đủ các thông tin cần thiết bao gồm:</p>
                    <ul>
                        <li>Họ và tên</li>
                        <li>Số điện thoại</li>
                        <li>Email</li>
                        <li>Mật khẩu (tối thiểu 8 ký tự)</li>
                    </ul>
                    <h3>Bước 3: Xác minh tài khoản</h3>
                    <p>Nhập mã OTP được gửi qua SMS hoặc email để hoàn tất quá trình đăng ký.</p>
                `,
            },
            {
                id: 'gs-2',
                title: 'Cách tạo hồ sơ xin việc',
                summary: 'Tạo hồ sơ chuyên nghiệp để thu hút nhà tuyển dụng',
                categoryId: 'getting-started',
                categoryName: 'Bắt đầu sử dụng',
                content: `
                    <h2>Tạo hồ sơ xin việc</h2>
                    <p>Một hồ sơ hoàn chỉnh giúp bạn nổi bật hơn trước nhà tuyển dụng và tăng cơ hội tìm được việc phù hợp.</p>
                    <h3>Thông tin cá nhân</h3>
                    <p>Cập nhật đầy đủ ảnh đại diện, họ tên, ngày sinh, địa chỉ và thông tin liên hệ.</p>
                    <h3>Kinh nghiệm làm việc</h3>
                    <p>Liệt kê các công việc đã từng làm, bao gồm tên công ty, vị trí, thời gian và mô tả công việc.</p>
                    <h3>Kỹ năng</h3>
                    <p>Thêm các kỹ năng liên quan để nhà tuyển dụng dễ dàng tìm thấy bạn.</p>
                `,
            },
            {
                id: 'gs-3',
                title: 'Hướng dẫn đăng nhập',
                summary: 'Các cách đăng nhập vào tài khoản JobNow của bạn',
                categoryId: 'getting-started',
                categoryName: 'Bắt đầu sử dụng',
                content: `
                    <h2>Đăng nhập tài khoản</h2>
                    <p>Bạn có thể đăng nhập bằng nhiều cách khác nhau:</p>
                    <h3>Đăng nhập bằng số điện thoại/email</h3>
                    <p>Nhập số điện thoại hoặc email đã đăng ký cùng mật khẩu của bạn.</p>
                    <h3>Đăng nhập bằng Google</h3>
                    <p>Nhấn vào nút <strong>"Đăng nhập bằng Google"</strong> và chọn tài khoản Google của bạn.</p>
                    <h3>Quên mật khẩu?</h3>
                    <p>Nhấn vào <strong>"Quên mật khẩu"</strong>, nhập email hoặc số điện thoại để nhận liên kết đặt lại mật khẩu.</p>
                `,
            },
        ],
    },
    {
        id: 'job-search',
        name: 'Tìm kiếm việc làm',
        icon: MapPin,
        articles: [
            {
                id: 'js-1',
                title: 'Tìm việc theo vị trí GPS',
                summary: 'Sử dụng tính năng GPS để tìm việc gần nơi bạn ở',
                categoryId: 'job-search',
                categoryName: 'Tìm kiếm việc làm',
                content: `
                    <h2>Tìm việc theo vị trí GPS</h2>
                    <p>JobNow sử dụng công nghệ định vị GPS để hiển thị các công việc gần vị trí hiện tại của bạn.</p>
                    <h3>Bật định vị</h3>
                    <p>Cho phép trình duyệt hoặc ứng dụng truy cập vị trí của bạn khi được yêu cầu.</p>
                    <h3>Bản đồ việc làm</h3>
                    <p>Xem các công việc được hiển thị trên bản đồ, bao gồm khoảng cách từ vị trí của bạn đến nơi làm việc.</p>
                    <h3>Bộ lọc khoảng cách</h3>
                    <p>Tùy chỉnh bán kính tìm kiếm (1km, 3km, 5km, 10km) để tìm việc trong phạm vi mong muốn.</p>
                `,
            },
            {
                id: 'js-2',
                title: 'Sử dụng bộ lọc tìm kiếm',
                summary: 'Cách lọc công việc theo ngành nghề, mức lương và thời gian',
                categoryId: 'job-search',
                categoryName: 'Tìm kiếm việc làm',
                content: `
                    <h2>Bộ lọc tìm kiếm nâng cao</h2>
                    <p>Sử dụng các bộ lọc để thu hẹp kết quả tìm kiếm và tìm đúng công việc phù hợp.</p>
                    <h3>Lọc theo ngành nghề</h3>
                    <p>Chọn ngành nghề bạn quan tâm: Nhà hàng, Bán lẻ, Kho vận, Shipper, Bảo vệ, v.v.</p>
                    <h3>Lọc theo mức lương</h3>
                    <p>Đặt mức lương tối thiểu mong muốn hoặc chọn khoảng lương phù hợp.</p>
                    <h3>Lọc theo thời gian</h3>
                    <p>Chọn loại hình công việc: toàn thời gian, bán thời gian, ca sáng, ca tối, hoặc linh hoạt.</p>
                `,
            },
            {
                id: 'js-3',
                title: 'Lưu và quản lý việc làm yêu thích',
                summary: 'Cách lưu lại các công việc bạn quan tâm để xem sau',
                categoryId: 'job-search',
                categoryName: 'Tìm kiếm việc làm',
                content: `
                    <h2>Quản lý việc làm yêu thích</h2>
                    <p>Lưu lại những công việc bạn quan tâm để dễ dàng theo dõi và ứng tuyển khi sẵn sàng.</p>
                    <h3>Lưu việc làm</h3>
                    <p>Nhấn biểu tượng <strong>trái tim</strong> hoặc <strong>"Lưu"</strong> trên mỗi tin tuyển dụng để lưu vào danh sách yêu thích.</p>
                    <h3>Xem danh sách đã lưu</h3>
                    <p>Truy cập mục <strong>"Việc đã lưu"</strong> trong tài khoản để xem tất cả công việc đã lưu.</p>
                    <h3>Nhận thông báo</h3>
                    <p>Bật thông báo để được cập nhật khi có việc mới phù hợp với tiêu chí của bạn.</p>
                `,
            },
        ],
    },
    {
        id: 'application',
        name: 'Ứng tuyển & Hồ sơ',
        icon: FileText,
        articles: [
            {
                id: 'app-1',
                title: 'Cách ứng tuyển công việc',
                summary: 'Hướng dẫn từng bước để ứng tuyển thành công',
                categoryId: 'application',
                categoryName: 'Ứng tuyển & Hồ sơ',
                content: `
                    <h2>Ứng tuyển công việc</h2>
                    <p>Quy trình ứng tuyển trên JobNow rất đơn giản và nhanh chóng.</p>
                    <h3>Bước 1: Chọn công việc</h3>
                    <p>Tìm và nhấn vào công việc bạn muốn ứng tuyển để xem chi tiết.</p>
                    <h3>Bước 2: Xem yêu cầu</h3>
                    <p>Đọc kỹ mô tả công việc, yêu cầu và quyền lợi trước khi ứng tuyển.</p>
                    <h3>Bước 3: Gửi hồ sơ</h3>
                    <p>Nhấn nút <strong>"Ứng tuyển ngay"</strong>, kiểm tra lại hồ sơ và gửi đi.</p>
                    <h3>Theo dõi trạng thái</h3>
                    <p>Kiểm tra trạng thái ứng tuyển trong mục <strong>"Đơn ứng tuyển"</strong> của tài khoản.</p>
                `,
            },
            {
                id: 'app-2',
                title: 'Cập nhật hồ sơ cá nhân',
                summary: 'Giữ hồ sơ luôn mới nhất để tăng cơ hội việc làm',
                categoryId: 'application',
                categoryName: 'Ứng tuyển & Hồ sơ',
                content: `
                    <h2>Cập nhật hồ sơ</h2>
                    <p>Hồ sơ được cập nhật thường xuyên sẽ giúp bạn nổi bật hơn với nhà tuyển dụng.</p>
                    <h3>Ảnh đại diện</h3>
                    <p>Sử dụng ảnh chân dung rõ nét, chuyên nghiệp.</p>
                    <h3>Thông tin liên hệ</h3>
                    <p>Đảm bảo số điện thoại và email luôn chính xác để nhà tuyển dụng có thể liên hệ.</p>
                    <h3>Kinh nghiệm & Kỹ năng</h3>
                    <p>Bổ sung kinh nghiệm mới và các kỹ năng đã học được.</p>
                `,
            },
            {
                id: 'app-3',
                title: 'Theo dõi đơn ứng tuyển',
                summary: 'Cách kiểm tra trạng thái và quản lý các đơn đã gửi',
                categoryId: 'application',
                categoryName: 'Ứng tuyển & Hồ sơ',
                content: `
                    <h2>Theo dõi đơn ứng tuyển</h2>
                    <p>JobNow giúp bạn theo dõi tất cả đơn ứng tuyển tại một nơi.</p>
                    <h3>Các trạng thái</h3>
                    <ul>
                        <li><strong>Đã gửi</strong> – Đơn đang chờ nhà tuyển dụng xem</li>
                        <li><strong>Đã xem</strong> – Nhà tuyển dụng đã xem hồ sơ của bạn</li>
                        <li><strong>Phỏng vấn</strong> – Bạn được mời phỏng vấn</li>
                        <li><strong>Đã tuyển</strong> – Chúc mừng! Bạn đã được nhận</li>
                    </ul>
                    <h3>Thông báo cập nhật</h3>
                    <p>Bật thông báo để nhận tin nhắn ngay khi trạng thái đơn thay đổi.</p>
                `,
            },
        ],
    },
    {
        id: 'safety',
        name: 'An toàn & Bảo mật',
        icon: ShieldCheck,
        articles: [
            {
                id: 'sf-1',
                title: 'Nhận biết tin tuyển dụng lừa đảo',
                summary: 'Các dấu hiệu cảnh báo và cách tự bảo vệ khi tìm việc',
                categoryId: 'safety',
                categoryName: 'An toàn & Bảo mật',
                content: `
                    <h2>Nhận biết lừa đảo tuyển dụng</h2>
                    <p>JobNow cam kết bảo vệ người dùng khỏi các tin tuyển dụng không trung thực. Hãy cảnh giác với những dấu hiệu sau:</p>
                    <h3>Dấu hiệu cảnh báo</h3>
                    <ul>
                        <li>Yêu cầu đóng phí trước khi làm việc</li>
                        <li>Hứa hẹn mức lương quá cao so với thị trường</li>
                        <li>Yêu cầu cung cấp thông tin tài khoản ngân hàng</li>
                        <li>Không có địa chỉ công ty rõ ràng</li>
                        <li>Yêu cầu chuyển tiền hoặc mua sản phẩm</li>
                    </ul>
                    <h3>Cách xử lý</h3>
                    <p>Nếu phát hiện tin lừa đảo, hãy nhấn <strong>"Báo cáo"</strong> ngay trên tin tuyển dụng đó. Đội ngũ JobNow sẽ xử lý trong vòng 24 giờ.</p>
                `,
            },
            {
                id: 'sf-2',
                title: 'Bảo mật tài khoản',
                summary: 'Các biện pháp bảo vệ tài khoản cá nhân của bạn',
                categoryId: 'safety',
                categoryName: 'An toàn & Bảo mật',
                content: `
                    <h2>Bảo mật tài khoản</h2>
                    <p>Bảo vệ tài khoản của bạn với các biện pháp bảo mật sau:</p>
                    <h3>Mật khẩu mạnh</h3>
                    <p>Sử dụng mật khẩu ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.</p>
                    <h3>Xác thực hai yếu tố</h3>
                    <p>Bật xác thực hai yếu tố (2FA) trong cài đặt bảo mật để tăng cường bảo vệ.</p>
                    <h3>Không chia sẻ thông tin</h3>
                    <p>Không bao giờ chia sẻ mật khẩu hoặc mã OTP với bất kỳ ai, kể cả người tự xưng là nhân viên JobNow.</p>
                `,
            },
            {
                id: 'sf-3',
                title: 'Quyền riêng tư dữ liệu',
                summary: 'Cách JobNow bảo vệ thông tin cá nhân của bạn',
                categoryId: 'safety',
                categoryName: 'An toàn & Bảo mật',
                content: `
                    <h2>Quyền riêng tư dữ liệu</h2>
                    <p>JobNow cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của bạn.</p>
                    <h3>Dữ liệu được thu thập</h3>
                    <p>Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp dịch vụ tìm việc, bao gồm hồ sơ cá nhân và lịch sử tìm kiếm.</p>
                    <h3>Kiểm soát dữ liệu</h3>
                    <p>Bạn có toàn quyền kiểm soát dữ liệu cá nhân. Truy cập <strong>Cài đặt → Quyền riêng tư</strong> để quản lý thông tin.</p>
                    <h3>Xóa tài khoản</h3>
                    <p>Bạn có thể yêu cầu xóa toàn bộ dữ liệu bất cứ lúc nào trong phần <strong>Cài đặt tài khoản</strong>.</p>
                `,
            },
        ],
    },
];

/* ── Helpers ───────────────────────────────────── */
export function getAllArticles(): (GuideArticle & { categoryName: string })[] {
    return GUIDE_CATEGORIES.flatMap((cat) =>
        cat.articles.map((a) => ({ ...a, categoryName: cat.name })),
    );
}
