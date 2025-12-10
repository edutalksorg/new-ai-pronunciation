import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Clock, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import { walletService } from '../../services/wallet';
import { useDispatch } from 'react-redux';
import { showToast } from '../../store/uiSlice';

const UserWallet: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const [balanceRes, transactionsRes] = await Promise.all([
                walletService.getBalance(),
                walletService.getTransactions()
            ]);

            const balanceData = (balanceRes as any)?.data || balanceRes;
            setBalance(balanceData?.balance || 0);

            const txList = Array.isArray(transactionsRes) ? transactionsRes : (transactionsRes as any)?.data || [];
            setTransactions(txList);
        } catch (error) {
            console.error('Failed to load wallet:', error);
            // dispatch(showToast({ message: 'Failed to load wallet info', type: 'error' }));
        } finally {
            setLoading(false);
        }
    };



    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const amount = parseFloat(formData.get('amount') as string);

        if (amount <= 0) {
            dispatch(showToast({ message: 'Invalid amount', type: 'error' }));
            return;
        }

        const bankDetails = {
            bankName: formData.get('bankName') as string,
            accountHolderName: formData.get('accountHolderName') as string,
            accountNumber: formData.get('accountNumber') as string,
            ifsc: formData.get('ifsc') as string,
            routingNumber: '', // Optional/Default
            upi: formData.get('upi') as string || ''
        };

        try {
            setWithdrawLoading(true);
            await walletService.withdraw({
                amount,
                currency: 'INR',
                bankDetails
            });
            dispatch(showToast({ message: 'Withdrawal requested successfully', type: 'success' }));
            setShowWithdraw(false);
            fetchWalletData();
        } catch (error) {
            console.error('Withdrawal failed:', error);
            dispatch(showToast({ message: 'Withdrawal failed', type: 'error' }));
        } finally {
            setWithdrawLoading(false);
        }
    };

    if (loading) return <div className="text-center py-12 text-slate-500">Loading wallet...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-full transition-colors text-blue-600 dark:text-blue-400"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Wallet</h1>
            </div>

            {/* Balance Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <p className="text-indigo-100 font-medium mb-1 flex items-center gap-2">
                            <Wallet size={18} /> Available Balance
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">₹{balance.toFixed(2)}</h2>
                        <p className="text-xs text-indigo-200">Used for quizzes, premium features, and voice calls.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            className="bg-white/20 hover:bg-white/30 text-white border-white/40 border shadow-md"
                            onClick={() => setShowWithdraw(!showWithdraw)}
                        >
                            Withdraw
                        </Button>

                    </div>
                </div>
            </div>

            {/* Withdrawal Form */}
            {showWithdraw && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-in slide-in-from-top-4">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Request Withdrawal</h3>
                    <form onSubmit={handleWithdraw} className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Amount (₹)</label>
                            <input name="amount" type="number" min="1" required className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="0.00" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Bank Name</label>
                                <input name="bankName" required className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Bank Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-slate-300">IFSC Code</label>
                                <input name="ifsc" required className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="IFSC" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Account Number</label>
                            <input name="accountNumber" required className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Account Number" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">Account Holder Name</label>
                            <input name="accountHolderName" required className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Name as per bank" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-slate-300">UPI ID (Optional)</label>
                            <input name="upi" className="w-full p-2 border rounded dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="user@upi" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" isLoading={withdrawLoading}>Submit Notice</Button>
                            <Button type="button" variant="ghost" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Transactions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock size={18} className="text-slate-400" /> Recent Transactions
                    </h3>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <div key={tx.id || tx._id} className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${tx.type === 'credit'
                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                                        : 'bg-red-100 text-red-600 dark:bg-red-900/30'
                                        }`}>
                                        {tx.type === 'credit' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{tx.description || 'Transaction'}</p>
                                        <p className="text-xs text-slate-500">{new Date(tx.date || tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-900 dark:text-white'
                                    }`}>
                                    {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 italic">No recent transactions</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserWallet;

