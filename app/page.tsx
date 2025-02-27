'use client';

import { useRef, useState } from 'react';
import { useMindMapStore } from '@/lib/store';
import MindMapForm from '@/components/forms/MindMapForm';
import MindMap from '@/components/mindmap/MindMap';
import HorizontalMindMap from '@/components/mindmap/HorizontalMindMap';
import HistoryList from '@/components/history/HistoryList';

export default function Home() {
    const { mindMapData, loading, summary } = useMindMapStore();
    const mindMapRef = useRef<HTMLDivElement>(null);
    // 添加布局类型状态，默认使用水平布局
    const [layoutType, setLayoutType] = useState<'traditional' | 'horizontal'>('horizontal');

    return (
        <main className="flex flex-col min-h-screen bg-gray-50">
            <header className="bg-blue-600 text-white p-4 shadow-md">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-bold">DeepSeek思维导图生成器</h1>
                    <p className="text-sm mt-1 opacity-80">
                        基于DeepSeek大语言模型，快速生成结构化思维导图
                    </p>
                </div>
            </header>

            <div className="container mx-auto flex flex-col md:flex-row flex-1 p-4 gap-6">
                {/* 左侧面板 - 调整宽度和布局 */}
                <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
                    {/* 表单区域 */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <MindMapForm />
                    </div>

                    {/* 布局选择和操作指南 */}
                    {mindMapData && (
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-medium mb-2">布局选择</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setLayoutType('traditional')}
                                        className={`px-3 py-1.5 rounded-md text-sm flex-1 ${layoutType === 'traditional'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        传统布局
                                    </button>
                                    <button
                                        onClick={() => setLayoutType('horizontal')}
                                        className={`px-3 py-1.5 rounded-md text-sm flex-1 ${layoutType === 'horizontal'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        水平布局
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">操作指南</h3>
                                <ul className="text-sm space-y-1 list-disc pl-5">
                                    <li>使用鼠标滚轮缩放思维导图</li>
                                    <li>拖动画布移动视图</li>
                                    <li>点击节点可以选中</li>
                                    <li>点击右上角导出按钮保存为图片</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* 历史记录列表 */}
                    <div className="bg-white rounded-lg shadow-md p-4 flex-grow overflow-auto">
                        <HistoryList />
                    </div>
                </div>

                {/* 右侧思维导图区域 - 调整高度和对齐 */}
                <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-4">
                    {/* 思维导图总结 */}
                    {mindMapData && summary && (
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-lg font-medium mb-2 text-blue-600">思维导图总结</h3>
                            <div className="text-sm text-gray-700 leading-relaxed">
                                {summary}
                            </div>
                        </div>
                    )}

                    {/* 思维导图显示区域 */}
                    <div
                        ref={mindMapRef}
                        className="bg-white rounded-lg shadow-md overflow-hidden flex-grow"
                        style={{ height: 'calc(100vh - 220px)' }} // 动态计算高度，减去头部、总结和内边距
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                    <p className="mt-2 text-gray-600">正在生成思维导图...</p>
                                </div>
                            </div>
                        ) : (
                            layoutType === 'traditional' ? (
                                <MindMap data={mindMapData} />
                            ) : (
                                <HorizontalMindMap data={mindMapData} />
                            )
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
} 