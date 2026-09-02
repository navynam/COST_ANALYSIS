/**
 * @fileoverview 개발용 권한 전환 셀렉트 ("현재 권한으로 보기")
 * @description mock 모드에서만 노출된다. 실제 사원 데이터는 건드리지 않고,
 *   PermissionContext 가 평가하는 roleCode 만 일시적으로 덮어써 화면 차이를 즉시 확인할 수 있게 한다(11.6).
 */
import React, { useEffect, useState } from 'react';
import { Select, MenuItem, Box, Typography, SelectChangeEvent } from '@mui/material';
import { BugReport } from '@mui/icons-material';
import { USE_API } from '../../../shared/api/config';
import { isServedByMock } from '../services/menuService';
import { store } from '../services/mockStore';
import { usePermissionContext } from '../../auth/PermissionContext';
import type { Role } from '../types';

const DevRoleSwitcher: React.FC = () => {
  const { refresh, permissionVersion } = usePermissionContext();
  const [roles, setRoles] = useState<Role[]>([]);
  const [value, setValue] = useState<string>('');

  // 🐛 fix: USE_API 가 아니라 "실제로 mock 이 응답 중인가"로 판단한다. localhost:3000 은
  //   USE_API=true 라 백엔드가 없어도 이 스위처가 통째로 사라져 권한을 바꿀 수단이 없었다.
  //   permissionVersion 이 채워지면(=첫 권한 조회 완료) 재평가되도록 의존성에 넣는다.
  const mockMode = !USE_API || isServedByMock();

  useEffect(() => {
    if (!mockMode) return;
    setRoles(store.getRoles().filter(r => r.useYn));
    setValue(store.getDevRoleOverride() || '');
  }, [mockMode, permissionVersion]);

  if (!mockMode) return null;

  const handleChange = (e: SelectChangeEvent) => {
    const roleCode = e.target.value;
    setValue(roleCode);
    store.setDevRoleOverride(roleCode || null);
    refresh();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
      <BugReport sx={{ fontSize: 16, color: '#ff9800' }} />
      <Select size="small" displayEmpty value={value} onChange={handleChange}
        sx={{ fontSize: 12, height: 32, minWidth: 160, '& .MuiSelect-select': { py: 0.5 } }}>
        <MenuItem value="">
          <Typography variant="caption" color="text.secondary">현재 권한으로 보기 (실제 계정)</Typography>
        </MenuItem>
        {roles.map(r => (
          <MenuItem key={r.roleCode} value={r.roleCode}>
            <Typography variant="caption">{r.roleName} ({r.roleCode})</Typography>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default DevRoleSwitcher;
