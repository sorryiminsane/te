import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Clipboard, Check, Plus, RefreshCw, AlertTriangle, Users as UsersIcon, BarChart, Shield, UserCheck, UserX, Settings } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ifUser');
  const [duration, setDuration] = useState(30);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCodes();
  }, []);

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchCodes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/registration-codes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCodes(response.data.codes || []);
    } catch (err) {
      console.error('Failed to fetch codes:', err);
    }
  };

  const handleGenerateClick = () => {
    setShowModal(true);
  };

  const generateCode = async () => {
    setLoading(true);
    setError('');
    setShowModal(false);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/registration-codes', 
        { 
          role: selectedRole, 
          access_days: parseInt(duration),
          max_uses: 1
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCodes(prevCodes => [response.data, ...prevCodes]);
      fetchUsers(); // Refresh users list
    } catch (err) {
      setError('Failed to generate code. You may not have permission.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-700', text: 'Active' },
      redeemed: { color: 'bg-blue-100 text-blue-700', text: 'Redeemed' },
      expired: { color: 'bg-gray-100 text-gray-700', text: 'Expired' },
    };
    const config = statusConfig[status] || statusConfig.expired;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'SA': { color: 'bg-red-100 text-red-700', icon: Shield, text: 'Super Admin' },
      'A': { color: 'bg-orange-100 text-orange-700', icon: Shield, text: 'Admin' },
      'ifUser': { color: 'bg-blue-100 text-blue-700', icon: UserCheck, text: 'InfoStealer' },
      'ROP': { color: 'bg-purple-100 text-purple-700', icon: Settings, text: 'RAT Operator' },
      'LO': { color: 'bg-gray-100 text-gray-700', icon: Settings, text: 'Loader' },
    };
    const config = roleConfig[role] || roleConfig.ifUser;
    const IconComponent = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UsersIcon className="w-6 h-6" />
            Users
          </h1>
          <p className="text-slate-600 mt-1">Manage users and their access permissions.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-6">
        {/* Main Area - Users Table */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-700">Username</th>
                    <th className="text-left p-4 font-medium text-slate-700">Role</th>
                    <th className="text-left p-4 font-medium text-slate-700">Status</th>
                    <th className="text-left p-4 font-medium text-slate-700">Access Period</th>
                    <th className="text-left p-4 font-medium text-slate-700">Last Login</th>
                    <th className="text-left p-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {userLoading && (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-slate-500">
                        <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" />
                        Loading users...
                      </td>
                    </tr>
                  )}
                  {!userLoading && users.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-slate-500">
                        No users found. Generate codes to create new users.
                      </td>
                    </tr>
                  )}
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-slate-900">{user.username}</span>
                      </td>
                      <td className="p-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600">
                          {user.access_start && user.access_end ? (
                            <>
                              <div>Start: {new Date(user.access_start).toLocaleDateString()}</div>
                              <div>End: {new Date(user.access_end).toLocaleDateString()}</div>
                            </>
                          ) : (
                            'Not set'
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Fixed Right Panel - Generate New Code */}
        <div className="w-80 flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border-2 border-slate-900 h-full flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Generate New Code</h2>
              <button
                onClick={handleGenerateClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 mb-4"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {loading ? 'Generating...' : 'Generate Code'}
              </button>
            </div>
            
            {/* Scrollable codes list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {codes.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  No codes generated yet
                </div>
              )}
              {codes.map((code) => (
                <div key={code.code} className="border-2 border-slate-900 rounded-lg p-3 bg-slate-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-600 font-bold text-sm">{code.code}</span>
                        <span className="text-green-600 font-semibold text-xs px-2 py-1 bg-green-100 rounded">
                          {code.access_days || 7} days
                        </span>
                      </div>
                      {code.username && (
                        <div className="text-blue-600 font-mono text-xs mt-1 opacity-80">
                          {code.username}
                        </div>
                      )}
                      <div className="mt-2">
                        {getRoleBadge(code.role)}
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(code.code)}
                      className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      {copiedCode === code.code ? <Check className="w-3 h-3 text-green-500" /> : <Clipboard className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="text-xs text-slate-500">
                    Created: {code.created_at ? new Date(code.created_at).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Generate New Access Code</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ifUser">InfoStealer</option>
                    <option value="ROP">RAT Operator</option>
                    <option value="RUser">Ransomware User</option>
                    <option value="LO">Loader Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={generateCode}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;