# Role-Based Routing System - Visual Guide

## 🔄 Complete User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER LOGIN                                     │
│                     (Backend authenticates)                              │
│                                                                          │
│  Returns:                                                                │
│  {                                                                       │
│    id: "user-123",                                                      │
│    fullName: "John Doe",                                                │
│    role: "instructor"  ← KEY FIELD                                      │
│  }                                                                       │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    REDUX STORES USER                                     │
│                  (authSlice in Redux state)                             │
│                  (localStorage for persistence)                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           USER NAVIGATES TO /dashboard (Any Route)                       │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  PROTECTED ROUTE CHECKS                                  │
│         ✓ Is user authenticated? Is token valid?                        │
│           Yes → Continue  |  No → Redirect to /login                    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   DASHBOARD ROUTER CHECKS                                │
│              ✓ What is user.role?                                        │
└─────────┬──────────────────────┬──────────────────────┬─────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
    role: "admin"         role: "instructor"      role: "user"
          │                      │                      │
          ▼                      ▼                      ▼
    Redirect to /admin    Show Instructor       Show Learner
                          Dashboard             Dashboard
```

---

## 🛡️ Route Protection Flow

```
USER TRIES TO ACCESS PROTECTED ROUTE
        │
        ▼
┌─────────────────────────────────────┐
│  ProtectedRoute Check               │
│  Is user authenticated?             │
└────────────────────┬────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
         NO                    YES
          │                     │
          ▼                     ▼
    Redirect to          RoleBasedRoute Check
    /login               Does user have required role?
                              │
                     ┌────────┴────────┐
                     │                 │
                    YES               NO
                     │                 │
                     ▼                 ▼
                Show Page         Redirect to
                                  User's Dashboard
                                  (based on role)
```

---

## 🔑 Role-Based Route Protection

```
┌────────────────────────────────────────────────────────────┐
│              ADMIN ROUTES                                   │
│  allowedRoles: ['admin']                                   │
│                                                             │
│  /admin                      ← Only admins                 │
│  /admin/instructors          ← Only admins                 │
│  /admin/payments             ← Only admins                 │
│  /admin/analytics            ← Only admins                 │
│                                                             │
│  Non-admins → Redirect to: /admin (admins)                 │
│                            /instructor-dashboard (inst.)   │
│                            /dashboard (learners)           │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│           INSTRUCTOR ROUTES                                 │
│  allowedRoles: ['instructor']                              │
│                                                             │
│  /instructor-dashboard       ← Only instructors            │
│  /instructor/topics          ← Only instructors            │
│                                                             │
│  Non-instructors → Redirect to appropriate dashboard       │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│           LEARNER ROUTES                                    │
│  allowedRoles: ['user', 'learner']                         │
│                                                             │
│  /voice-calls                ← Only learners               │
│  /daily-topics               ← Only learners               │
│  /quizzes                    ← Only learners               │
│  /pronunciation              ← Only learners               │
│                                                             │
│  Non-learners → Redirect to appropriate dashboard          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│          SHARED ROUTES                                      │
│  (All authenticated users)                                 │
│                                                             │
│  /profile                    ← Everyone                    │
│  /wallet                     ← Everyone                    │
│  /subscriptions              ← Everyone                    │
│  /referrals                  ← Everyone                    │
└────────────────────────────────────────────────────────────┘
```

---

## 📱 Dashboard Selection by Role

```
                          USER LOGGED IN
                               │
                    ┌──────────┴──────────┐
                    │                     │
           Visits /dashboard    Visits /instructor-dashboard (direct)
                    │                     │
            DashboardRouter         RoleBasedRoute Check
            Checks role                  │
                    │                ┌───┴───┐
            ┌───────┼───────┐       YES     NO
            │       │       │        │       │
        admin  instructor  user      │   Redirect to
            │       │       │        │   appropriate
            │       │       │        │   dashboard
            ▼       ▼       ▼        │
         ADMIN    INSTRUCTOR LEARNER │
       DASHBOARD  DASHBOARD DASHBOARD │
                                     ▼
                            INSTRUCTOR
                            DASHBOARD
                            DISPLAYED
```

---

## 🔍 User Role Detection Logic

```
user.role from Redux state
    │
    ├─ Convert to lowercase: "Instructor" → "instructor"
    ├─ Trim whitespace: " instructor " → "instructor"
    │
    ├──────────┬──────────┬──────────┬──────────┐
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
  "admin"  "instructor"  "user"   "learner"  Unknown
    │          │          │          │          │
    ▼          ▼          ▼          ▼          ▼
  ADMIN      INSTRUCTOR  LEARNER   LEARNER    LEARNER
    
                    (Safe defaults)
    Unknown roles → Treated as Learner
    Empty role    → Treated as Learner
    null role     → Redirect to login
```

---

## 🔐 Security Layers

```
LAYER 1: AUTHENTICATION
┌─────────────────────────────────────┐
│ Is user logged in?                  │
│ YES → Continue                      │
│ NO  → Redirect to /login ❌         │
└─────────────────────────────────────┘
                │
                ▼
LAYER 2: TOKEN VALIDATION
┌─────────────────────────────────────┐
│ Is JWT token valid?                 │
│ YES → Continue                      │
│ NO  → Refresh or login ❌           │
└─────────────────────────────────────┘
                │
                ▼
