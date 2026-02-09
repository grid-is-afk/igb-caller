# IGB Cold Caller - CRM Configuration Guide

## System Overview
A **Next.js + Supabase** CRM with **direct Retell AI integration** (no n8n required).

- **Frontend**: Manage contacts, bulk import CSVs, trigger calls
- **Database**: Supabase PostgreSQL (via Prisma)
- **Calls**: Direct integration with Retell AI API

## Quick Start

### 1. Environment Setup
Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - Supabase connection string
- `RETELL_API_KEY` - From Retell dashboard
- `RETELL_AGENT_ID` - Your Retell agent ID
- `RETELL_FROM_NUMBER` - Your Retell phone number
- `NEXT_PUBLIC_APP_URL` - Your app's public URL (for webhooks)

### 2. Database Setup
```bash
npx prisma db push
npm run seed
```

### 3. Configure Retell Webhook
In your **Retell AI Dashboard**:
1. Go to your Agent settings
2. Find "Post-call Webhook URL"
3. Set it to: `https://[YOUR_APP_URL]/api/webhooks/outcome`

### 4. Run the App
```bash
npm run dev
```
Open http://localhost:3000

## For Local Development
If testing locally, Retell can't reach `localhost`. Use a tunnel:

```bash
npx localtunnel --port 3000
```

Then update `.env`:
```
NEXT_PUBLIC_APP_URL=https://your-subdomain.loca.lt
```

And update the Retell webhook URL to match.

## Features
- **Dashboard**: Kanban board showing call pipeline (To-Do → In Progress → Review)
- **Clients**: Full client database with search
- **Tasks**: Today's scheduled calls
- **Reports**: Call history with transcripts, export to CSV
- **CSV Import**: Bulk import contacts

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contacts` | GET/POST | List/create contacts |
| `/api/contacts/[id]` | PUT/DELETE | Update/delete contact |
| `/api/trigger-call` | POST | Initiate a call via Retell |
| `/api/webhooks/outcome` | POST | Receives call results from Retell |
| `/api/logs` | GET | Recent call activity |
| `/api/reports` | GET | Grouped call history |

## Troubleshooting

### Calls stuck on "Dialing"
The webhook isn't reaching your app. Check:
1. Is `NEXT_PUBLIC_APP_URL` set correctly?
2. Is the Retell webhook URL configured?
3. If local, is your tunnel running?

### Database connection error
Free Supabase projects pause after 7 days. Go to supabase.com/dashboard and restore it.

### Call fails immediately
Check your Retell configuration:
- Is `RETELL_API_KEY` valid?
- Is `RETELL_FROM_NUMBER` in E.164 format (+1234567890)?
- Is the agent ID correct?
