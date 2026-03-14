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
  const jobId = String(data.job_id ?? data.jobId ?? '');
  const applicationId = String(data.application_id ?? data.applicationId ?? '');
  const candidateId = String(data.candidate_id ?? data.candidateId ?? '');
  const employerId = String(data.employer_id ?? data.employerId ?? '');
  
  // Standardize timestamp
  const createdAt = data.created_at ?? data.createdAt;
  const updatedAt = data.updated_at ?? data.updatedAt;
  const lastMessageAt = data.last_message_at ?? data.lastMessageAt;

  return {
    id,
    jobId,
    applicationId,
    candidateId,
    employerId,
    status: (data.status as ConversationStatus) ?? 'PENDING',
    chatPermission: (data.chat_permission ?? data.chatPermission ?? 'EMPLOYER_ONLY') as ChatPermission,
    lastMessageText: data.last_message_text ?? data.lastMessageText ? String(data.last_message_text ?? data.lastMessageText) : undefined,
    lastMessageAt,
    lastMessageBy: data.last_message_by ?? data.lastMessageBy ? String(data.last_message_by ?? data.lastMessageBy) : undefined,
    candidateUnreadCount: Number(data.candidate_unread_count ?? data.candidateUnreadCount ?? 0),
    employerUnreadCount: Number(data.employer_unread_count ?? data.employerUnreadCount ?? 0),
    candidateName: data.candidate_name ?? data.candidateName ? String(data.candidate_name ?? data.candidateName) : undefined,
    candidateAvatar: data.candidate_avatar ?? data.candidateAvatar ? String(data.candidate_avatar ?? data.candidateAvatar) : undefined,
    employerName: data.employer_name ?? data.employerName ? String(data.employer_name ?? data.employerName) : undefined,
    employerAvatar: data.employer_avatar ?? data.employerAvatar ? String(data.employer_avatar ?? data.employerAvatar) : undefined,
    createdAt,
    updatedAt,
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
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Yêu cầu đăng nhập để bắt đầu trò chuyện.');

  // 1. Fetch source info if available
  let employerId = input.employerId || '';
  let candidateId = '';
  let jobId = input.jobId || '';
  let chatPermission: ChatPermission = 'EMPLOYER_ONLY';
  let conversationStatus: ConversationStatus = 'PENDING';

  if (input.applicationId) {
    const appRef = doc(db, 'applications', input.applicationId);
    const appSnap = await getDoc(appRef);
    if (appSnap.exists()) {
      const appData = appSnap.data() as Record<string, unknown>;
      jobId = jobId || String(appData?.job_id || appData?.jobId || '');
      employerId = employerId || String(appData?.employer_id || appData?.employerId || '');
      candidateId = String(appData?.candidate_id || appData?.candidateId || '');
      const appStatus = String(appData?.status || 'NEW').toUpperCase();
      
      if (['APPROVED', 'CHECKED_IN', 'COMPLETED'].includes(appStatus)) chatPermission = 'TWO_WAY';
      if (['REJECTED', 'CANCELLED'].includes(appStatus)) chatPermission = 'NONE';
    }
  }

  // If chat by Job (no application yet)
  if (!candidateId) {
    // In this case, the current user MUST be the candidate
    candidateId = uid;
  }

  if (!employerId && jobId) {
    const jobRef = doc(db, 'jobs', jobId);
    const jobSnap = await getDoc(jobRef);
    if (jobSnap.exists()) {
      const jobData = jobSnap.data();
      employerId = String(jobData?.employerId || jobData?.employer_id || '');
    }
  }

  // 2. Determine and Lookup existing conversation
  let conversationId = '';

  // Priority 1: Deterministic ID based on Job + Candidate
  const deterministicId = jobId ? `job_${jobId}_${candidateId}` : '';
  
  if (deterministicId) {
    const dSnap = await getDoc(doc(db, 'conversations', deterministicId));
    if (dSnap.exists()) {
      conversationId = dSnap.id;
    }
  }

  // Priority 2: Use Application ID if provided and document exists
  if (!conversationId && input.applicationId) {
    const aSnap = await getDoc(doc(db, 'conversations', input.applicationId));
    if (aSnap.exists()) {
      conversationId = aSnap.id;
    }
  }

    // Priority 3: Search by fields to catch any other variations
    if (!conversationId && jobId && candidateId) {
      const q = query(
        collection(db, 'conversations'),
        where('job_id', '==', jobId),
        where('candidate_id', '==', candidateId),
        limit(1)
      );
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        conversationId = qSnap.docs[0].id;
      }
    }

    // Priority 4: Search by Candidate + Employer (Unified Chat)
    if (!conversationId && candidateId && employerId) {
       const q = query(
         collection(db, 'conversations'),
         where('candidate_id', '==', candidateId),
         where('employer_id', '==', employerId),
         limit(1)
       );
       const qSnap = await getDocs(q);
       if (!qSnap.empty) {
         conversationId = qSnap.docs[0].id;
       }
    }

  // Final identity to use for creation or return
  const finalId = conversationId || deterministicId || input.applicationId;
  if (!finalId) {
    throw new Error('Không thể xác định ID hội thoại. Thiếu thông tin cần thiết.');
  }

  const convRef = doc(db, 'conversations', finalId);
  const snap = await getDoc(convRef);
  
  if (snap.exists()) {
    const data = snap.data() as Record<string, unknown>;
    let currentStatus = (data.status as ConversationStatus) || 'PENDING';
    let currentPermission = (data.chat_permission ?? data.chatPermission ?? 'EMPLOYER_ONLY') as ChatPermission;

    // REACTIVATION LOGIC:
    // If the conversation is currently locked (CLOSED/NONE) but being re-started via jobId
    // we should potentially unlock it if the context warrants it.
    let needsUpdate = false;
    if (currentStatus === 'CLOSED' || currentPermission === 'NONE') {
      if (!input.applicationId || currentPermission === 'TWO_WAY') {
        currentStatus = 'ACTIVE';
        currentPermission = 'TWO_WAY';
        needsUpdate = true;
      }
    }

    if (needsUpdate || (input.applicationId && data.application_id !== input.applicationId)) {
      await updateDoc(convRef, {
        status: currentStatus,
        chat_permission: currentPermission,
        chatPermission: currentPermission,
        application_id: input.applicationId || data.application_id || '',
        applicationId: input.applicationId || data.applicationId || '',
        job_id: jobId || data.job_id || '',
        jobId: jobId || data.jobId || '',
      });
    }

    return {
      conversationId: snap.id,
      status: currentStatus,
      chatPermission: currentPermission
    };
  }

  if (!employerId) {
    throw new Error('Không tìm thấy thông tin nhà tuyển dụng cho bài đăng này.');
  }

  // 3. Fetch User profile details for better UI
  let candidateName = 'Người dùng';
  let candidateAvatar = '';
  let employerName = 'Nhà tuyển dụng';
  let employerAvatar = '';

  try {
    const [cSnap, eSnap] = await Promise.all([
      getDoc(doc(db, 'users', candidateId)),
      getDoc(doc(db, 'users', employerId))
    ]);

    if (cSnap.exists()) {
      const cData = cSnap.data();
      candidateName = cData.fullName || cData.full_name || 'Ứng viên';
      candidateAvatar = cData.avatarUrl || cData.avatar_url || '';
    }
    if (eSnap.exists()) {
      const eData = eSnap.data();
      employerName = eData.fullName || eData.full_name || 'Nhà tuyển dụng';
      employerAvatar = eData.avatarUrl || eData.avatar_url || '';
    }
  } catch (err) {
    console.warn('Could not fetch profile details for conversation:', err);
  }

  // Double check that the current user is a participant
  if (uid !== candidateId && uid !== employerId) {
    throw new Error('Bạn không có quyền tham gia hội thoại này.');
  }

  // For Job-based chat or approved applications, allow 2-way
  if (!input.applicationId) {
    chatPermission = 'TWO_WAY';
    conversationStatus = 'ACTIVE';
  } else if (chatPermission === 'TWO_WAY') {
    conversationStatus = 'ACTIVE';
  }

  const newDoc = {
    application_id: input.applicationId || '',
    job_id: jobId,
    candidate_id: candidateId,
    employer_id: employerId,
    status: conversationStatus,
    chat_permission: chatPermission,
    chatPermission: chatPermission, // Consistency
    candidate_unread_count: 0,
    employer_unread_count: 0,
    candidate_name: candidateName,
    candidate_avatar: candidateAvatar,
    employer_name: employerName,
    employer_avatar: employerAvatar,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    // Standard fields for consistent queries
    candidateId: candidateId,
    employerId: employerId
  };

  await setDoc(convRef, newDoc);

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
    if (input.applicationId || input.jobId) {
      await startConversation({ 
        applicationId: input.applicationId,
        jobId: input.jobId 
      });
      convSnap = await getDoc(convRef);
    }
  }

  if (!convSnap.exists()) throw new Error('Hội thoại không tồn tại.');

  const convData = convSnap.data() as Record<string, unknown>;
  
  const candidateId = String(convData.candidate_id || convData.candidateId || '');
  const employerId = String(convData.employer_id || convData.employerId || '');
  const chatPermission = String(convData.chat_permission || convData.chatPermission || 'EMPLOYER_ONLY');
  const conversationStatus = String(convData.status || 'PENDING');

  const senderRole = uid === employerId ? 'EMPLOYER' : 'CANDIDATE';

  if (uid !== candidateId && uid !== employerId) {
    throw new Error('Bạn không thuộc hội thoại này.');
  }

  // BLOCKED is a hard stop for everyone
  if (conversationStatus === 'BLOCKED') {
    throw new Error('Hội thoại đã bị khóa.');
  }

  if (senderRole === 'CANDIDATE') {
    // Candidates are restricted by more states
    if (conversationStatus === 'CLOSED' || chatPermission === 'NONE') {
      throw new Error('Hội thoại đã bị khóa.');
    }
    if (chatPermission === 'EMPLOYER_ONLY') {
      throw new Error('Ứng viên chưa được phép gửi tin nhắn lúc này (Cần nhà tuyển dụng duyệt trước).');
    }
  }
  // Employers can proceed even if CLOSED or chatPermission === 'NONE'
  // (We will auto-activate the status in the update block below)

  const clientMessageId = input.clientMessageId || `msg_${Date.now()}`;
  
  const msgData = {
    conversation_id: conversationId,
    application_id: String(convData.application_id || convData.applicationId || ''),
    sender_id: uid, // rule check
    senderId: uid,  // UI/Queries consistency
    sender_role: senderRole,
    message_type: 'TEXT',
    text,
    client_message_id: clientMessageId,
    created_at: serverTimestamp(),
  };

  const msgsRef = collection(convRef, 'messages');
  const newMsgRef = doc(msgsRef, clientMessageId);
  
  try {
    await setDoc(newMsgRef, msgData);

    const candidateUnreadCount = Number(convData.candidate_unread_count || convData.candidateUnreadCount || 0);
    const employerUnreadCount = Number(convData.employer_unread_count || convData.employerUnreadCount || 0);

    const nextStatus = (senderRole === 'EMPLOYER' || chatPermission === 'TWO_WAY' || conversationStatus === 'PENDING') 
      ? 'ACTIVE' 
      : conversationStatus;

    // If employer sends to a NONE chat, we should upgrade permission to TWO_WAY or at least something active
    const nextPermission = (senderRole === 'EMPLOYER' && chatPermission === 'NONE') 
      ? 'TWO_WAY' 
      : chatPermission;

    const updateData: Record<string, any> = {
      status: nextStatus,
      chat_permission: nextPermission,
      chatPermission: nextPermission, // Consistency
      last_message_text: text,
      last_message_at: serverTimestamp(),
      last_message_by: uid,
      updated_at: serverTimestamp(),
      candidate_unread_count: senderRole === 'EMPLOYER' ? candidateUnreadCount + 1 : candidateUnreadCount,
      employer_unread_count: senderRole === 'CANDIDATE' ? employerUnreadCount + 1 : employerUnreadCount,
    };

    // Ensure camelCase fields are ALSO updated for consistency
    updateData.lastMessageText = text;
    updateData.lastMessageAt = serverTimestamp();
    updateData.lastMessageBy = uid;
    updateData.updatedAt = serverTimestamp();
    updateData.candidateUnreadCount = updateData.candidate_unread_count;
    updateData.employerUnreadCount = updateData.employer_unread_count;

    await updateDoc(convRef, updateData);
    
    return { 
      conversationId, 
      messageId: newMsgRef.id, 
      createdAt: new Date().toISOString() 
    };
  } catch (err: any) {
    console.error('Error in sendMessage:', err);
    throw new Error(`Gửi tin nhắn thất bại: ${err.message || 'Lỗi không xác định'}`);
  }
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const convRef = doc(db, 'conversations', conversationId);
  const convSnap = await getDoc(convRef);
  if (!convSnap.exists()) return;

  const data = convSnap.data() as Record<string, unknown>;
  if (uid === String(data.candidate_id || '')) {
    await updateDoc(convRef, { candidate_unread_count: 0 });
  } else if (uid === String(data.employer_id || '')) {
    await updateDoc(convRef, { employer_unread_count: 0 });
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
