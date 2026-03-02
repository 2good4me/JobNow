/**
 * Seed script: Insert 25 sample jobs around Hanoi (Nam Từ Liêm area)
 *
 * Usage:
 *   1. Set environment variable GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account key path
 *   2. Run: npx ts-node src/scripts/seed-jobs.ts
 *
 * On Windows PowerShell:
 *   $env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccountKey.json"
 *   npx ts-node src/scripts/seed-jobs.ts
 */

import * as admin from 'firebase-admin';
import * as geofire from 'geofire-common';

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();

// ========================================================================
// Nam Từ Liêm center: 21.0180, 105.7657
// Spread jobs in 1-8km radius around this point
// ========================================================================

interface SeedJob {
    employer_id: string;
    employer_name: string;
    title: string;
    description: string;
    category: string;
    salary: number;
    salary_type: 'HOURLY' | 'DAILY' | 'JOB';
    address: string;
    location: { latitude: number; longitude: number };
    is_gps_required: boolean;
    status: 'OPEN';
    shifts: {
        id: string;
        name: string;
        start_time: string;
        end_time: string;
        quantity: number;
    }[];
}

const SEED_JOBS: SeedJob[] = [
    // ============ KHU VỰC NAM TỪ LIÊM (Rất gần) ===========
    {
        employer_id: 'emp_001',
        employer_name: 'The Coffee House - Mỹ Đình',
        title: 'Nhân viên Phục vụ quán Cafe',
        description: 'Cần tuyển nhân viên phục vụ ca tối, phục vụ đồ uống và dọn bàn. Ưu tiên sinh viên năng động.',
        category: 'F&B',
        salary: 30000,
        salary_type: 'HOURLY',
        address: '67 Lê Đức Thọ, Nam Từ Liêm, Hà Nội',
        location: { latitude: 21.0280, longitude: 105.7820 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's1_1', name: 'Ca Sáng', start_time: '08:00', end_time: '12:00', quantity: 2 },
            { id: 's1_2', name: 'Ca Tối', start_time: '17:00', end_time: '22:00', quantity: 3 }
        ]
    },
    {
        employer_id: 'emp_002',
        employer_name: 'Nhà hàng Vừng Ơi - Keangnam',
        title: 'Phụ bếp nhà hàng Hàn Quốc',
        description: 'Tuyển phụ bếp sơ chế thực phẩm, rửa bát. Bao ăn ca. Không yêu cầu kinh nghiệm.',
        category: 'F&B',
        salary: 35000,
        salary_type: 'HOURLY',
        address: 'Tầng G, Keangnam Vina, Phạm Hùng, Nam Từ Liêm',
        location: { latitude: 21.0170, longitude: 105.7837 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's2_1', name: 'Ca Trưa', start_time: '10:00', end_time: '14:00', quantity: 2 }
        ]
    },
    {
        employer_id: 'emp_003',
        employer_name: 'AEON Mall Hà Đông',
        title: 'PG giới thiệu sản phẩm (Cuối tuần)',
        description: 'Tuyển PG đứng giới thiệu sự kiện mới tại AEON. Ngoại hình ưa nhìn, nhanh nhẹn.',
        category: 'Sự kiện',
        salary: 250000,
        salary_type: 'DAILY',
        address: 'AEON Mall, Dương Nội, Hà Đông, Hà Nội',
        location: { latitude: 20.9843, longitude: 105.7503 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's3_1', name: 'Ca Nguyên Ngày', start_time: '09:00', end_time: '21:00', quantity: 5 }
        ]
    },
    {
        employer_id: 'emp_004',
        employer_name: 'GrabExpress Hà Nội',
        title: 'Giao hàng nội thành bằng xe máy',
        description: 'Giao đơn Grab khu vực Cầu Giấy - Mỹ Đình. Thu nhập theo đơn, linh hoạt giờ.',
        category: 'Giao hàng',
        salary: 40000,
        salary_type: 'HOURLY',
        address: 'KĐT Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
        location: { latitude: 21.0220, longitude: 105.7740 },
        is_gps_required: false,
        status: 'OPEN',
        shifts: [
            { id: 's4_1', name: 'Ca Sáng', start_time: '07:00', end_time: '11:00', quantity: 10 },
            { id: 's4_2', name: 'Ca Chiều', start_time: '14:00', end_time: '18:00', quantity: 10 },
            { id: 's4_3', name: 'Ca Tối', start_time: '18:00', end_time: '22:00', quantity: 8 }
        ]
    },
    {
        employer_id: 'emp_005',
        employer_name: 'Trung tâm Tiệc cưới Diamond Palace',
        title: 'Bưng bê phục vụ tiệc cưới',
        description: 'Phục vụ tiệc cưới cuối tuần. Có đồng phục, bao ăn. Thanh toán ngay sau buổi.',
        category: 'Sự kiện',
        salary: 300000,
        salary_type: 'DAILY',
        address: '105 Nguyễn Cơ Thạch, Nam Từ Liêm',
        location: { latitude: 21.0133, longitude: 105.7729 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's5_1', name: 'Ca Tối Thứ 7', start_time: '17:00', end_time: '22:00', quantity: 8 }
        ]
    },
    {
        employer_id: 'emp_006',
        employer_name: 'Vinmart+ Trung Văn',
        title: 'Nhân viên sắp xếp kho hàng',
        description: 'Sắp xếp hàng hóa lên kệ, kiểm đếm tồn kho. Công việc đơn giản.',
        category: 'Bán lẻ',
        salary: 28000,
        salary_type: 'HOURLY',
        address: '15 Tố Hữu, Trung Văn, Nam Từ Liêm',
        location: { latitude: 21.0055, longitude: 105.7888 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's6_1', name: 'Ca Sáng', start_time: '06:00', end_time: '10:00', quantity: 2 }
        ]
    },
    // ============ KHU VỰC CẦU GIẤY (3-5km) ===========
    {
        employer_id: 'emp_007',
        employer_name: 'Highland Coffee - Indochina Plaza',
        title: 'Barista pha chế cà phê',
        description: 'Tuyển barista biết pha máy espresso. Đào tạo thêm tại quán. Tip cao.',
        category: 'F&B',
        salary: 35000,
        salary_type: 'HOURLY',
        address: '241 Xuân Thủy, Cầu Giấy, Hà Nội',
        location: { latitude: 21.0370, longitude: 105.7950 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's7_1', name: 'Ca Sáng', start_time: '07:00', end_time: '14:00', quantity: 1 },
            { id: 's7_2', name: 'Ca Chiều', start_time: '14:00', end_time: '22:00', quantity: 2 }
        ]
    },
    {
        employer_id: 'emp_008',
        employer_name: 'Pizza 4P\'s Trần Thái Tông',
        title: 'Nhân viên bếp nóng - Pizza',
        description: 'Nướng pizza, chuẩn bị topping. Được đào tạo từ đầu. Bao ăn ca.',
        category: 'F&B',
        salary: 32000,
        salary_type: 'HOURLY',
        address: '4 Trần Thái Tông, Cầu Giấy, Hà Nội',
        location: { latitude: 21.0332, longitude: 105.7905 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's8_1', name: 'Ca Trưa', start_time: '10:30', end_time: '14:30', quantity: 2 },
            { id: 's8_2', name: 'Ca Tối', start_time: '17:00', end_time: '22:30', quantity: 3 }
        ]
    },
    {
        employer_id: 'emp_009',
        employer_name: 'FPT Software',
        title: 'Nhập liệu hợp đồng (Remote)',
        description: 'Nhập dữ liệu từ scan PDF vào hệ thống. Làm tại nhà, giao task qua Google Sheet.',
        category: 'Văn phòng',
        salary: 200000,
        salary_type: 'DAILY',
        address: 'Duy Tân, Cầu Giấy, Hà Nội',
        location: { latitude: 21.0314, longitude: 105.7826 },
        is_gps_required: false,
        status: 'OPEN',
        shifts: [
            { id: 's9_1', name: 'Cả ngày', start_time: '09:00', end_time: '17:00', quantity: 5 }
        ]
    },
    // ============ KHU VỰC THANH XUÂN (3-5km) ===========
    {
        employer_id: 'emp_010',
        employer_name: 'Nhà hàng lẩu Haidilao Thanh Xuân',
        title: 'Phục vụ bàn nhà hàng lẩu',
        description: 'Phục vụ khách, dọn bàn, set up đồ ăn. Trả lương theo giờ + phí phục vụ.',
        category: 'F&B',
        salary: 38000,
        salary_type: 'HOURLY',
        address: '52 Lê Trọng Tấn, Thanh Xuân, Hà Nội',
        location: { latitude: 20.9923, longitude: 105.8105 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's10_1', name: 'Ca Trưa', start_time: '11:00', end_time: '14:00', quantity: 3 },
            { id: 's10_2', name: 'Ca Tối', start_time: '17:00', end_time: '23:00', quantity: 5 }
        ]
    },
    {
        employer_id: 'emp_011',
        employer_name: 'Siêu thị Big C Thăng Long',
        title: 'Nhân viên thu ngân cuối tuần',
        description: 'Thu ngân quầy thanh toán siêu thị. Biết tính toán nhanh. Cuối tuần + lễ.',
        category: 'Bán lẻ',
        salary: 220000,
        salary_type: 'DAILY',
        address: '222 Trần Duy Hưng, Cầu Giấy, Hà Nội',
        location: { latitude: 21.0088, longitude: 105.7988 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's11_1', name: 'Ca Nguyên ngày', start_time: '08:00', end_time: '20:00', quantity: 3 }
        ]
    },
    // ============ KHU VỰC BA ĐÌNH / ĐỐNG ĐA (5-7km) ===========
    {
        employer_id: 'emp_012',
        employer_name: 'Quán Bún chả Hương Liên',
        title: 'Phụ bếp quán bún chả',
        description: 'Phụ nướng chả, rửa bát, dọn bàn. Bao ăn trưa. Quán đông khách, tip tốt.',
        category: 'F&B',
        salary: 25000,
        salary_type: 'HOURLY',
        address: '24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội',
        location: { latitude: 21.0127, longitude: 105.8535 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's12_1', name: 'Ca Trưa', start_time: '10:00', end_time: '14:00', quantity: 2 }
        ]
    },
    {
        employer_id: 'emp_013',
        employer_name: 'Khách sạn Mường Thanh Grand',
        title: 'Lễ tân khách sạn (Ca đêm)',
        description: 'Trực lễ tân ca đêm. Yêu cầu: tiếng Anh giao tiếp, tác phong chuyên nghiệp.',
        category: 'Khách sạn',
        salary: 400000,
        salary_type: 'DAILY',
        address: '63 Trần Duy Hưng, Cầu Giấy, Hà Nội',
        location: { latitude: 21.0102, longitude: 105.7971 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's13_1', name: 'Ca Đêm', start_time: '22:00', end_time: '06:00', quantity: 1 }
        ]
    },
    {
        employer_id: 'emp_014',
        employer_name: 'Công ty Event Mercury',
        title: 'PB sự kiện âm nhạc tại SVĐ Mỹ Đình',
        description: 'Hỗ trợ tổ chức sự kiện âm nhạc. Công việc: Soát vé, dẫn khách, phát nước.',
        category: 'Sự kiện',
        salary: 350000,
        salary_type: 'DAILY',
        address: 'SVĐ Quốc Gia Mỹ Đình, Nam Từ Liêm',
        location: { latitude: 21.0207, longitude: 105.7610 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's14_1', name: 'Ca Chiều-Tối', start_time: '15:00', end_time: '23:00', quantity: 20 }
        ]
    },
    {
        employer_id: 'emp_015',
        employer_name: 'Bách Hóa Xanh Mễ Trì',
        title: 'Bốc xếp hàng kho đêm',
        description: 'Bốc xếp hàng từ xe tải vào kho. Công việc nặng nhọc. Thanh toán ngay.',
        category: 'Kho vận',
        salary: 45000,
        salary_type: 'HOURLY',
        address: '18 Mễ Trì, Nam Từ Liêm, Hà Nội',
        location: { latitude: 21.0100, longitude: 105.7720 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's15_1', name: 'Ca Đêm', start_time: '21:00', end_time: '03:00', quantity: 4 }
        ]
    },
    // ============ KHU VỰC HÀ ĐÔNG / HOÀNG MAI (5-8km) ===========
    {
        employer_id: 'emp_016',
        employer_name: 'Phở Thìn Bờ Hồ',
        title: 'Bưng bê phở & dọn bàn',
        description: 'Quán phở nổi tiếng. Khách đông nhất buổi sáng. Bao ăn phở miễn phí.',
        category: 'F&B',
        salary: 28000,
        salary_type: 'HOURLY',
        address: '13 Lò Đúc, Hai Bà Trưng, Hà Nội',
        location: { latitude: 21.0227, longitude: 105.8617 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's16_1', name: 'Ca Sáng Sớm', start_time: '05:30', end_time: '10:00', quantity: 3 }
        ]
    },
    {
        employer_id: 'emp_017',
        employer_name: 'Trung tâm gia sư APlus',
        title: 'Gia sư Toán lớp 9 (Tại nhà)',
        description: 'Dạy kèm Toán học sinh lớp 9 tại nhà phụ huynh ở Mỹ Đình. 3 buổi/tuần.',
        category: 'Giáo dục',
        salary: 200000,
        salary_type: 'JOB',
        address: 'KĐT Mỹ Đình 2, Mễ Trì, Nam Từ Liêm',
        location: { latitude: 21.0155, longitude: 105.7683 },
        is_gps_required: false,
        status: 'OPEN',
        shifts: [
            { id: 's17_1', name: 'Tối T2-T4-T6', start_time: '19:00', end_time: '21:00', quantity: 1 }
        ]
    },
    {
        employer_id: 'emp_018',
        employer_name: 'Rửa xe Tuấn - Phạm Hùng',
        title: 'Nhân viên rửa xe ô tô',
        description: 'Rửa xe ô tô nội/ngoại thất. Có hệ thống máy rửa hiện đại. Tip khách.',
        category: 'Dịch vụ',
        salary: 30000,
        salary_type: 'HOURLY',
        address: '88 Phạm Hùng, Mỹ Đình, Nam Từ Liêm',
        location: { latitude: 21.0245, longitude: 105.7790 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's18_1', name: 'Ca Sáng', start_time: '07:00', end_time: '12:00', quantity: 2 },
            { id: 's18_2', name: 'Ca Chiều', start_time: '13:00', end_time: '18:00', quantity: 2 }
        ]
    },
    {
        employer_id: 'emp_019',
        employer_name: 'Starbucks Lotte Center',
        title: 'Nhân viên quầy bar Starbucks',
        description: 'Pha chế, phục vụ đồ uống Starbucks, vệ sinh quầy. Đào tạo bài bản.',
        category: 'F&B',
        salary: 33000,
        salary_type: 'HOURLY',
        address: 'Tầng 1 Lotte Center, 54 Liễu Giai, Ba Đình',
        location: { latitude: 21.0317, longitude: 105.8130 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's19_1', name: 'Ca Sáng', start_time: '07:00', end_time: '13:00', quantity: 2 },
            { id: 's19_2', name: 'Ca Chiều', start_time: '13:00', end_time: '22:00', quantity: 2 }
        ]
    },
    {
        employer_id: 'emp_020',
        employer_name: 'Gym California Mỹ Đình',
        title: 'Nhân viên lễ tân phòng Gym',
        description: 'Check-in khách, tư vấn gói tập, giữ đồ. Ngoại hình chỉn chu, thân thiện.',
        category: 'Dịch vụ',
        salary: 180000,
        salary_type: 'DAILY',
        address: 'Tầng 2, The Garden, Mễ Trì, Nam Từ Liêm',
        location: { latitude: 21.0120, longitude: 105.7810 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's20_1', name: 'Ca Sáng', start_time: '06:00', end_time: '14:00', quantity: 1 },
            { id: 's20_2', name: 'Ca Chiều', start_time: '14:00', end_time: '22:00', quantity: 1 }
        ]
    },
    {
        employer_id: 'emp_021',
        employer_name: 'Cửa hàng Điện máy Xanh Hàm Nghi',
        title: 'Tư vấn bán hàng điện thoại',
        description: 'Tư vấn khách chọn mua smartphone. Lương + hoa hồng. Ưu tiên biết kỹ thuật.',
        category: 'Bán lẻ',
        salary: 250000,
        salary_type: 'DAILY',
        address: '2 Hàm Nghi, Nam Từ Liêm, Hà Nội',
        location: { latitude: 21.0175, longitude: 105.7695 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's21_1', name: 'Ca Nguyên ngày', start_time: '08:30', end_time: '21:30', quantity: 2 }
        ]
    },
    {
        employer_id: 'emp_022',
        employer_name: 'Sân bóng Mỹ Đình Star',
        title: 'Nhân viên trông sân bóng đá',
        description: 'Quản lý sân, cho thuê sân, bán nước. Công việc nhẹ nhàng buổi tối.',
        category: 'Dịch vụ',
        salary: 150000,
        salary_type: 'DAILY',
        address: 'Ngõ 76 Mễ Trì Thượng, Nam Từ Liêm',
        location: { latitude: 21.0088, longitude: 105.7655 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's22_1', name: 'Ca Tối', start_time: '17:00', end_time: '23:00', quantity: 1 }
        ]
    },
    {
        employer_id: 'emp_023',
        employer_name: 'Quán nhậu Bia Hơi Corner',
        title: 'Phục vụ bàn quán bia hơi',
        description: 'Phục vụ bàn nhậu, bưng đồ ăn bia. Quán đông buổi tối. Thu nhập ổn.',
        category: 'F&B',
        salary: 28000,
        salary_type: 'HOURLY',
        address: '12 Nguyễn Hoàng, Mỹ Đình, Nam Từ Liêm',
        location: { latitude: 21.0270, longitude: 105.7760 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's23_1', name: 'Ca Tối', start_time: '16:00', end_time: '23:00', quantity: 4 }
        ]
    },
    {
        employer_id: 'emp_024',
        employer_name: 'Văn phòng BĐS Goldland',
        title: 'Phát tờ rơi bất động sản',
        description: 'Phát tờ rơi tại ngã tư Mỹ Đình. Không yêu cầu kinh nghiệm.',
        category: 'Marketing',
        salary: 150000,
        salary_type: 'DAILY',
        address: 'Ngã tư Phạm Hùng - Mễ Trì, Nam Từ Liêm',
        location: { latitude: 21.0195, longitude: 105.7800 },
        is_gps_required: false,
        status: 'OPEN',
        shifts: [
            { id: 's24_1', name: 'Ca Sáng', start_time: '08:00', end_time: '11:00', quantity: 5 }
        ]
    },
    {
        employer_id: 'emp_025',
        employer_name: 'Trường Mầm non SunKids',
        title: 'Trợ giảng mầm non (Part-time)',
        description: 'Hỗ trợ cô giáo chăm sóc bé 3-5 tuổi. Yêu cầu: Nữ, kiên nhẫn, yêu trẻ.',
        category: 'Giáo dục',
        salary: 180000,
        salary_type: 'DAILY',
        address: 'KĐT Mỹ Đình 1, Mỹ Đình, Nam Từ Liêm',
        location: { latitude: 21.0215, longitude: 105.7725 },
        is_gps_required: true,
        status: 'OPEN',
        shifts: [
            { id: 's25_1', name: 'Ca Sáng', start_time: '07:30', end_time: '11:30', quantity: 2 }
        ]
    }
];

