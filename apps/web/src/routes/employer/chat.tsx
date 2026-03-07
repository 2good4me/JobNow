import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ChatPage } from '@/features/chat/components/ChatPage';

export const Route = createFileRoute('/employer/chat')({
  component: EmployerChatRoute,
});

function EmployerChatRoute() {
  const { userProfile, role } = useAuth();
  const navigate = useNavigate();

  // Protect route
  if (!userProfile || role !== 'EMPLOYER') {
    void navigate({ to: '/login', replace: true });
    return null;
  }

  return <ChatPage userId={userProfile.uid} role="EMPLOYER" />;
}
