# WhatsApp AI Assistant - Frontend Dashboard

A modern, responsive Next.js 14 dashboard for managing WhatsApp AI customer support automation.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:3001` to see the dashboard.

## 🎯 Features

- **🔐 Authentication**: Login/Register with JWT
- **💬 Conversations**: Manage customer conversations with AI toggle
- **👥 Customers**: Customer relationship management
- **🔗 Webhooks**: Monitor WhatsApp webhook activity
- **⚙️ Settings**: Profile and integration configuration

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

## 🔧 Configuration

Environment variables in `.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_APP_NAME` - Application name

## 📊 Demo Data

The UI gracefully handles missing backend data, showing appropriate empty states and loading indicators.

Perfect for Railway template deployment! 🚀

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