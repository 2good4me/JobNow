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
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
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
import { auth, db } from '@/config/firebase';

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
  const conversationId = input.applicationId;
  const convRef = doc(db, 'conversations', conversationId);
  const snap = await getDoc(convRef);
  
  if (snap.exists()) {
    const data = snap.data() as Record<string, unknown>;
    return {
      conversationId: snap.id,
      status: (data.status as ConversationStatus) || 'PENDING',
      chatPermission: (data.chat_permission as ChatPermission) || 'EMPLOYER_ONLY'
    };
  }

  const appRef = doc(db, 'applications', input.applicationId);
  const appSnap = await getDoc(appRef);
  if (!appSnap.exists()) {
    throw new Error('Đơn ứng tuyển không tồn tại.');
  }

  const appData = appSnap.data() as Record<string, unknown>;
  const candidateId = String(appData?.candidate_id || appData?.candidateId || '');
  const employerId = String(appData?.employer_id || appData?.employerId || '');
  const jobId = String(appData?.job_id || appData?.jobId || '');
  const status = String(appData?.status || 'NEW').toUpperCase();

  let chatPermission: ChatPermission = 'EMPLOYER_ONLY';
  if (['APPROVED', 'CHECKED_IN', 'COMPLETED'].includes(status)) chatPermission = 'TWO_WAY';
  if (['REJECTED', 'CANCELLED'].includes(status)) chatPermission = 'NONE';

  let conversationStatus: ConversationStatus = 'PENDING';
  if (chatPermission === 'NONE') conversationStatus = 'CLOSED';
  if (chatPermission === 'TWO_WAY') conversationStatus = 'ACTIVE';

  await setDoc(convRef, {
    application_id: input.applicationId,
    job_id: jobId,
    candidate_id: candidateId,
    employer_id: employerId,
    status: conversationStatus,
    chat_permission: chatPermission,
    candidate_unread_count: 0,
    employer_unread_count: 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  });

  return { conversationId, status: conversationStatus, chatPermission };
}

export async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Yêu cầu đăng nhập để gửi tin nhắn.');

  const conversationId = input.conversationId || input.applicationId || '';
  if (!conversationId) throw new Error('Thiếu conversationId để gửi tin nhắn.');
  
  const text = input.text.trim();
  if (!text) throw new Error('Nội dung tin nhắn không được để trống.');

  const convRef = doc(db, 'conversations', conversationId);
  let convSnap = await getDoc(convRef);

  if (!convSnap.exists()) {
    if (input.applicationId) {
      await startConversation({ applicationId: input.applicationId });
      convSnap = await getDoc(convRef);
    }
  }

  if (!convSnap.exists()) throw new Error('Hội thoại không tồn tại.');

  const convData = convSnap.data() as Record<string, unknown>;
  
  const candidateId = String(convData.candidate_id || '');
  const employerId = String(convData.employer_id || '');
  const chatPermission = String(convData.chat_permission || 'EMPLOYER_ONLY');
  const conversationStatus = String(convData.status || 'PENDING');

  if (uid !== candidateId && uid !== employerId) {
    throw new Error('Bạn không thuộc hội thoại này.');
  }

  if (conversationStatus === 'CLOSED' || conversationStatus === 'BLOCKED' || chatPermission === 'NONE') {
    throw new Error('Hội thoại đã bị khóa.');
  }

  if (chatPermission === 'EMPLOYER_ONLY' && uid !== employerId) {
    throw new Error('Ứng viên chưa được phép gửi tin nhắn lúc này (Cần nhà tuyển dụng duyệt trước).');
  }

  const senderRole = uid === employerId ? 'EMPLOYER' : 'CANDIDATE';
  const clientMessageId = input.clientMessageId || `msg_${Date.now()}`;
  const msgData = {
    conversation_id: conversationId,
    application_id: String(convData.application_id || ''),
    sender_id: uid,
    sender_role: senderRole,
    message_type: 'TEXT',
    text,
    client_message_id: clientMessageId,
    created_at: serverTimestamp(),
  };

  const msgsRef = collection(convRef, 'messages');
  const newMsgRef = doc(msgsRef, clientMessageId);
  
  await setDoc(newMsgRef, msgData);

  const candidateUnreadCount = Number(convData.candidate_unread_count || 0);
  const employerUnreadCount = Number(convData.employer_unread_count || 0);

  await updateDoc(convRef, {
    status: chatPermission === 'TWO_WAY' ? 'ACTIVE' : conversationStatus,
    last_message_text: text,
    last_message_at: serverTimestamp(),
    last_message_by: uid,
    candidate_unread_count: senderRole === 'EMPLOYER' ? candidateUnreadCount + 1 : candidateUnreadCount,
    employer_unread_count: senderRole === 'CANDIDATE' ? employerUnreadCount + 1 : employerUnreadCount,
    updated_at: serverTimestamp(),
  });

  return { conversationId, messageId: newMsgRef.id, createdAt: new Date().toISOString() };
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);
  if (!convSnap.exists()) return;

  const data = convSnap.data() as Record<string, unknown>;
  if (uid === String(data.candidate_id || '')) {
    await updateDoc(convRef, { candidate_unread_count: 0, updated_at: serverTimestamp() });
  } else if (uid === String(data.employer_id || '')) {
    await updateDoc(convRef, { employer_unread_count: 0, updated_at: serverTimestamp() });
  }
}

export async function ensureConversationForApplication(applicationId: string): Promise<Conversation> {
  const start = await startConversation({ applicationId });
  const conversation = await getConversationById(start.conversationId);

  if (!conversation) {
    throw new Error('Không thể khởi tạo hội thoại cho đơn ứng tuyển này.');
  }

  return conversation;
}
