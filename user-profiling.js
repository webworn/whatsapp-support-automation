// User Profiling and Personalization System
// Tracks user behavior, preferences, and conversation patterns

class UserProfiler {
  constructor() {
    this.profiles = new Map(); // In production, use database
  }

  // Analyze user from conversation history
  analyzeUser(phoneNumber, conversations) {
    const profile = this.getOrCreateProfile(phoneNumber);
    
    if (!conversations || conversations.length === 0) {
      return profile;
    }

    // Analyze conversation patterns
    this.updateConversationPatterns(profile, conversations);
    
    // Detect user preferences
    this.detectPreferences(profile, conversations);
    
    // Identify user type and behavior
    this.classifyUserType(profile, conversations);
    
    // Track satisfaction and engagement
    this.updateEngagementMetrics(profile, conversations);
    
    return profile;
  }

  getOrCreateProfile(phoneNumber) {
    if (!this.profiles.has(phoneNumber)) {
      this.profiles.set(phoneNumber, {
        phone: phoneNumber,
        name: null,
        email: null,
        
        // User Classification
        userType: 'new', // new, returning, vip, problematic
        customerTier: 'standard', // standard, premium, enterprise
        
        // Preferences
        communicationStyle: 'formal', // formal, casual, technical
        preferredLanguage: 'en',
        responseLength: 'medium', // short, medium, detailed
        
        // Conversation Patterns
        commonIssues: [],
        preferredTopics: [],
        peakActivityTimes: [],
        averageResponseTime: null,
        
        // Engagement Metrics
        totalConversations: 0,
        totalMessages: 0,
        averageConversationLength: 0,
        satisfactionScore: null,
        escalationRate: 0,
        
        // Historical Context
        pastPurchases: [],
        serviceHistory: [],
        knownIssues: [],
        resolutionHistory: [],
        
        // Behavioral Traits
        isPatient: true,
        isTechnical: false,
        needsDetailedExplanations: false,
        prefersQuickSolutions: true,
        
        // Timing Patterns
        lastActiveTime: new Date(),
        firstInteraction: new Date(),
        typicalSessionDuration: 0,
        
        // Conversation State
        currentContext: {},
        ongoingIssues: [],
        followUpNeeded: false,
        
        updatedAt: new Date()
      });
    }
    
    return this.profiles.get(phoneNumber);
  }

  updateConversationPatterns(profile, conversations) {
    profile.totalConversations = conversations.length;
    profile.totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
    
    if (conversations.length > 0) {
      profile.averageConversationLength = profile.totalMessages / profile.totalConversations;
      
      // Analyze common issues
      const issues = this.extractIssues(conversations);
      profile.commonIssues = this.getTopItems(issues, 5);
      
      // Detect activity patterns
      profile.peakActivityTimes = this.analyzePeakTimes(conversations);
      
      // Calculate session duration
      profile.typicalSessionDuration = this.calculateAverageSessionDuration(conversations);
    }
  }

  detectPreferences(profile, conversations) {
    const allMessages = conversations.flatMap(conv => conv.messages);
    
    // Analyze communication style
    profile.communicationStyle = this.detectCommunicationStyle(allMessages);
    
    // Detect technical level
    profile.isTechnical = this.detectTechnicalLevel(allMessages);
    
    // Analyze response preferences
    profile.needsDetailedExplanations = this.needsDetailedResponses(allMessages);
    profile.prefersQuickSolutions = this.prefersQuickResponses(allMessages);
    
    // Detect patience level
    profile.isPatient = this.assessPatience(conversations);
  }

  classifyUserType(profile, conversations) {
    const daysSinceFirst = (Date.now() - profile.firstInteraction.getTime()) / (1000 * 60 * 60 * 24);
    const conversationFrequency = profile.totalConversations / Math.max(daysSinceFirst, 1);
    
    // Classify user type
    if (profile.totalConversations === 1) {
      profile.userType = 'new';
    } else if (conversationFrequency > 0.5) {
      profile.userType = 'frequent';
    } else if (profile.escalationRate > 0.3) {
      profile.userType = 'problematic';
    } else if (profile.totalConversations > 10 && profile.escalationRate < 0.1) {
      profile.userType = 'vip';
    } else {
      profile.userType = 'returning';
    }
    
    // Determine customer tier
    if (profile.userType === 'vip' || profile.totalConversations > 20) {
      profile.customerTier = 'premium';
    } else if (profile.totalConversations > 50) {
      profile.customerTier = 'enterprise';
    }
  }

