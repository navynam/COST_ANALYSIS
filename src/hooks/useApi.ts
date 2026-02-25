/**
 * @fileoverview 공통 API 호출 훅
 * @description 로딩, 에러, 데이터 상태를 자동 관리하는 범용 API 호출 래퍼
 */
import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

interface UseApiReturn<T> extends UseApiState<T> {
  /** API 함수를 실행하고 상태를 자동 관리 */
  execute: (...args: any[]) => Promise<T | null>;
  /** 에러 상태 초기화 */
  clearError: () => void;
}

/**
 * API 호출 상태를 자동 관리하는 커스텀 훅
 * @param apiFunc - 실행할 API 함수 (Promise 반환)
 * @example
 * const { data, loading, error, execute } = useApi(parsingAPI.getEstimates);
 * useEffect(() => { execute({ page: 1 }); }, []);
 */
function useApi<T = any>(apiFunc: (...args: any[]) => Promise<{ data: T }>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: '',
  });

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const response = await apiFunc(...args);
      setState({ data: response.data, loading: false, error: '' });
      return response.data;
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || '요청에 실패했습니다.';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return null;
    }
  }, [apiFunc]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: '' }));
  }, []);

  return { ...state, execute, clearError };
}

export default useApi;
