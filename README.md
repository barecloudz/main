# BareCloudz Marketing Agency Platform

A comprehensive marketing agency management platform built with React, Node.js, and PostgreSQL.

## Features

- **Admin Dashboard**: Complete analytics, client management, and project tracking
- **Client Portal**: Secure client access to marketing plans and documents
- **AI-Powered Marketing Plans**: Generate custom marketing strategies using OpenAI
- **Document Management**: PDF generation and file sharing system
- **Blog Management**: Content creation and publishing
- **Contact Form**: Lead capture with spam detection
- **Invoice System**: Automated billing and payment tracking

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express (converted to Vercel serverless functions)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookies
- **AI Integration**: OpenAI GPT-4 for marketing plan generation
- **Deployment**: Vercel serverless platform

## Deployment to Vercel

### Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: Set up a database (recommend [Neon](https://neon.tech) or [Supabase](https://supabase.com))
3. **OpenAI API Key**: Get your API key from [OpenAI](https://platform.openai.com)

### Environment Variables

In your Vercel dashboard, add these environment variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-your-openai-api-key
SESSION_SECRET=your-random-session-secret-key
NODE_ENV=production
```

### Deploy Steps

1. **Upload to GitHub**: Push your code to a GitHub repository
2. **Connect to Vercel**: Import your GitHub repository in Vercel dashboard
3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
   - Framework Preset: `Vite`
4. **Add Environment Variables**: Set all required environment variables
5. **Deploy**: Click deploy and wait for the build to complete

### Database Setup

After deployment, run the database migrations:

```bash
npm run db:push
```

### Post-Deployment Setup

1. **Create Admin User**: Use the seed script to create your first admin user
2. **Configure Domain**: Set up your custom domain in Vercel dashboard
3. **Test All Features**: Verify authentication, AI generation, and file uploads work

## File Structure

```
├── api/                 # Vercel serverless functions
│   ├── auth/           # Authentication endpoints
│   ├── blog-posts.ts   # Blog management
│   ├── contacts.ts     # Contact form handling
│   ├── invoices.ts     # Invoice system
│   └── marketing-plans.ts # AI marketing plan generation
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   └── lib/        # Utilities and helpers
│   └── dist/          # Built frontend (auto-generated)
├── server/            # Original Express server files (converted to serverless)
├── shared/            # Shared TypeScript types and schemas
├── lib/               # Serverless utilities (session management)
├── vercel.json        # Vercel configuration
└── package.json       # Dependencies and scripts
```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run database migrations
npm run db:push
```

## Cost Estimates

### Vercel Hosting
- **Free Tier**: Suitable for testing and small projects
- **Pro Plan**: $20/month for production use with custom domains
- **Enterprise**: Custom pricing for high-traffic applications

### Database (Neon/Supabase)
- **Free Tier**: 0.5GB storage, good for testing
- **Pro Plans**: Start at $19/month for production databases

### OpenAI API
- **Pay-per-use**: Approximately $0.002 per marketing plan generated
- **Monthly estimate**: $10-50 depending on usage

## Support

For deployment issues or questions, refer to:
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Database Guide](https://neon.tech/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Security Notes

- All API keys are secured in environment variables
- Session management uses secure HTTP-only cookies
- Database connections are encrypted
- File uploads are validated and sanitized
- CORS and rate limiting are configured