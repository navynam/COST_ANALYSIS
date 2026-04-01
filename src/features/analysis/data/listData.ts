import { C } from '../../../shared/constants/colors';
import type { ListGroup } from '../types';

export const listData: ListGroup[] = [
  {
    id: 'material', title: '재료비', icon: 'Ⅰ', iconBg: '#e8f4fd', iconColor: C.blue,
    items: [
      {
        id: 'substrate', name: 'SUBSTRATE (기재)', category: '원자재', spec: '1200×800×3T', unit: 'EA', qty: 1, unitPrice: '18,500', amount: '18,500', ratio: '24.1%', confidence: 95, status: 'normal',
        children: [
          { id: 'base', name: 'BASE MATERIAL', category: '원자재', spec: 'PP+GF30', unit: 'KG', qty: 2.4, unitPrice: '5,000', amount: '12,000', ratio: '15.6%', confidence: 94, status: 'normal' },
          { id: 'extrusion', name: '압출 성형', category: '가공비', spec: '', unit: '회', qty: 1, unitPrice: '6,500', amount: '6,500', ratio: '8.5%', confidence: 94, status: 'normal' },
        ],
      },
      { id: 'skin', name: 'SKIN (표피재)', category: '원자재', spec: 'PVC 0.8mm', unit: 'M²', qty: 1.2, unitPrice: '18,917', amount: '22,700', ratio: '29.6%', confidence: 75, status: 'anomaly' },
      { id: 'adhesive', name: 'ADHESIVE (접착제)', category: '원자재', spec: 'WATER BASE', unit: 'KG', qty: 0.5, unitPrice: '4,400', amount: '2,200', ratio: '2.9%', confidence: 98, status: 'normal' },
      { id: 'clip', name: 'CLIP', category: '부자재', spec: 'PA66', unit: 'EA', qty: 12, unitPrice: '75', amount: '900', ratio: '1.2%', confidence: 98, status: 'normal' },
      { id: 'packing', name: 'PACKING (포장재)', category: '부자재', spec: '골판지', unit: 'SET', qty: 1, unitPrice: '900', amount: '900', ratio: '1.2%', confidence: 98, status: 'normal' },
    ],
  },
  {
    id: 'processing', title: '가공비', icon: 'Ⅱ', iconBg: '#e8fde8', iconColor: C.green,
    items: [
      { id: 'press', name: '프레스 성형', category: '성형', spec: '', unit: '회', qty: 1, unitPrice: '8,500', amount: '8,500', ratio: '11.1%', confidence: 96, status: 'normal' },
      { id: 'bond', name: '접착 공정', category: '접착', spec: '', unit: '회', qty: 1, unitPrice: '6,200', amount: '6,200', ratio: '8.1%', confidence: 94, status: 'normal' },
      { id: 'trim', name: '트리밍', category: '후처리', spec: '', unit: '회', qty: 1, unitPrice: '5,400', amount: '5,400', ratio: '7.0%', confidence: 92, status: 'normal' },
      { id: 'inspect', name: '검사/포장', category: '검사', spec: '', unit: '회', qty: 1, unitPrice: '3,000', amount: '3,000', ratio: '3.9%', confidence: 90, status: 'normal' },
    ],
  },
  {
    id: 'overhead', title: '제경비', icon: 'Ⅲ', iconBg: '#fde8e8', iconColor: C.red,
    items: [
      { id: 'dep', name: '감가상각비', category: '감가상각', spec: '', unit: '', qty: '', unitPrice: '', amount: '3,200', ratio: '4.2%', confidence: 90, status: 'normal' },
      { id: 'elec', name: '전력비', category: '유틸리티', spec: '', unit: '', qty: '', unitPrice: '', amount: '2,800', ratio: '3.6%', confidence: 88, status: 'normal' },
      { id: 'etc', name: '기타 경비', category: '기타', spec: '', unit: '', qty: '', unitPrice: '', amount: '2,500', ratio: '3.3%', confidence: 72, status: 'anomaly' },
    ],
  },
];
