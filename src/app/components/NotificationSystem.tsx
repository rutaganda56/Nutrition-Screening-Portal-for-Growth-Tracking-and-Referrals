import React, { useState, useEffect } from "react";
import { Bell, Check, Info, AlertTriangle, UserPlus, Stethoscope, ClipboardCheck, X } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { alertsApi, AlertResponse } from "@/services/api";
import { cn } from "@/app/components/ui/utils";
import { formatDistanceToNow } from "date-fns";

export const NotificationSystem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AlertResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock data for new features requested if API doesn't have them yet
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
          status: 'UNREAD',
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
          userId: 11,
          actionType: 'MANAGE_USER'
        }
      ];
    }
    return [];
  };

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = () => {
      alertsApi.getByUser(Number(user.id))
        .then(data => {
          // Map backend alerts to frontend notification structure
          const mappedNotifications = data.map(alert => ({
            ...alert,
            // If it's an INFO alert about doctor review, set action to VIEW_INSTRUCTIONS
            actionType: alert.message.toLowerCase().includes('doctor review completed') 
              ? 'VIEW_INSTRUCTIONS' 
              : alert.alertType === 'CRITICAL' ? 'REVIEW_SUMMARY' : 'VIEW_GROWTH'
          }));
          setNotifications(mappedNotifications);
          setUnreadCount(mappedNotifications.filter(n => n.status === 'UNREAD').length);
        })
        .catch(err => {
          console.error('Failed to fetch notifications:', err);
          // Fallback to mocks if API fails or for development
          const roleBasedMocks = getMockNotifications(user.role);
          setNotifications(roleBasedMocks);
          setUnreadCount(roleBasedMocks.filter(n => n.status === 'UNREAD').length);
        });
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = (id: number) => {
    alertsApi.updateStatus(id, 'READ')
      .then(() => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      })
      .catch(console.error);
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
      case 'REVIEW_SUMMARY': return <Stethoscope className="h-4 w-4 text-blue-600" />;
      case 'VIEW_GROWTH': return <ClipboardCheck className="h-4 w-4 text-orange-600" />;
      case 'VIEW_INSTRUCTIONS': return <Info className="h-4 w-4 text-green-600" />;
      case 'MANAGE_USER': return <UserPlus className="h-4 w-4 text-purple-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionButtonLabel = (actionType: string) => {
    switch (actionType) {
      case 'REVIEW_SUMMARY': return 'Review Clinical Summary';
      case 'VIEW_GROWTH': return 'View Growth Chart';
      case 'VIEW_INSTRUCTIONS': return 'View Instructions';
      case 'MANAGE_USER': return 'Manage User';
      default: return 'View Details';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
            {unreadCount} New
          </Badge>
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={cn(
                  "p-4 border-b hover:bg-gray-50 transition-colors cursor-default",
                  n.status === 'UNREAD' ? "bg-green-50/30" : ""
                )}
              >
                <div className="flex gap-3">
                  <div className="mt-1 h-8 w-8 rounded-full bg-white border flex items-center justify-center shrink-0">
                    {getIcon(n.actionType || '')}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={cn("text-sm", n.status === 'UNREAD' ? "font-semibold" : "text-gray-600")}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                    <div className="pt-2">
                      <Button 
                        size="sm" 
                        className="w-full bg-green-600 hover:bg-green-700 h-8 text-xs"
                        onClick={() => handleAction(n)}
                      >
                        {getActionButtonLabel(n.actionType || '')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-2 border-t text-center">
          <Button 
            variant="ghost" 
            className="text-green-600 hover:text-green-700 w-full text-xs font-medium"
            onClick={() => navigate('/dashboard/notifications')}
          >
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
