# Milestone 1 (M1_DB_AUTH) Comprehensive Handoff & Implementation Blueprint

## 1. Observation

### Codebase State & File Analysis
- **Prisma Schema** (`prisma/schema.prisma`, lines 1-139):
  - Current models: `User`, `BarberProfile`, `Service`, `PortfolioImage`, `Availability`, `Appointment`, `Review`. Enums: `Role` (CLIENT, BARBER, ADMIN), `LocationType` (STUDIO, HOUSE_CALL), `AppointmentStatus` (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED).
  - Missing schema fields:
    - `slug` in `BarberProfile` (required for public routing `/:barber-slug`).
    - `verificationStatus` enum (`PENDING`, `APPROVED`, `REJECTED`) in `BarberProfile`.
    - `mfaRecoveryKey` in `User` (required for Admin authentication and recovery).
    - `CmsContent` model (required for Admin CMS landing page management `/admin/content/*`).
- **Seed Script** (`prisma/seed.ts`, lines 1-264):
  - Currently seeds 5 barbers without `slug` or `verificationStatus`.
  - Currently seeds only 5 clients (needs 10+).
  - Lacks default `ADMIN` user with `mfaRecoveryKey`.
  - Lacks bi-directional reviews (only 1 client-to-barber review exists).
  - Lacks default CMS content records.