async function seedJobs() {
    console.log('🌱 Bắt đầu seed dữ liệu công việc mẫu - Khu vực Hà Nội / Nam Từ Liêm...\n');

    // Step 1: Clear existing jobs collection
    console.log('🗑️ Xóa sạch collection "jobs" cũ...');
    const existingJobs = await db.collection('jobs').get();
    const batch = db.batch();
    existingJobs.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`   Đã xóa ${existingJobs.size} documents.\n`);

    // Step 2: Insert seed jobs
    console.log('📝 Đang insert dữ liệu mẫu...\n');

    let count = 0;
    for (const job of SEED_JOBS) {
        const geohash = geofire.geohashForLocation([job.location.latitude, job.location.longitude]);

        const docRef = db.collection('jobs').doc();
        await docRef.set({
            ...job,
            geohash,
            created_at: admin.firestore.FieldValue.serverTimestamp(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
        });

        count++;
        const dist = geofire.distanceBetween(
            [job.location.latitude, job.location.longitude],
            [21.0180, 105.7657] // Nam Từ Liêm center
        );
        console.log(`   ✓ [${count}/${SEED_JOBS.length}] ${job.title} (${job.employer_name}) - ${dist.toFixed(1)}km từ Nam Từ Liêm`);
    }

    console.log(`\n🎉 Đã seed thành công ${count} công việc vào Firestore!`);
    console.log(`📍 Trung tâm: Nam Từ Liêm, Hà Nội (21.0180, 105.7657)`);
    console.log(`🔍 Test API: curl "http://localhost:3001/api/jobs/nearby?lat=21.0180&lng=105.7657&radius=10000"`);

    process.exit(0);
}

seedJobs().catch(err => {
    console.error('❌ Lỗi seed data:', err);
    process.exit(1);
});
