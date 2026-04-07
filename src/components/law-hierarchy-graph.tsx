"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { HierarchyNode } from "@/types/law";

const lightColors: Record<string, { bg: string; border: string; text: string }> = {
  "법률": { bg: "#EFF6FF", border: "#2563EB", text: "#1E40AF" },
  "시행령": { bg: "#ECFDF5", border: "#059669", text: "#065F46" },
  "시행규칙": { bg: "#FFFBEB", border: "#D97706", text: "#92400E" },
  "고시": { bg: "#F5F3FF", border: "#9333EA", text: "#6B21A8" },
};

const darkColors: Record<string, { bg: string; border: string; text: string }> = {
  "법률": { bg: "#1E3A5F", border: "#60A5FA", text: "#BFDBFE" },
  "시행령": { bg: "#1A3A2A", border: "#34D399", text: "#A7F3D0" },
  "시행규칙": { bg: "#3D2E0F", border: "#FBBF24", text: "#FDE68A" },
  "고시": { bg: "#2E1A47", border: "#C084FC", text: "#E9D5FF" },
};

function flattenToNodesAndEdges(
  hierarchy: HierarchyNode[],
  colorMap: typeof lightColors,
  isDark: boolean,
): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 60;
  const HORIZONTAL_GAP = 40;
  const VERTICAL_GAP = 120;

  // First pass: count leaf nodes to determine subtree widths
  function countLeaves(node: HierarchyNode): number {
    if (node.children.length === 0) return 1;
    return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
  }

  // Second pass: position nodes using subtree widths
  function traverse(
    node: HierarchyNode,
    depth: number,
    xOffset: number,
    parentId?: string,
  ): number {
    const colors = colorMap[node.type] || colorMap["법률"];
    const leaves = countLeaves(node);
    const subtreeWidth = leaves * (NODE_WIDTH + HORIZONTAL_GAP);

    // Center this node above its subtree
    const nodeX = xOffset + subtreeWidth / 2 - NODE_WIDTH / 2;
    const nodeY = depth * (NODE_HEIGHT + VERTICAL_GAP);

    nodes.push({
      id: node.id,
      position: { x: nodeX, y: nodeY },
      data: { label: node.name, type: node.type, fullName: node.fullName },
      style: {
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        color: colors.text,
        borderRadius: "12px",
        padding: "12px 20px",
        fontSize: "14px",
        fontWeight: 600,
        minWidth: `${NODE_WIDTH}px`,
        textAlign: "center" as const,
      },
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: "smoothstep",
        style: { stroke: isDark ? "#64748B" : "#94A3B8", strokeWidth: 2 },
        animated: true,
      });
    }

    // Position children
    let childX = xOffset;
    for (const child of node.children) {
      const childLeaves = countLeaves(child);
      const childWidth = childLeaves * (NODE_WIDTH + HORIZONTAL_GAP);
      traverse(child, depth + 1, childX, node.id);
      childX += childWidth;
    }

    return subtreeWidth;
  }

  let xOffset = 0;
  for (const root of hierarchy) {
    const width = traverse(root, 0, xOffset);
    xOffset += width + HORIZONTAL_GAP;
  }

  return { nodes, edges };
}

/** Build a screen-reader description listing parent->child relationships. */
function buildA11yDescription(hierarchy: HierarchyNode[]): string {
  const parts: string[] = [];
  function walk(node: HierarchyNode) {
    if (node.children.length > 0) {
      const childNames = node.children.map((c) => c.name).join(", ");
      parts.push(`${node.name}(${node.type})의 하위 법령: ${childNames}`);
    }
    node.children.forEach(walk);
  }
  hierarchy.forEach(walk);
  return parts.length > 0
    ? `법령 계층 구조: ${parts.join(". ")}.`
    : "표시할 법령 계층 구조가 없습니다.";
}

export function LawHierarchyGraph({
  hierarchy,
}: {
  hierarchy: HierarchyNode[];
}) {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const colorMap = isDark ? darkColors : lightColors;

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => flattenToNodesAndEdges(hierarchy, colorMap, isDark),
    [hierarchy, colorMap, isDark],
  );
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const a11yDescription = useMemo(() => buildA11yDescription(hierarchy), [hierarchy]);

  return (
    <div
      className="w-full h-[500px] border rounded-lg bg-card dark:border-border"
      role="img"
      aria-label="법령 계층 구조 그래프"
    >
      <p className="sr-only">{a11yDescription}</p>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
