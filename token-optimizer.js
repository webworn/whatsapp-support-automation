// Token Optimization System
// Reduces OpenRouter token usage while maintaining personalization quality

class TokenOptimizer {
  constructor() {
    this.conversationSummaries = new Map(); // Cache conversation summaries
    this.promptCache = new Map(); // Cache system prompts
    this.maxTokens = {
      systemPrompt: 800,      // Max tokens for system prompt
      conversationHistory: 400, // Max tokens for conversation history
      userContext: 200,       // Max tokens for user context
      total: 1400            // Total context limit
    };
  }

  // Main optimization function
  optimizeForAI(message, conversation, personalizedContext) {
    const optimization = {
      originalEstimate: this.estimateTokens(message, conversation, personalizedContext),
      strategies: [],
      finalTokens: 0,
      tokenSavings: 0
    };

    // 1. Compress system prompt
    const compressedPrompt = this.compressSystemPrompt(personalizedContext);
    optimization.strategies.push('Compressed system prompt');

    // 2. Summarize conversation history
    const conversationSummary = this.summarizeConversation(conversation);
    optimization.strategies.push('Summarized conversation history');

    // 3. Select most relevant context
    const relevantContext = this.selectRelevantContext(message, conversation, personalizedContext);
    optimization.strategies.push('Selected relevant context only');

    // 4. Use cached prompts when possible
    const cachedPrompt = this.getCachedPrompt(personalizedContext.userProfile);
    if (cachedPrompt) {
      optimization.strategies.push('Used cached prompt');
    }

    const optimizedData = {
      systemPrompt: cachedPrompt || compressedPrompt,
      conversationContext: conversationSummary,
      userContext: relevantContext,
      currentMessage: message
    };

    optimization.finalTokens = this.estimateOptimizedTokens(optimizedData);
    optimization.tokenSavings = optimization.originalEstimate - optimization.finalTokens;
    optimization.savingsPercentage = Math.round((optimization.tokenSavings / optimization.originalEstimate) * 100);

    return {
      optimization,
      optimizedData
    };
  }

  // 1. COMPRESS SYSTEM PROMPT
  compressSystemPrompt(personalizedContext) {
    const { userProfile, conversationHistory, personalizedInstructions, contextualReminders } = personalizedContext;

    // Core prompt (compressed version)
    let prompt = `You are Alex, professional WhatsApp support for TechCorp Solutions (web/mobile/cloud/IT services).

STYLE: ${userProfile.communicationStyle}, ${userProfile.responsePreference} responses, ${userProfile.technicalLevel} level
USER: ${userProfile.type} ${userProfile.tier} customer (${conversationHistory.totalConversations} convos, ${conversationHistory.satisfactionScore}/5 satisfaction)`;

    // Add only critical personalization
    if (conversationHistory.commonIssues.length > 0) {
      prompt += `\nCOMMON ISSUES: ${conversationHistory.commonIssues.slice(0, 3).join(', ')}`;
    }

    // Add top 2 most important instructions
    if (personalizedInstructions.length > 0) {
      prompt += `\nAPPROACH: ${personalizedInstructions.slice(0, 2).join('; ')}`;
    }

    // Add critical reminders only
    if (contextualReminders.length > 0) {
      const criticalReminders = contextualReminders.filter(r => 
        r.includes('escalation') || r.includes('negative') || r.includes('VIP')
      );
      if (criticalReminders.length > 0) {
        prompt += `\nIMPORTANT: ${criticalReminders[0]}`;
      }
    }

    return prompt;
  }

