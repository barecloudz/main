# Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup
- [ ] Create PostgreSQL database (Neon, Supabase, or other provider)
- [ ] Note down connection string: `postgresql://username:password@host:port/database`
- [ ] Test database connection

### 2. API Keys
- [ ] Get OpenAI API key from https://platform.openai.com/api-keys
- [ ] Generate session secret (random 32+ character string)
- [ ] Keep all keys secure and ready to paste

### 3. Code Repository
- [ ] Push all code to GitHub repository
- [ ] Ensure `vercel.json` is in root directory
- [ ] Verify all API endpoints are in `/api` folder

## Vercel Deployment Steps

### 1. Import Project
- [ ] Go to vercel.com dashboard
- [ ] Click "New Project"
- [ ] Import your GitHub repository
- [ ] Select the correct repository

### 2. Configure Build Settings
- [ ] Framework Preset: **Vite**
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `client/dist`
- [ ] Install Command: `npm install`

### 3. Environment Variables
Add these in Vercel dashboard under "Environment Variables":

```
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-your-openai-api-key-here
SESSION_SECRET=your-random-32-character-secret-key
NODE_ENV=production
```

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Check for any build errors

## Post-Deployment

### 1. Database Migration
After first deployment, run database migration:
- [ ] Open Vercel dashboard
- [ ] Go to your project
- [ ] Run: `npm run db:push` (if available in Functions)
- [ ] Or run locally: `npm run db:push` with production DATABASE_URL

### 2. Test Application
- [ ] Visit your Vercel app URL
- [ ] Test login functionality
- [ ] Create test contact form submission
- [ ] Test marketing plan generation
- [ ] Verify all pages load correctly

### 3. Custom Domain (Optional)
- [ ] In Vercel dashboard, go to "Domains"
- [ ] Add your custom domain (e.g., barecloudz.com)
- [ ] Update DNS records as instructed
- [ ] Wait for SSL certificate provisioning

## File Structure (What Gets Deployed)

```
├── api/                 # Serverless functions
│   ├── auth/
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   └── user.ts
│   ├── blog-posts.ts
│   ├── contacts.ts
│   ├── invoices.ts
│   ├── marketing-plans.ts
│   └── users.ts
├── client/dist/         # Built React app
├── lib/                 # Serverless utilities
├── server/             # Server utilities (storage, db, etc.)
├── shared/             # Shared schemas
├── vercel.json         # Vercel configuration
└── package.json        # Dependencies
```

## Common Issues & Solutions

### Build Errors
- Check all imports are correct
- Verify environment variables are set
- Ensure TypeScript files have proper exports

### Database Connection Issues
- Verify DATABASE_URL format
- Check database allows external connections
- Ensure SSL is properly configured

### Authentication Problems
- Verify SESSION_SECRET is set
- Check cookie settings for production
- Ensure CORS headers are configured

### API Function Timeouts
- Check OpenAI API key is valid
- Verify database queries are optimized
- Monitor function execution times

## Monitoring

### Vercel Dashboard
- [ ] Check function invocations
- [ ] Monitor error logs
- [ ] Review performance metrics

### Database Monitoring
- [ ] Monitor connection counts
- [ ] Check query performance
- [ ] Review storage usage

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Database**: https://neon.tech/docs
- **OpenAI API**: https://platform.openai.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/

## Cost Monitoring

### Vercel
- Free tier: 100GB bandwidth, 12 serverless functions
- Pro: $20/month for unlimited usage

### Database
- Neon: Free tier 0.5GB, Pro starts at $19/month
- Supabase: Free tier 500MB, Pro starts at $25/month

### OpenAI
- Pay-per-use: ~$0.002 per marketing plan
- Monitor usage in OpenAI dashboard