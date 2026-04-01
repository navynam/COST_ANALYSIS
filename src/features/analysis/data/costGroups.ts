import { C } from '../../../shared/constants/colors';
import type { CostGroup } from '../types';

export const costGroups: CostGroup[] = [
  {
    id: 'material', icon: 'Ⅰ', iconBg: '#e8f4fd', iconColor: C.blue,
    title: '재료비', totalAmount: '₩45,200', totalPct: '58.9%', anomalyCount: 1,
    secondColHeader: '구분',
    rows: [
      { level: 'L0', category: '원자재', name: 'SUBSTRATE (기재)', spec: '1200×800×3T', unit: 'EA', qty: 1, unitPrice: '18,500', amount: '18,500', ratio: '24.1%', confidence: 95, status: 'normal', hasSub: true },
      { level: 'L1', category: '원자재', name: '└ BASE MATERIAL', spec: 'PP+GF30', unit: 'KG', qty: 2.4, unitPrice: '5,000', amount: '12,000', ratio: '15.6%', confidence: 94, status: 'normal' },
      { level: 'L1', category: '가공비', name: '└ 압출 성형', spec: '', unit: '회', qty: 1, unitPrice: '6,500', amount: '6,500', ratio: '8.5%', confidence: 94, status: 'normal' },
      { level: 'L0', category: '원자재', name: 'SKIN (표피재) ⚠️', spec: 'PVC 0.8mm', unit: 'M²', qty: 1.2, unitPrice: '18,917', amount: '22,700', ratio: '29.6%', confidence: 75, status: 'anomaly', editable: true, anomalyReason: '과거 3개 분기 평균 단가 ₩14,200 대비 +33.2% 높음. 동일 규격(PVC 0.8mm) 시장가 범위: ₩13,500~₩16,800. 현재 단가가 상한을 초과합니다.' },
      { level: 'L0', category: '원자재', name: 'ADHESIVE (접착제)', spec: 'WATER BASE', unit: 'KG', qty: 0.5, unitPrice: '4,400', amount: '2,200', ratio: '2.9%', confidence: 98, status: 'normal' },
      { level: 'L0', category: '부자재', name: 'CLIP', spec: 'PA66', unit: 'EA', qty: 12, unitPrice: '75', amount: '900', ratio: '1.2%', confidence: 98, status: 'normal' },
      { level: 'L0', category: '부자재', name: 'PACKING (포장재)', spec: '골판지', unit: 'SET', qty: 1, unitPrice: '900', amount: '900', ratio: '1.2%', confidence: 98, status: 'normal' },
    ],
  },
  {
    id: 'processing', icon: 'Ⅱ', iconBg: '#e8fde8', iconColor: C.green,
    title: '가공비', totalAmount: '₩23,100', totalPct: '30.1%', anomalyCount: 0,
    secondColHeader: '공정',
    rows: [
      { level: 'L0', category: '성형', name: '프레스 성형', spec: '', unit: '회', qty: 1, unitPrice: '8,500', amount: '8,500', ratio: '11.1%', confidence: 96, status: 'normal' },
      { level: 'L0', category: '접착', name: '접착 공정', spec: '', unit: '회', qty: 1, unitPrice: '6,200', amount: '6,200', ratio: '8.1%', confidence: 94, status: 'normal' },
      { level: 'L0', category: '후처리', name: '트리밍', spec: '', unit: '회', qty: 1, unitPrice: '5,400', amount: '5,400', ratio: '7.0%', confidence: 92, status: 'normal' },
      { level: 'L0', category: '검사', name: '검사/포장', spec: '', unit: '회', qty: 1, unitPrice: '3,000', amount: '3,000', ratio: '3.9%', confidence: 90, status: 'normal' },
    ],
  },
  {
    id: 'overhead', icon: 'Ⅲ', iconBg: '#fde8e8', iconColor: C.red,
    title: '제경비', totalAmount: '₩8,500', totalPct: '11.1%', anomalyCount: 1,
    secondColHeader: '구분',
    rows: [
      { level: 'L0', category: '감가상각', name: '감가상각비', spec: '', unit: '', qty: '', unitPrice: '', amount: '3,200', ratio: '4.2%', confidence: 90, status: 'normal' },
      { level: 'L0', category: '유틸리티', name: '전력비', spec: '', unit: '', qty: '', unitPrice: '', amount: '2,800', ratio: '3.6%', confidence: 88, status: 'normal' },
      { level: 'L0', category: '기타', name: '기타 경비 ⚠️', spec: '', unit: '', qty: '', unitPrice: '', amount: '2,500', ratio: '3.3%', confidence: 72, status: 'anomaly', editable: true, anomalyReason: '기타 경비가 전체 제경비의 29.4%를 차지하고 있어 일반적 범위(10~20%)를 초과합니다. 세부 내역 확인이 필요합니다.' },
    ],
  },
];

export const summaryRows = [
  { label: 'Ⅰ. 재료비', amount: '₩45,200', pct: '58.9%', barWidth: 58.9, barColor: C.blue, anomalies: 1 },
  { label: 'Ⅱ. 가공비', amount: '₩23,100', pct: '30.1%', barWidth: 30.1, barColor: C.green, anomalies: 0 },
  { label: 'Ⅲ. 제경비', amount: '₩8,500', pct: '11.1%', barWidth: 11.1, barColor: C.orange, anomalies: 1 },
];
