---
description: Repository Information Overview
alwaysApply: true
---

# HardbanRecords Lab Information

## Summary
HardbanRecords Lab is a comprehensive AI-powered platform for musicians and authors, designed to streamline the entire creative cycle from concept to monetization. The platform consists of two main modules: Music Publishing and Digital Publishing, both featuring AI-assisted tools for content creation, management, and analytics.

## Structure
- **frontend (root)**: React/TypeScript application with Vite build system
- **backend**: Node.js/Express.js server with PostgreSQL database connection
- **scripts**: Utility scripts for the project

## Repository Components
- **Music Publishing Module**: Tools for music creation, distribution, analytics, and rights management
- **Digital Publishing Module**: Tools for book writing, editing, distribution, and marketing
- **Backend API**: Express.js server providing data persistence and API endpoints

## Projects

### Frontend Application
**Configuration File**: package.json, tsconfig.json, vite.config.ts

#### Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: TypeScript ~5.8.2, ES2022 target
**Build System**: Vite 6.2.0
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- React 19.1.1
- React DOM 19.1.1
- Google Generative AI (@google/genai) 1.15.0
- Zustand 5.0.0-beta.2 (State Management)

**Development Dependencies**:
- TypeScript 5.8.2
- Vite 6.2.0
- @types/node 22.14.0

#### Build & Installation
```bash
npm install
npm run dev    # Development server
npm run build  # Production build
npm run preview  # Preview production build
```

#### Main Files
**Entry Point**: index.tsx, index.html
**Configuration**: vite.config.ts, tsconfig.json
**State Management**: Zustand store

### Backend Server
**Configuration File**: backend/package.json, backend/server.cjs

#### Language & Runtime
**Language**: JavaScript (CommonJS)
**Framework**: Express.js 5.1.0
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- express 5.1.0
- pg 8.16.3 (PostgreSQL client)
- dotenv 17.2.1
- cors 2.8.5
- AWS SDK S3 client (@aws-sdk/client-s3) 3.878.0
- AWS SDK S3 Request Presigner (@aws-sdk/s3-request-presigner) 3.878.0

#### Main Files
**Entry Point**: backend/server.cjs
**Database**: backend/db.cjs
**Routes**:
- backend/routes/api.cjs
- backend/routes/music.cjs
- backend/routes/publishing.cjs
- backend/routes/ai.cjs

#### Database
**Type**: PostgreSQL
**Schema**: backend/db-schema.sql
**Seed Data**: backend/db-seed.sql
**Connection**: Environment variables in .env file

#### Run Command
```bash
cd backend
node server.cjs
```

## API Endpoints
- `GET /api/data`: Fetch all application data
- `/api/music/*`: Music publishing related endpoints
- `/api/publishing/*`: Digital publishing related endpoints
- `/api/ai/*`: AI-related functionality endpoints

## Features
**Music Publishing**:
- Studio for music creation and metadata management
- Releases management
- Analytics and revenue forecasting
- Royalty splits management
- Synchronization opportunities
- Career development tools
- Task management

**Digital Publishing**:
- Manuscript editor with AI assistance
- Book distribution management
- Sales analytics
- Rights management
- Marketing tools with AI-generated content
- Audiobook creation
- World-building tools
- Task management

**AI Integration**:
- Metadata assistance
- Cover generation (imagen-4.0-generate-001)
- Revenue forecasting
- Listener analytics
- Legal assistance
- Writing assistance
- Marketing material generation