- **API Routes** (`src/app/api/*`):
  - Existing endpoints: `src/app/api/barbers/route.ts` (lines 1-112), `src/app/api/appointments/route.ts` (lines 1-141), `src/app/api/reset-db/route.ts` (lines 1-31).
  - Missing endpoints:
    - Auth APIs: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`, `GET /api/auth/me`.
    - Barber APIs: `GET /api/barbers/[slug]`, `GET/PUT /api/barbers/private`.
    - Admin APIs: `GET/POST /api/admin/verifications`, relocated `POST /api/admin/reset-db`.
- **Helper Utilities** (`src/lib/*`):
  - Existing: `src/lib/prisma.ts` (lines 1-16), `src/lib/geo.ts` (lines 1-20).
  - Missing: `src/lib/auth.ts` (Session token generation, verification, password hashing, cookie management).

---

## 2. Logic Chain

1. **Schema Expansion**:
   - Adding `slug` to `BarberProfile` as `@unique` allows direct lookup by URL slug (e.g. `/marcus-vance`), supporting Milestone 4 requirements.
   - Adding `verificationStatus` enum (`PENDING`, `APPROVED`, `REJECTED`) on `BarberProfile` creates a structured lifecycle for barber registration approval in Milestone 5 & 6.
   - Adding `mfaRecoveryKey` (optional string) on `User` supports Admin MFA recovery capability.
   - Adding `CmsContent` model stores structured content for landing pages (`landing` and `providers-landing`), directly powering Admin CMS routes.

2. **Seed Data Enhancement**:
   - Seeding 5+ mock barbers with unique slugs, dual pricing (`studioPrice` & `houseCallPrice`), working hours (`Availability`), and `APPROVED` status provides complete test data for search and booking.
   - Adding 1 pending barber (`jake-fresh`, `verificationStatus: PENDING`) ensures immediate test coverage for Admin verification APIs.
   - Seeding 10+ clients, realistic past/upcoming appointments, and bi-directional reviews ensures rich analytics and rating computations.
   - Seeding an Admin user (`admin@fadefinder.com`) with `mfaRecoveryKey` enables secure admin authentication.

3. **Auth Stack & Cookie Architecture**:
   - `src/lib/auth.ts` provides reusable cryptography (using Node's `crypto` module for hashing and HMAC signature) and cookie handling (`fadefinder_session`).
   - Standardizing cookie-based session handling ensures Next.js 16 App Router compatibility and seamless user state retrieval in `/api/auth/me`.

4. **API Endpoint Architecture**:
   - `/api/auth/login`, `/register`, `/logout`, `/me` handle user lifecycle and role-based responses.
   - `/api/barbers` is updated to filter by `verificationStatus = APPROVED` and include `slug`.
   - `/api/barbers/[slug]` allows public detail fetching.
   - `/api/barbers/private` manages private profile settings for logged-in barbers.
   - `/api/appointments` handles GET/POST/PATCH workflows with status progression.
   - `/api/admin/verifications` handles pending request listing and approve/reject actions.
   - `/api/admin/reset-db` triggers `npm run db:reset` cleanly with admin authorization.

---

## 3. Caveats

- **Database Compatibility**: SQLite is used for development/testing (`file:./dev.db`). JSON data (e.g., `featuresJson` in `CmsContent`) is stored as a formatted String to maintain compatibility across SQLite and PostgreSQL.
- **Crypto Operations**: Node's built-in `crypto` module (`scrypt` / `pbkdf2` / `createHmac`) is used to avoid external binary dependencies in edge environments.
- **Session Duration**: Default session cookie expiry set to 7 days, with `HttpOnly`, `SameSite=Lax`, and `Path=/`.

---

## 4. Conclusion

Milestone 1 (`M1_DB_AUTH`) provides the foundation for the entire application. The blueprint below specifies the exact schema definitions, seed script additions, authentication library implementation, API endpoints, and Git execution plan needed to execute the milestone seamlessly.

---

## 5. Verification Method

1. **Database Schema & Migration**:
   ```bash
   npx prisma db push
   ```
   *Expected result*: Prisma schema applies without errors, generating updated client types.

2. **Database Reset & Seed**:
   ```bash
   npm run db:reset
   ```
   *Expected result*: Output confirms database scrubbed and seeded with 6 barbers (5 approved, 1 pending), 10 clients, 1 admin, services, appointments, reviews, and CMS content.

3. **Build Verification**:
   ```bash
   npm run build
   ```
   *Expected result*: Next.js build succeeds with 0 TypeScript or lint errors.

4. **API Endpoint Manual Tests**:
   - Test Auth Login: `curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@fadefinder.com","password":"adminpassword123"}'`
   - Test Barber Public Slug: `curl http://localhost:3000/api/barbers/marcus-vance`
   - Test Admin Reset DB: `curl -X POST http://localhost:3000/api/admin/reset-db`

---

## 6. Implementation Blueprint

### Phase A: Prisma Schema Changes (`prisma/schema.prisma`)

```prisma
// Update Enums
enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}

// Update User Model (add mfaRecoveryKey)
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  role         Role     @default(CLIENT)
  phone        String
  firstName    String
  lastName     String
  avatarUrl    String?
  mfaRecoveryKey String? // For Admin MFA recovery
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  barberProfile      BarberProfile?
  clientAppointments Appointment[]  @relation("ClientAppointments")
  givenReviews       Review[]       @relation("ReviewsGiven")
  receivedReviews    Review[]       @relation("ReviewsReceived")
}

// Update BarberProfile Model (add slug & verificationStatus)
model BarberProfile {
  id                   String             @id @default(uuid())
  userId               String             @unique
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  slug                 String             @unique
  bio                  String
  licenseNumber        String
  isVerified           Boolean            @default(false)
  verificationStatus   VerificationStatus @default(PENDING)
  baseAddress          String
  latitude             Float
  longitude            Float
  maxTravelRadiusMiles Float              @default(15.0)
  autoConfirmBookings  Boolean            @default(true)
  rating               Float              @default(5.0)
  reviewCount          Int                @default(0)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  services         Service[]
  portfolioImages  PortfolioImage[]
  availabilities   Availability[]
  appointments     Appointment[]  @relation("BarberAppointments")
}

// Add CMS Content Model
model CmsContent {
  id           String   @id @default(uuid())
  page         String   @unique // 'landing', 'providers-landing'
  title        String
  heroHeading  String
  heroSubheading String
  featuresJson String   // JSON string of feature highlights
  announcement String?
  updatedAt    DateTime @updatedAt
}
```

---

### Phase B: Seed Script Blueprint (`prisma/seed.ts`)

- **Admin User**:
  - `email`: `admin@fadefinder.com`
  - `passwordHash`: Hashed value of `adminpassword123`
  - `role`: `Role.ADMIN`
  - `mfaRecoveryKey`: `ADMIN-RECOVERY-KEY-2026-X89K`
- **6 Barbers**:
  1. `marcus-vance`: Marcus Vance, APPROVED, rating 4.9, studio & house call.
  2. `derek-miller`: Derek Miller, APPROVED, rating 4.8, mobile specialist.
  3. `elena-rostova`: Elena Rostova, APPROVED, rating 5.0, Sugar House studio.
  4. `jamal-blendz`: Jamal Washington, APPROVED, rating 4.7, West Valley cuts.
  5. `carlos-gomez`: Carlos Gomez, APPROVED, rating 4.9, Classic Gentleman cut.
  6. `jake-fresh`: Jake Fresh (`email`: `jake.fresh@example.com`), PENDING verification status, for testing admin verification workflows.
- **10 Clients**:
  - Alex Johnson, Sam Taylor, Jordan Lee, Chris Evans, Pat Morgan, Taylor Swift, Morgan Freeman, Jordan Peele, Sam Smith, Casey Neistat.
- **Bi-Directional Reviews**:
  - Client -> Barber reviews (Alex Johnson -> Marcus Vance).
  - Barber -> Client reviews (Marcus Vance -> Alex Johnson).
- **Default CMS Content**:
  - `page: 'landing'`: Title "Fade Finder | Premier Mobile & Studio Barber Booking", Hero "Fresh Cuts Delivered to Your Door or Shop of Choice".
  - `page: 'providers-landing'`: Title "Fade Finder for Barbers | Grow Your Independent Business", Hero "Fill Your Chair & Scale Your Mobile Barbering Business".

---

### Phase C: Authentication Helper (`src/lib/auth.ts`)

Define functions:
- `hashPassword(password: string): Promise<string>`
- `verifyPassword(password: string, hash: string): Promise<boolean>`
- `createSessionToken(payload: { userId: string; email: string; role: string }): string`
- `verifySessionToken(token: string): { userId: string; email: string; role: string } | null`
- `getSessionUser(request: Request): Promise<UserSession | null>`
- `setSessionCookie(response: NextResponse, token: string): void`
- `clearSessionCookie(response: NextResponse): void`

---

### Phase D: API Specs & Route Design

1. **`POST /api/auth/login`**:
   - Accepts `{ email, password }`.
   - Validates credentials against `User` table.
   - Sets HTTP-only `fadefinder_session` cookie.
   - Returns `{ success: true, user: { id, email, firstName, lastName, role, mfaRecoveryKey, barberProfile } }`.

2. **`POST /api/auth/register`**:
   - Accepts `{ role, email, password, firstName, lastName, phone, bio, licenseNumber, baseAddress, latitude, longitude }`.
   - Checks if email exists.
   - Hashes password. Creates `User`.
   - If `BARBER`, generates slug from `firstName-lastName` (ensuring uniqueness) and sets `verificationStatus: PENDING`.
   - Sets HTTP-only session cookie and returns user object.

3. **`POST /api/auth/logout`**:
   - Clears `fadefinder_session` cookie.
   - Returns `{ success: true, message: "Logged out successfully" }`.

4. **`GET /api/auth/me`**:
   - Checks session cookie.
   - Returns user details including role and profile if authenticated, or 401 unauthenticated.

5. **`GET /api/barbers`**:
   - Filters barbers with `verificationStatus = APPROVED`.
   - Supports search by query, location (`lat`, `lng`), type (`STUDIO` / `HOUSE_CALL`), min rating, max distance.
   - Includes `slug` in output payload.

6. **`GET /api/barbers/[slug]`**:
   - Lookup barber by `slug` (or ID fallback).
   - Includes user details, services, portfolio, working hours, and reviews.

7. **`GET / PUT /api/barbers/private`**:
   - Authenticated route for `Role.BARBER`.
   - GET: Fetches full profile details including autoConfirm, maxTravelRadius, services, and availabilities.
   - PUT: Updates bio, baseAddress, coords, travel radius, autoConfirm, services, and working hours.

8. **`GET / POST / PATCH /api/appointments`**:
   - GET: Returns client's or barber's appointments based on session role.
   - POST: Creates appointment with automatic price calculation and auto-confirm check.
   - PATCH: Updates status (`CONFIRMED`, `COMPLETED`, `CANCELLED`).

9. **`GET / POST /api/admin/verifications`**:
   - GET: Lists all pending barber profiles (`verificationStatus = PENDING`).
   - POST: Accepts `{ barberProfileId, action: 'APPROVE' | 'REJECT' }`, updates status to `APPROVED` or `REJECTED` and sets `isVerified`.

10. **`POST /api/admin/reset-db`**:
    - Executes database reset (`npm run db:reset`).
    - Protected endpoint requiring Admin authentication or system reset key.

---

### Phase E: Git Workflow Strategy

Execute the following commands sequentially on the workspace:

1. **Create Branch**:
   ```bash
   git checkout -b feature/db-auth-foundation
   ```

2. **Commit 1: Schema Updates**:
   ```bash
   git add prisma/schema.prisma
   git commit -m "feat(db): update prisma schema with slug, verificationStatus, mfaRecoveryKey, and CmsContent"
   ```

3. **Commit 2: Seed Script Expansion**:
   ```bash
   git add prisma/seed.ts
   git commit -m "feat(seed): expand seed script with 6 barbers, 10 clients, admin MFA key, and CMS content"
   ```

4. **Commit 3: Auth Library & Auth APIs**:
   ```bash
   git add src/lib/auth.ts src/app/api/auth/*
   git commit -m "feat(auth): implement session helpers and login/register/logout/me API routes"
   ```

5. **Commit 4: Barber & Appointment APIs**:
   ```bash
   git add src/app/api/barbers/* src/app/api/appointments/*
   git commit -m "feat(api): implement /api/barbers/[slug], private barber profiles, and appointments API"
   ```

6. **Commit 5: Admin APIs & DB Reset**:
   ```bash
   git add src/app/api/admin/*
   git commit -m "feat(admin): implement barber verifications route and relocate reset-db endpoint"
   ```

7. **PR & Merge Procedure**:
   - Verify build: `npm run build`
   - Verify reset: `npm run db:reset`
   - Push branch: `git push origin feature/db-auth-foundation`
   - Create PR to `main` with verification summary.
