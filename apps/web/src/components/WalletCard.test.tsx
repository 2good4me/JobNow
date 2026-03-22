import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WalletCard } from './WalletCard';


describe('WalletCard Component', () => {
    it('nên hiển thị số dư được định dạng đúng', () => {
        render(<WalletCard balance={1000000} />);
        
        // Kiểm tra xem số tiền có được định dạng vi-VN (1.000.000) hay không
        expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
        expect(screen.getByText('VND')).toBeInTheDocument();
    });

    it('nên hiển thị đúng loại tiền tệ tùy chỉnh', () => {
        render(<WalletCard balance={500} currency="USD" />);
        expect(screen.getByText('USD')).toBeInTheDocument();
    });
});
