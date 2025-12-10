# Role-Based Routing - Quick Reference

## 🎯 Three Steps to Understand It

### 1️⃣ **DashboardRouter** - Smart Dashboard Selection
When user visits `/dashboard`:
```
Instructor user → Shows Instructor Dashboard
Learner user   → Shows Learner Dashboard  
Admin user     → Redirects to /admin
```

### 2️⃣ **RoleBasedRoute** - Route Protection
When user tries to access restricted route:
```
Has required role? → Show page ✅
Doesn't have role? → Redirect to dashboard ❌
```

### 3️⃣ **Helper Functions** - Easy Role Checking
```typescript
isInstructor(role)    // true if instructor
isAdmin(role)         // true if admin
isLearner(role)       // true if learner
getDashboardRoute(role) // returns /dashboard, /admin, or /instructor-dashboard
```

---

## 🚀 Quick Commands

### Check User Role
```typescript
import { isInstructor } from '../utils/roleHelpers';

if (isInstructor(user?.role)) {
  // Show instructor features
}
```

### Navigate to User's Dashboard
```typescript
import { getDashboardRoute } from '../utils/roleHelpers';

navigate(getDashboardRoute(user?.role));
```

### Create Protected Route
```typescript
<Route path="/admin/analytics" element={
  <ProtectedRoute>
    <RoleBasedRoute allowedRoles={['admin']}>
      <AdminAnalyticsPage />
    </RoleBasedRoute>
  </ProtectedRoute>
} />
```

---

## 📊 Who Sees What Dashboard?

| When They Visit... | Instructor Sees | Learner Sees | Admin Sees |
|---|---|---|---|
| `/dashboard` | Instructor Dashboard | Learner Dashboard | Redirects to `/admin` |
| `/admin` | Redirects to dashboard | Redirects to dashboard | Admin Dashboard |
| `/voice-calls` | Redirects to dashboard | Voice Calls page | Redirects to dashboard |
| `/instructor-dashboard` | Instructor Dashboard | Redirects to dashboard | Redirects to dashboard |

---

## 🔍 Debug in Browser Console

Look for these logs to understand routing:
```
[DashboardRouter] Current user: {role: "instructor"}
[DashboardRouter] Routing user with role: "instructor"
[DashboardRouter] Displaying InstructorDashboardPage

[RoleBasedRoute] Checking access: {userRole: "instructor", allowedRoles: ["admin"], allowed: false}
[RoleBasedRoute] Access denied for role: instructor
```

---

## 🛡️ Available Roles

```typescript
'admin'      // Full platform access
'instructor' // Can teach and manage courses
'user'       // Regular learner
'learner'    // Same as 'user'
```

---

## 💡 Common Use Cases

### Show Menu Item Only for Instructors
```tsx
{isInstructor(user?.role) && <Link to="/instructor-dashboard">My Dashboard</Link>}
```

### Disable Button for Non-Admins
```tsx
<button disabled={!isAdmin(user?.role)}>Delete User</button>
```

### Show Role Badge
```tsx
<span className={getRoleColor(user?.role)}>
  {getRoleDisplayName(user?.role)}
</span>
```

### Redirect to Appropriate Dashboard
```tsx
navigate(getDashboardRoute(user?.role));
```

---

## ✅ Testing Checklist

- [ ] Instructor logs in → sees Instructor Dashboard
- [ ] Learner logs in → sees Learner Dashboard
- [ ] Admin logs in → sees Admin Dashboard
- [ ] Instructor visits `/voice-calls` → redirects to dashboard
- [ ] Learner visits `/admin` → redirects to dashboard
- [ ] Anyone unauthenticated → redirects to login

---

## 📚 Full Documentation

Read `ROLE_BASED_ROUTING_GUIDE.md` for:
- Complete route access matrix
- All available functions
- Usage examples with code
- Troubleshooting guide
- Best practices
- Testing procedures

Read `ROLE_BASED_ROUTING_IMPLEMENTATION.md` for:
- What was implemented
- How it works step-by-step
- Changes from previous version
- Security notes
- Files modified