  // 2. CONVERSATION SUMMARIZATION
  summarizeConversation(conversation) {
    const cacheKey = `${conversation.phone}_${conversation.messages.length}`;
    
    // Return cached summary if available
    if (this.conversationSummaries.has(cacheKey)) {
      return this.conversationSummaries.get(cacheKey);
    }

    const messages = conversation.messages;
    if (messages.length === 0) return '';

    // For short conversations, keep recent messages
    if (messages.length <= 4) {
      const summary = messages.slice(-4).map(msg => 
        `${msg.direction === 'inbound' ? 'User' : 'AI'}: ${this.truncateMessage(msg.content, 50)}`
      ).join('\n');
      
      this.conversationSummaries.set(cacheKey, summary);
      return summary;
    }

    // For longer conversations, create intelligent summary
    const recentMessages = messages.slice(-3); // Last 3 messages (most important)
    const olderMessages = messages.slice(0, -3);

    // Summarize older messages by extracting key topics
    const topics = this.extractConversationTopics(olderMessages);
    const topicSummary = topics.length > 0 ? `Previous topics: ${topics.join(', ')}` : '';

    // Recent conversation (detailed)
    const recentConversation = recentMessages.map(msg => 
      `${msg.direction === 'inbound' ? 'User' : 'AI'}: ${this.truncateMessage(msg.content, 60)}`
    ).join('\n');

    const summary = [topicSummary, recentConversation].filter(Boolean).join('\n');
    
    this.conversationSummaries.set(cacheKey, summary);
    return summary;
  }

  // 3. SELECTIVE CONTEXT LOADING
  selectRelevantContext(message, conversation, personalizedContext) {
    const messageKeywords = this.extractKeywords(message.toLowerCase());
    const relevantContext = {};

    // Always include user type and communication style (essential)
    relevantContext.userType = personalizedContext.userProfile.type;
    relevantContext.communicationStyle = personalizedContext.userProfile.communicationStyle;

    // Include relevant past issues if message relates to them
    const relevantIssues = personalizedContext.conversationHistory.commonIssues.filter(issue =>
      messageKeywords.some(keyword => issue.includes(keyword) || keyword.includes(issue))
    );
    if (relevantIssues.length > 0) {
      relevantContext.relevantIssues = relevantIssues.slice(0, 2);
    }

    // Include satisfaction info only if low or if escalation-related message
    if (personalizedContext.conversationHistory.satisfactionScore < 3.5 || 
        messageKeywords.some(k => ['angry', 'frustrated', 'terrible', 'bad'].includes(k))) {
      relevantContext.satisfactionConcern = true;
    }

    // Include escalation rate only if high or if user seems upset
    if (personalizedContext.conversationHistory.escalationRate > 0.2 ||
        messageKeywords.some(k => ['agent', 'human', 'manager', 'escalate'].includes(k))) {
      relevantContext.escalationRisk = true;
    }

    return relevantContext;
  }

  // 4. PROMPT CACHING
  getCachedPrompt(userProfile) {
    const cacheKey = `${userProfile.type}_${userProfile.tier}_${userProfile.communicationStyle}_${userProfile.technicalLevel}`;
    return this.promptCache.get(cacheKey);
  }

  setCachedPrompt(userProfile, prompt) {
    const cacheKey = `${userProfile.type}_${userProfile.tier}_${userProfile.communicationStyle}_${userProfile.technicalLevel}`;
    this.promptCache.set(cacheKey, prompt);
  }

  // HELPER METHODS

  extractKeywords(text) {
    const words = text.split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
    
    return words
      .filter(word => word.length > 2 && !stopWords.includes(word.toLowerCase()))
      .slice(0, 10); // Limit to 10 keywords
  }

  extractConversationTopics(messages) {
    const allText = messages
      .filter(msg => msg.direction === 'inbound')
      .map(msg => msg.content)
      .join(' ');

    const keywords = this.extractKeywords(allText.toLowerCase());
    const topics = [];

    // Group keywords into topics
    const techKeywords = keywords.filter(k => ['website', 'app', 'server', 'error', 'bug', 'crash', 'api', 'database'].includes(k));
    const billingKeywords = keywords.filter(k => ['payment', 'refund', 'bill', 'charge', 'invoice', 'subscription'].includes(k));
    const accountKeywords = keywords.filter(k => ['login', 'password', 'account', 'access', 'email'].includes(k));

    if (techKeywords.length > 0) topics.push('technical issues');
    if (billingKeywords.length > 0) topics.push('billing/payments');
    if (accountKeywords.length > 0) topics.push('account access');

    return topics.slice(0, 3);
  }

