$content = Get-Content "c:\Users\VENKETESH\Downloads\new\src\App.tsx" -Raw

# Replace the malformed line 30 with proper imports
$content = $content -replace "import InstructorPendingPage from './pages/instructordashboard/InstructorDashboardPage'; \\\\nimport InstructorQuizzesPage from './pages/instructordashboard/QuizEditor'; \\\\nimport InstructorQuizEditorPage from './pages/instructordashboard/QuizEditor'; \\\\nimport InstructorTopicsPage from './pages/instructordashboard/TopicEditor'; \\\\nimport InstructorTopicEditorPage from './pages/instructordashboard/TopicEditor'; \\\\nimport InstructorPronunciationPage from './pages/instructordashboard/PronunciationContentManager'; \\\\nimport InstructorEarningsPage from './pages/instructordashboard/EarningsReport';", @"
import InstructorPendingPage from './pages/instructordashboard/InstructorDashboardPage';
import InstructorQuizzesPage from './pages/instructordashboard/QuizEditor';
import InstructorQuizEditorPage from './pages/instructordashboard/QuizEditor';
import InstructorTopicsPage from './pages/instructordashboard/TopicEditor';
import InstructorTopicEditorPage from './pages/instructordashboard/TopicEditor';
import InstructorPronunciationPage from './pages/instructordashboard/PronunciationContentManager';
import InstructorEarningsPage from './pages/instructordashboard/EarningsReport';
"@

$content | Out-File -FilePath "c:\Users\VENKETESH\Downloads\new\src\App.tsx" -Encoding UTF8 -NoNewline
