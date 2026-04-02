/**
 * 공통 테이블 스타일 (MUI sx 객체)
 *
 * 사용법:
 *   import { tableHeaderSx, tableCellSx } from '../../shared/styles/tableStyles';
 *   <TableCell sx={tableHeaderSx}>항목명</TableCell>
 *   <TableCell sx={tableCellNumSx}>{amount}</TableCell>
 */
import { SxProps, Theme } from '@mui/material';

// ─── 헤더 셀 ───────────────────────────────────────────────────────────────

/** 기본 테이블 헤더 셀 스타일 */
export const tableHeaderSx: SxProps<Theme> = {
  fontSize: 11,
  fontWeight: 600,
  color: '#86868b',
  py: 1,
  px: 1.5,
  borderBottom: '1px solid #e5e5e7',
  bgcolor: '#fafafa',
};

/** 숫자 컬럼 헤더 셀 스타일 (오른쪽 정렬) */
export const tableHeaderNumSx: SxProps<Theme> = {
  ...tableHeaderSx,
  textAlign: 'right' as const,
};

// ─── 데이터 셀 ──────────────────────────────────────────────────────────────

/** 기본 테이블 데이터 셀 스타일 */
export const tableCellSx: SxProps<Theme> = {
  fontSize: 12,
  py: 1.25,
  px: 1.5,
  borderBottom: '1px solid #f0f0f0',
};

/** 숫자 컬럼 데이터 셀 스타일 (오른쪽 정렬) */
export const tableCellNumSx: SxProps<Theme> = {
  ...tableCellSx,
  textAlign: 'right' as const,
};

/** 가운데 정렬 데이터 셀 스타일 */
export const tableCellCenterSx: SxProps<Theme> = {
  ...tableCellSx,
  textAlign: 'center' as const,
};

// ─── 소계 / 합계 행 ──────────────────────────────────────────────────────────

/** 소계 행 스타일 */
export const subtotalRowSx: SxProps<Theme> = {
  bgcolor: '#f5f5f7',
  '& td': {
    fontSize: 12,
    fontWeight: 600,
    py: 1,
    px: 1.5,
    borderBottom: '1px solid #e5e5e7',
    color: '#1d1d1f',
  },
};

/** 합계 행 스타일 */
export const totalRowSx: SxProps<Theme> = {
  bgcolor: '#e8eef5',
  '& td': {
    fontSize: 13,
    fontWeight: 700,
    py: 1.25,
    px: 1.5,
    borderBottom: '2px solid #003875',
    color: '#003875',
  },
};
