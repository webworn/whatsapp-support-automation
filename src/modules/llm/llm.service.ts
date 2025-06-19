import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

export interface LlmRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  businessName?: string;
  customerName?: string;
  conversationContext?: string;
  knowledgeBase?: string[];
  userQuery?: string;
}

export interface LlmResponse {
  content: string;
  model: string;
  tokensUsed?: number;
  processingTimeMs: number;
}

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly configService: ConfigService) {}

  async generateResponse(request: LlmRequest): Promise<LlmResponse> {
    const startTime = Date.now();
    
    try {
      const apiKey = this.configService.get<string>('llm.openrouter.apiKey');
      if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const baseUrl = this.configService.get<string>('llm.openrouter.baseUrl');
      const primaryModel = this.configService.get<string>('llm.openrouter.primaryModel');
      const maxTokens = this.configService.get<number>('llm.openrouter.maxTokens');
      const temperature = this.configService.get<number>('llm.openrouter.temperature');

      // Prepare system prompt with knowledge base
      const systemPrompt = this.buildSystemPrompt(
        request.businessName, 
        request.customerName, 
        request.knowledgeBase,
        request.userQuery
      );
      
      // Prepare messages array
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...request.messages.slice(-10), // Keep last 10 messages for context
      ];

      this.logger.log(`Generating AI response with model: ${primaryModel}`);

      const response: AxiosResponse = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model: primaryModel,
          messages,
          max_tokens: maxTokens,
          temperature,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://whatsapp-support-automation.com',
            'X-Title': 'WhatsApp AI Customer Support',
          },
          timeout: this.configService.get<number>('llm.openrouter.timeout'),
        }
      );

      const processingTimeMs = Date.now() - startTime;
      const aiResponse = response.data.choices[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response content from AI model');
      }

      this.logger.log(`AI response generated in ${processingTimeMs}ms`);

      return {
        content: aiResponse.trim(),
        model: primaryModel,
        tokensUsed: response.data.usage?.total_tokens,
        processingTimeMs,
      };

    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      this.logger.error('Failed to generate AI response', {
        error: error.message,
        processingTimeMs,
      });

      // Fallback response
      return {
        content: this.getFallbackResponse(request.businessName),
        model: 'fallback',
        processingTimeMs,
      };
    }
  }

  private buildSystemPrompt(
    businessName?: string, 
    customerName?: string,
    knowledgeBase?: string[],
    userQuery?: string
  ): string {
    const business = businessName || 'our business';
    const customer = customerName || 'the customer';

    let systemPrompt = `You are a helpful AI customer support assistant for ${business}. Your role is to:

1. Provide friendly and professional customer service
2. Answer questions about products, services, and policies using the knowledge base
3. Help resolve customer issues and concerns
4. Escalate complex issues to human agents when needed
5. Keep responses concise and helpful (under 200 words)

Customer Information:
- Customer Name: ${customer}
- Business: ${business}`;

    // Add knowledge base context if available
    if (knowledgeBase && knowledgeBase.length > 0) {
      systemPrompt += `

KNOWLEDGE BASE:
The following information contains relevant documents and policies for ${business}. Use this information to answer customer questions accurately:

${knowledgeBase.map((doc, index) => `--- Document ${index + 1} ---\n${doc.substring(0, 1500)}${doc.length > 1500 ? '...' : ''}`).join('\n\n')}

Important Instructions:
- ALWAYS use information from the knowledge base when relevant to the customer's question
- If the knowledge base contains specific policies, prices, or procedures, reference them accurately
- If the customer asks about something not covered in the knowledge base, acknowledge this and offer to connect them with a human agent
- Cite specific information from the knowledge base when possible (e.g., "According to our policy document...")`;
    }

    systemPrompt += `

Guidelines:
- Always be polite and professional
- Use the knowledge base first to answer questions
- If you don't know something, say so and offer to connect them with a human agent
- Keep responses conversational and helpful
- Focus on solving the customer's immediate need
- Ask clarifying questions if needed
- Maintain conversation context from previous messages

Respond naturally to the customer's message.`;

    return systemPrompt;
  }

  private getFallbackResponse(businessName?: string): string {
    const business = businessName || 'our team';
    
    return `Thank you for contacting ${business}! I'm experiencing some technical difficulties right now, but I've received your message. A member of our team will get back to you shortly to assist you. We appreciate your patience!`;
  }

  async testConnection(): Promise<{ status: string; model?: string; error?: string }> {
    try {
      const response = await this.generateResponse({
        messages: [
          { role: 'user', content: 'Hello, can you confirm you are working?' }
        ],
        businessName: 'Test Business',
      });

      return {
        status: 'connected',
        model: response.model,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  }
}