import { z } from 'zod';
import { calculateBudget } from '../-utils/budgetCalculations';

export type PayType = 'Theo giờ' | 'Theo ca' | 'Theo ngày';
export type GenderPreference = 'Nam' | 'Nữ' | 'Cả hai';

export const payTypes: PayType[] = ['Theo giờ', 'Theo ca', 'Theo ngày'];
export const genderOptions: GenderPreference[] = ['Nam', 'Nữ', 'Cả hai'];

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  quantity: number;
}

/* ─────────────────────────────────────────────────────────────
   VALIDATION RULES - Per specification
   ─────────────────────────────────────────────────────────────
   
   ALL PAYMENT TYPES:
   • workers > 0
   • salary > 0
   • GPS coordinates required before submission
   • timeGuard: endTime must be > startTime
   • locationGuard: latitude & longitude required
   
   ───────────────────────────────────────────────────────────── */

/**
 * Shift validation schema
 * Used for all payment types that involve shifts
 */
export const shiftSchema = z.object({
  id: z.string().min(1),
  name: z.string()
    .min(1, 'Tên ca không được để trống'),
  startTime: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Format giờ không hợp lệ (VD: 08:00)'),
  endTime: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Format giờ không hợp lệ (VD: 17:00)'),
  quantity: z.number()
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng phải >= 1'),
})
  // TIME GUARD: End time must be >= start time
  .refine((data) => {
    const [startH, startM] = data.startTime.split(':').map(Number);
    const [endH, endM] = data.endTime.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    return endMins >= startMins;
  }, {
    message: 'End time must be later than start time',
    path: ['endTime'],
  });

/**
 * Core job form validation schema
 * No defaultValue allowed - all fields empty initially
 */
export const jobFormSchema = z.object({
  // ──────── STEP 1: Job Information ─────────
  title: z.string()
    .min(1, 'Job title is required')
    .min(5, 'Title must be >= 5 characters')
    .max(100, 'Title must be <= 100 characters'),

  category: z.string()
    .min(1, 'Category selection required'),

  description: z.string()
    .min(1, 'Job description is required')
    .max(500, 'Description must be <= 500 characters'),

  gender: z.enum(['Nam', 'Nữ', 'Cả hai'] as const)
    .default('Cả hai'),

  // ──────── STEP 2: Work Details (Dynamic) ──────────────
  payType: z.enum(['Theo giờ', 'Theo ca', 'Theo ngày'] as const),

  /**
   * SALARY VALIDATION
   * - Must be > 0 for all payment types
   * - Placeholder: "Enter salary (e.g. 50000)"
   */
  salary: z.string()
    .min(1, 'Salary is required')
    .refine((val) => {
      const num = Number(val.replace(/\D/g, ''));
      return num > 0;
    }, 'Salary must be > 0'),

  /**
   * WORKERS VALIDATION
   * - Only used for HOURLY and DAILY types
   * - Must be > 0
   * - Placeholder: "Number of workers needed"
   */
  vacancies: z.number()
    .int('Workers must be an integer')
    .min(0, 'Workers must be >= 0'),

  /**
   * SHIFTS VALIDATION
   * - Required for all types (even if single shift for daily)
   * - At least 1 shift required
   * - TIME GUARD enforced at shift level
   */
  shifts: z.array(shiftSchema)
    .min(1, 'At least 1 shift required'),

  // ──────── STEP 3: Location & Confirmation ───────────────
  address: z.string()
    .min(1, 'Address is required')
    .min(5, 'Address must be >= 5 characters'),

  /**
   * LOCATION GUARD: GPS coordinates required
   * Cannot submit without:
   * - latitude (required, not null)
   * - longitude (required, not null)
   *
   * Error message: "Please select a job location on the map."
   */
  latitude: z.number()
    .refine((val) => val !== null && val !== undefined, {
      message: 'Please select a job location on the map',
    }),

  longitude: z.number()
    .refine((val) => val !== null && val !== undefined, {
      message: 'Please select a job location on the map',
    }),

  startDate: z.string()
    .min(1, 'Start date required'),

  deadline: z.string().optional(),

  requirements: z.array(z.string()).default([]),

  coverImage: z.instanceof(File).nullable().optional(),

  isPremium: z.boolean().default(false),
})
  // Composite validation: deadline must be >= startDate
  .refine((data) => {
    if (data.deadline) {
      return new Date(data.deadline) >= new Date(data.startDate);
    }
    return true;
  }, {
    message: 'Deadline must be >= start date',
    path: ['deadline'],
  });

export type JobFormState = z.infer<typeof jobFormSchema>;

/**
 * Helper function for backward compatibility
 * Delegates to the new calculateBudget utility
 */
export function calculateTotalBudget(
  quantity: number,
  salary: number,
  payType: PayType,
  shifts: Shift[] = [],
  numberOfDays: number = 1
): number {
  const result = calculateBudget(payType, salary, quantity, shifts, numberOfDays);
  return result.totalBudget;
}
