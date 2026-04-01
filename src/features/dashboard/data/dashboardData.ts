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

export const recentItems = [
  { id: 1, filename: 'HEAD_LINING_원가계산서.xlsx', company: '대한(주)', status: '검증', items: 24, materialCost: 45200, processCost: 23100, overheadCost: 8500, totalCost: 76800, date: '2026-02-21', anomalies: 2 },
  { id: 2, filename: 'DOOR_TRIM_견적서.xlsx', company: '현대부품(주)', status: '검증', items: 18, materialCost: 38500, processCost: 19200, overheadCost: 6300, totalCost: 64000, date: '2026-02-19', anomalies: 0 },
  { id: 3, filename: 'CONSOLE_BOX_원가명세.xlsx', company: '모비스파츠', status: '추출', items: 0, materialCost: 0, processCost: 0, overheadCost: 0, totalCost: 0, date: '2026-02-19', anomalies: 0 },
  { id: 4, filename: 'BUMPER_ASSY_Q4견적.xlsx', company: '현대플라스틱', status: '분석', items: 32, materialCost: 52300, processCost: 28400, overheadCost: 9200, totalCost: 89900, date: '2026-02-15', anomalies: 0 },
  { id: 5, filename: 'SEAT_COVER_원가분석.xlsx', company: '현대시트', status: '실패', items: 0, materialCost: 0, processCost: 0, overheadCost: 0, totalCost: 0, date: '2026-02-16', anomalies: 0 },
  { id: 6, filename: 'AIRBAG_MODULE_견적.xlsx', company: '현대모비스', status: '추출', items: 0, materialCost: 0, processCost: 0, overheadCost: 0, totalCost: 0, date: '2026-02-14', anomalies: 0 },
  { id: 7, filename: 'LAMP_ASSY_분석.xlsx', company: '현대IHL', status: '분석', items: 28, materialCost: 41200, processCost: 22300, overheadCost: 7800, totalCost: 71300, date: '2026-02-13', anomalies: 1 },
];

export const statusColorMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  '검증': 'success', '추출': 'info', '분석': 'warning', '실패': 'error',
};

const getWorkStatusCounts = () => {
  const counts = { '추출': 0, '검증': 0, '분석': 0, '실패': 0 };
  recentItems.forEach(item => {
    if (counts.hasOwnProperty(item.status)) {
      counts[item.status as keyof typeof counts]++;
    }
  });
  return counts;
};

export const workItems = [
  { status: '추출', label: '추출 대기', count: getWorkStatusCounts()['추출'], icon: '⏳', color: '#ff9500', filter: 'extracting' },
  { status: '검증', label: '검증 대기', count: getWorkStatusCounts()['검증'], icon: '✅', color: '#34c759', filter: 'complete' },
  { status: '분석', label: '분석 대기', count: getWorkStatusCounts()['분석'], icon: '📊', color: '#af52de', filter: 'analyzing' },
  { status: '실패', label: '처리 실패', count: getWorkStatusCounts()['실패'], icon: '❌', color: '#ff3b30', filter: 'failed' },
];

export const summaryCards = [
  { label: '총 견적서', value: `${summaryData.totalEstimates}건`, icon: '📄', color: '#e60012' },
  { label: '검증 완료율', value: `${summaryData.verificationRate}%`, icon: '✅', color: '#0056a6' },
  { label: '이상치 발견', value: `${summaryData.anomalies}건`, icon: '⚠️', color: '#0070d4' },
  { label: '평균 생산원가', value: `₩${summaryData.averageCost}천`, icon: '💰', color: '#2196f3' },
];
