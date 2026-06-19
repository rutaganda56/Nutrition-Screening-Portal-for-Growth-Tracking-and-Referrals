import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Check, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  UserPlus, 
  Stethoscope, 
  ClipboardCheck,
  Search,
  Loader2,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Input } from "@/app/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { alertsApi, AlertResponse } from "@/services/api";
import { cn } from "@/app/components/ui/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getMockNotifications = (role: string): any[] => {
    const normalizedRole = role.toUpperCase();
    const now = new Date();
    if (normalizedRole === 'DOCTOR') {
      return [
        {
          id: 101,
          alertType: 'CRITICAL',
          message: 'New Service Request: SAM case submitted by CHW Jean',
          status: 'UNREAD',
          createdAt: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
          patientName: 'Kamanzi Alex',
          patientId: 1,
          requestId: 5,
          actionType: 'REVIEW_SUMMARY'
        },
        {
          id: 102,
          alertType: 'WARNING',
          message: 'Follow-up Missed: High-risk patient Alex hasn\'t been seen in 14 days',
          status: 'UNREAD',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
          patientId: 1,
          actionType: 'VIEW_GROWTH'
        }
      ];
    } else if (normalizedRole === 'COMMUNITY_HEALTH_WORKER') {
      return [
        {
          id: 201,
          alertType: 'INFO',
          message: 'Doctor\'s Feedback: Clinical Assessment completed for Uwase Aline',
          status: 'UNREAD',
          createdAt: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
          patientId: 2,
          actionType: 'VIEW_INSTRUCTIONS'
        }
      ];
    } else if (normalizedRole === 'ADMINISTRATOR') {
      return [
        {
          id: 301,
          alertType: 'WARNING',
          message: 'Security Alert: 3 failed login attempts for user john@gmail.com',
          status: 'UNREAD',
          createdAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
          userId: 10,
          actionType: 'MANAGE_USER'
        },
        {
          id: 302,
          alertType: 'INFO',
          message: 'New User Registration: Dr. Mutesi Sarah',
          status: 'READ',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
          userId: 11,
          actionType: 'MANAGE_USER'
        }
      ];
    }
    return [];
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await alertsApi.getByUser(Number(user.id));
      const mappedNotifications = data.map(alert => ({
        ...alert,
        actionType: alert.message.toLowerCase().includes('doctor review completed') 
          ? 'VIEW_INSTRUCTIONS' 
          : alert.alertType === 'CRITICAL' ? 'REVIEW_SUMMARY' : 'VIEW_GROWTH'
      }));
      setNotifications(mappedNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setNotifications(getMockNotifications(user.role));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      await alertsApi.updateStatus(id, 'READ');
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
    } catch (err) {
      // Optimistic update for mocks
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => n.status === 'UNREAD').map(n => n.id);
    if (unreadIds.length === 0) return;
    
    try {
      await Promise.all(unreadIds.map(id => alertsApi.updateStatus(id, 'READ')));
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      toast.success('All notifications marked as read');
    } catch (err) {
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      toast.success('All notifications marked as read');
    }
  };

  const handleAction = (notification: any) => {
    markAsRead(notification.id);
    
    switch (notification.actionType) {
      case 'REVIEW_SUMMARY':
        navigate(`/dashboard/clinical-summary?patient=${notification.patientId}&request=${notification.requestId}`);
        break;
      case 'VIEW_GROWTH':
        navigate(`/dashboard/growth-tracking?patient=${notification.patientId}`);
        break;
      case 'VIEW_INSTRUCTIONS':
        navigate(`/dashboard/patient-history?patient=${notification.patientId}&tab=feedback`);
        break;
      case 'MANAGE_USER':
        navigate(`/dashboard/user-management`);
        break;
      default:
        break;
    }
  };

  const getIcon = (actionType: string) => {
    switch (actionType) {
      case 'REVIEW_SUMMARY': return <Stethoscope className="h-5 w-5 text-blue-600" />;
      case 'VIEW_GROWTH': return <ClipboardCheck className="h-5 w-5 text-orange-600" />;
      case 'VIEW_INSTRUCTIONS': return <Info className="h-5 w-5 text-green-600" />;
      case 'MANAGE_USER': return <UserPlus className="h-5 w-5 text-purple-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionButtonLabel = (actionType: string) => {
    switch (actionType) {
      case 'REVIEW_SUMMARY': return 'Review Clinical Summary';
      case 'VIEW_GROWTH': return 'View Growth Chart';
      case 'VIEW_INSTRUCTIONS': return 'View Doctor Feedback';
      case 'MANAGE_USER': return 'Manage User';
      default: return 'View Details';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.message.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'unread') return n.status === 'UNREAD' && matchesSearch;
    if (filter === 'important') return ['CRITICAL', 'WARNING'].includes(n.alertType) && matchesSearch;
    return matchesSearch;
  });

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-8 w-8 text-gray-700" />
            Notifications Center
          </h1>
          <p className="text-gray-600 mt-1">Manage all your alerts and messages</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm px-3 py-1">
              {unreadCount} Unread
            </Badge>
          )}
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0 || loading}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="important">Important</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search notifications..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-5 flex gap-4 items-start">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-2/3 md:w-1/2" />
                      <Skeleton className="h-5 w-16 md:w-24" />
                    </div>
                    <Skeleton className="h-4 w-1/4" />
                    <div className="pt-2 flex gap-2">
                      <Skeleton className="h-8 w-32 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">All caught up!</h3>
              <p className="text-sm text-center max-w-sm">
                {searchQuery 
                  ? "No notifications match your search criteria."
                  : filter === 'unread' 
                    ? "You have no unread notifications at this time." 
                    : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-5 hover:bg-gray-50 transition-colors flex gap-4 items-start",
                    n.status === 'UNREAD' ? "bg-green-50/20" : ""
                  )}
                >
                  <div className={cn(
                    "mt-1 h-10 w-10 rounded-full border flex items-center justify-center shrink-0",
                    n.status === 'UNREAD' ? "bg-white border-green-200 shadow-sm" : "bg-gray-50 border-gray-200"
                  )}>
                    {getIcon(n.actionType)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {n.status === 'UNREAD' && (
                            <span className="flex h-2.5 w-2.5 bg-green-500 rounded-full"></span>
                          )}
                          <p className={cn("text-base", n.status === 'UNREAD' ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                            {n.message}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant={
                        n.alertType === 'CRITICAL' ? 'destructive' :
                        n.alertType === 'WARNING' ? 'secondary' : 'outline'
                      }>
                        {n.alertType}
                      </Badge>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAction(n)}
                        className={cn(
                          n.status === 'UNREAD' 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        )}
                      >
                        {getActionButtonLabel(n.actionType)}
                      </Button>
                      
                      {n.status === 'UNREAD' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(n.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
