import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { alertsApi, referralsApi, AlertResponse, ReferralResponse } from '@/services/api';

export const AlertsFollowUps = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [referrals, setReferrals] = useState<ReferralResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = () => {
    setLoading(true);
    const doctorId = Number(user?.id);
    Promise.all([
      alertsApi.getAll(),
      referralsApi.getAll()
    ])
    .then(([allAlerts, allReferrals]) => {
      if (user) {
        const userNameStr = user.name?.toLowerCase().trim();
        
        // Filter alerts
        const filteredAlerts = allAlerts.filter(a => 
          !a.assignedToName || 
          a.assignedToName.toLowerCase().trim() === userNameStr
        );
        setAlerts(filteredAlerts);

        // Filter referrals
        const filteredReferrals = allReferrals.filter(r => 
          r.referredTo?.toLowerCase().trim() === userNameStr || 
          r.referredByName?.toLowerCase().trim() === userNameStr
        );
        setReferrals(filteredReferrals);
      } else {
        setAlerts(allAlerts);
        setReferrals(allReferrals);
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Failed to load alerts & follow-ups');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const getAlertColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CRITICAL':
      case 'SAM':
        return 'destructive';
      case 'WARNING':
      case 'MAM':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'CRITICAL':
      case 'SAM':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'WARNING':
      case 'MAM':
        return <Bell className="h-5 w-5 text-yellow-600" />;
      default:
        return <Activity className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleMarkAsRead = (alertId: number) => {
    alertsApi.updateStatus(alertId, 'READ')
      .then(() => {
        toast.success('Alert marked as read');
        fetchAllData();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to update alert status');
      });
  };

  const handleResolve = (alertId: number) => {
    alertsApi.updateStatus(alertId, 'RESOLVED')
      .then(() => {
        toast.success('Alert resolved successfully');
        fetchAllData();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to resolve alert');
      });
  };

  const unreadAlerts = alerts.filter(a => a.status.toUpperCase() === 'UNREAD').length;
  const criticalAlerts = alerts.filter(a => a.alertType.toUpperCase() === 'CRITICAL' || a.alertType.toUpperCase() === 'SAM').length;
  const pendingReferrals = referrals.filter(r => r.status.toUpperCase() === 'PENDING').length;

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
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <Bell className="h-8 w-8" />
              </div>
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
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <AlertTriangle className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Referrals</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{pendingReferrals}</p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold mt-1">{referrals.length}</p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <Calendar className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-4 pt-4 animate-in fade-in duration-500">
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-48 rounded-md" />
          </div>
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <Skeleton className="h-6 w-32" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full rounded" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-24 rounded-md" />
                      <Skeleton className="h-8 w-24 rounded-md" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="alerts">
              <Bell className="h-4 w-4 mr-2" />
              Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="followups">
              <Calendar className="h-4 w-4 mr-2" />
              Referrals & Follow-Ups ({referrals.length})
            </TabsTrigger>
          </TabsList>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {alerts.length > 0 ? (
              alerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`${alert.status.toUpperCase() === 'UNREAD' ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        {getAlertIcon(alert.alertType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{alert.patientName}</h3>
                              <Badge variant={getAlertColor(alert.alertType)}>
                                {alert.alertType}
                              </Badge>
                              {alert.status.toUpperCase() === 'UNREAD' && (
                                <Badge variant="outline">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">Patient ID: {alert.patientId}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">{new Date(alert.createdAt).toLocaleString()}</p>
                            {alert.dueDate && (
                              <Badge variant="outline" className="mt-1">
                                Due: {alert.dueDate}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mb-3">{alert.message}</p>
                        <div className="flex gap-2">
                          {alert.status.toUpperCase() === 'UNREAD' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMarkAsRead(alert.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Read
                            </Button>
                          )}
                          {alert.status.toUpperCase() !== 'RESOLVED' && (
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleResolve(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No active alerts</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Follow-Ups Tab */}
          <TabsContent value="followups" className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Active Specialized Referrals</h3>
            {referrals.length > 0 ? (
              referrals.map((referral) => (
                <Card key={referral.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{referral.patientName}</h3>
                          <Badge variant={referral.priority.toUpperCase() === 'URGENT' ? 'destructive' : 'default'}>
                            {referral.urgency}
                          </Badge>
                          <Badge variant="outline">{referral.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Patient ID: {referral.patientId} • Code: {referral.referralCode}</p>
                        <p className="text-sm text-gray-700"><strong>Referred To:</strong> {referral.referredTo}</p>
                        <p className="text-sm text-gray-700"><strong>Reason:</strong> {referral.referralReason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Referred: {new Date(referral.referredDate).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500 font-semibold mt-1 text-blue-600">Follow-up: {new Date(referral.followUpDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No referrals or scheduled follow-ups found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
