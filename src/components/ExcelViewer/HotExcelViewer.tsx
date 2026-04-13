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
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';
import * as XLSX from 'xlsx';
import { Box, Tabs, Tab, Typography, CircularProgress } from '@mui/material';

// Handsontable v14+ 필수: 모든 모듈 등록
registerAllModules();

// ── 타입 ──

interface CellStyleInfo {
  bg?: string;       // 배경색 hex
  fc?: string;       // 글자색 hex
  bold?: boolean;
  italic?: boolean;
  align?: string;    // left/center/right
  borderT?: string;  // CSS border string
  borderB?: string;
  borderL?: string;
  borderR?: string;
}

interface SheetInfo {
  name: string;
  data: (string | number | null)[][];
  merges: { row: number; col: number; rowspan: number; colspan: number }[];
  colWidths: number[];
  rowHeights: number[];
  styles: Record<string, CellStyleInfo>; // "row-col" → style
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
  /** 확대/축소 (기본: 100) */
  zoom?: number;
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

    // 데이터 + 수식 + 스타일 추출
    const data: (string | number | null)[][] = [];
    const sheetFormulas: Record<string, string> = {};
    const styles: Record<string, CellStyleInfo> = {};

    for (let r = 0; r < rowCount; r++) {
      const row: (string | number | null)[] = [];
      for (let c = 0; c < colCount; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[addr] as any;
        if (cell) {
          row.push(cell.w !== undefined ? cell.w : (cell.v !== undefined ? cell.v : null));
          if (cell.f) sheetFormulas[addr] = `=${cell.f}`;

          // 셀 스타일 추출
          if (cell.s) {
            const s = cell.s;
            const style: CellStyleInfo = {};

            // 배경색
            if (s.fill && s.fill.fgColor) {
              const fg = s.fill.fgColor;
              if (fg.rgb && fg.rgb !== '000000' && fg.rgb !== 'FFFFFF') {
                const rgb = String(fg.rgb);
                style.bg = '#' + (rgb.length === 8 ? rgb.substring(2) : rgb);
              } else if (fg.theme !== undefined) {
                const themes = ['#000000','#FFFFFF','#1F497D','#EEECE1','#4F81BD','#C0504D','#9BBB59','#8064A2','#4BACC6','#F79646'];
                if (themes[fg.theme] && themes[fg.theme] !== '#FFFFFF') style.bg = themes[fg.theme];
              }
            }

            // 글자색
            if (s.font && s.font.color) {
              const fc = s.font.color;
              if (fc.rgb && fc.rgb !== '000000') {
                const rgb = String(fc.rgb);
                style.fc = '#' + (rgb.length === 8 ? rgb.substring(2) : rgb);
              }
            }

            // 볼드/이탤릭
            if (s.font?.bold) style.bold = true;
            if (s.font?.italic) style.italic = true;

            // 정렬
            if (s.alignment?.horizontal) style.align = s.alignment.horizontal;

            // 테두리
            const borderMap: Record<string, string> = { thin: '1px solid #999', medium: '2px solid #666', thick: '3px solid #333', double: '3px double #333', hair: '1px dotted #ccc', dashed: '1px dashed #999' };
            if (s.border) {
              if (s.border.top?.style) style.borderT = borderMap[s.border.top.style] || '1px solid #999';
              if (s.border.bottom?.style) style.borderB = borderMap[s.border.bottom.style] || '1px solid #999';
              if (s.border.left?.style) style.borderL = borderMap[s.border.left.style] || '1px solid #999';
              if (s.border.right?.style) style.borderR = borderMap[s.border.right.style] || '1px solid #999';
            }

            if (Object.keys(style).length > 0) styles[`${r}-${c}`] = style;
          }
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

    return { name, data, merges, colWidths, rowHeights, styles };
  });

  return { sheets, formulas };
};

// ── CSS 보정 + 하이라이트 ──
const VIEWER_CSS = `
  .ht-theme-main {
    --ht-cell-background-color: #ffffff;
    --ht-cell-border-color: #d0d0d0;
    --ht-row-header-background-color: #f0f0f0;
    --ht-col-header-background-color: #f0f0f0;
    --ht-header-text-color: #333;
    --ht-cell-text-color: #000;
    --ht-active-color: #1565C0;
    --ht-selection-background-color: rgba(21,101,192,0.1);
  }
  .ht-theme-main .handsontable td {
    background-color: #fff;
    border: 1px solid #d0d0d0;
    color: #000;
    font-size: 12px;
    padding: 2px 5px;
  }
  .ht-theme-main .handsontable th {
    background-color: #f0f0f0;
    border: 1px solid #c0c0c0;
    color: #333;
    font-size: 11px;
    font-weight: 500;
    padding: 2px 4px;
  }
  .ht-theme-main .handsontable .htCore {
    border-collapse: collapse;
  }
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
  file, fileUrl, highlightedCell, onCellClick, height = '100%', readOnly = true, zoom = 100,
}) => {
  const hotRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [formulas, setFormulas] = useState<Record<string, Record<string, string>>>({});
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<string>('');
  const [formulaBarText, setFormulaBarText] = useState('');
  const [prevHighlightCell, setPrevHighlightCell] = useState<{ row: number; col: number } | null>(null);
  const [externalStyles, setExternalStyles] = useState<Record<string, CellStyleInfo>>({});
  const [externalMerges, setExternalMerges] = useState<{ row: number; col: number; rowspan: number; colspan: number }[]>([]);

  // ── 스타일 JSON 로드 (백엔드 API → fallback: 정적 JSON) ──
  useEffect(() => {
    const loadStyles = async () => {
      try {
        let json: any = null;

        // 1. 백엔드 API 시도
        try {
          const apiRes = await fetch('/api/v1/excel/styles');
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            // ApiResponse 래퍼 처리
            const payload = apiData.data?.sheets?.[0] || apiData.data || apiData;
            if (payload.styles) {
              json = { s: payload.styles, m: payload.merges };
              console.log('스타일: 백엔드 API에서 로드');
            }
          }
        } catch { /* API 실패 시 fallback */ }

        // 2. fallback: 정적 JSON 파일
        if (!json) {
          const res = await fetch(`${process.env.PUBLIC_URL}/sample_excel/sheet1_styles.json`);
          if (res.ok) {
            json = await res.json();
            console.log('스타일: 정적 JSON에서 로드');
          }
        }

        if (!json) return;

        // 스타일 변환
        if (json.s || json.styles) {
          const rawStyles = json.s || json.styles;
          const converted: Record<string, CellStyleInfo> = {};
          Object.entries(rawStyles).forEach(([key, val]: [string, any]) => {
            const style: CellStyleInfo = {};
            if (val.bg) style.bg = val.bg;
            if (val.fc) style.fc = val.fc;
            if (val.b) style.bold = true;
            if (val.i) style.italic = true;
            if (val.a) style.align = val.a === 'c' ? 'center' : val.a === 'r' ? 'right' : val.a === 'l' ? 'left' : val.a;
            if (val.bd) {
              if (val.bd.t) style.borderT = val.bd.t;
              if (val.bd.b) style.borderB = val.bd.b;
              if (val.bd.l) style.borderL = val.bd.l;
              if (val.bd.r) style.borderR = val.bd.r;
            }
            converted[key] = style;
          });
          setExternalStyles(converted);
          console.log('스타일 적용:', Object.keys(converted).length, '셀');
        }

        // 병합 셀
        if (json.m || json.merges) {
          const rawMerges = json.m || json.merges;
          setExternalMerges(rawMerges.map((m: number[]) => ({ row: m[0], col: m[1], rowspan: m[2], colspan: m[3] })));
        }
      } catch { /* ignore */ }
    };
    loadStyles();
  }, []);

  // ── 컨테이너 크기 추적 ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height: h } = entries[0].contentRect;
      if (h > 0) setContainerHeight(h);
      if (width > 0) setContainerWidth(width);
    });
    ro.observe(el);
    // 초기값
    setContainerHeight(el.clientHeight);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [loading]); // loading 끝나면 재측정

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
          if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
          buffer = await res.arrayBuffer();
        }
        const result = parseWorkbook(buffer);
        console.log('Excel 파싱 완료:', result.sheets.map(s => `${s.name}: ${s.data.length}행 x ${s.data[0]?.length || 0}열`));
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

  // ── 셀 스타일 렌더러 ──
  const cellRenderer = useCallback((instance: any, td: HTMLTableCellElement, row: number, col: number, prop: any, value: any, cellProperties: any) => {
    td.textContent = value !== null && value !== undefined ? String(value) : '';
    td.style.fontSize = '12px';
    td.style.padding = '2px 5px';
    td.style.borderRight = '1px solid #d0d0d0';
    td.style.borderBottom = '1px solid #d0d0d0';
    td.style.backgroundColor = '#fff';
    td.style.color = '#000';
    td.style.fontWeight = 'normal';
    td.style.fontStyle = 'normal';

    // 외부 JSON 스타일 적용
    const s = externalStyles[`${row}-${col}`];
    if (s) {
      if (s.bg) td.style.backgroundColor = s.bg;
      if (s.fc) td.style.color = s.fc;
      if (s.bold) td.style.fontWeight = '700';
      if (s.italic) td.style.fontStyle = 'italic';
      if (s.align) td.style.textAlign = s.align;
      if (s.borderT) td.style.borderTop = s.borderT;
      if (s.borderB) td.style.borderBottom = s.borderB;
      if (s.borderL) td.style.borderLeft = s.borderL;
      if (s.borderR) td.style.borderRight = s.borderR;
    }
  }, [externalStyles]);

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

  if (!currentSheet) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography sx={{ fontSize: 13, color: '#888' }}>시트 데이터가 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height, width: '100%', overflow: 'hidden' }}>
      {/* CSS 삽입 */}
      <style>{VIEWER_CSS}</style>

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
      <div ref={containerRef} className="ht-theme-main" style={{
        flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative',
        transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
        transformOrigin: 'top left',
        width: zoom !== 100 ? `${100 / (zoom / 100)}%` : '100%',
        height: zoom !== 100 ? `${100 / (zoom / 100)}%` : undefined,
      }}>
        {containerHeight > 0 && (
          <HotTable
            ref={hotRef}
            data={currentSheet.data}
            colHeaders={true}
            rowHeaders={true}
            readOnly={readOnly}
            mergeCells={externalMerges.length > 0 ? externalMerges : (currentSheet.merges.length > 0 ? currentSheet.merges : false)}
            colWidths={currentSheet.colWidths}
            rowHeights={currentSheet.rowHeights}
            width={containerWidth}
            height={containerHeight}
            stretchH="none"
            autoWrapRow={false}
            autoWrapCol={false}
            autoRowSize={false}
            autoColumnSize={false}
            manualColumnResize={true}
            manualRowResize={true}
            contextMenu={false}
            disableVisualSelection={false}
            selectionMode="single"
            afterSelection={handleAfterSelection}
            cells={() => ({ renderer: cellRenderer })}
            licenseKey="non-commercial-and-evaluation"
          />
        )}
      </div>

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
