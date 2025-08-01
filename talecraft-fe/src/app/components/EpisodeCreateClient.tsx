'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface NovelInfo {
  novelId: number;
  title: string;
  userId: string;
  episodeCount: number;
}

const getSessionKey = (novelId: string | null) => `episode-create-draft-${novelId}`;

const EpisodeCreatePage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const novelId = searchParams.get('novelId');

  const [novelTitle, setNovelTitle] = useState<string>('');
  const [novelTitleLoading, setNovelTitleLoading] = useState(false);
  const [novelInfo, setNovelInfo] = useState<NovelInfo | null>(null);
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeContent, setEpisodeContent] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isNotice, setIsNotice] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Fetch novel title from backend
  useEffect(() => {
    if (novelId) {
      setNovelTitleLoading(true);
      fetch(`/api/novels/${novelId}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setNovelTitle(data.title || '');
        })
        .catch(() => setNovelTitle(''))
        .finally(() => setNovelTitleLoading(false));
    }
  }, [novelId]);

  // 세션 임시저장 불러오기
  useEffect(() => {
    if (novelId) {
      const key = getSessionKey(novelId);
      const saved = sessionStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setEpisodeTitle(parsed.title || '');
          setEpisodeContent(parsed.content || '');
          setIsNotice(parsed.isNotice || false);
        } catch {}
      }
    }
  }, [novelId]);

  // 글자수 계산
  useEffect(() => {
    setCharacterCount(episodeContent.length);
  }, [episodeContent]);

  // 자동 높이조절
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [episodeContent]);

  // 임시저장 (sessionStorage)
  const handleTempSave = () => {
    if (!novelId) return;
    const key = getSessionKey(novelId);
    sessionStorage.setItem(key, JSON.stringify({ 
      title: episodeTitle, 
      content: episodeContent, 
      isNotice: isNotice 
    }));
    setMessage('임시 저장 완료! (이 브라우저에서만 유지)');
  };

  // 공개 저장 (API)
  const handleSave = async () => {
    if (!novelId) return;
    
    // 제목과 내용이 비어있으면 저장하지 않음
    if (!episodeTitle.trim() || !episodeContent.trim()) {
      setMessage('제목과 내용을 모두 입력해주세요.');
      return;
    }
    
    setSaving(true);
    setMessage(null);
    
    const requestBody = {
      title: episodeTitle.trim(),
      content: episodeContent.trim(),
      isNotice: isNotice,
    };
    
    console.log('Sending request body:', requestBody);
    
    try {
      const response = await fetch(`/api/novels/${novelId}/episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        setMessage('공개 저장 완료!');
        setEpisodeTitle('');
        setEpisodeContent('');
        setIsNotice(false);
        // 공개 저장 성공 시 임시저장 삭제
        const key = getSessionKey(novelId);
        sessionStorage.removeItem(key);
        setTimeout(() => {
          window.location.href = '/my-novels';
        }, 1000);
      } else {
        setMessage(data.error || '저장에 실패했습니다.');
      }
    } catch (e) {
      console.error('Error during save:', e);
      setMessage('네트워크 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setPreview(true);
  };

  const handleClosePreview = () => {
    setPreview(false);
  };

  if (novelTitleLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 18, color: '#666' }}>작품 제목을 불러오는 중...</div>
      </div>
    );
  }

  if (!novelId || !novelTitle) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 18, color: '#666' }}>작품 정보를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Sticky Top Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#fff',
        borderBottom: '1px solid #e9ecef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        padding: '0 0',
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
          padding: '0 32px',
        }}>
          <div>
            <div style={{ fontSize: 15, color: '#888', marginBottom: 2 }}>{novelTitle}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>새 회차 작성</div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="isNotice"
                checked={isNotice}
                onChange={(e) => setIsNotice(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              <label htmlFor="isNotice" style={{ fontSize: 14, color: '#666', cursor: 'pointer' }}>
                공지
              </label>
            </div>
            <button
              onClick={handleTempSave}
              disabled={saving}
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: '10px 20px',
                fontWeight: 600,
                color: '#666',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 15
              }}
            >
              임시저장
            </button>
            <button
              onClick={handlePreview}
              style={{
                background: '#f8f9fa',
                border: '1px solid #007bff',
                borderRadius: 6,
                padding: '10px 20px',
                fontWeight: 600,
                color: '#007bff',
                cursor: 'pointer',
                fontSize: 15
              }}
            >
              미리보기
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: '#007bff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontWeight: 600,
                color: '#fff',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 15
              }}
            >
              공개 저장
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: 900,
        margin: '32px auto 0 auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 32,
        position: 'relative',
      }}>
        {/* Editor */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '40px 36px', minHeight: 600 }}>
          {message && (
            <div style={{ marginBottom: 16, color: message.includes('완료') ? '#28a745' : '#dc3545', fontWeight: 600 }}>{message}</div>
          )}
          <div style={{ marginBottom: 32 }}>
            <input
              type="text"
              value={episodeTitle}
              onChange={e => setEpisodeTitle(e.target.value)}
              placeholder="회차 제목을 입력하세요"
              style={{
                width: '100%',
                fontSize: 22,
                fontWeight: 600,
                border: 'none',
                borderBottom: '2px solid #e9ecef',
                outline: 'none',
                padding: '8px 0',
                marginBottom: 8,
                background: 'transparent',
              }}
              maxLength={100}
            />
            <div style={{ fontSize: 13, color: '#bbb', textAlign: 'right' }}>{episodeTitle.length}/100</div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <textarea
              ref={contentRef}
              value={episodeContent}
              onChange={e => setEpisodeContent(e.target.value)}
              placeholder="소설 본문을 입력하세요. (엔터로 줄바꿈)"
              style={{
                width: '100%',
                minHeight: 320,
                fontSize: 17,
                lineHeight: 1.8,
                border: 'none',
                outline: 'none',
                resize: 'none',
                background: 'transparent',
                fontFamily: 'inherit',
                color: '#222',
                marginBottom: 8,
              }}
              maxLength={30000}
            />
            <div style={{ fontSize: 13, color: '#bbb', textAlign: 'right' }}>{characterCount}자</div>
          </div>
        </div>

        {/* Right Toolbar */}
        <div style={{ width: 180, minWidth: 140, position: 'sticky', top: 96 }}>
          <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '24px 16px', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: '#007bff' }}>툴박스</div>
            <button
              onClick={() => alert('소설 삽화 생성 기능(예시)')}
              style={{
                width: '100%',
                background: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: '10px 0',
                fontWeight: 600,
                color: '#333',
                marginBottom: 10,
                cursor: 'pointer',
                fontSize: 15
              }}
            >
              삽화 생성
            </button>
            <button
              onClick={() => alert('씬 생성 기능(예시)')}
              style={{
                width: '100%',
                background: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: '10px 0',
                fontWeight: 600,
                color: '#333',
                marginBottom: 10,
                cursor: 'pointer',
                fontSize: 15
              }}
            >
              씬 생성
            </button>
            <button
              onClick={() => alert('스토리 생성 기능(예시)')}
              style={{
                width: '100%',
                background: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: '10px 0',
                fontWeight: 600,
                color: '#333',
                cursor: 'pointer',
                fontSize: 15
              }}
            >
              스토리 생성
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            width: 600,
            maxWidth: '90vw',
            padding: 40,
            position: 'relative',
          }}>
            <button
              onClick={handleClosePreview}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#bbb',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>{episodeTitle || '제목 없음'}</div>
            <div style={{ fontSize: 15, color: '#888', marginBottom: 24 }}>{novelTitle} | </div>
            <div style={{ fontSize: 16, lineHeight: 1.8, color: '#222', whiteSpace: 'pre-line' }}>{episodeContent || '본문이 없습니다.'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpisodeCreatePage; 