import { describe, it, expect } from 'vitest';
import { isValidDateRange, getValidEndDate } from './date';

describe('Date Utils', () => {
    describe('isValidDateRange', () => {
        it('nên trả về true nếu ngày bắt đầu trước ngày kết thúc', () => {
            const start = new Date(2024, 0, 1);
            const end = new Date(2024, 0, 2);
            expect(isValidDateRange(start, end)).toBe(true);
        });

        it('nên trả về true nếu ngày bắt đầu bằng ngày kết thúc', () => {
            const start = new Date(2024, 0, 1);
            const end = new Date(2024, 0, 1);
            expect(isValidDateRange(start, end)).toBe(true);
        });

        it('nên trả về false nếu ngày bắt đầu sau ngày kết thúc', () => {
            const start = new Date(2024, 0, 2);
            const end = new Date(2024, 0, 1);
            expect(isValidDateRange(start, end)).toBe(false);
        });

        it('nên trả về true nếu một trong hai ngày là null', () => {
            expect(isValidDateRange(null, new Date())).toBe(true);
            expect(isValidDateRange(new Date(), null)).toBe(true);
        });
    });

    describe('getValidEndDate', () => {
        it('nên reset ngày kết thúc về ngày bắt đầu nếu ngày bắt đầu mới sau ngày kết thúc cũ', () => {
            const newStart = new Date(2024, 0, 10);
            const currentEnd = new Date(2024, 0, 5);
            expect(getValidEndDate(newStart, currentEnd)).toEqual(newStart);
        });

        it('nên giữ nguyên ngày kết thúc nếu ngày bắt đầu mới trước ngày kết thúc cũ', () => {
            const newStart = new Date(2024, 0, 1);
            const currentEnd = new Date(2024, 0, 5);
            expect(getValidEndDate(newStart, currentEnd)).toEqual(currentEnd);
        });
    });
});
