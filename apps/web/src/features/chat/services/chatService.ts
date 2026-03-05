import {
  collection,
  doc,
  type DocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import type {
  ChatPermission,
  Conversation,
  ConversationStatus,
  ListConversationsParams,
  ListMessagesParams,
  Message,
  SendMessageInput,
  StartConversationInput,
} from '@jobnow/types';
import { db, functions } from '@/config/firebase';

type ChatRole = 'CANDIDATE' | 'EMPLOYER';

type StartConversationResult = {
  conversationId: string;
  status: ConversationStatus;
  chatPermission: ChatPermission;
};

type SendMessageResult = {
  conversationId: string;
  messageId: string;
  createdAt?: string;
};

type MarkConversationReadResult = {
  success: boolean;
};

function toConversation(id: string, data: Record<string, unknown>): Conversation {
  return {
    id,
    jobId: String(data.job_id ?? ''),
    applicationId: String(data.application_id ?? ''),
    candidateId: String(data.candidate_id ?? ''),
    employerId: String(data.employer_id ?? ''),
    status: (data.status as ConversationStatus) ?? 'PENDING',
    chatPermission: (data.chat_permission as ChatPermission) ?? 'EMPLOYER_ONLY',
    lastMessageText: data.last_message_text ? String(data.last_message_text) : undefined,
    lastMessageAt: data.last_message_at,
    lastMessageBy: data.last_message_by ? String(data.last_message_by) : undefined,
    candidateUnreadCount: Number(data.candidate_unread_count ?? 0),
    employerUnreadCount: Number(data.employer_unread_count ?? 0),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function mapConversation(snapshot: QueryDocumentSnapshot): Conversation {
  const data = snapshot.data() as Record<string, unknown>;
  return toConversation(snapshot.id, data);
}

function mapMessage(conversationId: string, snapshot: QueryDocumentSnapshot): Message {
  const data = snapshot.data() as Record<string, unknown>;

  return {
    id: snapshot.id,
    conversationId,
    applicationId: String(data.application_id ?? ''),
    senderId: String(data.sender_id ?? ''),
    senderRole: (data.sender_role as Message['senderRole']) ?? 'SYSTEM',
    messageType: (data.message_type as Message['messageType']) ?? 'TEXT',
    text: String(data.text ?? ''),
    clientMessageId: data.client_message_id ? String(data.client_message_id) : undefined,
    createdAt: data.created_at,
  };
}

export function getConversationUnreadCount(conversation: Conversation, role: ChatRole): number {
  return role === 'CANDIDATE' ? conversation.candidateUnreadCount : conversation.employerUnreadCount;
}

export async function listConversations(params: ListConversationsParams): Promise<Conversation[]> {
  const participantField = params.role === 'CANDIDATE' ? 'candidate_id' : 'employer_id';
  const ref = collection(db, 'conversations');
  const q = query(
    ref,
    where(participantField, '==', params.userId),
    orderBy('updated_at', 'desc'),
    limit(params.limit ?? 20)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(mapConversation);
}

export function subscribeConversations(
  params: ListConversationsParams,
  onUpdate: (conversations: Conversation[]) => void
): Unsubscribe {
  const participantField = params.role === 'CANDIDATE' ? 'candidate_id' : 'employer_id';
  const q = query(
    collection(db, 'conversations'),
    where(participantField, '==', params.userId),
    orderBy('updated_at', 'desc'),
    limit(params.limit ?? 20)
  );

  return onSnapshot(q, (snapshot) => {
    onUpdate(snapshot.docs.map(mapConversation));
  });
}

export async function getConversationById(conversationId: string): Promise<Conversation | null> {
  const snapshot: DocumentSnapshot = await getDoc(doc(db, 'conversations', conversationId));
  if (!snapshot.exists()) return null;
  return toConversation(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function getConversationByApplicationId(applicationId: string): Promise<Conversation | null> {
  const q = query(
    collection(db, 'conversations'),
    where('application_id', '==', applicationId),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  return mapConversation(snapshot.docs[0]);
}

export async function listMessages(params: ListMessagesParams): Promise<Message[]> {
  const q = query(
    collection(db, 'conversations', params.conversationId, 'messages'),
    orderBy('created_at', 'desc'),
    limit(params.limit ?? 30)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => mapMessage(params.conversationId, docSnapshot)).reverse();
}

export function subscribeMessages(
  params: ListMessagesParams,
  onUpdate: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'conversations', params.conversationId, 'messages'),
    orderBy('created_at', 'desc'),
    limit(params.limit ?? 50)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map((docSnapshot) => mapMessage(params.conversationId, docSnapshot))
      .reverse();
    onUpdate(messages);
  });
}

export async function startConversation(input: StartConversationInput): Promise<StartConversationResult> {
  const callable = httpsCallable<StartConversationInput, StartConversationResult>(functions, 'startConversation');
  const { data } = await callable(input);
  return data;
}

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  const callable = httpsCallable<SendMessageInput, SendMessageResult>(functions, 'sendChatMessage');
  const { data } = await callable(input);
  return data;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const callable = httpsCallable<{ conversationId: string }, MarkConversationReadResult>(
    functions,
    'markConversationRead'
  );
  await callable({ conversationId });
}

export async function ensureConversationForApplication(applicationId: string): Promise<Conversation> {
  const start = await startConversation({ applicationId });
  const conversation = await getConversationById(start.conversationId);

  if (!conversation) {
    throw new Error('Không thể khởi tạo hội thoại cho đơn ứng tuyển này.');
  }

  return conversation;
}