  updateEngagementMetrics(profile, conversations) {
    // Calculate escalation rate
    const escalatedConversations = conversations.filter(conv => 
      conv.messages.some(msg => msg.content.toLowerCase().includes('escalat') || 
                              msg.content.toLowerCase().includes('human') ||
                              msg.content.toLowerCase().includes('agent'))
    ).length;
    
    profile.escalationRate = escalatedConversations / conversations.length;
    
    // Estimate satisfaction from conversation patterns
    profile.satisfactionScore = this.estimateSatisfaction(conversations);
  }

  // Helper methods for analysis
  extractIssues(conversations) {
    const issues = [];
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.direction === 'inbound') {
          // Extract keywords that indicate issues
          const keywords = this.extractKeywords(msg.content);
          issues.push(...keywords);
        }
      });
    });
    return issues;
  }

  extractKeywords(message) {
    const issueKeywords = [
      'down', 'error', 'bug', 'crash', 'slow', 'not working', 'broken',
      'refund', 'cancel', 'billing', 'payment', 'charge',
      'login', 'password', 'access', 'account',
      'website', 'app', 'server', 'email', 'mobile'
    ];
    
    const words = message.toLowerCase().split(/\s+/);
    return issueKeywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    );
  }

  getTopItems(items, count) {
    const frequency = {};
    items.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([item]) => item);
  }

  analyzePeakTimes(conversations) {
    const hours = conversations.flatMap(conv => 
      conv.messages.map(msg => new Date(msg.timestamp).getHours())
    );
    
    const hourCounts = {};
    hours.forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  detectCommunicationStyle(messages) {
    const userMessages = messages.filter(msg => msg.direction === 'inbound');
    if (userMessages.length === 0) return 'formal';
    
    const casualIndicators = ['hey', 'hi', 'sup', 'thx', 'u', 'ur', 'lol', 'btw'];
    const formalIndicators = ['hello', 'thank you', 'please', 'regards', 'sincerely'];
    
    let casualCount = 0;
    let formalCount = 0;
    
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      casualIndicators.forEach(indicator => {
        if (content.includes(indicator)) casualCount++;
      });
      formalIndicators.forEach(indicator => {
        if (content.includes(indicator)) formalCount++;
      });
    });
    
    if (casualCount > formalCount) return 'casual';
    if (formalCount > casualCount) return 'formal';
    return 'neutral';
  }

  detectTechnicalLevel(messages) {
    const userMessages = messages.filter(msg => msg.direction === 'inbound');
    const technicalTerms = [
      'api', 'server', 'database', 'ssl', 'dns', 'bandwidth', 'latency',
      'configuration', 'deployment', 'integration', 'framework', 'protocol'
    ];
    
    const technicalCount = userMessages.reduce((count, msg) => {
      const content = msg.content.toLowerCase();
      return count + technicalTerms.filter(term => content.includes(term)).length;
    }, 0);
    
    return technicalCount > userMessages.length * 0.1; // 10% threshold
  }

  needsDetailedResponses(messages) {
    const userMessages = messages.filter(msg => msg.direction === 'inbound');
    const detailRequesters = ['explain', 'detail', 'how', 'why', 'what', 'step by step'];
    
    const detailCount = userMessages.reduce((count, msg) => {
      const content = msg.content.toLowerCase();
      return count + detailRequesters.filter(term => content.includes(term)).length;
    }, 0);
    
    return detailCount > userMessages.length * 0.2;
  }

  prefersQuickResponses(messages) {
    const userMessages = messages.filter(msg => msg.direction === 'inbound');
    const quickIndicators = ['quick', 'fast', 'asap', 'urgent', 'immediately', 'now'];
    
    const quickCount = userMessages.reduce((count, msg) => {
      const content = msg.content.toLowerCase();
      return count + quickIndicators.filter(term => content.includes(term)).length;
    }, 0);
    
    return quickCount > 0 || userMessages.some(msg => msg.content.length < 20);
  }

  assessPatience(conversations) {
    // Check for impatient indicators
    const impatientMessages = conversations.flatMap(conv => conv.messages).filter(msg => {
      if (msg.direction !== 'inbound') return false;
      const content = msg.content.toLowerCase();
      return content.includes('hurry') || content.includes('waiting') || 
             content.includes('still') || content.includes('yet') ||
             content.includes('frustrated') || content.includes('angry');
    });
    
    return impatientMessages.length < conversations.length * 0.1;
  }

  calculateAverageSessionDuration(conversations) {
    if (conversations.length === 0) return 0;
    
    const durations = conversations.map(conv => {
      if (conv.messages.length < 2) return 0;
      const first = new Date(conv.messages[0].timestamp);
      const last = new Date(conv.messages[conv.messages.length - 1].timestamp);
      return (last - first) / (1000 * 60); // minutes
    });
    
    return durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  }

  estimateSatisfaction(conversations) {
    let satisfactionScore = 3.0; // Start neutral (1-5 scale)
    
    const allMessages = conversations.flatMap(conv => conv.messages);
    const userMessages = allMessages.filter(msg => msg.direction === 'inbound');
    
    // Positive indicators
    const positiveWords = ['thank', 'great', 'perfect', 'excellent', 'good', 'helpful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      positiveWords.forEach(word => {
        if (content.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (content.includes(word)) negativeCount++;
      });
    });
    
    // Adjust satisfaction based on sentiment
    satisfactionScore += (positiveCount * 0.5) - (negativeCount * 0.7);
    
    // Cap between 1 and 5
    return Math.max(1, Math.min(5, satisfactionScore));
  }

  // Generate personalized context for AI prompts
  generatePersonalizedContext(phoneNumber, conversations) {
    const profile = this.analyzeUser(phoneNumber, conversations);
    
    return {
      userProfile: {
        type: profile.userType,
        tier: profile.customerTier,
        communicationStyle: profile.communicationStyle,
        technicalLevel: profile.isTechnical ? 'technical' : 'non-technical',
        responsePreference: profile.needsDetailedExplanations ? 'detailed' : 'concise'
      },
      
      conversationHistory: {
        totalConversations: profile.totalConversations,
        commonIssues: profile.commonIssues,
        satisfactionScore: profile.satisfactionScore,
        escalationRate: profile.escalationRate
      },
      
      personalizedInstructions: this.generatePersonalizedInstructions(profile),
      
      contextualReminders: this.generateContextualReminders(profile, conversations)
    };
  }

  generatePersonalizedInstructions(profile) {
    let instructions = [];
    
    // Communication style adjustments
    if (profile.communicationStyle === 'casual') {
      instructions.push('Use a friendly, casual tone - this user prefers informal communication');
    } else if (profile.communicationStyle === 'formal') {
      instructions.push('Maintain a professional, formal tone - this user prefers structured communication');
    }
    
    // Technical level adjustments
    if (profile.isTechnical) {
      instructions.push('This user is technically savvy - you can use technical terms and detailed explanations');
    } else {
      instructions.push('This user prefers simple explanations - avoid technical jargon and use analogies');
    }
    
    // Response length preferences
    if (profile.needsDetailedExplanations) {
      instructions.push('This user appreciates detailed explanations - provide step-by-step guidance');
    } else if (profile.prefersQuickSolutions) {
      instructions.push('This user prefers quick, direct answers - be concise and solution-focused');
    }
    
    // User type specific instructions
    switch (profile.userType) {
      case 'new':
        instructions.push('This is a new customer - be extra welcoming and patient');
        break;
      case 'vip':
        instructions.push('This is a VIP customer - prioritize their request and offer premium support');
        break;
      case 'problematic':
        instructions.push('This user has had issues before - be extra empathetic and offer escalation quickly');
        break;
      case 'frequent':
        instructions.push('This is a frequent user - you can be more direct and efficient');
        break;
    }
    
    // Patience level adjustments
    if (!profile.isPatient) {
      instructions.push('This user can be impatient - provide quick acknowledgment and immediate action steps');
    }
    
    return instructions;
  }

  generateContextualReminders(profile, conversations) {
    let reminders = [];
    
    // Recent issues
    if (profile.commonIssues.length > 0) {
      reminders.push(`User commonly has issues with: ${profile.commonIssues.join(', ')}`);
    }
    
    // Satisfaction concerns
    if (profile.satisfactionScore < 3.0) {
      reminders.push('User has had negative experiences - be extra attentive to their satisfaction');
    }
    
    // Escalation history
    if (profile.escalationRate > 0.2) {
      reminders.push('User frequently needs escalation - consider offering human agent early if issue is complex');
    }
    
    // Recent unresolved issues
    const recentConversation = conversations[conversations.length - 1];
    if (recentConversation && recentConversation.status === 'active') {
      reminders.push('User has an ongoing conversation - check if previous issue was resolved');
    }
    
    return reminders;
  }

  // Get user summary for admin dashboard
  getUserSummary(phoneNumber) {
    const profile = this.profiles.get(phoneNumber);
    if (!profile) return null;
    
    return {
      phone: profile.phone,
      name: profile.name,
      userType: profile.userType,
      customerTier: profile.customerTier,
      totalConversations: profile.totalConversations,
      totalMessages: profile.totalMessages,
      satisfactionScore: profile.satisfactionScore,
      lastActive: profile.lastActiveTime,
      preferredStyle: profile.communicationStyle,
      technicalLevel: profile.isTechnical ? 'Technical' : 'Non-technical',
      commonIssues: profile.commonIssues.slice(0, 3)
    };
  }
}

module.exports = UserProfiler;