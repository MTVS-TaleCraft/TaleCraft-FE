'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Episode {
  episodeId: number;
  title: string;
  content: string;
  note: string;
  createDate: string | null;
  novelId: number;
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
    const fetchEpisode = async () => {
      try {
        const response = await fetch(`/api/novels/1/episodes/${episodeId}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const episodeData = await response.json();
          setEpisode(episodeData);
        } else {
          console.error('Failed to fetch episode:', response.status);
        }
      } catch (error) {
        console.error('Error fetching episode:', error);
      } finally {
        setLoading(false);
      }
    };

    if (episodeId) {
      fetchEpisode();
    }
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
                {episode.novelId} - {episode.title}
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
          {episode.note && (
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
                {episode.note}
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