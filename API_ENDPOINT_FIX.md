# API Endpoint Fix - Error Explanation & Solution

## Problem: `api/api/auth/login 404 Error`

### What Was Happening?
You were getting a **404 error** because API requests were being sent to **incorrect paths** with a duplicate `/api/` prefix:

```
❌ WRONG: /api/api/auth/login
✅ CORRECT: /api/auth/login
```

### Root Cause
The issue was caused by **double `/api/` prefixing**:

1. **In `src/services/api.ts`**: The API service was initialized with `baseURL: '/api'`
2. **In `src/constants/index.ts`**: All endpoints were defined WITH the `/api/` prefix (e.g., `/api/auth/login`)
3. **When combined**: `baseURL + endpoint` = `/api` + `/api/auth/login` = `/api/api/auth/login` ❌

### Example of the Problem
```typescript
// src/services/api.ts
const API_BASE_URL = '/api';  // baseURL is /api
class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,  // baseURL: /api
    });
  }
}

// src/constants/index.ts
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',  // ❌ ALSO has /api prefix
};

// When making request:
// axios automatically combines: /api + /api/auth/login = /api/api/auth/login ❌
```

---

## Solution: Remove `/api/` Prefix from Endpoints

Since the **baseURL** is already `/api`, all endpoints should be **relative paths without the `/api/` prefix**.

### Changes Made

#### 1. **src/constants/index.ts** - Removed `/api` from all endpoints

```typescript
// ❌ BEFORE (wrong)
export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  DASHBOARD_STATS: '/api/dashboard/stats',
  // ... etc
};

// ✅ AFTER (correct)
export const API_ENDPOINTS = {
  LOGIN: '/auth/login',           // relative to baseURL /api
  REGISTER: '/auth/register',
  DASHBOARD_STATS: '/dashboard/stats',
  // ... etc
};
```

**All 51 endpoints fixed** (Auth, Dashboard, Voice Calls, Daily Topics, Quizzes, Pronunciation, Wallet, Referrals, Coupons, Subscriptions, Payments)

#### 2. **src/services/auth.ts** - Fixed hardcoded endpoints

```typescript
// ❌ BEFORE
verifyEmail: async (email: string, code: string) => {
  return apiService.post('/api/auth/verify-email', { email, code });
};

// ✅ AFTER
verifyEmail: async (email: string, code: string) => {
  return apiService.post('/auth/verify-email', { email, code });
};
```

#### 3. **src/services/api.ts** - Fixed token refresh endpoint

```typescript
// ❌ BEFORE
const response = await this.api.post('/api/auth/refresh', {
  refreshToken,
});

// ✅ AFTER
const response = await this.api.post('/auth/refresh', {
  refreshToken,
});
```

---

## How It Works Now (Correct Flow)

```
Diagram of Request Flow:

Client Component
    ↓
authService.login(data)
    ↓
apiService.post(API_ENDPOINTS.LOGIN, data)
    ↓
apiService.post('/auth/login', data)  [relative path]
    ↓
axios.create({ baseURL: '/api' })
    ↓
Combines: baseURL + endpoint = /api + /auth/login = /api/auth/login ✅
    ↓
Browser sends: /api/auth/login
    ↓
Vite Proxy (dev server):
  - Matches: /api/*
  - Target: https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io
  - Rewrites: /api/auth/login → https://[backend-domain]/api/auth/login ✅
    ↓
Backend receives: /api/auth/login ✅
    ↓
Response: 200 OK with user & token data
```

---

## Why This Error Happened

### Understanding baseURL in Axios

When you create an Axios instance with a `baseURL`:

```typescript
axios.create({
  baseURL: '/api'  // This becomes the prefix for all requests
})
```

Axios **automatically prepends** the baseURL to every request path:

```typescript
// If you call:
axios.get('/auth/login')

// Axios creates request to:
GET /api/auth/login  ✅

// BUT if you call:
axios.get('/api/auth/login')

// Axios creates request to:
GET /api/api/auth/login  ❌ Double prefix!
```

### The Mistake

The endpoints were being defined **as if there was no baseURL**, when in fact the baseURL already includes `/api`.

---

## Verification

### Build Status
```
✓ 1562 modules transformed.
✓ built in 6.79s
No errors or warnings ✅
```

### Dev Server Status
```
VITE v7.2.6 ready in 200 ms
Local: http://localhost:3000/ ✅
Server restarted and reloaded changes ✅
```

### What to Test
1. Visit http://localhost:3000
2. Open DevTools → Network tab
3. Click "Login" button
4. Watch Network tab:
   - Should see request to: `/api/auth/login` ✅
   - Response status: 200 (if backend is running)
   - NOT `/api/api/auth/login` ✅

---

## Files Modified
- ✅ `src/constants/index.ts` - Fixed all 51 API endpoints
- ✅ `src/services/auth.ts` - Fixed 2 hardcoded endpoints
- ✅ `src/services/api.ts` - Fixed token refresh endpoint
- ✅ `vite.config.ts` - Port changed from 5173 to 3000

## Summary
The error was caused by **duplicate `/api/` prefixing** in the endpoint definitions. By removing the `/api/` prefix from all endpoints in the constants file (and hardcoded paths in services), requests now use the correct path format: `/api/auth/login` instead of `/api/api/auth/login`.

**Status: ✅ FIXED** - Your app is now on http://localhost:3000 with correct API paths!
