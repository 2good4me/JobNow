import { describe, it, expect } from 'vitest';
import { calculateBudget } from '../routes/employer/-utils/budgetCalculations';

describe('White Box: Boundary Value Analysis for calculateBudget', () => {
  // 1. Boundary: salaryAmount
  it('nên xử lý lương âm (salaryAmount < 0)', () => {
    const result = calculateBudget('Theo ngày', -100, 1, [], 1);
    expect(result.totalBudget).toBe(0);
    expect(result.explanation).toContain('0đ');
  });

  // 2. Boundary: workers
  it('nên xử lý số người bằng 0 (workers = 0) -> chuyển về tối thiểu 1', () => {
    const result = calculateBudget('Theo ngày', 100000, 0, [], 1);
    // 100,000 * 1 người * 1 ngày = 100,000
    expect(result.totalBudget).toBe(100000);
    expect(result.explanation).toContain('1 người');
  });

  // 3. Boundary: shifts empty
  it('nên xử lý danh sách ca rỗng (shifts = [])', () => {
    const result = calculateBudget('Theo giờ', 50000, 1, []);
    expect(result.totalBudget).toBe(0);
    expect(result.workingHours).toBe(0);
  });

  // 4. Boundary: startTime = endTime
  it('nên xử lý thời gian bắt đầu trùng kết thúc (0h làm việc)', () => {
    const shifts = [{ id: '1', name: 'Ca Sáng', startTime: '08:00', endTime: '08:00', quantity: 1 }];
    const result = calculateBudget('Theo giờ', 50000, 1, shifts);
    expect(result.totalBudget).toBe(0);
  });

  // 5. Boundary: Crossing midnight (Logic hiện tại chặn diffMins > 0)
  it('nên trả về 0 nếu thời gian kết thúc nhỏ hơn bắt đầu (logic hiện tại)', () => {
    const shifts = [{ id: '2', name: 'Ca Đêm', startTime: '22:00', endTime: '02:00', quantity: 1 }];
    const result = calculateBudget('Theo giờ', 50000, 1, shifts);
    expect(result.totalBudget).toBe(0); 
    // Lưu ý: Đây là hành vi hiện tại của code, kiểm thử White Box xác nhận nó chạy đúng như thiết kế
  });
});
