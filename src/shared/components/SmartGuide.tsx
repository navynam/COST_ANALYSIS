/**
 * 💡 스마트 가이드 시스템
 * 
 * Toss 스타일 상황별 도움말:
 * 1. 현재 상황에 맞는 스마트한 가이드
 * 2. 단계별 진행 상황 명확 표시
 * 3. 인터랙티브 툴팁 및 힌트
 * 4. 사용자 행동 기반 적응형 가이드
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Collapse,
  Chip,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Lightbulb as TipIcon,
  CheckCircle as CheckIcon,
  ArrowForward as NextIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

// 💡 가이드 단계 정의
interface GuideStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  tip?: string;
}

// 💡 페이지별 가이드 정의
interface PageGuide {
  title: string;
  subtitle: string;
  steps: GuideStep[];
  tips: string[];
  nextAction?: {
    label: string;
    path: string;
  };
}

// 💡 스마트 가이드 Props
interface SmartGuideProps {
  visible?: boolean;
  onDismiss?: () => void;
}

// 💡 스마트 가이드 컴포넌트
const SmartGuide: React.FC<SmartGuideProps> = ({
  visible = true,
  onDismiss
}) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // 💡 페이지별 가이드 데이터
  const getPageGuide = (): PageGuide | null => {
    const path = location.pathname;

    switch (path) {
      case '/parsing':
        return {
          title: '📋 견적서 파싱 단계',
          subtitle: 'Excel 파일을 업로드하여 자동 분석을 시작하세요',
          steps: [
            {
              id: 'upload',
              title: 'Excel 파일 업로드',
              description: '.xlsx 파일을 드래그하거나 클릭하여 업로드',
              completed: false,
              current: true,
              tip: '💡 여러 파일을 한 번에 업로드할 수 있어요!'
            },
            {
              id: 'parse',
              title: '자동 분석 실행',
              description: 'AI가 견적서 구조를 자동으로 분석',
              completed: false
            },
            {
              id: 'review',
              title: '결과 확인',
              description: '파싱 결과를 검토하고 다음 단계로 진행',
              completed: false
            }
          ],
          tips: [
            '🎯 Excel 파일의 헤더 행이 명확할수록 분석 정확도가 높아집니다',
            '🔍 파싱 후 "원본보기"로 결과를 확인해보세요',
            '⚡ 대용량 파일도 빠르게 처리됩니다'
          ],
          nextAction: {
            label: '검증 단계로 →',
            path: '/verification'
          }
        };

      case '/verification':
        return {
          title: '✅ 데이터 검증 단계',
          subtitle: '파싱 결과를 검토하고 필요시 수정하세요',
          steps: [
            {
              id: 'review',
              title: '파싱 결과 검토',
              description: '자동 분류된 항목들을 확인',
              completed: true
            },
            {
              id: 'correct',
              title: '오류 수정',
              description: '잘못 분류된 항목을 올바르게 수정',
              completed: false,
              current: true,
              tip: '💡 클릭하여 직접 수정할 수 있어요!'
            },
            {
              id: 'validate',
              title: '최종 검증',
              description: '모든 항목이 올바른지 최종 확인',
              completed: false
            }
          ],
          tips: [
            '🔧 드래그 앤 드롭으로 항목을 쉽게 재분류할 수 있습니다',
            '⚠️ 빨간색으로 표시된 항목은 검토가 필요한 부분입니다',
            '✨ 자주 사용하는 패턴은 자동으로 학습됩니다'
          ],
          nextAction: {
            label: '분석 단계로 →',
            path: '/analysis'
          }
        };

      case '/analysis':
        return {
          title: '📊 상세 분석 단계',
          subtitle: '검증된 데이터로 심층 분석을 수행하세요',
          steps: [
            {
              id: 'analyze',
              title: '자동 분석',
              description: '재료비, 가공비, 제경비 상세 분석',
              completed: false,
              current: true
            },
            {
              id: 'visualize',
              title: '시각화 확인',
              description: '차트와 그래프로 결과 확인',
              completed: false,
              tip: '💡 다양한 보기 모드를 활용해보세요!'
            },
            {
              id: 'export',
              title: '결과 내보내기',
              description: '분석 결과를 Excel로 다운로드',
              completed: false
            }
          ],
          tips: [
            '📄 "원본보기"로 실제 Excel 파일과 비교해보세요',
            '🎨 테마를 전환하여 다른 스타일로도 확인해보세요',
            '🔍 이상치가 발견되면 자동으로 강조 표시됩니다'
          ],
          nextAction: {
            label: '비교 단계로 →',
            path: '/comparison'
          }
        };

      case '/comparison':
        return {
          title: '🔄 견적서 비교 단계',
          subtitle: '여러 견적서를 비교하여 최적의 선택을 하세요',
          steps: [
            {
              id: 'select',
              title: '비교 대상 선택',
              description: '비교할 견적서들을 선택',
              completed: false,
              current: true
            },
            {
              id: 'compare',
              title: '비교 분석',
              description: '가격, 품질, 조건 등을 종합 비교',
              completed: false
            },
            {
              id: 'decide',
              title: '최종 결정',
              description: '분석 결과를 바탕으로 최적 선택',
              completed: false
            }
          ],
          tips: [
            '⚖️ 가격 외에도 품질, 납기 등을 종합적으로 고려하세요',
            '📈 트렌드 분석으로 시장 동향을 파악할 수 있습니다',
            '💾 비교 결과를 저장하여 나중에 참고하세요'
          ]
        };

      default:
        return null;
    }
  };

  const pageGuide = getPageGuide();
  
  // 💡 완료된 단계 계산
  const completedSteps = pageGuide?.steps.filter(step => step.completed).length || 0;
  const totalSteps = pageGuide?.steps.length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // 💡 가이드 닫기
  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
    // 페이지별로 가이드 숨김 상태 저장
    localStorage.setItem(`guide-dismissed-${location.pathname}`, 'true');
  };

  // 💡 페이지 변경 시 가이드 표시 상태 확인
  useEffect(() => {
    const isDismissed = localStorage.getItem(`guide-dismissed-${location.pathname}`) === 'true';
    setDismissed(isDismissed);
    setExpanded(true); // 새 페이지 진입 시 확장
  }, [location.pathname]);

  // 가이드가 없거나 숨김 처리된 경우
  if (!pageGuide || !visible || dismissed) {
    return null;
  }

  return (
    <Fade in timeout={500}>
      <Card
        sx={{
          position: 'sticky',
          top: 20,
          mb: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '1px solid rgba(0, 148, 255, 0.1)',
          borderLeft: '4px solid #0094FF',
          overflow: 'visible'
        }}
      >
        {/* 💡 헤더 */}
        <Box sx={{ p: 2, pb: expanded ? 1 : 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TipIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                {pageGuide.title}
              </Typography>
              <Chip
                label={`${completedSteps}/${totalSteps}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={expanded ? '접기' : '펼치기'}>
                <IconButton
                  size="small"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? <CollapseIcon /> : <ExpandIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="가이드 숨기기">
                <IconButton size="small" onClick={handleDismiss}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {pageGuide.subtitle}
          </Typography>

          {/* 💡 진행률 */}
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(0, 148, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #0094FF 0%, #00C851 100%)'
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {Math.round(progress)}% 완료
            </Typography>
          </Box>
        </Box>

        {/* 💡 상세 내용 */}
        <Collapse in={expanded}>
          <Box sx={{ px: 2, pb: 2 }}>
            {/* 💡 단계 스테퍼 */}
            <Stepper activeStep={pageGuide.steps.findIndex(step => step.current)} alternativeLabel sx={{ mb: 3 }}>
              {pageGuide.steps.map((step, index) => (
                <Step key={step.id} completed={step.completed}>
                  <StepLabel
                    StepIconComponent={({ active, completed }) => (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                          color: 'white',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          boxShadow: completed || active ? '0 2px 8px rgba(0, 148, 255, 0.3)' : 'none'
                        }}
                      >
                        {completed ? <CheckIcon sx={{ fontSize: 20 }} /> : index + 1}
                      </Box>
                    )}
                  >
                    <Typography variant="caption" fontWeight={step.current ? 600 : 400}>
                      {step.title}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* 💡 현재 단계 상세 */}
            {pageGuide.steps.map((step) => (
              step.current && (
                <Alert
                  key={step.id}
                  severity="info"
                  icon={<InfoIcon />}
                  sx={{ mb: 2 }}
                  action={
                    step.action && (
                      <Button
                        size="small"
                        onClick={step.action.onClick}
                        endIcon={<NextIcon />}
                      >
                        {step.action.label}
                      </Button>
                    )
                  }
                >
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body2">
                    {step.description}
                  </Typography>
                  {step.tip && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      {step.tip}
                    </Typography>
                  )}
                </Alert>
              )
            ))}

            {/* 💡 팁 섹션 */}
            {pageGuide.tips.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  💡 유용한 팁
                </Typography>
                {pageGuide.tips.map((tip, index) => (
                  <Typography
                    key={index}
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ mb: 0.5, lineHeight: 1.4 }}
                  >
                    {tip}
                  </Typography>
                ))}
              </Box>
            )}

            {/* 💡 다음 액션 */}
            {pageGuide.nextAction && progress === 100 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  endIcon={<NextIcon />}
                  onClick={() => window.location.hash = pageGuide.nextAction!.path}
                >
                  {pageGuide.nextAction.label}
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </Card>
    </Fade>
  );
};

export default SmartGuide;