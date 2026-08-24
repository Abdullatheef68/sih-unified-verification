# Unified Online Verification and Digital Certification System

**Smart India Hackathon 2026 · Problem Statement SIH 26036**

Legal Metrology – Weighing and Measuring Instruments

## Tech Stack

- **Frontend + Backend**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui-style components
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials + JWT) with role-based access
- **PDF & QR**: pdf-lib + qrcode
- **Charts**: recharts (admin)
- **Icons**: lucide-react

## Roles

| Role | Access |
|------|--------|
| `INSTRUMENT_OWNER` | Register instruments, apply for verification, view certificates |
| `LMO` / `GATC` | Schedule applications, record verification results, issue certificates |
| `ADMIN` | Full cross-state dashboard, statistics, user overview |
| `PUBLIC` | Verify any certificate by ID / QR (no login) |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or Docker)

### 1. Install dependencies

```bash
cd weighbridge-verify
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit DATABASE_URL and NEXTAUTH_SECRET if needed
```

Default `.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/weighbridge_verify?schema=public"
NEXTAUTH_SECRET="sih2026-unified-verification-secret-key-32chars"
NEXTAUTH_URL="http://localhost:3000"
```

Create the database:

```bash
createdb weighbridge_verify   # or via psql / Docker
```

### 3. Migrate & Seed

```bash
npx prisma db push
npm run db:seed
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

Password for all: **`password123`**

| Role | Email |
|------|-------|
| Admin | `admin@lm.gov.in` |
| LMO (TN) | `lmo.tn@lm.gov.in` |
| LMO (KA) | `lmo.ka@lm.gov.in` |
| Owner | `owner1@example.com` … `owner15@example.com` |

Sample certificate IDs after seed: `LM/2026/100001`, `LM/2026/100002`, …

## Happy Path

1. Login as **owner1@example.com**
2. Go to **Instruments** → register a new instrument (or use existing)
3. Click **Apply Verification**
4. Logout → Login as **lmo.tn@lm.gov.in**
5. **Applications** → Assign & Schedule → Record Result → **Pass & Issue Certificate**
6. Note the Certificate Number
7. Open **/verify** (no login) → enter Certificate ID → see live status

## Project Structure

```
app/
  (auth)/login, register
  owner/          # Owner dashboard
  officer/        # LMO/GATC dashboard
  admin/          # Admin dashboard
  verify/         # Public verification
  api/            # REST API routes
components/
lib/              # auth, prisma, utils
prisma/           # schema + seed
```

## API Overview

- `POST /api/auth/register` – Register user
- `GET/POST /api/instruments` – List / create instruments
- `GET/POST /api/applications` – List / create applications
- `PATCH /api/applications/[id]` – Schedule or verify (`action: schedule|verify`)
- `GET /api/verify?id=LM/2026/xxxxx` – Public certificate lookup

## Notes

- Certificate validity defaults to **1 year** from issue date
- Expired certificates are auto-flagged on public verify
- Local file uploads folder: `public/uploads` (prototype)
- For production: use proper secrets, HTTPS, and optionally Cloudinary for photos

Built for Smart India Hackathon 2026.
