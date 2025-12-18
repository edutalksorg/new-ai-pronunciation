import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Users, Loader, AlertCircle, CheckCircle, X, Eye } from 'lucide-react';
import { RootState } from '../../store';
import { adminService } from '../../services/admin';
import AdminLayout from '../../components/AdminLayout';
import Button from '../../components/Button';
import Toast from '../../components/Toast';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  subscriptionStatus?: string;
  isApproved?: boolean;
  createdAt?: string;
  avatar?: string;
}

const AdminDashboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({ total: 0, instructors: 0, learners: 0 });
  const [filterRole, setFilterRole] = useState<'all' | 'instructor' | 'user'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Only allow admin role
  if (!user || String(user.role).toLowerCase() !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers(1000, 1);
      const responseData = (res as any)?.data || res;
      const allUsers = Array.isArray(responseData) ? responseData : responseData?.items || [];

      setUsers(allUsers);
      calculateStats(allUsers);
      filterUsers(allUsers, 'all', '');
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userData: UserData[]) => {
    const instructors = userData.filter(u => String(u.role).toLowerCase().includes('instructor')).length;
    const learners = userData.filter(u => String(u.role).toLowerCase() === 'user').length;

    setStats({
      total: userData.length,
      instructors,
      learners
    });
  };

  const filterUsers = (userData: UserData[], role: typeof filterRole, search: string) => {
    let filtered = userData;

    // Filter by role
    if (role !== 'all') {
      filtered = filtered.filter(u => String(u.role).toLowerCase().includes(role === 'instructor' ? 'instructor' : 'user'));
    }

    // Filter by search term
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.fullName?.toLowerCase().includes(lowerSearch) ||
        u.email?.toLowerCase().includes(lowerSearch) ||
        u.phoneNumber?.includes(search)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleFilterChange = (role: typeof filterRole) => {
    setFilterRole(role);
    filterUsers(users, role, searchTerm);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setSearchTerm(search);
    filterUsers(users, filterRole, search);
  };

  const handleChangeUserStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'banned') => {
    try {
      await adminService.changeUserStatus(userId, newStatus);
      // Reload users
      loadUsers();
    } catch (err) {
      console.error('Error changing user status:', err);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!window.confirm('Are you sure you want to approve this instructor?')) return;

    try {
      setLoading(true);
      await adminService.reviewInstructor(userId, { approve: true });
      // Refresh list to show updated status
      await loadUsers();
      alert('Instructor approved successfully');
    } catch (err: any) {
      console.error('Error approving instructor:', err);
      const errorData = err.response?.data || err;
      const msg = errorData.detail || errorData.message || errorData.title || 'Failed to approve instructor';
      alert(`Failed: ${msg} (Status: ${err.response?.status})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-dvh bg-white dark:bg-slate-950 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage all users, instructors, and system settings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-300 font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{stats.total}</p>
                </div>
                <Users className="text-blue-500 dark:text-blue-400" size={40} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-300 font-medium">Instructors</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{stats.instructors}</p>
                </div>
                <CheckCircle className="text-green-500 dark:text-green-400" size={40} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-300 font-medium">Learners</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">{stats.learners}</p>
                </div>
                <AlertCircle className="text-purple-500 dark:text-purple-400" size={40} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 p-6 rounded-lg border border-orange-200 dark:border-orange-700">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-300 font-medium">Quick Actions</p>
                <Button variant="primary" className="mt-4 w-full text-sm" onClick={() => (window.location.href = '/admin/instructors')}>
                  Manage Instructors
                </Button>
              </div>
            </div>
          </div>

          {/* Filter and Search Section */}
          <div className="mb-6 bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search Users</label>
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 md:px-4 py-2 md:py-2 rounded-lg font-medium transition min-h-[44px] ${filterRole === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                >
                  All Users ({users.length})
                </button>
                <button
                  onClick={() => handleFilterChange('instructor')}
                  className={`px-3 md:px-4 py-2 md:py-2 rounded-lg font-medium transition min-h-[44px] ${filterRole === 'instructor'
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                >
                  Instructors ({stats.instructors})
                </button>
                <button
                  onClick={() => handleFilterChange('user')}
                  className={`px-3 md:px-4 py-2 md:py-2 rounded-lg font-medium transition min-h-[44px] ${filterRole === 'user'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                >
                  Learners ({stats.learners})
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-blue-500" size={32} />
                  <span className="ml-3 text-slate-600 dark:text-slate-400">Loading users...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <AlertCircle className="text-slate-400" size={32} />
                  <span className="ml-3 text-slate-600 dark:text-slate-400">No users found</span>
                </div>
              ) : (
                <table className="w-full min-w-[640px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredUsers.map((userData) => (
                      <tr key={userData.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {userData.avatar && (
                              <img src={userData.avatar} alt={userData.fullName} className="w-8 h-8 rounded-full" />
                            )}
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{userData.fullName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{userData.email}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm">{userData.phoneNumber || '-'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${String(userData.role).toLowerCase().includes('instructor')
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}>
                            {String(userData.role).toLowerCase().includes('instructor') ? 'Instructor' : 'Learner'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {String(userData.role).toLowerCase().includes('instructor') && userData.isApproved ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              <CheckCircle size={14} /> Approved
                            </span>
                          ) : String(userData.role).toLowerCase().includes('instructor') ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                              <AlertCircle size={14} /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              <CheckCircle size={14} /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {String(userData.role).toLowerCase().includes('instructor') && !userData.isApproved && (
                              <button
                                onClick={() => handleApprove(userData.id)}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 text-sm font-medium transition min-h-[44px]"
                              >
                                <CheckCircle size={16} /> Approve
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedUser(userData);
                                setShowDetails(true);
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 text-sm font-medium transition min-h-[44px]"
                            >
                              <Eye size={16} /> Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* User Details Modal */}
          {showDetails && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Details</h2>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {selectedUser.avatar && (
                      <img src={selectedUser.avatar} alt={selectedUser.fullName} className="w-20 h-20 rounded-full mx-auto" />
                    )}
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Full Name</label>
                      <p className="text-slate-900 dark:text-white font-medium">{selectedUser.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Email</label>
                      <p className="text-slate-900 dark:text-white">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Phone</label>
                      <p className="text-slate-900 dark:text-white">{selectedUser.phoneNumber || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Role</label>
                      <p className="text-slate-900 dark:text-white capitalize">{selectedUser.role}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Subscription</label>
                      <p className="text-slate-900 dark:text-white">{selectedUser.subscriptionStatus || 'None'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Member Since</label>
                      <p className="text-slate-900 dark:text-white">
                        {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button variant="secondary" onClick={() => setShowDetails(false)} className="flex-1">
                      Close
                    </Button>
                    <Button variant="primary" className="flex-1" onClick={() => (window.location.href = `/admin/instructors`)}>
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
