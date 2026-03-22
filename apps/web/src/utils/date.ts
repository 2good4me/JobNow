import { isAfter, isBefore, isSameDay } from 'date-fns';

/**
 * Kiểm tra xem dải ngày có hợp lệ hay không (Ngày bắt đầu phải trước hoặc bằng ngày kết thúc)
 */
export const isValidDateRange = (startDate: Date | null, endDate: Date | null): boolean => {
    if (!startDate || !endDate) return true;
    return isBefore(startDate, endDate) || isSameDay(startDate, endDate);
};

/**
 * Trả về ngày kết thúc hợp lệ nếu ngày bắt đầu thay đổi
 */
export const getValidEndDate = (newStartDate: Date, currentEndDate: Date | null): Date | null => {
    if (!currentEndDate) return null;
    if (isAfter(newStartDate, currentEndDate)) {
        return newStartDate;
    }
    return currentEndDate;
};
