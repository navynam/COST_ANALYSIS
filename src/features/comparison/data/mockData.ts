import type { Product, Quotation, CompRow } from '../types';

export const mockProducts: Product[] = [
  { id: '99919-AAA00', name: 'DUCT ASSY-SD A/VENT, LH', material: 'PP+TD20', quotationCount: 3 },
  { id: '86541-BBB00', name: 'BRACKET-FENDER MTG, RH', material: 'SPHC-P', quotationCount: 2 },
  { id: '91911-CCC00', name: 'COVER-RELAY BOX, UPR', material: 'PP+GF30', quotationCount: 4 },
  { id: '83301-DDD00', name: 'HEAD LINING', material: 'PP FELT', quotationCount: 3 },
  { id: '82310-EEE00', name: 'DOOR TRIM LH', material: 'PP+TD20', quotationCount: 2 },
  { id: '86511-FFF00', name: 'BUMPER ASSY FR', material: 'PP+EPDM', quotationCount: 5 },
  { id: '84611-GGG00', name: 'CONSOLE BOX', material: 'ABS', quotationCount: 3 },
  { id: '88100-HHH00', name: 'SEAT COVER FR', material: 'PVC LEATHER', quotationCount: 2 },
  { id: '87220-III00', name: 'GARNISH-ROOF, CTR', material: 'ABS+PC', quotationCount: 4 },
  { id: '84710-JJJ00', name: 'PANEL-INSTRUMENT', material: 'PP+TD20', quotationCount: 3 },
  { id: '86350-KKK00', name: 'GRILLE-RADIATOR', material: 'ABS+GF15', quotationCount: 2 },
  { id: '87210-LLL00', name: 'SPOILER-REAR', material: 'PP+GF20', quotationCount: 3 },
  { id: '82130-MMM00', name: 'WEATHERSTRIP-DOOR', material: 'EPDM', quotationCount: 2 },
  { id: '87710-NNN00', name: 'MOLDING-SIDE', material: 'PVC', quotationCount: 3 },
  { id: '92410-OOO00', name: 'LAMP ASSY-RR COMB', material: 'PC+ABS', quotationCount: 4 },
  { id: '86130-PPP00', name: 'FENDER ASSY FR, LH', material: 'STEEL', quotationCount: 2 },
  { id: '71101-QQQ00', name: 'HOOD ASSY', material: 'ALUMINIUM', quotationCount: 3 },
  { id: '83110-RRR00', name: 'ROOF PANEL', material: 'STEEL', quotationCount: 2 },
];

export const mockQuotations: Record<string, Quotation[]> = {
  '99919-AAA00': [
    { id: 'q1', vendor: '한국ITW', date: '2021.07', label: '한국ITW 2021.07' },
    { id: 'q2', vendor: '한국ITW', date: '2020.12', label: '한국ITW 2020.12' },
    { id: 'q3', vendor: 'B업체', date: '2021.03', label: 'B업체 2021.03' },
  ],
  '86541-BBB00': [
    { id: 'q4', vendor: 'C업체', date: '2021.05', label: 'C업체 2021.05' },
    { id: 'q5', vendor: 'D업체', date: '2021.01', label: 'D업체 2021.01' },
  ],
  '91911-CCC00': [
    { id: 'q6', vendor: 'E업체', date: '2021.06', label: 'E업체 2021.06' },
    { id: 'q7', vendor: 'F업체', date: '2021.04', label: 'F업체 2021.04' },
    { id: 'q8', vendor: 'G업체', date: '2020.11', label: 'G업체 2020.11' },
    { id: 'q9', vendor: 'H업체', date: '2021.02', label: 'H업체 2021.02' },
  ],
};

export const mockCompData: CompRow[] = [
  { item: '원재료', values: { q1: 967, q2: 940, q3: 1020 } },
  { item: 'Masterbatch', values: { q1: 90, q2: 88, q3: 95 } },
  { item: '재료비 소계', isSubtotal: true, values: { q1: 1057, q2: 1028, q3: 1115 } },
  { item: '노무비', values: { q1: 850, q2: 820, q3: 780 } },
  { item: '경비', values: { q1: 620, q2: 590, q3: 650 } },
  { item: '가공비 소계', isSubtotal: true, values: { q1: 1470, q2: 1410, q3: 1430 } },
  { item: '제조원가', isSubtotal: true, values: { q1: 2527, q2: 2438, q3: 2545 } },
  { item: '일반관리비', values: { q1: 253, q2: 244, q3: 255 } },
  { item: '이윤', values: { q1: 380, q2: 360, q3: 370 } },
  { item: '총원가', isSubtotal: true, values: { q1: 3160, q2: 3042, q3: 3170 } },
];

export const mockMaterialChanges: { part: string; values: Record<string, string>; changed: boolean }[] = [
  { part: '본체', values: { q1: 'PP+TD20', q2: 'PP+TD20', q3: 'PP+TD20' }, changed: false },
  { part: '브라켓', values: { q1: 'SPHC-P', q2: 'SPHC-P', q3: 'SPCC' }, changed: true },
  { part: '클립', values: { q1: 'POM', q2: 'POM', q3: 'PA66' }, changed: true },
];

export const fmt = (n: number) => n.toLocaleString('ko-KR');

export const getHeatColor = (val: number, min: number, max: number) => {
  if (max === min) return 'transparent';
  const ratio = (val - min) / (max - min);
  if (ratio < 0.33) return 'rgba(33,150,243,0.12)';
  if (ratio > 0.66) return 'rgba(244,67,54,0.12)';
  return 'transparent';
};
