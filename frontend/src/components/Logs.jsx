import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  User,
  Shield,
  Crown,
  ChevronDown,
  Eye,
  MoreHorizontal,
  FileText,
  Database,
  Server,
  Settings
} from 'lucide-react';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('today');
  const [showFilters, setShowFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLogs();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedType, selectedLevel, selectedDateRange]);

  const fetchLogs = async () => {
    // Simulated data - replace with actual API call
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        type: 'system',
        level: 'info',
        message: 'Server startup completed successfully',
        source: 'ARC-Server',
        details: 'All services initialized and ready to accept connections',
        user: 'system',
        ip: '127.0.0.1'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        type: 'customer',
        level: 'info',
        message: 'New customer registration',
        source: 'Auth-Service',
        details: 'Customer "darknet_user1" successfully registered for Tier 1 service',
        user: 'darknet_user1',
        ip: '192.168.1.100'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 120000).toISOString(),
        type: 'agent',
        level: 'success',
        message: 'Agent connected successfully',
        source: 'C2-Handler',
        details: 'New agent DESKTOP-USER1 connected from 192.168.1.100',
        user: 'elite_hacker',
        ip: '192.168.1.100'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 180000).toISOString(),
        type: 'build',
        level: 'warning',
        message: 'Build request requires manual approval',
        source: 'Build-System',
        details: 'Build BUILD_001 contains advanced features requiring manual review',
        user: 'crypto_stealer',
        ip: '10.0.0.45'
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 240000).toISOString(),
        type: 'security',
        level: 'error',
        message: 'Failed login attempt detected',
        source: 'Auth-Service',
        details: 'Multiple failed login attempts from IP 203.0.113.1',
        user: 'unknown',
        ip: '203.0.113.1'
      },
      {
        id: 6,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        type: 'system',
        level: 'info',
        message: 'Database backup completed',
        source: 'Backup-Service',
        details: 'Daily backup completed successfully - 2.3GB archived',
        user: 'system',
        ip: '127.0.0.1'
      },
      {
        id: 7,
        timestamp: new Date(Date.now() - 360000).toISOString(),
        type: 'agent',
        level: 'info',
        message: 'Command executed successfully',
        source: 'C2-Handler',
        details: 'Tier 2 command "browsers" executed on agent WORKSTATION-CORP',
        user: 'shadow_ops',
        ip: '10.0.0.45'
      },
      {
        id: 8,
        timestamp: new Date(Date.now() - 420000).toISOString(),
        type: 'revenue',
        level: 'success',
        message: 'Payment processed successfully',
        source: 'Payment-Service',
        details: 'Monthly subscription payment of $6000 processed for elite_hacker',
        user: 'elite_hacker',
        ip: '192.168.1.200'
      }
    ];
    setLogs(mockLogs);
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(log => log.type === selectedType);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (selectedDateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (selectedDateRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      if (selectedDateRange !== 'all') {
        filtered = filtered.filter(log => new Date(log.timestamp) >= cutoff);
      }
    }

    setFilteredLogs(filtered);
  };

  const getLevelBadge = (level) => {
    const levelConfig = {
      info: { color: 'bg-blue-100 text-blue-700', text: 'Info', icon: Info },
      success: { color: 'bg-green-100 text-green-700', text: 'Success', icon: CheckCircle },
      warning: { color: 'bg-yellow-100 text-yellow-700', text: 'Warning', icon: AlertTriangle },
      error: { color: 'bg-red-100 text-red-700', text: 'Error', icon: AlertCircle }
    };

    const config = levelConfig[level] || levelConfig.info;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const typeIcons = {
      system: Server,
      customer: User,
      agent: Activity,
      build: Settings,
      security: Shield,
      revenue: Crown,
      database: Database
    };

    const Icon = typeIcons[type] || FileText;
    return <Icon className="w-4 h-4 text-slate-500" />;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Level', 'Source', 'Message', 'User', 'IP', 'Details'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.type,
        log.level,
        log.source,
        log.message,
        log.user,
        log.ip,
        log.details
      ])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arc_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
          <p className="text-slate-600 mt-1">Monitor system activity and security events</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </button>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
              <p className="text-slate-600 text-sm">Total Logs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {logs.filter(log => log.level === 'error').length}
              </p>
              <p className="text-slate-600 text-sm">Errors</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {logs.filter(log => log.level === 'warning').length}
              </p>
              <p className="text-slate-600 text-sm">Warnings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {logs.filter(log => log.timestamp > new Date(Date.now() - 3600000).toISOString()).length}
              </p>
              <p className="text-slate-600 text-sm">Last Hour</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="system">System</option>
                  <option value="customer">Customer</option>
                  <option value="agent">Agent</option>
                  <option value="build">Build</option>
                  <option value="security">Security</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Level
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time Range
                </label>
                <select
                  value={selectedDateRange}
                  onChange={(e) => setSelectedDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-medium text-slate-700">Timestamp</th>
                <th className="text-left p-4 font-medium text-slate-700">Type</th>
                <th className="text-left p-4 font-medium text-slate-700">Level</th>
                <th className="text-left p-4 font-medium text-slate-700">Source</th>
                <th className="text-left p-4 font-medium text-slate-700">Message</th>
                <th className="text-left p-4 font-medium text-slate-700">User</th>
                <th className="text-left p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="text-sm text-slate-900">{formatTimestamp(log.timestamp)}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      <span className="text-sm text-slate-700 capitalize">{log.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getLevelBadge(log.level)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-900">{log.source}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-900 max-w-md">
                      {log.message}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 max-w-md truncate">
                      {log.details}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-900">{log.user}</div>
                    <div className="text-xs text-slate-500">{log.ip}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No logs found</h3>
            <p className="text-slate-600">
              {searchTerm || selectedType !== 'all' || selectedLevel !== 'all' || selectedDateRange !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'System logs will appear here as they are generated'
              }
            </p>
          </div>
        )}
      </div>

      {/* Live Log Stream Indicator */}
      {autoRefresh && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live Updates Active</span>
        </div>
      )}
    </div>
  );
};

export default Logs; 