import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ArrowLeft, GripVertical, CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import { quizzesService } from '../../services/quizzes';
import { topicsService } from '../../services/topics';
import { showToast } from '../../store/uiSlice';
import { useDispatch } from 'react-redux';
import { Quiz, QuizQuestion } from '../../types';

const INITIAL_QUESTION: QuizQuestion = {
    id: '', // Temporary ID
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
};

const QuizEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const isEditMode = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState<Partial<Quiz> & { categoryId?: string, duration?: number }>({
        title: '',
        description: '',
        difficulty: 'Beginner',
        passingScore: 70,
        questions: [],
        categoryId: '',
        duration: 30
    });

    useEffect(() => {
        loadCategories();
        if (isEditMode && id) {
            loadQuiz(id);
        } else {
            // Add one empty question to start
            setFormData(prev => ({
                ...prev,
                questions: [{ ...INITIAL_QUESTION, id: Date.now().toString() }]
            }));
        }
    }, [id, isEditMode]);

    const loadCategories = async () => {
        try {
            // Use topicsService as quizzesService.getCategories is failing
            const res = await topicsService.getCategories();
            const data = (res as any)?.data || res;
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadQuiz = async (quizId: string) => {
        try {
            setLoading(true);
            const res = await quizzesService.getById(quizId);
            const data = (res as any)?.data || res;
            // Normalize questions to match our internal state structure
            const questions = (data.questions || []).map((q: any) => ({
                id: q.id || q._id,
                // Backend returns questionText, we use question internally
                question: q.question || q.questionText || q.QuestionText || '',
                options: q.options || ['', '', '', ''],
                // specific logic if correctAnswer is returned as string value instead of index
                correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
                explanation: q.explanation || ''
            }));

            setFormData({
                ...data,
                questions: questions,
                categoryId: data.categoryId || data.category,
                duration: data.duration || 30
            });
        } catch (error) {
            console.error('Failed to load quiz:', error);
            dispatch(showToast({ message: 'Failed to load quiz details', type: 'error' }));
            navigate('/instructor/quizzes');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof Quiz | 'categoryId' | 'duration', value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleQuestionChange = (index: number, field: keyof QuizQuestion, value: any) => {
        const newQuestions = [...(formData.questions || [])];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...(formData.questions || [])];
        const newOptions = [...newQuestions[qIndex].options];
        newOptions[oIndex] = value;
        newQuestions[qIndex].options = newOptions; // Update the reference
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            questions: [...(prev.questions || []), { ...INITIAL_QUESTION, id: Date.now().toString() }]
        }));
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...(formData.questions || [])];
        newQuestions.splice(index, 1);
        setFormData(prev => ({ ...prev, questions: newQuestions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.title?.trim()) {
            dispatch(showToast({ message: 'Title is required', type: 'error' }));
            return;
        }
        if (!formData.categoryId) {
            dispatch(showToast({ message: 'Category is required', type: 'error' }));
            return;
        }
        if ((formData.questions?.length || 0) === 0) {
            dispatch(showToast({ message: 'At least one question is required', type: 'error' }));
            return;
        }

        // Validate options
        const invalidQuestions = formData.questions?.some(q => q.options.some(o => !o.trim()));
        if (invalidQuestions) {
            dispatch(showToast({ message: 'All options must be filled out', type: 'error' }));
            return;
        }

        try {
            setLoading(true);

            // Construct payload clean and compatible with backend
            // Construct payload clean and compatible with backend
            // Construct payload with multiple casing variations to ensure backend compatibility
            const mappedQuestions = formData.questions?.map(q => ({
                // Try all likely variations for the question text
                questionText: q.question, // MATCH FOUND IN UserQuizTakingPage.tsx
                QuestionText: q.question,
                Question: q.question,
                question: q.question,
                text: q.question, // Potential fallback

                // Options
                Options: q.options,
                options: q.options,

                // Correct Answer
                CorrectAnswer: q.options[q.correctAnswer] || q.options[0],
                correctAnswer: q.options[q.correctAnswer] || q.options[0],

                // Explanation
                Explanation: q.explanation,
                explanation: q.explanation,

                // IDs
                Id: (q.id && q.id.length > 20) ? q.id : undefined,
                id: (q.id && q.id.length > 20) ? q.id : undefined,

                // Quiz Link
                QuizId: id,
                quizId: id
            }));

            const quizData = {
                // IDs
                Id: id,
                id: id,
                QuizId: id, // Try this too just in case 

                // Basic Info
                Title: formData.title,
                title: formData.title,

                Description: formData.description,
                description: formData.description,

                Difficulty: formData.difficulty,
                difficulty: formData.difficulty,

                PassingScore: formData.passingScore,
                passingScore: formData.passingScore,

                TotalQuestions: formData.questions?.length || 0,
                totalQuestions: formData.questions?.length || 0,

                CategoryId: formData.categoryId,
                categoryId: formData.categoryId,

                Duration: (formData as any).duration || 30,
                duration: (formData as any).duration || 30,

                // Questions
                Questions: mappedQuestions,
                questions: mappedQuestions
            };

            if (isEditMode && id) {
                await quizzesService.updateQuiz(id, quizData);
                dispatch(showToast({ message: 'Quiz updated successfully', type: 'success' }));
            } else {
                await quizzesService.createQuiz(quizData);
                dispatch(showToast({ message: 'Quiz created successfully', type: 'success' }));
            }
            navigate('/instructor/quizzes');
        } catch (error: any) {
            console.error('Failed to save quiz:', error);
            const data = error?.response?.data;
            let message = data?.message || 'Failed to save quiz';

            if (data?.errors) {
                if (Array.isArray(data.errors)) {
                    message = data.errors.map((e: any) => e.message || e).join(', ');
                } else {
                    message = JSON.stringify(data.errors);
                }
            } else if (data?.messages) {
                message = Array.isArray(data.messages) ? data.messages.join(', ') : data.messages;
            } else if (typeof data === 'string') {
                message = data;
            }

            dispatch(showToast({ message, type: 'error' }));
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <div className="p-8 text-center text-slate-500">Loading quiz details...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/instructor/quizzes')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isEditMode ? 'Edit Quiz' : 'Create New Quiz'}
                    </h1>
                </div>
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    leftIcon={<Save size={20} />}
                    className="w-full md:w-auto"
                >
                    {loading ? 'Saving...' : 'Save Quiz'}
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Basic Info Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h2>
                    <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Quiz Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="e.g., English Grammar Basics"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Category
                                </label>
                                <select
                                    value={(formData as any).categoryId || ''}
                                    onChange={(e) => handleInputChange('categoryId' as any, e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat: any) => (
                                        <option key={cat.id || cat.name} value={cat.id || cat.name}>{cat.name}</option>
                                    ))}
                                    <option value="General">General</option>
                                    <option value="Grammar">Grammar</option>
                                    <option value="Vocabulary">Vocabulary</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows={3}
                                placeholder="Brief description of what this quiz covers..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Difficulty Level
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Passing Score (%)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.passingScore}
                                    onChange={(e) => handleInputChange('passingScore', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Duration (mins)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={(formData as any).duration || 30}
                                    onChange={(e) => handleInputChange('duration' as any, parseInt(e.target.value))}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Questions ({formData.questions?.length})
                        </h2>
                        <Button variant="outline" onClick={addQuestion} leftIcon={<Plus size={20} />}>
                            Add Question
                        </Button>
                    </div>

                    {formData.questions?.map((question, qIndex) => (
                        <div
                            key={question.id || qIndex}
                            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 relative group"
                        >
                            <button
                                onClick={() => removeQuestion(qIndex)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                title="Remove question"
                            >
                                <Trash2 size={20} />
                            </button>

                            <div className="flex gap-4">
                                <div className="pt-2 cursor-move text-slate-300">
                                    <GripVertical size={20} />
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                                            {qIndex + 1}
                                        </span>
                                        <input
                                            type="text"
                                            value={question.question}
                                            onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                                            placeholder="Enter the question text"
                                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-medium"
                                        />
                                    </div>

                                    <div className="pl-11 space-y-3">
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Options</p>
                                        {question.options.map((option, oIndex) => (
                                            <div key={oIndex} className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                                                    className={`
                            w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors
                            ${question.correctAnswer === oIndex
                                                            ? 'border-green-500 bg-green-500 text-white'
                                                            : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
                                                        }
                          `}
                                                >
                                                    {question.correctAnswer === oIndex && <CheckCircle size={14} />}
                                                </button>
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                    placeholder={`Option ${oIndex + 1}`}
                                                    className={`
                            flex-1 px-3 py-1.5 rounded-md border text-sm
                            ${question.correctAnswer === oIndex
                                                            ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20'
                                                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                                                        }
                            text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500
                          `}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pl-11 pt-2">
                                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                                            Explanation (Optional)
                                        </label>
                                        <textarea
                                            value={question.explanation}
                                            onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                                            rows={2}
                                            placeholder="Explain why the correct answer is right..."
                                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div className="flex justify-end gap-3 pt-6 pb-20">
                    <Button variant="outline" onClick={() => navigate('/instructor/quizzes')}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading}
                        leftIcon={<Save size={20} />}
                    >
                        {loading ? 'Saving...' : 'Save Quiz'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default QuizEditor;
