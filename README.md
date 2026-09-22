# GOEURO Education Agency — Team Management System

A scalable, locally runnable organization management and lead conversion platform built for **GOEURO Education Agency**, connecting:

**Marketing Planning → Content Production → Inquiry Capture → Lead Follow-up → Consultation → Student Case Management → Settings & Reporting.**

---

## 🌟 Overview & Strategic Context

GOEURO is an education agency focused initially on two core German pathways:
1. **Germany Ausbildung (Dual Vocational Training)**: Company contract, paid monthly stipend (€900–€1,300), Goethe B1/B2 requirement.
2. **Germany Public Universities**: Tuition-free Bachelor and Master degree programs, regional student semester transit tickets.

The system is designed as a **scalable organizational system**, not hardcoded for five people. New staff members, departments, managers, service pathways, and permissions can be configured through the web interface without code changes.

### Initial Core Team (Configurable Sample Roles from Strategy)
- **Thet Htoo Naing (THN)**: Founder & Marketing/Growth Lead (Paid distribution, hooks, brand direction, brand approval)
- **Kaung Myat Hein (KMH)**: Student Relations & Inquiry Conversion (Inquiry intake, profile assessment, consultations, follow-ups)
- **Ye Yint Tun Thant (YYTT)**: Operations & Content Coordinator (Execution calendar, deadlines, class coordination)
- **Nay Myo Thiha (Nay)**: Malaysia Representative & Ausbildung SME (Topic research, criteria verification, fact-checking, FAQs)
- **Lu Min Myat (Lu)**: Germany Representative (Hamburg) & Experience Lead (Real Germany POV videos, student life)
- **Dynamic 6th Member Support**: Demonstrated via Su Su Hlaing (Junior Counselor).

---

## 🚀 Key Features

1. **Daily Work Command Center & Truthful Pre-Launch Dashboard**:
   - Live personal action feed: assigned tasks, deadlines, pending approvals, scheduled content, and follow-ups.
   - **Truthful Launch State**: Displays zero-inquiry pre-launch reality without fabricated charts, tracking the 30-Day Launch Roadmap (Foundation → Publish → Amplify → Optimize) and monthly KPI targets (20–30 content pieces, 10–12 Germany videos).
   - Manager & Founder view showing overdue tasks across the organization.

2. **Tasks & Projects Operations**:
   - Accountable owner, collaborators, due dates, priority levels (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), and status.
   - Support for recurring weekly cadences and quick 1-click reassignment.
   - Kanban board and table views, optimized for fast mobile touch interactions.

3. **Marketing & Content Operations Machine**:
   - 8-Stage visual workflow board:  
     `Idea → Research → Draft → Factual Review → Brand Approval → Scheduled → Published → Results Recorded`
   - Distinct separation between **Germany Ausbildung** and **Public University** under the GOEURO brand.
   - Stage-gate approvals: Factual Review sign-off (Nay) and Brand Tone sign-off (THN).
   - Records live post URLs, views, clicks, inquiries generated, qualified leads, and ad spend (€).

4. **Public Inquiry Capture & Lead Pipeline**:
   - Public inquiry landing page (`/inquiry`) in **Burmese (မြန်မာ)** and **English**.
   - Captures minimal reply data: Full Name, Preferred Contact (Telegram, Viber, WhatsApp, Phone, Email), Contact Handle, Interested Pathway, Education Background, and Consent.
   - Automatic UTM source attribution (`tiktok_lu_hamburg`, `organic_facebook`, `paid_ads`).
   - Private CRM pipeline: `New`, `Contacted`, `Assessment Needed`, `Qualified`, `Consultation Booked`, `Consultation Completed`, `Application Ready`, `Closed`.
   - Contact logger, follow-up scheduler, duplicate detection, and 1-click consultation booking.

