/**
 * 🎯 사용자 온보딩 투어 시스템
 * 
 * Toss 스타일 사용자 친화적 가이드:
 * 1. 단계별 인터랙티브 투어
 * 2. 처음 사용자를 위한 친근한 안내
 * 3. 스킵 가능한 선택적 가이드
 * 4. 시각적으로 매력적인 오버레이
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  Paper,
  Typography,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Backdrop,
  Fade,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Lightbulb as TipIcon,
  PlayArrow as StartIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

// 🎯 온보딩 단계 정의
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: string;
  target?: string; // CSS 셀렉터로 하이라이트할 요소
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    label: string;
    onClick: () => void;
  };
}

// 🎯 온보딩 Props
interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
  steps: OnboardingStep[];
}

// 🎯 온보딩 투어 컴포넌트
const OnboardingTour: React.FC<OnboardingTourProps> = ({
  open,
  onClose,
  onComplete,
  steps
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 🎯 다음 단계
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  // 🎯 이전 단계
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 🎯 투어 완료
  const handleComplete = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    onComplete?.();
    onClose();
    
    // 로컬 스토리지에 투어 완료 표시
    localStorage.setItem('onboarding-completed', 'true');
  };

  // 🎯 투어 시작
  const handleStart = () => {
    setIsPlaying(true);
    setCurrentStep(0);
  };

  // 🎯 진행률 계산
  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'visible',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
        }
      }}
    >
      {/* 🎯 헤더 */}
      <Box sx={{ p: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TipIcon color="primary" />
            <Typography variant="h5" fontWeight={700}>
              {isPlaying ? '사용 가이드' : '시작하기'}
            </Typography>
            <Chip 
              label={`${currentStep + 1}/${steps.length}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 🎯 진행률 */}
        {isPlaying && (
          <Box sx={{ mb: 2 }}>
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
        )}

        {/* 🎯 단계 표시 */}
        {isPlaying && (
          <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 2 }}>
            {steps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}
                    >
                      {completed ? <CheckIcon sx={{ fontSize: 16 }} /> : index + 1}
                    </Box>
                  )}
                >
                  {step.title}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
      </Box>

      {/* 🎯 메인 콘텐츠 */}
      <Box sx={{ px: 3, pb: 3 }}>
        {!isPlaying ? (
          // 🎯 시작 화면
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
                boxShadow: '0 8px 24px rgba(0, 148, 255, 0.3)'
              }}
            >
              <StartIcon sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            
            <Typography variant="h6" fontWeight={600} gutterBottom>
              견적서 분석 시스템 투어 🚀
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              처음 사용하시나요? 간단한 가이드로 주요 기능들을 
              친근하게 소개해드릴게요!
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ minWidth: 100 }}
              >
                건너뛰기
              </Button>
              <Button
                variant="contained"
                onClick={handleStart}
                startIcon={<StartIcon />}
                sx={{ minWidth: 120 }}
              >
                투어 시작
              </Button>
            </Box>
          </Box>
        ) : (
          // 🎯 투어 진행 화면
          <Box>
            {/* 🎯 현재 단계 내용 */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                bgcolor: 'rgba(0, 148, 255, 0.05)',
                border: '1px solid rgba(0, 148, 255, 0.1)',
                borderRadius: 3
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {currentStepData?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {currentStepData?.description}
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {currentStepData?.content}
              </Typography>

              {/* 🎯 액션 버튼 (있는 경우) */}
              {currentStepData?.action && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={currentStepData.action.onClick}
                  sx={{ mt: 2 }}
                >
                  {currentStepData.action.label}
                </Button>
              )}
            </Paper>

            {/* 🎯 네비게이션 버튼 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={handlePrev}
                disabled={currentStep === 0}
                startIcon={<PrevIcon />}
              >
                이전
              </Button>

              <Typography variant="body2" color="text.secondary">
                {currentStep + 1} / {steps.length}
              </Typography>

              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={currentStep === steps.length - 1 ? <CheckIcon /> : <NextIcon />}
              >
                {currentStep === steps.length - 1 ? '완료' : '다음'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

// 🎯 기본 온보딩 단계들
export const defaultOnboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '환영합니다! 👋',
    description: '견적서 분석 시스템의 주요 기능을 소개합니다',
    content: '이 시스템은 Excel 견적서를 업로드하여 자동으로 분석하고 비교할 수 있는 도구입니다. 복잡한 견적서도 몇 번의 클릭만으로 쉽게 처리할 수 있어요!'
  },
  {
    id: 'parsing',
    title: '📋 1단계: 파싱',
    description: 'Excel 파일 업로드 및 자동 분석',
    content: '먼저 Excel 견적서 파일을 업로드합니다. 시스템이 자동으로 파일을 분석하여 재료비, 가공비, 제경비를 구분해드려요.'
  },
  {
    id: 'verification',
    title: '✅ 2단계: 검증',
    description: '파싱 결과 확인 및 수정',
    content: '자동 분석 결과를 확인하고 필요시 수정할 수 있습니다. 각 항목이 올바르게 분류되었는지 검토해보세요.'
  },
  {
    id: 'analysis',
    title: '📊 3단계: 분석',
    description: '상세 분석 및 원본 확인',
    content: '분석된 데이터를 다양한 관점에서 살펴볼 수 있습니다. "원본보기" 버튼으로 실제 Excel 파일도 확인 가능해요!'
  },
  {
    id: 'comparison',
    title: '🔄 4단계: 비교',
    description: '여러 견적서 비교 분석',
    content: '마지막으로 여러 견적서를 비교하여 최적의 선택을 도와드립니다. 가격, 품질, 조건 등을 종합적으로 검토하세요.'
  },
  {
    id: 'theme',
    title: '🎨 테마 선택',
    description: '원하는 디자인으로 변경',
    content: '우상단의 테마 스위처로 현대모비스 테마와 Toss 스타일 테마를 자유롭게 전환할 수 있습니다. 취향에 맞게 선택해보세요!'
  }
];

export default OnboardingTour;