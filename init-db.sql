-- SQLite schema for WhatsApp AI Railway Template
-- Manual database initialization to bypass Prisma migration issues

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "passwordHash" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "whatsappPhoneNumber" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Conversations table
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT,
    "aiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "whatsappMessageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Documents table
CREATE TABLE IF NOT EXISTS "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "size" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Prompt Templates table
CREATE TABLE IF NOT EXISTS "PromptTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- LLM Usage table
CREATE TABLE IF NOT EXISTS "LlmUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "cost" REAL NOT NULL DEFAULT 0.0,
    "responseTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Webhook Logs table
CREATE TABLE IF NOT EXISTS "WebhookLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Session_token_idx" ON "Session"("token");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE INDEX IF NOT EXISTS "Conversation_userId_idx" ON "Conversation"("userId");
CREATE INDEX IF NOT EXISTS "Conversation_customerPhone_idx" ON "Conversation"("customerPhone");
CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX IF NOT EXISTS "Message_createdAt_idx" ON "Message"("createdAt");
CREATE INDEX IF NOT EXISTS "Document_userId_idx" ON "Document"("userId");
CREATE INDEX IF NOT EXISTS "PromptTemplate_userId_idx" ON "PromptTemplate"("userId");
CREATE INDEX IF NOT EXISTS "LlmUsage_userId_idx" ON "LlmUsage"("userId");
CREATE INDEX IF NOT EXISTS "LlmUsage_conversationId_idx" ON "LlmUsage"("conversationId");
CREATE INDEX IF NOT EXISTS "WebhookLog_createdAt_idx" ON "WebhookLog"("createdAt");

-- Insert demo user
INSERT OR IGNORE INTO "User" (
    "id", 
    "email", 
    "passwordHash", 
    "businessName", 
    "whatsappPhoneNumber", 
    "isEmailVerified"
) VALUES (
    'demo-user-id-123', 
    'demo@whatsapp-ai.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeNDhMo', -- demo123456
    'Demo Business (WhatsApp)', 
    '+1234567890', 
    true
);