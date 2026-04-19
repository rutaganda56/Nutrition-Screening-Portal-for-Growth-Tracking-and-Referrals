import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Activity,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: 'Critical' | 'Warning' | 'Info';
  patientId: string;
  patientName: string;
  message: string;
  timestamp: string;
  status: 'Unread' | 'Read' | 'Resolved';
  dueDate?: string;
}

export const AlertsFollowUps = () => {
  const [activeTab, setActiveTab] = useState('alerts');

  const alerts = [
    {
      id: 'A-1001',
      type: 'Critical',
      patientId: 'P-1024',
      patientName: 'Uwase Aline',
      message: 'MUAC dropped below 11cm - Immediate intervention required',
      timestamp: '2 hours ago',
      status: 'Unread',
      severity: 'critical'
    },
    {
      id: 'A-1002',
      type: 'Critical',
      patientId: 'P-1089',
      patientName: 'Mugisha David',
      message: 'Missed scheduled follow-up appointment',
      timestamp: '5 hours ago',
      status: 'Unread',
      severity: 'critical'
    },
    {
      id: 'A-1003',
      type: 'Warning',
      patientId: 'P-1156',
      patientName: 'Imena Diane',
      message: 'Weight gain plateau for 2 weeks',
      timestamp: '1 day ago',
      status: 'Unread',
      severity: 'warning'
    },
    {
      id: 'A-1004',
      type: 'Info',
      patientId: 'P-1201',
      patientName: 'Ntare Eric',
      message: 'Scheduled for monthly growth monitoring',
      timestamp: '2 days ago',
      status: 'Read',
      severity: 'info'
    }
  ];

  const followUps = [
    {
      id: 'F-2001',
      type: 'Critical',
      patientId: 'P-1024',
      patientName: 'Uwase Aline',
      message: 'Weekly weight check and MUAC measurement',
      timestamp: '1 day overdue',
      status: 'Unread',
      dueDate: '2026-02-22'
    },
    {
      id: 'F-2002',
      type: 'Warning',
      patientId: 'P-1156',
      patientName: 'Imena Diane',
      message: 'Bi-weekly nutrition counseling session',
      timestamp: 'Scheduled',
      status: 'Unread',
      dueDate: '2026-02-24'
    },
    {
      id: 'F-2003',
      type: 'Info',
      patientId: 'P-1242',
      patientName: 'Mutesi Divine',
      message: 'Monthly growth monitoring check',
      timestamp: 'Scheduled',
      status: 'Read',
      dueDate: '2026-02-25'
    }
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'Critical':
        return 'destructive';
      case 'Warning':
        return 'default';
      case 'Info':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'Warning':
        return <Bell className="h-5 w-5 text-yellow-600" />;
      case 'Info':
        return <Activity className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    toast.success('Alert marked as read');
  };

  const handleResolve = (alertId: string) => {
    toast.success('Alert resolved successfully');
  };

  const unreadAlerts = alerts.filter(a => a.status === 'Unread').length;
  const criticalAlerts = alerts.filter(a => a.type === 'Critical').length;
  const overdueFollowUps = followUps.filter(f => f.dueDate === 'Overdue').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alerts & Follow-Ups</h1>
        <p className="text-gray-600 mt-1">Monitor critical alerts and manage patient follow-ups</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Alerts</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{unreadAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue Tasks</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{overdueFollowUps}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-3xl font-bold mt-1">{followUps.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alerts">
            <Bell className="h-4 w-4 mr-2" />
            Alerts ({alerts.length})
          </TabsTrigger>
          <TabsTrigger value="followups">
            <Calendar className="h-4 w-4 mr-2" />
            Follow-Ups ({followUps.length})
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`${alert.status === 'Unread' ? 'border-l-4 border-l-red-500' : ''}`}
            >
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{alert.patientName}</h3>
                          <Badge variant={getAlertColor(alert.type)}>
                            {alert.type}
                          </Badge>
                          {alert.status === 'Unread' && (
                            <Badge variant="outline">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{alert.patientId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{alert.timestamp}</p>
                        {alert.dueDate && (
                          <Badge variant="outline" className="mt-1">
                            {alert.dueDate}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm mb-3">{alert.message}</p>
                    <div className="flex gap-2">
                      {alert.status === 'Unread' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkAsRead(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Read
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                      <Button size="sm" variant="ghost">
                        View Patient
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Follow-Ups Tab */}
        <TabsContent value="followups" className="space-y-4">
          {/* Overdue Section */}
          {overdueFollowUps > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Overdue Follow-Ups
              </h3>
              {followUps.filter(f => f.dueDate === 'Overdue').map((followUp) => (
                <Card key={followUp.id} className="border-l-4 border-l-red-500 mb-3">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{followUp.patientName}</h3>
                          <Badge variant="destructive">Overdue</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{followUp.patientId}</p>
                        <p className="text-sm">{followUp.message}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Schedule Now
                      </Button>
                      <Button size="sm" variant="outline">
                        Contact Patient
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Upcoming Follow-Ups */}
          <h3 className="text-lg font-semibold mb-3">Upcoming Follow-Ups</h3>
          {followUps.filter(f => f.dueDate !== 'Overdue').map((followUp) => (
            <Card key={followUp.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{followUp.patientName}</h3>
                      <Badge variant={getAlertColor(followUp.type)}>
                        {followUp.dueDate}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{followUp.patientId}</p>
                    <p className="text-sm text-gray-700">{followUp.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Reschedule
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2" />
                <span>Schedule Follow-Up</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Bell className="h-6 w-6 mx-auto mb-2" />
                <span>Set Alert</span>
              </div>
            </Button>
            <Button variant="outline" className="h-20">
              <div className="text-center">
                <Activity className="h-6 w-6 mx-auto mb-2" />
                <span>View All Patients</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};