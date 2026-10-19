# Nexora CRM — single integration and deployment guide

## Current status (read before production deployment)
The dashboard, Leads, Team, ImageKit and UI are built in Next.js 16.4.0, JavaScript, Tailwind v4, Base UI, and theme-aware components. Development reads `data/leads-demo.js` and `data/dashboard-*.js`. **The application is NOT end-to-end production-ready until a Node.js authentication, authorization, persistence, and migration backend is implemented.** The new `lib/crm-api.js` is the single network boundary; production startup loads `/api/auth/me`, `/api/team`, `/api/leads`, reports failures explicitly, and never silently seeds local demo data. Writes are deliberately blocked rather than falsely succeeding until API-backed mutation flow is wired.

## 1. Environment and secrets
`npm run dev` makes Next.js set `NODE_ENV=development`; `npm run build && npm run start` sets `NODE_ENV=production`. Don't manually force `NODE_ENV` to toggle features. Demo data is used only in development in `context/LeadsProvider.jsx`. Use `.env.local` locally and server-managed env secrets in deployment; `.env` and `.env.local` must NEVER be committed or distributed. `.env.example` contains placeholders only. `NEXT_PUBLIC_API_BASE_URL` is safe only for a PUBLIC HTTP origin, never DB credentials. After changing env restart Next.js.

## 2. Fix for double scrollbars
The app shell (`components/layout/DashboardShell.jsx`) owns the only vertical page scroll (`#dashboard-page-content`); `html` and `body` are constrained only while the dashboard shell is mounted. Leads table uses `.nexora-table-horizontal` (in `app/globals.css`) for horizontal scrolling with `overflow-y:hidden`. Do not wrap Leads tables in additional fixed-height `overflow-y-auto` containers. Sidebar scroll is independent as designed. On mobile table horizontal scrolling remains available.

## 3. Data flow
Development: `data/leads-demo.js` -> `context/LeadsProvider.jsx` -> `LeadUI.jsx`, Team, pipeline, and details. Client changes persist only in localStorage; not shared across devices. Team stats are derived from the same provider leads. Dashboard demo analytics (`data/dashboard-demo.js`, `data/dashboard-reference-demo.js`, `data/dashboard-insights.js`, `data/dashboard-velocity-demo.js`) are still separate sample aggregates and MUST be replaced by server reporting queries before live use.

Production read path: authenticated browser -> `lib/crm-api.js` -> Node.js API -> MySQL -> normalized response -> shared provider -> views. Required response formats: `GET /api/auth/me` -> `{viewer:{id,role,name,organizationId}}`; `GET /api/team` -> `{team: TeamMember[]}`; `GET /api/leads` -> `{leads: Lead[]}`. Do not send all tenants' data. Keep lead field names consistent (`id`, `ownerId`, `customerType`, `company`, `firstName`, `lastName`, `score`, `profileImage`, `createdAt`, `updatedAt`).

## 4. MySQL through XAMPP + phpMyAdmin
phpMyAdmin is a browser administration interface for **MySQL/MariaDB** in XAMPP, not the app database driver. Start XAMPP MySQL and create `nexora` via phpMyAdmin. Connect Node.js using `mysql2/promise` with a bounded connection pool and parameterized queries. Example:

```js
// TODO(DB): server only, never import into client components
import mysql from 'mysql2/promise';
export const pool = mysql.createPool({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, database: process.env.MYSQL_DATABASE, connectionLimit: 10, waitForConnections: true });
const [rows] = await pool.execute('SELECT id, first_name, last_name FROM leads WHERE organization_id = ? AND owner_id = ?', [organizationId, ownerId]);
```

Suggested tables: `organizations(id)`, `users(id, organization_id, role, active)`, `leads(id, organization_id, owner_id, customer_type, first_name, last_name, email, phone, company_id NULL, status, source, score, created_at, updated_at)`, `companies(id, organization_id, name)`, `media_assets(id, organization_id, module, entity_id, imagekit_file_id, url)`, `lead_stage_history(id, lead_id, from_status, to_status, changed_by, changed_at)`, `tasks(id, organization_id, owner_id, due_at, status)` and append-only audit logs. Add indexes on `(organization_id, owner_id, status)` and `(organization_id, updated_at)`, and foreign keys where appropriate. Use versioned SQL migrations; avoid editing a live schema solely through phpMyAdmin. Individual customers have `company_id=NULL`.

