'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Episode {
  episodeId: number;
  title: string;
  content: string;
  authorNote?: string;
  novelTitle: string;
  author: string;
  episodeNumber: number;
}

const EpisodeViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [comment, setComment] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockEpisode: Episode = {
      episodeId: parseInt(episodeId),
      title: "제 1화 - 새로운 시작",
      content: `안녕하세요. 오늘도 좋은 하루 되세요.

첫 번째 에피소드입니다. 이곳에서 소설의 본문이 시작됩니다.

"어디선가 들려오는 소리에 고개를 들었다."

주인공은 창밖을 바라보며 깊은 한숨을 내쉬었다. 오늘도 평범한 하루가 시작되는 것 같았다.

하지만 그 순간, 문득 이상한 느낌이 들었다. 마치 누군가가 자신을 지켜보고 있는 것 같은 기분이었다.

"누구세요?"

아무도 대답하지 않았다. 조용한 방 안에는 자신의 목소리만이 울렸다.

그때였다. 갑자기 창밖에서 이상한 빛이 번쩍였다. 주인공은 놀라서 창가로 다가갔다.

창밖을 보니, 평소와는 다른 풍경이 펼쳐져 있었다. 마치 다른 세계에 온 것 같은 기분이었다.

"이게 꿈인가?"

자신의 볼을 꼬집어보았다. 아프다. 꿈이 아니었다.

이제 주인공의 새로운 모험이 시작될 것이다. 과연 어떤 일들이 기다리고 있을까?

다음 에피소드에서 계속...`,
      authorNote: "안녕하세요! 첫 번째 에피소드를 올렸습니다. 앞으로 재미있는 이야기로 찾아뵙겠습니다. 많은 관심과 사랑 부탁드려요!",
      novelTitle: "이상한 세계로의 초대",
      author: "작가님",
      episodeNumber: 1
    };
    
    setTimeout(() => {
      setEpisode(mockEpisode);
      setLoading(false);
    }, 500);
  }, [episodeId]);

  const handleFontSizeChange = (increase: boolean) => {
    setFontSize(prev => {
      const newSize = increase ? prev + 1 : prev - 1;
      return Math.max(12, Math.min(24, newSize));
    });
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      // TODO: 실제 댓글 API 호출
      console.log('댓글 작성:', comment);
      setComment('');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: '#f8f9fa', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ fontSize: 18, color: '#666' }}>에피소드를 불러오는 중...</div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div style={{ 
        background: '#f8f9fa', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ fontSize: 18, color: '#666' }}>에피소드를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: '#fff', 
        borderBottom: '1px solid #e9ecef',
        padding: '12px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                {episode.novelTitle} - {episode.author}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {episode.title}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={() => handleFontSizeChange(false)}
                style={{ 
                  background: '#fff', 
                  border: '1px solid #ddd', 
                  borderRadius: 4, 
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                A-
              </button>
              <span style={{ fontSize: 14, color: '#666' }}>{fontSize}px</span>
              <button 
                onClick={() => handleFontSizeChange(true)}
                style={{ 
                  background: '#fff', 
                  border: '1px solid #ddd', 
                  borderRadius: 4, 
                  padding: '6px 12px',
                  cursor: 'pointer'
                }}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        <div style={{ 
          background: '#fff', 
          borderRadius: 8, 
          padding: '40px 30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          lineHeight: 1.8,
          fontSize: fontSize
        }}>
          {/* Episode Content */}
          <div style={{ 
            whiteSpace: 'pre-line',
            marginBottom: 40,
            color: '#333'
          }}>
            {episode.content}
          </div>

          {/* Author's Note */}
          {episode.authorNote && (
            <div style={{ 
              background: '#f8f9fa', 
              borderLeft: '4px solid #007bff',
              padding: '20px',
              marginBottom: 40,
              borderRadius: '0 8px 8px 0'
            }}>
              <div style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: '#007bff',
                marginBottom: 8 
              }}>
                작가의 말
              </div>
              <div style={{ 
                fontSize: 14, 
                color: '#666',
                lineHeight: 1.6
              }}>
                {episode.authorNote}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 30,
            padding: '20px 0',
            borderTop: '1px solid #e9ecef'
          }}>
            <button style={{ 
              background: '#007bff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: 6, 
              padding: '12px 24px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600
            }}>
              👍 추천
            </button>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={{ 
                background: '#6c757d', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: 14
              }}>
                이전화
              </button>
              <button style={{ 
                background: '#28a745', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 6, 
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600
              }}>
                다음화
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div style={{ 
            borderTop: '1px solid #e9ecef',
            paddingTop: 30
          }}>
            <div style={{ 
              fontSize: 18, 
              fontWeight: 600, 
              marginBottom: 20,
              color: '#333'
            }}>
              댓글 (0)
            </div>
            
            {/* Comment Input */}
            <div style={{ 
              background: '#f8f9fa', 
              borderRadius: 8, 
              padding: '16px',
              marginBottom: 20
            }}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="댓글을 작성해주세요..."
                style={{ 
                  width: '100%', 
                  border: 'none', 
                  background: 'transparent', 
                  outline: 'none', 
                  fontSize: 14,
                  resize: 'none',
                  minHeight: 60,
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button 
                  onClick={handleCommentSubmit}
                  style={{ 
                    background: '#007bff', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: 4, 
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: 14
                  }}
                >
                  댓글 작성
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              color: '#666',
              fontSize: 14
            }}>
              아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeViewPage;