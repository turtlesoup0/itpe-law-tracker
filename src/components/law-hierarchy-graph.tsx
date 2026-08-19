"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { HierarchyNode } from "@/types/law";

// ---------------------------------------------------------------------------
// 색상 맵
// ---------------------------------------------------------------------------

/**
 * 노드 색은 globals.css 의 분야 토큰을 그대로 참조한다.
 * 라이트/다크용 hex 표를 두 벌 들고 isDark 로 갈아끼우던 방식이었는데,
 * 팔레트를 바꿀 때마다 이 파일이 따로 놀았다. CSS 변수는 브라우저가
 * 테마별로 알아서 풀어주므로 표가 한 벌이면 된다.
 */
const NODE_TOKEN: Record<string, string> = {
  "법률": "--cat-infosec",
  "시행령": "--cat-software",
  "시행규칙": "--cat-finance",
  "고시": "--cat-ai",
  "연관법": "--cat-cloud",
  "기관": "--cat-privacy",
};

type NodeColors = { bg: string; border: string; text: string };

function nodeColors(type: string): NodeColors {
  const v = `var(${NODE_TOKEN[type] ?? NODE_TOKEN["법률"]})`;
  return {
    // 카드 위에 얹히므로 --card 를 바탕으로 섞는다 (다크에서도 그대로 성립)
    bg: `color-mix(in oklab, ${v} 12%, var(--card))`,
    border: v,
    text: v,
  };
}
// ---------------------------------------------------------------------------
// 공통 상수 & 헬퍼
// ---------------------------------------------------------------------------

const NODE_W = 170;
const NODE_H = 44;

function isSpineType(type: string): boolean {
  return type === "법률" || type === "시행령" || type === "시행규칙";
}

function makeNodeStyle(colors: { bg: string; border: string; text: string }) {
  return {
    background: colors.bg,
    border: `2px solid ${colors.border}`,
    color: colors.text,
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "13px",
    fontWeight: 600,
    width: `${NODE_W}px`,
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
  };
}

function pushNode(
  nodes: Node[],
  node: HierarchyNode,
  x: number,
  y: number,
) {
  const colors = nodeColors(node.type);
  nodes.push({
    id: node.id,
    position: { x, y },
    data: { label: node.name, type: node.type, fullName: node.fullName },
    style: makeNodeStyle(colors),
  });
}

function pushEdge(
  edges: Edge[],
  sourceId: string,
  target: HierarchyNode,
) {
  const isIndirect = target.type === "연관법" || target.type === "고시";
  edges.push({
    id: `${sourceId}-${target.id}`,
    source: sourceId,
    target: target.id,
    type: "smoothstep",
    style: {
      stroke: "var(--border-strong)",
      strokeWidth: 2,
      strokeDasharray: isIndirect ? "6 3" : undefined,
    },
    animated: !isIndirect,
    label: target.relation || undefined,
    labelStyle: {
      fontSize: 9,
      fill: "var(--muted-foreground)",
      fontWeight: 500,
    },
    labelBgStyle: {
      fill: "var(--card)",
      fillOpacity: 0.85,
    },
    labelBgPadding: [3, 1] as [number, number],
  });
}

// ---------------------------------------------------------------------------
// 레이아웃 A: 법령 계층 (직계 상→하 스파인 + 유관 좌→우 분기)
//
//   연관법1 ─┐                          ┌─ 고시1
//   연관법2 ─┤                          ├─ 고시2
//   연관법3 ─┼─── [정보통신망법] ────────┘
//   연관법4 ─┤          │
//   연관법5 ─┘     [시행령]
//                       │
//                  [시행규칙]
// ---------------------------------------------------------------------------

