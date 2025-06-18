import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default admin user if doesn't exist
  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        businessName: 'Demo Business',
        whatsappPhoneNumber: '+1234567890',
        aiModelPreference: 'claude-haiku',
        isEmailVerified: true,
      },
    });

    console.log('✅ Created default admin user:', user.email);

    // Create sample prompt templates
    const promptTemplates = [
      {
        name: 'E-commerce Support',
        description: 'Customer support for online stores',
        template: `You are a helpful customer service agent for {{businessName}}.

Customer: {{customerMessage}}

Relevant Info: {{relevantDocuments}}

Provide helpful information about orders, shipping, returns, and products. Be friendly and professional.`,
        category: 'ecommerce',
        variables: JSON.stringify(['businessName', 'customerMessage', 'relevantDocuments']),
        isSystem: true,
      },
      {
        name: 'Restaurant Service',
        description: 'Customer service for restaurants',
        template: `You are a friendly assistant for {{businessName}} restaurant.

Customer: {{customerMessage}}

Menu & Info: {{relevantDocuments}}

Help with reservations, menu questions, hours, and special offers. Be warm and welcoming.`,
        category: 'restaurant',
        variables: JSON.stringify(['businessName', 'customerMessage', 'relevantDocuments']),
        isSystem: true,
      },
      {
        name: 'Professional Services',
        description: 'Support for consultants, lawyers, etc.',
        template: `You are a professional assistant for {{businessName}}.

Client Query: {{customerMessage}}

Service Info: {{relevantDocuments}}

Provide clear, professional information about services, availability, and process. Maintain confidentiality.`,
        category: 'professional',
        variables: JSON.stringify(['businessName', 'customerMessage', 'relevantDocuments']),
        isSystem: true,
      },
      {
        name: 'Health & Wellness',
        description: 'Support for health and wellness businesses',
        template: `You are a caring assistant for {{businessName}}.

Customer: {{customerMessage}}

Health Info: {{relevantDocuments}}

Provide helpful information about services, appointments, and general wellness. Always recommend consulting healthcare professionals for medical advice.`,
        category: 'health',
        variables: JSON.stringify(['businessName', 'customerMessage', 'relevantDocuments']),
        isSystem: true,
      },
      {
        name: 'General Business',
        description: 'General business customer support',
        template: `You are a helpful assistant for {{businessName}}.

Customer Question: {{customerMessage}}

Business Information: {{relevantDocuments}}

Provide accurate, helpful information about our services. Be professional and courteous.`,
        category: 'general',
        variables: JSON.stringify(['businessName', 'customerMessage', 'relevantDocuments']),
        isSystem: true,
      },
    ];

    for (const template of promptTemplates) {
      await prisma.promptTemplate.create({
        data: {
          ...template,
          userId: user.id,
        },
      });
    }

    console.log('✅ Created sample prompt templates');

    // Create sample conversation for demo
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        customerPhone: '+1987654321',
        customerName: 'John Doe',
        status: 'active',
        aiEnabled: true,
      },
    });

    // Create sample messages
    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          content: 'Hi, I need help with my order',
          senderType: 'customer',
          messageType: 'text',
        },
        {
          conversationId: conversation.id,
          content: 'Hello! I\'d be happy to help you with your order. Could you please provide your order number?',
          senderType: 'ai',
          messageType: 'text',
          aiModelUsed: 'claude-haiku',
          processingTimeMs: 1200,
        },
        {
          conversationId: conversation.id,
          content: 'My order number is #12345',
          senderType: 'customer',
          messageType: 'text',
        },
      ],
    });

    console.log('✅ Created sample conversation and messages');
  } else {
    console.log('ℹ️  Admin user already exists, skipping seed');
  }

  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('📝 Default login credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123456');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });