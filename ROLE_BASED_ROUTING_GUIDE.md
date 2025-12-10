# Role-Based Routing & Access Control Guide

## Overview

The EduTalks application implements a comprehensive role-based access control system that automatically routes users to their appropriate dashboards based on their role (Admin, Instructor, or Learner).

## User Roles

### 1. **Admin** (`role: 'admin'`)
- Full platform management access
- Can manage instructors and learners
- Can view analytics and payments
- Can moderate content
- **Default Dashboard**: `/admin`

### 2. **Instructor** (`role: 'instructor'`)
- Can create and manage courses
- Can view student interactions
- Can track earnings
- Can manage their topics
- **Default Dashboard**: `/instructor-dashboard`

### 3. **Learner/User** (`role: 'user' | 'learner'`)
- Can browse and join courses
- Can participate in quizzes
- Can do voice calls
- Can practice pronunciation
- Can manage wallet and subscriptions
- **Default Dashboard**: `/dashboard`

## Smart Dashboard Routing

When a user visits `/dashboard`, they are automatically routed to their appropriate dashboard based on their role:

```typescript
// In src/App.tsx
const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase().trim();

  if (userRole === 'instructor') {
    return <InstructorDashboardPage />;
  } else if (userRole === 'user' || userRole === 'learner') {
    return <DashboardPage />;
  } else if (userRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }
};
```

### Usage Example

User visits `/dashboard`:
- **Admin User** → Automatically redirects to Admin Dashboard (`/admin`)
- **Instructor User** → Automatically shows Instructor Dashboard
- **Learner User** → Automatically shows Learner Dashboard

## Role-Based Route Guards

The `RoleBasedRoute` component restricts access to specific routes based on user role:

```typescript
interface RoleBasedRouteProps {
  allowedRoles: ('user' | 'instructor' | 'admin' | 'learner')[];
  children: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles, children }) => {
  // Checks if user has one of the allowed roles
  // If not, redirects to their appropriate dashboard
};
```

### Implementation in Routes

```typescript
// Admin-only route
<Route
  path="/admin/analytics"
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['admin']}>
        <AdminAnalyticsPage />
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>

// Instructor-only route
<Route
  path="/instructor-dashboard"
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['instructor']}>
        <InstructorDashboardPage />
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>

// Learner-only routes
<Route
  path="/voice-calls"
  element={
    <ProtectedRoute>
      <RoleBasedRoute allowedRoles={['user', 'learner']}>
        <VoiceCallsPage />
      </RoleBasedRoute>
    </ProtectedRoute>
  }
/>
```

## Route Access Matrix

| Route | Admin | Instructor | Learner | Redirect If Denied |
|-------|-------|------------|---------|-------------------|
| `/` | ✅ | ✅ | ✅ | None (Public) |
| `/login` | ✅ | ✅ | ✅ | None (Public) |
| `/dashboard` | → `/admin` | → `/instructor-dashboard` | → `/dashboard` | Smart Router |
| `/admin` | ✅ | → `/instructor-dashboard` | → `/dashboard` | Role Dashboard |
| `/admin/instructors` | ✅ | → `/instructor-dashboard` | → `/dashboard` | Role Dashboard |
| `/admin/analytics` | ✅ | → `/instructor-dashboard` | → `/dashboard` | Role Dashboard |
| `/instructor-dashboard` | → `/admin` | ✅ | → `/dashboard` | Role Dashboard |
| `/voice-calls` | → `/admin` | → `/instructor-dashboard` | ✅ | Role Dashboard |
| `/daily-topics` | → `/admin` | → `/instructor-dashboard` | ✅ | Role Dashboard |
| `/quizzes` | → `/admin` | → `/instructor-dashboard` | ✅ | Role Dashboard |
| `/wallet` | ✅ | ✅ | ✅ | None (Shared) |
| `/profile` | ✅ | ✅ | ✅ | None (Shared) |
| `/referrals` | ✅ | ✅ | ✅ | None (Shared) |

## Role Helper Functions

Located in `src/utils/roleHelpers.ts`, these utilities make role checking easier throughout the application:

### Check User Role

```typescript
import { isInstructor, isAdmin, isLearner, hasRole, hasAnyRole } from '../utils/roleHelpers';

// Check specific role
if (isInstructor(user?.role)) {
  // Show instructor options
}

if (isAdmin(user?.role)) {
  // Show admin options
}

if (isLearner(user?.role)) {
  // Show learner options
}

// Check multiple roles
if (hasAnyRole(user?.role, ['instructor', 'admin'])) {
  // Show creator options
}
```

### Get Dashboard Route

```typescript
import { getDashboardRoute } from '../utils/roleHelpers';

const route = getDashboardRoute(user?.role);
// Returns: '/admin', '/instructor-dashboard', or '/dashboard'

window.location.href = getDashboardRoute(user?.role);
```

### Get Role Display Info

```typescript
import { 
  getRoleDisplayName, 
  getRoleColor, 
  getRoleIcon 
} from '../utils/roleHelpers';

// Get human-readable name
const displayName = getRoleDisplayName(user?.role);
// Returns: 'Administrator', 'Instructor', 'Learner', etc.

// Get Tailwind CSS classes for styling
const colorClass = getRoleColor(user?.role);
// Returns: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'

// Get icon name for lucide-react
const iconName = getRoleIcon(user?.role);
// Returns: 'ShieldCheck', 'Briefcase', 'BookOpen'
```

