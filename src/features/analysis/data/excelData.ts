interface ExcelCol {
  text: string;
  colSpan?: number;
  bold?: boolean;
  align?: 'center' | 'left' | 'right';
  bg?: string;
  color?: string;
}

export interface ExcelRow {
  cols: ExcelCol[];
}

export const excelData: ExcelRow[] = [
  { cols: [{ text: '원 가 계 산 서', colSpan: 7, bold: true, align: 'center', bg: '#fff' }] },
  { cols: [
    { text: 'E.O. NO.', bg: '#e8f4fd', bold: true }, { text: 'EO-2024-1201', colSpan: 2 }, { text: '' },
    { text: '품번', bg: '#e8f4fd', bold: true }, { text: 'HL-2024-001', colSpan: 2 },
  ]},
  { cols: [
    { text: '품명', bg: '#e8f4fd', bold: true }, { text: 'HEAD LINING', colSpan: 2 }, { text: '' },
    { text: '협력사', bg: '#e8f4fd', bold: true }, { text: '대한(주)', colSpan: 2 },
  ]},
  { cols: [
    { text: '구분', bg: '#4472C4', color: '#fff', bold: true },
    { text: '품명', bg: '#4472C4', color: '#fff', bold: true },
    { text: '규격', bg: '#4472C4', color: '#fff', bold: true },
    { text: '단위', bg: '#4472C4', color: '#fff', bold: true },
    { text: '수량', bg: '#4472C4', color: '#fff', bold: true },
    { text: '단가', bg: '#4472C4', color: '#fff', bold: true },
    { text: '금액', bg: '#4472C4', color: '#fff', bold: true },
  ]},
  { cols: [{ text: '원자재' }, { text: 'SUBSTRATE (기재)' }, { text: '1200×800×3T' }, { text: 'EA' }, { text: '1' }, { text: '18,500', bg: '#d4edda' }, { text: '18,500', bg: '#d4edda' }] },
  { cols: [{ text: '원자재' }, { text: 'SKIN (표피재)' }, { text: 'PVC 0.8mm' }, { text: 'M²' }, { text: '1.2' }, { text: '18,917', bg: '#f8d7da' }, { text: '22,700', bg: '#f8d7da' }] },
  { cols: [{ text: '원자재' }, { text: 'ADHESIVE (접착제)' }, { text: 'WATER BASE' }, { text: 'KG' }, { text: '0.5' }, { text: '4,400', bg: '#d4edda' }, { text: '2,200', bg: '#d4edda' }] },
  { cols: [{ text: '부자재' }, { text: 'CLIP' }, { text: 'PA66' }, { text: 'EA' }, { text: '12' }, { text: '75', bg: '#d4edda' }, { text: '900', bg: '#d4edda' }] },
  { cols: [{ text: '부자재' }, { text: 'PACKING (포장재)' }, { text: '골판지' }, { text: 'SET' }, { text: '1' }, { text: '900', bg: '#d4edda' }, { text: '900', bg: '#d4edda' }] },
  { cols: [{ text: '성형' }, { text: '프레스 성형' }, { text: '' }, { text: '회' }, { text: '1' }, { text: '8,500', bg: '#d4edda' }, { text: '8,500', bg: '#d4edda' }] },
  { cols: [{ text: '접착' }, { text: '접착 공정' }, { text: '' }, { text: '회' }, { text: '1' }, { text: '6,200', bg: '#d4edda' }, { text: '6,200', bg: '#d4edda' }] },
  { cols: [{ text: '후처리' }, { text: '트리밍' }, { text: '' }, { text: '회' }, { text: '1' }, { text: '5,400', bg: '#d4edda' }, { text: '5,400', bg: '#d4edda' }] },
  { cols: [{ text: '검사' }, { text: '검사/포장' }, { text: '' }, { text: '회' }, { text: '1' }, { text: '3,000', bg: '#d4edda' }, { text: '3,000', bg: '#d4edda' }] },
  { cols: [{ text: '감가상각' }, { text: '감가상각비' }, { text: '' }, { text: '' }, { text: '' }, { text: '', bg: '#d4edda' }, { text: '3,200', bg: '#d4edda' }] },
  { cols: [{ text: '유틸리티' }, { text: '전력비' }, { text: '' }, { text: '' }, { text: '' }, { text: '', bg: '#d4edda' }, { text: '2,800', bg: '#d4edda' }] },
  { cols: [{ text: '기타' }, { text: '기타 경비' }, { text: '' }, { text: '' }, { text: '' }, { text: '', bg: '#f8d7da' }, { text: '2,500', bg: '#f8d7da' }] },
  { cols: [{ text: '합계', bold: true, bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '', bg: '#e8f4fd' }, { text: '₩76,800', bold: true, bg: '#e8f4fd' }] },
];
