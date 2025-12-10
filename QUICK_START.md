# Quick Start Guide - EduTalks Development

## 🚀 Getting Started

### 1. Start Development Server
```bash
cd c:\Users\VENKETESH\Downloads\new
npm run dev
```
Server runs at: **http://localhost:5173/**

### 2. Install React DevTools
Download from: https://reactjs.org/link/react-devtools

**Chrome/Edge:** Chrome Web Store - "React Developer Tools"  
**Firefox:** Add-ons - "React Developer Tools"

### 3. Open Your App
1. Visit http://localhost:5173
2. Press `F12` to open DevTools
3. Click "Components" tab to see React component tree

## 📊 Understanding Your App

### Main Pages
- **Landing Page** (`/`) - Public marketing page
- **Register** (`/register`) - User signup with validation
- **Login** (`/login`) - User login (demo: demo@edutalks.com)
- **Dashboard** (`/dashboard`) - Main hub with stats & navigation
- **Daily Topics** (`/daily-topics`) - Learning content with filters
- **Quizzes** (`/quizzes`) - MCQ tests with scoring
- **Voice Calls** (`/voice-calls`) - WebRTC calling interface
- **AI Pronunciation** (`/pronunciation`) - Speech recording & analysis
- **Wallet** (`/wallet`) - Balance & transaction history

### Key Technologies
```
Frontend:     React 18 + TypeScript
Build:        Vite (fast, modern)
Styling:      Tailwind CSS (dark mode included)
State:        Redux Toolkit (auth + UI)
HTTP:         Axios (with token interceptors)
Forms:        React Hook Form + Zod validation
WebRTC:       SimplePeer (voice calls)
Icons:        Lucide React
```

## 🔌 API Integration Status

### ✅ Working
- API requests proxy correctly to backend
- Request interceptor adds auth token
- Response interceptor handles 401 refresh
- Dashboard fetches stats from API
- Topics, Quizzes, Wallet pages fetch real data

### 📋 To Test
1. **Login:** POST /api/auth/login
   - Email: demo@edutalks.com
   - Password: Demo@123456

2. **Check Network Tab:**
   - Open DevTools → Network
   - Perform action (login, fetch topics)
   - Look for requests starting with `/api/` (NOT `/api/api/`)

3. **Verify Response:**
   - Click request
   - Check Status: `200 OK`
   - View Response tab for actual data

## 🎯 Common Tasks

### View Component Tree
1. Open DevTools
2. Click "Components" tab
3. Expand component hierarchy
4. Click any component to see props

### Check Redux State
1. Install Redux DevTools extension (optional)
2. Open DevTools → Redux tab
3. See all state changes and actions
4. Time-travel through state history

### Debug API Calls
1. Open DevTools → Network tab
2. Filter by `/api`
3. Click request to see details:
   - Headers (Authorization token)
   - Request/Response body
   - Status code

### Check Application Logs
1. Open DevTools → Console
2. See any warnings/errors
3. Check API error messages
4. View component warnings

## 🛠️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Multi-variant button
│   ├── Layout.tsx      # Main layout wrapper
│   ├── ProtectedRoute.tsx
│   └── Toast.tsx       # Notifications
├── pages/              # Page components (one per route)
│   ├── DashboardPage.tsx
│   ├── DailyTopicsPage.tsx
│   ├── QuizzesPage.tsx
│   └── ...
├── services/           # API communication
│   ├── api.ts         # Axios instance + interceptors
│   └── auth.ts        # Auth API calls
├── store/             # Redux state management
│   ├── authSlice.ts   # Auth state
│   ├── uiSlice.ts     # UI state (theme, toast)
│   └── index.ts       # Store configuration
├── types/             # TypeScript interfaces
├── constants/         # API endpoints & config
├── utils/             # Helper functions
├── hooks/             # Custom hooks (useApi, etc.)
├── App.tsx            # Main router
└── main.tsx           # Entry point
```

## 🐛 If Something Goes Wrong

### API returns 404
1. Check Network tab for actual URL
2. Verify it's `/api/...` (not `/api/api/...`)
3. Check backend is running
4. Try refreshing page

### Component not showing data
1. Open Network tab → check API response
2. Open Redux tab → check state
3. Console → look for errors
4. Check if API endpoint exists in constants

### Dark mode not working
1. Check URL has dark mode class applied
2. Open DevTools → check HTML:
   ```html
   <html class="dark">  <!-- Should be present -->
   ```
3. Check theme toggle button in profile

### Login not persisting
1. Check localStorage: DevTools → Application → LocalStorage
2. Look for `edutalks_token` and `edutalks_user`
3. If missing, login process didn't work
4. Check Network tab for login response

## 📚 Documentation Files

Created guides for reference:
- `COMPLETE_README.md` - Full project documentation
- `DEVTOOLS_SETUP.md` - React DevTools installation & usage
- `API_PROXY_GUIDE.md` - API proxy configuration & debugging

## ✨ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🎓 Learning Resources

- **React:** https://react.dev
- **TypeScript:** https://typescriptlang.org
- **Vite:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Redux:** https://redux.js.org
- **React Router:** https://reactrouter.com

## ✅ Verification Checklist

- [ ] Dev server running: `npm run dev`
- [ ] Can visit http://localhost:5173
- [ ] React DevTools installed
- [ ] Can inspect components
- [ ] Network tab shows `/api/` requests (correct)
- [ ] Can login with demo credentials
- [ ] Dashboard loads data from API
- [ ] Dark/Light theme works
- [ ] Responsive on mobile

## 🚀 Next Steps

1. **Test the app** - Click around, test features
2. **Use DevTools** - Inspect components & state
3. **Check Network** - Monitor API requests
4. **Build features** - Add new pages/components
5. **Connect features** - Integrate with API
6. **Deploy** - Ready for production

---

**You're all set! Happy coding! 🎉**
