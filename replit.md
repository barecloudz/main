# BareCloudz Marketing Agency Platform

## Overview

BareCloudz is a comprehensive marketing agency management platform built with a modern full-stack architecture. It streamlines client interactions, project tracking, and team collaboration through an intelligent, user-centric interface. The platform combines client management, project tracking, analytics, and AI-powered marketing plan generation in a single cohesive application.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom theming and dark mode support
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based auth with Passport.js
- **File Uploads**: Multer for PDF document handling
- **Email**: Nodemailer with SMTP configuration
- **API**: RESTful endpoints with type-safe validation

### Database Schema
- **Users**: Admin and client roles with profile management
- **Contacts**: Contact form submissions with spam detection
- **Marketing Plans**: AI-generated plans with client association
- **Invoices**: Billing management with PDF generation
- **Blog Posts**: Content management system
- **Documents**: File upload and sharing system
- **Traffic Stats**: Analytics data collection
- **Sessions**: Secure session storage

## Key Components

### Authentication System
- Role-based access control (admin/client)
- Secure password hashing with bcrypt
- Session management with PostgreSQL store
- Protected routes with middleware

### AI Integration
- OpenAI GPT-4 integration for marketing plan generation
- Customizable plan templates and parameters
- Automated content creation based on business requirements

### Document Management
- PDF generation for invoices and marketing plans
- File upload system with validation
- Secure file storage and access control

### Admin Dashboard
- Client management interface
- Analytics and reporting tools
- Contact form management
- Blog content management
- Invoice generation and tracking

### Client Portal
- Personalized dashboard for clients
- Marketing plan access and downloads
- Invoice viewing and payment tracking
- Document library access

## Data Flow

### User Authentication Flow
1. User submits login credentials
2. Server validates against database
3. Session created and stored in PostgreSQL
4. Client receives role-based dashboard access

### Marketing Plan Generation Flow
1. Admin inputs client business parameters
2. Data sent to OpenAI API with structured prompts
3. AI-generated plan processed and stored
4. PDF generated for client download
5. Client notified of plan availability

### File Upload Flow
1. Files validated on client-side
2. Uploaded via multer middleware
3. Stored in secure uploads directory
4. Database record created with file metadata
5. Access controlled by user roles

## External Dependencies

### Core Runtime
- Node.js 18+ with ESM support
- PostgreSQL database (NeonDB serverless)
- SMTP email service (configurable)

### AI Services
- OpenAI API for marketing plan generation
- Anthropic Claude SDK (alternative AI provider)

### Development Tools
- Vite for build process
- TypeScript compiler
- Drizzle Kit for database migrations
- ESBuild for server bundling

### UI/UX Libraries
- Radix UI primitives
- Tailwind CSS framework
- Framer Motion animations
- Lucide React icons

## Deployment Strategy

### Build Process
- Client: Vite builds React app to static files
- Server: ESBuild bundles TypeScript to single JS file
- Database: Drizzle migrations applied automatically

### Production Configuration
- Environment variables for database and API keys
- Session secrets and SMTP configuration
- File upload directory permissions
- PostgreSQL connection pooling

### Hosting Requirements
- Node.js 18+ runtime support
- PostgreSQL database access
- File system write permissions
- Environment variable support

### Deployment Script
Custom deployment script (`deploy.sh`) handles:
- Dependency installation
- Build process execution
- Database schema updates
- Production configuration setup

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```