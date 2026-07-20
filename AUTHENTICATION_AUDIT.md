# Scathing Security & Authentication Audit — Fade Finder

**Target System:** Fade Finder (`Sirrine-Jonathan/fade-finder`)  
**Audit Date:** July 20, 2026  
**Auditor:** Antigravity AI Security & Architecture Audit Team  
**Status:** **CRITICAL SEVERITY — NOT PRODUCTION READY**

---

## Executive Summary

A comprehensive security and structural audit of the authentication and authorization implementation in this repository reveals a **disastrous security posture**. The codebase contains multiple high-severity authentication bypasses, public remote database wipe endpoints, broken password reset validation allowing total account takeover, credential exposure in API responses, hardcoded session secrets, and middleware that performs no actual security enforcement.

Furthermore, the existing End-to-End (E2E) test suite suffers from severe **"security theater"**. Critical route-protection tests pass trivial assertions such as `expect(currentUrl).toBeDefined()`, completely failing to verify whether unauthenticated users are actually blocked or redirected.

**This application must NOT be deployed to production under any circumstances until all remediation items in this audit are addressed and verified by rigorous, non-trivial E2E tests.**

---

## 1. Critical Security Vulnerabilities & Exploit Analysis

### 🔴 Vulnerability 1.1: Unauthenticated Remote Database Wipe Endpoint
* **Location:** [`src/app/api/reset-db/route.ts`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/app/api/reset-db/route.ts#L7-L30)
* **Severity:** **CRITICAL (CVSS 10.0)**
* **Description:** An unauthenticated public POST endpoint `/api/reset-db` executes `npm run db:reset` directly on the host machine.
* **Exploit Vector:** Any remote attacker can execute a single `POST /api/reset-db` HTTP request without headers, cookies, or credentials to wipe the entire database and reset it with seed data, causing total data destruction in production.

---

### 🔴 Vulnerability 1.2: Password Reset Account Takeover (MFA Bypass)
* **Location:** [`src/app/api/auth/forgot-password/route.ts`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/app/api/auth/forgot-password/route.ts#L38-L45)
* **Severity:** **CRITICAL (CVSS 9.8)**
* **Description:** The MFA recovery key verification logic is conditionally wrapped:
  ```typescript
  if (user.mfaRecoveryKey && mfaRecoveryKey) {
    if (user.mfaRecoveryKey !== mfaRecoveryKey.trim()) {
      return NextResponse.json({ success: false, error: 'Invalid MFA recovery key' }, { status: 400 });
    }
  }
  ```
* **Exploit Vector:** If an attacker sends `{ "email": "victim@example.com", "newPassword": "attacker_password" }` without providing `mfaRecoveryKey` in the JSON body, `mfaRecoveryKey` is `undefined`. The expression `user.mfaRecoveryKey && mfaRecoveryKey` evaluates to `false`, **skipping verification entirely**. The attacker can overwrite the password of any target user account at will.

---

### 🔴 Vulnerability 1.3: Authentication & Role Check Bypass on Admin Verification API
* **Location:** [`src/app/api/admin/verifications/route.ts`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/app/api/admin/verifications/route.ts#L8-L15)
* **Severity:** **HIGH (CVSS 8.6)**
* **Description:** Both `GET` and `POST` handlers check authorization using:
  ```typescript
  const session = await getSessionUser(request);
  if (session && session.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 403 });
  }
  ```
* **Exploit Vector:** When an unauthenticated anonymous user makes a request, `session` is `null`. The condition `session && session.role !== 'ADMIN'` evaluates to `false`. Unauthenticated users can retrieve all pending barber licensing details, phone numbers, and home addresses, and issue binding approval/rejection decisions.

---

### 🔴 Vulnerability 1.4: Appointment Creation & Status Manipulation Bypasses
* **Location:** [`src/app/api/appointments/route.ts`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/app/api/appointments/route.ts#L87-L91)
* **Severity:** **HIGH (CVSS 8.2)**
* **Description:** 
  1. `POST /api/appointments` falls back to impersonating arbitrary users:
     ```typescript
     let clientToUseId = session?.userId || bodyClientId;
     if (!clientToUseId) {
       const firstClient = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
       if (firstClient) clientToUseId = firstClient.id;
     }
     ```
     An unauthenticated user can pass any `bodyClientId` or omit it to create appointments impersonating legitimate clients.
  2. `PATCH /api/appointments` performs **zero authentication check**. Anyone can send a request to alter any appointment's status to `CANCELLED` or `CONFIRMED`.

---

### 🔴 Vulnerability 1.5: Plaintext Secret Exposure in `/api/auth/me`
* **Location:** [`src/app/api/auth/me/route.ts`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/app/api/auth/me/route.ts#L46)
* **Severity:** **MEDIUM-HIGH (CVSS 7.2)**
* **Description:** The session endpoint returns sensitive authentication fields in the JSON body: `mfaRecoveryKey: user.mfaRecoveryKey`.
* **Exploit Vector:** Any XSS vulnerability or browser extension reading network traffic gains immediate access to the user's secondary secret recovery key.

---

### 🔴 Vulnerability 1.6: Insecure Fallback Session Secret & Token Forgery
* **Location:** [`src/lib/auth.ts`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/lib/auth.ts#L8-L10)
* **Severity:** **HIGH (CVSS 8.1)**
* **Description:** Session tokens are HMAC-SHA256 signed using a fallback hardcoded secret:
  ```typescript
  function getSecretKey(): string {
    return process.env.SESSION_SECRET || 'fadefinder_secret_key_2026_x89k_dev_prod_hash';
  }
  ```
* **Exploit Vector:** If `SESSION_SECRET` is omitted in deployment, any user can locally sign an arbitrary JWT payload with `role: "ADMIN"` and `userId: "<any-uuid>"` to gain permanent root admin rights.

---

## 2. Architectural & Routing Failures

### ⚡ Failure 2.1: Non-Enforcing Next.js Middleware
* **Location:** [`src/middleware.ts`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/middleware.ts#L5-L16)
* **Description:** `middleware.ts` contains only HTTP request telemetry logging (`logger.http`). Despite setting `matcher: ['/api/:path*', '/admin/:path*', '/history/:path*']`, it returns `NextResponse.next()` unconditionally without checking cookies, headers, or roles.

### ⚡ Failure 2.2: Unprotected Client-Side Admin & Provider Dashboards
* **Locations:** 
  - [`src/app/admin/settings/page.tsx`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/app/admin/settings/page.tsx)
  - [`src/app/admin/content/page.tsx`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/app/admin/content/page.tsx)
  - [`src/app/providers/profile/private/page.tsx`](file:///mnt/c/Users/jonat/~projects/fade-finder/src/app/providers/profile/private/page.tsx)
* **Description:** Pages under `/admin/*` render administrative UI controls to unauthenticated visitors without verifying authentication status on mount or performing client redirects to `/login`.

---

## 3. "Security Theater" in Existing E2E Tests

The current E2E test suite in [`e2e/auth.spec.ts`](file:///mnt/c/Users/jonat/~projects/fade-finder/e2e/auth.spec.ts) gives a false sense of security through meaningless assertions:

```typescript
// Example from e2e/auth.spec.ts lines 137-144
test('Redirect unauthenticated user accessing protected client profile (/profile)', async ({ page }) => {
  await page.goto('/profile');
  await page.waitForLoadState('domcontentloaded');
  
  // Verify page loads or redirects to login
  const currentUrl = page.url();
  expect(currentUrl).toBeDefined(); // <--- TAIL-CHASING / TRIVIAL ASSERTION!
});
```

* `expect(currentUrl).toBeDefined()` will **always pass** regardless of whether the user was redirected to `/login` or remained on an unprotected `/profile` page.
* Form filling tests in `auth.spec.ts` interact with input elements without clicking submit buttons or checking for valid cookie generation.
* There are no tests attempting unauthorized API calls (e.g., calling `/api/admin/verifications` without cookies) to confirm 401/403 responses.

---

## 4. Production Readiness Action Plan

To bring the codebase to production readiness, the following remediation steps must be completed:

### Phase 1: Security Core & API Fixes
1. **Delete Unprotected Reset Endpoint:** Remove `src/app/api/reset-db/route.ts` or restrict it strictly to local non-production environments behind an environment variable guard.
2. **Fix Password Reset Logic:** Require a valid token or enforce `mfaRecoveryKey` strictly when present in `forgot-password/route.ts`.
3. **Enforce API Guard Clause Standard:** In all protected API routes, enforce:
   ```typescript
   if (!session) {
     return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
   }
   if (requiredRole && session.role !== requiredRole) {
     return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
   }
   ```
4. **Remove Credential Leaks:** Remove `mfaRecoveryKey` from `/api/auth/me` responses.
5. **Mandate Mandatory Environment Variable:** Throw an error on application startup if `SESSION_SECRET` is not set or uses the dev default in production mode.

### Phase 2: Centralized Next.js Middleware Route Enforcement
Update `src/middleware.ts` to validate the `fadefinder_session` cookie for protected route patterns:
* `/admin/:path*` -> Redirect to `/login` if unauthenticated or non-ADMIN.
* `/providers/profile/private/*`, `/providers/settings/*` -> Redirect to `/providers/login` if unauthenticated or non-BARBER.
* `/profile/*`, `/history/*`, `/booking/*` -> Redirect to `/login` if unauthenticated.
* `/api/admin/:path*` -> Return HTTP 401/403 JSON response if unauthenticated or non-ADMIN.

### Phase 3: Comprehensive E2E Verification Suite Overhaul
1. Replace trivial `expect(url).toBeDefined()` assertions with explicit URL checks: `await expect(page).toHaveURL(/\/login/);`.
2. Implement full E2E lifecycle tests:
   - **Client Lifecycle:** Register -> Login -> Session Verified (`/api/auth/me`) -> View History -> Logout -> Blocked from `/profile`.
   - **Provider Lifecycle:** Register -> Login -> Access Private Manager -> Update Services -> Logout.
   - **Admin Security Boundary:** Anonymous GET/POST to `/api/admin/verifications` returns HTTP 401/403.
   - **Password Reset Security:** Password reset attempt without recovery key is rejected with HTTP 400.

---
*End of Audit Document.*
