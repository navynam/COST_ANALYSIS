/**
 * ✅ 스마트 검증 시스템
 * 
 * Toss 스타일 에러 방지:
 * 1. 실시간 입력 검증
 * 2. 친근한 에러 메시지
 * 3. 자동 수정 제안
 * 4. 단계적 가이드
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Typography,
  Button,
  Chip,
  Collapse,
  TextField,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tooltip,
  Card,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  AutoFixHigh as FixIcon,
  Lightbulb as TipIcon,
  Close as CloseIcon,
  ThumbUp as GoodIcon,
  ThumbDown as BadIcon
} from '@mui/icons-material';

// ✅ 검증 규칙 타입
interface ValidationRule {
  id: string;
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  message: string;
  suggestion?: string;
  autoFix?: () => any;
  severity: 'error' | 'warning' | 'info';
}

// ✅ 검증 결과 타입
interface ValidationResult {
  field: string;
  isValid: boolean;
  message: string;
  suggestion?: string;
  autoFix?: () => any;
  severity: 'error' | 'warning' | 'info';
}

// ✅ 스마트 검증 Props
interface SmartValidationProps {
  data: Record<string, any>;
  rules: ValidationRule[];
  onValidationChange?: (results: ValidationResult[]) => void;
  onAutoFix?: (field: string, value: any) => void;
  showSuggestions?: boolean;
}

// ✅ 스마트 검증 컴포넌트
const SmartValidation: React.FC<SmartValidationProps> = ({
  data,
  rules,
  onValidationChange,
  onAutoFix,
  showSuggestions = true
}) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  // ✅ 실시간 검증 실행
  useEffect(() => {
    const results: ValidationResult[] = [];

    rules.forEach(rule => {
      const value = data[rule.field];
      let isValid = true;
      let message = '';
      let suggestion = rule.suggestion;
      let autoFix = rule.autoFix;

      switch (rule.type) {
        case 'required':
          isValid = value !== undefined && value !== null && value !== '';
          if (!isValid) {
            message = `${rule.field}은(는) 필수 입력 항목입니다.`;
            suggestion = '이 정보가 없으면 정확한 분석이 어려워요. 입력해주세요!';
          }
          break;

        case 'format':
          if (value) {
            // 이메일 형식 검증 예시
            if (rule.field.toLowerCase().includes('email')) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              isValid = emailRegex.test(value);
              if (!isValid) {
                message = '올바른 이메일 형식을 입력해주세요.';
                suggestion = '예시: example@company.com';
              }
            }
            // 숫자 형식 검증 예시
            else if (rule.field.toLowerCase().includes('amount') || rule.field.toLowerCase().includes('price')) {
              isValid = !isNaN(Number(value)) && Number(value) >= 0;
              if (!isValid) {
                message = '올바른 금액을 입력해주세요.';
                suggestion = '숫자만 입력하거나 천 단위 구분자(,)를 사용하세요.';
                autoFix = () => {
                  const numericValue = value.toString().replace(/[^0-9.]/g, '');
                  return Number(numericValue);
                };
              }
            }
          }
          break;

        case 'range':
          if (value !== undefined && value !== null) {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
              // 금액 범위 검증 (예시)
              if (numValue < 0) {
                isValid = false;
                message = '금액은 0보다 커야 합니다.';
                suggestion = '음수 값은 입력할 수 없어요. 양수로 입력해주세요.';
                autoFix = () => Math.abs(numValue);
              } else if (numValue > 10000000000) { // 100억 초과
                isValid = false;
                message = '금액이 너무 큽니다.';
                suggestion = '100억 이하의 현실적인 금액을 입력해주세요.';
              }
            }
          }
          break;

        case 'custom':
          // 커스텀 검증 로직은 rule에서 정의
          break;
      }

      if (!isValid || rule.severity !== 'error') {
        results.push({
          field: rule.field,
          isValid,
          message: message || rule.message,
          suggestion,
          autoFix,
          severity: rule.severity
        });
      }
    });

    setValidationResults(results);
    onValidationChange?.(results);
  }, [data, rules, onValidationChange]);

  // ✅ 자동 수정 실행
  const handleAutoFix = (result: ValidationResult) => {
    if (result.autoFix && onAutoFix) {
      const fixedValue = result.autoFix();
      onAutoFix(result.field, fixedValue);
    }
  };

  // ✅ 제안 무시
  const dismissSuggestion = (field: string) => {
    setDismissedSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.add(field);
      return newSet;
    });
  };

  // ✅ 통계 계산
  const errorCount = validationResults.filter(r => r.severity === 'error' && !r.isValid).length;
  const warningCount = validationResults.filter(r => r.severity === 'warning').length;
  const infoCount = validationResults.filter(r => r.severity === 'info').length;

  // 모든 검증 통과 시 표시하지 않음
  if (validationResults.length === 0 || (errorCount === 0 && warningCount === 0 && showSuggestions === false)) {
    return null;
  }

  return (
    <Card 
      sx={{ 
        mb: 2, 
        border: errorCount > 0 ? '1px solid #FF6B6B' : warningCount > 0 ? '1px solid #FFB800' : '1px solid #0094FF',
        borderLeft: errorCount > 0 ? '4px solid #FF6B6B' : warningCount > 0 ? '4px solid #FFB800' : '4px solid #0094FF'
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* ✅ 헤더 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {errorCount > 0 ? (
              <ErrorIcon color="error" />
            ) : warningCount > 0 ? (
              <WarningIcon color="warning" />
            ) : (
              <InfoIcon color="info" />
            )}
            <Typography variant="h6" fontWeight={600}>
              {errorCount > 0 ? '입력을 확인해주세요' : 
               warningCount > 0 ? '권장사항이 있어요' : 
               '도움말'}
            </Typography>
          </Box>

          {/* ✅ 상태 칩 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {errorCount > 0 && (
              <Chip 
                size="small" 
                label={`오류 ${errorCount}`} 
                color="error" 
                icon={<ErrorIcon />}
              />
            )}
            {warningCount > 0 && (
              <Chip 
                size="small" 
                label={`주의 ${warningCount}`} 
                color="warning" 
                icon={<WarningIcon />}
              />
            )}
            {infoCount > 0 && (
              <Chip 
                size="small" 
                label={`팁 ${infoCount}`} 
                color="info" 
                icon={<TipIcon />}
              />
            )}
          </Box>
        </Box>

        {/* ✅ 요약 메시지 */}
        <Alert 
          severity={errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'info'}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" fontWeight={600}>
            {errorCount > 0 ? (
              `${errorCount}개의 필수 항목을 확인해주세요. 정확한 분석을 위해 필요해요!`
            ) : warningCount > 0 ? (
              `${warningCount}개의 개선 제안이 있어요. 더 나은 결과를 위해 참고해보세요!`
            ) : (
              '모든 검증을 통과했어요! 🎉'
            )}
          </Typography>
        </Alert>

        {/* ✅ 상세 검증 결과 */}
        <List dense>
          {validationResults
            .filter(result => !dismissedSuggestions.has(result.field))
            .slice(0, showDetails ? undefined : 3)
            .map((result, index) => (
            <ListItem 
              key={`${result.field}-${index}`}
              sx={{ 
                borderRadius: 2, 
                mb: 1, 
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: result.severity === 'error' ? 'error.light' : 
                            result.severity === 'warning' ? 'warning.light' : 'info.light'
              }}
            >
              <ListItemIcon>
                {result.severity === 'error' ? (
                  <ErrorIcon color="error" />
                ) : result.severity === 'warning' ? (
                  <WarningIcon color="warning" />
                ) : (
                  <InfoIcon color="info" />
                )}
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    {result.message}
                  </Typography>
                }
                secondary={
                  result.suggestion && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      💡 {result.suggestion}
                    </Typography>
                  )
                }
              />

              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {/* 자동 수정 버튼 */}
                  {result.autoFix && (
                    <Tooltip title="자동 수정">
                      <IconButton
                        size="small"
                        onClick={() => handleAutoFix(result)}
                        color="primary"
                      >
                        <FixIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  {/* 무시 버튼 */}
                  <Tooltip title="이 제안 무시">
                    <IconButton
                      size="small"
                      onClick={() => dismissSuggestion(result.field)}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {/* ✅ 더보기 버튼 */}
        {validationResults.length > 3 && (
          <Button
            size="small"
            onClick={() => setShowDetails(!showDetails)}
            sx={{ mt: 1 }}
          >
            {showDetails ? '간단히 보기' : `전체 보기 (+${validationResults.length - 3})`}
          </Button>
        )}

        {/* ✅ 피드백 */}
        {errorCount === 0 && warningCount === 0 && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              ✨ 완벽해요! 모든 검증을 통과했습니다.
            </Typography>
            <Typography variant="body2">
              이제 자신 있게 다음 단계로 진행하세요!
            </Typography>
          </Alert>
        )}
      </Box>
    </Card>
  );
};

export default SmartValidation;