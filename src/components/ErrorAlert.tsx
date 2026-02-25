/**
 * @fileoverview 에러 알림 컴포넌트
 * @description API 오류, 유효성 검사 실패 등에 사용되는 공통 에러 표시
 */
import React from 'react';
import { Alert, AlertProps } from '@mui/material';

interface ErrorAlertProps {
  /** 에러 메시지 (비어있으면 렌더링하지 않음) */
  message: string;
  /** 심각도 */
  severity?: AlertProps['severity'];
  /** 닫기 핸들러 (있으면 닫기 버튼 표시) */
  onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  severity = 'error',
  onClose,
}) => {
  if (!message) return null;

  return (
    <Alert
      severity={severity}
      onClose={onClose}
      sx={{ mb: 2, borderRadius: 2 }}
    >
      {message}
    </Alert>
  );
};

export default ErrorAlert;
