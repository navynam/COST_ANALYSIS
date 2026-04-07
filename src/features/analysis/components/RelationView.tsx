import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { AutoFixHigh } from '@mui/icons-material';
import { C } from '../../../shared/constants/colors';
import type { ListGroup } from '../types';
import { useRelationView } from '../hooks/useRelationView';

interface RelationViewProps {
  listData: ListGroup[];
  onNodeClick?: (name: string) => void;
  onNodeSelect?: (node: any) => void;
}

const RelationView: React.FC<RelationViewProps> = ({ listData, onNodeClick, onNodeSelect }) => {
  const {
    expandedNodes, draggedNode, hasDragged,
    allNodes, edges, maxHeight,
    getNodePosition, getCenter,
    toggleExpand, handleMouseDown, autoArrange,
  } = useRelationView(listData, onNodeClick);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: maxHeight, overflow: 'auto' }}>
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 100, display: 'flex', gap: 1 }}>
        <Tooltip title="자동 정렬">
          <IconButton onClick={autoArrange} sx={{ bgcolor: '#fff', boxShadow: 2, '&:hover': { bgcolor: '#f0f7ff' } }}>
            <AutoFixHigh />
          </IconButton>
        </Tooltip>
      </Box>

      <svg width="100%" height={maxHeight} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {edges.map(edge => {
          const from = getCenter(edge.from);
          const to = getCenter(edge.to);
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x} y1={from.y + 50} x2={to.x} y2={to.y - 10}
              stroke={edge.anomaly ? C.red : edge.level >= 3 ? C.purple : C.blue}
              strokeWidth={edge.from === 'root' ? '3' : edge.level >= 3 ? '1.5' : '2'}
              strokeDasharray={edge.anomaly ? '6,6' : 'none'}
              opacity={0.7}
            />
          );
        })}
      </svg>

      {allNodes.map(node => {
        const pos = getNodePosition(node);
        const isDragging = draggedNode === node.id;
        return (
          <Paper
            key={node.id}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={() => {
              if (!isDragging && !hasDragged) {
                if (node.hasChildren) toggleExpand(node.id);
                onNodeClick?.(node.label);
                onNodeSelect?.(node);
              }
            }}
            sx={{
              position: 'absolute', left: pos.x, top: pos.y, width: node.w, height: node.h, p: 2,
              borderRadius: '12px', cursor: isDragging ? 'grabbing' : 'grab',
              border: `3px solid ${node.status === 'anomaly' ? C.red : node.id === 'root' ? C.blue : node.level >= 3 ? C.purple : '#e0e0e0'}`,
              bgcolor: node.status === 'anomaly' ? '#fff5f5' : node.id === 'root' ? '#f0f7ff' : node.level >= 3 ? '#f8f0ff' : '#fff',
              boxShadow: node.id === 'root' ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 12px rgba(0,0,0,0.1)',
              transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
              transform: isDragging ? 'scale(1.05)' : 'scale(1)',
              zIndex: isDragging ? 1000 : node.id === 'root' ? 10 : 1,
              '&:hover': !isDragging ? { transform: 'scale(1.03)', boxShadow: '0 6px 24px rgba(0,0,0,0.2)', zIndex: 10 } : {},
            }}
          >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                {node.icon && (
                  <Box sx={{ width: 20, height: 20, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: node.iconBg, color: node.iconColor, fontSize: 11, flexShrink: 0 }}>
                    {node.icon}
                  </Box>
                )}
                <Typography sx={{ fontSize: node.id === 'root' ? 15 : 12, fontWeight: 700, color: node.status === 'anomaly' ? C.red : node.id === 'root' ? C.blue : C.dark, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {node.label}
                </Typography>
                {node.hasChildren && (
                  <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: node.level >= 3 ? C.purple : C.blue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                    {expandedNodes.has(node.id) ? '−' : '+'}
                  </Box>
                )}
              </Box>
              <Typography sx={{ fontSize: 9, color: C.gray, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.sub}</Typography>
              {node.spec && <Typography sx={{ fontSize: 9, color: C.gray, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>규격: {node.spec}</Typography>}
              {node.qty && node.unitPrice && <Typography sx={{ fontSize: 9, color: C.gray, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.qty} {node.unit} × ₩{node.unitPrice}</Typography>}
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: node.id === 'root' ? 16 : 13, fontWeight: 700, color: node.status === 'anomaly' ? C.red : C.dark }}>
                  {node.amount}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                  <Box sx={{ width: 28, height: 4, bgcolor: '#e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ width: `${node.confidence}%`, height: '100%', bgcolor: node.confidence >= 90 ? C.green : node.confidence >= 70 ? C.orange : C.red }} />
                  </Box>
                  <Typography sx={{ fontSize: 8, color: C.gray }}>{node.confidence}%</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default RelationView;
