import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { 
  Users, 
  Activity, 
  Database, 
  Shield,
  Download,
  Settings,
  TrendingUp,
  AlertCircle,
  Home,
  UserPlus,
  Building,
  ClipboardCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { usersApi, patientsApi, screeningsApi, UserResponse } from '@/services/api';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalScreenings, setTotalScreenings] = useState(0);

  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(console.error);
    patientsApi.getAll().then(data => setTotalPatients(data.length)).catch(console.error);
    screeningsApi.getAll().then(data => setTotalScreenings(data.length)).catch(console.error);
  }, []);

  const activeUsers = users.filter(u => u.status === 'ACTIVE');

  const stats = [
    { label: 'Total Users', value: String(users.length), change: `${activeUsers.length} active`, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'System Uptime', value: '99.8%', change: 'Stable', icon: Activity, color: 'bg-green-100 text-green-600' },
    { label: 'Total Records', value: String(totalPatients + totalScreenings), change: `${totalPatients} patients, ${totalScreenings} screenings`, icon: Database, color: 'bg-purple-100 text-purple-600' },
    { label: 'Active Sessions', value: String(activeUsers.length), change: 'Currently active', icon: Shield, color: 'bg-yellow-100 text-yellow-600' }
  ];

  const usageData = [
    { month: 'Jan', doctors: 45, chw: 78, admin: 12 },
    { month: 'Feb', doctors: 52, chw: 85, admin: 15 },
    { month: 'Mar', doctors: 48, chw: 92, admin: 14 },
    { month: 'Apr', doctors: 58, chw: 98, admin: 16 },
    { month: 'May', doctors: 63, chw: 105, admin: 18 },
    { month: 'Jun', doctors: 67, chw: 112, admin: 19 }
  ];

  const malnutritionStats = [
    { facility: 'Main Clinic', normal: 850, moderate: 120, severe: 30 },
    { facility: 'Village A', normal: 320, moderate: 58, severe: 12 },
    { facility: 'Village B', normal: 290, moderate: 45, severe: 8 },
    { facility: 'Village C', normal: 410, moderate: 67, severe: 15 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-600 mt-1">Administrator Dashboard - {user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change} this month</p>
                  </div>
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Usage by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="doctors" stroke="#3b82f6" name="Doctors" />
                <Line type="monotone" dataKey="chw" stroke="#10b981" name="CHW" />
                <Line type="monotone" dataKey="admin" stroke="#8b5cf6" name="Admin" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Malnutrition Statistics by Facility</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={malnutritionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="facility" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="normal" fill="#10b981" name="Normal" />
                <Bar dataKey="moderate" fill="#f59e0b" name="Moderate" />
                <Bar dataKey="severe" fill="#ef4444" name="Severe" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 5).map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{u.fullName}</div>
                    <div className="text-sm text-gray-500">{u.role.replace('_', ' ')} • {u.department ?? 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant={u.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {u.status}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">{u.email}</div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No users found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        alert.severity === 'High' ? 'destructive' : 
                        alert.severity === 'Medium' ? 'default' : 'secondary'
                      }>
                        {alert.severity}
                      </Badge>
                      <span className="text-sm font-medium">{alert.type}</span>
                    </div>
                    <span className="text-xs text-gray-500">{alert.time}</span>
                  </div>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-green-900">Encryption Status</div>
                  <div className="text-sm text-green-700">Active (AES-256)</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-blue-900">Backup Status</div>
                  <div className="text-sm text-blue-700">Last backup: 2 hours ago</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-purple-900">Audit Logs</div>
                  <div className="text-sm text-purple-700">45,231 entries</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions for Health Center Management */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/facilities')}
            >
              <Home className="h-5 w-5 text-blue-600" />
              <span>Manage Health Centers</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/user-management')}
            >
              <UserPlus className="h-5 w-5 text-green-600" />
              <span>Add User</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/analytics')}
            >
              <ClipboardCheck className="h-5 w-5 text-purple-600" />
              <span>View Reports</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/settings')}
            >
              <Settings className="h-5 w-5 text-orange-600" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};