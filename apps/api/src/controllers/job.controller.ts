import { Request, Response } from 'express';
import { z } from 'zod';
import { jobService, JobData } from '../services/job.service';
import { AuthRequest } from '../middleware/auth';
import { db, admin } from '../config/firebase';
import * as geofire from 'geofire-common';

// ========== Validation Schemas ==========
const nearbyQuerySchema = z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    radius: z.coerce.number().min(100).max(50000).default(5000),
});

// ========== Controllers ==========

export const createJob = async (req: AuthRequest, res: Response) => {
    try {
        const jobData: JobData = req.body;

        if (!req.user || !req.user.uid) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Force the employer_id to be the currently authenticated user
        jobData.employer_id = req.user.uid;

        // Basic validation
        if (!jobData.title || !jobData.location || !jobData.location.latitude || !jobData.location.longitude) {
            res.status(400).json({ error: 'Missing required job fields' });
            return;
        }

        const createdJob = await jobService.createJob(jobData);
        res.status(201).json({
            message: 'Job created successfully',
            job: createdJob
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ error: 'Failed to create job' });
    }
};

export const getNearbyJobs = async (req: Request, res: Response) => {
    try {
        const parsed = nearbyQuerySchema.safeParse(req.query);

        if (!parsed.success) {
            res.status(400).json({
                error: 'Invalid query parameters',
                details: parsed.error.flatten().fieldErrors
            });
            return;
        }

        const { lat, lng, radius } = parsed.data;
        const jobs = await jobService.getNearbyJobs(lat, lng, radius);

        res.status(200).json({
            message: 'Jobs retrieved successfully',
            count: jobs.length,
            center: { lat, lng },
            radius,
            data: jobs
        });
    } catch (error) {
        console.error('Error fetching nearby jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
};

/**
 * Development endpoint: seed 25 sample Hanoi jobs
 * POST /api/jobs/seed
 */
export const seedJobs = async (req: Request, res: Response) => {
    try {
        // Clear existing
        const existing = await db.collection('jobs').get();
        const deleteBatch = db.batch();
        existing.docs.forEach(doc => deleteBatch.delete(doc.ref));
        await deleteBatch.commit();

        // Seed data - 25 jobs around Nam Từ Liêm, Hanoi
        const SEED_JOBS = [
            { employer_id: 'emp_001', employer_name: 'The Coffee House - Mỹ Đình', title: 'Nhân viên Phục vụ quán Cafe', description: 'Cần tuyển nhân viên phục vụ ca tối, phục vụ đồ uống và dọn bàn.', category: 'F&B', salary: 30000, salary_type: 'HOURLY' as const, address: '67 Lê Đức Thọ, Nam Từ Liêm', location: { latitude: 21.0280, longitude: 105.7820 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's1_1', name: 'Ca Sáng', start_time: '08:00', end_time: '12:00', quantity: 2 }, { id: 's1_2', name: 'Ca Tối', start_time: '17:00', end_time: '22:00', quantity: 3 }] },
            { employer_id: 'emp_002', employer_name: 'Nhà hàng Vừng Ơi - Keangnam', title: 'Phụ bếp nhà hàng Hàn Quốc', description: 'Tuyển phụ bếp sơ chế thực phẩm, rửa bát. Bao ăn ca.', category: 'F&B', salary: 35000, salary_type: 'HOURLY' as const, address: 'Keangnam Vina, Phạm Hùng, Nam Từ Liêm', location: { latitude: 21.0170, longitude: 105.7837 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's2_1', name: 'Ca Trưa', start_time: '10:00', end_time: '14:00', quantity: 2 }] },
            { employer_id: 'emp_003', employer_name: 'AEON Mall Hà Đông', title: 'PG giới thiệu sản phẩm', description: 'Tuyển PG đứng giới thiệu sự kiện mới tại AEON.', category: 'Sự kiện', salary: 250000, salary_type: 'DAILY' as const, address: 'AEON Mall, Hà Đông, Hà Nội', location: { latitude: 20.9843, longitude: 105.7503 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's3_1', name: 'Ca Nguyên Ngày', start_time: '09:00', end_time: '21:00', quantity: 5 }] },
            { employer_id: 'emp_004', employer_name: 'GrabExpress Hà Nội', title: 'Giao hàng nội thành bằng xe máy', description: 'Giao đơn Grab khu vực Cầu Giấy - Mỹ Đình.', category: 'Giao hàng', salary: 40000, salary_type: 'HOURLY' as const, address: 'KĐT Mỹ Đình 1, Nam Từ Liêm', location: { latitude: 21.0220, longitude: 105.7740 }, is_gps_required: false, status: 'OPEN' as const, shifts: [{ id: 's4_1', name: 'Ca Sáng', start_time: '07:00', end_time: '11:00', quantity: 10 }, { id: 's4_2', name: 'Ca Chiều', start_time: '14:00', end_time: '18:00', quantity: 10 }] },
            { employer_id: 'emp_005', employer_name: 'Diamond Palace', title: 'Bưng bê phục vụ tiệc cưới', description: 'Phục vụ tiệc cưới cuối tuần. Có đồng phục, bao ăn.', category: 'Sự kiện', salary: 300000, salary_type: 'DAILY' as const, address: '105 Nguyễn Cơ Thạch, Nam Từ Liêm', location: { latitude: 21.0133, longitude: 105.7729 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's5_1', name: 'Ca Tối T7', start_time: '17:00', end_time: '22:00', quantity: 8 }] },
            { employer_id: 'emp_006', employer_name: 'Vinmart+ Trung Văn', title: 'Nhân viên sắp xếp kho hàng', description: 'Sắp xếp hàng hóa lên kệ, kiểm đếm tồn kho.', category: 'Bán lẻ', salary: 28000, salary_type: 'HOURLY' as const, address: '15 Tố Hữu, Trung Văn, Nam Từ Liêm', location: { latitude: 21.0055, longitude: 105.7888 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's6_1', name: 'Ca Sáng', start_time: '06:00', end_time: '10:00', quantity: 2 }] },
            { employer_id: 'emp_007', employer_name: 'Highland Coffee Indochina', title: 'Barista pha chế cà phê', description: 'Tuyển barista biết pha máy espresso. Đào tạo thêm.', category: 'F&B', salary: 35000, salary_type: 'HOURLY' as const, address: '241 Xuân Thủy, Cầu Giấy', location: { latitude: 21.0370, longitude: 105.7950 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's7_1', name: 'Ca Sáng', start_time: '07:00', end_time: '14:00', quantity: 1 }, { id: 's7_2', name: 'Ca Chiều', start_time: '14:00', end_time: '22:00', quantity: 2 }] },
            { employer_id: 'emp_008', employer_name: 'Pizza 4P\'s', title: 'Nhân viên bếp nóng - Pizza', description: 'Nướng pizza, chuẩn bị topping. Bao ăn ca.', category: 'F&B', salary: 32000, salary_type: 'HOURLY' as const, address: '4 Trần Thái Tông, Cầu Giấy', location: { latitude: 21.0332, longitude: 105.7905 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's8_1', name: 'Ca Trưa', start_time: '10:30', end_time: '14:30', quantity: 2 }] },
            { employer_id: 'emp_009', employer_name: 'FPT Software', title: 'Nhập liệu hợp đồng (Remote)', description: 'Nhập dữ liệu từ scan PDF vào hệ thống. Làm tại nhà.', category: 'Văn phòng', salary: 200000, salary_type: 'DAILY' as const, address: 'Duy Tân, Cầu Giấy', location: { latitude: 21.0314, longitude: 105.7826 }, is_gps_required: false, status: 'OPEN' as const, shifts: [{ id: 's9_1', name: 'Cả ngày', start_time: '09:00', end_time: '17:00', quantity: 5 }] },
            { employer_id: 'emp_010', employer_name: 'Haidilao Thanh Xuân', title: 'Phục vụ bàn nhà hàng lẩu', description: 'Phục vụ khách, dọn bàn, set up đồ ăn.', category: 'F&B', salary: 38000, salary_type: 'HOURLY' as const, address: '52 Lê Trọng Tấn, Thanh Xuân', location: { latitude: 20.9923, longitude: 105.8105 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's10_1', name: 'Ca Trưa', start_time: '11:00', end_time: '14:00', quantity: 3 }, { id: 's10_2', name: 'Ca Tối', start_time: '17:00', end_time: '23:00', quantity: 5 }] },
            { employer_id: 'emp_011', employer_name: 'Big C Thăng Long', title: 'Nhân viên thu ngân cuối tuần', description: 'Thu ngân quầy thanh toán siêu thị.', category: 'Bán lẻ', salary: 220000, salary_type: 'DAILY' as const, address: '222 Trần Duy Hưng, Cầu Giấy', location: { latitude: 21.0088, longitude: 105.7988 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's11_1', name: 'Ca Nguyên ngày', start_time: '08:00', end_time: '20:00', quantity: 3 }] },
            { employer_id: 'emp_012', employer_name: 'Bún chả Hương Liên', title: 'Phụ bếp quán bún chả', description: 'Phụ nướng chả, rửa bát, dọn bàn. Bao ăn trưa.', category: 'F&B', salary: 25000, salary_type: 'HOURLY' as const, address: '24 Lê Văn Hưu, Hai Bà Trưng', location: { latitude: 21.0127, longitude: 105.8535 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's12_1', name: 'Ca Trưa', start_time: '10:00', end_time: '14:00', quantity: 2 }] },
            { employer_id: 'emp_013', employer_name: 'Mường Thanh Grand', title: 'Lễ tân khách sạn (Ca đêm)', description: 'Trực lễ tân ca đêm. Yêu cầu: tiếng Anh cơ bản.', category: 'Khách sạn', salary: 400000, salary_type: 'DAILY' as const, address: '63 Trần Duy Hưng, Cầu Giấy', location: { latitude: 21.0102, longitude: 105.7971 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's13_1', name: 'Ca Đêm', start_time: '22:00', end_time: '06:00', quantity: 1 }] },
            { employer_id: 'emp_014', employer_name: 'Mercury Event', title: 'PB sự kiện tại SVĐ Mỹ Đình', description: 'Hỗ trợ tổ chức sự kiện. Soát vé, dẫn khách.', category: 'Sự kiện', salary: 350000, salary_type: 'DAILY' as const, address: 'SVĐ Quốc Gia Mỹ Đình, Nam Từ Liêm', location: { latitude: 21.0207, longitude: 105.7610 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's14_1', name: 'Ca Chiều-Tối', start_time: '15:00', end_time: '23:00', quantity: 20 }] },
            { employer_id: 'emp_015', employer_name: 'Bách Hóa Xanh Mễ Trì', title: 'Bốc xếp hàng kho đêm', description: 'Bốc xếp hàng từ xe tải vào kho. Thanh toán ngay.', category: 'Kho vận', salary: 45000, salary_type: 'HOURLY' as const, address: '18 Mễ Trì, Nam Từ Liêm', location: { latitude: 21.0100, longitude: 105.7720 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's15_1', name: 'Ca Đêm', start_time: '21:00', end_time: '03:00', quantity: 4 }] },
            { employer_id: 'emp_016', employer_name: 'Phở Thìn Bờ Hồ', title: 'Bưng bê phở & dọn bàn', description: 'Quán phở nổi tiếng. Bao ăn phở miễn phí.', category: 'F&B', salary: 28000, salary_type: 'HOURLY' as const, address: '13 Lò Đúc, Hai Bà Trưng', location: { latitude: 21.0227, longitude: 105.8617 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's16_1', name: 'Ca Sáng Sớm', start_time: '05:30', end_time: '10:00', quantity: 3 }] },
            { employer_id: 'emp_017', employer_name: 'Gia sư APlus', title: 'Gia sư Toán lớp 9', description: 'Dạy kèm Toán tại nhà ở Mỹ Đình. 3 buổi/tuần.', category: 'Giáo dục', salary: 200000, salary_type: 'JOB' as const, address: 'KĐT Mỹ Đình 2, Nam Từ Liêm', location: { latitude: 21.0155, longitude: 105.7683 }, is_gps_required: false, status: 'OPEN' as const, shifts: [{ id: 's17_1', name: 'Tối T2-T4-T6', start_time: '19:00', end_time: '21:00', quantity: 1 }] },
            { employer_id: 'emp_018', employer_name: 'Rửa xe Tuấn', title: 'Nhân viên rửa xe ô tô', description: 'Rửa xe ô tô nội/ngoại thất. Tip khách.', category: 'Dịch vụ', salary: 30000, salary_type: 'HOURLY' as const, address: '88 Phạm Hùng, Nam Từ Liêm', location: { latitude: 21.0245, longitude: 105.7790 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's18_1', name: 'Ca Sáng', start_time: '07:00', end_time: '12:00', quantity: 2 }, { id: 's18_2', name: 'Ca Chiều', start_time: '13:00', end_time: '18:00', quantity: 2 }] },
            { employer_id: 'emp_019', employer_name: 'Starbucks Lotte', title: 'Nhân viên quầy bar Starbucks', description: 'Pha chế, phục vụ đồ uống Starbucks. Đào tạo bài bản.', category: 'F&B', salary: 33000, salary_type: 'HOURLY' as const, address: 'Lotte Center, 54 Liễu Giai, Ba Đình', location: { latitude: 21.0317, longitude: 105.8130 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's19_1', name: 'Ca Sáng', start_time: '07:00', end_time: '13:00', quantity: 2 }] },
            { employer_id: 'emp_020', employer_name: 'California Gym Mỹ Đình', title: 'Lễ tân phòng Gym', description: 'Check-in khách, tư vấn gói tập. Ngoại hình chỉn chu.', category: 'Dịch vụ', salary: 180000, salary_type: 'DAILY' as const, address: 'The Garden, Mễ Trì, Nam Từ Liêm', location: { latitude: 21.0120, longitude: 105.7810 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's20_1', name: 'Ca Sáng', start_time: '06:00', end_time: '14:00', quantity: 1 }] },
            { employer_id: 'emp_021', employer_name: 'Điện máy Xanh Hàm Nghi', title: 'Tư vấn bán hàng điện thoại', description: 'Tư vấn khách chọn mua smartphone. Lương + hoa hồng.', category: 'Bán lẻ', salary: 250000, salary_type: 'DAILY' as const, address: '2 Hàm Nghi, Nam Từ Liêm', location: { latitude: 21.0175, longitude: 105.7695 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's21_1', name: 'Ca Nguyên ngày', start_time: '08:30', end_time: '21:30', quantity: 2 }] },
            { employer_id: 'emp_022', employer_name: 'Sân bóng Mỹ Đình Star', title: 'Nhân viên trông sân bóng', description: 'Quản lý sân, cho thuê sân, bán nước. Công việc nhẹ.', category: 'Dịch vụ', salary: 150000, salary_type: 'DAILY' as const, address: 'Ngõ 76 Mễ Trì Thượng, Nam Từ Liêm', location: { latitude: 21.0088, longitude: 105.7655 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's22_1', name: 'Ca Tối', start_time: '17:00', end_time: '23:00', quantity: 1 }] },
            { employer_id: 'emp_023', employer_name: 'Bia Hơi Corner', title: 'Phục vụ bàn quán bia hơi', description: 'Phục vụ bàn nhậu. Quán đông buổi tối. Thu nhập ổn.', category: 'F&B', salary: 28000, salary_type: 'HOURLY' as const, address: '12 Nguyễn Hoàng, Nam Từ Liêm', location: { latitude: 21.0270, longitude: 105.7760 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's23_1', name: 'Ca Tối', start_time: '16:00', end_time: '23:00', quantity: 4 }] },
            { employer_id: 'emp_024', employer_name: 'BĐS Goldland', title: 'Phát tờ rơi bất động sản', description: 'Phát tờ rơi tại ngã tư Mỹ Đình.', category: 'Marketing', salary: 150000, salary_type: 'DAILY' as const, address: 'Ngã tư Phạm Hùng - Mễ Trì', location: { latitude: 21.0195, longitude: 105.7800 }, is_gps_required: false, status: 'OPEN' as const, shifts: [{ id: 's24_1', name: 'Ca Sáng', start_time: '08:00', end_time: '11:00', quantity: 5 }] },
            { employer_id: 'emp_025', employer_name: 'Mầm non SunKids', title: 'Trợ giảng mầm non (Part-time)', description: 'Hỗ trợ cô giáo chăm sóc bé 3-5 tuổi. Yêu trẻ.', category: 'Giáo dục', salary: 180000, salary_type: 'DAILY' as const, address: 'KĐT Mỹ Đình 1, Nam Từ Liêm', location: { latitude: 21.0215, longitude: 105.7725 }, is_gps_required: true, status: 'OPEN' as const, shifts: [{ id: 's25_1', name: 'Ca Sáng', start_time: '07:30', end_time: '11:30', quantity: 2 }] },
        ];

        // Insert all jobs with geohash
        let count = 0;
        for (const job of SEED_JOBS) {
            const geohash = geofire.geohashForLocation([job.location.latitude, job.location.longitude]);
            await db.collection('jobs').doc().set({
                ...job,
                geohash,
                created_at: admin.firestore.FieldValue.serverTimestamp(),
                updated_at: admin.firestore.FieldValue.serverTimestamp()
            });
            count++;
        }

        res.status(200).json({
            message: `Seeded ${count} jobs around Hà Nội / Nam Từ Liêm successfully`,
            count,
            center: { lat: 21.0180, lng: 105.7657 }
        });
    } catch (error) {
        console.error('Error seeding jobs:', error);
        res.status(500).json({ error: 'Failed to seed jobs' });
    }
};
