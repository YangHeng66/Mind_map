import { NextRequest, NextResponse } from 'next/server';
import { deepseekClient } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
    try {
        const { topic, depth = 3 } = await request.json();

        if (!topic) {
            return NextResponse.json(
                { error: '缺少主题参数' },
                { status: 400 }
            );
        }

        const mindMapData = await deepseekClient.generateMindMap(topic, depth);

        return NextResponse.json({ data: mindMapData });
    } catch (error: any) {
        console.error('生成思维导图API错误:', error);
        return NextResponse.json(
            { error: error.message || '生成思维导图时出错' },
            { status: 500 }
        );
    }
} 