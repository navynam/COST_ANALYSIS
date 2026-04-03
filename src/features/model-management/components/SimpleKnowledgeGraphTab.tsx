/**
 * 🧠 간단한 지식그래프 탭 (D3.js 기반)
 * 
 * 🎯 주요 기능:
 * 1. SVG 기반 간단한 노드-링크 그래프
 * 2. HEAD_LINING 원가계산서 데이터 시각화
 * 3. 인터랙티브 노드 클릭/호버
 * 4. 색상 코딩으로 원가 구조 표시
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  AccountTree,
  ViewInAr,
  Timeline,
  Refresh,
  Download,
  Search,
  Clear,
  RestoreSharp,
} from '@mui/icons-material';
import { Formula, badgeConfig } from '../hooks/useModelManagement';

interface GraphNode {
  id: string;
  name: string;
  type: 'core' | 'sub' | 'rate' | 'variable';
  formula?: Formula;
  variable?: string;
  x: number;
  y: number;
  color: string;
  description: string;
}

interface GraphLink {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

interface SimpleKnowledgeGraphTabProps {
  formulas: Formula[]; // 부모에서 전달받는 수식 데이터
  newlyAddedFormulaId?: string; // 새로 추가된 수식 ID
  onNewFormulaHighlighted?: () => void; // 새 수식 하이라이트 완료 콜백
}

const SimpleKnowledgeGraphTab: React.FC<SimpleKnowledgeGraphTabProps> = ({ 
  formulas,
  newlyAddedFormulaId,
  onNewFormulaHighlighted 
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [layoutMode, setLayoutMode] = useState<'circular' | 'hierarchy' | 'force'>('hierarchy');
  const [searchText, setSearchText] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'core' | 'sub' | 'rate' | 'variable'>('all');
  const [showVariables, setShowVariables] = useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_showFilterPanel, _setShowFilterPanel] = useState<boolean>(false);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, {x: number, y: number}>>(new Map());
  const [groupDragMode, setGroupDragMode] = useState<boolean>(true); // 그룹 드래그 모드 (기본 켜짐)

  // 📥 SVG 내보내기
  const handleExportSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `지식그래프_${new Date().toISOString().slice(0, 10)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const [svgWidth, setSvgWidth] = useState(800);
  const svgRef = useRef<SVGSVGElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  
  // 🔧 모델 관리 데이터는 props로 받음 (실시간 동기화 보장)

  // 📐 컨테이너 너비 추적 (SVG viewBox 동기화)
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;
    const update = () => {
      const w = container.clientWidth;
      if (w > 0) setSvgWidth(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ✨ 컴포넌트 마운트 시 로그만 출력
  useEffect(() => {
    console.log('🧠 지식그래프 컴포넌트 마운트:', {
      수식개수: formulas.length,
      시간: new Date().toLocaleTimeString()
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 📊 지식그래프 상태 정보 (로그 + UI 표시)
  useEffect(() => {
    const stats = {
      총수식: formulas.length,
      핵심: formulas.filter(f => f.badge === 'core').length,
      하위: formulas.filter(f => f.badge === 'sub').length,
      비율: formulas.filter(f => f.badge === 'rate').length,
      변수: new Set(formulas.flatMap(f => f.variables)).size,
      수식목록: formulas.map(f => `${f.name}(${f.badge})`).join(', ')
    };
    console.log('🔄 지식그래프 데이터 업데이트:', stats);
    console.log('📋 전체 수식 상세:', formulas);
  }, [formulas]);

  // 🔍 검색 및 필터링 함수
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setHighlightedNodes(new Set());
      return;
    }

    const searchLower = text.toLowerCase();
    const matchedNodeIds = new Set<string>();

    // 수식 이름, 표현식, 설명에서 검색
    formulas.forEach(formula => {
      if (
        formula.name.toLowerCase().includes(searchLower) ||
        formula.expression.toLowerCase().includes(searchLower) ||
        formula.description.toLowerCase().includes(searchLower) ||
        formula.variables.some(v => v.toLowerCase().includes(searchLower))
      ) {
        matchedNodeIds.add(formula.id);
        // 해당 수식의 변수들도 하이라이트
        formula.variables.forEach(variable => {
          matchedNodeIds.add(`var_${variable}`);
        });
      }
    });

    // 변수 이름에서 직접 검색
    formulas.forEach(formula => {
      formula.variables.forEach(variable => {
        if (variable.toLowerCase().includes(searchLower)) {
          matchedNodeIds.add(`var_${variable}`);
          matchedNodeIds.add(formula.id); // 해당 수식도 하이라이트
        }
      });
    });

    setHighlightedNodes(matchedNodeIds);
  };

  // 🎯 검색 결과 클리어
  const clearSearch = () => {
    setSearchText('');
    setHighlightedNodes(new Set());
  };

  // 🔄 노드 위치 리셋
  const resetPositions = () => {
    setNodePositions(new Map());
    console.log('🔄 노드 위치가 초기 상태로 리셋되었습니다');
  };

  // 🔗 연결된 노드들 찾기 함수
  const getConnectedNodes = (targetNodeId: string): string[] => {
    const connectedIds = new Set<string>();
    
    // 현재 노드와 직접 연결된 모든 노드 찾기
    links.forEach(link => {
      if (link.source === targetNodeId) {
        connectedIds.add(link.target);
      } else if (link.target === targetNodeId) {
        connectedIds.add(link.source);
      }
    });
    
    return Array.from(connectedIds);
  };

  // 🎯 노드 간 충돌 감지 및 위치 조정
  const adjustNodePositions = (nodeList: GraphNode[]) => {
    const maxIterations = 10; // 최대 조정 횟수
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let hasCollision = false;
      
      for (let i = 0; i < nodeList.length; i++) {
        for (let j = i + 1; j < nodeList.length; j++) {
          const node1 = nodeList[i];
          const node2 = nodeList[j];
          
          const dx = node2.x - node1.x;
          const dy = node2.y - node1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const radius1 = node1.type === 'core' ? 40 : node1.type === 'sub' ? 35 : 
                         node1.type === 'rate' ? 30 : 18;
          const radius2 = node2.type === 'core' ? 40 : node2.type === 'sub' ? 35 : 
                         node2.type === 'rate' ? 30 : 18;
          const minDistance = radius1 + radius2 + 30; // 여백 30px
          
          if (distance < minDistance && distance > 0) {
            hasCollision = true;
            
            // 충돌 해결: 두 노드를 서로 멀어지게 이동
            const moveDistance = (minDistance - distance) / 2;
            const moveX = (dx / distance) * moveDistance;
            const moveY = (dy / distance) * moveDistance;
            
            node1.x -= moveX;
            node1.y -= moveY;
            node2.x += moveX;
            node2.y += moveY;
            
            // 경계 체크
            node1.x = Math.max(50, Math.min(svgWidth - 50, node1.x));
            node1.y = Math.max(50, Math.min(550, node1.y));
            node2.x = Math.max(50, Math.min(svgWidth - 50, node2.x));
            node2.y = Math.max(50, Math.min(550, node2.y));
          }
        }
      }
      
      if (!hasCollision) break; // 충돌이 없으면 조정 완료
    }
    
    return nodeList;
  };

  // 📊 레벨별 통계
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _levelStats = useMemo(() => {
    const stats = {
      total: formulas.length,
      core: formulas.filter(f => f.badge === 'core').length,
      sub: formulas.filter(f => f.badge === 'sub').length,
      rate: formulas.filter(f => f.badge === 'rate').length,
      variables: new Set(formulas.flatMap(f => f.variables)).size
    };
    return stats;
  }, [formulas]);

  // 🗂️ 모델 관리 데이터 기반 그래프 생성
  const { nodes, links } = useMemo(() => {
    const width = svgWidth;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodeData: GraphNode[] = [];
    const linkData: GraphLink[] = [];

    // 🎯 수식 노드 생성 (formulas 기반 + 필터링)
    const filteredFormulas = levelFilter === 'all' ? 
      formulas : 
      formulas.filter(f => f.badge === levelFilter);

    // 🎯 노드 크기 고려한 최소 간격 계산
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _getMinDistance = (type1: string, type2: string) => {
      const radius1 = type1 === 'core' ? 40 : type1 === 'sub' ? 35 : type1 === 'rate' ? 30 : 18;
      const radius2 = type2 === 'core' ? 40 : type2 === 'sub' ? 35 : type2 === 'rate' ? 30 : 18;
      return (radius1 + radius2) * 2 + 20; // 노드 반지름 합 + 여백 20px
    };

    filteredFormulas.forEach((formula, index) => {
      let x, y;
      
      if (layoutMode === 'hierarchy') {
        // 계층형: 핵심 중앙, 하위들은 레벨별 원형 배치
        if (formula.badge === 'core') {
          x = centerX;
          y = centerY;
        } else {
          const levelNodes = filteredFormulas.filter(f => f.badge === formula.badge);
          const levelIndex = levelNodes.indexOf(formula);
          const angleStep = (2 * Math.PI) / Math.max(levelNodes.length, 4); // 최소 4등분
          const angle = levelIndex * angleStep;
          
          // 레벨별 반지름 (겹침 방지를 위해 증가 + 노드 수 고려)
          const nodeCount = levelNodes.length;
          const baseRadius = formula.badge === 'sub' ? 
            Math.max(140, 120 + nodeCount * 15) : // 노드가 많을수록 반지름 증가
            Math.max(220, 200 + nodeCount * 20);
          x = centerX + baseRadius * Math.cos(angle);
          y = centerY + baseRadius * Math.sin(angle);
        }
      } else if (layoutMode === 'circular') {
        // 원형: 모든 노드를 큰 원 위에 균등 배치
        const angleStep = (2 * Math.PI) / filteredFormulas.length;
        const angle = index * angleStep;
        const radius = Math.min(250, 150 + filteredFormulas.length * 8); // 노드 수에 따라 반지름 조정
        
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
      } else {
        // Force: 그리드 기반 초기 배치 후 자연스럽게 분산
        const cols = Math.ceil(Math.sqrt(filteredFormulas.length));
        const cellWidth = (width - 200) / cols; // 여백 100px씩
        const cellHeight = (height - 200) / cols;
        
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        x = 100 + col * cellWidth + cellWidth / 2;
        y = 100 + row * cellHeight + cellHeight / 2;
      }

      nodeData.push({
        id: formula.id,
        name: formula.name,
        type: formula.badge,
        formula,
        x: x,
        y: y,
        color: badgeConfig[formula.badge].color,
        description: `${formula.expression}\n\n${formula.description}`
      });
    });

    // 🔗 변수 노드 생성 (각 수식의 variables 기반 + showVariables 필터)
    const variableMap = new Map<string, GraphNode>();
    
    if (showVariables && (levelFilter === 'all' || levelFilter === 'variable')) {
      filteredFormulas.forEach((formula) => {
        formula.variables.forEach((variable, vIndex) => {
          if (!variableMap.has(variable)) {
            const formulaNode = nodeData.find(n => n.id === formula.id);
            if (formulaNode) {
              // 🎯 개선된 변수 배치: 겹침 방지 + 적절한 거리
              const totalVars = formula.variables.length;
              const vAngle = (vIndex * 2 * Math.PI) / Math.max(totalVars, 3); // 최소 3등분
              
              // 변수 반지름 동적 계산 (수식 크기 + 충분한 여백)
              const formulaRadius = formula.badge === 'core' ? 40 : 
                                  formula.badge === 'sub' ? 35 : 30;
              const minDistance = formulaRadius + 18 + 25; // 수식반지름 + 변수반지름 + 여백
              const vRadius = Math.max(minDistance, 80); // 최소 80px 거리 보장
              
              const vx = formulaNode.x + vRadius * Math.cos(vAngle);
              const vy = formulaNode.y + vRadius * Math.sin(vAngle);
              
              // 경계 체크 (변수도 화면 안에 배치)
              const clampedVx = Math.max(50, Math.min(svgWidth - 50, vx));
              const clampedVy = Math.max(50, Math.min(550, vy));

              const variableNode: GraphNode = {
                id: `var_${variable}`,
                name: variable,
                type: 'variable',
                variable,
                x: clampedVx,
                y: clampedVy,
                color: '#95a5a6',
                description: `변수: ${variable}`
              };

              variableMap.set(variable, variableNode);
            }
          }
        });
      });
    }

    // 변수 노드를 nodeData에 추가
    if (showVariables && (levelFilter === 'all' || levelFilter === 'variable')) {
      nodeData.push(...Array.from(variableMap.values()));
    }

    // 🎯 노드 충돌 방지 위치 조정 (저장된 위치가 없는 경우만)
    const nodesWithoutSavedPos = nodeData.filter(node => !nodePositions.has(node.id));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _adjustedNodes = adjustNodePositions(nodesWithoutSavedPos);
    
    // 🎯 저장된 노드 위치 적용 (드래그로 이동된 경우)
    nodeData.forEach(node => {
      const savedPosition = nodePositions.get(node.id);
      if (savedPosition) {
        node.x = savedPosition.x;
        node.y = savedPosition.y;
      }
    });

    // 🔗 관계 링크 생성 (필터링된 수식 기준)
    filteredFormulas.forEach((formula) => {
      // 각 수식의 변수들 → 수식으로의 링크 (변수가 표시될 때만)
      if (showVariables && (levelFilter === 'all' || levelFilter === 'variable')) {
        formula.variables.forEach((variable) => {
          linkData.push({
            source: `var_${variable}`,
            target: formula.id,
            relationship: '입력',
            weight: 2
          });
        });
      }

      // 수식 간 관계 (핵심 수식과 하위 수식)
      if (formula.badge === 'sub') {
        // 하위 수식 → 핵심 수식 (생산원가)
        const coreFormula = filteredFormulas.find(f => f.badge === 'core');
        if (coreFormula && formula.variables.some(v => 
          coreFormula.variables.includes(v))) {
          linkData.push({
            source: formula.id,
            target: coreFormula.id,
            relationship: '구성',
            weight: 3
          });
        }
      }

      // 비율 수식과 다른 수식들의 관계
      if (formula.badge === 'rate') {
        // 비율 수식은 다른 수식들의 결과를 사용
        filteredFormulas.filter(f => f.badge !== 'rate').forEach(otherFormula => {
          if (formula.variables.some(v => otherFormula.name.includes(v))) {
            linkData.push({
              source: otherFormula.id,
              target: formula.id,
              relationship: '참조',
              weight: 1
            });
          }
        });
      }
    });

    return { nodes: nodeData, links: linkData };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formulas, layoutMode, levelFilter, showVariables, nodePositions, svgWidth]);

  // 🎨 노드 크기 계산 (타입별 차등화)
  const getNodeRadius = (node: GraphNode) => {
    switch (node.type) {
      case 'core': return 40; // 핵심 수식은 가장 크게
      case 'sub': return 35;  // 하위 수식
      case 'rate': return 30; // 비율 수식
      case 'variable': return 18; // 변수는 작게
      default: return 25;
    }
  };

  // 🖱️ 드래그 이벤트 핸들러 (그룹 드래그 지원)
  const handleMouseDown = (event: React.MouseEvent, node: GraphNode) => {
    event.preventDefault();
    setDraggedNode(node);
    
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;
    
    // 🔗 그룹 드래그 시 연결된 노드들 찾기
    const connectedNodeIds = groupDragMode ? getConnectedNodes(node.id) : [];
    const dragGroup = [node.id, ...connectedNodeIds];
    
    // 각 노드의 시작 위치 저장
    const startPositions = new Map<string, {x: number, y: number}>();
    dragGroup.forEach(nodeId => {
      const targetNode = nodes.find(n => n.id === nodeId);
      if (targetNode) {
        const currentPos = nodePositions.get(nodeId);
        startPositions.set(nodeId, {
          x: currentPos ? currentPos.x : targetNode.x,
          y: currentPos ? currentPos.y : targetNode.y
        });
      }
    });

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - rect.left) - startX;
      const deltaY = (e.clientY - rect.top) - startY;
      
      // 그룹 전체를 같은 거리만큼 이동
      setNodePositions(prev => {
        const newPositions = new Map(prev);
        
        dragGroup.forEach(nodeId => {
          const startPos = startPositions.get(nodeId);
          if (startPos) {
            const newX = startPos.x + deltaX;
            const newY = startPos.y + deltaY;
            
            // 경계 체크 (각 노드별로)
            const clampedX = Math.max(50, Math.min(750, newX));
            const clampedY = Math.max(50, Math.min(550, newY));
            
            newPositions.set(nodeId, { x: clampedX, y: clampedY });
          }
        });
        
        return newPositions;
      });
    };

    const handleMouseUp = () => {
      setDraggedNode(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      console.log('🎯 그룹 이동 완료:', {
        메인노드: node.name,
        그룹크기: dragGroup.length,
        연결된노드들: connectedNodeIds.map(id => nodes.find(n => n.id === id)?.name).filter(Boolean)
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 📊 SVG 렌더링
  const renderGraph = () => {
    return (
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgWidth} 600`}
        style={{ display: 'block' }}
      >
        <defs>
          {/* 도트 그리드 패턴 */}
          <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="1" fill="#cbd5e1" fillOpacity="0.6" />
          </pattern>
          {/* 노드 그림자 */}
          <filter id="nodeShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0f172a" floodOpacity="0.12"/>
          </filter>
          {/* 선택 글로우 */}
          <filter id="selectedGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#f59e0b" floodOpacity="0.7"/>
          </filter>
          {/* 검색 하이라이트 글로우 */}
          <filter id="highlightGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.6"/>
          </filter>
          {/* 드래그 글로우 */}
          <filter id="dragGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#0ea5e9" floodOpacity="0.7"/>
          </filter>
          {/* 노드 그라디언트 */}
          <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#1e40af"/>
          </linearGradient>
          <linearGradient id="subGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="100%" stopColor="#065f46"/>
          </linearGradient>
          <linearGradient id="rateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#b45309"/>
          </linearGradient>
          <linearGradient id="varGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9"/>
            <stop offset="100%" stopColor="#e2e8f0"/>
          </linearGradient>
        </defs>
        {/* 배경 */}
        <rect width="100%" height="100%" fill="#f8fafc" />
        <rect width="100%" height="100%" fill="url(#dotGrid)" />

        {/* 🔗 링크 (엣지) 렌더링 */}
        <g>
          {links.map((link, index) => {
            const sourceNode = nodes.find(n => n.id === link.source);
            const targetNode = nodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode) return null;

            // 🎯 링크 시작점과 끝점도 실시간 위치 적용
            const sourcePos = nodePositions.get(link.source);
            const targetPos = nodePositions.get(link.target);
            const sourceX = sourcePos ? sourcePos.x : sourceNode.x;
            const sourceY = sourcePos ? sourcePos.y : sourceNode.y;
            const targetX = targetPos ? targetPos.x : targetNode.x;
            const targetY = targetPos ? targetPos.y : targetNode.y;

            const cpX = (sourceX + targetX) / 2;
            const cpY = (sourceY + targetY) / 2 - Math.abs(targetX - sourceX) * 0.12;
            return (
              <path
                key={index}
                d={`M ${sourceX} ${sourceY} Q ${cpX} ${cpY} ${targetX} ${targetY}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={Math.max(1, link.weight * 0.7)}
                strokeOpacity={0.55}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
        </g>

        {/* 화살표 마커 */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" fillOpacity="0.85" />
          </marker>
        </defs>

        {/* 🔴 노드 렌더링 */}
        <g>
          {nodes.map((node) => {
            // 🎯 실시간 위치 적용 (드래그된 위치가 있으면 우선 사용)
            const savedPosition = nodePositions.get(node.id);
            const currentX = savedPosition ? savedPosition.x : node.x;
            const currentY = savedPosition ? savedPosition.y : node.y;
            const radius = getNodeRadius(node);
            const isSelected = selectedNode?.id === node.id;
            const isHighlighted = highlightedNodes.has(node.id);
            const isDraggedGroup = draggedNode && groupDragMode && 
              (draggedNode.id === node.id || getConnectedNodes(draggedNode.id).includes(node.id));
            const isSearchResult = searchText.trim() !== '' && highlightedNodes.size > 0;
            const fontSize = node.type === 'variable' ? 9 : 11;
            const textColor = node.type === 'variable' ? '#333' : 'white';
            
            // 색상 우선순위: 검색 결과 > 기본
            let nodeColor = node.color;
            let opacity = 1;
            let strokeColor = '#fff';
            let strokeWidth = 2;
            
            if (isSearchResult) {
              if (isHighlighted) {
                nodeColor = '#ff6b6b'; // 검색 결과는 빨간색으로 강조
                strokeColor = '#ff6b6b';
                strokeWidth = 3;
                opacity = 1;
              } else {
                opacity = 0.3; // 검색 결과가 아닌 노드는 흐리게
              }
            }
            
            if (isDraggedGroup) {
              // 그룹 드래그 시 연결된 모든 노드 강조
              strokeColor = '#00b4d8';
              strokeWidth = 3;
              nodeColor = draggedNode?.id === node.id ? '#0077b6' : nodeColor;
            } else if (isSelected) {
              strokeColor = '#ff9500';
              strokeWidth = 3;
            } else if (node.type === 'variable') {
              strokeColor = '#bbb';
            }

            return (
              <g key={node.id}>
                {/* 노드 원 */}
                <circle
                  cx={currentX}
                  cy={currentY}
                  r={radius}
                  fill={
                    isSearchResult && !isHighlighted ? nodeColor :
                    node.type === 'core' ? 'url(#coreGrad)' :
                    node.type === 'sub'  ? 'url(#subGrad)'  :
                    node.type === 'rate' ? 'url(#rateGrad)' :
                    isHighlighted ? '#fecaca' : 'url(#varGrad)'
                  }
                  fillOpacity={opacity}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  filter={
                    isDraggedGroup ? 'url(#dragGlow)' :
                    isSelected     ? 'url(#selectedGlow)' :
                    isHighlighted  ? 'url(#highlightGlow)' :
                    node.type !== 'variable' ? 'url(#nodeShadow)' : 'none'
                  }
                  style={{ cursor: draggedNode?.id === node.id ? 'grabbing' : 'grab' }}
                  onClick={() => setSelectedNode(node)}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                />

                {/* 노드 라벨 (여러 줄 처리) */}
                {node.name.split(' ').length > 1 && node.type !== 'variable' ? (
                  // 긴 이름은 2줄로 분할
                  <>
                    <text
                      x={currentX}
                      y={currentY - 2}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize={fontSize}
                      fontWeight="600"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.name.split(' ')[0]}
                    </text>
                    <text
                      x={currentX}
                      y={currentY + 12}
                      textAnchor="middle"
                      fill={textColor}
                      fontSize={fontSize}
                      fontWeight="600"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.name.split(' ').slice(1).join(' ')}
                    </text>
                  </>
                ) : (
                  // 짧은 이름은 한 줄
                  <text
                    x={currentX}
                    y={currentY + 4}
                    textAnchor="middle"
                    fill={textColor}
                    fontSize={fontSize}
                    fontWeight="600"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {node.name}
                  </text>
                )}

                {/* 타입별 아이콘 표시 */}
                {node.type === 'core' && (
                  <text
                    x={currentX}
                    y={currentY - radius - 8}
                    textAnchor="middle"
                    fill="#003875"
                    fontSize="16"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    ⭐
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* 핵심 수식 강조 링 */}
        {nodes.filter(n => n.type === 'core').map(coreNode => {
          const savedPosition = nodePositions.get(coreNode.id);
          const ringX = savedPosition ? savedPosition.x : coreNode.x;
          const ringY = savedPosition ? savedPosition.y : coreNode.y;
          
          return (
            <circle
              key={`ring_${coreNode.id}`}
              cx={ringX}
              cy={ringY}
              r={getNodeRadius(coreNode) + 8}
              fill="none"
              stroke="#003875"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity={0.5}
            />
          );
        })}
      </svg>
    );
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      // CSS 애니메이션 정의
      '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.1)' },
        '100%': { transform: 'scale(1)' }
      },
      '@keyframes highlight': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.7 },
        '100%': { opacity: 1 }
      }
    }}>
      {/* 🎛️ 컴팩트 툴바 */}
      <Box sx={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2, py: 1.25, bgcolor: 'white',
        borderRadius: '12px', border: '1px solid #e5e7eb', mb: 1.5,
        flexWrap: 'wrap',
      }}>
        {/* 타이틀 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 0.5 }}>
          <AccountTree sx={{ fontSize: 18, color: '#3b82f6' }} />
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>
            원가 모델 구조
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

        {/* 검색 */}
        <TextField
          size="small"
          placeholder="수식·변수 검색..."
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ width: 200, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: 13 } }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment>,
            endAdornment: searchText && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch}><Clear sx={{ fontSize: 14 }} /></IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* 레벨 필터 */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            sx={{ fontSize: 13, borderRadius: '8px' }}
          >
            <MenuItem value="all" sx={{ fontSize: 13 }}>전체</MenuItem>
            <MenuItem value="core" sx={{ fontSize: 13 }}>핵심 수식</MenuItem>
            <MenuItem value="sub" sx={{ fontSize: 13 }}>하위 수식</MenuItem>
            <MenuItem value="rate" sx={{ fontSize: 13 }}>비율 수식</MenuItem>
            <MenuItem value="variable" sx={{ fontSize: 13 }}>변수만</MenuItem>
          </Select>
        </FormControl>

        {/* 레이아웃 토글 */}
        <ToggleButtonGroup
          value={layoutMode} exclusive size="small"
          onChange={(_, v) => v && setLayoutMode(v)}
          sx={{ '& .MuiToggleButton-root': { px: 1.25, py: 0.5, fontSize: 12, borderRadius: '8px !important' } }}
        >
          <ToggleButton value="circular"><Refresh sx={{ fontSize: 14, mr: 0.5 }} />원형</ToggleButton>
          <ToggleButton value="hierarchy"><Timeline sx={{ fontSize: 14, mr: 0.5 }} />계층</ToggleButton>
          <ToggleButton value="force"><ViewInAr sx={{ fontSize: 14, mr: 0.5 }} />Force</ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

        {/* 체크박스 토글 */}
        <FormControlLabel
          control={<Checkbox checked={showVariables} onChange={(e) => setShowVariables(e.target.checked)} size="small" />}
          label={<Typography sx={{ fontSize: 12 }}>변수</Typography>}
          sx={{ mr: 0 }}
        />
        <FormControlLabel
          control={<Checkbox checked={groupDragMode} onChange={(e) => setGroupDragMode(e.target.checked)} size="small" />}
          label={<Typography sx={{ fontSize: 12 }}>그룹이동</Typography>}
          sx={{ mr: 0 }}
        />

        {/* 상태 칩 */}
        {searchText && (
          <Chip label={`${highlightedNodes.size}개 검색됨`} size="small"
            color={highlightedNodes.size > 0 ? 'success' : 'default'} onDelete={clearSearch} />
        )}
        {draggedNode && (
          <Chip label={groupDragMode ? `그룹 이동: ${draggedNode.name}` : `드래그: ${draggedNode.name}`}
            size="small" color={groupDragMode ? 'info' : 'warning'} sx={{ animation: 'pulse 1s infinite' }} />
        )}

        {/* 우측 액션 */}
        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.75 }}>
          <Button size="small" startIcon={<RestoreSharp sx={{ fontSize: 14 }} />}
            onClick={resetPositions} disabled={nodePositions.size === 0}
            sx={{ fontSize: 12, textTransform: 'none', borderRadius: '8px' }}>
            위치 리셋
          </Button>
          <Button size="small" variant="outlined" startIcon={<Download sx={{ fontSize: 14 }} />}
            onClick={handleExportSVG}
            sx={{ fontSize: 12, textTransform: 'none', borderRadius: '8px' }}>
            내보내기
          </Button>
        </Box>
      </Box>

      {/* 📊 메인 그래프 영역 */}
      <Box sx={{ display: 'flex', flex: 1, gap: 2, minHeight: 0 }}>
        {/* 🧠 지식그래프 */}
        <Paper ref={svgContainerRef} sx={{
          flex: 1, p: 0, borderRadius: '12px', overflow: 'hidden',
          border: '1px solid #e5e7eb', boxShadow: '0 4px 24px rgba(15,23,42,0.07)',
          display: 'flex', flexDirection: 'column',
        }}>
          {renderGraph()}
        </Paper>

        {/* 📋 사이드 패널 - 선택된 노드 정보 */}
        {selectedNode && (
          <Box sx={{ width: 300 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedNode.name}
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={
                      selectedNode.type === 'core' ? '핵심 수식' :
                      selectedNode.type === 'sub' ? '하위 수식' :
                      selectedNode.type === 'rate' ? '비율 수식' : '변수'
                    }
                    size="small"
                    sx={{ bgcolor: selectedNode.color, color: 'white' }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                  {selectedNode.description}
                </Typography>

                {selectedNode.formula && (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      수식
                    </Typography>
                    <Paper sx={{ p: 1.5, mb: 2, bgcolor: '#f8f9fa', fontFamily: 'monospace', fontSize: 12 }}>
                      {selectedNode.formula.expression}
                    </Paper>

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      사용 변수
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {selectedNode.formula.variables.map((variable, index) => (
                        <Chip 
                          key={index}
                          label={variable} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: 10 }}
                        />
                      ))}
                    </Box>
                  </>
                )}

                {selectedNode.variable && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">변수명</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedNode.variable}
                    </Typography>
                  </Box>
                )}

                {/* 연결된 노드들 */}
                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                  연결 관계
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {links
                    .filter(link => link.source === selectedNode.id || link.target === selectedNode.id)
                    .map((link, index) => {
                      const connectedNodeId = link.source === selectedNode.id ? link.target : link.source;
                      const connectedNode = nodes.find(n => n.id === connectedNodeId);
                      const direction = link.source === selectedNode.id ? '→' : '←';
                      
                      return (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">
                            {direction} {connectedNode?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {link.relationship}
                          </Typography>
                        </Box>
                      );
                    })
                  }
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* 📊 하단 범례 */}
      <Box sx={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
        px: 2, py: 1, mt: 1.5, bgcolor: 'white',
        borderRadius: '12px', border: '1px solid #e5e7eb',
      }}>
        {[
          { color: '#3b82f6', label: '핵심 수식' },
          { color: '#10b981', label: '하위 수식' },
          { color: '#f59e0b', label: '비율 수식' },
          { color: '#94a3b8', label: '변수' },
          ...(searchText ? [{ color: '#ef4444', label: '검색 결과' }] : []),
          ...(draggedNode && groupDragMode ? [{ color: '#0ea5e9', label: '그룹 이동' }] : []),
        ].map(({ color, label }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
            <Typography sx={{ fontSize: 11, color: '#64748b' }}>{label}</Typography>
          </Box>
        ))}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
          노드: {nodes.length} · 관계: {links.length} · 수식: {formulas.length}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#94a3b8', ml: 'auto' }}>
          클릭: 상세 정보 | 드래그: 노드 이동 | ⭐ 핵심 수식
        </Typography>
      </Box>
    </Box>
  );
};

export default SimpleKnowledgeGraphTab;