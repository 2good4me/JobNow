import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ChatPage } from '@/features/chat/components/ChatPage';

export const Route = createFileRoute('/candidate/chat')({
  component: CandidateChatRoute,
});

function CandidateChatRoute() {
  const { userProfile, role } = useAuth();
  const navigate = useNavigate();

  // Protect route
  if (!userProfile || role !== 'CANDIDATE') {
    void navigate({ to: '/login', replace: true });
    return null;
  }

  return <ChatPage userId={userProfile.uid} role="CANDIDATE" />;
}
