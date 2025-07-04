# BareCloudz Marketing Agency Platform - Deployment Instructions

This document provides step-by-step instructions for deploying the BareCloudz marketing agency platform on Namecheap hosting.

⚠️ **IMPORTANT FIX FOR NAMECHEAP DEPLOYMENT** ⚠️

If you encounter the error `sh: vite: command not found` when running commands on Namecheap hosting, follow these steps:

1. **Create a deployment script file** named `deploy.sh` in your project root:

```bash
#!/bin/bash

# Ensure node_modules binaries are available
export PATH="$PATH:./node_modules/.bin"

# Run the build process
echo "Starting build process..."
npx vite build
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
echo "Build completed!"

# Database migration (if needed)
echo "Checking database schema..."
npx drizzle-kit push
echo "Database schema updated!"
```

2. **Make the script executable:**
```bash
chmod +x deploy.sh
```

3. **Run the script instead of npm commands:**
```bash
./deploy.sh
```

This script ensures that all locally installed binaries are properly accessed when running on Namecheap hosting.

## Prerequisites

Before you begin the deployment process, please ensure you have the following:

1. A Namecheap account with hosting plan (preferably with Node.js support)
2. Access to your domain's DNS settings in Namecheap
3. PostgreSQL database credentials (will be set up during deployment)
4. FTP/SSH access to your hosting account

## Deployment Steps

### 1. Prepare Your Application

1. Create a production build of your application:
   ```bash
   npm run build
   ```

2. This will generate optimized static files in the `dist` directory.

### 2. Set Up a PostgreSQL Database

1. Log in to your Namecheap hosting control panel (cPanel)
2. Navigate to the "Databases" section
3. Click on "PostgreSQL Databases" (or MySQL if PostgreSQL is not available)
4. Create a new database:
   - Database name: `barecloudz_db` (or your preferred name)
   - Create a new database user with a strong password
   - Grant all privileges on the database to the user

5. Note down the following credentials:
   - Database host: (usually localhost or provided by Namecheap)
   - Database port: (usually 5432 for PostgreSQL)
   - Database name: (the one you created)
   - Database username: (the user you created)
   - Database password: (the password you set)

### 3. Deploy the Database Schema

There are two approaches for deploying your database schema:

#### Option 1: Use your local connection to push the schema (Recommended)

1. In your local development environment, update the DATABASE_URL in your `.env` file to point to your production database:
   ```
   DATABASE_URL=postgres://username:password@hostname:port/database_name
   ```

2. Run the database schema migration:
   ```bash
   npm run db:push
   ```

#### Option 2: Manual schema import

1. Export your database schema as SQL:
   ```bash
   npx drizzle-kit generate:pg
   ```

2. Access the PostgreSQL management tool in your hosting control panel (like phpPgAdmin)
3. Import the generated SQL file to set up your schema

### 4. Upload Your Files

#### Using FTP:

1. Connect to your hosting account using an FTP client (like FileZilla)
2. Upload the contents of the `dist` directory to the public directory of your hosting account (usually `public_html` or `www`)
3. Upload your server files to a non-public directory (e.g., create a `server` directory at the same level as the public directory)

### 5. Set Up Node.js Environment

1. Log in to your Namecheap hosting control panel
2. Navigate to the "Advanced" section
3. Look for "Node.js" or "Application Manager"
4. Create a new Node.js application:
   - Application name: BareCloudz
   - Application mode: Production
   - Node.js version: 20.x (or the version you're using)
   - Application startup file: server/index.js
   - Application URL: Your domain or subdomain

### 6. Configure Environment Variables

1. In the Node.js application settings, add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string (postgres://username:password@hostname:port/database_name)
   - `NODE_ENV`: production
   - `SESSION_SECRET`: A long, random string for session encryption
   - `PORT`: The port assigned by Namecheap (usually provided in the Node.js application settings)
   - `OPENAI_API_KEY`: Your OpenAI API key (if you're using AI features)
   - Any other environment variables your application requires

### 7. Set Up Startup Script

Create a startup script in your server directory (e.g., `start.js`):

```javascript
const { execSync } = require('child_process');
const path = require('path');

// Change to the directory where your server code is located
process.chdir(path.join(__dirname, 'server'));

// Start the server
try {
  execSync('node index.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}
```

Update your Node.js application settings to use this startup script.

### 8. Configure Domain and SSL

1. In your Namecheap account, navigate to the Domain List
2. Click on "Manage" next to your domain
3. Go to the "Advanced DNS" tab
4. Update your A record to point to your hosting IP address
5. Enable SSL certificate:
   - In your hosting control panel, find "SSL/TLS" or "SSL Certificates"
   - Request and install a Let's Encrypt certificate for your domain

### 9. Start Your Application

1. In the Node.js application settings in your hosting control panel
2. Click on "Start" or "Restart" to launch your application

### 10. Verify Deployment

1. Visit your domain in a web browser
2. Verify that all pages load correctly
3. Test key functionality such as:
   - User login
   - Client dashboard access
   - Admin features
   - Marketing plan generation
   - Form submissions

## Troubleshooting

### Application Not Starting:
- Check the application logs in your hosting control panel
- Verify environment variables are set correctly
- Ensure the database connection is working

### Database Connection Issues:
- Verify the DATABASE_URL is correct
- Check if your hosting plan allows external database connections
- Ensure the database user has the correct permissions

### Static Files Not Loading:
- Check if the paths in your HTML files are correct
- Verify that the assets are in the correct directories
- Check for CORS issues if loading resources from different domains

## Maintenance and Updates

### Updating Your Application

1. Make changes in your development environment
2. Test thoroughly locally
3. Build your application: `npm run build`
4. Upload the new files to your hosting account
5. If schema changes were made, run database migrations
6. Restart your Node.js application in the hosting control panel

### Regular Maintenance

1. Keep regular backups of your database
2. Monitor application logs for errors
3. Update dependencies regularly to maintain security
4. Set up monitoring for your application to be notified of outages

## Support

For questions or issues with your hosting service, contact Namecheap support:
- Support center: https://www.namecheap.com/support/
- Live chat: Available through your Namecheap account
- Email: support@namecheap.com

For application-specific issues, please refer to the project documentation or contact the BareCloudz development team.