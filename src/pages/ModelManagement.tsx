/**
 * @fileoverview 모델 관리 페이지
 * @description 원가 구조 트리 뷰, 항목별 수식/비율 편집, 변경 이력 관리
 */
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableHead, TableRow, TableCell, TableBody, Chip,
} from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { Edit, AccountTree } from '@mui/icons-material';

interface CostItem {
  name: string;
  formula: string;
  minRatio: number;
  maxRatio: number;
  history: { date: string; field: string; before: string; after: string; user: string }[];
}

const TREE_DATA = [
  { id: '1', label: '생산원가', children: [
    { id: '1-1', label: '재료비', children: [
      { id: '1-1-1', label: '주원료' },
      { id: '1-1-2', label: '부원료' },
      { id: '1-1-3', label: '스크랩' },
    ]},
    { id: '1-2', label: '가공비', children: [
      { id: '1-2-1', label: '프레스' },
      { id: '1-2-2', label: '사출' },
      { id: '1-2-3', label: '용접' },
    ]},
    { id: '1-3', label: '제경비', children: [
      { id: '1-3-1', label: '감가상각비' },
      { id: '1-3-2', label: '보험료' },
      { id: '1-3-3', label: '수선비' },
    ]},
  ]},
];

const ITEM_DATA: Record<string, CostItem> = {
  '재료비': { name: '재료비', formula: '주원료 + 부원료 - 스크랩', minRatio: 40, maxRatio: 70, history: [
    { date: '2026-02-15', field: '수식', before: '주원료 + 부원료', after: '주원료 + 부원료 - 스크랩', user: '관리자' },
    { date: '2026-01-20', field: '최소비율', before: '35%', after: '40%', user: '관리자' },
  ]},
  '가공비': { name: '가공비', formula: '프레스 + 사출 + 용접', minRatio: 20, maxRatio: 35, history: [
    { date: '2026-02-10', field: '수식', before: '프레스 + 사출', after: '프레스 + 사출 + 용접', user: '관리자' },
  ]},
  '제경비': { name: '제경비', formula: '감가상각비 + 보험료 + 수선비', minRatio: 5, maxRatio: 15, history: [] },
  '주원료': { name: '주원료', formula: '단가 × 수량', minRatio: 25, maxRatio: 50, history: [] },
  '부원료': { name: '부원료', formula: '단가 × 수량', minRatio: 5, maxRatio: 15, history: [] },
  '스크랩': { name: '스크랩', formula: '스크랩량 × 회수단가', minRatio: 1, maxRatio: 5, history: [] },
  '프레스': { name: '프레스', formula: 'SPM × 시간단가', minRatio: 8, maxRatio: 15, history: [] },
  '사출': { name: '사출', formula: '사이클타임 × 시간단가', minRatio: 5, maxRatio: 12, history: [] },
  '용접': { name: '용접', formula: '타점수 × 단가', minRatio: 3, maxRatio: 8, history: [] },
  '감가상각비': { name: '감가상각비', formula: '취득가액 / 내용연수', minRatio: 2, maxRatio: 8, history: [] },
  '보험료': { name: '보험료', formula: '자산가액 × 요율', minRatio: 0.5, maxRatio: 2, history: [] },
  '수선비': { name: '수선비', formula: '자산가액 × 수선율', minRatio: 1, maxRatio: 5, history: [] },
};

const ModelManagement: React.FC = () => {
  const [selected, setSelected] = useState<string>('재료비');
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({ formula: '', minRatio: 0, maxRatio: 0 });

  const item = ITEM_DATA[selected];

  const handleEdit = () => {
    if (!item) return;
    setEditData({ formula: item.formula, minRatio: item.minRatio, maxRatio: item.maxRatio });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (item) {
      item.formula = editData.formula;
      item.minRatio = editData.minRatio;
      item.maxRatio = editData.maxRatio;
    }
    setEditOpen(false);
  };

  const renderTree = (nodes: any[]) =>
    nodes.map(node => (
      <TreeItem key={node.id} itemId={node.id} label={node.label}
        onClick={() => { if (ITEM_DATA[node.label]) setSelected(node.label); }}>
        {node.children && renderTree(node.children)}
      </TreeItem>
    ));

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AccountTree sx={{ color: '#003875' }} />
        <Typography variant="h5" fontWeight={700}>모델관리</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 200px)' }}>
        {/* Tree */}
        <Paper sx={{ width: 280, flexShrink: 0, p: 2, overflow: 'auto' }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>원가 구조</Typography>
          <SimpleTreeView defaultExpandedItems={['1', '1-1', '1-2', '1-3']}>
            {renderTree(TREE_DATA)}
          </SimpleTreeView>
        </Paper>

        {/* Detail */}
        <Paper sx={{ flex: 1, p: 3, overflow: 'auto' }}>
          {item ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>{item.name}</Typography>
                <Button variant="outlined" startIcon={<Edit />} onClick={handleEdit}>편집</Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2, mb: 4 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>수식</Typography>
                <Chip label={item.formula} variant="outlined" sx={{ justifySelf: 'start' }} />
                <Typography variant="body2" color="text.secondary" fontWeight={600}>비율 범위</Typography>
                <Typography variant="body2">
                  <Chip label={`min ${item.minRatio}%`} size="small" sx={{ mr: 1 }} color="info" />
                  <Chip label={`max ${item.maxRatio}%`} size="small" color="warning" />
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>변경 이력</Typography>
              {item.history.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>날짜</TableCell><TableCell>필드</TableCell>
                      <TableCell>변경 전</TableCell><TableCell>변경 후</TableCell><TableCell>변경자</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {item.history.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell>{h.date}</TableCell><TableCell>{h.field}</TableCell>
                        <TableCell>{h.before}</TableCell><TableCell>{h.after}</TableCell><TableCell>{h.user}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">변경 이력이 없습니다.</Typography>
              )}
            </>
          ) : (
            <Typography color="text.secondary">왼쪽 트리에서 항목을 선택하세요.</Typography>
          )}
        </Paper>
      </Box>

      {/* Edit Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>항목 수정 - {item?.name}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField label="수식" fullWidth value={editData.formula}
            onChange={e => setEditData(d => ({ ...d, formula: e.target.value }))} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="최소 비율 (%)" type="number" value={editData.minRatio}
              onChange={e => setEditData(d => ({ ...d, minRatio: Number(e.target.value) }))} />
            <TextField label="최대 비율 (%)" type="number" value={editData.maxRatio}
              onChange={e => setEditData(d => ({ ...d, maxRatio: Number(e.target.value) }))} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: '#003875' }}>저장</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelManagement;
