# 400 Bad Request - Quick Diagnosis

## The Problem
You're getting `400 Bad Request` when trying to login. This means:
- ✅ Request is reaching the backend
- ✅ Path is correct: `/api/auth/login` → `/api/v1/auth/login`
- ❌ But the **data format is wrong** or **credentials are invalid**

---

## Immediate Action - Test with Browser Console

### Step 1: Open Browser Console
1. Visit http://localhost:3000
2. Press **F12** (DevTools)
3. Click **Console** tab

### Step 2: Test API Request Directly
Copy and paste this code in Console:

```javascript
// Test the login endpoint directly
fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'demo@edutalks.com',
    password: 'Demo@123456'
  })
})
.then(r => r.json())
.then(data => console.log('Response:', data))
.catch(e => console.error('Error:', e))
```

### Step 3: Check Response
- If you see an **error message**, that's the key info!
- If you see `{token: "...", user: {...}}`, login should work
- If you see other format, copy the response and share it

---

## What the 400 Error Usually Means

The backend is saying one of these:

### Possible Issue 1: Invalid Credentials
```json
// Backend response might say:
{
  "message": "Invalid email or password",
  "statusCode": 400
}

// FIX: Use correct credentials from backend docs
```

### Possible Issue 2: Wrong Request Format
```json
// Backend expects (example):
{
  "username": "test@test.com",
  "pass": "password123"
}

// But we're sending:
{
  "email": "test@test.com",
  "password": "password123"
}

// FIX: Change field names to match backend
```

### Possible Issue 3: Missing Fields
```json
// Backend might expect:
{
  "email": "test@test.com",
  "password": "password123",
  "deviceId": "unique-id"
}

// But we're only sending email & password

// FIX: Add missing fields
```

---

## Your Request Format (Current)

**What we're sending to backend:**
```json
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "demo@edutalks.com",
  "password": "Demo@123456"
}
```

**Expected response (success):**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "123",
    "email": "demo@edutalks.com",
    "name": "Demo User"
  }
}
```

**Actual response (400 error):**
```json
{
  "statusCode": 400,
  "message": "???" ← COPY THIS ERROR MESSAGE
}
```

---

## Debug Flow

1. **Open Console** (F12 → Console tab)
2. **Paste test code** (from Step 2 above)
3. **Press Enter**
4. **Check output**:
   - See `Response: {...}`? → Copy that JSON
   - See error? → Copy that error message
5. **Share the response** with me → I'll fix it immediately

---

## Verification Checklist

- [ ] Dev server running on http://localhost:3000
- [ ] Can see login page (landing page loads)
- [ ] Opened DevTools (F12)
- [ ] Selected Console tab
- [ ] Pasted fetch test code
- [ ] Pressed Enter
- [ ] Got response or error message
- [ ] **Ready to share response**

---

## What to Do Next

**Option A: Share the Response**
1. Run the test code in console (from Step 2)
2. Copy the entire response/error
3. Share with me
4. I'll update the code to match backend format

**Option B: Check Backend Swagger Docs**
1. Try to find Swagger/OpenAPI docs for the backend:
   - `https://edutalks-backend.../swagger` or 
   - `https://edutalks-backend.../api-docs` or
   - `https://edutalks-backend.../docs`
2. Find `/api/v1/auth/login` endpoint
3. Check "Request Body" schema
4. Share field names and types

**Option C: Contact Backend Developer**
- Ask: "What fields should login request have?"
- Ask: "What's the exact request body format?"
- Ask: "What error do you get for invalid credentials?"

---

## Files That Might Need Changes

Once we know the backend format:

```typescript
// src/services/auth.ts - Login method
export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiService.post(API_ENDPOINTS.LOGIN, data);
    // Might need to change 'data' format here
  },
};

// src/types/index.ts - LoginRequest interface
export interface LoginRequest {
  email: string;    // Might need to change field name
  password: string; // Might need to change field name
}
```

---

## Don't Get Stuck!

Just run the console test and share the response. That one error message will tell us exactly what to fix! 🎯
