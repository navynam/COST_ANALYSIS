import React from 'react';
import {
  Box, Typography, IconButton, Button, LinearProgress, Drawer, Chip,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import FluentIcon from '../../../shared/components/FluentIcon';
import type { FileItem } from '../types';

interface FileDetailDrawerProps {
  file: FileItem | null;
  onClose: () => void;
  onVerify: () => void;
  onAnalysis?: () => void;
}

const FileDetailDrawer: React.FC<FileDetailDrawerProps> = ({ file, onClose, onVerify, onAnalysis }) => {
  // 상태별 설정 (파싱 카드와 동일)
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'extracting':
        return { color: '#F59E0B', icon: <FluentIcon name="schedule" size={16} />, label: '추출중(자동)', bgColor: '#FEF3C7' };
      case 'verifying':
        return { color: '#3B82F6', icon: <FluentIcon name="schedule" size={16} />, label: '추출완료', bgColor: '#DBEAFE' };
      case 'verified':
        return { color: '#0D9488', icon: <FluentIcon name="check" size={16} />, label: '검증대기', bgColor: '#CCFBF1' };
      case 'analyzing':
        return { color: '#8B5CF6', icon: <FluentIcon name="schedule" size={16} />, label: '검증중(자동)', bgColor: '#EDE9FE' };
      case 'inAnalysis':
        return { color: '#6366F1', icon: <FluentIcon name="check" size={16} />, label: '검증중', bgColor: '#E0E7FF' };
      case 'analyzed':
        return { color: '#10B981', icon: <FluentIcon name="check" size={16} />, label: '검증완료', bgColor: '#D1FAE5' };
      case 'failed':
        return { color: '#EF4444', icon: <FluentIcon name="error" size={16} />, label: '실패', bgColor: '#FEE2E2' };
      default:
        return { color: '#9e9e9e', icon: <FluentIcon name="schedule" size={16} />, label: '알 수 없음', bgColor: '#f5f5f5' };
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
                  <FluentIcon name="folder" size={14} style={{ marginRight: 4 }} />{file.fileSize || '0 Bytes'}
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
                  <FluentIcon name="calendar" size={14} style={{ marginRight: 4 }} />{file.uploadDate}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 0.5 }}>
                <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
                  <FluentIcon name="person" size={14} style={{ marginRight: 4 }} />{file.uploader || '김남중'}
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#8b95a1', fontWeight: 500 }}>
                  <FluentIcon name="building" size={14} style={{ marginRight: 4 }} />{file.department || '개발팀'}
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
                  <FluentIcon name="barchart" size={14} style={{ marginRight: 4 }} />데이터 추출 중
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

            {/* ✅ 추출/분석 완료 상태 — 3개 섹션 독립 분리 */}
            {(file.status === 'verifying' || file.status === 'verified' || file.status === 'analyzing' || file.status === 'inAnalysis' || file.status === 'analyzed') && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* ── 섹션 1: 추출/분석 완료 요약 ── */}
                <Box sx={{ p: 2.5, bgcolor: `${statusConf.color}08`, borderRadius: '12px', border: `1px solid ${statusConf.color}30` }}>
                  <Typography sx={{
                    fontSize: 13,
                    color: statusConf.color,
                    fontWeight: 700,
                    mb: 2,
                    textAlign: 'center',
                    letterSpacing: '-0.2px'
                  }}>
                    {(file.status === 'inAnalysis' || file.status === 'analyzed') ? <><FluentIcon name="barchart" size={14} style={{ marginRight: 4 }} />검증 완료</> : <><FluentIcon name="star" size={14} style={{ marginRight: 4 }} />추출 완료</>}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color: statusConf.color, lineHeight: 1 }}>
                        {file.parsedItems || 156}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 500, mt: 0.5 }}>
                        {(file.status === 'inAnalysis' || file.status === 'analyzed') ? '검증 항목' : '파싱 항목'}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '1px', bgcolor: `${statusConf.color}25` }} />
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#00c896', lineHeight: 1 }}>
                        {(file.parsedItems && file.anomalies)
                          ? Math.round(((file.parsedItems - file.anomalies) / file.parsedItems) * 100)
                          : 94}%
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 500, mt: 0.5 }}>
                        신뢰도
                      </Typography>
                    </Box>
                    <Box sx={{ width: '1px', bgcolor: `${statusConf.color}25` }} />
                    <Box sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography sx={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: file.anomalies && file.anomalies > 0 ? '#ff5a5a' : '#8b95a1',
                        lineHeight: 1
                      }}>
                        {file.anomalies || 3}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: '#6b7280', fontWeight: 500, mt: 0.5 }}>
                        이상치
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* ── 섹션 2: 추출된 카테고리 ── */}
                <Box sx={{ p: 2.5, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <Typography sx={{
                    fontSize: 12,
                    color: '#374151',
                    fontWeight: 700,
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <FluentIcon name="clipboard" size={14} style={{ marginRight: 4 }} />추출된 카테고리
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label="재료비 (4건)"
                      size="small"
                      sx={{
                        fontSize: 11,
                        height: 24,
                        bgcolor: '#dbeafe',
                        color: '#1d4ed8',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                    <Chip
                      label="가공비 (3건)"
                      size="small"
                      sx={{
                        fontSize: 11,
                        height: 24,
                        bgcolor: '#fef3c7',
                        color: '#d97706',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                    <Chip
                      label="경비 (2건)"
                      size="small"
                      sx={{
                        fontSize: 11,
                        height: 24,
                        bgcolor: '#dcfce7',
                        color: '#059669',
                        fontWeight: 600,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Box>
                </Box>

                {/* ── 섹션 3: 파일 정보 ── */}
                <Box sx={{ p: 2.5, bgcolor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <Typography sx={{
                    fontSize: 12,
                    color: '#374151',
                    fontWeight: 700,
                    mb: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <FluentIcon name="document" size={14} style={{ marginRight: 4 }} />파일 정보
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {/* 파일명 */}
                    <Box sx={{
                      p: 1.5,
                      bgcolor: '#fffbeb',
                      borderRadius: '8px',
                      border: '1px solid #fde68a',
                      borderLeft: '4px solid #f59e0b'
                    }}>
                      <Typography sx={{ fontSize: 10, color: '#92400e', fontWeight: 600, mb: 0.5 }}>
                        <FluentIcon name="folder" size={14} style={{ marginRight: 4 }} />파일명
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', wordBreak: 'break-all' }}>
                        {file?.name || 'DOOR_TRIM.xlsx'}
                      </Typography>
                    </Box>

                    {/* C.O. NO. / 품번 */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{
                        flex: 1, p: 1.2,
                        bgcolor: '#eff6ff',
                        borderRadius: '8px',
                        border: '1px solid #bfdbfe'
                      }}>
                        <Typography sx={{ fontSize: 10, color: '#1e40af', fontWeight: 600, mb: 0.5 }}>
                          <FluentIcon name="clipboard" size={14} style={{ marginRight: 4 }} />C.O. NO.
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#1e3a8a' }}>
                          CO-2024-001
                        </Typography>
                      </Box>
                      <Box sx={{
                        flex: 1, p: 1.2,
                        bgcolor: '#faf5ff',
                        borderRadius: '8px',
                        border: '1px solid #e9d5ff'
                      }}>
                        <Typography sx={{ fontSize: 10, color: '#6b21a8', fontWeight: 600, mb: 0.5 }}>
                          # 품번
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#4c1d95' }}>
                          HL-2024-001
                        </Typography>
                      </Box>
                    </Box>

                    {/* 품명 */}
                    <Box sx={{
                      p: 1.5,
                      bgcolor: '#f0fdf4',
                      borderRadius: '8px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <Typography sx={{ fontSize: 10, color: '#166534', fontWeight: 600, mb: 0.5 }}>
                        <FluentIcon name="clipboard" size={14} style={{ marginRight: 4 }} />품명
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#14532d' }}>
                        HEAD LINING ASSY
                      </Typography>
                    </Box>

                    {/* 협력사 / 담당자 */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Box sx={{
                        flex: 1, p: 1.2,
                        bgcolor: '#fff7ed',
                        borderRadius: '8px',
                        border: '1px solid #fed7aa'
                      }}>
                        <Typography sx={{ fontSize: 10, color: '#9a3412', fontWeight: 600, mb: 0.5 }}>
                          <FluentIcon name="building" size={14} style={{ marginRight: 4 }} />협력사
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#7c2d12' }}>
                          대리(주)
                        </Typography>
                      </Box>
                      <Box sx={{
                        flex: 1, p: 1.2,
                        bgcolor: '#fdf2f8',
                        borderRadius: '8px',
                        border: '1px solid #f9a8d4'
                      }}>
                        <Typography sx={{ fontSize: 10, color: '#9d174d', fontWeight: 600, mb: 0.5 }}>
                          <FluentIcon name="person" size={14} style={{ marginRight: 4 }} />담당자
                        </Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#831843' }}>
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
            {/* 추출중(자동) — 비활성 */}
            {file.status === 'extracting' && (
              <Button fullWidth variant="outlined" disabled
                sx={{ fontSize: 16, fontWeight: 700, textTransform: 'none', borderRadius: '12px', py: 1.5, borderColor: '#FDE68A', color: '#F59E0B' }}>
                추출 진행중...
              </Button>
            )}

            {/* 추출완료 — 검토하기 */}
            {file.status === 'verifying' && (
              <Button fullWidth variant="contained" onClick={() => { onClose(); onVerify(); }}
                sx={{ fontSize: 16, fontWeight: 700, textTransform: 'none', borderRadius: '12px', py: 1.5, boxShadow: 'none', bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB', boxShadow: 'none' } }}>
                검토하기
              </Button>
            )}

            {/* 검증대기 — 검증하기 */}
            {file.status === 'verified' && (
              <Button fullWidth variant="contained" onClick={() => { onClose(); onAnalysis ? onAnalysis() : onVerify(); }}
                sx={{ fontSize: 16, fontWeight: 700, textTransform: 'none', borderRadius: '12px', py: 1.5, boxShadow: 'none', bgcolor: '#0D9488', '&:hover': { bgcolor: '#0F766E', boxShadow: 'none' } }}>
                검증하기
              </Button>
            )}

            {/* 검증중(자동) — 비활성 */}
            {file.status === 'analyzing' && (
              <Button fullWidth variant="outlined" disabled
                sx={{ fontSize: 16, fontWeight: 700, textTransform: 'none', borderRadius: '12px', py: 1.5, borderColor: '#C4B5FD', color: '#8B5CF6' }}>
                검증 진행중...
              </Button>
            )}

            {/* 검증중 — 검증 상세보기 */}
            {file.status === 'inAnalysis' && (
              <Button fullWidth variant="contained" onClick={() => { onClose(); onAnalysis ? onAnalysis() : onVerify(); }}
                sx={{ fontSize: 16, fontWeight: 700, textTransform: 'none', borderRadius: '12px', py: 1.5, boxShadow: 'none', bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5', boxShadow: 'none' } }}>
                검증 상세보기
              </Button>
            )}

            {/* 검증완료 — 검증 결과 보기 */}
            {file.status === 'analyzed' && (
              <Button fullWidth variant="contained" onClick={() => { onClose(); onAnalysis ? onAnalysis() : onVerify(); }}
                sx={{ fontSize: 16, fontWeight: 700, textTransform: 'none', borderRadius: '12px', py: 1.5, boxShadow: 'none', bgcolor: '#10B981', '&:hover': { bgcolor: '#059669', boxShadow: 'none' } }}>
                검증 결과 보기
              </Button>
            )}

            {/* 실패 — 오류 확인 */}
            {file.status === 'failed' && (
              <Button fullWidth variant="contained" onClick={() => { onClose(); }}
                sx={{ fontSize: 16, fontWeight: 700, textTransform: 'none', borderRadius: '12px', py: 1.5, boxShadow: 'none', bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626', boxShadow: 'none' } }}>
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
