import { z } from 'zod';

export const createJobValidationSchema = z
  .object({
    // Step 1: Job Information
    title: z
      .string()
      .min(5, { message: 'Tên công việc phải có ít nhất 5 ký tự' })
      .max(100, { message: 'Tên công việc không vượt quá 100 ký tự' }),

    category: z.string().min(1, { message: 'Vui lòng chọn danh mục công việc' }),

    description: z
      .string()
      .min(10, { message: 'Mô tả công việc phải có ít nhất 10 ký tự' })
      .max(1000, { message: 'Mô tả công việc không vượt quá 1000 ký tự' })
      .optional()
      .or(z.literal('')),

    // Step 2: Job Details
    salary: z
      .number()
      .positive({ message: 'Lương phải lớn hơn 0' })
      .int({ message: 'Lương phải là số nguyên' }),

    quantity: z
      .number()
      .int({ message: 'Số lượng phải là số nguyên' })
      .positive({ message: 'Số lượng phải lớn hơn 0' }),

    startTime: z.string().regex(/^\d{2}:\d{2}$/, {
      message: 'Giờ bắt đầu phải theo định dạng HH:mm',
    }),

    endTime: z.string().regex(/^\d{2}:\d{2}$/, {
      message: 'Giờ kết thúc phải theo định dạng HH:mm',
    }),

    // Step 3: Location
    location: z.object({
      latitude: z.number().finite({ message: 'Vĩ độ không hợp lệ' }),
      longitude: z.number().finite({ message: 'Kinh độ không hợp lệ' }),
    }),

    address: z
      .string()
      .min(5, { message: 'Địa chỉ phải có ít nhất 5 ký tự' })
      .max(200, { message: 'Địa chỉ không vượt quá 200 ký tự' }),
  })
  .refine((data) => {
    // Validate that endTime is after startTime
    const [startHour, startMin] = data.startTime.split(':').map(Number);
    const [endHour, endMin] = data.endTime.split(':').map(Number);

    const startTotalMins = startHour * 60 + startMin;
    const endTotalMins = endHour * 60 + endMin;

    return endTotalMins > startTotalMins;
  }, {
    message: 'Giờ kết thúc phải sau giờ bắt đầu',
    path: ['endTime'],
  })
  .refine((data) => {
    // Validate that location has both latitude and longitude
    return data.location.latitude !== 0 && data.location.longitude !== 0;
  }, {
    message: 'Vui lòng chọn vị trí chính xác trên bản đồ',
    path: ['location'],
  });

export type CreateJobFormData = z.infer<typeof createJobValidationSchema>;

export const JOB_CATEGORIES = [
  {
    id: 'restaurant',
    label: '🍜 Nhà hàng',
    icon: '🍜',
  },
  {
    id: 'delivery',
    label: '🚚 Giao hàng',
    icon: '🚚',
  },
  {
    id: 'labor',
    label: '🧹 Lao động phổ thông',
    icon: '🧹',
  },
  {
    id: 'retail',
    label: '🛍 Bán hàng',
    icon: '🛍',
  },
  {
    id: 'cleaning',
    label: '🧽 Vệ sinh',
    icon: '🧽',
  },
  {
    id: 'security',
    label: '🛡️ Bảo vệ',
    icon: '🛡️',
  },
  {
    id: 'other',
    label: '📌 Khác',
    icon: '📌',
  },
];