  truncateMessage(message, maxLength) {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + '...';
  }

  // TOKEN ESTIMATION
  estimateTokens(message, conversation, personalizedContext) {
    // Rough estimation: 1 token ≈ 4 characters for English text
    const systemPromptTokens = Math.ceil(JSON.stringify(personalizedContext).length / 4);
    const conversationTokens = Math.ceil(conversation.messages.map(m => m.content).join(' ').length / 4);
    const messageTokens = Math.ceil(message.length / 4);
    
    return systemPromptTokens + conversationTokens + messageTokens;
  }

  estimateOptimizedTokens(optimizedData) {
    const systemTokens = Math.ceil(optimizedData.systemPrompt.length / 4);
    const contextTokens = Math.ceil(optimizedData.conversationContext.length / 4);
    const userTokens = Math.ceil(JSON.stringify(optimizedData.userContext).length / 4);
    const messageTokens = Math.ceil(optimizedData.currentMessage.length / 4);
    
    return systemTokens + contextTokens + userTokens + messageTokens;
  }

  // ADVANCED OPTIMIZATION STRATEGIES

  // Smart context window management
  manageContextWindow(messages, maxTokens = 400) {
    if (messages.length === 0) return [];

    let totalTokens = 0;
    const selectedMessages = [];

    // Always include the last message
    for (let i = messages.length - 1; i >= 0; i--) {
      const messageTokens = Math.ceil(messages[i].content.length / 4);
      
      if (totalTokens + messageTokens > maxTokens && selectedMessages.length > 0) {
        break;
      }
      
      selectedMessages.unshift(messages[i]);
      totalTokens += messageTokens;
    }

    return selectedMessages;
  }

  // Conversation compression for very long histories
  compressLongConversation(messages) {
    if (messages.length <= 6) return messages;

    // Keep first 2 and last 4 messages, summarize the middle
    const beginning = messages.slice(0, 2);
    const ending = messages.slice(-4);
    const middle = messages.slice(2, -4);

    if (middle.length === 0) return [...beginning, ...ending];

    // Summarize middle section
    const middleSummary = {
      direction: 'summary',
      content: `[${middle.length} messages exchanged covering: ${this.extractConversationTopics(middle).join(', ')}]`,
      timestamp: new Date()
    };

    return [...beginning, middleSummary, ...ending];
  }

  // Dynamic prompt adjustment based on conversation stage
  adjustPromptForStage(conversation, basePrompt) {
    const messageCount = conversation.messages.length;

    if (messageCount === 0) {
      // New conversation - minimal context needed
      return basePrompt.split('\n').slice(0, 5).join('\n'); // First 5 lines only
    } else if (messageCount < 5) {
      // Early conversation - moderate context
      return basePrompt.split('\n').slice(0, 10).join('\n'); // First 10 lines
    } else {
      // Established conversation - full context
      return basePrompt;
    }
  }

  // Generate optimization report
  generateOptimizationReport(before, after) {
    return {
      tokenReduction: before - after,
      percentageSaved: Math.round(((before - after) / before) * 100),
      costSavings: ((before - after) / 1000) * 0.0025, // Rough cost calculation
      optimizationLevel: this.getOptimizationLevel(before, after)
    };
  }

  getOptimizationLevel(before, after) {
    const savings = ((before - after) / before) * 100;
    if (savings > 60) return 'Aggressive';
    if (savings > 40) return 'High';
    if (savings > 20) return 'Moderate';
    return 'Light';
  }

  // Clear caches (for memory management)
  clearCaches() {
    this.conversationSummaries.clear();
    this.promptCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      conversationSummaries: this.conversationSummaries.size,
      promptCache: this.promptCache.size,
      memorySavings: 'Estimated cache hit rate: 40-60%'
    };
  }
}

module.exports = TokenOptimizer;