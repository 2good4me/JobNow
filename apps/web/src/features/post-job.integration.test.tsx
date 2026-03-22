import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';

// Mock Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
  createFileRoute: () => () => ({}),
}));

// Mock các hàm tiện ích
vi.mock('../routes/employer/-utils/budgetCalculations', () => ({
  getSalaryLabel: () => 'Mức lương',
  getSalaryExplanation: () => 'Giải thích mức lương',
}));

// Imports AFTER mocks
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Step1Info from '../routes/employer/-components/post-job/Step1Info';
import { CategoryBottomSheet } from '../routes/employer/-components/post-job/CategoryBottomSheet';
import { type JobFormState } from '../routes/employer/-types/job-post-types';

// Thành phần bao bọc
const TestWrapper = () => {
  const [showSheet, setShowSheet] = useState(false);
  const [form, setForm] = useState<JobFormState>({
    title: '',
    category: '',
    description: '',
    vacancies: 0,
    gender: 'Cả hai',
    salary: '',
    payType: 'Theo giờ',
    address: '',
    startDate: '',
    deadline: '',
    requirements: [],
    shifts: [],
    coverImage: null,
    isPremium: false,
    latitude: null,
    longitude: null,
  });

  return (
    <>
      <Step1Info
        form={form}
        setForm={setForm as any}
        errors={{}}
        requirementInput=""
        setRequirementInput={() => {}}
        addRequirement={() => {}}
        removeRequirement={() => {}}
        onCategoryClick={() => setShowSheet(true)}
      />
      <CategoryBottomSheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        categories={['F&B Service', 'Retail', 'IT']}
        selectedCategory={form.category}
        onSelect={(cat) => setForm((prev) => ({ ...prev, category: cat }))}
      />
    </>
  );
};

describe('Integration: Post Job Category Selection', () => {
  it('nên mở BottomSheet và cập nhật danh mục sau khi chọn', async () => {
    render(<TestWrapper />);

    // 1. Kiểm tra ban đầu chưa có danh mục
    const categoryButton = screen.getByText(/Chọn danh mục\.\.\./i);
    expect(categoryButton).toHaveTextContent('Chọn danh mục...');

    // 2. Click để mở BottomSheet
    fireEvent.click(categoryButton);

    // 3. Kiểm tra xem BottomSheet có hiển thị các danh mục không
    expect(screen.getByText('Chọn ngành nghề')).toBeInTheDocument();
    const retailOption = screen.getByText('Retail');
    expect(retailOption).toBeInTheDocument();

    // 4. Chọn danh mục "Retail"
    fireEvent.click(retailOption);

    // 5. Kiểm tra xem BottomSheet đã đóng và giá trị trong Step1 đã cập nhật
    await waitFor(() => {
      expect(screen.queryByText('Chọn ngành nghề')).not.toBeInTheDocument();
    });
    
    // Nút chọn danh mục giờ đây phải hiển thị "Retail"
    expect(screen.getByText(/Retail/i)).toBeInTheDocument();
  });
});
