import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Shield,
  Copy,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 402000,
    totalCustomers: 342,
    activeAgents: 1247,
    pendingBuilds: 23
  });

  const [botToken, setBotToken] = useState('6789012345:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw');
  const [showToken, setShowToken] = useState(false);
  const [botStatus, setBotStatus] = useState('online'); // online, offline, error

  const revenueData = [
    { name: 'Jan', value: 65000 },
    { name: 'Feb', value: 78000 },
    { name: 'Mar', value: 82000 },
    { name: 'Apr', value: 95000 },
    { name: 'May', value: 88000 },
    { name: 'Jun', value: 102000 }
  ];

  const customerData = [
    { name: 'Tier 1', value: 300, color: '#3B82F6' },
    { name: 'Tier 2', value: 42, color: '#10B981' }
  ];

  const maskToken = (token) => {
    if (!token) return '';
    return token.substring(0, 8) + '•'.repeat(20) + token.substring(token.length - 6);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last month</span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ title, description, time, status }) => (
    <div className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${
          status === 'success' ? 'bg-green-500' : 
          status === 'warning' ? 'bg-yellow-500' : 
          'bg-blue-500'
        }`}></div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">ARC Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your malware-as-a-service platform and telegram bot operations.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+12%"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Active Subscribers"
          value={stats.totalCustomers.toLocaleString()}
          change="+8%"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Connected Agents"
          value={stats.activeAgents.toLocaleString()}
          change="+5%"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="Pending Builds"
          value={stats.pendingBuilds}
          change="-2%"
          icon={Shield}
          trend="down"
        />
      </div>

      {/* Bot Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Bot Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Telegram Bot</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                botStatus === 'online' ? 'bg-green-500' : 
                botStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                botStatus === 'online' ? 'text-green-600' : 
                botStatus === 'offline' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {botStatus.charAt(0).toUpperCase() + botStatus.slice(1)}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Active Commands</span>
              <span className="font-medium">47</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Messages Today</span>
              <span className="font-medium">1,247</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium">99.8%</span>
            </div>
          </div>
        </div>

        {/* Bot Token Management */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bot Configuration</h3>
            <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh Status
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm">
                  {showToken ? botToken : maskToken(botToken)}
                </div>
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard(botToken)}
                  className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Bot Username:</span>
                <span className="ml-2 font-medium">@ARC_MaaS_Bot</span>
              </div>
              <div>
                <span className="text-gray-600">Last Restart:</span>
                <span className="ml-2 font-medium">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              Last 6 months
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Customer Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subscription Tiers</h3>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              Active Subscribers
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Bot Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            <ActivityItem
              title="New subscriber registered"
              description="Tier 1 plan via Telegram bot"
              time="2 min ago"
              status="success"
            />
            <ActivityItem
              title="Build request via bot"
              description="Customer: @user1247 (Tier 2)"
              time="15 min ago"
              status="info"
            />
            <ActivityItem
              title="Payment confirmation"
              description="$500 Tier 1 subscription"
              time="32 min ago"
              status="success"
            />
            <ActivityItem
              title="Bot command executed"
              description="/status command by admin"
              time="1 hour ago"
              status="info"
            />
            <ActivityItem
              title="Agent connection lost"
              description="Agent ID: 8821 went offline"
              time="2 hours ago"
              status="warning"
            />
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ARC C2 Server</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Telegram Bot API</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Build Server</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Ready</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Gateway</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 