'use client';

import { useRef, useState } from 'react';
import { useMindMapStore } from '@/lib/store';
import MindMapForm from '@/components/forms/MindMapForm';
import MindMap from '@/components/mindmap/MindMap';
import HorizontalMindMap from '@/components/mindmap/HorizontalMindMap';
import ExportOptions from '@/components/mindmap/ExportOptions';
import HistoryList from '@/components/history/HistoryList';

export default function Home() {
    const { mindMapData, loading } = useMindMapStore();
    const mindMapRef = useRef<HTMLDivElement>(null);
    // 添加布局类型状态，默认使用水平布局
    const [layoutType, setLayoutType] = useState<'traditional' | 'horizontal'>('horizontal');

    return (
        <main className="flex flex-col min-h-screen bg-gray-50">
            <header className="bg-blue-600 text-white p-4 shadow-md">
                <div className="container mx-auto">
                    <h1 className="text-2xl font-bold">DeepSeek思维导图生成器</h1>
                    <p className="text-sm mt-1 opacity-80">
                        基于DeepSeek大语言模型，快速生成结构化思维导图
                    </p>
                </div>
            </header>

            <div className="container mx-auto flex flex-col md:flex-row flex-1 p-4 gap-6">
                <div className="w-full md:w-1/3 lg:w-1/4">
                    <MindMapForm />

                    {/* 历史记录列表 */}
                    <HistoryList />

                    {mindMapData && (
                        <>
                            {/* 布局切换 */}
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
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

                            {/* 导出选项 */}
                            <ExportOptions
                                mindMapData={mindMapData}
                                mindMapRef={mindMapRef as React.RefObject<HTMLDivElement>}
                            />

                            {/* 操作指南 */}
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
                                <h3 className="text-lg font-medium mb-2">操作指南</h3>
                                <ul className="text-sm space-y-2 list-disc pl-5">
                                    <li>使用鼠标滚轮缩放思维导图</li>
                                    <li>拖动画布移动视图</li>
                                    <li>点击节点可以选中</li>
                                    <li>使用导出按钮保存为图片或PDF</li>
                                </ul>
                            </div>
                        </>
                    )}
                </div>

                <div
                    ref={mindMapRef}
                    className="w-full md:w-2/3 lg:w-3/4 bg-white rounded-lg shadow-md overflow-hidden"
                    style={{ height: '80vh' }} // 增加高度以显示更多内容
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
        </main>
    );
} 