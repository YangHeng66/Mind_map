'use client';

import { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MindMapNode } from '@/lib/deepseek';

interface ExportOptionsProps {
    mindMapData: MindMapNode | null;
    mindMapRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExportOptions({ mindMapData, mindMapRef }: ExportOptionsProps) {
    const [exporting, setExporting] = useState(false);

    // 导出前准备
    const prepareForExport = async () => {
        // 获取ReactFlow实例
        const reactFlowInstance = mindMapRef.current?.querySelector('.react-flow')?.__reactFlowInstance;

        if (reactFlowInstance) {
            // 保存当前视图状态
            const currentViewport = reactFlowInstance.getViewport();

            // 获取所有节点
            const allNodes = reactFlowInstance.getNodes();

            // 计算所有节点的边界
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

            allNodes.forEach(node => {
                const nodeWidth = node.width || 150;
                const nodeHeight = node.height || 50;

                minX = Math.min(minX, node.position.x);
                minY = Math.min(minY, node.position.y);
                maxX = Math.max(maxX, node.position.x + nodeWidth);
                maxY = Math.max(maxY, node.position.y + nodeHeight);
            });

            // 添加边距
            minX -= 100;
            minY -= 100;
            maxX += 100;
            maxY += 100;

            // 计算所需的缩放比例，使所有节点都可见
            const width = maxX - minX;
            const height = maxY - minY;
            const containerWidth = mindMapRef.current?.clientWidth || 1000;
            const containerHeight = mindMapRef.current?.clientHeight || 800;

            const scaleX = containerWidth / width;
            const scaleY = containerHeight / height;

            // 不要放大，只缩小
            const scale = Math.min(0.8, Math.min(scaleX, scaleY));

            // 设置视图以显示所有节点
            reactFlowInstance.setViewport({
                x: -minX * scale + (containerWidth - width * scale) / 2,
                y: -minY * scale + (containerHeight - height * scale) / 2,
                zoom: scale * 0.95, // 稍微缩小一点，确保所有内容可见
            });

            // 等待视图更新
            await new Promise(resolve => setTimeout(resolve, 800));

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

            // 创建canvas
            const canvas = await html2canvas(flowContainer as HTMLElement, {
                backgroundColor: '#ffffff',
                scale: 2, // 提高导出质量
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
                        element.classList.contains('react-flow__attribution');
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

    // 导出为PDF
    const exportAsPDF = async () => {
        if (!mindMapRef.current || !mindMapData) return;

        try {
            setExporting(true);

            // 准备导出
            const viewState = await prepareForExport();

            // 获取ReactFlow容器
            const flowContainer = mindMapRef.current.querySelector('.react-flow');
            if (!flowContainer) throw new Error('找不到思维导图元素');

            // 创建canvas
            const canvas = await html2canvas(flowContainer as HTMLElement, {
                backgroundColor: '#ffffff',
                scale: 2,
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
                        element.classList.contains('react-flow__attribution');
                }
            });

            // 获取图片数据
            const imgData = canvas.toDataURL('image/png');

            // 创建PDF
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'mm',
            });

            // 计算PDF尺寸
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // 计算图像尺寸以适应PDF，留出10mm边距
            const imgWidth = pdfWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // 如果图像高度超过PDF高度，调整PDF格式
            if (imgHeight > pdfHeight - 20) {
                // 创建新的PDF，使用自定义尺寸
                const newPdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: [
                        pdfWidth,
                        imgHeight + 20 // 图像高度 + 20mm边距
                    ]
                });

                newPdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                newPdf.save(`思维导图_${mindMapData.text}.pdf`);
            } else {
                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
                pdf.save(`思维导图_${mindMapData.text}.pdf`);
            }

            // 恢复视图
            restoreView(viewState);
        } catch (error) {
            console.error('导出PDF失败:', error);
            alert('导出PDF失败，请重试');
        } finally {
            setExporting(false);
        }
    };

    if (!mindMapData) return null;

    return (
        <div className="flex space-x-2 mt-4">
            <button
                onClick={exportAsImage}
                disabled={exporting}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
                {exporting ? '导出中...' : '导出为图片'}
            </button>

            <button
                onClick={exportAsPDF}
                disabled={exporting}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
                {exporting ? '导出中...' : '导出为PDF'}
            </button>
        </div>
    );
}