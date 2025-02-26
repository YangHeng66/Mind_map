'use client';

import { useState } from 'react';
import { useMindMapStore, HistoryItem } from '@/lib/store';

export default function HistoryList() {
    const { history, loadFromHistory, deleteFromHistory, clearHistory } = useMindMapStore();
    const [isOpen, setIsOpen] = useState(false);

    if (history.length === 0) return null;

    // 格式化日期
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
            <div
                className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 className="text-lg font-medium">历史记录 ({history.length})</h3>
                <button className="text-gray-500">
                    {isOpen ? '收起' : '展开'}
                </button>
            </div>

            {isOpen && (
                <div className="p-4">
                    <div className="max-h-60 overflow-y-auto">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="p-3 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-center"
                            >
                                <div className="flex-1">
                                    <div className="font-medium">{item.topic}</div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(item.timestamp)} · 深度: {item.depth}
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => loadFromHistory(item.id)}
                                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        加载
                                    </button>
                                    <button
                                        onClick={() => deleteFromHistory(item.id)}
                                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {history.length > 0 && (
                        <div className="mt-3 text-right">
                            <button
                                onClick={clearHistory}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                            >
                                清空历史记录
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 