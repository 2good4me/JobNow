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

export function getConversationUnreadCount(conversation: Conversation, currentUserId: string): number {
  return currentUserId === conversation.candidateId ? conversation.candidateUnreadCount : conversation.employerUnreadCount;
}

const getTime = (t: any) => t?.toMillis?.() || Date.parse(t) || 0;

export async function listConversations(params: ListConversationsParams): Promise<Conversation[]> {
  const q1 = query(collection(db, 'conversations'), where('candidate_id', '==', params.userId), orderBy('updated_at', 'desc'), limit(params.limit ?? 20));
  const q2 = query(collection(db, 'conversations'), where('employer_id', '==', params.userId), orderBy('updated_at', 'desc'), limit(params.limit ?? 20));

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  
  const map = new Map<string, Conversation>();
  snap1.docs.forEach(d => map.set(d.id, mapConversation(d)));
  snap2.docs.forEach(d => map.set(d.id, mapConversation(d)));
  
  return Array.from(map.values())
    .sort((a,b) => getTime(b.updatedAt) - getTime(a.updatedAt))
    .slice(0, params.limit ?? 20);
}

export function subscribeConversations(
  params: ListConversationsParams,
  onUpdate: (conversations: Conversation[]) => void
): Unsubscribe {
  let list1: Conversation[] = [];
  let list2: Conversation[] = [];
  
  const merge = () => {
     const map = new Map<string, Conversation>();
     list1.forEach(c => map.set(c.id, c));
     list2.forEach(c => map.set(c.id, c));
     const merged = Array.from(map.values())
       .sort((a,b) => getTime(b.updatedAt) - getTime(a.updatedAt));
     onUpdate(merged.slice(0, params.limit ?? 20));
  };

  const q1 = query(collection(db, 'conversations'), where('candidate_id', '==', params.userId), orderBy('updated_at', 'desc'), limit(params.limit ?? 20));
  const q2 = query(collection(db, 'conversations'), where('employer_id', '==', params.userId), orderBy('updated_at', 'desc'), limit(params.limit ?? 20));

  const unsub1 = onSnapshot(q1, snap => {
      list1 = snap.docs.map(mapConversation);
      merge();
  });
  
  const unsub2 = onSnapshot(q2, snap => {
      list2 = snap.docs.map(mapConversation);
      merge();
  });
  
  return () => { unsub1(); unsub2(); };
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

  console.log(`[chatService] startConversation called with input:`, input);

  // 1. Fetch source info if available
  let employerId = input.employerId || '';
  let candidateId = '';
  let jobId = input.jobId || '';

  if (input.applicationId) {
    const appRef = doc(db, 'applications', input.applicationId);
    let appSnap = await getDoc(appRef);
    
    if (!appSnap.exists()) {
      // If direct ID lookup fails, search for a document where 'id' field matches the string
      console.log(`[chatService] Application not found by direct ID ${input.applicationId}. Searching via 'id' field...`);
      const qByIdField = query(
        collection(db, 'applications'),
        where('id', '==', input.applicationId),
        limit(1)
      );
      const idSnap = await getDocs(qByIdField);
      
      if (!idSnap.empty) {
        appSnap = idSnap.docs[0];
      } else {
        // Search by participants and job as fallback
        console.log(`[chatService] Searching for applications for user ${uid}...`);
        const qCandidate = query(
          collection(db, 'applications'),
          where('candidate_id', '==', uid),
          where('job_id', '==', jobId || ''),
          limit(1)
        );
        const cSnap = await getDocs(qCandidate);
        
        if (!cSnap.empty) {
          appSnap = cSnap.docs[0];
        } else {
          const qEmployer = query(
            collection(db, 'applications'),
            where('employer_id', '==', uid),
            where('job_id', '==', jobId || ''),
            limit(1)
          );
          const eSnap = await getDocs(qEmployer);
          if (!eSnap.empty) appSnap = eSnap.docs[0];
        }
      }
    }

    if (appSnap.exists()) {
      const appData = appSnap.data();
      console.log(`[chatService] Found application data for ${input.applicationId || appSnap.id}:`, appData.status);
      if (!jobId) jobId = String(appData.jobId || appData.job_id || '');
      if (!employerId) employerId = String(appData.employerId || appData.employer_id || '');
      if (!candidateId) candidateId = String(appData.candidateId || appData.candidate_id || '');
    } else {
      console.warn(`[chatService] Application document ${input.applicationId} not found and no matches for current user.`);
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

  // Priority 1: Use Application ID search (Direct match)
  if (!conversationId && input.applicationId) {
    console.log(`[chatService] Searching for conversation by application_id: ${input.applicationId}`);
    // IMPORTANT: Broad queries on 'conversations' will fail security rules if not constrained by participant ID.
    // Try to determine which role the current user has to constrain the query.
    
    const tryQuery = async (field: 'candidate_id' | 'employer_id') => {
        const q = query(
            collection(db, 'conversations'),
            where('application_id', '==', input.applicationId),
            where(field, '==', uid),
            limit(1)
        );
        const snap = await getDocs(q);
        return snap.empty ? null : snap.docs[0].id;
    };

    conversationId = (await tryQuery('candidate_id')) || (await tryQuery('employer_id')) || '';
    if (conversationId) {
      console.log(`[chatService] Found existing conversation by application_id query: ${conversationId}`);
    }
  }

  // Priority 2: Use Application ID as document ID directly
  if (!conversationId && input.applicationId) {
    const aSnap = await getDoc(doc(db, 'conversations', input.applicationId));
    if (aSnap.exists()) {
      conversationId = aSnap.id;
      console.log(`[chatService] Found existing conversation by application_id as DOC ID: ${conversationId}`);
    }
  }

  // Priority 3: Deterministic ID based on Job + Candidate
  const deterministicId = jobId ? `job_${jobId}_${candidateId}` : '';
  
  if (!conversationId && deterministicId) {
    const dSnap = await getDoc(doc(db, 'conversations', deterministicId));
    if (dSnap.exists()) {
      conversationId = dSnap.id;
      console.log(`[chatService] Found existing conversation by deterministic ID: ${conversationId}`);
    }
  }

    // Priority 4: Search by fields to catch any other variations
    if (!conversationId && jobId && candidateId) {
      const tryJobQuery = async (field: 'candidate_id' | 'employer_id') => {
          const q = query(
            collection(db, 'conversations'),
            where('job_id', '==', jobId),
            where('candidate_id', '==', candidateId),
            where(field, '==', uid),
            limit(1)
          );
          const snap = await getDocs(q);
          return snap.empty ? null : snap.docs[0].id;
      };
      conversationId = (await tryJobQuery('candidate_id')) || (await tryJobQuery('employer_id')) || '';
    }

    // Priority 5: Search by Candidate + Employer (Unified Chat)
    if (!conversationId && candidateId && employerId) {
       const tryUserPairQuery = async (field: 'candidate_id' | 'employer_id') => {
          const q = query(
            collection(db, 'conversations'),
            where('candidate_id', '==', candidateId),
            where('employer_id', '==', employerId),
            where(field, '==', uid),
            limit(1)
          );
          const snap = await getDocs(q);
          return snap.empty ? null : snap.docs[0].id;
      };
      conversationId = (await tryUserPairQuery('candidate_id')) || (await tryUserPairQuery('employer_id')) || '';
    }

  // Final identity to use for creation or return
  const finalId = conversationId || deterministicId || input.applicationId;
  console.log(`[chatService] Resolved identifiers - conversationId=${conversationId}, finalId=${finalId}, candidateId=${candidateId}, employerId=${employerId}`);
  
  if (!finalId) {
    throw new Error('Không thể xác định ID hội thoại. Thiếu thông tin cần thiết.');
  }

  const convRef = doc(db, 'conversations', finalId);
  const snap = await getDoc(convRef);

  // Helper to fetch/refresh names
  const fetchParticipantNames = async () => {
    let cName = '';
    let cAvatar = '';
    let eName = '';
    let eAvatar = '';
    try {
      const [cSnap, eSnap] = await Promise.all([
        getDoc(doc(db, 'users', candidateId)),
        getDoc(doc(db, 'users', employerId))
      ]);
      if (cSnap.exists()) {
        const d = cSnap.data();
        cName = d.fullName || d.full_name || '';
        cAvatar = d.avatarUrl || d.avatar_url || '';
      }
      if (eSnap.exists()) {
        const d = eSnap.data();
        eName = d.fullName || d.full_name || '';
        eAvatar = d.avatarUrl || d.avatar_url || '';
      }
    } catch (e) {
      console.warn('Error fetching participant names:', e);
    }
    return { cName, cAvatar, eName, eAvatar };
  };

  if (snap.exists()) {
    console.log(`[chatService] Found existing document for ${finalId}. Checking for updates...`);
    const data = snap.data() as Record<string, unknown>;
    
    // Always upgrade to ACTIVE and TWO_WAY as requested
    let currentStatus = 'ACTIVE';
    let currentPermission = 'TWO_WAY';

    let needsUpdate = false;
    if (data.status !== 'ACTIVE' || (data.chat_permission || data.chatPermission) !== 'TWO_WAY') {
        needsUpdate = true;
    }

    // Refresh names if they are generic or missing
    const candName = String(data.candidate_name || '');
    const hasGenericNames = !candName || candName.toLowerCase() === 'người dùng' || candName === 'Ứng viên' || 
                           !data.employer_name || data.employer_name === 'Nhà tuyển dụng';
    
    let nameUpdates = {};
    if (hasGenericNames) {
        const { cName, cAvatar, eName, eAvatar } = await fetchParticipantNames();
        nameUpdates = {
            candidate_name: cName || data.candidate_name || 'Ứng viên',
            candidate_avatar: cAvatar || data.candidate_avatar || '',
            employer_name: eName || data.employer_name || 'Nhà tuyển dụng',
            employer_avatar: eAvatar || data.employer_avatar || '',
        };
        needsUpdate = true;
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
        updated_at: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...nameUpdates
      });
    }

    return {
      conversationId: snap.id,
      status: currentStatus as ConversationStatus,
      chatPermission: currentPermission as ChatPermission
    };
  }

  console.log(`[chatService] Creating NEW conversation document for ${finalId}...`);
  if (!employerId) {
    throw new Error('Không tìm thấy thông tin nhà tuyển dụng cho bài đăng này.');
  }

  // 3. Fetch User profile details for new creation
  const { cName, cAvatar, eName, eAvatar } = await fetchParticipantNames();

  // Double check that the current user is a participant
  if (uid !== candidateId && uid !== employerId) {
    throw new Error('Bạn không có quyền tham gia hội thoại này.');
  }

  // Always TWO_WAY and ACTIVE for everyone
  const newDoc = {
    application_id: input.applicationId || '',
    job_id: jobId,
    candidate_id: candidateId,
    employer_id: employerId,
    status: 'ACTIVE',
    chat_permission: 'TWO_WAY',
    chatPermission: 'TWO_WAY',
    candidate_unread_count: 0,
    employer_unread_count: 0,
    candidate_name: cName || 'Ứng viên',
    candidate_avatar: cAvatar || '',
    employer_name: eName || 'Nhà tuyển dụng',
    employer_avatar: eAvatar || '',
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
    candidateId: candidateId,
    employerId: employerId
  };

  await setDoc(convRef, newDoc);

  return { conversationId: finalId, status: 'ACTIVE' as ConversationStatus, chatPermission: 'TWO_WAY' as ChatPermission };
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
  const conversationStatus = String(convData.status || 'PENDING');

  const senderRole = uid === employerId ? 'EMPLOYER' : 'CANDIDATE';

  if (uid !== candidateId && uid !== employerId) {
    throw new Error('Bạn không thuộc hội thoại này.');
  }

  // BLOCKED is a hard stop for everyone
  if (conversationStatus === 'BLOCKED') {
    throw new Error('Hội thoại đã bị khóa.');
  }

  // Everyone can send messages if they are in the conversation.
  const clientMessageId = input.clientMessageId || `msg_${Date.now()}`;
  
  const msgData = {
    conversation_id: conversationId,
    application_id: String(convData.application_id || convData.applicationId || ''),
    sender_id: uid, 
    senderId: uid, 
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

    // Always ensure ACTIVE status and TWO_WAY permission on every message
    const updateData: Record<string, any> = {
      status: 'ACTIVE',
      chat_permission: 'TWO_WAY',
      chatPermission: 'TWO_WAY',
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

export async function createOrGetDirectConversation(targetUserId: string, targetName: string, targetAvatar: string, currentUserFullName: string, currentUserAvatar: string): Promise<string> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Cần đăng nhập để nhắn tin');
    if (uid === targetUserId) throw new Error('Không thể chat với chính mình');
    
    // Sort UIDs deterministically to always generate the same ID regardless of who clicks first
    const sortedUids = [uid, targetUserId].sort();
    const deterministicId = `dm_${sortedUids[0]}_${sortedUids[1]}`;
    
    const convRef = doc(db, 'conversations', deterministicId);
    const snap = await getDoc(convRef);
    if (snap.exists()) {
       return snap.id;
    }
    
    const newDoc = {
       application_id: '',
       job_id: '',
       candidate_id: uid, 
       employer_id: targetUserId,
       status: 'ACTIVE',
       chat_permission: 'TWO_WAY',
       chatPermission: 'TWO_WAY',
       candidate_unread_count: 0,
       employer_unread_count: 0,
       candidate_name: currentUserFullName || 'Người dùng',
       candidate_avatar: currentUserAvatar || '',
       employer_name: targetName || 'Người dùng',
       employer_avatar: targetAvatar || '',
       created_at: serverTimestamp(),
       updated_at: serverTimestamp(),
       candidateId: uid,
       employerId: targetUserId
    };
    
    await setDoc(convRef, newDoc);
    return deterministicId;
}
