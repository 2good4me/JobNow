import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DepositBottomSheet } from '../routes/employer/-components/wallet/DepositBottomSheet';

// Mock các hooks và dependencies
vi.mock('@/features/wallet/hooks/useWallet', () => ({
  useDeposit: () => ({
    mutate: vi.fn((data, options) => options.onSuccess()),
    isPending: false
  })
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('Integration: Wallet Deposit Flow', () => {
  it('nên thực hiện đầy đủ luồng nạp tiền từ nhập liệu đến QR', async () => {
    const onClose = vi.fn();
    render(<DepositBottomSheet isOpen={true} onClose={onClose} userId="test-user-123" />);

    // 1. Kiểm tra tiêu đề bước nhập liệu
    expect(screen.getByText('Nạp tiền vào ví')).toBeInTheDocument();

    // 2. Chọn một số tiền mẫu (200.000đ)
    const amountButton = screen.getByText('200k');
    fireEvent.click(amountButton);

    // 3. Chọn phương thức thanh toán MoMo
    const momoMethod = screen.getByText('Ví MoMo');
    fireEvent.click(momoMethod);

    // 4. Nhấn Tiếp tục để sang bước QR
    const continueButton = screen.getByText(/Tiếp tục/i);
    fireEvent.click(continueButton);

    // 5. Kiểm tra xem đã chuyển sang bước Thanh toán (QR) chưa
    expect(screen.getByText('Thanh toán')).toBeInTheDocument();
    expect(screen.getByAltText('QR Code Payment')).toBeInTheDocument();
    
    // Kiểm tra số tiền hiển thị trên thông tin thanh toán
    expect(screen.getByText('200,000 đ')).toBeInTheDocument();

    // 6. Nhấn xác nhận đã chuyển khoản thành công
    const verifyButton = screen.getByText(/Tôi đã chuyển khoản thành công/i);
    fireEvent.click(verifyButton);

    // 7. Kiểm tra kết quả thành công (giả lập xác thực)
    await waitFor(() => {
      expect(screen.getByText('Đang kiểm tra giao dịch')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
