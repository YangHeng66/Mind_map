'use client';

import { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
    Node,
    Edge,
    useNodesState,
    useEdgesState,
    ReactFlowInstance,
    ConnectionLineType,
    Background,
    Controls,
    MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MindMapNode } from '@/lib/deepseek';

// 节点间距
const childSpacing = 100;

// 节点样式
const nodeStyle = {
    padding: '8px 12px',
    borderRadius: '30px', // 圆形节点
    border: '2px solid #ddd',
    fontSize: '14px',
    fontWeight: '500',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    minWidth: '120px',
    maxWidth: '250px',
};

// 分支颜色 - 参考图片中的颜色
const branchColors = [
    '#F9A825', // 橙色
    '#E91E63', // 粉红色
    '#9C27B0', // 紫色
    '#2196F3', // 蓝色
    '#009688', // 青色
    '#4CAF50', // 绿色
    '#F44336', // 红色
    '#673AB7', // 深紫色
];

interface MindMapProps {
    data: MindMapNode | null;
}

export default function HorizontalMindMap({ data }: MindMapProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

    // 计算节点文本的近似宽度（用于布局优化）
    const estimateTextWidth = (text: string) => {
        return Math.max(120, text.length * 10); // 根据文本长度估计宽度
    };

    // 将思维导图数据转换为ReactFlow节点和边
    const processData = useCallback((data: MindMapNode | null) => {
        if (!data) return { nodes: [], edges: [] };

        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // 获取树的最大深度（用于动态调整间距）
        const getMaxDepth = (node: MindMapNode, currentDepth = 0): number => {
            if (!node.children || node.children.length === 0) {
                return currentDepth;
            }

            return Math.max(...node.children.map(child =>
                getMaxDepth(child, currentDepth + 1)
            ));
        };

        // 计算子树高度 - 用于更准确地计算节点所需空间
        const calculateSubtreeHeight = (node: MindMapNode, level: number): number => {
            if (!node.children || node.children.length === 0) {
                return 1; // 叶子节点高度为1个单位
            }

            // 计算所有子树的高度总和
            const totalChildrenHeight = node.children.reduce((sum, child) => {
                return sum + calculateSubtreeHeight(child, level + 1);
            }, 0);

            // 根据层级增加额外空间
            const levelFactor = Math.max(1, 1 + level * 0.2);

            return Math.max(1, totalChildrenHeight * levelFactor);
        };

        const maxDepth = getMaxDepth(data);

        // 根据树的深度动态调整水平间距
        const dynamicLevelSpacing = Math.max(250, 350 - (maxDepth * 20));

        // 预先计算整个树的高度，用于初始定位
        const totalTreeHeight = calculateSubtreeHeight(data, 0);

        // 递归处理节点 - 水平布局算法
        const processNode = (
            node: MindMapNode,
            position: { x: number, y: number },
            level: number = 0,
            verticalSpace: number = 0,
            siblingIndex: number = 0,
            totalSiblings: number = 1,
            parentBranchIndex: number = 0
        ) => {
            // 估计节点宽度
            const estimatedWidth = estimateTextWidth(node.text);

            // 为根节点和一级节点选择不同的样式
            const isRoot = level === 0;
            const isFirstLevel = level === 1;

            // 为每个主分支选择一个颜色
            const branchIndex = isRoot ? 0 : (isFirstLevel ? siblingIndex % branchColors.length : parentBranchIndex);
            const branchColor = branchColors[branchIndex];

            // 添加当前节点
            nodes.push({
                id: node.id,
                data: { label: node.text },
                position,
                style: {
                    ...nodeStyle,
                    background: isRoot ? '#FFF8E1' : 'white',
                    color: 'black',
                    fontWeight: isRoot ? 'bold' : nodeStyle.fontWeight,
                    fontSize: isRoot ? '16px' : '14px',
                    minWidth: `${estimatedWidth}px`,
                    border: `2px solid ${isRoot ? '#FF9800' : (isFirstLevel ? branchColor : '#ddd')}`,
                    borderRadius: '30px',
                },
            });

            // 处理子节点
            if (node.children && node.children.length > 0) {
                const childrenCount = node.children.length;

                // 计算每个子节点的子树高度
                const childHeights = node.children.map(child =>
                    calculateSubtreeHeight(child, level + 1)
                );

                // 计算子树高度总和
                const totalChildHeight = childHeights.reduce((sum, height) => sum + height, 0);

                // 根据层级动态调整垂直间距
                const levelMultiplier = Math.max(1, level * 0.5 + 1);
                // 基础间距随层级和子节点数量增加
                const baseSpacing = Math.max(childSpacing, 80 + (level * 20) + (childrenCount * 10));
                const dynamicChildSpacing = baseSpacing * levelMultiplier;

                // 计算子节点布局所需的总垂直空间
                const totalVerticalSpace = totalChildHeight * dynamicChildSpacing;

                // 计算子节点的起始垂直位置
                let startY = position.y - totalVerticalSpace / 2;

                // 水平间距也随层级增加
                const horizontalSpacing = dynamicLevelSpacing - (level * 20);

                // 处理每个子节点
                let currentY = startY;
                for (let i = 0; i < childrenCount; i++) {
                    const child = node.children[i];
                    const childHeight = childHeights[i];

                    // 为当前子节点分配垂直空间
                    const childVerticalSpace = childHeight * dynamicChildSpacing;

                    // 计算子节点位置 - 在其分配空间的中心
                    const childPosition = {
                        x: position.x + horizontalSpacing,
                        y: currentY + childVerticalSpace / 2,
                    };

                    // 添加边 - 使用分支颜色
                    const edgeColor = isRoot ? branchColors[i % branchColors.length] : branchColor;

                    edges.push({
                        id: `${node.id}-${child.id}`,
                        source: node.id,
                        target: child.id,
                        type: 'smoothstep',
                        animated: false,
                        style: {
                            stroke: edgeColor,
                            strokeWidth: isRoot || isFirstLevel ? 2.5 : 2
                        },
                    });

                    // 递归处理子节点
                    processNode(
                        child,
                        childPosition,
                        level + 1,
                        childVerticalSpace,
                        i,
                        childrenCount,
                        isRoot ? i % branchColors.length : branchIndex
                    );

                    // 更新下一个子节点的起始位置
                    currentY += childVerticalSpace;
                }
            }
        };

        // 从根节点开始处理 - 将根节点放在左侧中央
        processNode(data, { x: 100, y: 0 });

        return { nodes, edges };
    }, []);

    // 当数据变化时更新节点和边
    useEffect(() => {
        if (data) {
            const { nodes: newNodes, edges: newEdges } = processData(data);
            setNodes(newNodes);
            setEdges(newEdges);

            // 延迟执行fitView，确保节点已渲染
            setTimeout(() => {
                if (reactFlowInstanceRef.current) {
                    reactFlowInstanceRef.current.fitView({
                        padding: 0.3,
                        includeHiddenNodes: true,
                        minZoom: 0.1,
                        maxZoom: 1.5
                    });
                }
            }, 200);
        }
    }, [data, processData, setNodes, setEdges]);

    // 保存ReactFlow实例
    const onInit = (instance: ReactFlowInstance) => {
        reactFlowInstanceRef.current = instance;

        // 初始化时适应视图
        setTimeout(() => {
            instance.fitView({
                padding: 0.3,
                includeHiddenNodes: true,
                minZoom: 0.1,
                maxZoom: 1.5
            });
        }, 200);
    };

    if (!data) {
        return <div className="flex items-center justify-center h-full">请先生成思维导图</div>;
    }

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={onInit}
            fitView
            attributionPosition="bottom-right"
            connectionLineType={ConnectionLineType.SmoothStep}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            minZoom={0.1}
            maxZoom={2}
        >
            <Background color="#f8f8f8" gap={16} />
            <Controls />
            <MiniMap
                nodeStrokeColor={(n) => {
                    return '#ddd';
                }}
                nodeColor={(n) => {
                    return '#fff';
                }}
                nodeBorderRadius={30}
            />
        </ReactFlow>
    );
} 