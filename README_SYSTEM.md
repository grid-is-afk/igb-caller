# IGB Cold Caller Command Center

## System Overview
A **standalone Next.js dashboard** with **direct Retell AI integration**.

- ✅ No n8n required
- ✅ Direct Retell API calls
- ✅ Real-time status updates via webhooks
- ✅ Supabase PostgreSQL database

## Quick Setup

### 1. Install Dependencies
```bash
cd dashboard
npm install
```

### 2. Configure Environment
Add these to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Retell AI (get from dashboard.retellai.com)
RETELL_API_KEY="key_xxxxx"
RETELL_AGENT_ID="agent_xxxxx"
RETELL_FROM_NUMBER="+1234567890"

# Public URL (for webhooks)
NEXT_PUBLIC_APP_URL="https://your-app.com"

# Auth
AUTH_SECRET="random-secret-string"
```

### 3. Setup Database
```bash
npx prisma db push
npm run seed
```

### 4. Configure Retell Webhook
In **Retell AI Dashboard** → Agent Settings → Post-call Webhook:
```
https://[YOUR_APP_URL]/api/webhooks/outcome
```

### 5. Run
```bash
npm run dev
```
Open http://localhost:3000

## Local Development with Tunnel
For local testing, Retell needs to reach your webhook:

```bash
npx localtunnel --port 3000
```

Update `NEXT_PUBLIC_APP_URL` with the tunnel URL.

## Features
- 📊 **Kanban Pipeline**: Visual call management
- 📞 **One-Click Calling**: Direct Retell integration
- 📋 **CSV Import**: Bulk contact upload
- 📈 **Reports**: Call history with transcripts
- 🔐 **Admin Login**: Protected dashboard
