/**
 * Handsontable 기반 Excel 원본 뷰어
 *
 * - xlsx 파일을 SheetJS로 파싱 → Handsontable에 렌더링
 * - 다중 시트 탭 지원
 * - 셀 클릭/이동/하이라이트 완전 제어
 * - 읽기 전용 (원본 보존)
 * - 병합 셀, 열 너비, 행 높이 반영
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.min.css';
import * as XLSX from 'xlsx';
import { Box, Tabs, Tab, Typography, CircularProgress } from '@mui/material';

// ── 타입 ──

interface SheetInfo {
  name: string;
  data: (string | number | null)[][];
  merges: { row: number; col: number; rowspan: number; colspan: number }[];
  colWidths: number[];
  rowHeights: number[];
}

interface HotExcelViewerProps {
  /** Excel 파일 URL 또는 File 객체 */
  file?: File | null;
  fileUrl?: string;
  /** 외부 하이라이트 셀 (예: 'C15') */
  highlightedCell?: string | null;
  /** 셀 클릭 콜백 */
  onCellClick?: (cellRef: string, value: string, formula?: string) => void;
  /** 높이 (기본: 100%) */
  height?: string | number;
  /** 읽기 전용 */
  readOnly?: boolean;
}

// ── 유틸 ──

const colLetter = (col: number): string => {
  let s = '';
  let c = col + 1;
  while (c > 0) { c--; s = String.fromCharCode(65 + (c % 26)) + s; c = Math.floor(c / 26); }
  return s;
};

const parseCellRef = (ref: string): { row: number; col: number } | null => {
  const m = ref.match(/^([A-Z]+)(\d+)$/);
  if (!m) return null;
  let col = 0;
  for (let i = 0; i < m[1].length; i++) col = col * 26 + m[1].charCodeAt(i) - 64;
  return { row: parseInt(m[2]) - 1, col: col - 1 };
};

// ── xlsx 파싱 ──

const parseWorkbook = (buffer: ArrayBuffer): { sheets: SheetInfo[]; formulas: Record<string, Record<string, string>> } => {
  const wb = XLSX.read(buffer, { cellStyles: true, cellFormula: true, cellNF: true });
  const formulas: Record<string, Record<string, string>> = {};

  const sheets: SheetInfo[] = wb.SheetNames.map(name => {
    const ws = wb.Sheets[name];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const rowCount = range.e.r + 1;
    const colCount = range.e.c + 1;

    // 데이터 + 수식 추출
    const data: (string | number | null)[][] = [];
    const sheetFormulas: Record<string, string> = {};

    for (let r = 0; r < rowCount; r++) {
      const row: (string | number | null)[] = [];
      for (let c = 0; c < colCount; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr] as XLSX.CellObject | undefined;
        if (cell) {
          // formatted value 우선, 없으면 raw value
          row.push(cell.w !== undefined ? cell.w : (cell.v !== undefined ? cell.v as string | number : null));
          // 수식 저장
          if (cell.f) sheetFormulas[addr] = `=${cell.f}`;
        } else {
          row.push(null);
        }
      }
      data.push(row);
    }
    formulas[name] = sheetFormulas;

    // 병합 셀
    const merges = (ws['!merges'] || []).map(m => ({
      row: m.s.r, col: m.s.c,
      rowspan: m.e.r - m.s.r + 1,
      colspan: m.e.c - m.s.c + 1,
    }));

    // 열 너비
    const colInfo = ws['!cols'] || [];
    const colWidths: number[] = [];
    for (let c = 0; c < colCount; c++) {
      const ci = colInfo[c];
      if (ci && ci.wpx) colWidths.push(Math.round(ci.wpx));
      else if (ci && ci.wch) colWidths.push(Math.round(ci.wch * 7.5));
      else colWidths.push(80);
    }

    // 행 높이
    const rowInfo = ws['!rows'] || [];
    const rowHeights: number[] = [];
    for (let r = 0; r < rowCount; r++) {
      const ri = rowInfo[r];
      if (ri && ri.hpx) rowHeights.push(Math.round(ri.hpx));
      else if (ri && ri.hpt) rowHeights.push(Math.round(ri.hpt * 1.333));
      else rowHeights.push(23);
    }

    return { name, data, merges, colWidths, rowHeights };
  });

  return { sheets, formulas };
};

// ── 하이라이트 CSS ──
const HIGHLIGHT_CSS = `
  .cell-highlight {
    background-color: #FFF3CD !important;
    outline: 2px solid #F59E0B !important;
    outline-offset: -2px;
  }
  .cell-selected-external {
    background-color: #E8F0FE !important;
    outline: 2px solid #1565C0 !important;
    outline-offset: -2px;
  }
`;

// ── 컴포넌트 ──

