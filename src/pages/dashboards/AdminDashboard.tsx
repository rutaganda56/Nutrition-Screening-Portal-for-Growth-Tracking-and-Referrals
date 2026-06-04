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
  doctors: number;
  chws: number;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalScreenings, setTotalScreenings] = useState(0);
  const [facilityStats, setFacilityStats] = useState<FacilityStats[]>([]);
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

        // Calculate facility statistics (Personnel-Driven for accuracy)
        const stats: FacilityStats[] = facilitiesData.map((facility) => {
          // Identify all users (Doctors and CHWs) belonging to this facility
          const facilityUsers = usersData.filter(
            (u) => u.facilityId === facility.id || u.facilityName === facility.name
          );

          const staffNames = new Set(facilityUsers.map(u => u.fullName));

          // Aggregate screenings conducted by the staff of THIS facility
          // This ensures statistics are accurately tied to the supervising personnel
          const facilityScreenings = screeningsData.filter(
            (s) => staffNames.has(s.conductedByName) || s.facilityName === facility.name
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
            doctors: facilityUsers.filter((u) => u.role === "DOCTOR").length,
            chws: facilityUsers.filter((u) => u.role === "COMMUNITY_HEALTH_WORKER").length,
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

  const summaryStats = [
    {
      label: "Total Users",
      value: String(users.length),
      change: `${activeUsers.length} active`,
      icon: Users,
    },
    {
      label: "Pending Requests",
      value: String(pendingRequests),
      change: `${criticalAlerts} critical alerts`,
      icon: Activity,
    },
    {
      label: "Total Records",
      value: String(totalPatients + totalScreenings),
      change: `${totalPatients} patients, ${totalScreenings} screenings`,
      icon: Database,
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

      {/* Main Content Area: Stats and Chart Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats Cards */}
        <div className="flex flex-col gap-3">
          {summaryStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                      <p className="text-[10px] text-green-600 font-medium mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600 shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Malnutrition Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Malnutrition Statistics by Facility</CardTitle>
            </CardHeader>
            <CardContent>
              {facilityStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
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
                <div className="h-[320px] flex items-center justify-center rounded-lg border border-dashed bg-gray-50 p-6 text-center text-gray-500">
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
      </div>

      {/* Facility Supervision Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Health Facility Supervision Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Facility Name</th>
                  <th className="px-6 py-3 text-center">Doctors</th>
                  <th className="px-6 py-3 text-center">CHWs</th>
                  <th className="px-6 py-3 text-center">Total Screenings</th>
                  <th className="px-6 py-3 text-center">SAM Cases</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {facilityStats.map((stat, index) => (
                  <tr key={index} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{stat.facility}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {stat.doctors}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {stat.chws}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">{stat.normal + stat.moderate + stat.severe}</td>
                    <td className="px-6 py-4 text-center font-semibold text-red-600">{stat.severe}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={stat.severe > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                        {stat.severe > 5 ? "Critical" : stat.severe > 0 ? "Warning" : "Stable"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {facilityStats.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No facility data recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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

