import { NextRequest, NextResponse } from 'next/server';
import { deepseekClient } from '@/lib/deepseek';

// 设置较长的超时时间
export const maxDuration = 60; // 设置为60秒

export async function POST(request: NextRequest) {
    try {
        const { topic, depth = 3 } = await request.json();

        if (!topic) {
            return NextResponse.json(
                { error: '缺少主题参数' },
                { status: 400 }
            );
        }

        // 添加超时控制
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('请求超时，请稍后重试')), 55000);
        });

        // 使用Promise.race实现超时控制
        const mindMapData = await Promise.race([
            deepseekClient.generateMindMap(topic, depth),
            timeoutPromise
        ]) as any;

        return NextResponse.json({ data: mindMapData });
    } catch (error: any) {
        console.error('生成思维导图API错误:', error);

        // 根据错误类型返回不同的状态码
        const statusCode = error.message.includes('超时') ? 504 : 500;

        return NextResponse.json(
            { error: error.message || '生成思维导图时出错' },
            { status: statusCode }
        );
    }
} 