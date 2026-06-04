import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  Users,
  ClipboardCheck,
  Activity,
  TrendingUp,
  Plus,
  Eye,
} from "lucide-react";
import {
  patientsApi,
  screeningsApi,
  PatientResponse,
  ScreeningResponse,
} from "@/services/api";

export const CHWDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);

  useEffect(() => {
    patientsApi.getAll().then(setPatients).catch(console.error);
    screeningsApi.getAll().then(setScreenings).catch(console.error);
  }, []);

  const samCount = patients.filter((p) => p.currentStatus === "SAM").length;
  const mamCount = patients.filter((p) => p.currentStatus === "MAM").length;

  const stats = [
    {
      label: "Assigned Patients",
      value: String(patients.length),
      icon: Users,
      color: "bg-white text-green-600",
      change: "Total registered",
    },
    {
      label: "Recent Screenings",
      value: String(screenings.length),
      icon: ClipboardCheck,
      color: "bg-white text-green-600",
      change: "All time",
    },
    {
      label: "At Risk (MAM)",
      value: String(mamCount),
      icon: Activity,
      color: "bg-white text-green-600",
      change: "Needs follow-up",
    },
    {
      label: "Critical (SAM)",
      value: String(samCount),
      icon: TrendingUp,
      color: "bg-white text-green-600",
      change: "Urgent attention",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SAM":
        return "destructive";
      case "MAM":
        return "default";
      case "Normal":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600 mt-1">Community Health Worker</p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 shadow-sm"
          onClick={() => navigate("/dashboard/patient-registration")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Register New Patient
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Stats Cards */}
        <div className="flex flex-col gap-3">
          {stats.map((stat, index) => {
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

        {/* Right Column: Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Assigned Patients - Priority View */}
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  Assigned Patients
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 h-8"
                  onClick={() => navigate("/dashboard/patient-history")}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patients.slice(0, 4).map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {patient.patientCode} | {patient.age} | {patient.gender}
                          </div>
                        </div>
                        <Badge variant={getStatusColor(patient.currentStatus)}>
                          {patient.currentStatus}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-8 text-xs"
                          onClick={() => navigate("/dashboard/patient-history")}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          History
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-xs"
                          onClick={() => navigate("/dashboard/new-screening")}
                        >
                          <ClipboardCheck className="h-3 w-3 mr-1" />
                          Screen
                        </Button>
                      </div>
                    </div>
                  ))}
                  {patients.length === 0 && (
                    <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center">
                      <p className="text-sm font-medium text-gray-700">
                        No patients registered yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Screenings */}
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardCheck className="h-5 w-5 text-green-600" />
                  Recent Screenings
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-600 h-8"
                  onClick={() => navigate("/dashboard/new-screening")}
                >
                  New
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {screenings.slice(0, 4).map((screening) => (
                    <div key={screening.id} className="p-3 bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium text-gray-900">{screening.patientName}</div>
                        <Badge variant={getStatusColor(screening.classification)} className="scale-90 origin-right">
                          {screening.classification}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{screening.screeningCode} | {screening.screeningDate}</span>
                        <span className="font-medium text-gray-700">MUAC: {screening.muacCm}cm</span>
                      </div>
                    </div>
                  ))}
                  {screenings.length === 0 && (
                    <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center">
                      <p className="text-sm font-medium text-gray-700">
                        No screenings recorded yet
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Primary Field Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-6 hover:bg-green-50/30 transition-all"
                  onClick={() => navigate("/dashboard/patient-registration")}
                >
                  <div className="h-10 w-10 rounded-md flex items-center justify-center bg-green-50 text-green-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">Register Patient</div>
                    <div className="text-xs text-gray-500 mt-1">
                      New enrollment
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-6 hover:bg-green-50/30 transition-all"
                  onClick={() => navigate("/dashboard/new-screening")}
                >
                  <div className="h-10 w-10 rounded-md flex items-center justify-center bg-green-50 text-green-600">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">New Screening</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Nutrition check
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-6 hover:bg-green-50/30 transition-all"
                  onClick={() => navigate("/dashboard/patient-history")}
                >
                  <div className="h-10 w-10 rounded-md flex items-center justify-center bg-green-50 text-green-600">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">Patient History</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Records & tracking
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
  };
