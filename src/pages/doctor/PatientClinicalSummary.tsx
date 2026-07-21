import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  User,
  CheckCircle,
  FileText,
  Stethoscope,
  Pill,
  Send,
  Info,
  Utensils,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  patientsApi,
  screeningsApi,
  serviceRequestsApi,
  clinicalAssessmentsApi,
  nutritionOrdersApi,
  alertsApi,
  PatientResponse,
  ScreeningResponse,
  ServiceRequestResponse,
} from "@/services/api";
import { ExportDropdown } from "@/app/components/ui/ExportDropdown";
import { useAuth } from "@/contexts/AuthContext";

export const PatientClinicalSummary = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "clinical");

  // Get patient and service request from URL params
  const patientId = searchParams.get("patient");
  const serviceRequestId = searchParams.get("request");

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [serviceRequest, setServiceRequest] =
    useState<ServiceRequestResponse | null>(null);
  const [latestScreening, setLatestScreening] =
    useState<ScreeningResponse | null>(null);
  const [screeningHistory, setScreeningHistory] = useState<ScreeningResponse[]>(
    [],
  );
  const [growthData, setGrowthData] = useState<
    { date: string; weight: number; height: number }[]
  >([]);

  // Clinical decision forms
  const [clinicalDecision, setClinicalDecision] = useState({
    confirmed: false,
    diagnosis: "",
    severity: ""
  });

  const [nutritionOrder, setNutritionOrder] = useState({
    supplementType: "",
    supplement: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  useEffect(() => {
    if (!serviceRequestId) {
      toast.error(
        "Access denied: Patients can only be accessed through service requests",
      );
      navigate("/dashboard/service-request-queue");
      return;
    }

    setLoading(true);
    Promise.all([
      patientsApi.getById(Number(patientId)),
      serviceRequestsApi.getById(Number(serviceRequestId)),
      screeningsApi.getByPatient(Number(patientId)),
    ])
      .then(([patientData, requestData, screeningsData]) => {
        setPatient(patientData);
        setServiceRequest(requestData);

        // Sort screenings by date descending to find the latest
        const sortedScreenings = [...screeningsData].sort(
          (a, b) =>
            new Date(b.screeningDate).getTime() -
            new Date(a.screeningDate).getTime(),
        );

        if (sortedScreenings.length > 0) {
          setLatestScreening(sortedScreenings[0]);
          setScreeningHistory(sortedScreenings.slice(1));
        }

        // Map growth data for the chart: weight vs date
        const growth = [...screeningsData]
          .sort(
            (a, b) =>
              new Date(a.screeningDate).getTime() -
              new Date(b.screeningDate).getTime(),
          )
          .map((s) => ({
            date: new Date(s.screeningDate).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            }),
            weight: s.weightKg,
            height: s.heightCm,
          }));
        setGrowthData(growth);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load patient clinical data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [patientId, serviceRequestId, navigate]);

  const patientExportData = patient
    ? [
        {
          PatientID: patient.patientCode,
          Name: `${patient.firstName} ${patient.lastName}`,
          Age: patient.age,
          Gender: patient.gender,
          Status: patient.currentStatus,
          ServiceRequestPriority: serviceRequest?.priority,
        },
      ]
    : [];

  const handleConfirmDiagnosis = () => {
    if (
      !clinicalDecision.diagnosis ||
      !clinicalDecision.severity
    ) {
      toast.error(
        "Please complete the diagnosis, severity assessment",
      );
      return;
    }

    clinicalAssessmentsApi
      .create(
        {
          serviceRequestId: Number(serviceRequestId),
          patientId: Number(patientId),
          diagnosis: clinicalDecision.diagnosis,
          severity: clinicalDecision.severity
        },
        Number(user?.id),
      )
      .then(() => {
        // Mark service request as COMPLETED in the database
        return serviceRequestsApi.updateStatus(
          Number(serviceRequestId),
          "COMPLETED",
        );
      })
      .then(() => {
        setClinicalDecision({ ...clinicalDecision, confirmed: true });
        toast.success(
          "Clinical diagnosis confirmed! Please proceed to create a Nutrition Order.",
        );
      })
      .catch((err) => {
        console.error(err);
        const errorMsg = err.message || "Unknown error";
        toast.error(`Failed to save clinical diagnosis: ${errorMsg}`);

        alertsApi
          .create({
            patientId: Number(patientId),
            assignedToId: Number(user?.id),
            alertType: "WARNING",
            message: `Failed to submit clinical assessment: ${errorMsg}`,
          })
          .catch(console.error);
      });
  };

  const handleCreateNutritionOrder = () => {
    if (
      !nutritionOrder.supplementType ||
      !nutritionOrder.supplement ||
      !nutritionOrder.instructions.trim()
    ) {
      toast.error(
        "Please complete the nutrition order details and instructions",
      );
      return;
    }

    const startDate = new Date().toISOString().split("T")[0];
    let days = 14;
    if (nutritionOrder.duration === "2-weeks") days = 14;
    else if (nutritionOrder.duration === "4-weeks") days = 28;
    else if (nutritionOrder.duration === "8-weeks") days = 56;

    const endDateObj = new Date();
    endDateObj.setDate(endDateObj.getDate() + days);
    const endDate = endDateObj.toISOString().split("T")[0];

    nutritionOrdersApi
      .create(
        {
          patientId: Number(patientId),
          screeningId: latestScreening?.id || null,
          serviceRequestId: Number(serviceRequestId),
          supplementType: nutritionOrder.supplementType.toUpperCase(),
          supplement: nutritionOrder.supplement,
          dosage: nutritionOrder.dosage || "1 sachet",
          frequency: nutritionOrder.frequency || "once-daily",
          duration: nutritionOrder.duration || "2-weeks",
          instructions: nutritionOrder.instructions,
          startDate,
          endDate,
        },
        Number(user?.id),
      )
      .then(() => {
        toast.success(`Nutrition order created successfully!`);
        navigate("/dashboard/service-request-queue");
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Failed to save nutrition order: ${err.message}`);
      });
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
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

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-1/3 rounded-md" />
            <Skeleton className="h-10 w-1/3 rounded-md" />
            <Skeleton className="h-10 w-1/3 rounded-md" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!patient || !serviceRequest) {
    return (
      <div className="p-6 text-center text-red-500">
        Patient or service request not found.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" id="clinical-summary-document">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 no-print">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/service-request-queue")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Service Requests
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Patient Clinical Summary
          </h1>
          <p className="text-gray-600 mt-1">
            Review screening data and make clinical decisions
          </p>
        </div>
        <ExportDropdown
          data={patientExportData}
          filename={`Clinical_Summary_${patient.firstName}_${patient.lastName}`}
          pdfElementId="clinical-summary-document"
          variant="outline"
          buttonClassName="flex items-center gap-2 bg-green-500 border-green-200  text-white"
        />
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {patient.firstName} {patient.lastName}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>{patient.patientCode}</span>
                  <span>•</span>
                  <span>
                    {patient.age} ({patient.gender})
                  </span>
                  <span>•</span>
                  <span>DOB: {patient.birthDate || "N/A"}</span>
                </div>
              </div>
            </div>
            <Badge variant="default" className="text-sm">
              Active Patient
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Guardian</p>
              <p className="font-medium">
                {patient.guardianFirstName} {patient.guardianLastName}
              </p>
              <p className="text-sm text-gray-600">{patient.guardianPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Facility ID</p>
              <p className="font-medium">FAC-{patient.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Health Center</p>
              <p className="font-medium">{patient.facilityName || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clinical">Clinical Assessment</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition Orders</TabsTrigger>
          <TabsTrigger value="history">Screening History</TabsTrigger>
        </TabsList>

        {/* Clinical Assessment Tab */}
        <TabsContent value="clinical" className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Clinical Decision Tools:</strong> Use these forms to
              confirm diagnosis and create nutrition orders. Your clinical
              assessment will be stored separately from CHW-collected data.
            </AlertDescription>
          </Alert>

          {/* Diagnosis Confirmation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-green-600" />
                Confirm Clinical Diagnosis
              </CardTitle>
              <CardDescription>
                Review CHW screening data and provide clinical confirmation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 border rounded">
                <p className="text-sm text-gray-900">
                  <strong>CHW Assessment:</strong>{" "}
                  {latestScreening
                    ? latestScreening.classification
                    : "No Screening"}{" "}
                  - MUAC:{" "}
                  {latestScreening ? `${latestScreening.muacCm} cm` : "N/A"},
                  Weight:{" "}
                  {latestScreening ? `${latestScreening.weightKg} kg` : "N/A"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Clinical Diagnosis *</Label>
                  <Select
                    value={clinicalDecision.diagnosis}
                    onValueChange={(v) =>
                      setClinicalDecision({ ...clinicalDecision, diagnosis: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnosis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sam-confirmed">
                        SAM is Confirmed
                      </SelectItem>
                      <SelectItem value="mam-confirmed">
                        MAM is Confirmed
                      </SelectItem>
                      <SelectItem value="normal-confirmed">
                        Normal is Confirmed
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">Severity Assessment *</Label>
                  <Select
                    value={clinicalDecision.severity}
                    onValueChange={(v) =>
                      setClinicalDecision({ ...clinicalDecision, severity: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">
                        Immediate hospitalization
                      </SelectItem>
                      <SelectItem value="moderate">
                        {" "}
                        Outpatient treatment
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleConfirmDiagnosis}
                className="w-full bg-green-600 hover:bg-green-700 no-print"
                disabled={clinicalDecision.confirmed}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {clinicalDecision.confirmed
                  ? "Diagnosis Confirmed"
                  : "Confirm Clinical Diagnosis"}
              </Button>
            </CardContent>
          </Card>

          {/* Nutrition Order - ONLY shown after diagnosis is confirmed */}
          {clinicalDecision.confirmed && (
            <>
              {/* Nutrition Order */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-blue-600" />
                    Create Nutrition Order
                  </CardTitle>
                  <CardDescription>
                    Prescribe therapeutic or supplementary feeding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplementType">Order Type *</Label>
                      <Select
                        value={nutritionOrder.supplementType}
                        onValueChange={(v) =>
                          setNutritionOrder({
                            ...nutritionOrder,
                            supplementType: v,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select order type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rutf">
                            Ready-to-Use Therapeutic Food (RUTF)
                          </SelectItem>
                          <SelectItem value="supplementary">
                            Supplementary Feeding
                          </SelectItem>
                          <SelectItem value="micronutrient">
                            Micronutrient Supplementation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="supplement">Supplement/Product *</Label>
                      <Select
                        value={nutritionOrder.supplement}
                        onValueChange={(v) =>
                          setNutritionOrder({
                            ...nutritionOrder,
                            supplement: v,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="plumpy-nut">
                            Plumpy'Nut (RUTF)
                          </SelectItem>
                          <SelectItem value="f-75">F-75 Formula</SelectItem>
                          <SelectItem value="f-100">F-100 Formula</SelectItem>
                          <SelectItem value="csb">
                            Corn-Soy Blend (CSB+)
                          </SelectItem>
                          <SelectItem value="vitamin-a">
                            Vitamin A Supplementation
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        placeholder="e.g., 92g (1 sachet)"
                        value={nutritionOrder.dosage}
                        onChange={(e) =>
                          setNutritionOrder({
                            ...nutritionOrder,
                            dosage: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={nutritionOrder.frequency}
                        onValueChange={(v) =>
                          setNutritionOrder({ ...nutritionOrder, frequency: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once-daily">Once daily</SelectItem>
                          <SelectItem value="twice-daily">
                            Twice daily
                          </SelectItem>
                          <SelectItem value="three-times-daily">
                            Three times daily
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select
                        value={nutritionOrder.duration}
                        onValueChange={(v) =>
                          setNutritionOrder({ ...nutritionOrder, duration: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-week">1 week</SelectItem>
                          <SelectItem value="2-weeks">2 weeks</SelectItem>
                          <SelectItem value="4-weeks">4 weeks</SelectItem>
                          <SelectItem value="8-weeks">8 weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions & Notes *</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Provide detailed instructions for caregivers, monitoring requirements, and follow-up schedule..."
                      value={nutritionOrder.instructions}
                      onChange={(e) =>
                        setNutritionOrder({
                          ...nutritionOrder,
                          instructions: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleCreateNutritionOrder}
                    className="w-full bg-green-600 hover:bg-green-700 no-print"
                  >
                    <Pill className="h-4 w-4 mr-2" />
                    Create Nutrition Order
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Nutrition Orders Tab */}
        <TabsContent value="nutrition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Nutrition intervention plan for this patient
              </CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              {latestScreening ? (
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-lg">
                      Initial Screening Status
                    </p>
                    <Badge variant="default">
                      {latestScreening.classification}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    MUAC Measurement:{" "}
                    <span className="font-semibold">
                      {latestScreening.muacCm} cm
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Observation Notes:{" "}
                    {latestScreening.observationNotes || "None"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Conducted on: {latestScreening.screeningDate}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No screenings recorded for this patient.
                </p>
              )}
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Review and update this nutrition order using the Clinical
                  Assessment tab.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screening History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Screening History</CardTitle>
              <CardDescription>
                Previous growth screening records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {growthData.length > 0 && (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis
                        label={{
                          value: "Weight (kg)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#3b82f6"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                {screeningHistory.length > 0 ? (
                  screeningHistory.map((screening) => (
                    <div
                      key={screening.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <p className="font-medium">
                          Screening Code: {screening.screeningCode}
                        </p>
                        <Badge
                          variant={getClassificationColor(
                            screening.classification,
                          )}
                        >
                          {screening.classification}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Date: {screening.screeningDate} • Weight:{" "}
                        {screening.weightKg} kg • Height: {screening.heightCm}{" "}
                        cm • MUAC: {screening.muacCm} cm
                      </p>
                      {screening.observationNotes && (
                        <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          Notes: {screening.observationNotes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No previous screenings found in history.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
