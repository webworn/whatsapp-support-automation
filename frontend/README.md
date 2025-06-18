# 🎨 WhatsApp AI SAAS Platform - Frontend Dashboard

A modern, responsive Next.js 14 dashboard for the multi-tenant WhatsApp AI customer support SAAS platform.

## 🚀 **Current Status: 90% Complete**

✅ **Complete UI Framework**: All dashboard pages and components built
🔧 **Pending**: Production deployment and backend integration

## 🎯 **SAAS Dashboard Features**

### ✅ **Completed Components**
- **🔐 Authentication**: Login/Register forms with JWT integration
- **💬 Conversations**: Multi-tenant conversation management interface
- **👥 Customers**: Customer relationship management dashboard
- **🔗 Webhooks**: WhatsApp webhook monitoring and testing
- **⚙️ Settings**: Business profile and AI configuration
- **📊 Analytics**: Usage metrics and conversation statistics

### 🔧 **Pending Integration**
- Production deployment alongside backend
- Real-time API integration with authentication endpoints
- WebSocket connection for live conversation updates

## 🛠️ **Local Development**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit dashboard
open http://localhost:3000
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State**: Zustand
- **API**: Axios with interceptors
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 📱 Pages

- `/` - Landing page
- `/login` - User authentication
- `/register` - New user registration
- `/dashboard` - Main dashboard
- `/dashboard/conversations` - Conversation management
- `/dashboard/customers` - Customer overview
- `/dashboard/webhooks` - Webhook monitoring
- `/dashboard/settings` - Configuration

## 🎨 UI Components

Built with custom components following modern design principles:
- Responsive layouts
- Mobile-first design
- Accessibility compliant
- Professional styling

## 🔧 **SAAS Platform Integration**

### **Backend API Integration**
The frontend is designed to connect to the production SAAS backend:
- **API Base URL**: `https://whatsapp-support-automation-production.up.railway.app`
- **Authentication**: JWT token-based with automatic refresh
- **Real-time Updates**: WebSocket connection for live conversations

### **Environment Configuration**
```env
NEXT_PUBLIC_API_URL=https://whatsapp-support-automation-production.up.railway.app
NEXT_PUBLIC_APP_NAME=WhatsApp AI SAAS Platform
```

### **Multi-Tenant Architecture**
- User-specific data isolation
- Business owner profile management
- Customer conversation segregation
- Analytics per business tenant

## 📊 **Dashboard Features**

### **🔐 Authentication Pages**
- User registration with business details
- JWT login with session management
- Password reset and profile management

### **💬 Conversation Management**
- Real-time WhatsApp conversation threads
- AI response toggle per conversation
- Manual agent takeover capability
- Conversation history and search

### **📈 Business Analytics**
- Message volume metrics
- AI response performance
- Customer engagement statistics
- Usage tracking and billing insights

Perfect for Railway SAAS template deployment! 🚀

---

## Original Next.js Documentation

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.