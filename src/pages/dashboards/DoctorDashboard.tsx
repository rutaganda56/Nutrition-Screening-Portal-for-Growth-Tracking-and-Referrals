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
  Users,
  AlertTriangle,
  Send,
  Clock,
  FileText,
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
  const [totalScreenings, setTotalScreenings] = useState(0);
  const [referralData, setReferralData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requests, allScreenings, allReferrals] = await Promise.all([
          serviceRequestsApi.getByStatus("PENDING"),
          screeningsApi.getAll(),
          referralsApi.getAll()
        ]);
        
        setServiceRequests(requests);
        
        // Filter screenings conducted by this doctor
        if (user) {
          const doctorScreenings = allScreenings.filter(
            s => s.conductedByName === user.name
          ).length;
          setTotalScreenings(doctorScreenings);

          // Process referrals
          const doctorReferrals = allReferrals.filter(r => r.referredByName === user.name);
          const statusCounts = {
            PENDING: doctorReferrals.filter(r => r.status.toUpperCase() === 'PENDING').length,
            ACCEPTED: doctorReferrals.filter(r => r.status.toUpperCase() === 'ACCEPTED').length,
            RESOLVED: doctorReferrals.filter(r => r.status.toUpperCase() === 'RESOLVED' || r.status.toUpperCase() === 'COMPLETED').length,
            REJECTED: doctorReferrals.filter(r => r.status.toUpperCase() === 'REJECTED').length,
          };

          const pieData = [
            { name: "Pending", value: statusCounts.PENDING },
            { name: "Accepted", value: statusCounts.ACCEPTED },
            { name: "Resolved", value: statusCounts.RESOLVED },
            { name: "Rejected", value: statusCounts.REJECTED },
          ].filter(item => item.value > 0);
          
          setReferralData(pieData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [user]);

  const stats = [
    {
      label: "Pending Service Requests",
      value: String(serviceRequests.length),
      change: "Awaiting review",
      icon: Send,
      color: "bg-white text-green-600",
      urgent: true,
    },
    {
      label: "My Total Screenings",
      value: String(totalScreenings),
      change: "Conducted by me",
      icon: ClipboardCheck,
      color: "bg-white text-green-600",
      urgent: false,
    },
    {
      label: "Total Patients",
      value: String(new Set(serviceRequests.map((r) => r.patientId)).size),
      change: "Under care",
      icon: Users,
      color: "bg-white text-green-600",
      urgent: false,
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
        <p className="text-gray-600 mt-1">
          Welcome back, Dr. {user?.name} - Review patients requiring clinical
          decisions
        </p>
      </div>

      {/* Top Section: Stats and Referral Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Stats Cards */}
        <div className="flex flex-col gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className={cn(
                  "shadow-sm",
                  stat.urgent ? "border-red-200 bg-red-50/30" : ""
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold mt-1 text-gray-900">{stat.value}</p>
                      <p className={cn(
                        "text-[10px] font-medium mt-1 flex items-center gap-1",
                        stat.urgent ? "text-red-600" : "text-green-600"
                      )}>
                        {stat.urgent && <AlertTriangle className="h-2 w-2" />}
                        {stat.change}
                      </p>
                    </div>
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                      stat.urgent ? "bg-red-100 text-red-600" : "bg-green-50 text-green-600"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Column: Referral Status Pie Chart */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Specialized Referrals Status</CardTitle>
              <CardDescription>Breakdown of patient referrals assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              {referralData.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center justify-around h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={referralData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
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
                <div className="h-[220px] flex items-center justify-center text-gray-500 italic text-sm">
                  No referrals issued yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Service Requests Table */}
      <div className="grid grid-cols-1">
        <Card className="border-2 border-red-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-red-600" />
                  Service Requests Requiring Review
                </CardTitle>
                <CardDescription className="mt-1">
                  Clinical decisions needed for CHW submitted cases
                </CardDescription>
              </div>
              <Badge variant="destructive" className="text-sm">
                {serviceRequests.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Submitted By</th>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.map((request) => (
                    <tr 
                      key={request.id} 
                      className={cn(
                        "border-b hover:bg-gray-50 transition-colors cursor-pointer",
                        (request.priority === "URGENT" || request.priority === "urgent") ? "bg-red-50/20" : ""
                      )}
                      onClick={() => navigate(`/dashboard/patient-clinical-summary?patient=${request.patientId}&request=${request.id}`)}
                    >
                      <td className="px-4 py-4 font-medium text-gray-900">{request.patientName}</td>
                      <td className="px-4 py-4">{request.patientAge}</td>
                      <td className="px-4 py-4">
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 truncate max-w-[150px]">{request.reasonCode}</td>
                      <td className="px-4 py-4">{request.submittedByName}</td>
                      <td className="px-4 py-4 text-xs text-gray-500">
                        {new Date(request.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 px-3">
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {serviceRequests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <ClipboardCheck className="h-8 w-8 opacity-20" />
                          <p className="font-medium text-gray-700">No pending service requests</p>
                          <p className="text-xs">New CHW submissions will appear here for clinical review.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/dashboard/service-request-queue")}
            >
              <FileText className="h-5 w-5 text-green-600" />
              <span>Review Service Requests</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/dashboard/patient-clinical-summary")}
            >
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Patient Clinical Summary</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

