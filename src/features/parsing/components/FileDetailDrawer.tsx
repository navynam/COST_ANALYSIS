import React from 'react';
import {
  Box, Typography, IconButton, Button, LinearProgress, Drawer, Chip,
} from '@mui/material';
import { Close, CheckCircle, Schedule, Error } from '@mui/icons-material';
import { C } from '../../../shared/constants/colors';
import { statusConfig } from '../data/mockData';
import type { FileItem } from '../types';

interface FileDetailDrawerProps {
  file: FileItem | null;
  onClose: () => void;
  onVerify: () => void;
}

const FileDetailDrawer: React.FC<FileDetailDrawerProps> = ({ file, onClose, onVerify }) => {
  // 상태별 설정 (파싱 카드와 동일)
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'extracting':
        return { 
          color: '#ff9800', 
          icon: <Schedule sx={{ fontSize: 16 }} />, 
          label: '추출중', 
          bgColor: '#fff3e0' 
        };
      case 'complete':
        return { 
          color: '#4caf50', 
          icon: <CheckCircle sx={{ fontSize: 16 }} />, 
          label: '완료', 
          bgColor: '#e8f5e8' 
        };
      case 'analyzing':
        return { 
          color: '#9c27b0', 
          icon: <CheckCircle sx={{ fontSize: 16 }} />, 
          label: '분석중', 
          bgColor: '#f3e5f5' 
        };
      case 'failed':
        return { 
          color: '#f44336', 
          icon: <Error sx={{ fontSize: 16 }} />, 
          label: '실패', 
          bgColor: '#ffebee' 
        };
      default:
        return { 
          color: '#9e9e9e', 
          icon: <Schedule sx={{ fontSize: 16 }} />, 
          label: '알 수 없음', 
          bgColor: '#f5f5f5' 
        };
    }
  };

  const statusConf = getStatusConfig(file?.status || 'pending');

  return (
    <Drawer anchor="right" open={!!file} onClose={onClose} PaperProps={{ sx: { width: 480, bgcolor: '#fafafa' } }}>
      {file && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* 🎨 Toss 스타일 헤더 (파싱 카드와 동일) */}
          <Box sx={{ 
            p: 3, 
            pb: 2, 
            bgcolor: 'white',
            borderBottom: '1px solid #f2f4f6',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start' 
          }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: `${statusConf.color}15`,
                    color: statusConf.color,
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  {statusConf.icon}
                  {statusConf.label}
                </Box>
              </Box>
              
              <Typography sx={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: '#191f28',
                mb: 1,
                lineHeight: 1.3,
                wordBreak: 'break-all'
              }}>
                {file.name}
              </Typography>
              
              {/* 기본 파일 정보 (파싱 카드와 동일한 스타일) */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
                  📁 {file.fileSize || '0 Bytes'}
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
                  📅 {file.uploadDate}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 0.5 }}>
                <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
                  👤 {file.uploader || '김남중'}
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
                  🏢 {file.department || '개발팀'}
                </Typography>
              </Box>
            </Box>
            
            <IconButton 
              size="small" 
              onClick={onClose}
              sx={{ 
                bgcolor: '#f8f9fa',
                '&:hover': { bgcolor: '#e9ecef' }
              }}
            >
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* 🔄 동적 콘텐츠 영역 (파싱 카드와 동일한 디자인) */}
          <Box sx={{ flex: 1, p: 3, pt: 2, overflow: 'auto' }}>
            
            {/* ⏳ 추출 중 상태 */}
            {file.status === 'extracting' && (
              <Box sx={{ p: 2.5, bgcolor: '#fff3e0', borderRadius: '12px', border: '1px solid #ffcc02' }}>
                <Typography sx={{ 
                  fontSize: 14, 
                  color: '#e65100', 
                  fontWeight: 700,
                  mb: 2,
                  textAlign: 'center'
                }}>
                  📊 데이터 추출 중
                </Typography>
                
                {/* 전체 진행률 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 12, color: '#e65100', fontWeight: 600 }}>
                      전체 진행률
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#e65100', fontWeight: 800 }}>
                      {file.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={file.progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: '8px', 
                      bgcolor: '#ffecb3',
                      '& .MuiLinearProgress-bar': { 
                        bgcolor: '#ff9800',
                        borderRadius: '8px'
                      } 
                    }} 
                  />
                </Box>
                
                <Typography sx={{ 
                  fontSize: 12, 
                  color: '#e65100',
                  textAlign: 'center',
                  lineHeight: 1.4
                }}>
                  Excel 파일을 분석하고 데이터를 추출하고 있어요
                </Typography>

                {/* 🎯 시트별 진행상태 - 라운드 렉텡글 디자인 */}
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #ffcc02' }}>
                  <Typography sx={{ 
                    fontSize: 12, 
                    color: '#e65100',
                    fontWeight: 600,
                    mb: 1.5
                  }}>
                    시트별 진행 상태
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[
                      { name: 'Sheet 1', status: 'complete', desc: '구조 분석 완료' },
                      { name: 'Sheet 2', status: 'complete', desc: '셀 매핑 완료' },
                      { name: 'Sheet 3', status: 'processing', desc: '데이터 검증 중...' },
                      { name: 'Sheet 4', status: 'pending', desc: '대기 중' }
                    ].map((sheet, index) => (
                      <Box 
                        key={sheet.name}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: '12px',
                          bgcolor: sheet.status === 'complete' ? '#e8f5e8' : 
                                   sheet.status === 'processing' ? '#fff3e0' : '#f5f5f5',
                          border: `1px solid ${
                            sheet.status === 'complete' ? '#4caf50' : 
                            sheet.status === 'processing' ? '#ff9800' : '#e0e0e0'
                          }30`
                        }}
                      >
                        <Box sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: sheet.status === 'complete' ? '#4caf50' : 
                                   sheet.status === 'processing' ? '#ff9800' : '#9e9e9e',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 700
                        }}>
                          {sheet.status === 'complete' ? '✓' : 
                           sheet.status === 'processing' ? '⟳' : index + 1}
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ 
                            fontSize: 13, 
                            fontWeight: 600,
                            color: sheet.status === 'complete' ? '#2e7d32' : 
                                   sheet.status === 'processing' ? '#e65100' : '#757575'
                          }}>
                            {sheet.name}
                          </Typography>
                          <Typography sx={{ 
                            fontSize: 11, 
                            color: sheet.status === 'complete' ? '#4caf50' : 
                                   sheet.status === 'processing' ? '#ff9800' : '#9e9e9e',
                            fontWeight: 500
                          }}>
                            {sheet.desc}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {/* ✅ 추출 완료 상태 (파싱 카드와 동일) */}
            {(file.status === 'complete' || file.status === 'analyzing') && (
              <Box sx={{ p: 2.5, bgcolor: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                <Typography sx={{ 
                  fontSize: 14, 
                  color: '#15803d', 
                  fontWeight: 700,
                  mb: 2,
                  textAlign: 'center'
                }}>
                  ✨ 추출 완료
                </Typography>
                
                {/* 📊 추출 결과 요약 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography sx={{ 
                      fontSize: 20, 
                      fontWeight: 800, 
                      color: '#0064ff',
                      lineHeight: 1
                    }}>
                      {file.parsedItems || 156}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: 12, 
                      color: '#15803d',
                      fontWeight: 500
                    }}>
                      파싱 항목
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography sx={{ 
                      fontSize: 20, 
                      fontWeight: 800, 
                      color: '#00c896',
                      lineHeight: 1
                    }}>
                      {(file.parsedItems && file.anomalies) ? 
                        Math.round(((file.parsedItems - file.anomalies) / file.parsedItems) * 100) : 
                        94
                      }%
                    </Typography>
                    <Typography sx={{ 
                      fontSize: 12, 
                      color: '#15803d',
                      fontWeight: 500
                    }}>
                      정확도
                    </Typography>
                  </Box>
                  
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Typography sx={{ 
                      fontSize: 20, 
                      fontWeight: 800, 
                      color: file.anomalies && file.anomalies > 0 ? '#ff5a5a' : '#8b95a1',
                      lineHeight: 1
                    }}>
                      {file.anomalies || 3}
                    </Typography>
                    <Typography sx={{ 
                      fontSize: 12, 
                      color: '#15803d',
                      fontWeight: 500
                    }}>
                      이상치
                    </Typography>
                  </Box>
                </Box>

                {/* 📋 추출된 카테고리 */}
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #dcfce7' }}>
                  <Typography sx={{ 
                    fontSize: 12, 
                    color: '#15803d',
                    fontWeight: 600,
                    mb: 1
                  }}>
                    추출된 카테고리
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label="재료비 (4건)" 
                      size="small" 
                      sx={{ 
                        fontSize: 10, 
                        height: 20,
                        bgcolor: '#dbeafe', 
                        color: '#1d4ed8',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 0.75 }
                      }} 
                    />
                    <Chip 
                      label="가공비 (3건)" 
                      size="small" 
                      sx={{ 
                        fontSize: 10, 
                        height: 20,
                        bgcolor: '#fef3c7', 
                        color: '#d97706',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 0.75 }
                      }} 
                    />
                    <Chip 
                      label="경비 (2건)" 
                      size="small" 
                      sx={{ 
                        fontSize: 10, 
                        height: 20,
                        bgcolor: '#dcfce7', 
                        color: '#059669',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 0.75 }
                      }} 
                    />
                  </Box>
                  
                  {/* 📄 파일 정보 - 시각적 디자인 */}
                  <Typography sx={{ 
                    fontSize: 12, 
                    color: '#15803d',
                    fontWeight: 600,
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    📄 파일 정보
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* 파일명 - 메인 카드 */}
                    <Box sx={{ 
                      p: 1.5,
                      bgcolor: '#fff9e6',
                      borderRadius: '8px',
                      border: '1px solid #ffd740',
                      borderLeft: '4px solid #f57c00'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontSize: 9, color: '#f57c00' }}>📁</Typography>
                        <Typography sx={{ 
                          fontSize: 10, 
                          color: '#f57c00',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          파일명
                        </Typography>
                      </Box>
                      <Typography sx={{ 
                        fontSize: 13, 
                        fontWeight: 700,
                        color: '#1a1a1a'
                      }}>
                        {file?.name || 'DOOR_TRIM.xlsx'}
                      </Typography>
                    </Box>

                    {/* 주문/품번 정보 - 2열 */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ 
                        flex: 1,
                        p: 1.2,
                        bgcolor: '#e3f2fd',
                        borderRadius: '6px',
                        border: '1px solid #90caf9'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Typography sx={{ fontSize: 9 }}>🏷️</Typography>
                          <Typography sx={{ 
                            fontSize: 9, 
                            color: '#1565c0',
                            fontWeight: 600
                          }}>
                            C.O. NO.
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: 11, 
                          fontWeight: 600,
                          color: '#0d47a1'
                        }}>
                          CO-2024-001
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        flex: 1,
                        p: 1.2,
                        bgcolor: '#f3e5f5',
                        borderRadius: '6px',
                        border: '1px solid #ce93d8'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Typography sx={{ fontSize: 9 }}>🔢</Typography>
                          <Typography sx={{ 
                            fontSize: 9, 
                            color: '#7b1fa2',
                            fontWeight: 600
                          }}>
                            품번
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: 11, 
                          fontWeight: 600,
                          color: '#4a148c'
                        }}>
                          HL-2024-001
                        </Typography>
                      </Box>
                    </Box>

                    {/* 품명 - 풀 너비 */}
                    <Box sx={{ 
                      p: 1.5,
                      bgcolor: '#e8f5e8',
                      borderRadius: '8px',
                      border: '1px solid #a5d6a7'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography sx={{ fontSize: 9 }}>📦</Typography>
                        <Typography sx={{ 
                          fontSize: 10, 
                          color: '#2e7d32',
                          fontWeight: 600,
                          textTransform: 'uppercase'
                        }}>
                          품명
                        </Typography>
                      </Box>
                      <Typography sx={{ 
                        fontSize: 12, 
                        fontWeight: 700,
                        color: '#1b5e20'
                      }}>
                        HEAD LINING ASSY
                      </Typography>
                    </Box>

                    {/* 협력사/담당자 - 2열 */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{ 
                        flex: 1,
                        p: 1.2,
                        bgcolor: '#fff3e0',
                        borderRadius: '6px',
                        border: '1px solid #ffcc80'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Typography sx={{ fontSize: 9 }}>🏢</Typography>
                          <Typography sx={{ 
                            fontSize: 9, 
                            color: '#ef6c00',
                            fontWeight: 600
                          }}>
                            협력사
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: 11, 
                          fontWeight: 600,
                          color: '#e65100'
                        }}>
                          대리(주)
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        flex: 1,
                        p: 1.2,
                        bgcolor: '#fce4ec',
                        borderRadius: '6px',
                        border: '1px solid #f8bbd9'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Typography sx={{ fontSize: 9 }}>👤</Typography>
                          <Typography sx={{ 
                            fontSize: 9, 
                            color: '#c2185b',
                            fontWeight: 600
                          }}>
                            담당자
                          </Typography>
                        </Box>
                        <Typography sx={{ 
                          fontSize: 11, 
                          fontWeight: 600,
                          color: '#880e4f'
                        }}>
                          원장수
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {/* ⚠️ 오류 상태 (파싱 카드와 동일하게 간소화) */}
            {file.status === 'failed' && (
              <Box sx={{ p: 2.5, bgcolor: '#fff5f5', borderRadius: '12px', border: '1px solid #fee2e2' }}>
                <Typography sx={{ 
                  fontSize: 12, 
                  color: '#dc2626',
                  fontWeight: 600,
                  mb: 1.5
                }}>
                  오류 사유
                </Typography>
                <Typography sx={{ 
                  fontSize: 13, 
                  color: '#991b1b',
                  lineHeight: 1.4,
                  fontWeight: 500,
                  bgcolor: '#fee2e2',
                  p: 1.5,
                  borderRadius: '8px'
                }}>
                  Excel 파일 형식이 올바르지 않거나 데이터를 읽을 수 없습니다. 파일을 다시 확인해주세요.
                </Typography>
              </Box>
            )}


          </Box>

          {/* 🎯 Toss 스타일 버튼 영역 (파싱 카드와 동일) */}
          <Box sx={{ 
            p: 3, 
            pt: 2, 
            mt: 'auto',
            bgcolor: 'white',
            borderTop: '1px solid #f2f4f6'
          }}>
            {(file.status === 'complete' || file.status === 'analyzing') && (
              <Button 
                fullWidth 
                variant="contained" 
                onClick={() => { onClose(); onVerify(); }}
                sx={{ 
                  fontSize: 16, 
                  fontWeight: 700,
                  textTransform: 'none', 
                  bgcolor: '#0064ff',
                  borderRadius: '12px', 
                  py: 1.5,
                  boxShadow: 'none',
                  letterSpacing: '-0.3px',
                  '&:hover': { 
                    bgcolor: '#0056d3',
                    boxShadow: 'none'
                  } 
                }}
              >
                검증하기
              </Button>
            )}
            
            {file.status === 'extracting' && (
              <Button 
                fullWidth
                variant="outlined" 
                disabled 
                sx={{ 
                  fontSize: 16, 
                  fontWeight: 700,
                  textTransform: 'none', 
                  borderRadius: '12px',
                  py: 1.5,
                  borderColor: '#e5e8eb',
                  color: '#8b95a1'
                }}
              >
                처리중
              </Button>
            )}
            
            {file.status === 'failed' && (
              <Button 
                fullWidth
                variant="contained" 
                onClick={() => { onClose(); }}
                sx={{ 
                  fontSize: 16, 
                  fontWeight: 700,
                  textTransform: 'none', 
                  borderRadius: '12px',
                  py: 1.5,
                  bgcolor: '#ff5a5a',
                  boxShadow: 'none',
                  letterSpacing: '-0.3px',
                  '&:hover': { 
                    bgcolor: '#ff4444',
                    boxShadow: 'none'
                  }
                }}
              >
                오류 확인
              </Button>
            )}


          </Box>
        </Box>
      )}
    </Drawer>
  );
};

export default FileDetailDrawer;
