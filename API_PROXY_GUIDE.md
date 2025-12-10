# API Proxy Configuration Guide

## 🔧 Recent Fix: Double API Path Issue

### Problem
```
❌ api/api/auth/login:1  Failed to load resource: 404 (Not Found)
```

The API endpoint was being doubled because the proxy rewrite rule was incorrectly keeping the `/api` prefix.

### Solution
**Updated vite.config.ts proxy rule:**
```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io',
      changeOrigin: true,
      rewrite: (path) => path,  // ✅ FIX: Just pass path through
    }
  }
}
```

### How It Works

**Before (Broken):**
```
Request:  /api/auth/login
Rewrite:  /api/auth/login → /api/auth/login (kept /api)
Target:   https://...azurecontainerapps.io + /api/auth/login
Final:    https://...azurecontainerapps.io/api/api/auth/login  ❌ DOUBLE!
```

**After (Fixed):**
```
Request:  /api/auth/login
Rewrite:  /api/auth/login → /api/auth/login (pass through)
Target:   https://...azurecontainerapps.io + /api/auth/login
Final:    https://...azurecontainerapps.io/api/auth/login  ✅ CORRECT!
```

## 📡 Complete API Flow

### 1. Development (localhost:5173)
```
Client Request
    ↓
http://localhost:5173/api/auth/login
    ↓
Vite Proxy (vite.config.ts)
    ↓
https://edutalks-backend.../api/auth/login
    ↓
Backend Response
```

### 2. Request Flow with Interceptors

```
Client Code
    ↓
apiService.post('/api/auth/login', credentials)
    ↓
Request Interceptor
  - Add Authorization header
  - Add Content-Type
    ↓
Vite Proxy
  - Rewrite: /api/... → /api/...
  - Forward to backend
    ↓
Backend API
    ↓
Response
    ↓
Response Interceptor
  - Check for 401 (unauthorized)
  - Refresh token if needed
  - Retry request
    ↓
Return data to component
```

## 🔐 API Endpoints Reference

### Authentication
```
POST   /api/auth/register        - User signup
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
POST   /api/auth/refresh         - Refresh token
GET    /api/auth/profile         - Get user profile
PUT    /api/auth/profile         - Update profile
```

### Dashboard
```
GET    /api/dashboard/stats      - Dashboard statistics
```

### Learning Content
```
GET    /api/daily-topics         - List all topics
GET    /api/daily-topics/:id     - Get topic details
POST   /api/daily-topics/:id/complete - Mark topic done
GET    /api/quizzes              - List all quizzes
GET    /api/quizzes/:id          - Get quiz details
POST   /api/quizzes/:id/submit   - Submit quiz answers
```

### Pronunciation
```
GET    /api/pronunciation/tests  - Get pronunciation tests
POST   /api/pronunciation/submit - Submit recording
```

### Voice Calls
```
GET    /api/voice-calls/matches  - Find call matches
POST   /api/voice-calls/request  - Request a call
POST   /api/voice-calls/accept   - Accept call
POST   /api/voice-calls/end      - End call
GET    /api/voice-calls/history  - Call history
```

### Wallet & Transactions
```
GET    /api/wallet               - Get wallet data
GET    /api/wallet/transactions  - Transaction history
POST   /api/wallet/add-balance   - Add money
```

### Subscriptions & Payments
```
GET    /api/subscriptions        - Get subscription
POST   /api/payments/create-order - Create payment order
POST   /api/payments/verify      - Verify payment
```

### Referrals & Coupons
```
GET    /api/referrals            - Get referral info
POST   /api/referrals/create     - Create referral
GET    /api/referrals/code       - Get referral code
GET    /api/coupons              - List coupons
POST   /api/coupons/apply        - Apply coupon code
POST   /api/coupons/validate     - Validate coupon
```

## 🚀 Testing API Integration

### 1. Check Network Requests
1. Open DevTools → Network tab
2. Perform action (login, fetch topics, etc.)
3. Look for `/api/...` requests
4. ✅ Should NOT see `/api/api/...`

### 2. Monitor Request Headers
```
Request Headers:
- Authorization: Bearer <token>
- Content-Type: application/json
```

### 3. Check Response
```
Status: 200 OK (or appropriate status)
Response: { data: {...}, message: "..." }
```

### 4. Verify Token Refresh
1. Login successfully (get token)
2. Make request after token expires
3. Interceptor should:
   - Detect 401
   - Call refresh endpoint
   - Get new token
   - Retry original request

## 🐛 Debugging Tips

### Check Proxy is Working
1. Open DevTools Network tab
2. Filter by `/api`
3. Click on request
4. Check "General" section:
   ```
   Request URL: http://localhost:5173/api/...
   Remote Address: 127.0.0.1:5173  ← Dev server
   ```

### Check Backend is Reachable
```bash
# Open DevTools console and test:
fetch('https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 on all API calls | Proxy not working | Verify vite.config.ts proxy settings |
| CORS errors | Backend not allowing requests | Check backend CORS configuration |
| 401 Unauthorized | Missing/expired token | Check token in localStorage |
| Token not persisting | State lost on refresh | Check auth slice persistence |
| Slow requests | Large response size | Implement pagination/filtering |

## 📝 Environment Variables

### .env and .env.local
```
VITE_API_BASE_URL=https://edutalks-backend.lemonfield-c795bfef.centralindia.azurecontainerapps.io
VITE_PHONEPE_MERCHANT_ID=MERCHANTUAT
VITE_PHONEPE_SALT_KEY=96434309-7796-489d-8924-ab56988a6076
VITE_PHONEPE_REDIRECT_URL=http://localhost:5173/payment-status
VITE_APP_NAME=EduTalks
```

Note: The `VITE_API_BASE_URL` is defined but not currently used in development (vite proxy takes precedence). It will be used in production builds.

## ✅ Verification Checklist

- [ ] Vite dev server running: `npm run dev`
- [ ] No double `/api/api/` paths in Network tab
- [ ] Requests return 200/appropriate status
- [ ] Response data displays in components
- [ ] Authentication token persists
- [ ] Token refresh works on 401
- [ ] Logout clears token
- [ ] Protected routes redirect when unauthorized

## 🎯 Next Steps

1. **Test Login Flow:**
   ```
   1. Go to http://localhost:5173/login
   2. Enter credentials
   3. Check Network tab for POST /api/auth/login
   4. Verify 200 response with token
   5. Should redirect to dashboard
   ```

2. **Test Data Fetching:**
   ```
   1. Navigate to Daily Topics page
   2. Check Network tab for GET /api/daily-topics
   3. Verify data loads and displays
   4. Check console for any errors
   ```

3. **Monitor API Calls:**
   ```
   Use Redux DevTools to see:
   - Action: setAuthData
   - State: user, token updated
   - Network: verified in Network tab
   ```

---

**API Integration is ready! 🚀**
