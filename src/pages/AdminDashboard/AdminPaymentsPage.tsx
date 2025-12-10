import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Users, TrendingUp, Settings, FileText,
  AlertCircle, CheckCircle, XCircle, ArrowLeft, Wallet, RefreshCcw
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import { showToast } from '../../store/uiSlice';
import { adminPaymentsService, AdminPaymentTransaction, AdminWithdrawalRequest, AdminRefundRequest } from '../../services/adminPayments';

const AdminPaymentsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals' | 'refunds' | 'adjustments'>('transactions');
  const [isLoading, setIsLoading] = useState(false);

  // Data States
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRequest[]>([]);
  const [refunds, setRefunds] = useState<AdminRefundRequest[]>([]);

  // Modal States
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<AdminWithdrawalRequest | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<AdminRefundRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'complete' | null>(null);
  const [actionNote, setActionNote] = useState('');

  // Wallet Adjustment State
  const [adjustmentData, setAdjustmentData] = useState({
    userId: '',
    amount: 0,
    type: 'Credit' as 'Credit' | 'Debit',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'transactions') {
        const res = await adminPaymentsService.getTransactions();
        setTransactions(res || []);
      } else if (activeTab === 'withdrawals') {
        const res = await adminPaymentsService.getPendingWithdrawals();
        setWithdrawals(res || []);
      } else if (activeTab === 'refunds') {
        const res = await adminPaymentsService.getPendingRefunds();
        setRefunds(res || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      // dispatch(showToast({ message: 'Failed to load data', type: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawalAction = async () => {
    if (!selectedWithdrawal || !actionType) return;
    setIsLoading(true);
    try {
      if (actionType === 'approve') {
        await adminPaymentsService.approveWithdrawal(selectedWithdrawal.id, actionNote);
        dispatch(showToast({ message: 'Withdrawal Approved', type: 'success' }));
      } else if (actionType === 'reject') {
        await adminPaymentsService.rejectWithdrawal(selectedWithdrawal.id, actionNote);
        dispatch(showToast({ message: 'Withdrawal Rejected', type: 'success' }));
      } else if (actionType === 'complete') {
        await adminPaymentsService.completeWithdrawal(selectedWithdrawal.id, actionNote);
        dispatch(showToast({ message: 'Withdrawal Completed', type: 'success' }));
      }
      setSelectedWithdrawal(null);
      setActionType(null);
      setActionNote('');
      fetchData();
    } catch (error: any) {
      dispatch(showToast({ message: error.response?.data?.detail || 'Action failed', type: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundAction = async () => {
    if (!selectedRefund || !actionType) return;
    setIsLoading(true);
    try {
      if (actionType === 'approve') {
        await adminPaymentsService.approveRefund(selectedRefund.id, actionNote);
        dispatch(showToast({ message: 'Refund Approved', type: 'success' }));
      } else if (actionType === 'reject') {
        await adminPaymentsService.rejectRefund(selectedRefund.id, actionNote);
        dispatch(showToast({ message: 'Refund Rejected', type: 'success' }));
      }
      setSelectedRefund(null);
      setActionType(null);
      setActionNote('');
      fetchData();
    } catch (error: any) {
      dispatch(showToast({ message: error.response?.data?.detail || 'Action failed', type: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletAdjustment = async () => {
    setIsLoading(true);
    try {
      await adminPaymentsService.adjustWalletBalance(adjustmentData);
      dispatch(showToast({ message: 'Wallet Balance Adjusted', type: 'success' }));
      setAdjustmentData({ userId: '', amount: 0, type: 'Credit', reason: '' });
    } catch (error: any) {
      dispatch(showToast({ message: error.response?.data?.detail || 'Adjustment failed', type: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </button>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Payment Management</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 ml-14">
            Manage transactions, withdrawals, and refunds
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {[
            { id: 'transactions', label: 'Transactions', icon: DollarSign },
            { id: 'withdrawals', label: 'Withdrawals', icon: Wallet },
            { id: 'refunds', label: 'Refunds', icon: RefreshCcw },
            { id: 'adjustments', label: 'Wallet Adjustments', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {isLoading ? (
                    <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                  ) : transactions.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No transactions found</td></tr>
                  ) : (
                    transactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4 text-sm font-mono text-slate-500">{txn.id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 text-sm">{txn.type}</td>
                        <td className={`px-6 py-4 text-sm font-bold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.currency} {txn.amount}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${txn.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              txn.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {txn.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Bank</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                ) : withdrawals.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No pending withdrawals</td></tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 text-sm">{w.userId}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                        {w.currency} {w.amount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {w.bankName} - {w.accountNumber}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          {w.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <Button size="sm" onClick={() => { setSelectedWithdrawal(w); setActionType('approve'); }}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => { setSelectedWithdrawal(w); setActionType('reject'); }}>Reject</Button>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedWithdrawal(w); setActionType('complete'); }}>Complete</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'refunds' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Txn ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center">Loading...</td></tr>
                ) : refunds.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No pending refunds</td></tr>
                ) : (
                  refunds.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 text-sm font-mono">{r.transactionId}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                        {r.currency} {r.amount}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {r.reason}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm flex gap-2">
                        <Button size="sm" onClick={() => { setSelectedRefund(r); setActionType('approve'); }}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => { setSelectedRefund(r); setActionType('reject'); }}>Reject</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'adjustments' && (
          <div className="max-w-2xl bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Manual Wallet Adjustment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User ID</label>
                <input
                  type="text"
                  value={adjustmentData.userId}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, userId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                  placeholder="Enter user ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                  <input
                    type="number"
                    value={adjustmentData.amount}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={adjustmentData.type}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value as 'Credit' | 'Debit' })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                  >
                    <option value="Credit">Credit (Add)</option>
                    <option value="Debit">Debit (Deduct)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                <textarea
                  value={adjustmentData.reason}
                  onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                  rows={3}
                  placeholder="Reason for adjustment"
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleWalletAdjustment} isLoading={isLoading}>
                  Submit Adjustment
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Action Modal */}
        {(selectedWithdrawal || selectedRefund) && actionType && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 capitalize">
                {actionType} {selectedWithdrawal ? 'Withdrawal' : 'Refund'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Are you sure you want to {actionType} this request?
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {actionType === 'reject' ? 'Rejection Reason' : 'Notes / Reference'}
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="secondary" onClick={() => {
                  setSelectedWithdrawal(null);
                  setSelectedRefund(null);
                  setActionType(null);
                }}>
                  Cancel
                </Button>
                <Button
                  variant={actionType === 'reject' ? 'danger' : 'primary'}
                  onClick={selectedWithdrawal ? handleWithdrawalAction : handleRefundAction}
                  isLoading={isLoading}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentsPage;
