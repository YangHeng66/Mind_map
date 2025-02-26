'use client';

import { useState } from 'react';
import { useMindMapStore } from '@/lib/store';

export default function MindMapForm() {
    const {
        topic,
        depth,
        loading,
        error,
        setTopic,
        setDepth,
        generateMindMap
    } = useMindMapStore();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        generateMindMap();
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-blue-50">
                <h2 className="text-xl font-semibold text-blue-800">生成思维导图</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                        主题
                    </label>
                    <input
                        id="topic"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="输入思维导图主题"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="depth" className="block text-sm font-medium text-gray-700 mb-1">
                        深度 ({depth})
                    </label>
                    <input
                        id="depth"
                        type="range"
                        min="1"
                        max="5"
                        value={depth}
                        onChange={(e) => setDepth(parseInt(e.target.value))}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>简单</span>
                        <span>详细</span>
                    </div>
                </div>

                {error && (
                    <div className="p-2 text-sm text-red-600 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? '生成中...' : '生成思维导图'}
                </button>
            </form>
        </div>
    );
} 