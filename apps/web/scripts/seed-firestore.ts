import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Look for .env or similar config
const envPath = resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.warn('No .env found, attempting to use FIREBASE_CONFIG or default credentials...');
}

// To use this, you need a serviceAccountKey.json at root level
const serviceAccountPath = resolve(__dirname, '../../../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('Missing serviceAccountKey.json. Please download it from Firebase Console (Project Settings > Service Accounts) and place it at the root of the Workspace.');
    process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
try {
    initializeApp({
        credential: cert(serviceAccount)
    });
} catch (e) {
    console.error("Firebase Auth failed:", e);
}

const db = getFirestore();

// Helper to seed data
async function seedData() {
    console.log('Seeding Database...');

    // 1. Setup Categories
    const categoriesIds = ['cat-fb', 'cat-retail', 'cat-event'];
    const categories = [
        { id: 'cat-fb', name: 'F&B Service', icon: 'coffee' },
        { id: 'cat-retail', name: 'Bán lẻ', icon: 'shopping-bag' },
        { id: 'cat-event', name: 'Sự kiện', icon: 'calendar' }
    ];

    for (const cat of categories) {
        const { id, ...data } = cat;
        await db.collection('categories').doc(id).set({
            ...data,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        });
    }
    console.log('✅ Categories seeded');

    // 2. Setup standard users (Dummy)
    const usersRef = db.collection('users');

    const employerUid = 'dummy-employer-uid';
    await usersRef.doc(employerUid).set({
        phoneNumber: '+84900000001',
        email: 'employer@demo.com',
        role: 'EMPLOYER',
        status: 'ACTIVE',
        balance: 500000,
        reputationScore: 100,
        fullName: 'Nhà Tuyển Dụng Demo',
        avatarUrl: null,
        bio: 'Chuỗi cửa hàng cafe hiện đại',
        addressText: 'Quận 1, TP. HCM',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });

    const candidateUid = 'dummy-candidate-uid';
    await usersRef.doc(candidateUid).set({
        phoneNumber: '+84900000002',
        email: 'candidate@demo.com',
        role: 'CANDIDATE',
        status: 'ACTIVE',
        balance: 0,
        reputationScore: 100,
        fullName: 'Ứng Viên Demo',
        avatarUrl: null,
        bio: 'Chăm chỉ, nhanh nhẹn',
        skills: ['Phục vụ', 'Pha chế'],
        identityImages: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });
    console.log('✅ Users seeded');

    // 3. Setup fake Jobs
    const jobsRef = db.collection('jobs');
    const jobDoc = jobsRef.doc('dummy-job-1');

    await jobDoc.set({
        employerId: employerUid,
        categoryId: 'cat-fb',
        title: 'Nhân viên phục vụ part-time (Demo)',
        description: 'Chi tiết mô tả ca làm việc, hỗ trợ khách hàng, dọn dẹp quán.',
        salary: 25000,
        salaryType: 'HOURLY',
        location: {
            latitude: 10.7769,
            longitude: 106.7009,
            address: 'Đường Nguyễn Huệ, Q1, TP.HCM'
        },
        geohash: 'w3gtz1',
        isGpsRequired: true,
        status: 'OPEN',
        shifts: [
            {
                id: 'shift-1',
                name: 'Ca Sáng',
                startTime: '06:00',
                endTime: '14:00',
                quantity: 2
            },
            {
                id: 'shift-2',
                name: 'Ca Chiều',
                startTime: '14:00',
                endTime: '22:00',
                quantity: 1
            }
        ],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });
    console.log('✅ Jobs seeded');

    // 4. Fake application
    const appRef = db.collection('applications').doc('dummy-app-1');
    await appRef.set({
        jobId: 'dummy-job-1',
        shiftId: 'shift-1',
        employerId: employerUid,
        candidateId: candidateUid,
        status: 'NEW',
        paymentStatus: 'UNPAID',
        coverLetter: 'Xin chào, em đã từng làm phục vụ 1 năm.',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });
    console.log('✅ Applications seeded');

    // 5. Fake Subcollection checkins
    await appRef.collection('checkins').doc('dummy-checkin-1').set({
        checkInTime: FieldValue.serverTimestamp(),
        location: { latitude: 10.7769, longitude: 106.7009 },
        status: 'VALID'
    });
    console.log('✅ Checkins seeded');

    // 6. Fake transaction
    await db.collection('transactions').doc('dummy-txn-1').set({
        userId: employerUid,
        amount: 500000,
        type: 'DEPOSIT',
        status: 'SUCCESS',
        paymentMethod: 'VNPAY',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });
    console.log('✅ Transactions seeded');

    // 7. Fake review
    await db.collection('reviews').doc('dummy-review-1').set({
        reviewerId: employerUid,
        revieweeId: candidateUid,
        applicationId: 'dummy-app-1',
        rating: 5,
        comment: 'Bạn ứng viên rất nhiệt tình và chăm chỉ.',
        createdAt: FieldValue.serverTimestamp()
    });
    console.log('✅ Reviews seeded');

    // 8. Fake notification
    await db.collection('notifications').doc('dummy-notif-1').set({
        userId: employerUid,
        title: 'Có ứng viên mới',
        body: 'Ứng Viên Demo vừa nộp đơn vào công việc của bạn.',
        isRead: false,
        type: 'APPLICATION_RECEIVED',
        relatedId: 'dummy-app-1',
        createdAt: FieldValue.serverTimestamp()
    });
    console.log('✅ Notifications seeded');

    // 9. Fake follow
    await db.collection('follows').doc('dummy-follow-1').set({
        followerId: candidateUid,
        followingId: employerUid,
        createdAt: FieldValue.serverTimestamp()
    });
    console.log('✅ Follows seeded');

    // 10. Fake analytics
    const currentMonthId = `metrics_${new Date().getFullYear()}_${new Date().getMonth() + 1}`;
    await db.collection('analytics').doc(currentMonthId).set({
        totalJobsPosted: 1,
        totalApplications: 1,
        totalRevenue: 500000,
        activeUsers: 2,
        updatedAt: FieldValue.serverTimestamp()
    });
    console.log('✅ Analytics seeded');

    console.log('🎉 Seeding successfully completed!');
}

seedData().catch(console.error);
