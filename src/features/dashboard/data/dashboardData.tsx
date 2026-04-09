import React from 'react';
import {
  NotificationImportant, SkipNext, Upload, AccessAlarm, Search,
  Lightbulb, Biotech, BarChart, Cancel, CheckCircle, Description,
  Warning, AttachMoney,
} from '@mui/icons-material';
import { initialFiles } from '../../parsing/data/mockData';

export const summaryData = {
  totalEstimates: 47,
  verificationRate: 80.9,
  anomalies: 7,
  averageCost: 76.8,
};

export const verificationStatus = [
  { name: '통과', value: 68, color: '#4caf50' },
  { name: '경고', value: 20, color: '#ff9800' },
  { name: '오류', value: 12, color: '#f44336' },
];

export const actionAlerts = [
  {
    id: 1,
    icon: <NotificationImportant sx={{ fontSize: 'inherit' }} />,
    priority: '긴급',
    priorityColor: 'error' as const,
    title: '이상치 감지 — 즉시 검토 필요',
    filename: 'HEAD_LINING_원가계산서.xlsx',
    company: '대한(주)',
    description: '재료비 항목 2건에서 시장가 대비 33% 초과 이상치 발생',
    action: '분석 검토',
    route: '/analysis',
    time: '10분 전',
    category: 'anomaly',
  },
  {
    id: 2,
    icon: <SkipNext sx={{ fontSize: 'inherit' }} />,
    priority: '주의',
    priorityColor: 'warning' as const,
    title: '분석 대기 — 검증 완료 파일',
    filename: 'DOOR_TRIM_견적서.xlsx',
    company: '현대부품(주)',
    description: '검증이 완료되었습니다. 원가 분석을 시작하세요.',
    action: '분석 시작',
    route: '/analysis',
    time: '1시간 전',
    category: 'next-step',
  },
  {
    id: 3,
    icon: <Upload sx={{ fontSize: 'inherit' }} />,
    priority: '정보',
    priorityColor: 'info' as const,
    title: 'ERP 등록 대기 — 분석 완료',
    filename: 'BUMPER_ASSY_Q4견적.xlsx',
    company: '현대플라스틱',
    description: '원가 분석이 완료되었습니다. ERP 시스템에 데이터를 등록하세요.',
    action: 'ERP 등록',
    route: '/parsing_card',
    time: '어제',
    category: 'erp-ready',
  },
  {
    id: 4,
    icon: <AccessAlarm sx={{ fontSize: 'inherit' }} />,
    priority: '주의',
    priorityColor: 'warning' as const,
    title: '처리 지연 — 파싱 오류 발생',
    filename: 'SEAT_COVER_원가분석.xlsx',
    company: '현대시트',
    description: '파일 파싱 중 오류가 발생하여 3일째 대기 중입니다.',
    action: '재처리',
    route: '/parsing_card',
    time: '3일 전',
    category: 'delayed',
  },
  {
    id: 5,
    icon: <Search sx={{ fontSize: 'inherit' }} />,
    priority: '정보',
    priorityColor: 'info' as const,
    title: '자동 검증 진행 중',
    filename: 'CONSOLE_BOX_원가명세.xlsx',
    company: '모비스파츠',
    description: '파싱 완료 후 자동 검증 프로세스가 진행 중입니다.',
    action: '상태 확인',
    route: '/parsing_card',
    time: '30분 전',
    category: 'in-progress',
  },
  {
    id: 6,
    icon: <Lightbulb sx={{ fontSize: 'inherit' }} />,
    priority: '정보',
    priorityColor: 'info' as const,
    title: '인사이트 리포트 준비 완료',
    filename: 'DOOR_TRIM_견적서.xlsx',
    company: '현대부품(주)',
    description: '원가 절감 포인트 3건이 발견되었습니다. 인사이트를 확인하세요.',
    action: '인사이트 보기',
    route: '/analysis',
    time: '2시간 전',
    category: 'insight',
  },
];

export const statusColorMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  '추출중': 'info', '검증중': 'info', '검증완료': 'success',
  '분석중': 'warning', '분석완료': 'success', '실패': 'error',
};

const getCounts = () => {
  const c: Record<string, number> = {
    verifying: 0, verified: 0,
    inAnalysis: 0, analyzed: 0, failed: 0,
  };
  initialFiles.forEach(f => { if (f.status in c) c[f.status]++; });
  return c;
};

export const workItems = (() => {
  const c = getCounts();
  return [
    { status: 'verifying',   label: '검증중',   count: c.verifying,   icon: <Search sx={{ fontSize: 'inherit' }} />, color: '#3B82F6', filter: 'verifying'   },
    { status: 'verified',    label: '검증완료', count: c.verified,    icon: <CheckCircle sx={{ fontSize: 'inherit' }} />, color: '#0D9488', filter: 'verified'    },
    { status: 'inAnalysis',  label: '분석중',   count: c.inAnalysis,  icon: <Biotech sx={{ fontSize: 'inherit' }} />, color: '#6366F1', filter: 'inAnalysis'  },
    { status: 'analyzed',    label: '분석완료', count: c.analyzed,    icon: <BarChart sx={{ fontSize: 'inherit' }} />, color: '#10B981', filter: 'analyzed'    },
    { status: 'failed',      label: '실패',     count: c.failed,      icon: <Cancel sx={{ fontSize: 'inherit' }} />, color: '#EF4444', filter: 'failed'      },
  ];
})();

export const summaryCards = [
  { label: '총 견적서', value: `${summaryData.totalEstimates}건`, icon: <Description sx={{ fontSize: 'inherit' }} />, color: '#e60012' },
  { label: '검증 완료율', value: `${summaryData.verificationRate}%`, icon: <CheckCircle sx={{ fontSize: 'inherit' }} />, color: '#0056a6' },
  { label: '이상치 발견', value: `${summaryData.anomalies}건`, icon: <Warning sx={{ fontSize: 'inherit' }} />, color: '#0070d4' },
  { label: '평균 생산원가', value: `₩${summaryData.averageCost}천`, icon: <AttachMoney sx={{ fontSize: 'inherit' }} />, color: '#2196f3' },
];
