import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/employer/post-job')({
  component: PostJobRoute,
});

function PostJobRoute() {
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <h1 className="text-2xl font-bold font-heading mb-4">Đăng tin tuyển dụng</h1>
      <p className="text-slate-500">Màn hình đang được xây dựng...</p>
    </div>
  );
}
