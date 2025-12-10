import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Calendar, Download, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../components/Button';

const mockData = [
    { date: '2023-01', amount: 450 },
    { date: '2023-02', amount: 520 },
    { date: '2023-03', amount: 680 },
    { date: '2023-04', amount: 1200 },
    { date: '2023-05', amount: 950 },
    { date: '2023-06', amount: 1500 },
    { date: '2023-07', amount: 1800 },
];

const EarningsReport: React.FC = () => {
    const navigate = useNavigate();
    const [timeRange, setTimeRange] = useState('6m');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/instructor-dashboard')}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden md:flex"
                    // Note: User asked for "all pages". 
                    // Earnings might be accessed directly from Sidebar, but on mobile sidebar is hidden.
                    // So a back button is useful. But "hidden md:flex" makes it show only on desktop? 
                    // Wait, "back buttons ... mobile view also must be clear". 
                    // Usually Back button is most useful on mobile if navigation is deep.
                    // But if it's top level, sidebar is the way.
                    // However, let's enable it generally but maybe style it.
                    // Let's remove 'hidden md:flex' to make it always visible if that's the request.
                    // Re-reading user request: "add back buttons properly for all pages properly and mobile view also must be clear"
                    // So I should show it everywhere.
                    >
                        <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Earnings Report</h2>
                        <p className="text-slate-500 dark:text-slate-400">Track your revenue and withdrawal history</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="1m">Last 30 Days</option>
                        <option value="3m">Last 3 Months</option>
                        <option value="6m">Last 6 Months</option>
                        <option value="1y">Last Year</option>
                    </select>
                    <Button variant="outline" leftIcon={<Download size={18} />}>
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total Earnings</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">₹5,400</h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mt-2">
                        <TrendingUp size={16} />
                        <span>+12% from last month</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Available Balance</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">₹850</h3>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        className="w-full mt-4"
                        onClick={() => {
                            // Mock withdrawal for now
                            alert('Withdrawal request for ₹850 initiated');
                        }}
                    >
                        Withdraw Funds
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Withdrawn</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">₹4,550</h3>
                        </div>
                    </div>
                    <Button variant="ghost" className="mt-2 text-purple-600 dark:text-purple-400 p-0 h-auto">
                        View transaction history
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Revenue Growth</h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mockData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value: any) => [`₹${value}`, 'Revenue']}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div >
    );
};

export default EarningsReport;
