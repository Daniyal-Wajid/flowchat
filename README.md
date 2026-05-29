# FlowChat — WhatsApp Business Automation SaaS

Multi-tenant MVP for appointments, customers, and WhatsApp messaging.

## Stack

- Next.js 16 (App Router) + TypeScript
- PostgreSQL + Prisma 7
- NextAuth (Credentials)
- Tailwind CSS 4

## Quick start

| Goal | Guide |
|------|--------|
| **Deploy live for clients** | [docs/DEPLOY_LIVE.md](../docs/DEPLOY_LIVE.md) |
| Run on your PC (optional) | [docs/GETTING_STARTED.md](../docs/GETTING_STARTED.md) |

```powershell
cd whatsapp-saas
docker compose up -d
Copy-Item .env.example .env
# Edit .env — set NEXTAUTH_SECRET (see GETTING_STARTED.md)
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo accounts

| Role        | Email              | Password  |
|-------------|--------------------|-----------|
| Super admin | admin@flowchat.app | admin123  |
| Business    | owner@demo.com     | demo1234  |

## Features

- Multi-tenant businesses with isolated data
- Customers + appointments CRUD
- WhatsApp confirmations & reminders (mock or Meta)
- Plan limits (Basic / Pro / Business)
- Mock or Stripe billing structure
- Super admin tenant management
- Automated reminders cron (`/api/cron/reminders`)

## Test reminders cron

With dev server running:

```bash
npm run cron:reminders
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed demo data |
| `npm run cron:reminders` | Run reminder job locally |
| `npm run docker:up` | Start Postgres |

## Provider switching

| Env | Values |
|-----|--------|
| `MESSAGING_PROVIDER` | `mock` (default), `meta` |
| `BILLING_PROVIDER` | `mock` (default), `stripe` |

See [docs/NEXT_STEPS.md](../docs/NEXT_STEPS.md) for Meta + Stripe setup.

## Deploy (Vercel)

1. Push to GitHub
2. Import in Vercel, set root to `whatsapp-saas`
3. Add env vars from `.env.example`
4. Use [Neon](https://neon.tech) for `DATABASE_URL`
5. Cron runs daily via `vercel.json` (set `CRON_SECRET` in Vercel)

## Project docs

- **[Getting Started](../docs/GETTING_STARTED.md)** — run locally, deploy, checklist
- [Next Steps Roadmap](../docs/NEXT_STEPS.md)
- [MVP Architecture](../docs/MVP-ARCHITECTURE.md)
