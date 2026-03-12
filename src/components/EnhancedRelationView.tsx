import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { AutoFixHigh, GridOn } from '@mui/icons-material';

const C = {
  blue: '#0071e3', red: '#ff3b30', green: '#34c759', orange: '#ff9500',
  purple: '#af52de', gray: '#86868b', dark: '#1d1d1f', border: '#e5e5e7', bg: '#f5f5f7',
};

interface ListItem {
  id: string;
  name: string;
  category: string;
  spec: string;
  unit: string;
  qty: number | string;
  unitPrice: string;
  amount: string;
  ratio: string;
  confidence: number;
  status: 'normal' | 'anomaly';
  children?: ListItem[];
}

interface ListGroup {
  id: string;
  title: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  items: ListItem[];
}

interface EnhancedRelationViewProps {
  listData: ListGroup[];
  onNodeClick?: (name: string) => void;
}

const EnhancedRelationView: React.FC<EnhancedRelationViewProps> = ({ listData, onNodeClick }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNode(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setHasDragged(false);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedNode || !dragStart) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      setHasDragged(true);
    }

    setNodePositions(prev => {
      const currentPos = prev[draggedNode];
      const defaultNode = getAllNodes().find(n => n.id === draggedNode);
      const basePos = currentPos || (defaultNode ? { x: defaultNode.x, y: defaultNode.y } : { x: 0, y: 0 });
      
      return {
        ...prev,
        [draggedNode]: {
          x: basePos.x + deltaX,
          y: basePos.y + deltaY,
        }
      };
    });

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [draggedNode, dragStart]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragStart(null);
    setTimeout(() => setHasDragged(false), 100);
  }, []);

  // 글로벌 마우스 이벤트
  React.useEffect(() => {
    if (draggedNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, handleMouseMove, handleMouseUp]);

  // 최상단 노드
  const rootNode = {
    id: 'root',
    label: 'HEAD LINING',
    sub: '품번: HL-2024-001 | E.O. NO: EO-2024-1201',
    detail: '협력사: 대한(주) | 담당자: 김원가',
    amount: '₩76,800',
    confidence: 92,
    x: 400,
    y: 30,
    w: 320,
    h: 130,
    status: 'normal' as const,
    level: 0,
  };

  // 2단계 - 카테고리 노드들
  const categoryNodes = listData.map((group, index) => {
    const totalAmount = group.items.reduce((sum, item) => {
      const amount = typeof item.amount === 'string' ? 
        parseInt(item.amount.replace(/,/g, '')) : item.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalPct = `${Math.round((totalAmount / 76800) * 100)}%`;
    
    return {
      id: group.id,
      label: group.title,
      sub: `${group.items.length}개 항목`,
      amount: `₩${totalAmount.toLocaleString()}`,
      detail: totalPct,
      confidence: Math.round(group.items.reduce((acc, item) => acc + item.confidence, 0) / group.items.length),
      x: 150 + index * 280,
      y: 220,
      w: 220,
      h: 100,
      status: group.items.some(item => item.status === 'anomaly') ? 'anomaly' as const : 'normal' as const,
      hasChildren: true,
      icon: group.icon,
      iconBg: group.iconBg,
      iconColor: group.iconColor,
      level: 1,
    };
  });

  // 재귀적으로 하위 노드들 생성
  const createChildNodes = (
    parentId: string,
    items: ListItem[],
    level: number,
    parentX: number,
    parentY: number
  ): any[] => {
    const nodes: any[] = [];
    
    items.forEach((item, itemIndex) => {
      const itemsPerRow = level === 2 ? 3 : 2;
      const row = Math.floor(itemIndex / itemsPerRow);
      const col = itemIndex % itemsPerRow;
      const spacing = level === 2 ? 180 : 160;
      
      const nodeId = `${parentId}_${item.id}${level > 2 ? `_L${level}` : ''}`;
      
      const node = {
        id: nodeId,
        label: item.name,
        sub: item.category,
        spec: item.spec,
        amount: `₩${item.amount}`,
        detail: item.ratio,
        confidence: item.confidence,
        x: parentX + (col * spacing) - spacing,
        y: parentY + 160 + (row * 120),
        w: level === 2 ? 170 : 150,
        h: level === 2 ? 90 : 80,
        status: item.status,
        parent: parentId,
        qty: item.qty,
        unitPrice: item.unitPrice,
        unit: item.unit,
        level,
        hasChildren: item.children && item.children.length > 0,
      };
      
      nodes.push(node);
      
      // 자식이 있고 확장된 경우 재귀 호출
      if (item.children && expandedNodes.has(nodeId)) {
        const childNodes = createChildNodes(
          nodeId,
          item.children,
          level + 1,
          node.x,
          node.y
        );
        nodes.push(...childNodes);
      }
    });
    
    return nodes;
  };

  // 모든 하위 노드 생성
  const allChildNodes: any[] = [];
  categoryNodes.forEach((categoryNode) => {
    if (expandedNodes.has(categoryNode.id)) {
      const group = listData.find(g => g.id === categoryNode.id);
      if (group) {
        const children = createChildNodes(
          categoryNode.id,
          group.items,
          2,
          categoryNode.x,
          categoryNode.y
        );
        allChildNodes.push(...children);
      }
    }
  });

  // 전체 노드 배열
  const allNodes = [rootNode, ...categoryNodes, ...allChildNodes];

  const getAllNodes = () => allNodes;

  // 노드 위치 조회 (드래그된 위치 우선)
  const getNodePosition = (node: any) => {
    const dragged = nodePositions[node.id];
    return dragged || { x: node.x, y: node.y };
  };

  // 자동 정렬
  const autoArrange = () => {
    const newPositions: { [key: string]: { x: number; y: number } } = {};
    
    // 레벨별로 그룹화
    const levels: { [level: number]: any[] } = {};
    allNodes.forEach(node => {
      if (!levels[node.level]) levels[node.level] = [];
      levels[node.level].push(node);
    });

    // 레벨별 정렬
    Object.keys(levels).forEach(levelKey => {
      const level = parseInt(levelKey);
      const nodes = levels[level];
      const y = 50 + level * 180;
      
      nodes.forEach((node, index) => {
        const spacing = level === 0 ? 0 : level === 1 ? 300 : 200;
        const totalWidth = (nodes.length - 1) * spacing;
        const startX = Math.max(50, (1200 - totalWidth) / 2);
        const x = level === 0 ? 450 : startX + index * spacing;
        
        newPositions[node.id] = { x, y };
      });
    });

    setNodePositions(newPositions);
  };

  // 엣지 정의
  const edges: any[] = [];
  
  // root -> 카테고리 연결
  categoryNodes.forEach(cat => {
    edges.push({
      from: 'root',
      to: cat.id,
      anomaly: cat.status === 'anomaly',
    });
  });

  // 부모-자식 연결
  allNodes.forEach(node => {
    if (node.parent) {
      edges.push({
        from: node.parent,
        to: node.id,
        anomaly: node.status === 'anomaly',
        level: node.level,
      });
    }
  });

  const getCenter = (nodeId: string) => {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    const pos = getNodePosition(node);
    return { x: pos.x + node.w / 2, y: pos.y + node.h / 2 };
  };

  const maxHeight = Math.max(600, ...allNodes.map(n => {
    const pos = getNodePosition(n);
    return pos.y + n.h;
  })) + 50;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: maxHeight, overflow: 'auto' }}>
      {/* 컨트롤 버튼들 */}
      <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 100, display: 'flex', gap: 1 }}>
        <Tooltip title="자동 정렬">
          <IconButton 
            onClick={autoArrange}
            sx={{ 
              bgcolor: '#fff', 
              boxShadow: 2,
              '&:hover': { bgcolor: '#f0f7ff' }
            }}
          >
            <AutoFixHigh />
          </IconButton>
        </Tooltip>
        <Tooltip title="격자 표시">
          <IconButton 
            sx={{ 
              bgcolor: '#fff', 
              boxShadow: 2,
              '&:hover': { bgcolor: '#f0f7ff' }
            }}
          >
            <GridOn />
          </IconButton>
        </Tooltip>
      </Box>

      {/* SVG for connecting lines */}
      <svg 
        width="100%" 
        height={maxHeight} 
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {edges.map(edge => {
          const from = getCenter(edge.from);
          const to = getCenter(edge.to);
          
          return (
            <line
              key={`${edge.from}-${edge.to}`}
              x1={from.x}
              y1={from.y + 50}
              x2={to.x}
              y2={to.y - 10}
              stroke={edge.anomaly ? C.red : edge.level >= 3 ? C.purple : C.blue}
              strokeWidth={edge.from === 'root' ? '3' : edge.level >= 3 ? '1.5' : '2'}
              strokeDasharray={edge.anomaly ? '6,6' : 'none'}
              opacity={0.7}
            />
          );
        })}
      </svg>

      {/* Render all nodes */}
      {allNodes.map(node => {
        const pos = getNodePosition(node);
        const isDragging = draggedNode === node.id;
        
        return (
          <Paper
            key={node.id}
            onMouseDown={(e) => handleMouseDown(e, node.id)}
            onClick={(e) => {
              if (!isDragging && !hasDragged) {
                if (node.hasChildren) {
                  toggleExpand(node.id);
                }
                onNodeClick?.(node.label);
              }
            }}
            sx={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: node.w,
              height: node.h,
              p: 2,
              borderRadius: '12px',
              cursor: isDragging ? 'grabbing' : 'grab',
              border: `3px solid ${
                node.status === 'anomaly' ? C.red : 
                node.id === 'root' ? C.blue : 
                node.level >= 3 ? C.purple : '#e0e0e0'
              }`,
              bgcolor: 
                node.status === 'anomaly' ? '#fff5f5' : 
                node.id === 'root' ? '#f0f7ff' : 
                node.level >= 3 ? '#f8f0ff' : '#fff',
              boxShadow: node.id === 'root' ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 12px rgba(0,0,0,0.1)',
              transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
              transform: isDragging ? 'scale(1.05)' : 'scale(1)',
              zIndex: isDragging ? 1000 : node.id === 'root' ? 10 : 1,
              '&:hover': !isDragging ? {
                transform: 'scale(1.03)',
                boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
                zIndex: 10,
              } : {},
            }}
          >
            {/* 노드 내용 */}
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* 헤더 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {node.icon && (
                  <Box sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: node.iconBg,
                    color: node.iconColor,
                    fontSize: 12,
                  }}>
                    {node.icon}
                  </Box>
                )}
                <Typography sx={{ 
                  fontSize: node.id === 'root' ? 16 : 13, 
                  fontWeight: 700, 
                  color: node.status === 'anomaly' ? C.red : node.id === 'root' ? C.blue : C.dark,
                  flex: 1,
                }}>
                  {node.label}
                </Typography>
                
                {/* 확장/축소 버튼 */}
                {node.hasChildren && (
                  <Box sx={{ 
                    width: 20, 
                    height: 20, 
                    borderRadius: '50%', 
                    bgcolor: node.level >= 3 ? C.purple : C.blue, 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    {expandedNodes.has(node.id) ? '−' : '+'}
                  </Box>
                )}
              </Box>

              {/* 서브 정보 */}
              <Typography sx={{ fontSize: 10, color: C.gray, mb: 0.5 }}>
                {node.sub}
              </Typography>
              
              {/* 상세 정보 */}
              {node.detail && (
                <Typography sx={{ fontSize: 9, color: C.gray, mb: 1 }}>
                  {node.detail}
                </Typography>
              )}

              {/* 규격 정보 */}
              {node.spec && (
                <Typography sx={{ fontSize: 9, color: C.gray, mb: 0.5 }}>
                  규격: {node.spec}
                </Typography>
              )}

              {/* 수량/단가 정보 */}
              {node.qty && node.unitPrice && (
                <Typography sx={{ fontSize: 9, color: C.gray, mb: 0.5 }}>
                  {node.qty} {node.unit} × ₩{node.unitPrice}
                </Typography>
              )}

              {/* 금액 */}
              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ 
                  fontSize: node.id === 'root' ? 18 : 14, 
                  fontWeight: 700, 
                  color: node.status === 'anomaly' ? C.red : C.dark,
                }}>
                  {node.amount}
                </Typography>
                
                {/* 신뢰도 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ 
                    width: 30, 
                    height: 4, 
                    bgcolor: '#e0e0e0', 
                    borderRadius: 2, 
                    overflow: 'hidden' 
                  }}>
                    <Box sx={{
                      width: `${node.confidence}%`,
                      height: '100%',
                      bgcolor: node.confidence >= 90 ? C.green : node.confidence >= 70 ? C.orange : C.red,
                    }} />
                  </Box>
                  <Typography sx={{ fontSize: 8, color: C.gray }}>
                    {node.confidence}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
};

export default EnhancedRelationView;