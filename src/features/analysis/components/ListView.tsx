import React from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableRow, Collapse,
  TextField, ClickAwayListener,
} from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import FluentIcon from '../../../shared/components/FluentIcon';
import { C } from '../../../shared/constants/colors';
import type { ListItem, CostRow } from '../types';
import MiniConfidence from './MiniConfidence';
import StatusBadge from './StatusBadge';
import { useListViewRow } from '../hooks/useListViewRow';
import { tableCellSx as tdSx, tableCellNumSx as tdNumSx } from '../../../shared/styles';

interface ListViewRowProps {
  item: ListItem;
  depth?: number;
  onCellClick?: (name: string) => void;
  onAmountClick?: (event: React.MouseEvent<HTMLElement>, row: CostRow, groupTitle: string) => void;
  onAnomalyClick?: (el: HTMLElement, reason: string) => void;
  groupTitle?: string;
  // 인라인 편집 props
  editCell?: { itemId: string; field: string } | null;
  editValue?: string;
  onStartEdit?: (itemId: string, field: string, currentValue: string) => void;
  onEditValueChange?: (value: string) => void;
  onCommitEdit?: () => void;
  onCancelEdit?: () => void;
}

const ListViewRow: React.FC<ListViewRowProps> = ({
  item, depth = 0, onCellClick, onAmountClick, onAnomalyClick, groupTitle = '',
  editCell, editValue, onStartEdit, onEditValueChange, onCommitEdit, onCancelEdit,
}) => {
  const { open, setOpen, hasChildren, isAnomaly } = useListViewRow(item);

  const isEditing = (field: string) => editCell?.itemId === item.id && editCell?.field === field;
  const editable = item.status === 'anomaly';

  return (
    <>
      <TableRow
        sx={{
          cursor: hasChildren ? 'pointer' : 'default',
          '&:hover': { bgcolor: '#f8f9ff' },
          ...(isAnomaly && { bgcolor: '#fff8f8' }),
        }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        <TableCell sx={{ ...tdSx, pl: 1.5 + depth * 2, whiteSpace: 'nowrap' }}>
          {hasChildren && (open ? <ExpandMore sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} /> : <ChevronRight sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />)}
          {item.category}
        </TableCell>
        <TableCell
          sx={{ ...tdSx, fontWeight: 500, cursor: 'pointer', '&:hover': { bgcolor: '#e8f4fd' } }}
          onClick={() => onCellClick?.(item.name)}
        >
          {item.name}
          {isAnomaly && <Typography component="span" sx={{ ml: 0.5, color: C.red, fontSize: 11 }}><FluentIcon name="warning" size={11} /></Typography>}
        </TableCell>
        <TableCell sx={tdSx}>{item.spec}</TableCell>
        <TableCell sx={tdSx}>{item.unit}</TableCell>
        <TableCell sx={tdSx}>{item.qty}</TableCell>

        {/* 단가 - 편집 가능 */}
        <TableCell
          sx={{ ...tdNumSx, cursor: editable ? 'pointer' : 'default', '&:hover': editable ? { bgcolor: '#e8f4fd', borderRadius: '4px' } : {} }}
          onClick={(e) => { e.stopPropagation(); editable && onStartEdit?.(item.id, 'unitPrice', item.unitPrice); }}
        >
          {isEditing('unitPrice') ? (
            <ClickAwayListener onClickAway={() => onCommitEdit?.()}>
              <TextField size="small" value={editValue} onChange={e => onEditValueChange?.(e.target.value)} autoFocus
                onKeyDown={e => { if (e.key === 'Enter') onCommitEdit?.(); if (e.key === 'Escape') onCancelEdit?.(); }}
                sx={{ '& input': { fontSize: 12, p: '4px 8px', textAlign: 'right' } }} />
            </ClickAwayListener>
          ) : item.unitPrice}
        </TableCell>

        {/* 금액 - 편집 가능 */}
        <TableCell
          sx={{
            ...tdNumSx,
            ...(isAnomaly && { color: C.red }),
            '&:hover': { bgcolor: '#e8f4fd', borderRadius: '4px' },
          }}
        >
          {isEditing('amount') ? (
            <ClickAwayListener onClickAway={() => onCommitEdit?.()}>
              <TextField size="small" value={editValue} onChange={e => onEditValueChange?.(e.target.value)} autoFocus
                onKeyDown={e => { if (e.key === 'Enter') onCommitEdit?.(); if (e.key === 'Escape') onCancelEdit?.(); }}
                sx={{ '& input': { fontSize: 12, p: '4px 8px', textAlign: 'right' } }} />
            </ClickAwayListener>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
              <Typography component="span"
                sx={{ fontSize: 12, cursor: editable ? 'pointer' : 'default', '&:hover': editable ? { textDecoration: 'underline' } : {} }}
                onClick={(e) => { e.stopPropagation(); editable && onStartEdit?.(item.id, 'amount', item.amount); }}
              >
                {item.amount}
              </Typography>
              <Typography component="span"
                sx={{ fontSize: 10, color: C.gray, ml: 0.5, cursor: 'pointer', '&:hover': { color: C.blue } }}
                onClick={(e) => {
                  e.stopPropagation();
                  const costRow: CostRow = {
                    level: 'L1', category: item.category, name: item.name, spec: item.spec,
                    unit: item.unit, qty: item.qty, unitPrice: item.unitPrice, amount: item.amount,
                    ratio: item.ratio, confidence: item.confidence, status: item.status,
                    anomalyReason: item.status === 'anomaly' ? '이상값 감지됨' : undefined,
                  };
                  onAmountClick?.(e, costRow, groupTitle);
                }}
              ><FluentIcon name="lightbulb" size={10} /></Typography>
            </Box>
          )}
        </TableCell>
        <TableCell sx={tdSx}>{item.ratio}</TableCell>
        <TableCell sx={tdSx}><MiniConfidence value={item.confidence} /></TableCell>
        <TableCell sx={tdSx}>
          {isAnomaly && item.anomalyReason ? (
            <Box
              sx={{ display: 'inline-flex', cursor: 'pointer' }}
              onClick={(e) => onAnomalyClick?.(e.currentTarget, item.anomalyReason!)}
            >
              <StatusBadge status={item.status} />
            </Box>
          ) : (
            <StatusBadge status={item.status} />
          )}
        </TableCell>
      </TableRow>
      {hasChildren && (
        <TableRow>
          <TableCell colSpan={10} sx={{ p: 0, border: 'none' }}>
            <Collapse in={open}>
              <Table size="small">
                <TableBody>
                  {item.children!.map(child => (
                    <ListViewRow
                      key={child.id}
                      item={child}
                      depth={depth + 1}
                      onCellClick={onCellClick}
                      onAmountClick={onAmountClick}
                      onAnomalyClick={onAnomalyClick}
                      groupTitle={groupTitle}
                      editCell={editCell}
                      editValue={editValue}
                      onStartEdit={onStartEdit}
                      onEditValueChange={onEditValueChange}
                      onCommitEdit={onCommitEdit}
                      onCancelEdit={onCancelEdit}
                    />
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

export default ListViewRow;
