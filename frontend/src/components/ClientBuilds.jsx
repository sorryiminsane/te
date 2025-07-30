import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings, 
  Eye, 
  PlusCircle, 
  FileText, 
  Code,
  Zap,
  RefreshCw,
  X,
  Package
} from 'lucide-react';

const ClientBuilds = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBuild, setSelectedBuild] = useState(null);

  useEffect(() => {
    fetchBuilds();
  }, []);

  const fetchBuilds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/client/builds', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch builds.');
      const data = await response.json();
      setBuilds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (build) => {
    setSelectedBuild(build);
    setShowDetailsModal(true);
  };

  const handleDownload = (build) => {
    // In a real app, this would trigger a file download from a secure URL
    alert(`Downloading build: ${build.build_id}`);
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-700', icon: Settings },
      building: { color: 'bg-indigo-100 text-indigo-700', icon: Zap },
      completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
    }[status];
    if (!config) return null;
    const Icon = config.icon;
    return <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}><Icon className="w-3 h-3" />{status}</span>;
  };
  
  const BuildDetailsModal = ({ isOpen, onClose, build }) => {
    if (!isOpen || !build) return null;
    const config = JSON.parse(build.configuration || '{}');
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b"><h3 className="text-lg font-semibold">Build Details</h3><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X/></button></div>
          <div className="p-6 overflow-y-auto space-y-4">
            <p><strong>ID:</strong> {build.build_id}</p>
            <p><strong>Status:</strong> {getStatusBadge(build.status)}</p>
            <p><strong>Requested:</strong> {new Date(build.request_date).toLocaleString()}</p>
            {build.completion_date && <p><strong>Completed:</strong> {new Date(build.completion_date).toLocaleString()}</p>}
            <h4 className="font-semibold mt-4">Configuration:</h4>
            <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2">
              <p><strong>Target OS:</strong> {config.target_os}</p>
              <p><strong>Obfuscation:</strong> {config.obfuscation}</p>
              <p><strong>Modules:</strong> {(config.modules || []).join(', ')}</p>
              <p><strong>Notes:</strong> {build.notes || 'None'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const RequestBuildModal = ({ isOpen, onClose, onBuildRequested }) => {
    const [config, setConfig] = useState({ target_os: 'Windows 11', obfuscation: 'Standard', modules: ['browsers', 'wallets'], notes: '' });

    const handleBuildSubmit = async () => {
        console.log('[Build] --- New Build Request ---');
        console.log('[Build] Config to be sent:', config);
        const token = localStorage.getItem('token');
        console.log(`[Build] Using auth token: ${token ? 'Yes' : 'No'}`);

        try {
            const response = await fetch('/api/client/builds', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(config)
            });

            console.log('[Build] Raw server response:', response);
            const responseData = await response.json();
            console.log('[Build] Parsed response JSON:', responseData);

            if (response.ok) {
                console.log('[Build] OK: Request successful.');
                onBuildRequested(responseData.build); 
            } else {
                console.error('Build request failed:', responseData.error);
                alert(`Build failed: ${responseData.error}`);
            }
        } catch (error) {
            console.error('[Build] FATAL: An exception occurred during the fetch call.', error);
            alert('An unexpected error occurred. Check the console for details.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold">Request New Build</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <input 
                            type="text" 
                            value={config.notes} 
                            onChange={(e) => setConfig({...config, notes: e.target.value})} 
                            className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Optional build notes..."
                        />
                    </div>
                    {/* Add more config options here as needed */}
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-slate-100">Cancel</button>
                    <button onClick={handleBuildSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit Request</button>
                </div>
            </div>
        </div>
    );
  };

  if (loading) return <div className="p-6">Loading builds...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold">My Builds</h1>
            <p className="text-slate-600 mt-1">Request new builds and download completed ones.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchBuilds} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-slate-50"><RefreshCw className="w-4 h-4" />Refresh</button>
            <button onClick={() => setShowRequestModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><PlusCircle className="w-4 h-4" />Request Build</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-left font-medium">Build ID</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Requested</th>
                <th className="p-4 text-left font-medium">Completed</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {builds.map((build) => (
                <tr key={build.build_id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-sm">{build.build_id}</td>
                  <td className="p-4">{getStatusBadge(build.status)}</td>
                  <td className="p-4 text-sm">{new Date(build.request_date).toLocaleString()}</td>
                  <td className="p-4 text-sm">{build.completion_date ? new Date(build.completion_date).toLocaleString() : 'N/A'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewDetails(build)} className="p-2 text-slate-600 hover:text-blue-600"><Eye /></button>
                      {build.status === 'completed' && <button onClick={() => handleDownload(build)} className="p-2 text-slate-600 hover:text-green-600"><Download /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BuildDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} build={selectedBuild} />
      <RequestBuildModal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} onBuildRequested={(newBuild) => { 
        if(newBuild) setBuilds(prev => [newBuild, ...prev]);
        setShowRequestModal(false); 
      }} />
    </div>
  );
};

export default ClientBuilds; 