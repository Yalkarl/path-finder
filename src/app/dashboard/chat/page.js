'use client';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getUserProfile,
  updateUserProfile,
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  deleteConversation,
  getDailyTokenUsage,
  incrementDailyTokenUsage,
  DAILY_TOKEN_LIMIT,
} from '@/lib/firestore';
import MessageBubble from '@/components/chat/MessageBubble';
import QuickReplyChips from '@/components/chat/QuickReplyChips';
import { MrPath } from '@/components/ui/mr-path';
import { JUNIOR_PATHS, SENIOR_PATHS } from '@/lib/constants/educationPaths';
import { calculateSkillVector } from '@/lib/algorithms/skillVector';
import { matchPaths } from '@/lib/algorithms/cosineSimilarity';
// Inner component that uses useSearchParams (must be wrapped in Suspense)
function ChatPageInner() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  // Conversation management state
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [editingConvId, setEditingConvId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [convsPanelOpen, setConvsPanelOpen] = useState(true);

  // Track if consultPath has been handled to avoid re-triggering
  const consultPathHandled = useRef(false);

  const getQuickReplies = () => {
    if (profile?.analysisMode === 'target-lock' && profile?.targetPath) {
      const pathObj = JUNIOR_PATHS[profile.targetPath] || SENIOR_PATHS[profile.targetPath] || { name: profile.targetPath };
      const shortName = pathObj.name;

      if (profile.educationLevel === 'junior') {
        return [
          { text: `ขอแผนปฏิบัติการ (Roadmap) สอบเข้า ม.4 ${shortName}` },
          { text: 'ช่วยแนะนำการเตรียมกิจกรรม/ผลงานระดับ ม.ต้น หน่อยครับ' },
          { text: `แนะนำวิธีเพิ่มระดับการเก็บเนื้อหาเพื่อเข้า ม.4 ${shortName}` },
          { text: 'สายการเรียนนี้ใช้คะแนนหรือเกณฑ์วิชาอะไรในการคัดเลือกบ้าง' },
        ];
      }

      return [
        { text: `ขอแผนปฏิบัติการ (Roadmap) สอบเข้า${shortName}` },
        { text: 'ช่วยแนะนำการทำพอร์ตโฟลิโอสะสมผลงานหน่อยครับ' },
        { text: `แนะนำวิธีอัพทักษะเพื่อเพิ่มโอกาสเข้า${shortName}` },
        { text: 'คณะนี้ต้องใช้คะแนนสอบวิชาอะไรบ้างในระบบ TCAS' },
      ];
    }

    return [
      { text: 'ขอคำแนะนำการวางแผนการเรียน' },
      { text: 'จุดแข็งของฉันคืออะไร?' },
      { text: 'แนะนำอาชีพที่เหมาะกับฉันหน่อย' },
      { text: 'รู้สึกเครียดเรื่องการเรียน' },
    ];
  };

  const quickReplies = getQuickReplies();

  const makeGreeting = useCallback((p) => {
    if (p.analysisMode === 'target-lock' && p.targetPath) {
      const pathObj = JUNIOR_PATHS[p.targetPath] || SENIOR_PATHS[p.targetPath] || { name: p.targetPath };
      const targetName = pathObj.name;
      return `สวัสดีครับน้อง${p.name}! ผม Mr. Path ในฐานะโค้ชวางแผนส่วนตัว (TCAS Coach) เองครับ\n\nยินดีต้อนรับสู่โปรแกรมติวเข้มเพื่อเข้าเรียนสาย **${targetName}** วันนี้มาเริ่มต้นวิเคราะห์และอุดช่องว่างเพื่อเตรียมพอร์ตโฟลิโอหรือวางแผนอ่านหนังสือสอบกันเลยดีกว่าครับ! มีคำถามอะไรเป็นพิเศษไหมครับ?`;
    }
    const topMatch = p.results?.matchRankings?.[0]?.name || 'หลายด้าน';
    return `สวัสดีครับน้อง${p.name}! ผม Mr. Path เองครับ\n\nจากผลการวิเคราะห์ น้องมีความโดดเด่นด้าน **${topMatch}** มากเลยครับ วันนี้มีเรื่องอะไรอยากปรึกษา หรือให้ผมช่วยวางแผนการเรียนให้ไหมครับ?`;
  }, []);

  // Refresh the conversations list
  const refreshConversations = useCallback(async () => {
    if (!user) return [];
    const list = await getConversations(user.uid);
    setConversations(list);
    return list;
  }, [user]);

  // Load a specific conversation
  const loadConversation = useCallback(async (convId) => {
    if (!user || !profile) return;
    const conv = await getConversation(user.uid, convId);
    if (conv) {
      let msgs = conv.messages || [];
      if (msgs.length > 0 && msgs[0].role === 'model') {
        msgs = [
          { ...msgs[0], content: makeGreeting(profile) },
          ...msgs.slice(1)
        ];
      }
      setMessages(msgs);
      setActiveConvId(conv.id);
    }
  }, [user, profile, makeGreeting]);

  // Create a new conversation and set it as active
  const handleNewConversation = useCallback(async (customTitle, initialMsgs) => {
    if (!user || !profile) return null;
    const greeting = [{ role: 'model', content: makeGreeting(profile) }];
    const msgs = initialMsgs || greeting;
    const title = customTitle || 'สนทนาใหม่';
    const convId = await createConversation(user.uid, title, msgs);
    setMessages(msgs);
    setActiveConvId(convId);
    await refreshConversations();
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      setConvsPanelOpen(false);
    }
    return convId;
  }, [user, profile, makeGreeting, refreshConversations]);

  // Close conversation panel by default on mobile screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      setConvsPanelOpen(false);
    }
  }, []);

  // ── Initialization ──
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      // Always fetch latest profile from Firestore for name sync
      const p = await getUserProfile(user.uid);
      if (cancelled) return;

      if (!p || !p.results) {
        router.push('/dashboard');
        return;
      }
      setProfile(p);

      // Load conversations
      const convList = await getConversations(user.uid);
      if (cancelled) return;
      setConversations(convList);

      // Migration: if old chatHistory exists but no conversations yet
      if (convList.length === 0 && p.chatHistory && p.chatHistory.length > 0) {
        const migratedId = await createConversation(user.uid, 'สนทนาเก่า', p.chatHistory);
        // Remove old chatHistory from profile
        await updateUserProfile(user.uid, { chatHistory: [] });
        if (cancelled) return;
        const updatedList = await getConversations(user.uid);
        setConversations(updatedList);
        setMessages(p.chatHistory);
        setActiveConvId(migratedId);
      } else if (convList.length > 0) {
        // Load most recent conversation and update greeting name
        let msgs = convList[0].messages || [];
        if (msgs.length > 0 && msgs[0].role === 'model') {
          msgs = [
            { ...msgs[0], content: makeGreeting(p) },
            ...msgs.slice(1)
          ];
        }
        setMessages(msgs);
        setActiveConvId(convList[0].id);
      } else {
        // No conversations at all — create a greeting one
        const greeting = [{ role: 'model', content: makeGreeting(p) }];
        const newId = await createConversation(user.uid, 'สนทนาใหม่', greeting);
        if (cancelled) return;
        const updatedList = await getConversations(user.uid);
        setConversations(updatedList);
        setMessages(greeting);
        setActiveConvId(newId);
      }

      setIsInitializing(false);
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, makeGreeting]);

  // ── consultPath handler ──
  useEffect(() => {
    if (isInitializing || !profile || !user || consultPathHandled.current) return;

    const consultPath = searchParams.get('consultPath');
    if (!consultPath) return;

    consultPathHandled.current = true;

    (async () => {
      const greeting = [{ role: 'model', content: makeGreeting(profile) }];
      const title = `ปรึกษาสาย ${consultPath}`;
      const convId = await createConversation(user.uid, title, greeting);
      setMessages(greeting);
      setActiveConvId(convId);
      await refreshConversations();

      // Auto-send a consult message
      const autoMsg = `ช่วยแนะนำแนวทางเพื่อเข้าสาย${consultPath}ให้หน่อยครับ โดยอ้างอิงจากผลวิเคราะห์ skill vector และ gap analysis ของผม`;
      // Use a timeout so the state is settled before calling handleSubmit
      setTimeout(() => {
        handleSubmitForConv(autoMsg, convId, greeting);
      }, 100);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing, profile, user, searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Core submit handler — can accept explicit convId + msgs for consultPath flow
  const handleSubmitForConv = async (text, explicitConvId, explicitMsgs) => {
    if (!text.trim() || isLoading || !profile) return;

    // Daily token limit check
    const usage = await getDailyTokenUsage(user.uid);
    if (usage >= DAILY_TOKEN_LIMIT) {
      const limitMsg = { role: 'model', content: 'จำนวนครั้งการใช้งาน Mr.Path ของคุณในวันนี้ครบจำนวนจำกัดแล้ว' };
      setMessages(prev => [...prev, { role: 'user', content: text }, limitMsg]);
      return;
    }

    const currentConvId = explicitConvId || activeConvId;
    const baseMsgs = explicitMsgs || messages;

    const userMsg = { role: 'user', content: text };
    const updatedMessagesWithUser = [...baseMsgs, userMsg];
    setMessages(updatedMessagesWithUser);
    setInput('');
    setIsLoading(true);

    try {
      // Always use latest profile name
      const freshProfile = await getUserProfile(user.uid);
      if (freshProfile) {
        setProfile(freshProfile);
      }
      const currentProfile = freshProfile || profile;
      const profileName = currentProfile?.name || 'ผู้ใช้';

      const targetPathForFiltering = currentProfile.analysisMode === 'target-lock' && currentProfile.targetPath ? currentProfile.targetPath : null;
      const skillVector = calculateSkillVector(currentProfile.academics || {}, currentProfile.assessment?.responses || [], targetPathForFiltering);
      const pathsObject = currentProfile.educationLevel === 'junior' ? JUNIOR_PATHS : SENIOR_PATHS;
      const matchRankings = matchPaths(skillVector, pathsObject);

      const topSkills = ['ตรรกะ', 'วิทยาศาสตร์', 'ภาษา', 'ศิลปะ', 'การบริหาร']
        .filter((_, i) => skillVector[i] > 0.6);

      const payload = {
        messages: updatedMessagesWithUser,
        userContext: {
          name: profileName,
          educationLevel: currentProfile.educationLevel,
          topSkills,
          topMatch: matchRankings[0],
          analysisMode: currentProfile.analysisMode || 'discovery',
          targetPath: currentProfile.targetPath || null,
          portfolio: currentProfile.portfolio || [],
          customActivities: currentProfile.customActivities || [],
          selfAssessment: currentProfile.selfAssessment || {},
          targetProgramType: currentProfile.targetProgramType || null,
        },
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('API Error');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      const botMsgPlaceholder = { role: 'model', content: '' };
      setMessages(prev => [...prev, botMsgPlaceholder]);

      let aiText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        aiText += chunk;

        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content: aiText };
          return newMsgs;
        });
      }

      const finalMessagesList = [...updatedMessagesWithUser, { role: 'model', content: aiText }];

      // Increment daily token usage after successful API call
      await incrementDailyTokenUsage(user.uid);

      // Save conversation to Firestore
      if (currentConvId) {
        // Auto-title if still default
        let titleUpdate = {};
        const conv = conversations.find(c => c.id === currentConvId);
        if (conv && conv.title === 'สนทนาใหม่' && text.length > 0) {
          const shortTitle = text.length > 30 ? text.substring(0, 30) + '...' : text;
          titleUpdate = { title: shortTitle };
        }
        await updateConversation(user.uid, currentConvId, {
          messages: finalMessagesList,
          ...titleUpdate,
        });
      }

      // Track achievements
      const currentAchievements = profile.achievements || [];
      const newAchievements = [...currentAchievements];
      let achievementsUpdated = false;

      if (!currentAchievements.includes('chatty') && finalMessagesList.length >= 10) {
        newAchievements.push('chatty');
        achievementsUpdated = true;
      }

      if (!currentAchievements.includes('planner') && aiText.includes('แผนปฏิบัติการ')) {
        if (!newAchievements.includes('planner')) {
          newAchievements.push('planner');
        }
        achievementsUpdated = true;
      }

      if (achievementsUpdated) {
        await updateUserProfile(user.uid, { achievements: newAchievements });
      }

      await refreshConversations();
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', content: 'ขออภัยครับ ระบบมีปัญหาขัดข้องชั่วคราว รบกวนลองใหม่อีกครั้งนะครับ 🙏' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (text) => handleSubmitForConv(text);

  // Conversation panel actions
  const handleRenameConv = async (convId) => {
    if (!editTitle.trim()) return;
    await updateConversation(user.uid, convId, { title: editTitle.trim() });
    setEditingConvId(null);
    setEditTitle('');
    await refreshConversations();
  };

  const handleDeleteConv = async (convId) => {
    await deleteConversation(user.uid, convId);
    setDeleteConfirmId(null);

    const updatedList = await refreshConversations();

    if (convId === activeConvId) {
      if (updatedList.length > 0) {
        let msgs = updatedList[0].messages || [];
        if (msgs.length > 0 && msgs[0].role === 'model') {
          msgs = [
            { ...msgs[0], content: makeGreeting(profile) },
            ...msgs.slice(1)
          ];
        }
        setMessages(msgs);
        setActiveConvId(updatedList[0].id);
      } else {
        // Create a fresh conversation
        await handleNewConversation();
      }
    }
  };

  const handleClickConv = async (conv) => {
    if (editingConvId || deleteConfirmId) return;
    await loadConversation(conv.id);
    if (typeof window !== 'undefined' && window.innerWidth <= 992) {
      setConvsPanelOpen(false);
    }
  };

  // ── Render ──
  if (isInitializing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <MrPath size={60} animate={true} showBg={false} />
        <p style={{ color: 'var(--text-secondary)' }}>กำลังเชื่อมต่อกับ Mr. Path...</p>
      </div>
    );
  }

  return (
    <div className="chat-container" style={{ height: 'calc(100vh - 3rem)', display: 'flex', gap: '0', position: 'relative' }}>

      {/* ──── Conversation Panel (Left) ──── */}
      <div className={`conversations-panel ${convsPanelOpen ? 'open' : 'closed'}`} style={{
        width: convsPanelOpen ? '280px' : '0px',
        minWidth: convsPanelOpen ? '280px' : '0px',
        background: 'var(--surface)',
        borderRight: convsPanelOpen ? '1px solid var(--border)' : 'none',
        borderRadius: '16px 0 0 16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: convsPanelOpen ? '2px 0 10px rgba(0,0,0,0.03)' : 'none',
      }}>
        {/* Panel Header */}
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>💬 การสนทนา</span>
          <button
            onClick={() => setConvsPanelOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-secondary)', padding: '2px' }}
            title="ซ่อนแผงสนทนา"
          >✕</button>
        </div>

        {/* New Conversation Button */}
        <button
          onClick={() => handleNewConversation()}
          style={{
            margin: '0.75rem',
            padding: '0.6rem 1rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.85rem',
            transition: 'background 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#6B4CE0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--primary)'; }}
        >
          ＋ สร้างการสนทนาใหม่
        </button>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem 0.5rem 0.5rem' }}>
          {conversations.map(conv => {
            const isActive = conv.id === activeConvId;
            const isEditing = editingConvId === conv.id;
            const isDeleting = deleteConfirmId === conv.id;
            const lastMsg = conv.messages?.[conv.messages.length - 1];
            const preview = lastMsg?.content?.substring(0, 40) || '';
            const dateStr = conv.updatedAt ? new Date(conv.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '';

            return (
              <div
                key={conv.id}
                onClick={() => handleClickConv(conv)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: isActive ? 'var(--primary-bg)' : 'transparent',
                  border: isActive ? '1px solid var(--primary-light)' : '1px solid transparent',
                  marginBottom: '4px',
                  transition: 'all 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#F9F7FF'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Title row */}
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConv(conv.id); if (e.key === 'Escape') setEditingConvId(null); }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: '3px 6px',
                        border: '1px solid var(--primary)',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRenameConv(conv.id); }}
                      style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >✓</button>
                  </div>
                ) : isDeleting ? (
                  <div style={{ fontSize: '0.8rem' }}>
                    <p style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontWeight: '600' }}>ลบการสนทนานี้?</p>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteConv(conv.id); }}
                        style={{ background: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >ลบ</button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                        style={{ background: 'var(--border)', color: 'var(--text-primary)', border: 'none', borderRadius: '6px', padding: '3px 10px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >ยกเลิก</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontWeight: '600',
                        fontSize: '0.82rem',
                        color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '150px',
                      }}>
                        {conv.title || 'สนทนาใหม่'}
                      </span>
                      <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingConvId(conv.id); setEditTitle(conv.title || ''); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '2px', opacity: 0.6 }}
                          title="เปลี่ยนชื่อ"
                        >✏️</button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(conv.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '2px', opacity: 0.6 }}
                          title="ลบ"
                        >🗑️</button>
                      </div>
                    </div>
                    <p style={{
                      margin: '3px 0 0 0',
                      fontSize: '0.72rem',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {preview ? preview + '...' : 'ยังไม่มีข้อความ'}
                    </p>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{dateStr}</span>
                  </>
                )}
              </div>
            );
          })}

          {conversations.length === 0 && (
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '1rem 0' }}>
              ยังไม่มีการสนทนา
            </p>
          )}
        </div>
      </div>

      {/* ──── Main Chat Area (Right) ──── */}
      <div className="chat-main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Chat Header */}
        <div style={{
          padding: '0.75rem 1rem',
          background: 'var(--surface)',
          borderRadius: convsPanelOpen ? '0 16px 0 0' : '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          borderBottom: '1px solid var(--border)',
        }}>
          {!convsPanelOpen && (
            <button
              onClick={() => setConvsPanelOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)', padding: '4px', marginRight: '4px' }}
              title="แสดงแผงสนทนา"
            >☰</button>
          )}
          <MrPath size={42} />
          <div>
            <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.1rem' }}>Mr. Path AI Mentor</h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--success)' }}>● กำลังออนไลน์</p>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} message={msg} />
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '0.5rem', margin: '1rem 0', paddingLeft: '3rem' }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--border)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
              <div style={{ width: '8px', height: '8px', background: 'var(--border)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }} />
              <div style={{ width: '8px', height: '8px', background: 'var(--border)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }} />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '0 0 16px 0' }}>
          {!isLoading && (
            <QuickReplyChips options={quickReplies} onSelect={handleSubmit} />
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(input); }}
            style={{ display: 'flex', gap: '0.5rem' }}
          >
            <input
              type="text"
              className="input-field"
              placeholder="พิมพ์ข้อความคุยกับ Mr. Path..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              style={{ flex: 1, borderRadius: '24px' }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !input.trim()}
              style={{
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function ChatPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '1rem' }}>
        <MrPath size={60} animate={true} showBg={false} />
        <p style={{ color: 'var(--text-secondary)' }}>กำลังเชื่อมต่อกับ Mr. Path...</p>
      </div>
    }>
      <ChatPageInner />
    </Suspense>
  );
}
