import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import VisibilityIcon from "@mui/icons-material/Visibility";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { ExportDropdown } from '@/app/components/ui/ExportDropdown';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { 
  patientsApi, 
  screeningsApi, 
  clinicalAssessmentsApi,
  nutritionOrdersApi,
  PatientResponse, 
  ScreeningResponse,
  ClinicalAssessmentResponse,
  NutritionOrderResponse
} from '@/services/api';

export const PatientHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  
  // Dialog and Tab State
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('screenings');

  // Data Maps
  const [screeningsMap, setScreeningsMap] = useState<Record<number, ScreeningResponse[]>>({});
  const [assessmentsMap, setAssessmentsMap] = useState<Record<number, ClinicalAssessmentResponse[]>>({});
  const [ordersMap, setOrdersMap] = useState<Record<number, NutritionOrderResponse[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [loadingPatientData, setLoadingPatientData] = useState<Record<number, boolean>>({});

  useEffect(() => {
    patientsApi.getAll()
      .then(setPatients)
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  // Handle URL Parameters for auto-opening
  useEffect(() => {
    const patientParam = searchParams.get('patient');
    const tabParam = searchParams.get('tab');
    
    if (patientParam && !loading) {
      const pId = Number(patientParam);
      setOpenDialogId(pId);
      if (tabParam) {
        setActiveTab(tabParam);
      }
      loadPatientData(pId);
    }
  }, [searchParams, loading]);

  const loadPatientData = async (patientId: number) => {
    setLoadingPatientData(prev => ({ ...prev, [patientId]: true }));
    try {
      const [screenings, assessments, orders] = await Promise.all([
        screeningsApi.getByPatient(patientId).catch(() => []),
        clinicalAssessmentsApi.getByPatient(patientId).catch(() => []),
        nutritionOrdersApi.getByPatient(patientId).catch(() => [])
      ]);
      setScreeningsMap(prev => ({ ...prev, [patientId]: screenings }));
      setAssessmentsMap(prev => ({ ...prev, [patientId]: assessments }));
      setOrdersMap(prev => ({ ...prev, [patientId]: orders }));
    } catch {
      toast.error('Failed to load patient history');
    } finally {
      setLoadingPatientData(prev => ({ ...prev, [patientId]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAM': return 'destructive';
      case 'MAM': return 'default';
      case 'Normal': return 'secondary';
      default: return 'secondary';
    }
  };

  const filteredPatients = patients.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.currentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: patients.length,
    normal: patients.filter(p => p.currentStatus === 'Normal').length,
    mam: patients.filter(p => p.currentStatus === 'MAM').length,
    sam: patients.filter(p => p.currentStatus === 'SAM').length,
  };

  return (
    <div id="patient-history" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient History</h1>
          <p className="text-gray-600 mt-1">View patient screening history (Read-only)</p>
        </div>
        <ExportDropdown data={patients} filename="patients_history" />
      </div>

      <Alert>
        <InfoOutlinedIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Read-Only Access:</strong> You can view patient screening history but cannot modify past records.
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <PeopleIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Normal</p>
                <p className="text-3xl font-bold mt-1 ">{stats.normal}</p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <StarBorderIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MAM</p>
                <p className="text-3xl font-bold mt-1 ">{stats.mam}</p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <TrendingUpIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SAM</p>
                <p className="text-3xl font-bold mt-1 ">{stats.sam}</p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <ErrorOutlineIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by patient name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Normal">Normal</TabsTrigger>
                <TabsTrigger value="MAM">MAM</TabsTrigger>
                <TabsTrigger value="SAM">SAM</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-in fade-in duration-500">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                  
                  <Skeleton className="h-10 w-full lg:w-32 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <DescriptionIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No patients found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4 items-start">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-green-100 text-green-700 text-lg">
                        {patient.firstName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{patient.firstName} {patient.lastName}</h3>
                            <Badge variant={getStatusColor(patient.currentStatus) as any}>
                              {patient.currentStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {patient.patientCode} - {patient.age} - {patient.gender}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Facility</p>
                          <p className="font-medium">{patient.facilityName ?? 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Last Screening</p>
                          <p className="font-medium">{patient.lastScreeningDate ?? 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Screenings</p>
                          <p className="font-medium">{patient.totalScreenings}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Registered By</p>
                          <p className="font-medium">{patient.guardianFirstName} {patient.guardianLastName}</p>
                        </div>
                      </div>
                    </div>

                    <Dialog 
                      open={openDialogId === patient.id} 
                      onOpenChange={(open) => {
                        if (open) {
                          setOpenDialogId(patient.id);
                          loadPatientData(patient.id);
                        } else {
                          setOpenDialogId(null);
                          setSearchParams({});
                          setActiveTab('screenings');
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full lg:w-auto">
                          <VisibilityIcon className="h-4 w-4 mr-2" />
                          View History
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Screening History: {patient.firstName} {patient.lastName}</DialogTitle>
                          <DialogDescription>
                            {patient.patientCode} - {patient.age} - {patient.gender} (Read-only)
                          </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4">
                          {/* Patient Summary */}
                          <Card className="bg-blue-50 border-blue-200 mb-4">
                            <CardContent className="pt-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Patient ID</p>
                                  <p className="font-semibold">{patient.patientCode}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Age</p>
                                  <p className="font-semibold">{patient.age}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Gender</p>
                                  <p className="font-semibold">{patient.gender}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Current Status</p>
                                  <Badge variant={getStatusColor(patient.currentStatus) as any}>
                                    {patient.currentStatus}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Tabs for Screenings and Doctor Feedback */}
                          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                              <TabsTrigger value="screenings">Screening History</TabsTrigger>
                              <TabsTrigger value="feedback">Doctor Feedback</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="screenings" className="space-y-4">
                              <h4 className="font-semibold mb-3">Screening Records</h4>
                              {loadingPatientData[patient.id] ? (
                                <div className="flex justify-center py-8">
                                  <AutorenewIcon className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                              ) : (screeningsMap[patient.id] ?? []).length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No screening records found</p>
                              ) : (
                                <div className="space-y-3">
                                  {(screeningsMap[patient.id] ?? []).map((s) => (
                                    <Card key={s.id} className="border-l-4 border-l-blue-500">
                                      <CardContent className="pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <CalendarTodayIcon className="h-4 w-4 text-gray-500" />
                                          <span className="font-semibold">{s.screeningDate}</span>
                                          <Badge variant={getStatusColor(s.classification) as any}>
                                            {s.classification}
                                          </Badge>
                                          <span className="text-sm text-gray-500 ml-auto">{s.screeningCode}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                                          <div>
                                            <p className="text-xs text-gray-500">Weight</p>
                                            <p className="font-semibold">{s.weightKg} kg</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">Height</p>
                                            <p className="font-semibold">{s.heightCm} cm</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-gray-500">MUAC</p>
                                            <p className="font-semibold">{s.muacCm} cm</p>
                                          </div>
                                        </div>

                                        {s.recommendation && (
                                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                                            <p className="text-xs text-gray-500 mb-1">Recommendation</p>
                                            <p className="font-medium">{s.recommendation}</p>
                                          </div>
                                        )}

                                        <p className="text-xs text-gray-500 mt-2">By: {s.conductedByName}</p>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                              <Alert className="mt-4">
                                <InfoOutlinedIcon className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  These records are read-only. To add new records, use the Screening Form.
                                </AlertDescription>
                              </Alert>
                            </TabsContent>
                            
                            <TabsContent value="feedback" className="space-y-6">
                              {loadingPatientData[patient.id] ? (
                                <div className="flex justify-center py-8">
                                  <AutorenewIcon className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                              ) : (
                                <>
                                  {/* Clinical Assessments */}
                                  <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-black">
                                      Clinical Assessments
                                    </h4>
                                    {(assessmentsMap[patient.id] ?? []).length === 0 ? (
                                      <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded">No clinical assessments have been submitted for this patient yet.</p>
                                    ) : (
                                      <div className="space-y-3">
                                        {(assessmentsMap[patient.id] ?? []).map((assessment) => (
                                          <Card key={assessment.id} className="border-l-4 border-l-green-500 shadow-sm">
                                            <CardContent className="pt-4 pb-4">
                                              <div className="flex justify-between items-start mb-2">
                                                <div>
                                                  <Badge variant={assessment.severity.toLowerCase() === 'critical' ? 'destructive' : 'default'} className="mb-2">
                                                    {assessment.severity.toUpperCase()}
                                                  </Badge>
                                                  <h5 className="font-bold text-lg">{assessment.diagnosis}</h5>
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                  {new Date(assessment.createdAt).toLocaleDateString()}
                                                </span>
                                              </div>
                                              

                                              <div className="bg-gray-50 p-3 rounded text-sm mb-2">
                                                <span className="text-xs text-gray-500 block mb-1">Clinical Notes:</span>
                                                <p className="text-gray-800 whitespace-pre-wrap">{assessment.clinicalNotes}</p>
                                              </div>
                                              
                                              <p className="text-xs text-gray-500 mt-2 text-right">Assessed by: Dr. {assessment.assessedByName}</p>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Nutrition Orders */}
                                  <div>
                                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-black">
                                      Prescribed Nutrition Orders
                                    </h4>
                                    {(ordersMap[patient.id] ?? []).length === 0 ? (
                                      <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded">No nutrition orders have been prescribed yet.</p>
                                    ) : (
                                      <div className="space-y-3">
                                        {(ordersMap[patient.id] ?? []).map((order) => (
                                          <Card key={order.id} className="border-l-4 border-l-green-600 shadow-sm">
                                            <CardContent className="pt-4 pb-4">
                                              <div className="flex justify-between items-start mb-3">
                                                <div>
                                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mb-1">
                                                    {order.supplementType.toUpperCase()}
                                                  </Badge>
                                                  <h5 className="font-bold">{order.supplement}</h5>
                                                </div>
                                                <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded border">
                                                  {order.status}
                                                </span>
                                              </div>
                                              
                                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                                <div className="bg-gray-50 p-2 rounded">
                                                  <span className="text-xs text-gray-500 block">Dosage</span>
                                                  <span className="text-sm font-medium">{order.dosage || 'N/A'}</span>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded">
                                                  <span className="text-xs text-gray-500 block">Frequency</span>
                                                  <span className="text-sm font-medium">{order.frequency || 'N/A'}</span>
                                                </div>
                                                <div className="bg-gray-50 p-2 rounded">
                                                  <span className="text-xs text-gray-500 block">Duration</span>
                                                  <span className="text-sm font-medium">{order.duration || 'N/A'}</span>
                                                </div>
                                              </div>
                                              
                                              <div className="bg-green-50/50 p-3 rounded text-sm border border-green-100">
                                                <span className="text-xs text-green-800 font-semibold block mb-1">Instructions for Caregiver:</span>
                                                <p className="text-black">{order.instructions}</p>
                                              </div>
                                              
                                              <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                                                <span>From: {order.startDate} to {order.endDate}</span>
                                                <span>Prescribed by: Dr. {order.prescribedByName}</span>
                                              </div>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}


    </div>
  );
};



