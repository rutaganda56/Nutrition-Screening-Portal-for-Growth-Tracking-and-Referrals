import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  Activity,
  Database,
  Shield,
  Download,
  Settings,
  AlertCircle,
  Home,
  UserPlus,
  ClipboardCheck,
} from "lucide-react";
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
  Legend,
} from "recharts";
import {
  usersApi,
  patientsApi,
  screeningsApi,
  facilitiesApi,
  alertsApi,
  serviceRequestsApi,
  UserResponse,
  AlertResponse,
} from "@/services/api";

interface FacilityStats {
  facility: string;
  normal: number;
  moderate: number;
  severe: number;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalScreenings, setTotalScreenings] = useState(0);
  const [facilityStats, setFacilityStats] = useState<FacilityStats[]>([]);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [criticalAlerts, setCriticalAlerts] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          usersData,
          patientsData,
          screeningsData,
          facilitiesData,
          alertsData,
          serviceRequestsData,
        ] = await Promise.all([
          usersApi.getAll(),
          patientsApi.getAll(),
          screeningsApi.getAll(),
          facilitiesApi.getAll(),
          alertsApi.getAll(),
          serviceRequestsApi.getAll(),
        ]);

        setUsers(usersData);
        setTotalPatients(patientsData.length);
        setTotalScreenings(screeningsData.length);
        setAlerts(alertsData);

        // Calculate pending requests
        const pending = serviceRequestsData.filter(
          (sr) => sr.status === "PENDING",
        ).length;
        setPendingRequests(pending);

        // Calculate critical alerts
        const critical = alertsData.filter(
          (a) => a.alertType === "CRITICAL",
        ).length;
        setCriticalAlerts(critical);

        // Calculate usage data by role
        const doctorCount = usersData.filter((u) => u.role === "DOCTOR").length;
        const chwCount = usersData.filter(
          (u) => u.role === "COMMUNITY_HEALTH_WORKER",
        ).length;
        const adminCount = usersData.filter(
          (u) => u.role === "ADMINISTRATOR",
        ).length;

        const roleUsageData = [
          {
            month: "Current",
            doctors: doctorCount,
            chw: chwCount,
            admin: adminCount,
          },
        ];
        setUsageData(roleUsageData);

        // Calculate facility statistics
        const stats: FacilityStats[] = facilitiesData.map((facility) => {
          const facilityScreenings = screeningsData.filter(
            (s) => s.facilityName === facility.name,
          );

          return {
            facility: facility.name,
            normal: facilityScreenings.filter(
              (s) => s.classification === "NORMAL",
            ).length,
            moderate: facilityScreenings.filter(
              (s) => s.classification === "MODERATE_ACUTE_MALNUTRITION",
            ).length,
            severe: facilityScreenings.filter(
              (s) => s.classification === "SEVERE_ACUTE_MALNUTRITION",
            ).length,
          };
        });

        setFacilityStats(stats);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const activeUsers = users.filter((u) => u.status === "ACTIVE");

  const stats = [
    {
      label: "Total Users",
      value: String(users.length),
      change: `${activeUsers.length} active`,
      icon: Users,
      color: "bg-white text-green-600",
    },
    {
      label: "Pending Requests",
      value: String(pendingRequests),
      change: `${criticalAlerts} critical alerts`,
      icon: Activity,
      color: "bg-white text-green-600",
    },
    {
      label: "Total Records",
      value: String(totalPatients + totalScreenings),
      change: `${totalPatients} patients, ${totalScreenings} screenings`,
      icon: Database,
      color: "bg-white text-green-600",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-600 mt-1">
            Administrator Dashboard {user?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
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
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {stat.change} this month
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-md flex items-center justify-center ${stat.color}`}
                  >
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
                <Line
                  type="monotone"
                  dataKey="doctors"
                  stroke="#3b82f6"
                  name="Doctors"
                />
                <Line
                  type="monotone"
                  dataKey="chw"
                  stroke="#10b981"
                  name="CHW"
                />
                <Line
                  type="monotone"
                  dataKey="admin"
                  stroke="#8b5cf6"
                  name="Admin"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Malnutrition Statistics by Facility</CardTitle>
          </CardHeader>
          <CardContent>
            {facilityStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={facilityStats}>
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
            ) : (
              <div className="h-[300px] flex items-center justify-center rounded-lg border border-dashed bg-gray-50 p-6 text-center text-gray-500">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    No facility statistics available
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add facilities and screenings to populate this chart.
                  </p>
                </div>
              </div>
            )}
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
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{u.fullName}</div>
                    <div className="text-sm text-gray-500">
                      {u.role.replace("_", " ")} â€¢ {u.department ?? "N/A"}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={u.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {u.status}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">{u.email}</div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center">
                  <p className="text-sm font-medium text-gray-700">No users found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    New staff accounts will appear here after registration.
                  </p>
                </div>
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
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          alert.alertType === "CRITICAL"
                            ? "destructive"
                            : alert.alertType === "WARNING"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {alert.alertType}
                      </Badge>
                      <span className="text-sm font-medium">
                        {alert.patientName || "System"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(alert.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center">
                  <p className="text-sm font-medium text-gray-700">No alerts found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Critical cases and system notifications will appear here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
              onClick={() => navigate("/dashboard/facilities")}
            >
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-white text-green-600">
                <Home className="h-5 w-5" />
              </div>
              <span>Manage Health Centers</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/dashboard/user-management")}
            >
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-white text-green-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <span>Add User</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/dashboard/analytics")}
            >
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-white text-green-600">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <span>View Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/dashboard/settings")}
            >
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-white text-green-600">
                <Settings className="h-5 w-5" />
              </div>
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

