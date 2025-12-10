import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, X, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import InstructorLayout from './InstructorLayout';
import Button from '../../components/Button';

const mockStudents = [
    { id: 1, name: 'Alice Johnson', progress: 75, quizzesTaken: 5, avgScore: 82, lastActive: '2 hours ago' },
    { id: 2, name: 'Bob Smith', progress: 45, quizzesTaken: 3, avgScore: 68, lastActive: '1 day ago' },
    { id: 3, name: 'Charlie Brown', progress: 90, quizzesTaken: 8, avgScore: 95, lastActive: '5 mins ago' },
    { id: 4, name: 'Diana Prince', progress: 30, quizzesTaken: 2, avgScore: 70, lastActive: '3 days ago' },
    { id: 5, name: 'Evan Wright', progress: 60, quizzesTaken: 4, avgScore: 88, lastActive: '1 week ago' },
];

const mockPerformanceData = [
    { name: 'Quiz 1', score: 65 },
    { name: 'Quiz 2', score: 75 },
    { name: 'Quiz 3', score: 85 },
    { name: 'Quiz 4', score: 80 },
    { name: 'Quiz 5', score: 90 },
];

const StudentAnalyticsPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    return (
        <InstructorLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/instructor-dashboard')}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Analytics</h1>
                            <p className="text-slate-600 dark:text-slate-400">Monitor student progress and performance</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                            />
                        </div>
                        <button className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Course Progress</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quizzes Taken</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg. Score</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Active</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {mockStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedStudent(student)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div className="font-medium text-slate-900 dark:text-white">{student.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-full max-w-[140px]">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-slate-600 dark:text-slate-400">{student.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 dark:bg-slate-600 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${student.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                                            {student.quizzesTaken}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`
                                                px-2 py-1 rounded-full text-xs font-medium
                                                ${student.avgScore >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    student.avgScore >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                                            `}>
                                                {student.avgScore}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-sm">
                                            {student.lastActive}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Student Performance Modal */}
                {selectedStudent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                        {selectedStudent.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Detailed Performance Analysis</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Average Score</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStudent.avgScore}%</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Quizzes Taken</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStudent.quizzesTaken}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Course Progress</p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStudent.progress}%</p>
                                    </div>
                                </div>

                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <TrendingUp size={16} /> Performance Trend
                                </h4>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={mockPerformanceData}>
                                            <defs>
                                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorScore)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                                <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </InstructorLayout>
    );
};

export default StudentAnalyticsPage;
