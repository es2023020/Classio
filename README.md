# Classio — Tutor CRM & Student Success Platform
> **منصة كلاسيو** — نظام إدارة المدرسين الخصوصيين، السناتر التعليمية، ومتابعة نجاح الطلاب في مصر.

Classio is an Arabic-first, production-grade CRM engineered specifically for Egyptian private tutors, educational centers, and teaching assistants. Built with Next.js 16, Supabase, and Tailwind CSS.

---

## 🌟 Key Capabilities

1. **Egyptian Tutoring Workflow**:
   - Manage student cohorts across physical centers and online halls.
   - Session fees vs. monthly fees, with support for sibling discounts, scholarship exemptions, and custom deductions.
   - InstaPay, Vodafone Cash, and center cash collection tracking with printable thermal/A4 certified receipts.
2. **Pedagogical Success Profiles**:
   - Track attendance, homework submission quality, quiz scores, and weak topics.
   - Academic trajectory analytics (*improving*, *steady*, *needs attention*).
3. **Automated WhatsApp Follow-Up**:
   - Absence alerts, monthly tuition reminders, digital payment receipts, and progress cards with localized variables.
   - Batch sending queue for one-click parent dispatches.
4. **Zero-Login Parent Magic Portal**:
   - Secure parent portal (`/portal/[token]`) protected by cryptographic UUID tokens and server-side phone verification rate-limiting.
5. **Offline-First Resilience**:
   - Works seamlessly in basement center halls with unreliable mobile reception; writes are saved and auto-synced upon reconnecting.
   - Built-in full JSON backup and restore so teachers never lose their data.

---

## 🔒 Security & Architecture

- **Multi-Tenant Row Level Security (RLS)**: Enforced in PostgreSQL via `auth.uid() = user_id`. Tutors can only access their own students, payments, and groups.
- **Protected Subscription Limits**: Database triggers prevent clients from tampering with tier limits or subscription status.
- **Zero Client Credentials**: Super-Admin credentials and verification secrets reside strictly in server-side environment variables and API route handlers (`/api/admin/auth`).
- **Cryptographic Identifiers**: Sequential collision-proof student codes (`STD-YY-XXXX`) backed by unique constraints.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- pnpm (`npm install -g pnpm`)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/classio.git
cd classio

# Install dependencies
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
# Public Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here

# Server-Only credentials (NEVER commit to git)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
CLASSIO_ADMIN_EMAIL=admin@classio.app
CLASSIO_ADMIN_PASSWORD=your-super-strong-password
CLASSIO_ADMIN_PIN=123456
CLASSIO_ADMIN_FORTRESS_KEY=your-secret-entry-key

# App Settings
NEXT_PUBLIC_DEFAULT_CURRENCY=EGP
NEXT_PUBLIC_COUNTRY_CODE=20
```

### 4. Database Setup
In your Supabase Dashboard:
1. Open the **SQL Editor**.
2. Run `supabase/schema.sql` to initialize base tables.
3. Run `supabase/rls-migration.sql` to apply strict Row-Level Security policies and triggers.

---

## 🛠️ Development & Production Scripts

```bash
# Start local development server
pnpm dev

# Run TypeScript typecheck
pnpm typecheck

# Run automated unit tests
pnpm test

# Build production bundle
pnpm build

# Start production server
pnpm start
```

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── admin/auth/      # Server-side admin login & token issuance
│   │   ├── admin/verify-pin/ # Server-side PIN verification
│   │   └── portal/          # Server-side Parent Magic Portal endpoints
│   ├── admin/               # Super-admin command center
│   ├── dashboard/           # Main tutor workspace
│   ├── portal/[token]/      # Parent Magic Portal view
│   ├── checkout/            # InstaPay payment & tier confirmation
│   └── layout.tsx           # Arabic RTL server layout
├── components/
│   ├── modals/              # Student, Group, Payment, Receipt, Backup modals
│   ├── views/               # Dashboard, Students, Groups, Lessons, Reports views
│   └── ui/                  # Accessible buttons, pills, logo components
├── lib/
│   ├── egyptian-helpers.ts  # Phone normalizer, EGP currency, unique student code generator
│   ├── whatsapp-engine.ts   # WhatsApp message composer & dispatcher
│   ├── storage.ts           # Dual-mode storage engine (Supabase + local cache)
│   ├── supabase-auth.ts     # Supabase Auth client integration
│   ├── admin-auth.ts        # Admin session management client
│   └── types.ts             # Strict TypeScript domain interfaces
└── supabase/
    ├── schema.sql           # Base production schema
    └── rls-migration.sql    # Multi-tenant RLS policies & column triggers
```

---

## 📜 License
Private & Proprietary — Developed for Classio Platform.
