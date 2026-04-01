import type { JobFormState as JobFormSchemaState, PayType, GenderPreference, Shift } from '../-schemas/jobFormSchema';

// App form state keeps GPS fields nullable until user selects a location.
export type JobFormState = Omit<JobFormSchemaState, 'latitude' | 'longitude'> & {
  latitude: number | null;
  longitude: number | null;
};

export type { PayType, GenderPreference, Shift };

/* ── Constants ───────────────────────────────── */
export const FALLBACK_CATEGORIES = ['F&B Service', 'Retail', 'Delivery', 'Event Helper'];
export const payTypes: PayType[] = ['Theo giờ', 'Theo ca', 'Theo ngày'];
export const genderOptions: GenderPreference[] = ['Nam', 'Nữ', 'Cả hai'];

/* ── Helpers ─────────────────────────────────── */
let _shiftId = 0;
export function nextShiftId() {
  return `shift-${Date.now()}-${++_shiftId}`;
}

export function formatSalary(val: string) {
  const num = Number(val.replace(/\D/g, ''));
  if (!num) return val;
  return num.toLocaleString('vi-VN');
}

