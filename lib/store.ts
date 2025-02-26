import { create } from 'zustand';
import { MindMapNode } from './deepseek';
import { persist } from 'zustand/middleware';

// 历史记录项类型
export interface HistoryItem {
    id: string;
    topic: string;
    depth: number;
    timestamp: number;
    data: MindMapNode;
}

interface MindMapState {
    topic: string;
    depth: number;
    loading: boolean;
    error: string | null;
    mindMapData: MindMapNode | null;
    history: HistoryItem[];
    setTopic: (topic: string) => void;
    setDepth: (depth: number) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setMindMapData: (data: MindMapNode | null) => void;
    generateMindMap: () => Promise<void>;
    resetMindMap: () => void;
    // 新增历史记录相关方法
    addToHistory: (data: MindMapNode) => void;
    loadFromHistory: (id: string) => void;
    deleteFromHistory: (id: string) => void;
    clearHistory: () => void;
}

export const useMindMapStore = create<MindMapState>()(
    persist(
        (set, get) => ({
            topic: '',
            depth: 3,
            loading: false,
            error: null,
            mindMapData: null,
            history: [],

            setTopic: (topic) => set({ topic }),
            setDepth: (depth) => set({ depth }),
            setLoading: (loading) => set({ loading }),
            setError: (error) => set({ error }),
            setMindMapData: (data) => set({ mindMapData: data }),

            generateMindMap: async () => {
                const { topic, depth } = get();

                if (!topic.trim()) {
                    set({ error: '请输入主题' });
                    return;
                }

                set({ loading: true, error: null });

                try {
                    const response = await fetch('/api/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ topic, depth }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || '生成思维导图失败');
                    }

                    const { data } = await response.json();
                    set({ mindMapData: data, loading: false });

                    // 添加到历史记录
                    if (data) {
                        get().addToHistory(data);
                    }
                } catch (error: any) {
                    set({
                        error: error.message || '生成思维导图时出错',
                        loading: false
                    });
                }
            },

            resetMindMap: () => set({
                mindMapData: null,
                error: null
            }),

            // 添加到历史记录
            addToHistory: (data) => {
                const { topic, depth, history } = get();

                // 创建新的历史记录项
                const newItem: HistoryItem = {
                    id: `history-${Date.now()}`,
                    topic,
                    depth,
                    timestamp: Date.now(),
                    data,
                };

                // 限制历史记录数量为20条
                const updatedHistory = [newItem, ...history].slice(0, 20);
                set({ history: updatedHistory });
            },

            // 从历史记录加载
            loadFromHistory: (id) => {
                const { history } = get();
                const item = history.find(item => item.id === id);

                if (item) {
                    set({
                        topic: item.topic,
                        depth: item.depth,
                        mindMapData: item.data,
                        error: null,
                    });
                }
            },

            // 从历史记录删除
            deleteFromHistory: (id) => {
                const { history } = get();
                const updatedHistory = history.filter(item => item.id !== id);
                set({ history: updatedHistory });
            },

            // 清空历史记录
            clearHistory: () => set({ history: [] }),
        }),
        {
            name: 'mindmap-storage', // localStorage的键名
            partialize: (state) => ({ history: state.history }), // 只持久化历史记录
        }
    )
); 