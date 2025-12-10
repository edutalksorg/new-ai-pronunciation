# ⚡ Quick Reference Guide - EduTalks Frontend

## 🚀 Start Development
```bash
cd c:\Users\VENKETESH\Downloads\new
npm install                  # Install Recharts
npm run dev                  # Start dev server
```

## 📱 Key Routes Added
```
/admin/payments     → Admin payment management
/admin/analytics    → Analytics dashboard
/wallet             → User wallet operations
/subscriptions      → Subscription plans
/referrals          → Referral program
```

## 🧩 New Components (Import & Use)

### VoiceCallInterface
```tsx
import VoiceCallInterface from './components/VoiceCallInterface';

<VoiceCallInterface
  recipientId="user-123"
  recipientName="John Doe"
  onCallEnded={() => handleCallEnd()}
/>
```

### PronunciationRecorder
```tsx
import PronunciationRecorder from './components/PronunciationRecorder';

<PronunciationRecorder
  paragraphId="para-456"
  paragraphText="Read this text"
  onSubmit={(result) => console.log(result)}
/>
```

### QuizInterface
```tsx
import QuizInterface from './components/QuizInterface';

<QuizInterface
  quizId="quiz-789"
  onComplete={(result) => console.log(result)}
/>
```

### PaymentForm
```tsx
import PaymentForm from './components/PaymentForm';

<PaymentForm
  amount={500}
  description="Premium Subscription"
  onSuccess={(response) => console.log(response)}
/>
```

## 🛠 Utilities Quick Access

### Helper Functions
```typescript
import { 
  formatCurrency,      // Format amount as ₹100.00
  formatDate,          // Format as "Jan 01, 2024"
  formatTime,          // Format as "01:30" for timer
  getGradeFromScore,   // Get letter grade from score
  getStatusColor,      // Get Tailwind color for status
  truncateText,        // Truncate with "..."
  getInitials,         // Get user initials
  calculatePercentage, // Calculate percentage
  copyToClipboard,     // Copy text to clipboard
} from './utils/helpers';
```

### API Utils
```typescript
import {
  extractErrorMessage,     // Parse error from any source
  isApiError,             // Check if network error
  isNetworkError,         // Check if network down
  handleApiError,         // Get error with status
  getStoredToken,         // Get JWT from localStorage
  setStoredToken,         // Save JWT to localStorage
  isTokenExpired,         // Check if token expired
  clearStoredTokens,      // Clear all auth tokens
} from './utils/apiUtils';
```

### Form Validators
```typescript
import {
  validateEmail,           // Email format check
  validatePhoneNumber,     // Indian phone (10 digits)
  validatePassword,        // Strong password check
  validateAmount,          // Amount range validation
  validateFileSize,        // File size validation
  validateImageFile,       // Image specific validation
  validateAudioFile,       // Audio specific validation
  validateForm,            // Combined form validation
} from './utils/formValidation';
```

## 📦 Redux Usage

### Access State
```typescript
import { useSelector } from 'react-redux';
import { RootState } from './store';

const { currentCall, isCallActive } = useSelector(
  (state: RootState) => state.call
);
```

### Dispatch Actions
```typescript
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store';
import { setCurrentQuiz } from './store/quizSlice';

const dispatch = useDispatch<AppDispatch>();
dispatch(setCurrentQuiz(quizData));
```

## 🔌 API Service Usage

### Call Service
```typescript
import { callsService } from './services/calls';

const users = await callsService.availableUsers();
const callId = await callsService.initiate(recipientId);
const status = await callsService.getCallStatus(callId);
await callsService.end(callId);
```

### Payment Service
```typescript
import { paymentsService } from './services/payments';

const order = await paymentsService.createOrder({ amount, description });
const result = await paymentsService.verifyPayment({ orderId, paymentDetails });
const wallet = await paymentsService.getWalletBalance();
```