5. **Consultations & Student Cases (Zero-Retyping)**:
   - 1-click conversion from qualified lead into active Student Case with automatic data transfer.
   - Configurable Germany admission milestones: B1/B2 German exam verification, certified translation, Lebenslauf, Ausbildung contract / uni-assist VPD, blocked account, and visa.
   - Document metadata management (`REQUESTED`, `SUBMITTED`, `VERIFIED`, `REJECTED`).
   - Case Handover audit records when transferring students between counselors.

6. **Knowledge Base & Approved SOPs**:
   - Searchable bilingual repository of official FAQs, consultation scripts, SOPs, and brand assets.
   - Burmese and English answers side-by-side with review dates and approval statuses.

7. **Configurable Organization & Team Settings**:
   - Add new staff members (e.g. 6th team member) with multi-team assignment and reporting managers.
   - Role-Based Access Control (RBAC) with granular permission toggles.
   - Service Pathway manager (add future destinations like Switzerland, Austria, or Language Prep).
   - **Staff Offboarding & Reassignment Wizard**: Bulk reassign open tasks, leads, content, and student cases when staff depart or change roles, ensuring zero unowned items.
   - Immutable system audit trail.

8. **Bilingual Typography & Security**:
   - English and Burmese (`Noto Sans Myanmar`, `Pyidaungsu`, `Padauk`) toggle across all public and internal views.
   - Server-side permission enforcement (`lib/auth-server.ts`) protecting sensitive student contact details against unauthorized roles (HTTP 403 Forbidden).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript & React 18
- **Styling**: Tailwind CSS with custom GOEURO color palette (Navy, Gold, Emerald, Slate)
- **Icons**: Lucide React
- **Database**: Prisma ORM with SQLite (100% self-contained local development, zero-config on Windows).  
  *Fully compatible with PostgreSQL for production deployment by changing the datasource provider.*

---

## 📦 Setup & Running Locally

### Prerequisites
- Node.js v18+ (tested on Node v24.15.0)
- npm v10+

### 1. Installation
```bash
# Clone or navigate to the project directory
cd "GOEURO Team Management"

# Install dependencies
npm install
```

### 2. Database Setup & Seeding
```bash
# Initialize SQLite database schema
npx prisma db push

# Seed initial 5 team members, pathways, SOPs, and launch tasks
npm run db:seed
```

### 3. Start Development or Production Server
```bash
# Production server (recommended, pre-built on port 3005)
npm run start

# Or local development mode
npm run dev
```

Open your browser to **`http://localhost:3005`**.

---

## 🧪 Acceptance Test Suite

An automated end-to-end acceptance test script is included in `scripts/test_acceptance.py`. To run:

```bash
python scripts/test_acceptance.py
```

### Verified Test Cases:
1. **Add 6th Staff Member**: Admin adds Su Su Hlaing (Junior Counselor), assigns to Student Relations team with Counselor role, and assigns her a task without code changes.
2. **Staff Offboarding & Reassignment**: Lu Min Myat leaves; admin bulk reassigns his open tasks and leads to Su Su Hlaing, safely deactivating Lu with an audit record.
3. **Ausbildung Content Workflow**: Creates an Ausbildung campaign, drafts content, advances through Factual Review (Nay), Brand Approval (THN), schedules, and records live post URL + results.
4. **Public Inquiry Portal**: Submits bilingual inquiry via `/inquiry`; lead arrives in private queue with UTM source attribution.
5. **Counselor Lead Journey**: Counselor logs contact, books consultation, and converts lead into a Student Case without retyping info.
6. **Permission Security (RBAC)**: Manager sees overdue work; Viewer without `lead:read` gets HTTP 403 Forbidden and restricted lead view.
7. **Zero-Inquiry Truthful Dashboard**: Displays 30-day pre-launch roadmap, Slide 10 KPI targets, and zero fabricated results.

---

## 🔮 Later Features (Future Roadmap)

- WhatsApp & Telegram official webhook integration for direct bi-directional chat syncing.
- Document cloud storage connectors (Google Drive / AWS S3) for certified translation uploads.
- Multi-branch organization support (e.g. Yangon, Mandalay, Hamburg branch offices).
- Automated Goethe-Institut exam date tracking and reminder triggers for students.
