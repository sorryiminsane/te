import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Check, 
  X, 
  Clock, 
  Package, 
  Settings, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Shield,
  Crown,
  ChevronDown,
  MoreHorizontal,
  FileText,
  Code,
  Zap
} from 'lucide-react';

const Builds = () => {
  const [builds, setBuilds] = useState([]);
  const [filteredBuilds, setFilteredBuilds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchBuilds();
  }, []);

  useEffect(() => {
    filterBuilds();
  }, [builds, searchTerm, selectedStatus, selectedTier]);

  const fetchBuilds = async () => {
    // Simulated data - replace with actual API call
    const mockBuilds = [
      {
        id: 'BUILD_001',
        customer: 'darknet_user1',
        tier: 1,
        status: 'pending',
        requestDate: '2024-01-20T10:30:00Z',
        approvedDate: null,
        configuration: {
          target: 'Windows 10/11',
          obfuscation: 'Standard',
          persistence: true,
          antiAnalysis: true,
          modules: ['browsers', 'wallets', 'files']
        },
        buildSize: '2.3 MB',
        priority: 'normal',
        notes: 'Standard stealer build for Tier 1 customer'
      },
      {
        id: 'BUILD_002',
        customer: 'elite_hacker',
        tier: 2,
        status: 'approved',
        requestDate: '2024-01-19T15:45:00Z',
        approvedDate: '2024-01-19T16:00:00Z',
        configuration: {
          target: 'Windows Server 2019',
          obfuscation: 'Advanced',
          persistence: true,
          antiAnalysis: true,
          modules: ['browsers', 'wallets', 'files', 'keylogger', 'hvnc', 'lateral_movement']
        },
        buildSize: '8.7 MB',
        priority: 'high',
        notes: 'Advanced RAT with full capabilities for enterprise environment'
      },
      {
        id: 'BUILD_003',
        customer: 'crypto_stealer',
        tier: 1,
        status: 'rejected',
        requestDate: '2024-01-18T09:15:00Z',
        approvedDate: '2024-01-18T11:30:00Z',
        configuration: {
          target: 'Windows 7',
          obfuscation: 'None',
          persistence: false,
          antiAnalysis: false,
          modules: ['wallets']
        },
        buildSize: '1.1 MB',
        priority: 'low',
        notes: 'Rejected due to outdated target OS and insufficient security measures'
      },
      {
        id: 'BUILD_004',
        customer: 'shadow_ops',
        tier: 2,
        status: 'building',
        requestDate: '2024-01-20T14:20:00Z',
        approvedDate: '2024-01-20T14:25:00Z',
        configuration: {
          target: 'Windows 11 Enterprise',
          obfuscation: 'Military Grade',
          persistence: true,
          antiAnalysis: true,
          modules: ['browsers', 'wallets', 'files', 'keylogger', 'hvnc', 'surveillance', 'privilege_escalation']
        },
        buildSize: '12.4 MB',
        priority: 'critical',
        notes: 'Custom build with enhanced evasion for high-value target'
      }
    ];
    setBuilds(mockBuilds);
  };

  const filterBuilds = () => {
    let filtered = builds;

    if (searchTerm) {
      filtered = filtered.filter(build =>
        build.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        build.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(build => build.status === selectedStatus);
    }

    if (selectedTier !== 'all') {
      filtered = filtered.filter(build => build.tier === parseInt(selectedTier));
    }

    setFilteredBuilds(filtered);
  };

  const handleViewDetails = (build) => {
    setSelectedBuild(build);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', text: 'Pending', icon: Clock },
      approved: { color: 'bg-green-100 text-green-700', text: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', text: 'Rejected', icon: XCircle },
      building: { color: 'bg-blue-100 text-blue-700', text: 'Building', icon: Settings },
      completed: { color: 'bg-purple-100 text-purple-700', text: 'Completed', icon: Package }
    };

    const config = statusConfig[status] || statusConfig.pending;
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

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-700', text: 'Low' },
      normal: { color: 'bg-blue-100 text-blue-700', text: 'Normal' },
      high: { color: 'bg-orange-100 text-orange-700', text: 'High' },
      critical: { color: 'bg-red-100 text-red-700', text: 'Critical' }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const BuildDetailsModal = ({ isOpen, onClose, build }) => {
    if (!isOpen || !build) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Build Details</h3>
              <p className="text-sm text-slate-600">{build.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Basic Information</h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Customer:</span>
                    <span className="font-medium">{build.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tier:</span>
                    {getTierBadge(build.tier)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    {getStatusBadge(build.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Priority:</span>
                    {getPriorityBadge(build.priority)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Build Size:</span>
                    <span className="font-medium">{build.buildSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Requested:</span>
                    <span className="font-medium">
                      {new Date(build.requestDate).toLocaleDateString()}
                    </span>
                  </div>
                  {build.approvedDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Approved:</span>
                      <span className="font-medium">
                        {new Date(build.approvedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Configuration</h4>
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Target OS:</span>
                    <span className="font-medium">{build.configuration.target}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Obfuscation:</span>
                    <span className="font-medium">{build.configuration.obfuscation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Persistence:</span>
                    <span className={`font-medium ${build.configuration.persistence ? 'text-green-600' : 'text-red-600'}`}>
                      {build.configuration.persistence ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Anti-Analysis:</span>
                    <span className={`font-medium ${build.configuration.antiAnalysis ? 'text-green-600' : 'text-red-600'}`}>
                      {build.configuration.antiAnalysis ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modules */}
              <div className="space-y-4 lg:col-span-2">
                <h4 className="font-semibold text-slate-900">Included Modules</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {build.configuration.modules.map((module, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Code className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">{module}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4 lg:col-span-2">
                <h4 className="font-semibold text-slate-900">Notes</h4>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-700">{build.notes}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            
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
          <h1 className="text-2xl font-bold text-slate-900">Build Management</h1>
          <p className="text-slate-600 mt-1">Monitor customer build activity</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {builds.filter(b => b.status === 'pending').length}
              </p>
              <p className="text-slate-600 text-sm">Pending Approval</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {builds.filter(b => b.status === 'building').length}
              </p>
              <p className="text-slate-600 text-sm">Currently Building</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {builds.filter(b => b.status === 'approved' || b.status === 'completed').length}
              </p>
              <p className="text-slate-600 text-sm">Completed Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {builds.filter(b => b.status === 'rejected').length}
              </p>
              <p className="text-slate-600 text-sm">Rejected</p>
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
                placeholder="Search builds..."
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
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="building">Building</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
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
            </div>
          </div>
        )}
      </div>

      {/* Builds Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-medium text-slate-700">Build ID</th>
                <th className="text-left p-4 font-medium text-slate-700">Customer</th>
                <th className="text-left p-4 font-medium text-slate-700">Tier</th>
                <th className="text-left p-4 font-medium text-slate-700">Status</th>
                <th className="text-left p-4 font-medium text-slate-700">Priority</th>
                <th className="text-left p-4 font-medium text-slate-700">Requested</th>
                <th className="text-left p-4 font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBuilds.map((build) => (
                <tr key={build.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{build.id}</div>
                    <div className="text-sm text-slate-500">{build.buildSize}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{build.customer}</div>
                  </td>
                  <td className="p-4">
                    {getTierBadge(build.tier)}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(build.status)}
                  </td>
                  <td className="p-4">
                    {getPriorityBadge(build.priority)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-600">
                      {new Date(build.requestDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(build.requestDate).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(build)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      {build.status === 'completed' && (
                        <button className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      )}
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

      {/* Build Details Modal */}
      <BuildDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        build={selectedBuild}
      />
    </div>
  );
};

export default Builds; 