function layoutLawHierarchy(
  hierarchy: HierarchyNode[],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const SPINE_V = 90;     // 직계 상하 간격
  const BRANCH_H = 60;    // 유관 좌우 간격 (노드 너비 제외)
  const BRANCH_V = 14;    // 유관 노드 간 상하 간격

  for (const root of hierarchy) {
    // 1) 스파인 추출: 법률 → 시행령 → 시행규칙
    const spine: HierarchyNode[] = [];
    const leftMap = new Map<string, HierarchyNode[]>();  // 연관법
    const rightMap = new Map<string, HierarchyNode[]>(); // 고시

    let cur: HierarchyNode | undefined = root;
    while (cur) {
      spine.push(cur);
      leftMap.set(cur.id, cur.children.filter((c) => c.type === "연관법"));
      rightMap.set(cur.id, cur.children.filter((c) => c.type === "고시"));
      cur = cur.children.find((c) => isSpineType(c.type) && c.type !== cur!.type);
    }

    // 2) 좌우 최대 개수 → 중앙 X 결정
    const maxLeft = Math.max(0, ...Array.from(leftMap.values()).map((a) => a.length));
    const centerX = maxLeft > 0 ? NODE_W + BRANCH_H : 0;

    // 3) 스파인 배치 (상→하)
    let y = 0;
    for (let i = 0; i < spine.length; i++) {
      const node = spine[i];
      pushNode(nodes, node, centerX, y);
      if (i > 0) pushEdge(edges, spine[i - 1].id, node);

      // 좌측: 연관법
      const lefts = leftMap.get(node.id) ?? [];
      const leftBlockH = lefts.length * (NODE_H + BRANCH_V) - BRANCH_V;
      let leftY = y + NODE_H / 2 - leftBlockH / 2; // 스파인 노드 중앙 정렬
      for (const left of lefts) {
        pushNode(nodes, left, centerX - NODE_W - BRANCH_H, leftY);
        pushEdge(edges, node.id, left);
        leftY += NODE_H + BRANCH_V;
      }

      // 우측: 고시
      const rights = rightMap.get(node.id) ?? [];
      const rightBlockH = rights.length * (NODE_H + BRANCH_V) - BRANCH_V;
      let rightY = y + NODE_H / 2 - rightBlockH / 2;
      for (const right of rights) {
        pushNode(nodes, right, centerX + NODE_W + BRANCH_H, rightY);
        pushEdge(edges, node.id, right);
        rightY += NODE_H + BRANCH_V;
      }

      // 다음 Y: 스파인 간격 or 분기 블록 높이 중 큰 값
      const branchH = Math.max(leftBlockH, rightBlockH, 0);
      y += Math.max(NODE_H + SPINE_V, branchH + BRANCH_V * 2);
    }
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// 레이아웃 B: 기관 계층 (일반 트리 — 직계 상→하, 동급 좌→우)
//
//              [대통령]
//        ┌───────┼──────────┐
//   [과기정통부] [개보위]  [방통위]
//     ┌──┴──┐
//   [KISA] [NISA]
// ---------------------------------------------------------------------------

function layoutAgencyTree(
  hierarchy: HierarchyNode[],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const H_GAP = 30;  // 동급 기관 좌우 간격
  const V_GAP = 80;  // 상하 계층 간격

  function countLeaves(node: HierarchyNode): number {
    if (node.children.length === 0) return 1;
    return node.children.reduce((sum, c) => sum + countLeaves(c), 0);
  }

  function traverse(
    node: HierarchyNode,
    depth: number,
    xOffset: number,
    parentId?: string,
  ): number {
    const leaves = countLeaves(node);
    const subtreeW = leaves * (NODE_W + H_GAP);
    const nodeX = xOffset + subtreeW / 2 - NODE_W / 2;
    const nodeY = depth * (NODE_H + V_GAP);

    pushNode(nodes, node, nodeX, nodeY);
    if (parentId) pushEdge(edges, parentId, node);

    let childX = xOffset;
    for (const child of node.children) {
      const childLeaves = countLeaves(child);
      const childW = childLeaves * (NODE_W + H_GAP);
      traverse(child, depth + 1, childX, node.id);
      childX += childW;
    }

    return subtreeW;
  }

  let xOff = 0;
  for (const root of hierarchy) {
    const w = traverse(root, 0, xOff);
    xOff += w + H_GAP;
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// 통합 레이아웃 분기
// ---------------------------------------------------------------------------

function computeLayout(
  hierarchy: HierarchyNode[],
): { nodes: Node[]; edges: Edge[] } {
  // 기관 노드만 있으면 트리 레이아웃, 아니면 법령 스파인 레이아웃
  const allAgency = hierarchy.length > 0 && hierarchy.every((h) => h.type === "기관");
  return allAgency
    ? layoutAgencyTree(hierarchy)
    : layoutLawHierarchy(hierarchy);
}

// ---------------------------------------------------------------------------
// 접근성 설명
// ---------------------------------------------------------------------------

function buildA11yDescription(hierarchy: HierarchyNode[]): string {
  const parts: string[] = [];
  function walk(node: HierarchyNode) {
    if (node.children.length > 0) {
      const childNames = node.children.map((c) => c.name).join(", ");
      parts.push(`${node.name}(${node.type})의 하위: ${childNames}`);
    }
    node.children.forEach(walk);
  }
  hierarchy.forEach(walk);
  return parts.length > 0
    ? `법령 계층 구조: ${parts.join(". ")}.`
    : "표시할 법령 계층 구조가 없습니다.";
}

// ---------------------------------------------------------------------------
// 컴포넌트
// ---------------------------------------------------------------------------

export function LawHierarchyGraph({
  hierarchy,
}: {
  hierarchy: HierarchyNode[];
}) {
  const { nodes, edges } = useMemo(
    () => computeLayout(hierarchy),
    [hierarchy],
  );

  const [localNodes, setLocalNodes] = useState(nodes);
  const [localEdges, setLocalEdges] = useState(edges);

  useEffect(() => {
    setLocalNodes(nodes);
    setLocalEdges(edges);
  }, [nodes, edges]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setLocalNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setLocalEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const a11yDescription = useMemo(
    () => buildA11yDescription(hierarchy),
    [hierarchy],
  );

  return (
    <div
      className="w-full h-[500px] border rounded-lg bg-card dark:border-border"
      role="img"
      aria-label="법령 계층 구조 그래프"
    >
      <p className="sr-only">{a11yDescription}</p>
      <ReactFlow
        key={hierarchy.map((h) => h.id).join("-")}
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
