import { useState, useCallback, useEffect } from 'react';
import { C } from '../../../shared/constants/colors';
import type { ListGroup } from '../types';

export const useRelationView = (listData: ListGroup[], onNodeClick?: (name: string) => void) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>({});
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  const toggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) newExpanded.delete(nodeId);
    else newExpanded.add(nodeId);
    setExpandedNodes(newExpanded);
  };

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
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) setHasDragged(true);
    setNodePositions(prev => {
      const currentPos = prev[draggedNode];
      const defaultNode = getAllNodes().find(n => n.id === draggedNode);
      const basePos = currentPos || (defaultNode ? { x: defaultNode.x, y: defaultNode.y } : { x: 0, y: 0 });
      return { ...prev, [draggedNode]: { x: basePos.x + deltaX, y: basePos.y + deltaY } };
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [draggedNode, dragStart]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setDragStart(null);
    setTimeout(() => setHasDragged(false), 100);
  }, []);

  useEffect(() => {
    if (draggedNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, handleMouseMove, handleMouseUp]);

  const rootNode = {
    id: 'root', label: 'HEAD LINING',
    sub: '품번: HL-2024-001 | E.O. NO: EO-2024-1201',
    detail: '협력사: 대한(주) | 담당자: 김원가',
    amount: '₩76,800', confidence: 92,
    x: 400, y: 30, w: 320, h: 130,
    status: 'normal' as const, level: 0,
  };

  const categoryNodes = listData.map((group, index) => {
    const totalAmount = group.items.reduce((sum, item) => {
      const amount = typeof item.amount === 'string' ? parseInt(item.amount.replace(/,/g, '')) : item.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    return {
      id: group.id, label: group.title,
      sub: `${group.items.length}개 항목`,
      amount: `₩${totalAmount.toLocaleString()}`,
      detail: `${Math.round((totalAmount / 76800) * 100)}%`,
      confidence: Math.round(group.items.reduce((acc, item) => acc + item.confidence, 0) / group.items.length),
      x: 150 + index * 280, y: 220, w: 220, h: 100,
      status: group.items.some(item => item.status === 'anomaly') ? 'anomaly' as const : 'normal' as const,
      hasChildren: true, icon: group.icon, iconBg: group.iconBg, iconColor: group.iconColor, level: 1,
    };
  });

  const createChildNodes = (parentId: string, items: any[], level: number, parentX: number, parentY: number): any[] => {
    const nodes: any[] = [];
    items.forEach((item, itemIndex) => {
      const itemsPerRow = level === 2 ? 3 : 2;
      const col = itemIndex % itemsPerRow;
      const row = Math.floor(itemIndex / itemsPerRow);
      const spacing = level === 2 ? 180 : 160;
      const nodeId = `${parentId}_${item.id}${level > 2 ? `_L${level}` : ''}`;
      const node = {
        id: nodeId, label: item.name, sub: item.category, spec: item.spec,
        amount: `₩${item.amount}`, detail: item.ratio, confidence: item.confidence,
        x: parentX + (col * spacing) - spacing, y: parentY + 160 + (row * 120),
        w: level === 2 ? 170 : 150, h: level === 2 ? 90 : 80,
        status: item.status, parent: parentId, qty: item.qty, unitPrice: item.unitPrice, unit: item.unit,
        level, hasChildren: item.children && item.children.length > 0,
      };
      nodes.push(node);
      if (item.children && expandedNodes.has(nodeId)) {
        nodes.push(...createChildNodes(nodeId, item.children, level + 1, node.x, node.y));
      }
    });
    return nodes;
  };

  const allChildNodes: any[] = [];
  categoryNodes.forEach((categoryNode) => {
    if (expandedNodes.has(categoryNode.id)) {
      const group = listData.find(g => g.id === categoryNode.id);
      if (group) allChildNodes.push(...createChildNodes(categoryNode.id, group.items, 2, categoryNode.x, categoryNode.y));
    }
  });

  const allNodes = [rootNode, ...categoryNodes, ...allChildNodes];
  const getAllNodes = () => allNodes;

  const getNodePosition = (node: any) => nodePositions[node.id] || { x: node.x, y: node.y };

  const autoArrange = () => {
    const newPositions: { [key: string]: { x: number; y: number } } = {};
    const levels: { [level: number]: any[] } = {};
    allNodes.forEach(node => {
      if (!levels[node.level]) levels[node.level] = [];
      levels[node.level].push(node);
    });
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

  const edges: any[] = [];
  categoryNodes.forEach(cat => edges.push({ from: 'root', to: cat.id, anomaly: cat.status === 'anomaly' }));
  allNodes.forEach(node => {
    if (node.parent) edges.push({ from: node.parent, to: node.id, anomaly: node.status === 'anomaly', level: node.level });
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

  return {
    expandedNodes, draggedNode, hasDragged,
    allNodes, edges, maxHeight,
    getNodePosition, getCenter,
    toggleExpand, handleMouseDown, autoArrange,
    onNodeClick,
  };
};
