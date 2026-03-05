import { db } from './config/firebase';
import * as admin from 'firebase-admin';

async function seed() {
    console.log('Seeding Database...');

    // 1. Create a dummy Employer User
    const employerRef = db.collection('users').doc('employer_demo_123');
    await employerRef.set({
        role: 'EMPLOYER',
        full_name: 'JobNow Demo Company',
        email: 'demo@jobnow.com',
        status: 'ACTIVE',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Created Mock Employer User');

    // 2. Create a dummy Candidate User
    const candidateRef = db.collection('users').doc('candidate_demo_456');
    await candidateRef.set({
        role: 'CANDIDATE',
        full_name: 'Nguyen Van A',
        email: 'candidatedemo@jobnow.com',
        status: 'ACTIVE',
        skills: ['Bán hàng', 'Phục vụ'],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Created Mock Candidate User');

    // 3. Create Sample Jobs
    const job1Ref = db.collection('jobs').doc();
    await job1Ref.set({
        employerId: 'employer_demo_123',
        title: 'Nhân viên Phục vụ Cafe Part-time',
        description: 'Cần tuyển nhân viên phục vụ quán cafe làm việc theo ca sáng hoặc tối.',
        salary: 25000,
        salaryType: 'HOURLY',
        location: new admin.firestore.GeoPoint(10.762622, 106.660172), // HCM
        status: 'OPEN',
        shifts: [
            {
                id: 'shift_1',
                name: 'Ca Sáng',
                startTime: '08:00',
                endTime: '12:00',
                quantity: 2
            },
            {
                id: 'shift_2',
                name: 'Ca Tối',
                startTime: '18:00',
                endTime: '22:00',
                quantity: 3
            }
        ],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const job2Ref = db.collection('jobs').doc();
    await job2Ref.set({
        employerId: 'employer_demo_123',
        title: 'Cộng tác viên Bán hàng Sự kiện',
        description: 'Bán hàng tại sự kiện hội chợ cuối tuần. Yêu cầu giao tiếp tốt.',
        salary: 500000,
        salaryType: 'DAILY',
        location: new admin.firestore.GeoPoint(21.028511, 105.804817), // HN
        status: 'OPEN',
        shifts: [
            {
                id: 'shift_3',
                name: 'Theo ngày',
                startTime: '08:00',
                endTime: '17:00',
                quantity: 5
            }
        ],
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Created Mock Jobs');

    // 4. Create Sample Applications
    const app1Ref = db.collection('applications').doc();
    await app1Ref.set({
        jobId: job1Ref.id,
        shiftId: 'shift_1',
        employerId: 'employer_demo_123',
        candidateId: 'candidate_demo_456',
        status: 'NEW',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    const app2Ref = db.collection('applications').doc();
    await app2Ref.set({
        jobId: job2Ref.id,
        shiftId: 'shift_3',
        employerId: 'employer_demo_123',
        candidateId: 'candidate_demo_456',
        status: 'REVIEWED',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Created Mock Applications');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
}

seed().catch(console.error);
