import React from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableRow, Collapse,
} from '@mui/material';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { C } from '../../../shared/constants/colors';
import type { ListItem, CostRow } from '../types';
import MiniConfidence from './MiniConfidence';
import StatusBadge from './StatusBadge';
import { useListViewRow } from '../hooks/useListViewRow';

const tdSx = { fontSize: 12, py: 1.25, px: 1.5, borderBottom: '1px solid #f0f0f0' };

interface ListViewRowProps {
  item: ListItem;
  depth?: number;
  onCellClick?: (name: string) => void;
  onAmountClick?: (event: React.MouseEvent<HTMLElement>, row: CostRow, groupTitle: string) => void;
  groupTitle?: string;
}

const ListViewRow: React.FC<ListViewRowProps> = ({ item, depth = 0, onCellClick, onAmountClick, groupTitle = '' }) => {
  const { open, setOpen, hasChildren, isAnomaly } = useListViewRow(item);

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
          {isAnomaly && <Typography component="span" sx={{ ml: 0.5, color: C.red, fontSize: 11 }}>⚠️</Typography>}
        </TableCell>
        <TableCell sx={tdSx}>{item.spec}</TableCell>
        <TableCell sx={tdSx}>{item.unit}</TableCell>
        <TableCell sx={tdSx}>{item.qty}</TableCell>
        <TableCell sx={tdSx}>{item.unitPrice}</TableCell>
        <TableCell
          sx={{
            ...tdSx,
            fontWeight: 600,
            ...(isAnomaly && { color: C.red }),
            cursor: 'pointer',
            '&:hover': { bgcolor: '#e8f4fd', borderRadius: '4px' },
          }}
          onClick={(e) => {
            const costRow: CostRow = {
              level: 'L1',
              category: item.category,
              name: item.name,
              spec: item.spec,
              unit: item.unit,
              qty: item.qty,
              unitPrice: item.unitPrice,
              amount: item.amount,
              ratio: item.ratio,
              confidence: item.confidence,
              status: item.status,
              anomalyReason: item.status === 'anomaly' ? '이상값 감지됨' : undefined,
            };
            onAmountClick?.(e, costRow, groupTitle);
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {item.amount}
            <Typography component="span" sx={{ fontSize: 10, color: C.gray, ml: 0.5 }}>💡</Typography>
          </Box>
        </TableCell>
        <TableCell sx={tdSx}>{item.ratio}</TableCell>
        <TableCell sx={tdSx}><MiniConfidence value={item.confidence} /></TableCell>
        <TableCell sx={tdSx}><StatusBadge status={item.status} /></TableCell>
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
                      groupTitle={groupTitle}
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
