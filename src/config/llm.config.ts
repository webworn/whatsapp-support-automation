import { registerAs } from '@nestjs/config';

export default registerAs('llm', () => ({
  openrouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    primaryModel: process.env.OPENROUTER_PRIMARY_MODEL || 'anthropic/claude-3-sonnet',
    fallbackModel: process.env.OPENROUTER_FALLBACK_MODEL || 'openai/gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENROUTER_MAX_TOKENS) || 500,
    timeout: parseInt(process.env.OPENROUTER_TIMEOUT) || 30000,
    temperature: parseFloat(process.env.OPENROUTER_TEMPERATURE) || 0.7,
    topP: parseFloat(process.env.OPENROUTER_TOP_P) || 1,
    frequencyPenalty: parseFloat(process.env.OPENROUTER_FREQUENCY_PENALTY) || 0,
    presencePenalty: parseFloat(process.env.OPENROUTER_PRESENCE_PENALTY) || 0,
  },
  fallback: {
    enabled: process.env.LLM_FALLBACK_ENABLED === 'true',
    maxRetries: parseInt(process.env.LLM_MAX_RETRIES) || 3,
    retryDelay: parseInt(process.env.LLM_RETRY_DELAY) || 1000,
  },
  cost: {
    trackingEnabled: process.env.LLM_COST_TRACKING === 'true',
    budget: {
      daily: parseFloat(process.env.LLM_DAILY_BUDGET) || 100,
      monthly: parseFloat(process.env.LLM_MONTHLY_BUDGET) || 1000,
    },
  },
}));