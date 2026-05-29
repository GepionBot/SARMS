import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Users, Check, X, Shield, Search, Edit, Trash2, Trophy, Save, XCircle } from 'lucide-react';

const AVAILABLE_SPORTS = [
  'basketball',
  'football',
  'volleyball',
  'swimming',
  'athletics',
  'badminton',
  'tennis'
];

const UsersManagement = () => {
  const { user: currentUser } = useAuth();

  // Only admin can access user management
  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editingSports, setEditingSports] = useState(null);
  const [selectedSports, setSelectedSports] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      // Filter out admin users - only show athlete, coach, sport_coordinator
      const filteredUsers = (res.data.users || []).filter(u => u.role !== 'admin');
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await api.put(`/users/${userId}/verify`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to verify user:', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      alert('User deleted successfully');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const openSportsEditor = (user) => {
    setEditingSports(user._id);
    setSelectedSports(user.sports || []);
  };

  const saveSports = async () => {
    try {
      await api.put(`/users/${editingSports}`, { sports: selectedSports });
      fetchUsers();
      setEditingSports(null);
    } catch (error) {
      console.error('Failed to save sports:', error);
    }
  };

  const toggleSport = (sport) => {
    setSelectedSports(prev => 
      prev.includes(sport) 
        ? prev.filter(s => s !== sport)
        : [...prev, sport]
    );
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || 
      u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      coach: 'bg-blue-100 text-blue-700',
      sport_coordinator: 'bg-purple-100 text-purple-700',
      athlete: 'bg-green-100 text-green-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[role] || 'bg-slate-100 text-slate-700'}`}>
        {role?.replace('_', ' ')}
      </span>
    );
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500">You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <p className="text-slate-500">Manage users and verify accounts</p>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="coach">Coach</option>
            <option value="sport_coordinator">Sport Coordinator</option>
            <option value="athlete">Athlete</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users size={48} className="mx-auto mb-4 text-slate-300" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Verified</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.verified ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <Check size={16} /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600">
                          <X size={16} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!user.verified && user.role !== 'admin' && (
                          <button
                            onClick={() => handleVerify(user._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Verify User"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        {user.role === 'coach' && (
                          <button
                            onClick={() => openSportsEditor(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Manage Sports"
                          >
                            <Trophy size={18} />
                          </button>
                        )}
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="text-sm px-2 py-1 border border-slate-300 rounded-lg"
                        >
                          <option value="athlete">Athlete</option>
                          <option value="coach">Coach</option>
                          <option value="sport_coordinator">Sport Coordinator</option>
                        </select>
                        {user._id !== currentUser._id && (
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Sports Editor Modal */}
      {editingSports && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Assign Sports to Coach</h3>
            <p className="text-sm text-slate-500 mb-4">Select the sports this coach can manage:</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {AVAILABLE_SPORTS.map(sport => (
                <button
                  key={sport}
                  onClick={() => toggleSport(sport)}
                  className={`p-3 rounded-lg text-sm font-medium capitalize transition-colors ${
                    selectedSports.includes(sport)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sport}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingSports(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveSports}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
