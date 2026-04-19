import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  Send,
  Bell,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { serviceRequestsApi, alertsApi, ServiceRequestResponse, AlertResponse } from '@/services/api';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [serviceRequests, setServiceRequests] = useState<ServiceRequestResponse[]>([]);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);

  useEffect(() => {
    serviceRequestsApi.getByStatus('PENDING').then(setServiceRequests).catch(console.error);
    alertsApi.getAll().then(setAlerts).catch(console.error);
  }, []);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'PENDING');

  const stats = [
    { label: 'Pending Service Requests', value: String(serviceRequests.length), change: 'Awaiting review', icon: Send, color: 'text-red-600', urgent: true },
    { label: 'Active Alerts', value: String(activeAlerts.length), change: 'Require attention', icon: Bell, color: 'text-yellow-600', urgent: true },
    { label: 'Follow-ups Due Today', value: String(alerts.filter(a => a.alertType === 'FOLLOW_UP').length), change: 'Scheduled', icon: Clock, color: 'text-blue-600', urgent: false },
    { label: 'Total Patients', value: String(new Set(serviceRequests.map(r => r.patientId)).size), change: 'Under care', icon: Users, color: 'text-green-600', urgent: false }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'asap':
        return 'destructive';
      case 'routine':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Clinical Review Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, Dr. {user?.name} - Review patients requiring clinical decisions</p>
      </div>

      {/* Stats Cards - Focused on actionable items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={stat.urgent ? 'border-red-200 bg-red-50/30' : ''}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.label}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  {stat.urgent && <AlertTriangle className="h-3 w-3 text-red-600" />}
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content - Service Requests & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Requests - Takes priority, larger space */}
        <Card className="lg:col-span-2 border-2 border-red-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-red-600" />
                  Service Requests Requiring Review
                </CardTitle>
                <CardDescription className="mt-1">
                  Clinical decisions needed for CHW-submitted cases
                </CardDescription>
              </div>
              <Badge variant="destructive" className="text-sm">
                {serviceRequests.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {serviceRequests.map((request) => (
                <div 
                  key={request.id} 
                  className={`p-4 border-2 rounded-lg ${
                    request.priority === 'URGENT' || request.priority === 'urgent'
                      ? 'border-red-300 bg-red-50/50' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{request.patientName}</h4>
                        <Badge variant={getPriorityColor(request.priority.toLowerCase())}>
                          {request.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {request.requestCode} • {request.patientAge}
                      </p>
                    </div>
                    <Clock className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Reason: {request.reasonCode}</p>
                    <p className="text-sm text-gray-600">{request.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Submitted by:</span> {request.submittedByName}
                      <span className="mx-2">•</span>
                      {new Date(request.submittedAt).toLocaleString()}
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <FileText className="h-4 w-4 mr-2" />
                      Review Case
                    </Button>
                  </div>
                </div>
              ))}
              {serviceRequests.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No pending service requests.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card className="border-2 border-yellow-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-600" />
                  Active Alerts
                </CardTitle>
                <CardDescription className="mt-1">
                  Patients requiring attention
                </CardDescription>
              </div>
              <Badge variant="default" className="text-sm">
                {activeAlerts.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeAlerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border ${
                    alert.alertType === 'SAM' || alert.alertType === 'WEIGHT_LOSS'
                      ? 'border-red-200 bg-red-50' 
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      alert.alertType === 'SAM' ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{alert.patientName}</span>
                        <Badge variant="default" className="text-xs">
                          {alert.alertType}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{alert.alertCode}</p>
                      <p className="text-xs text-gray-600">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    View Details
                  </Button>
                </div>
              ))}
              {activeAlerts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No active alerts.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Clinical Actions</CardTitle>
          <CardDescription>Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/service-request-queue')}
            >
              <FileText className="h-5 w-5 text-green-600" />
              <span>Review Service Requests</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/alerts')}
            >
              <Bell className="h-5 w-5 text-yellow-600" />
              <span>View All Alerts</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/referrals')}
            >
              <Send className="h-5 w-5 text-purple-600" />
              <span>Manage Referrals</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};