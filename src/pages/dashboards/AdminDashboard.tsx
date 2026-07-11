import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import PeopleIcon from "@mui/icons-material/People";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StorageIcon from "@mui/icons-material/Storage";
import SecurityIcon from "@mui/icons-material/Security";
import DownloadIcon from "@mui/icons-material/Download";
import SettingsIcon from "@mui/icons-material/Settings";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PieChartIcon from "@mui/icons-material/PieChart";
import { ExportDropdown } from "@/app/components/ui/ExportDropdown";
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
  PieChart,
  Pie,
  Cell,
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
  PatientResponse,
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
  const [patients, setPatients] = useState<PatientResponse[]>([]);
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
          usersApi.getAll().catch(() => []),
          patientsApi.getAll().catch(() => []),
          screeningsApi.getAll().catch(() => []),
          facilitiesApi.getAll().catch(() => []),
          alertsApi.getAll().catch(() => []),
          serviceRequestsApi.getAll().catch(() => []),
        ]);

        setUsers(usersData);
        setPatients(patientsData);
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
              (s) => s.classification?.toUpperCase() === "NORMAL",
            ).length,
            moderate: facilityScreenings.filter(
              (s) => s.classification?.toUpperCase() === "MAM",
            ).length,
            severe: facilityScreenings.filter(
              (s) => s.classification?.toUpperCase() === "SAM",
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

  const severityData = React.useMemo(() => {
    const counts = { NORMAL: 0, MAM: 0, SAM: 0 };
    
    patients.forEach(p => {
      const status = p.currentStatus ? p.currentStatus.toUpperCase() : 'NORMAL';
      if (status === 'SAM') counts.SAM += 1;
      else if (status === 'MAM') counts.MAM += 1;
      else counts.NORMAL += 1;
    });

    return [
      { name: 'Normal', value: counts.NORMAL, color: '#10b981' },
      { name: 'Moderate (MAM)', value: counts.MAM, color: '#f59e0b' },
      { name: 'Severe (SAM)', value: counts.SAM, color: '#ef4444' }
    ].filter(entry => entry.value > 0 || patients.length === 0); 
  }, [patients]);

  const activeUsers = users.filter((u) => u.status === "ACTIVE");

  const summaryStats = [
    {
      label: "Total Users",
      value: String(users.length),
      change: `${activeUsers.length} active`,
      icon: PeopleIcon,
      route: undefined
    },
    {
      label: "Total Facilities",
      value: String(facilityStats.length),
      change: `${pendingRequests} pending requests`,
      icon: HomeIcon,
      route: "/dashboard/facilities"
    },
    {
      label: "Total Records",
      value: String(totalPatients + totalScreenings),
      change: `${totalPatients} patients, ${totalScreenings} screenings`,
      icon: StorageIcon,
      route: "/dashboard/analytics"
    },
  ];

  return (
    <div id="admin-dashboard" className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-600 mt-1">
            Administrator Dashboard {user?.name}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown 
            data={facilityStats} 
            filename={`AdminDashboard_FacilityStats_${new Date().toISOString().split('T')[0]}`} 
            pdfElementId="admin-dashboard"
            variant="outline"
          />
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 bg-white group"
              onClick={() => stat.route && navigate(stat.route)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-1 text-gray-900 tracking-tight">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Malnutrition Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Malnutrition Statistics by Facility</CardTitle>
            <CardDescription>
              This stacked bar chart displays the total number of nutrition screenings conducted at each health facility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {facilityStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={facilityStats} margin={{ top: 20, right: 10, left: -20, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="facility"
                    angle={-45}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="normal" stackId="a" fill="#10b981" name="Normal" maxBarSize={40} />
                  <Bar dataKey="moderate" stackId="a" fill="#f59e0b" name="Moderate (MAM)" maxBarSize={40} />
                  <Bar dataKey="severe" stackId="a" fill="#ef4444" name="Severe (SAM)" radius={[4, 4, 0, 0]} maxBarSize={40} />
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

        {/* Severity Pie Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Malnutrition Severity Breakdown</CardTitle>
            <CardDescription>System-wide patient health classification status</CardDescription>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <PieChartIcon className="h-12 w-12 mb-2 stroke-1" />
                <p className="text-sm font-medium">No severity stats to display.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={380}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Facility Supervision Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-green-600" />
            Health Facility Supervision Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
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
                  <tr key={index} className="bg-white border-b last:border-0 hover:bg-green-50/50 transition-colors">
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
              <PeopleIcon className="h-5 w-5 text-green-600" />
              Active User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-green-100 transition-all"
                >
                  <div className="flex-1">
                    <div className="font-medium">{u.fullName}</div>
                    <div className="text-sm text-gray-500">
                      {u.role.replace("_", " ")}{u.department ? ` | ${u.department}` : ""}
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
              <ErrorOutlineIcon className="h-5 w-5 text-green-600" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-all">
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
              className="h-24 flex flex-col items-center justify-center gap-2 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all group"
              onClick={() => navigate("/dashboard/facilities")}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                <HomeIcon className="h-5 w-5" />
              </div>
              <span className="font-medium">Manage Health Centers</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all group"
              onClick={() => navigate("/dashboard/user-management")}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                <PersonAddIcon className="h-5 w-5" />
              </div>
              <span className="font-medium">Add User</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all group"
              onClick={() => navigate("/dashboard/analytics")}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                <AssignmentTurnedInIcon className="h-5 w-5" />
              </div>
              <span className="font-medium">View Reports</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all group"
              onClick={() => navigate("/dashboard/settings")}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <span className="font-medium">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

