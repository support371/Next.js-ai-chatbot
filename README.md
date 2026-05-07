# OpenGuardians AI Platform

OpenGuardians is a Next.js + Node.js monorepo for AI-powered cybersecurity operations, social automation, briefings, content generation, and Azure deployment.

## Workspace layout

```txt
apps/web        Next.js dashboard
apps/api        Node.js API service
apps/workers    Scheduled jobs and automation triggers
packages/ai     OpenAI orchestration and quota handling
packages/db     Prisma schema and database client
packages/social Social account management and publishing
packages/security RBAC, audit helpers, safety gates
packages/integrations Telegram, Twilio, and external platform clients
infra/azure     Azure Container Apps and job infrastructure
```

## Core modules

- AI Morning Briefing
- Threat Analyzer
- Social Post Writer
- Property Descriptions
- Compliance Summaries
- Social account management
- Auto-upload with approval gates
- Telegram delivery
- Twilio notification path
- Azure Container Apps jobs

## Required environment

Copy `.env.example` and fill secrets locally or through Azure Key Vault.

```bash
cp .env.example .env
```

Never commit real API keys or social account tokens.
