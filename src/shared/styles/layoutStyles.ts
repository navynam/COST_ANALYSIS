/**
 * 공통 레이아웃 스타일 (MUI sx 객체)
 *
 * 사용법:
 *   import { pageContainerSx, sectionHeaderSx } from '../../shared/styles/layoutStyles';
 *   <Box sx={pageContainerSx}>...</Box>
 */
import { SxProps, Theme } from '@mui/material';

// ─── 페이지 컨테이너 ─────────────────────────────────────────────────────────

/** 페이지 전체 래퍼 (배경색 + 최소 높이) */
export const pageContainerSx: SxProps<Theme> = {
  minHeight: '100vh',
  bgcolor: '#f5f5f7',
};

/** 페이지 내부 콘텐츠 패딩 래퍼 */
export const pageContentSx: SxProps<Theme> = {
  px: 3,
  py: 2,
};

// ─── 섹션 헤더 ──────────────────────────────────────────────────────────────

/** 페이지 상단 섹션 헤더 바 */
export const sectionHeaderSx: SxProps<Theme> = {
  borderBottom: '1px solid #e5e5e7',
  px: 3,
  py: 2,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

/** 섹션 제목 텍스트 스타일 */
export const sectionTitleSx: SxProps<Theme> = {
  fontSize: 16,
  fontWeight: 700,
  color: '#1d1d1f',
};

/** 섹션 서브타이틀 텍스트 스타일 */
export const sectionSubtitleSx: SxProps<Theme> = {
  fontSize: 13,
  color: '#86868b',
};

// ─── 툴바 / 액션바 ──────────────────────────────────────────────────────────

/** 툴바 래퍼 (버튼 그룹을 가로로 배치) */
export const toolbarSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

/** 카드/Paper 기본 스타일 */
export const cardSx: SxProps<Theme> = {
  borderRadius: '12px',
  border: '1px solid #e5e5e7',
  boxShadow: 'none',
  p: 2.5,
};

// ─── 버튼 스타일 ─────────────────────────────────────────────────────────────

/** 아웃라인 버튼 공통 스타일 */
export const btnOutlineSx: SxProps<Theme> = {
  textTransform: 'none' as const,
  fontSize: 12,
  fontWeight: 600,
  borderRadius: '8px',
  borderColor: '#e5e5e7',
  color: '#6b7280',
  bgcolor: '#fafafa',
  px: 1.5,
  '&:hover': {
    borderColor: '#d1d5db',
    bgcolor: '#f3f4f6',
    color: '#374151',
  },
};

/** 주요 액션 버튼 (파란색) */
export const btnPrimarySx: SxProps<Theme> = {
  textTransform: 'none' as const,
  fontSize: 13,
  fontWeight: 600,
  borderRadius: '8px',
  bgcolor: '#003875',
  color: '#fff',
  px: 2,
  '&:hover': {
    bgcolor: '#002555',
  },
};
