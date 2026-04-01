/**
 * 📊 실시간 진행률 추적기
 * 
 * Toss 스타일 진행 상황 표시:
 * 1. 실시간 업로드/처리 진행률
 * 2. 단계별 완료 상태 시각화
 * 3. 예상 완료 시간 표시
 * 4. 에러 발생 시 친근한 안내
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Button,
  CircularProgress,
  Chip,
  Fade,
  Collapse
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Schedule as ClockIcon,
  Refresh as RetryIcon,
  TrendingUp as ProgressIcon
} from '@mui/icons-material';

// 📊 진행 단계 타입
interface ProgressStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'warning';
  progress?: number;
  estimatedTime?: number;
  errorMessage?: string;
}

// 📊 진행률 추적기 Props
interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStep: number;
  overallProgress: number;
  estimatedTimeRemaining?: number;
  onRetry?: (stepId: string) => void;
  onSkip?: (stepId: string) => void;
  title?: string;
  description?: string;
}

// 📊 진행률 추적기 컴포넌트
const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStep,
  overallProgress,
  estimatedTimeRemaining,
  onRetry,
  onSkip,
  title = "처리 중...",
  description = "잠시만 기다려주세요."
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // 📊 부드러운 진행률 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(overallProgress);
    }, 100);
    return () => clearTimeout(timer);
  }, [overallProgress]);

  // 📊 현재 단계 정보
  const currentStepData = steps[currentStep];
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const hasErrors = steps.some(step => step.status === 'error');
  const hasWarnings = steps.some(step => step.status === 'warning');

  // 📊 예상 시간 포맷
  const formatEstimatedTime = (seconds?: number) => {
    if (!seconds) return '';
    if (seconds < 60) return `약 ${seconds}초`;
    const minutes = Math.ceil(seconds / 60);
    return `약 ${minutes}분`;
  };

  // 📊 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'error': return 'error';
      case 'warning': return 'warning';
      default: return 'grey';
    }
  };

  return (
    <Card 
      sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        border: '1px solid rgba(0, 148, 255, 0.1)',
        borderLeft: '4px solid #0094FF'
      }}
    >
      {/* 📊 헤더 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress 
            size={24} 
            color={hasErrors ? 'error' : 'primary'} 
            sx={{ 
              display: overallProgress === 100 ? 'none' : 'block' 
            }}
          />
          {overallProgress === 100 && (
            <CheckIcon color="success" sx={{ fontSize: 28 }} />
          )}
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {overallProgress === 100 ? '완료!' : title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {overallProgress === 100 ? '모든 처리가 완료되었습니다.' : description}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {Math.round(animatedProgress)}%
          </Typography>
          {estimatedTimeRemaining && overallProgress < 100 && (
            <Typography variant="caption" color="text.secondary">
              <ClockIcon sx={{ fontSize: 12, mr: 0.5 }} />
              {formatEstimatedTime(estimatedTimeRemaining)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* 📊 전체 진행률 바 */}
      <Box sx={{ mb: 3 }}>
        <LinearProgress
          variant="determinate"
          value={animatedProgress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0, 148, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: hasErrors 
                ? 'linear-gradient(90deg, #FF6B6B 0%, #FF8E8E 100%)'
                : 'linear-gradient(90deg, #0094FF 0%, #00C851 100%)'
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {completedSteps}/{steps.length} 단계 완료
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(animatedProgress)}%
          </Typography>
        </Box>
      </Box>

      {/* 📊 상태 요약 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Chip
          size="small"
          label={`완료: ${completedSteps}`}
          color="success"
          variant="outlined"
          icon={<CheckIcon />}
        />
        {hasErrors && (
          <Chip
            size="small"
            label="오류 발생"
            color="error"
            variant="outlined"
            icon={<ErrorIcon />}
          />
        )}
        {hasWarnings && (
          <Chip
            size="small"
            label="주의 필요"
            color="warning"
            variant="outlined"
            icon={<WarningIcon />}
          />
        )}
        {overallProgress < 100 && (
          <Chip
            size="small"
            label="진행 중"
            color="primary"
            variant="outlined"
            icon={<ProgressIcon />}
          />
        )}
      </Box>

      {/* 📊 상세 단계 표시 */}
      <Button
        size="small"
        onClick={() => setShowDetails(!showDetails)}
        sx={{ mb: 2 }}
      >
        {showDetails ? '간단히 보기' : '상세 단계 보기'}
      </Button>

      <Collapse in={showDetails}>
        <Stepper orientation="vertical" activeStep={currentStep}>
          {steps.map((step, index) => (
            <Step key={step.id}>
              <StepLabel
                StepIconComponent={({ active, completed }) => {
                  if (step.status === 'error') {
                    return <ErrorIcon color="error" />;
                  }
                  if (step.status === 'warning') {
                    return <WarningIcon color="warning" />;
                  }
                  if (step.status === 'completed') {
                    return <CheckIcon color="success" />;
                  }
                  if (step.status === 'in-progress') {
                    return <CircularProgress size={20} />;
                  }
                  return (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: 'grey.300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'white'
                      }}
                    >
                      {index + 1}
                    </Box>
                  );
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  {step.label}
                </Typography>
              </StepLabel>
              <Box sx={{ pb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
                
                {/* 개별 단계 진행률 */}
                {step.status === 'in-progress' && step.progress !== undefined && (
                  <LinearProgress
                    variant="determinate"
                    value={step.progress}
                    sx={{ mt: 1, height: 4, borderRadius: 2 }}
                  />
                )}

                {/* 에러 메시지 */}
                {step.status === 'error' && step.errorMessage && (
                  <Alert 
                    severity="error" 
                    sx={{ mt: 1 }}
                    action={
                      onRetry && (
                        <Button
                          size="small"
                          onClick={() => onRetry(step.id)}
                          startIcon={<RetryIcon />}
                        >
                          다시 시도
                        </Button>
                      )
                    }
                  >
                    {step.errorMessage}
                  </Alert>
                )}

                {/* 예상 시간 */}
                {step.status === 'in-progress' && step.estimatedTime && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    <ClockIcon sx={{ fontSize: 12, mr: 0.5 }} />
                    {formatEstimatedTime(step.estimatedTime)}
                  </Typography>
                )}
              </Box>
            </Step>
          ))}
        </Stepper>
      </Collapse>

      {/* 📊 완료 시 다음 액션 */}
      {overallProgress === 100 && !hasErrors && (
        <Fade in timeout={500}>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              🎉 처리가 완료되었습니다!
            </Typography>
            <Typography variant="body2">
              이제 다음 단계로 진행하거나 결과를 확인하실 수 있습니다.
            </Typography>
          </Alert>
        </Fade>
      )}
    </Card>
  );
};

export default ProgressTracker;