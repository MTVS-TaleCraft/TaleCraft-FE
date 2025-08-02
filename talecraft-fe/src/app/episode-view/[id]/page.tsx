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

interface Comment {
  commentId: number;
  content: string;
  userName: string;
  createdDate: string;
  userId?: string; // 댓글 작성자 ID 추가
}

const EpisodeViewPage = () => {
  const params = useParams();
  const router = useRouter();
  const episodeId = params.id as string;
  
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [comment, setComment] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null); // 현재 로그인한 사용자 정보

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

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/novels/1/episodes/${episodeId}/comments`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const commentsData = await response.json();
          setComments(commentsData.comments || []);
        } else {
          console.error('Failed to fetch comments:', response.status);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    if (episodeId) {
      fetchEpisode();
      fetchComments();
      fetchCurrentUser();
    }
  }, [episodeId]);

  const handleFontSizeChange = (increase: boolean) => {
    setFontSize(prev => {
      const newSize = increase ? prev + 1 : prev - 1;
      return Math.max(12, Math.min(24, newSize));
    });
  };

  const handleCommentSubmit = async () => {
    if (comment.trim()) {
      try {
        const response = await fetch(`/api/novels/1/episodes/${episodeId}/comments`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: comment.trim()
          })
        });
        
        if (response.ok) {
          setComment('');
          // 댓글 목록 새로고침
          const commentsResponse = await fetch(`/api/novels/1/episodes/${episodeId}/comments`, {
            credentials: 'include'
          });
          
          if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            setComments(commentsData.comments || []);
          }
        } else {
          console.error('Failed to post comment:', response.status);
        }
      } catch (error) {
        console.error('Error posting comment:', error);
      }
    }
  };

  const handleReportComment = async (commentId: number, commentUserId: string) => {
    // 자신의 댓글은 신고할 수 없음
    if (currentUser && currentUser.id === commentUserId) {
      alert('자신의 댓글은 신고할 수 없습니다.');
      return;
    }

    const reason = prompt('신고 사유를 입력해주세요:');
    if (!reason) return;

    try {
      const response = await fetch('/api/reports/comments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: commentId,
          reason: reason
        })
      });
      
      if (response.ok) {
        alert('신고가 접수되었습니다.');
      } else {
        alert('신고 접수에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error reporting comment:', error);
      alert('신고 접수 중 오류가 발생했습니다.');
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
              댓글 ({comments.length})
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
            {comments.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#666',
                fontSize: 14
              }}>
                아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
              </div>
            ) : (
              <div>
                {comments.map((comment) => (
                  <div key={comment.commentId} style={{ 
                    padding: '16px',
                    borderBottom: '1px solid #e9ecef',
                    background: '#fff',
                    marginBottom: '16px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: '#333'
                      }}>
                        {comment.userName}
                      </div>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{ 
                          fontSize: 12, 
                          color: '#666'
                        }}>
                          {new Date(comment.createdDate).toLocaleDateString()}
                        </div>
                        {currentUser && comment.userId && currentUser.id !== comment.userId && (
                          <button
                            onClick={() => handleReportComment(comment.commentId, comment.userId!)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #dc3545',
                              color: '#dc3545',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              marginLeft: '8px'
                            }}
                          >
                            신고
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: 14, 
                      color: '#333',
                      lineHeight: 1.5
                    }}>
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeViewPage;