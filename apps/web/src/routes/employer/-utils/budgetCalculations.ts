/**
 * Budget Calculation Utility
 * Implements precise calculations for all three salary models per specification
 */

import type { PayType, Shift } from '../post-job';

export interface BudgetBreakdown {
  totalBudget: number;
  breakdown: Array<{
    label: string;
    amount: number;
  }>;
  explanation: string;
  summaryLine: string;
  workingHours?: number;
}

/**
 * Calculate working hours between two times (HH:MM format)
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Hours as decimal number
 */
export function calculateWorkingHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;
  
  const startMins = startH * 60 + startM;
  const endMins = endH * 60 + endM;
  const diffMins = endMins - startMins;
  
  return diffMins > 0 ? diffMins / 60 : 0;
}

/**
 * HOURLY Payment Model
 * Formula: salaryPerHour × hours
 * 
 * Example:
 * salaryPerHour = 30000, hours = 4
 * totalBudget = 30000 × 4 = 120000
 */
function calculateHourlyBudget(
  salaryPerHour: number,
  shifts: Shift[]
): BudgetBreakdown {
  let totalBudget = 0;
  let totalHours = 0;
  const breakdown: Array<{ label: string; amount: number }> = [];

  shifts.forEach((shift) => {
    const hours = calculateWorkingHours(shift.startTime, shift.endTime);
    const shiftBudget = salaryPerHour * hours;
    totalBudget += shiftBudget;
    totalHours += hours;

    breakdown.push({
      label: `${shift.name} (${shift.startTime}-${shift.endTime}, ${hours.toFixed(1)} giờ)`,
      amount: shiftBudget,
    });
  });

  return {
    totalBudget,
    breakdown,
    explanation: `Tính là: Lương ${salaryPerHour.toLocaleString('vi-VN')}đ/giờ × ${totalHours.toFixed(1)} giờ làm = ${totalBudget.toLocaleString('vi-VN')}đ`,
    summaryLine: `${totalHours.toFixed(1)} giờ × ${salaryPerHour.toLocaleString('vi-VN')}đ/giờ`,
    workingHours: totalHours,
  };
}

/**
 * SHIFT Payment Model
 * Formula: salaryPerShift × numberOfShifts
 *
 * Example:
 * salaryPerShift = 120000, shifts = 2
 * totalBudget = 120000 × 2 = 240000
 */
function calculateShiftBudget(
  salaryPerShift: number,
  shifts: Shift[]
): BudgetBreakdown {
  const totalShifts = shifts.length;
  const totalBudget = salaryPerShift * totalShifts;
  const breakdown: Array<{ label: string; amount: number }> = [];

  shifts.forEach((shift) => {
    breakdown.push({
      label: `${shift.name} (${shift.startTime}-${shift.endTime})`,
      amount: salaryPerShift,
    });
  });

  return {
    totalBudget,
    breakdown,
    explanation: `Tính là: Lương ${salaryPerShift.toLocaleString('vi-VN')}đ/ca × ${totalShifts} ca = ${totalBudget.toLocaleString('vi-VN')}đ`,
    summaryLine: `${totalShifts} ca × ${salaryPerShift.toLocaleString('vi-VN')}đ/ca`,
  };
}

/**
 * DAILY Payment Model
 * Formula: salaryPerDay × workers × numberOfDays
 *
 * Example:
 * salaryPerDay = 250000, workers = 3, days = 2
 * totalBudget = 250000 × 3 × 2 = 1500000
 */
function calculateDailyBudget(
  salaryPerDay: number,
  workers: number,
  numberOfDays: number
): BudgetBreakdown {
  const totalBudget = salaryPerDay * workers * numberOfDays;

  return {
    totalBudget,
    breakdown: [
      {
        label: `${numberOfDays} ngày × ${workers} người`,
        amount: totalBudget,
      },
    ],
    explanation: `Tính là: Lương ${salaryPerDay.toLocaleString('vi-VN')}đ/ngày × ${workers} người × ${numberOfDays} ngày = ${totalBudget.toLocaleString('vi-VN')}đ`,
    summaryLine: `${workers} người × ${numberOfDays} ngày × ${salaryPerDay.toLocaleString('vi-VN')}đ/ngày`,
  };
}

/**
 * Main Budget Calculator
 * Route to appropriate calculation based on payment type
 */
export function calculateBudget(
  payType: PayType,
  salaryAmount: number,
  workers: number,
  shifts: Shift[] = [],
  numberOfDays: number = 1
): BudgetBreakdown {
  const salary = Math.max(0, salaryAmount);
  const workerCount = Math.max(1, workers);

  if (payType === 'Theo giờ') {
    return calculateHourlyBudget(salary, shifts);
  }

  if (payType === 'Theo ca') {
    return calculateShiftBudget(salary, shifts);
  }

  // 'Theo ngày'
  return calculateDailyBudget(salary, workerCount, numberOfDays);
}

/**
 * Get salary label based on payment type
 */
export function getSalaryLabel(payType: PayType): string {
  switch (payType) {
    case 'Theo giờ':
      return 'Lương (VNĐ / giờ)';
    case 'Theo ca':
      return 'Lương (VNĐ / ca)';
    case 'Theo ngày':
      return 'Lương (VNĐ / ngày)';
  }
}

/**
 * Get salary unit label for display
 */
export function getSalaryUnit(payType: PayType): string {
  switch (payType) {
    case 'Theo giờ':
      return 'đ/giờ';
    case 'Theo ca':
      return 'đ/ca';
    case 'Theo ngày':
      return 'đ/ngày';
  }
}

/**
 * Get explanation text for each payment type
 */
export function getSalaryExplanation(payType: PayType): string {
  switch (payType) {
    case 'Theo giờ':
      return 'Tiền lương được tính theo tổng giờ làm: tổng giờ các ca × mức lương theo giờ. VD: (9 giờ + 6 giờ) × 50,000đ = 750,000đ';
    case 'Theo ca':
      return 'Tiền lương được tính theo số ca làm. VD: 120,000đ/ca × 3 ca = 360,000đ';
    case 'Theo ngày':
      return 'Tiền lương được tính theo ngày làm. VD: 250,000đ/ngày × 3 người × 2 ngày = 1,500,000đ';
  }
}