const HotExcelViewer: React.FC<HotExcelViewerProps> = ({
  file, fileUrl, highlightedCell, onCellClick, height = '100%', readOnly = true,
}) => {
  const hotRef = useRef<any>(null);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [formulas, setFormulas] = useState<Record<string, Record<string, string>>>({});
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<string>('');
  const [formulaBarText, setFormulaBarText] = useState('');
  const [prevHighlightCell, setPrevHighlightCell] = useState<{ row: number; col: number } | null>(null);

  // ── Excel 파일 로드 ──
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let buffer: ArrayBuffer;
        if (file) {
          buffer = await file.arrayBuffer();
        } else {
          const url = fileUrl || `${process.env.PUBLIC_URL}/sample_excel/sample_data.xlsx`;
          const res = await fetch(url);
          buffer = await res.arrayBuffer();
        }
        const result = parseWorkbook(buffer);
        setSheets(result.sheets);
        setFormulas(result.formulas);
        setActiveSheet(0);
      } catch (e) {
        console.error('Excel 로드 실패:', e);
      }
      setLoading(false);
    };
    load();
  }, [file, fileUrl]);

  // ── 하이라이트 셀 변경 시 이동 ──
  useEffect(() => {
    if (!highlightedCell || !hotRef.current?.hotInstance) return;
    const pos = parseCellRef(highlightedCell);
    if (!pos) return;

    const hot = hotRef.current.hotInstance;

    // 이전 하이라이트 제거
    if (prevHighlightCell) {
      hot.setCellMeta(prevHighlightCell.row, prevHighlightCell.col, 'className', '');
    }

    // 새 하이라이트 적용
    hot.setCellMeta(pos.row, pos.col, 'className', 'cell-highlight');
    hot.scrollViewportTo(pos.row, pos.col);
    hot.render();

    setPrevHighlightCell(pos);
  }, [highlightedCell]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 셀 클릭 핸들러 ──
  const handleAfterSelection = useCallback((row: number, col: number) => {
    const ref = `${colLetter(col)}${row + 1}`;
    setSelectedCell(ref);

    const sheet = sheets[activeSheet];
    if (!sheet) return;

    // 수식 바 텍스트
    const sheetFormulas = formulas[sheet.name] || {};
    const formula = sheetFormulas[ref];
    const value = sheet.data[row]?.[col];
    setFormulaBarText(formula || (value !== null && value !== undefined ? String(value) : ''));

    onCellClick?.(ref, value !== null && value !== undefined ? String(value) : '', formula);
  }, [sheets, activeSheet, formulas, onCellClick]);

  // ── 현재 시트 ──
  const currentSheet = sheets[activeSheet];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1 }}>
        <CircularProgress size={24} />
        <Typography sx={{ fontSize: 13, color: '#888' }}>Excel 데이터를 불러오는 중...</Typography>
      </Box>
    );
  }

  if (!currentSheet) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height, width: '100%' }}>
      {/* CSS 삽입 */}
      <style>{HIGHLIGHT_CSS}</style>

      {/* ── 수식 바 ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center',
        borderBottom: '1px solid #C0C0C0',
        bgcolor: '#FAFAFA', flexShrink: 0, height: 28, minHeight: 28,
      }}>
        <Box sx={{
          width: 80, minWidth: 80, px: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRight: '1px solid #C0C0C0', bgcolor: '#F0F0F0', height: '100%',
        }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#333', fontFamily: 'Consolas, monospace' }}>
            {selectedCell}
          </Typography>
        </Box>
        <Box sx={{ flex: 1, px: 1.5, display: 'flex', alignItems: 'center', height: '100%', overflow: 'hidden' }}>
          <Typography sx={{ fontSize: 12, color: '#333', fontFamily: 'Consolas, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formulaBarText.startsWith('=') ? (
              <>
                <Typography component="span" sx={{ fontSize: 12, color: '#1565C0', fontFamily: 'inherit', fontWeight: 700, mr: 0.5 }}>fx</Typography>
                {formulaBarText}
              </>
            ) : formulaBarText || (
              <Typography component="span" sx={{ fontSize: 11, color: '#aaa', fontStyle: 'italic' }}>셀을 클릭하면 수식이 표시됩니다</Typography>
            )}
          </Typography>
        </Box>
      </Box>

      {/* ── Handsontable 그리드 ── */}
      <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <HotTable
          ref={hotRef}
          data={currentSheet.data}
          colHeaders={true}
          rowHeaders={true}
          readOnly={readOnly}
          mergeCells={currentSheet.merges}
          colWidths={currentSheet.colWidths}
          rowHeights={currentSheet.rowHeights}
          width="100%"
          height="100%"
          stretchH="none"
          autoWrapRow={false}
          autoWrapCol={false}
          manualColumnResize={true}
          manualRowResize={true}
          contextMenu={false}
          disableVisualSelection={false}
          selectionMode="single"
          afterSelection={handleAfterSelection}
          className="htExcelViewer"
          licenseKey="non-commercial-and-evaluation"
        />
      </Box>

      {/* ── 시트 탭 ── */}
      {sheets.length > 1 && (
        <Box sx={{ borderTop: '1px solid #C0C0C0', bgcolor: '#F0F0F0', flexShrink: 0 }}>
          <Tabs
            value={activeSheet}
            onChange={(_, v) => { setActiveSheet(v); setSelectedCell(''); setFormulaBarText(''); }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 30,
              '& .MuiTab-root': { minHeight: 30, textTransform: 'none', fontSize: 11, py: 0, px: 2 },
              '& .Mui-selected': { fontWeight: 700 },
            }}
          >
            {sheets.map((s, i) => (
              <Tab key={i} label={s.name} />
            ))}
          </Tabs>
        </Box>
      )}
    </Box>
  );
};

export default HotExcelViewer;
