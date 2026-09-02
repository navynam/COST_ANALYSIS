/**
 * @fileoverview 메뉴 아이콘 화이트리스트
 * @description DB/mock 에는 iconName 문자열만 저장하고, 프론트에서 실제 MUI 아이콘 컴포넌트로 매핑한다.
 *   맵에 없는 이름이 들어오면 기본 아이콘(Circle)으로 폴백하고 콘솔 경고를 남긴다.
 */
import React from 'react';
import {
  Dashboard, Description, CompareArrows, AutoGraph,
  ModelTraining, History, Settings, ViewList, AdminPanelSettings,
  Group, FactCheck, Analytics, AccountTree, Circle,
} from '@mui/icons-material';

export const MENU_ICON_MAP: Record<string, React.ReactElement> = {
  Dashboard: <Dashboard />,
  Description: <Description />,
  CompareArrows: <CompareArrows />,
  AutoGraph: <AutoGraph />,
  ModelTraining: <ModelTraining />,
  History: <History />,
  Settings: <Settings />,
  ViewList: <ViewList />,
  AdminPanelSettings: <AdminPanelSettings />,
  Group: <Group />,
  FactCheck: <FactCheck />,
  Analytics: <Analytics />,
  AccountTree: <AccountTree />,
};

/** iconName → 아이콘 엘리먼트. 화이트리스트에 없으면 Circle 폴백 + 콘솔 경고 */
export function resolveMenuIcon(iconName: string | null | undefined): React.ReactElement {
  if (!iconName) return <Circle />;
  const icon = MENU_ICON_MAP[iconName];
  if (!icon) {
    console.warn(`[menuIconMap] 화이트리스트에 없는 아이콘: ${iconName} → 기본 아이콘으로 대체`);
    return <Circle />;
  }
  return icon;
}
