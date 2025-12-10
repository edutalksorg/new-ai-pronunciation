import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Jan', students: 40, classes: 240 },
    { name: 'Feb', students: 30, classes: 139 },
    { name: 'Mar', students: 20, classes: 980 },
    { name: 'Apr', students: 27, classes: 390 },
    { name: 'May', students: 18, classes: 480 },
    { name: 'Jun', students: 23, classes: 380 },
    { name: 'Jul', students: 34, classes: 430 },
];

const StudentProgressChart: React.FC = () => {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Engagement</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Monthly active students and classes</p>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '8px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <Area type="monotone" dataKey="students" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStudents)" />
                        <Area type="monotone" dataKey="classes" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorClasses)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StudentProgressChart;
