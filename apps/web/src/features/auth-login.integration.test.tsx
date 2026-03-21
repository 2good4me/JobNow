import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LoginPage } from '../routes/login';

// Mock các dependencies ngoại vi
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-user' } })),
  GoogleAuthProvider: vi.fn(),
  RecaptchaVerifier: vi.fn(),
}));

vi.mock('@/config/firebase', () => ({
  auth: {}
}));

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => {
    const route = (options: any) => ({
      options,
      useSearch: () => ({}),
      useParams: () => ({}),
    });
    route.useSearch = () => ({});
    route.useParams = () => ({});
    return route;
  },
  useNavigate: () => mockNavigate,
  useSearch: () => ({}),
  Link: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuth: () => ({
    refreshProfile: vi.fn().mockResolvedValue({ role: 'EMPLOYER' }),
  }),
}));

// LoginPage đã được import trực tiếp

describe('Integration: Auth Login Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên cho phép người dùng đăng nhập bằng Email và chuyển hướng đúng role', async () => {
    render(<LoginPage />);

    // 1. Nhập Email
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: 'test@jobnow.com' } });

    // 2. Nhập Mật khẩu
    const passwordInput = screen.getByLabelText(/Mật khẩu/i);
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 3. Click Đăng nhập
    const loginButton = screen.getByRole('button', { name: /Đăng nhập/i });
    fireEvent.click(loginButton);

    // 4. Kiểm tra xem hàm Firebase có được gọi với đúng thông tin không
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      'test@jobnow.com',
      'password123'
    );

    // 5. Đợi và kiểm tra xem có điều hướng tới trang /employer không (vì mock role là EMPLOYER)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/employer', replace: true });
    });
  });
});