### Quiz Service
```typescript
import { quizzesService } from './services/quizzes';

const quiz = await quizzesService.getById(quizId);
const result = await quizzesService.submit(quizId, { answers, score });
const attempts = await quizzesService.getAttempts(quizId);
```

### Pronunciation Service
```typescript
import { pronunciationService } from './services/pronunciation';

const paras = await pronunciationService.listParagraphs();
const result = await pronunciationService.assessAudio(paraId, audioBlob);
const feedback = await pronunciationService.getAssessmentResult(resultId);
```

## 🎨 Dark Mode Implementation

All components use Tailwind dark mode classes:
```tsx
<div className="bg-white dark:bg-slate-800">
  <h1 className="text-slate-900 dark:text-white">Heading</h1>
  <p className="text-slate-600 dark:text-slate-400">Content</p>
</div>
```

Toggle dark mode:
```typescript
const { theme } = useSelector((state: RootState) => state.ui);
const { toggleTheme } = useTheme(); // Available from uiSlice

document.documentElement.classList.toggle('dark');
localStorage.setItem('edutalks_theme', newTheme);
```

## 🔐 Protected Routes

```tsx
<Route
  path="/admin/payments"
  element={
    <ProtectedRoute>
      <AdminPaymentsPage />
    </ProtectedRoute>
  }
/>
```

ProtectedRoute checks user authentication and role permissions.

## 🧪 Form Validation Pattern

```tsx
import { validateForm } from './utils/formValidation';

const [errors, setErrors] = useState({});

const handleSubmit = (formData) => {
  const { valid, errors } = validateForm(formData, {
    email: validateEmail,
    phone: validatePhoneNumber,
    amount: (val) => validateAmount(val, 100, 10000),
  });

  if (!valid) {
    setErrors(errors);
    return;
  }
  
  // Submit form
};
```

## 📊 Chart Usage (Recharts)

```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="value" stroke="#3b82f6" />
  </LineChart>
</ResponsiveContainer>
```

## ⚠️ Important Notes

1. **HTTPS Required**: WebRTC and audio recording need HTTPS
2. **Token Refresh**: Automatic on 401 errors - no manual handling needed
3. **API Proxy**: `/api` routes are proxied via Vite config
4. **Dark Mode**: Stored in localStorage with key `edutalks_theme`
5. **Storage Keys**: Use `STORAGE_KEYS` constant from `constants/index.ts`

## 🆘 Common Issues & Solutions

### Payment not working?
- Ensure PhonePe/Stripe API keys in environment
- Check HTTPS is enabled
- Verify PaymentForm component receives correct props

### Voice call failing?
- Check HTTPS is enabled
- Verify WebRTC permissions in browser
- Check STUN/TURN server configuration in callsService

### Quiz timer not working?
- Verify duration is set in quiz data
- Check timer interval is clearing on unmount
- Ensure Redux quizSlice is initialized

### Forms not validating?
- Import from `formValidation.ts` not `helpers.ts`
- Ensure validator returns `{ valid, error? }` or `{ valid, errors }`
- Check field name matches validator key

## 📚 File Structure Quick Ref

```
src/
├── components/          # Reusable UI components
├── pages/               # Page components
├── services/            # API call wrappers
├── store/               # Redux slices
├── utils/               # Helper functions
├── hooks/               # Custom React hooks
├── constants/           # App constants
├── types/               # TypeScript types
└── App.tsx              # Route configuration
```

## 🔗 Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Build
npm run build            # Production build
npm run preview          # Preview build

# Linting
npm run lint             # Run ESLint

# Dependencies
npm list                 # List installed packages
npm update               # Update packages
npm audit               # Check security issues
```

## 🎯 Next Steps

1. ✅ Install Recharts: `npm install`
2. ✅ Configure `.env.local` with API URLs
3. ✅ Test authentication flow
4. ✅ Test payment methods
5. ✅ Test voice calls (HTTPS)
6. ✅ Test quizzes and pronunciation
7. ✅ Deploy to production

---

**Built with ❤️ | EduTalks Frontend Complete**
