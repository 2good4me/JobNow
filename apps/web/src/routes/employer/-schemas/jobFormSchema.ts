import { z } from 'zod';

export type PayType = 'Theo giờ' | 'Theo ca' | 'Theo ngày';
export type GenderPreference = 'Nam' | 'Nữ' | 'Cả hai';

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  quantity: number;
}

// Shift validation schema
export const shiftSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Tên ca không được để trống'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format giờ không hợp lệ'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format giờ không hợp lệ'),
  quantity: z.number().int().min(1, 'Số lượng phải >= 1'),
}).refine((data) => {
  // Validate end time >= start time
  const [startH, startM] = data.startTime.split(':').map(Number);
  const [endH, endM] = data.endTime.split(':').map(Number);
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  return endMins >= startMins;
}, {
  message: 'Giờ kết thúc phải >= giờ bắt đầu',
  path: ['endTime'],
});

// Main job form validation schema
export const jobFormSchema = z.object({
  title: z.string()
    .min(1, 'Tiêu đề công việc không được để trống')
    .min(5, 'Tiêu đề phải >= 5 ký tự')
    .max(100, 'Tiêu đề <= 100 ký tự'),
  
  category: z.string()
    .min(1, 'Vui lòng chọn danh mục'),
  
  description: z.string()
    .min(1, 'Mô tả công việc không được để trống')
    .min(10, 'Mô tả phải >= 10 ký tự')
    .max(500, 'Mô tả <= 500 ký tự'),
  
  vacancies: z.number()
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng phải >= 1'),
  
  gender: z.enum(['Nam', 'Nữ', 'Cả hai'] as const),
  
  salary: z.string()
    .min(1, 'Mức lương không được để trống')
    .refine((val) => {
      const num = Number(val.replace(/\D/g, ''));
      return num > 0;
    }, 'Mức lương phải > 0'),
  
  payType: z.enum(['Theo giờ', 'Theo ca', 'Theo ngày'] as const),
  
  address: z.string()
    .min(1, 'Địa chỉ không được để trống')
    .min(5, 'Địa chỉ phải >= 5 ký tự'),
  
  // Location guard: require GPS coordinates
  latitude: z.number().nullable()
    .refine((val) => val !== null, 'Vui lòng chọn vị trí GPS'),
  
  longitude: z.number().nullable()
    .refine((val) => val !== null, 'Vui lòng chọn vị trí GPS'),
  
  startDate: z.string()
    .min(1, 'Ngày bắt đầu không được để trống'),
  
  deadline: z.string().optional(),
  
  requirements: z.array(z.string()).default([]),
  
  shifts: z.array(shiftSchema)
    .min(1, 'Phải có ít nhất 1 ca làm'),
  
  coverImage: z.instanceof(File).nullable().optional(),
  
  isPremium: z.boolean().default(false),
}).refine((data) => {
  // Validate deadline > startDate if provided
  if (data.deadline) {
    return new Date(data.deadline) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'Hạn nộp đơn phải >= ngày bắt đầu',
  path: ['deadline'],
});

export type JobFormState = z.infer<typeof jobFormSchema>;

// Helper to get total budget
export function calculateTotalBudget(quantity: number, salary: number, payType: PayType, shifts?: Shift[]) {
  if (payType === 'Theo ca' && shifts && shifts.length > 0) {
    // Sum up all shifts
    const totalShifts = shifts.reduce((acc, s) => acc + s.quantity, 0);
    return totalShifts * salary;
  }
  return quantity * salary;
}
