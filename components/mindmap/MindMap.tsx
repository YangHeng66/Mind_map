'use client';

import { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ConnectionLineType,
    ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MindMapNode } from '@/lib/deepseek';

// 自定义节点样式 - 增大字体大小
const nodeStyle = {
    padding: '12px 24px', // 增加内边距
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontSize: '16px', // 增大字体大小
    fontWeight: '500', // 增加字重
    width: 'auto',
    textAlign: 'center' as const,
    minWidth: '120px', // 确保最小宽度
};

// 定义常量 - 大幅增加间距以避免重叠
const levelSpacing = 400; // 层级之间的水平间距
const childSpacing = 250; // 子节点之间的垂直间距

interface MindMapProps {
    data: MindMapNode | null;
}

export default function MindMap({ data }: MindMapProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const mindMapRef = useRef<HTMLDivElement>(null);
    const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);

    // 计算节点文本的近似宽度（用于布局优化）
    const estimateTextWidth = (text: string) => {
        return Math.max(150, text.length * 12); // 增加基础宽度和每个字符的估计宽度
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

        // 计算子树高度 - 新增函数，用于更准确地计算节点所需空间
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
        const dynamicLevelSpacing = Math.max(400, 600 - (maxDepth * 30));

        // 预先计算整个树的高度，用于初始定位
        const totalTreeHeight = calculateSubtreeHeight(data, 0);

        // 递归处理节点 - 完全重写的布局算法
        const processNode = (
            node: MindMapNode,
            position: { x: number, y: number },
            level: number = 0,
            verticalSpace: number = 0, // 分配给当前节点的垂直空间
            siblingIndex: number = 0,  // 当前节点在兄弟节点中的索引
            totalSiblings: number = 1  // 兄弟节点总数
        ) => {
            // 估计节点宽度
            const estimatedWidth = estimateTextWidth(node.text);

            // 添加当前节点 - 根据层级设置不同样式
            nodes.push({
                id: node.id,
                data: { label: node.text },
                position,
                style: {
                    ...nodeStyle,
                    background: level === 0 ? '#0ea5e9' : 'white',
                    color: level === 0 ? 'white' : 'black',
                    fontWeight: level === 0 ? 'bold' : nodeStyle.fontWeight,
                    fontSize: level === 0 ? '18px' : level === 1 ? '16px' : '15px', // 根据层级设置字体大小
                    minWidth: `${estimatedWidth}px`, // 根据文本长度设置最小宽度
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
                const baseSpacing = Math.max(childSpacing, 150 + (level * 50) + (childrenCount * 20));
                const dynamicChildSpacing = baseSpacing * levelMultiplier;

                // 计算子节点布局所需的总垂直空间
                const totalVerticalSpace = totalChildHeight * dynamicChildSpacing;

                // 计算子节点的起始垂直位置
                let startY = position.y - totalVerticalSpace / 2;

                // 水平间距也随层级增加
                const horizontalSpacing = dynamicLevelSpacing + (level * 80);

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

                    // 添加边
                    edges.push({
                        id: `${node.id}-${child.id}`,
                        source: node.id,
                        target: child.id,
                        type: 'smoothstep',
                        animated: false,
                        style: { strokeWidth: 2 },
                    });

                    // 递归处理子节点
                    processNode(
                        child,
                        childPosition,
                        level + 1,
                        childVerticalSpace,
                        i,
                        childrenCount
                    );

                    // 更新下一个子节点的起始位置
                    currentY += childVerticalSpace;
                }
            }
        };

        // 从根节点开始处理
        processNode(data, { x: 0, y: 0 });

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
        <div ref={mindMapRef} className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                connectionLineType={ConnectionLineType.SmoothStep}
                onInit={onInit}
                fitView
                fitViewOptions={{
                    padding: 0.3,
                    includeHiddenNodes: true,
                    minZoom: 0.1,
                    maxZoom: 1.5
                }}
                minZoom={0.05} // 允许更小的缩放以查看大型思维导图
                maxZoom={2}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
            >
                <Controls />
                <Background color="#f8f8f8" gap={16} />
            </ReactFlow>
        </div>
    );
}