### Check Permissions

```typescript
import { 
  canAccessAdmin, 
  canCreateContent, 
  canManageUsers, 
  canViewAnalytics 
} from '../utils/roleHelpers';

if (canCreateContent(user?.role)) {
  // Show content creation options
}

if (canManageUsers(user?.role)) {
  // Show user management options
}

if (canViewAnalytics(user?.role)) {
  // Show analytics dashboard
}
```

## How It Works

### 1. User Login
- User enters credentials
- Backend validates and returns `User` object with `role` field
- Redux `authSlice` stores user in state and localStorage

### 2. Dashboard Access
- User visits `/dashboard`
- `DashboardRouter` component checks `user.role` from Redux state
- Routes to appropriate dashboard:
  - Admin → `/admin` (AdminDashboardPage)
  - Instructor → Instructor Dashboard (InstructorDashboardPage)
  - Learner → Learner Dashboard (DashboardPage)

### 3. Protected Routes
- User tries to access restricted route (e.g., `/admin/analytics`)
- `ProtectedRoute` checks if user is authenticated
- `RoleBasedRoute` checks if user's role is in `allowedRoles`
- If yes → Show page
- If no → Redirect to user's appropriate dashboard

### 4. Debug Logging
Console logs help debug routing issues (seen in browser DevTools):

```
[DashboardRouter] Current user: {id: "123", name: "John", role: "instructor", ...}
[DashboardRouter] Routing user with role: "instructor"
[DashboardRouter] Displaying InstructorDashboardPage

[RoleBasedRoute] Checking access: {userRole: "instructor", allowedRoles: ["admin"], allowed: false}
[RoleBasedRoute] Access denied for role: instructor
```

## Implementation Examples

### Example 1: Show Admin Panel Only to Admins

```typescript
import { isAdmin } from '../utils/roleHelpers';

function MyComponent() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div>
      {isAdmin(user?.role) && (
        <div className="admin-panel">
          {/* Admin-only content */}
        </div>
      )}
    </div>
  );
}
```

### Example 2: Conditional Navigation

```typescript
import { getDashboardRoute } from '../utils/roleHelpers';

function NavigationMenu() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const goToDashboard = () => {
    navigate(getDashboardRoute(user?.role));
  };

  return <button onClick={goToDashboard}>Dashboard</button>;
}
```

### Example 3: Role Badge Display

```typescript
import { getRoleDisplayName, getRoleColor } from '../utils/roleHelpers';

function UserBadge({ userRole }: { userRole: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userRole)}`}>
      {getRoleDisplayName(userRole)}
    </span>
  );
}
```

## Testing Role-Based Routing

### Test Case 1: Instructor Access
1. Login with instructor account
2. Visit `/dashboard` → Should show Instructor Dashboard
3. Try `/voice-calls` → Should redirect to `/instructor-dashboard`
4. Try `/admin` → Should redirect to `/instructor-dashboard`
5. Direct access `/instructor-dashboard` → Should work ✅

### Test Case 2: Learner Access
1. Login with learner account
2. Visit `/dashboard` → Should show Learner Dashboard
3. Try `/admin` → Should redirect to `/dashboard`
4. Try `/instructor-dashboard` → Should redirect to `/dashboard`
5. Direct access `/voice-calls` → Should work ✅

### Test Case 3: Admin Access
1. Login with admin account
2. Visit `/dashboard` → Should redirect to `/admin`
3. Try `/instructor-dashboard` → Should redirect to `/admin`
4. Direct access `/admin/analytics` → Should work ✅

## Troubleshooting

### Issue: User sees wrong dashboard
**Solution:**
- Check console for role logging
- Verify `user.role` in Redux DevTools
- Check localStorage for stored user data
- Clear browser cache and login again

### Issue: Access denied on correct role
**Solution:**
- Check role name matches exactly (case-insensitive)
- Verify route has correct `allowedRoles` array
- Check `RoleBasedRoute` is properly wrapped
- Look for console warnings about access denial

### Issue: Infinite redirect loop
**Solution:**
- Check redirect logic in `RoleBasedRoute`
- Verify `DashboardRouter` handles all role cases
- Ensure routes are properly ordered
- Check for circular route dependencies

## Best Practices

1. **Always Use Role Helpers** - Use `isInstructor()`, `isAdmin()`, etc. instead of string comparison
2. **Wrap Protected Routes** - Always use `<ProtectedRoute>` + `<RoleBasedRoute>`
3. **Use Appropriate Routes** - Put routes in correct position in route config
4. **Test Each Role** - Test all user roles when making routing changes
5. **Check Logs** - Use browser console to debug routing issues
6. **Update localStorage** - Role stored in localStorage, update when role changes
7. **Handle Unknown Roles** - Default to learner role for unknown roles

## Future Enhancements

- [ ] Fine-grained permission system (RBAC)
- [ ] Permission groups
- [ ] Dynamic role creation
- [ ] Role-based feature flags
- [ ] Audit logging for role changes