LAYER 3: AUTHORIZATION
┌─────────────────────────────────────┐
│ Does user have required role?       │
│ YES → Show page ✅                  │
│ NO  → Redirect to dashboard ❌      │
└─────────────────────────────────────┘
                │
                ▼
           PAGE DISPLAYED ✅
```

---

## 🔄 Component Hierarchy

```
App.tsx
  │
  ├─ Router
  │   │
  │   ├─ Route: /login
  │   │   └─ LoginPage
  │   │
  │   ├─ Route: /dashboard
  │   │   └─ ProtectedRoute
  │   │       └─ DashboardRouter
  │   │           ├─ (If admin) → Navigate to /admin
  │   │           ├─ (If instructor) → InstructorDashboardPage
  │   │           └─ (If user) → DashboardPage
  │   │
  │   ├─ Route: /admin
  │   │   └─ ProtectedRoute
  │   │       └─ RoleBasedRoute (allowedRoles: ['admin'])
  │   │           └─ AdminDashboardPage
  │   │
  │   ├─ Route: /instructor-dashboard
  │   │   └─ ProtectedRoute
  │   │       └─ RoleBasedRoute (allowedRoles: ['instructor'])
  │   │           └─ InstructorDashboardPage
  │   │
  │   ├─ Route: /voice-calls
  │   │   └─ ProtectedRoute
  │   │       └─ RoleBasedRoute (allowedRoles: ['user', 'learner'])
  │   │           └─ VoiceCallsPage
  │   │
  │   └─ ... other routes
  │
  └─ Toast (notifications)
```

---

## 🧪 Test Scenarios

### Scenario 1: Instructor User
```
1. Login with instructor@example.com
   ↓ Backend returns user with role: "instructor"
   ↓ Redux stores this user
   ↓
2. Visit /dashboard
   ↓ DashboardRouter checks role
   ↓ Role === "instructor"
   ↓
3. InstructorDashboardPage displays ✅

4. Try to visit /admin
   ↓ ProtectedRoute passes (authenticated)
   ↓ RoleBasedRoute checks allowedRoles: ['admin']
   ↓ Role "instructor" NOT in ['admin']
   ↓ Redirect to /instructor-dashboard ✅
```

### Scenario 2: Learner User
```
1. Login with learner@example.com
   ↓ Backend returns user with role: "user"
   ↓ Redux stores this user
   ↓
2. Visit /dashboard
   ↓ DashboardRouter checks role
   ↓ Role === "user"
   ↓
3. DashboardPage (Learner) displays ✅

4. Try to visit /voice-calls
   ↓ ProtectedRoute passes (authenticated)
   ↓ RoleBasedRoute checks allowedRoles: ['user', 'learner']
   ↓ Role "user" IS in ['user', 'learner']
   ↓
5. VoiceCallsPage displays ✅
```

### Scenario 3: Admin User
```
1. Login with admin@example.com
   ↓ Backend returns user with role: "admin"
   ↓ Redux stores this user
   ↓
2. Visit /dashboard
   ↓ DashboardRouter checks role
   ↓ Role === "admin"
   ↓ Redirect to /admin ✅
   ↓
3. AdminDashboardPage displays

4. Visit /admin/analytics
   ↓ ProtectedRoute passes (authenticated)
   ↓ RoleBasedRoute checks allowedRoles: ['admin']
   ↓ Role "admin" IS in ['admin']
   ↓
5. AdminAnalyticsPage displays ✅
```

---

## 🛠️ Helper Functions Available

```
src/utils/roleHelpers.ts
    │
    ├─ isInstructor(role)
    ├─ isAdmin(role)
    ├─ isLearner(role)
    ├─ hasRole(role, checkRole)
    ├─ hasAnyRole(role, roles)
    │
    ├─ getDashboardRoute(role)
    │
    ├─ getRoleDisplayName(role)
    ├─ getRoleColor(role)
    ├─ getRoleIcon(role)
    │
    ├─ canAccessAdmin(role)
    ├─ canCreateContent(role)
    ├─ canManageUsers(role)
    └─ canViewAnalytics(role)
```

---

## 📊 State Flow Diagram

```
REDUX STATE (authSlice)
┌──────────────────────────────────────┐
│ auth: {                              │
│   user: {                            │
│     id: "user-123",                  │
│     fullName: "John",                │
│     role: "instructor",     ← CRITICAL │
│     email: "john@..."                │
│     ...                              │
│   },                                 │
│   token: "eyJhbGc...",               │
│   isAuthenticated: true              │
│ }                                    │
└──────────┬───────────────────────────┘
           │
    ┌──────┴────────┐
    │               │
    ▼               ▼
DashboardRouter  RoleBasedRoute
checks role      checks role
    │               │
    ▼               ▼
Route to        Allow/Deny
dashboard       access
```

---

## ✅ Summary

```
┌─────────────────────────────────────────────┐
│ ROLE-BASED ROUTING SYSTEM                   │
├─────────────────────────────────────────────┤
│                                             │
│ 1. User logs in with role in JWT            │
│    ↓                                        │
│ 2. Redux stores user + role                 │
│    ↓                                        │
│ 3. User navigates to route                  │
│    ↓                                        │
│ 4. ProtectedRoute checks authentication     │
│    ↓                                        │
│ 5. RoleBasedRoute checks user role          │
│    ↓                                        │
│ 6. Route allowed? → Show page ✅            │
│    Route denied? → Redirect to dashboard ❌ │
│                                             │
│ RESULT: Each user sees only their content   │
│         Based on their role                 │
│                                             │
└─────────────────────────────────────────────┘
```
