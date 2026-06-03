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
          className="bg-green-600 hover:bg-green-700"
          onClick={() => navigate("/dashboard/patient-registration")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Register New Patient
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Patients - Priority View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Assigned Patients
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/patient-history")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patients.slice(0, 5).map((patient) => (
                <div
                  key={patient.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">
                        {patient.firstName} {patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {patient.patientCode} â€¢ {patient.age} â€¢ {patient.gender}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(patient.currentStatus)}>
                      {patient.currentStatus}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                    <div>
                      <p className="text-gray-500">Last Screened</p>
                      <p className="font-medium">
                        {patient.lastScreeningDate ?? "Never"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Screenings</p>
                      <p className="font-medium">{patient.totalScreenings}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate("/dashboard/patient-history")}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View History
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
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
                  <p className="mt-1 text-sm text-gray-500">
                    Use Register New Patient to start building your patient list.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Screenings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Recent Screenings
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard/new-screening")}
            >
              New Screening
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {screenings.slice(0, 5).map((screening) => (
                <div key={screening.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{screening.patientName}</div>
                      <div className="text-sm text-gray-500">
                        {screening.screeningCode} â€¢ {screening.screeningDate}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(screening.classification)}>
                      {screening.classification}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <div className="text-gray-600">
                      <span className="font-medium">MUAC:</span>{" "}
                      {screening.muacCm} cm
                    </div>
                    <div className="text-gray-600">
                      {screening.recommendation}
                    </div>
                  </div>
                </div>
              ))}
              {screenings.length === 0 && (
                <div className="rounded-lg border border-dashed bg-gray-50 p-6 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    No screenings recorded yet
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Start a new screening after registering or selecting a patient.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6"
              onClick={() => navigate("/dashboard/patient-registration")}
            >
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-white text-green-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="font-semibold">Register Patient</div>
                <div className="text-xs text-gray-500 mt-1">
                  Add new patient to system
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6"
              onClick={() => navigate("/dashboard/new-screening")}
            >
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-white text-green-600">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="font-semibold">New Screening</div>
                <div className="text-xs text-gray-500 mt-1">
                  Conduct nutrition assessment
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-6"
              onClick={() => navigate("/dashboard/patient-history")}
            >
              <div className="h-10 w-10 rounded-md flex items-center justify-center bg-white text-green-600">
                <Activity className="h-6 w-6" />
              </div>
              <div className="text-center">
                <div className="font-semibold">Patient History</div>
                <div className="text-xs text-gray-500 mt-1">
                  View past screenings
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

