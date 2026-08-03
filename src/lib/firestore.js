import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';

// ==========================================
// การจัดการข้อมูลโปรไฟล์ผู้ใช้งาน (User Profile CRUD)
// ==========================================

export const createUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...data,
      createdAt: new Date().toISOString(),
      completedSetup: false
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore createUserProfile error:', err);
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
  } catch (err) {
    console.warn('Firestore updateUserProfile error:', err);
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.warn('Firestore getUserProfile error:', err);
    return null;
  }
};

// ==========================================
// การจัดการประวัติสนทนาแชต (Chat Conversations CRUD)
// ==========================================

export const createConversation = async (uid, title = 'สนทนาใหม่', initialMessages = []) => {
  const convsRef = collection(db, 'users', uid, 'conversations');
  const docRef = await addDoc(convsRef, {
    title,
    messages: initialMessages,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const getConversations = async (uid) => {
  const convsRef = collection(db, 'users', uid, 'conversations');
  const q = query(convsRef, orderBy('updatedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getConversation = async (uid, convId) => {
  const convRef = doc(db, 'users', uid, 'conversations', convId);
  const docSnap = await getDoc(convRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
};

export const updateConversation = async (uid, convId, data) => {
  const convRef = doc(db, 'users', uid, 'conversations', convId);
  await updateDoc(convRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteConversation = async (uid, convId) => {
  const convRef = doc(db, 'users', uid, 'conversations', convId);
  await deleteDoc(convRef);
};

// ========================
// Used Assessment Questions Tracking
// ========================

export const getUsedQuestions = async (uid) => {
  const profile = await getUserProfile(uid);
  return profile?.usedQuestionIds || [];
};

export const addUsedQuestions = async (uid, questionIds) => {
  const current = await getUsedQuestions(uid);
  const merged = [...new Set([...current, ...questionIds])];
  await updateUserProfile(uid, { usedQuestionIds: merged });
};

// ========================
// Daily Token Limit
// ========================

export const getDailyTokenUsage = async (uid) => {
  const profile = await getUserProfile(uid);
  const today = new Date().toISOString().split('T')[0];
  if (profile?.tokenUsage?.date === today) {
    return profile.tokenUsage.count || 0;
  }
  return 0;
};

export const incrementDailyTokenUsage = async (uid) => {
  const profile = await getUserProfile(uid);
  const today = new Date().toISOString().split('T')[0];
  let count = 1;
  if (profile?.tokenUsage?.date === today) {
    count = (profile.tokenUsage.count || 0) + 1;
  }
  await updateUserProfile(uid, {
    tokenUsage: { date: today, count }
  });
  return count;
};

export const DAILY_TOKEN_LIMIT = 50;
