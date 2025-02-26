import axios from 'axios';

// DeepSeek API响应类型
export interface DeepSeekResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// 思维导图节点类型
export interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
}

// DeepSeek API客户端
export class DeepSeekClient {
    private apiKey: string;
    private apiUrl: string;

    constructor() {
        this.apiKey = process.env.DEEPSEEK_API_KEY || '';
        this.apiUrl = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

        if (!this.apiKey) {
            console.warn('DeepSeek API密钥未设置');
        }
    }

    // 生成思维导图
    async generateMindMap(topic: string, depth: number = 3, retries = 2): Promise<MindMapNode> {
        let lastError: any;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const prompt = this.createMindMapPrompt(topic, depth);

                // 如果不是第一次尝试，增加等待时间
                if (attempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, attempt * 2000));
                    console.log(`重试生成思维导图 (${attempt}/${retries})...`);
                }

                const response = await axios.post<DeepSeekResponse>(
                    `${this.apiUrl}/chat/completions`,
                    {
                        model: 'deepseek-chat',
                        messages: [
                            {
                                role: 'system',
                                content: '你是一个专业的思维导图生成助手，擅长将主题拆解为结构化的思维导图。'
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ],
                        temperature: 0.7,
                        max_tokens: 2000
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.apiKey}`
                        },
                        timeout: 60000 // 60秒超时
                    }
                );

                // 验证响应数据结构
                if (!response.data || !response.data.choices || response.data.choices.length === 0) {
                    throw new Error('API返回的数据结构不完整');
                }

                const content = response.data.choices[0].message.content;
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

                if (jsonMatch && jsonMatch[1]) {
                    return JSON.parse(jsonMatch[1]) as MindMapNode;
                }

                throw new Error('无法从响应中解析思维导图数据');
            } catch (error) {
                lastError = error;

                // 如果是最后一次尝试，或者是不应该重试的错误，则直接抛出
                if (attempt === retries ||
                    (axios.isAxiosError(error) && error.response && error.response.status < 500)) {
                    break;
                }
            }
        }

        console.error('生成思维导图失败，已重试多次:', lastError);

        if (axios.isAxiosError(lastError)) {
            if (lastError.code === 'ECONNABORTED') {
                throw new Error('请求超时，请稍后重试');
            }
            if (lastError.response) {
                throw new Error(`API请求失败: ${lastError.response.status} - ${lastError.response.data?.error || lastError.message}`);
            }
        }

        throw lastError;
    }

    // 创建思维导图提示词
    private createMindMapPrompt(topic: string, depth: number): string {
        return `
请为主题"${topic}"创建一个详细的思维导图，深度为${depth}层。

请按照以下JSON格式返回思维导图数据：

\`\`\`json
{
  "id": "root",
  "text": "主题名称",
  "children": [
    {
      "id": "child1",
      "text": "子主题1",
      "children": [
        {
          "id": "child1-1",
          "text": "子主题1-1"
        }
      ]
    },
    {
      "id": "child2",
      "text": "子主题2",
      "children": []
    }
  ]
}
\`\`\`

请确保：
1. 思维导图结构清晰，逻辑合理
2. 每个节点都有唯一的id
3. 内容丰富且相关
4. 严格按照JSON格式返回，不要添加额外的解释

请直接返回JSON格式的思维导图数据，不要有其他内容。
`;
    }
}

// 导出单例实例
export const deepseekClient = new DeepSeekClient(); 