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
import PeopleIcon from "@mui/icons-material/People";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
  const [totalSystemPatients, setTotalSystemPatients] = useState(0);
  const [totalSystemScreenings, setTotalSystemScreenings] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsData, screeningsData] = await Promise.all([
          patientsApi.getAll().catch(() => []),
          screeningsApi.getAll().catch(() => [])
        ]);
        
        // Filter data specific to this CHW
        const myScreenings = screeningsData.filter(s => s.conductedByName === user?.name);
        const myPatientIds = new Set(myScreenings.map(s => s.patientId));
        
        // Patients are assigned to the CHW if they are in the same facility or the CHW has screened them
        const myPatients = patientsData.filter(
          p => myPatientIds.has(p.id) || (user?.facilityName && p.facilityName === user?.facilityName)
        );

        setPatients(myPatients);
        setScreenings(myScreenings);
        
        setTotalSystemPatients(patientsData.length);
        setTotalSystemScreenings(screeningsData.length);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const samCount = patients.filter((p) => p.currentStatus === "SAM").length;
  const mamCount = patients.filter((p) => p.currentStatus === "MAM").length;

  const stats = [
    {
      label: "Assigned Patients",
      value: String(patients.length),
      icon: PeopleIcon,
      color: "bg-white text-green-600",
      change: `${Math.round((patients.length / (totalSystemPatients || 1)) * 100)}% of system total`,
      route: "/dashboard/patient-history"
    },
    {
      label: "My Screenings",
      value: String(screenings.length),
      icon: AssignmentTurnedInIcon,
      color: "bg-white text-green-600",
      change: `${screenings.filter(s => new Date(s.screeningDate).getMonth() === new Date().getMonth()).length} this month`,
      route: "/dashboard/patient-history"
    },
    {
      label: "At Risk (MAM)",
      value: String(mamCount),
      icon: StarBorderIcon,
      color: "bg-white text-green-600",
      change: `${patients.length > 0 ? Math.round((mamCount / patients.length) * 100) : 0}% of your patients`,
      route: "/dashboard/patient-history"
    },
    {
      label: "Critical (SAM)",
      value: String(samCount),
      icon: TrendingUpIcon,
      color: "bg-white text-green-600",
      change: `${patients.length > 0 ? Math.round((samCount / patients.length) * 100) : 0}% of your patients`,
      route: "/dashboard/patient-history"
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
          <AddIcon className="h-4 w-4 mr-2" />
          Register New Patient
        </Button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
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

      {/* Main Content */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Assigned Patients - Priority View */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <PeopleIcon className="h-5 w-5 text-green-600" />
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
                        <VisibilityIcon className="h-4 w-4 mr-1" />
                        History
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-xs"
                        onClick={() => navigate("/dashboard/new-screening")}
                      >
                        <AssignmentTurnedInIcon className="h-3 w-3 mr-1" />
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
                <AssignmentTurnedInIcon className="h-5 w-5 text-green-600" />
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
                className="h-auto flex-col gap-3 p-6 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all group"
                onClick={() => navigate("/dashboard/patient-registration")}
              >
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <PeopleIcon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Register Patient</div>
                  <div className="text-xs text-gray-500 mt-1 group-hover:text-green-600/70 transition-colors">
                    New enrollment
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-3 p-6 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all group"
                onClick={() => navigate("/dashboard/new-screening")}
              >
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <AssignmentTurnedInIcon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">New Screening</div>
                  <div className="text-xs text-gray-500 mt-1 group-hover:text-green-600/70 transition-colors">
                    Nutrition check
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto flex-col gap-3 p-6 border-gray-200 hover:border-green-300 hover:bg-green-50 hover:text-green-700 transition-all group"
                onClick={() => navigate("/dashboard/patient-history")}
              >
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-100 text-green-600 group-hover:scale-110 transition-transform">
                  <StarBorderIcon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Patient History</div>
                  <div className="text-xs text-gray-500 mt-1 group-hover:text-green-600/70 transition-colors">
                    Records & tracking
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  };
