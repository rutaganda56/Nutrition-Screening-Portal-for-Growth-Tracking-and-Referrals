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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import PeopleIcon from "@mui/icons-material/People";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
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
import { serviceRequestsApi, ServiceRequestResponse, screeningsApi, ScreeningResponse, referralsApi, ReferralResponse } from "@/services/api";
import { cn } from "@/app/components/ui/utils";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981", "#ef4444"];

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [serviceRequests, setServiceRequests] = useState<
    ServiceRequestResponse[]
  >([]);
  const [completedAssessments, setCompletedAssessments] = useState(0);
  const [referralData, setReferralData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requests, allScreenings, allReferrals] = await Promise.all([
          serviceRequestsApi.getAll().catch(() => []),
          screeningsApi.getAll().catch(() => []),
          referralsApi.getAll().catch(() => [])
        ]);
        
        setServiceRequests(requests);
        
        // Filter service requests assigned to this doctor
        if (user) {
          const userNameStr = user.name?.toLowerCase().trim();
          
          const myRequests = requests.filter(r => r.assignedToName?.toLowerCase().trim() === userNameStr);
          setServiceRequests(myRequests);
          
          const completedCases = myRequests.filter(r => 
            (r.status.toUpperCase() === 'COMPLETED' || r.status.toUpperCase() === 'RESOLVED') && 
            r.assignedToName?.toLowerCase().trim() === userNameStr
          ).length;
          setCompletedAssessments(completedCases);

          // Process incoming service requests by priority for the pie chart
          const priorityCounts = {
            URGENT: myRequests.filter(r => r.priority.toUpperCase() === 'URGENT' || r.priority.toUpperCase() === 'HIGH').length,
            ROUTINE: myRequests.filter(r => r.priority.toUpperCase() === 'ROUTINE' || r.priority.toUpperCase() === 'NORMAL').length,
            ASAP: myRequests.filter(r => r.priority.toUpperCase() === 'ASAP').length,
          };

          const pieData = [
            { name: "Urgent", value: priorityCounts.URGENT },
            { name: "Routine", value: priorityCounts.ROUTINE },
            { name: "ASAP", value: priorityCounts.ASAP },
          ].filter(item => item.value > 0);
          
          setReferralData(pieData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const pendingRequests = serviceRequests.filter(r => r.status === "PENDING");
  const urgentRequests = pendingRequests.filter(r => r.priority === "URGENT" || r.priority === "HIGH");

  const stats = [
    {
      label: "Pending Service Requests",
      value: String(pendingRequests.length),
      change: `${urgentRequests.length} critical/urgent cases`,
      icon: SendIcon,
      color: "bg-white text-green-600",
      urgent: urgentRequests.length > 0,
      route: "/dashboard/service-request-queue"
    },
    {
      label: "Completed Assessments",
      value: String(completedAssessments),
      change: "Resolved clinical cases",
      icon: AssignmentTurnedInIcon,
      color: "bg-white text-green-600",
      urgent: false,
      route: "/dashboard/service-request-queue"
    },
    {
      label: "Patients Under Care",
      value: String(new Set(serviceRequests.filter(r => r.assignedToName && r.assignedToName.toLowerCase().trim() === user?.name?.toLowerCase().trim()).map((r) => r.patientId)).size),
      change: "Unique cases assigned to you",
      icon: DescriptionIcon,
      color: "bg-white text-green-600",
      urgent: false,
      route: "/dashboard/service-request-queue"
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "urgent":
      case "asap":
        return "destructive";
      case "routine":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Clinical Review Dashboard 
        </h1>
        <p className="text-gray-600  mt-1">
          Welcome back, Dr. {user?.name}   
        </p>
        <p className="text-gray-600 text-l mt-2">
         Review patients requiring clinical
        decisions
        </p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={cn(
                "border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 bg-white group",
                stat.urgent ? "border-red-200 hover:border-red-300 hover:shadow-red-100/50" : ""
              )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Status Pie Chart */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Incoming Service Requests</CardTitle>
            <CardDescription>Breakdown of cases assigned to you by CHWs</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {referralData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center justify-around h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={referralData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {referralData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0 px-4">
                  {referralData.map((item, index) => (
                    <div key={item.name} className="flex flex-col">
                      <span className="text-xs text-gray-500">{item.name}</span>
                      <span className="text-lg font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-gray-400 gap-2">
                <DescriptionIcon className="h-8 w-8 opacity-50" />
                <span className="italic text-sm">No pending service requests</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Quick Clinical Actions</CardTitle>
            <CardDescription>Common tasks and workflows</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-28 flex flex-col items-center justify-center gap-2 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all group"
                onClick={() => navigate("/dashboard/service-request-queue")}
              >
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <DescriptionIcon className="h-5 w-5" />
                </div>
                <span className="font-medium text-wrap text-center">Review Service Requests</span>
              </Button>
              <Button
                variant="outline"
                className="h-28 flex flex-col items-center justify-center gap-2 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all group"
                onClick={() => navigate("/dashboard/reports")}
              >
                <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <AssignmentTurnedInIcon className="h-5 w-5" />
                </div>
                <span className="font-medium text-wrap text-center">View Clinical Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Service Requests Table */}
      <div className="grid grid-cols-1">
        <Card>
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <SendIcon className="h-5 w-5 text-green-600" />
                  Recent Service Requests
                </CardTitle>
                <CardDescription className="mt-1">
                  Latest cases requiring your clinical review
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                Top {Math.min(5, serviceRequests.length)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="w-[200px]">Patient</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceRequests.slice(0, 5).map((request) => (
                  <TableRow 
                    key={request.id} 
                    className={cn(
                      "cursor-pointer hover:bg-green-50/50 transition-colors",
                      (request.priority === "URGENT" || request.priority === "HIGH") ? "bg-red-50/10 hover:bg-red-50/30" : ""
                    )}
                    onClick={() => navigate(`/dashboard/patient-clinical-summary?patient=${request.patientId}&request=${request.id}`)}
                  >
                    <TableCell className="font-medium">{request.patientName}</TableCell>
                    <TableCell>{request.patientAge}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(request.priority)}>
                        {request.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{request.submittedByName}</TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(request.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-100">
                        Review →
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {serviceRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <AssignmentTurnedInIcon className="h-8 w-8 opacity-20" />
                        <p className="font-medium text-gray-700">No pending service requests</p>
                        <p className="text-xs">New CHW submissions will appear here for clinical review.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {serviceRequests.length > 5 && (
              <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/30">
                <Button 
                  variant="link" 
                  className="text-green-600 hover:text-green-800 font-medium"
                  onClick={() => navigate("/dashboard/service-request-queue")}
                >
                  View Full Queue ({serviceRequests.length} pending) →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

