import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  ChevronDown,
  FileText,
  Activity,
  Settings
} from 'lucide-react';

const ClientLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedLevel]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/client/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch logs.');
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLevelBadge = (level) => {
    const config = {
      info: { color: 'bg-blue-100 text-blue-700', icon: Info },
      success: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      warning: { color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
      error: { color: 'bg-red-100 text-red-700', icon: AlertCircle }
    }[level] || { color: 'bg-gray-100 text-gray-700', icon: Info };
    const Icon = config.icon;
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}><Icon className="w-3 h-3" />{level}</span>;
  };

  const getTypeIcon = (type) => {
    const Icon = {
      agent: Activity,
      build: Settings,
    }[type] || FileText;
    return <Icon className="w-4 h-4 text-slate-500" />;
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Level', 'Message', 'Details'],
      ...filteredLogs.map(log => [log.timestamp, log.type, log.level, log.message, log.details])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "arc-client-logs.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading && !logs.length) return <div className="p-6">Loading logs...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Event Logs</h1>
          <p className="text-slate-600 mt-1">Review events related to your agents and builds.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50"><RefreshCw className="w-4 h-4" />Refresh</button>
            <button onClick={exportLogs} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50"><Download className="w-4 h-4" />Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full lg:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50">
                <Filter className="w-4 h-4" />Filters<ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
        </div>
        {showFilters && (
            <div className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-slate-700 mb-2">Log Level</label>
                <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full md:w-1/3 px-3 py-2 border rounded-lg">
                    <option value="all">All Levels</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>
            </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-left font-medium text-slate-700 w-8"></th>
                <th className="p-4 text-left font-medium text-slate-700">Level</th>
                <th className="p-4 text-left font-medium text-slate-700">Message</th>
                <th className="p-4 text-left font-medium text-slate-700">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLogs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50">
                  <td className="p-4">{getTypeIcon(log.type)}</td>
                  <td className="p-4">{getLevelBadge(log.level)}</td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{log.message}</p>
                    {log.details && <p className="text-sm text-slate-500">{log.details}</p>}
                  </td>
                  <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientLogs; 