'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import { MindMapNode } from '@/lib/deepseek';
import { ReactFlowInstance } from 'reactflow';

interface ExportOptionsProps {
    mindMapData: MindMapNode | null;
    mindMapRef: React.RefObject<HTMLDivElement | null>;
    className?: string;
}

export default function ExportOptions({ mindMapData, mindMapRef, className = '' }: ExportOptionsProps) {
    const [exporting, setExporting] = useState(false);

    // 导出前准备
    const prepareForExport = async () => {
        // 获取ReactFlow实例 - 使用类型断言解决类型问题
        const flowElement = mindMapRef.current?.querySelector('.react-flow');
        // @ts-ignore - ReactFlow在运行时会将__reactFlowInstance附加到DOM元素上
        const reactFlowInstance = flowElement?.__reactFlowInstance as ReactFlowInstance | undefined;

        if (reactFlowInstance) {
            // 保存当前视图状态
            const currentViewport = reactFlowInstance.getViewport();

            // 获取所有节点
            const allNodes = reactFlowInstance.getNodes();

            // 计算所有节点的边界
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            allNodes.forEach((node: any) => {
                const nodeWidth = node.width || 150;
                const nodeHeight = node.height || 50;

                minX = Math.min(minX, node.position.x);
                minY = Math.min(minY, node.position.y);
                maxX = Math.max(maxX, node.position.x + nodeWidth);
                maxY = Math.max(maxY, node.position.y + nodeHeight);
            });

            // 添加更大的边距，确保所有内容可见
            minX -= 150;
            minY -= 150;
            maxX += 150;
            maxY += 150;

            // 计算所需的缩放比例，使所有节点都可见
            const width = maxX - minX;
            const height = maxY - minY;
            const containerWidth = mindMapRef.current?.clientWidth || 1000;
            const containerHeight = mindMapRef.current?.clientHeight || 800;

            const scaleX = containerWidth / width;
            const scaleY = containerHeight / height;

            // 使用更小的缩放比例，确保所有内容可见
            const scale = Math.min(0.6, Math.min(scaleX, scaleY));

            // 设置视图以显示所有节点
            reactFlowInstance.setViewport({
                x: -minX * scale + (containerWidth - width * scale) / 2,
                y: -minY * scale + (containerHeight - height * scale) / 2,
                zoom: scale * 0.9, // 进一步缩小，确保所有内容可见
            });

            // 等待视图更新 - 增加等待时间
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                reactFlowInstance,
                currentViewport,
                bounds: { minX, minY, maxX, maxY, width, height }
            };
        }

        return null;
    };

    // 恢复导出前的视图
    const restoreView = (state: any) => {
        if (state && state.reactFlowInstance && state.currentViewport) {
            const { reactFlowInstance, currentViewport } = state;
            reactFlowInstance.setViewport(currentViewport);
        }
    };

    // 导出为图片
    const exportAsImage = async () => {
        if (!mindMapRef.current || !mindMapData) return;

        try {
            setExporting(true);

            // 准备导出
            const viewState = await prepareForExport();

            // 获取ReactFlow容器
            const flowContainer = mindMapRef.current.querySelector('.react-flow');
            if (!flowContainer) throw new Error('找不到思维导图元素');

            // 创建canvas - 优化配置
            const canvas = await html2canvas(flowContainer as HTMLElement, {
                backgroundColor: '#ffffff',
                scale: 2.5, // 提高导出质量和分辨率
                useCORS: true,
                logging: false,
                allowTaint: true,
                // 确保捕获整个内容
                width: flowContainer.scrollWidth,
                height: flowContainer.scrollHeight,
                // 增加额外选项以提高质量
                imageTimeout: 0,
                ignoreElements: (element) => {
                    // 忽略控制按钮等UI元素
                    return element.classList.contains('react-flow__controls') ||
                        element.classList.contains('react-flow__attribution') ||
                        element.classList.contains('react-flow__panel');
                },
                onclone: (clonedDoc) => {
                    // 在克隆的文档中找到ReactFlow容器
                    const clonedFlow = clonedDoc.querySelector('.react-flow');
                    if (clonedFlow) {
                        // 确保克隆的元素有足够的尺寸
                        (clonedFlow as HTMLElement).style.width = '100%';
                        (clonedFlow as HTMLElement).style.height = '100%';
                        (clonedFlow as HTMLElement).style.overflow = 'visible';
                    }
                    return clonedDoc;
                }
            });

            // 创建下载链接
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `思维导图_${mindMapData.text}.png`;
            link.click();

            // 恢复视图
            restoreView(viewState);
        } catch (error) {
            console.error('导出图片失败:', error);
            alert('导出图片失败，请重试');
        } finally {
            setExporting(false);
        }
    };

    if (!mindMapData) return null;

    return (
        <button
            onClick={exportAsImage}
            disabled={exporting}
            className={`px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center ${className}`}
        >
            {exporting ? '导出中...' : '导出图片'}
        </button>
    );
}