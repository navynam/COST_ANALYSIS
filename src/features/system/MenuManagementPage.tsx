/**
 * @fileoverview 메뉴관리 화면 (`/system/menus`, SYS_MENU)
 * @description 기존 메뉴의 메뉴명/아이콘/정렬순서/사용여부/상위메뉴 등을 수정한다. 신규 추가·삭제는 없다(D7).
 */
import React from 'react';
import {
  Box, Paper, Typography, List, ListItemButton, ListItemText, Chip, Divider,
  TextField, FormControlLabel, Switch, Checkbox, Button, Skeleton, Snackbar, Alert, Stack,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { useMenuManagement } from './hooks/useMenuManagement';
import { usePermission } from '../auth/usePermission';
import { resolveMenuIcon, MENU_ICON_MAP } from '../../shared/layouts/menuIconMap';
import { ACTION_LABELS } from '../../constants/system';
import type { ActionCode, MenuNode } from './types';

const ALL_ACTIONS: ActionCode[] = ['R', 'C', 'U', 'D', 'A'];

const MenuManagementPage: React.FC = () => {
  const {
    menus, loading, error, load,
    selectedCode, selectedMenu, selectMenu,
    form, setForm, parentOptions, saving, save, toast, setToast,
  } = useMenuManagement();
  const { canUpdate } = usePermission('SYS_MENU');

  const renderNode = (menu: MenuNode, depth: number) => (
    <React.Fragment key={menu.menuCode}>
      <ListItemButton selected={selectedCode === menu.menuCode} onClick={() => selectMenu(menu.menuCode)}
        sx={{ pl: 2 + depth * 2, borderRadius: 1 }}>
        <Box sx={{ mr: 1, display: 'flex', color: '#666' }}>{resolveMenuIcon(menu.iconName)}</Box>
        <ListItemText
          primary={<Typography sx={{ fontSize: 13, fontWeight: depth === 0 ? 700 : 500 }}>{menu.menuName}</Typography>}
          secondary={<Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{menu.menuCode}{menu.path ? ` · ${menu.path}` : ''}</Typography>}
        />
        <Stack direction="row" spacing={0.5}>
          {!menu.visibleInNav && <Chip label="미노출" size="small" sx={{ fontSize: 10, height: 18, bgcolor: '#eceff1', color: '#546e7a' }} />}
          {!menu.useYn && <Chip label="미사용" size="small" sx={{ fontSize: 10, height: 18, bgcolor: '#ffebee', color: '#c62828' }} />}
        </Stack>
      </ListItemButton>
      {(menu.children || []).map(child => renderNode(child, depth + 1))}
    </React.Fragment>
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>메뉴관리</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            메뉴명·아이콘·정렬순서·사용여부·상위메뉴를 수정합니다. 신규 추가/삭제는 지원하지 않습니다.
          </Typography>
        </Box>
        <Button startIcon={<Refresh />} onClick={load}>새로고침</Button>
      </Box>

      {error ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          <Button variant="outlined" onClick={load}>다시 시도</Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* 좌측: 메뉴 트리 */}
          <Paper sx={{ width: 360, p: 2, borderRadius: 2, maxHeight: '75vh', overflow: 'auto' }}>
            {loading ? (
              <Stack spacing={1}>
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="rectangular" height={36} />
                <Skeleton variant="rectangular" height={36} />
              </Stack>
            ) : menus.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 2 }}>메뉴 데이터가 없습니다. 초기 데이터를 확인하세요.</Typography>
            ) : (
              <List dense>{menus.map(m => renderNode(m, 0))}</List>
            )}
          </Paper>

          {/* 우측: 상세 폼 */}
          <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
            {!selectedMenu || !form ? (
              <Typography color="text.secondary">좌측 트리에서 메뉴를 선택하세요.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 560 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight={700}>{selectedMenu.menuName}</Typography>
                  <Chip label={selectedMenu.menuCode} size="small" variant="outlined" />
                </Box>
                <Divider />
                <TextField label="메뉴명" value={form.menuName} disabled={!canUpdate}
                  onChange={e => setForm(f => f && { ...f, menuName: e.target.value })} />
                {selectedMenu.depth === 2 && (
                  <TextField label="상위 메뉴" select value={form.parentMenuCode} disabled={!canUpdate}
                    SelectProps={{ native: true }}
                    onChange={e => setForm(f => f && { ...f, parentMenuCode: e.target.value })}>
                    {parentOptions.map(p => <option key={p.menuCode} value={p.menuCode}>{p.menuName}</option>)}
                  </TextField>
                )}
                <TextField label="경로(path)" value={form.path} disabled={!canUpdate}
                  helperText={selectedMenu.supportedActions.length === 0 ? '그룹 메뉴는 경로가 없습니다.' : undefined}
                  onChange={e => setForm(f => f && { ...f, path: e.target.value })} />
                <TextField label="별칭 경로 (쉼표 구분)" value={form.aliasPaths} disabled={!canUpdate}
                  onChange={e => setForm(f => f && { ...f, aliasPaths: e.target.value })} />
                <TextField label="아이콘" select value={form.iconName} disabled={!canUpdate}
                  SelectProps={{ native: true }}
                  onChange={e => setForm(f => f && { ...f, iconName: e.target.value })}>
                  <option value="">(없음)</option>
                  {Object.keys(MENU_ICON_MAP).map(name => <option key={name} value={name}>{name}</option>)}
                </TextField>
                <TextField label="정렬순서" type="number" value={form.sortOrder} disabled={!canUpdate}
                  onChange={e => setForm(f => f && { ...f, sortOrder: Number(e.target.value) })} />

                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>지원 기능</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {ALL_ACTIONS.map(action => (
                      <FormControlLabel key={action} sx={{ mr: 0 }}
                        control={
                          <Checkbox size="small" checked={form.supportedActions.includes(action)}
                            disabled={!canUpdate || action === 'R'}
                            onChange={e => setForm(f => {
                              if (!f) return f;
                              const next = e.target.checked
                                ? [...f.supportedActions, action]
                                : f.supportedActions.filter(a => a !== action);
                              return { ...f, supportedActions: next };
                            })}
                          />
                        }
                        label={<Typography sx={{ fontSize: 12 }}>{ACTION_LABELS[action]}</Typography>}
                      />
                    ))}
                  </Box>
                </Box>

                <FormControlLabel
                  control={<Switch checked={form.visibleInNav} disabled={!canUpdate}
                    onChange={e => setForm(f => f && { ...f, visibleInNav: e.target.checked })} />}
                  label="사이드바 노출(visibleInNav)" />
                <FormControlLabel
                  control={<Switch checked={form.useYn} disabled={!canUpdate}
                    onChange={e => setForm(f => f && { ...f, useYn: e.target.checked })} />}
                  label="사용 여부" />
                <TextField label="설명" value={form.description} multiline rows={2} disabled={!canUpdate}
                  onChange={e => setForm(f => f && { ...f, description: e.target.value })} />

                {canUpdate && (
                  <Box>
                    <Button variant="contained" disabled={saving} onClick={save}
                      sx={{ bgcolor: '#003875', '&:hover': { bgcolor: '#002855' } }}>
                      {saving ? '저장 중...' : '저장'}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      )}

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast(t => ({ ...t, open: false }))}>{toast.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuManagementPage;
