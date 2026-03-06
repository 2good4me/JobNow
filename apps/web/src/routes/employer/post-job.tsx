import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { CreateJobForm } from './components/CreateJobForm';

export const Route = createFileRoute('/employer/post-job')({
  component: PostJobRoute,
});

function PostJobRoute() {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSuccess = () => {
    setSuccessMessage('✓ Tin tuyển dụng đã được đăng thành công!');
    setErrorMessage('');

    // Auto-hide success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleFormError = (error: Error) => {
    setErrorMessage(error.message || 'Không thể đăng tin');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Đăng tin tuyển dụng</h1>
          <p className="text-sm text-slate-500 mt-1">Tạo một tin tuyển dụng mới cho nhà tuyển dụng</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-700">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-700">{errorMessage}</p>
          </div>
        )}

        <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <CreateJobForm onSuccess={handleFormSuccess} onError={handleFormError} />
        </section>
      </main>
    </div>
  );
}