## 5. API endpoints and mutations
- `GET /api/leads?search=&status=&ownerId=&page=&pageSize=` — paginate/filter ON SERVER; response `{leads,total,page,pageSize}`.
- `GET /api/leads/:id` — verify tenant and ownership, then return record.
- `POST /api/leads` — validate input, owner permissions, customer type; create record transactionally.
- `PATCH /api/leads/:id` — optimistic locking/version and audit stage/owner changes.
- `POST /api/leads/bulk-delete` — validate EVERY ID's permission.
- `GET /api/team` and `GET /api/team/stats` — tenant-restricted, group counts from actual leads.
- `POST /api/team/invitations`, `PATCH /api/team/:id` — admin only, don't allow changing last admin, handle agent deactivation and reassignment.
- `GET /api/dashboard/*` — DB aggregates consistently scoped to reporting period and tenant.
- `GET /api/deals`, `GET /api/tasks`, `POST /api/tasks`, `PATCH /api/tasks/:id` — as UI modules come online.
- `GET /api/leads/export?scope=all|selected` — CSV export server-side with export permissions and spreadsheet-formula escaping.

**TODO(API):** Before live deployment convert `createLead`, `updateLead`, `deleteLeads`, `addMember`, `updateMember`, `removeMember` in the provider to async network-backed mutations using `crmApi` and refetch/invalidate Leads, Team, Pipeline, Dashboard. Update `LeadUI.jsx` and `TeamManagement.jsx` handlers to await results and show pending/error states. These functions currently only operate in development and deliberately return failure in production. Do not assume a compile-ready frontend alone makes the system production-operational.

## 6. Authentication / permissions
Never trust `viewerId`, client-selected role, or owner ID as authorization. In production `GET /api/auth/me` derives identity from verified HTTP-only SameSite Secure session cookies. Node.js MUST verify tenant + actor permissions on EVERY read and write, including photo upload and download. Implement rate limits, audit logs, CSRF defenses for cookie writes, robust server validation (e.g. Zod), secure CORS if split origins, and output escaping. Team stats must be derived from the same scoped leads query, not client-loaded page rows. Inactive agents cannot accept assignments.

## 7. ImageKit / privacy
Current route `app/api/media/leads/route.js` is intentionally **development only**. It uses server-only `IMAGEKIT_PRIVATE_KEY`, validates file size/type/signature, and writes ImageKit paths `/nexora/{organizationId}/{module}/{entityId}/{assetType}/`. Before enabling production, attach verified sessions and lead ownership checks; derive organizationId from the session; persist fileId/url in `media_assets`; clean orphan drafts and replaced files. Use signed/private assets for sensitive personal photos and never commit credentials.

## 8. TODO convention (required for future code)
- `TODO(DEMO)` every development-only seed, simulated metric, time, actor, or browser-local mutation.
- `TODO(API)` every missing network read/write/refresh, status/error handling, and server pagination.
- `TODO(DB)` schema, indexes, migrations, and SQL aggregation steps.
- `TODO(AUTH)` tenant and role enforcement.
- `TODO(CLEANUP)` orphaned ImageKit files and lifecycle tasks.

## 9. Production checklist
1. `npm ci`; run lint, build, and smoke tests in both themes and mobile/desktop.
2. Set up separate development/production DB instances, migrations, and a least-privilege MySQL user. XAMPP is for local dev; deploy database and Node.js via a properly secured host, not an exposed personal XAMPP installation.
3. Implement authentication and data API routes; migrate all synchronous provider mutations to async API writes.
4. Implement tenant-scoped DB aggregations for dashboard charts, team stats, and reporting; remove simulated values from production screens.
5. Enable ImageKit production route only after authentication, quotas, cleanup, and access control.
6. Add integration/E2E tests for admin/agent, assignment, CRUD, exports, uploads, and failure states.
7. Validate production under `NODE_ENV=production` (Next.js sets this). Verify no browser localStorage role bypass or private env leakage.

## 10. Code organization
`data/*-demo.js` houses sample fixtures only; `lib/crm-api.js` is the future network boundary; `context/LeadsProvider.jsx` centralizes read/write state and ownership-derived stats; `components/leads/LeadUI.jsx` renders lists/boards/forms, `components/team/TeamManagement.jsx` renders team controls. Later move the provider to SWR or TanStack Query with a cached query layer and keep UI props/API model field names stable.
