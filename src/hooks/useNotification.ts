/**
 * @fileoverview 알림/토스트 훅
 * @description 스낵바 알림 표시를 위한 상태 관리 훅
 */
import { useState, useCallback } from 'react';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

interface UseNotificationReturn extends NotificationState {
  /** 성공 알림 표시 */
  showSuccess: (message: string) => void;
  /** 에러 알림 표시 */
  showError: (message: string) => void;
  /** 경고 알림 표시 */
  showWarning: (message: string) => void;
  /** 정보 알림 표시 */
  showInfo: (message: string) => void;
  /** 알림 닫기 */
  close: () => void;
}

/**
 * 스낵바 알림 상태를 관리하는 커스텀 훅
 * @example
 * const notify = useNotification();
 * notify.showSuccess('저장되었습니다.');
 * <Snackbar open={notify.open} onClose={notify.close} ... />
 */
function useNotification(): UseNotificationReturn {
  const [state, setState] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const show = useCallback((message: string, severity: NotificationState['severity']) => {
    setState({ open: true, message, severity });
  }, []);

  const showSuccess = useCallback((msg: string) => show(msg, 'success'), [show]);
  const showError = useCallback((msg: string) => show(msg, 'error'), [show]);
  const showWarning = useCallback((msg: string) => show(msg, 'warning'), [show]);
  const showInfo = useCallback((msg: string) => show(msg, 'info'), [show]);

  const close = useCallback(() => {
    setState(prev => ({ ...prev, open: false }));
  }, []);

  return { ...state, showSuccess, showError, showWarning, showInfo, close };
}

export default useNotification;
