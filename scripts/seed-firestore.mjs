// Seed script using Firebase Client SDK (no admin credentials needed)
// Run with: node scripts/seed-firestore.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc, GeoPoint, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAzbJ2ftaStDpXL1LgfHZKMD2LEhNhPpuo",
    authDomain: "jobnow-80037.firebaseapp.com",
    projectId: "jobnow-80037",
    storageBucket: "jobnow-80037.firebasestorage.app",
    messagingSenderId: "166587026075",
    appId: "1:166587026075:web:a7e0995bdcc23d16be543e",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Timestamp.now();

async function seed() {
    console.log('🌱 Bắt đầu Seed dữ liệu...');

    // ===== 1. TẠO USER MẪU =====
    // Employer
    await setDoc(doc(db, 'users', 'employer_demo_001'), {
        role: 'EMPLOYER',
        full_name: 'Công ty TNHH JobNow Demo',
        email: 'employer@jobnow.com',
        phone_number: '0901234567',
        status: 'ACTIVE',
        balance: 500000,
        reputation_score: 95,
        avatar_url: null,
        bio: 'Doanh nghiệp chuyên cung cấp dịch vụ F&B tại TP.HCM',
        address_text: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        skills: [],
        identity_images: [],
        created_at: now,
        updated_at: now,
    });
    console.log('✅ Tạo Employer user');

    // Candidate 1
    await setDoc(doc(db, 'users', 'candidate_demo_001'), {
        role: 'CANDIDATE',
        full_name: 'Nguyễn Văn An',
        email: 'nguyenvanan@gmail.com',
        phone_number: '0912345678',
        status: 'ACTIVE',
        balance: 0,
        reputation_score: 88,
        avatar_url: null,
        bio: 'Sinh viên năm 3, có kinh nghiệm phục vụ và bán hàng.',
        address_text: 'Quận Bình Thạnh, TP.HCM',
        skills: ['Phục vụ', 'Bán hàng', 'Giao tiếp tốt'],
        identity_images: [],
        created_at: now,
        updated_at: now,
    });
    console.log('✅ Tạo Candidate 1');

    // Candidate 2
    await setDoc(doc(db, 'users', 'candidate_demo_002'), {
        role: 'CANDIDATE',
        full_name: 'Trần Thị Bình',
        email: 'tranthibinh@gmail.com',
        phone_number: '0923456789',
        status: 'ACTIVE',
        balance: 0,
        reputation_score: 92,
        avatar_url: null,
        bio: 'Có 2 năm kinh nghiệm làm PG sự kiện.',
        address_text: 'Quận 7, TP.HCM',
        skills: ['PG sự kiện', 'Tiếng Anh', 'MC'],
        identity_images: [],
        created_at: now,
        updated_at: now,
    });
    console.log('✅ Tạo Candidate 2');

    // ===== 2. TẠO JOBS MẪU =====
    const job1Ref = doc(collection(db, 'jobs'));
    await setDoc(job1Ref, {
        employerId: 'employer_demo_001',
        title: 'Nhân viên Phục vụ Cafe Part-time',
        description: 'Cần tuyển nhân viên phục vụ quán cafe làm việc theo ca. Yêu cầu ngoại hình ưa nhìn, giao tiếp tốt. Ưu tiên có kinh nghiệm.',
        salary: 25000,
        salaryType: 'HOURLY',
        location: new GeoPoint(10.762622, 106.660172),
        geohash: 'w3gvk1',
        isGpsRequired: false,
        status: 'OPEN',
        shifts: [
            { id: 'shift_1a', name: 'Ca Sáng', startTime: '07:00', endTime: '12:00', quantity: 2 },
            { id: 'shift_1b', name: 'Ca Chiều', startTime: '13:00', endTime: '18:00', quantity: 2 },
            { id: 'shift_1c', name: 'Ca Tối', startTime: '18:00', endTime: '22:00', quantity: 3 },
        ],
        created_at: now,
        updated_at: now,
    });
    const job1Id = job1Ref.id;
    console.log(`✅ Tạo Job 1: ${job1Id}`);

    const job2Ref = doc(collection(db, 'jobs'));
    await setDoc(job2Ref, {
        employerId: 'employer_demo_001',
        title: 'Cộng tác viên Bán hàng Sự kiện Cuối tuần',
        description: 'Bán hàng tại sự kiện hội chợ cuối tuần. Yêu cầu giao tiếp tốt, ngoại hình ưa nhìn. Lương theo ngày, thanh toán ngay sau khi kết thúc sự kiện.',
        salary: 500000,
        salaryType: 'DAILY',
        location: new GeoPoint(10.773626, 106.704632),
        geohash: 'w3gvk2',
        isGpsRequired: true,
        status: 'OPEN',
        shifts: [
            { id: 'shift_2a', name: 'Cả ngày', startTime: '08:00', endTime: '17:00', quantity: 5 },
        ],
        created_at: now,
        updated_at: now,
    });
    const job2Id = job2Ref.id;
    console.log(`✅ Tạo Job 2: ${job2Id}`);

    const job3Ref = doc(collection(db, 'jobs'));
    await setDoc(job3Ref, {
        employerId: 'employer_demo_001',
        title: 'Nhân viên Kho Hàng - Làm đêm',
        description: 'Sắp xếp, kiểm kê hàng hóa tại kho. Công việc không yêu cầu kinh nghiệm. Được đào tạo từ đầu.',
        salary: 300000,
        salaryType: 'DAILY',
        location: new GeoPoint(10.823099, 106.629662),
        geohash: 'w3gvk3',
        isGpsRequired: true,
        status: 'OPEN',
        shifts: [
            { id: 'shift_3a', name: 'Ca Đêm', startTime: '22:00', endTime: '06:00', quantity: 4 },
        ],
        created_at: now,
        updated_at: now,
    });
    const job3Id = job3Ref.id;
    console.log(`✅ Tạo Job 3: ${job3Id}`);

    // ===== 3. TẠO APPLICATIONS MẪU =====
    await addDoc(collection(db, 'applications'), {
        jobId: job1Id,
        shiftId: 'shift_1a',
        employerId: 'employer_demo_001',
        candidateId: 'candidate_demo_001',
        status: 'NEW',
        paymentStatus: 'UNPAID',
        coverLetter: 'Em có 1 năm kinh nghiệm phục vụ quán cafe, mong được nhận vào làm ạ.',
        created_at: now,
        updated_at: now,
    });
    console.log('✅ Tạo Application 1 (NEW)');

    await addDoc(collection(db, 'applications'), {
        jobId: job1Id,
        shiftId: 'shift_1c',
        employerId: 'employer_demo_001',
        candidateId: 'candidate_demo_002',
        status: 'APPROVED',
        paymentStatus: 'UNPAID',
        coverLetter: 'Em muốn đăng ký ca tối, lịch trống từ 6h tối.',
        created_at: now,
        updated_at: now,
    });
    console.log('✅ Tạo Application 2 (APPROVED)');

    await addDoc(collection(db, 'applications'), {
        jobId: job2Id,
        shiftId: 'shift_2a',
        employerId: 'employer_demo_001',
        candidateId: 'candidate_demo_001',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        coverLetter: 'Em có kinh nghiệm bán hàng sự kiện 6 tháng.',
        created_at: now,
        updated_at: now,
    });
    console.log('✅ Tạo Application 3 (PENDING)');

    await addDoc(collection(db, 'applications'), {
        jobId: job3Id,
        shiftId: 'shift_3a',
        employerId: 'employer_demo_001',
        candidateId: 'candidate_demo_002',
        status: 'REJECTED',
        paymentStatus: 'UNPAID',
        coverLetter: 'Em muốn thử làm công việc kho hàng.',
        created_at: now,
        updated_at: now,
    });
    console.log('✅ Tạo Application 4 (REJECTED)');

    console.log('\n🎉 Seed dữ liệu hoàn tất!');
    console.log(`   - 3 Users (1 Employer, 2 Candidates)`);
    console.log(`   - 3 Jobs`);
    console.log(`   - 4 Applications (NEW, APPROVED, PENDING, REJECTED)`);
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Lỗi Seed:', err);
    process.exit(1);
});
