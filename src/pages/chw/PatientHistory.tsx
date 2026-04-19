import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { 
  Search, 
  FileText, 
  Users, 
  Activity, 
  Calendar,
  Eye,
  Filter,
  TrendingUp,
  AlertCircle,
  Info,
  Download
} from 'lucide-react';
import { downloadCSV, downloadJSON } from '@/utils/exportUtils';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  age: string;
  gender: 'Male' | 'Female';
  currentStatus: 'Normal' | 'MAM' | 'SAM';
  lastScreening: string;
  totalScreenings: number;
  healthCenter: string;
}

interface Screening {
  id: string;
  date: string;
  muac: string;
  weight: string;
  height: string;
  edema: boolean;
  classification: 'Normal' | 'MAM' | 'SAM';
  recommendation: string;
  conductedBy: string;
}

interface Visit {
  id: string;
  date: string;
  type: 'Screening' | 'Follow-up' | 'Clinical Assessment' | 'Emergency Visit';
  conductedBy: string;
  location: string;
  notes: string;
}

interface Diagnosis {
  id: string;
  date: string;
  condition: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  diagnosedBy: string;
  status: 'Active' | 'Resolved' | 'Monitoring';
}

interface Treatment {
  id: string;
  date: string;
  type: string;
  description: string;
  prescribedBy: string;
  duration: string;
  status: 'Active' | 'Completed' | 'Discontinued';
}

export const PatientHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Simulated assigned health center
  const assignedHealthCenter = 'Polyclinique du Bon Berger';

  // Mock patients data - filtered by assigned health center
  const patients: Patient[] = [
    {
      id: 'P-1024',
      name: 'Uwimana Marie',
      age: '2y 4m',
      gender: 'Female',
      currentStatus: 'SAM',
      lastScreening: '2026-02-04',
      totalScreenings: 8,
      healthCenter: assignedHealthCenter
    },
    {
      id: 'P-1156',
      name: 'Nshuti Diane',
      age: '3y 2m',
      gender: 'Female',
      currentStatus: 'MAM',
      lastScreening: '2026-02-03',
      totalScreenings: 12,
      healthCenter: assignedHealthCenter
    },
    {
      id: 'P-1025',
      name: 'Imena Grace',
      age: '4y 2m',
      gender: 'Female',
      currentStatus: 'Normal',
      lastScreening: '2026-01-30',
      totalScreenings: 15,
      healthCenter: assignedHealthCenter
    },
    {
      id: 'P-1178',
      name: 'Ishimwe Claude',
      age: '1y 8m',
      gender: 'Male',
      currentStatus: 'MAM',
      lastScreening: '2026-02-02',
      totalScreenings: 6,
      healthCenter: assignedHealthCenter
    },
    {
      id: 'P-1203',
      name: 'Irakoze Patrick',
      age: '3y 1m',
      gender: 'Male',
      currentStatus: 'Normal',
      lastScreening: '2026-02-01',
      totalScreenings: 10,
      healthCenter: assignedHealthCenter
    }
  ];

  // Mock screening history for a patient
  const getPatientScreenings = (patientId: string): Screening[] => {
    const screenings: { [key: string]: Screening[] } = {
      'P-1024': [
        {
          id: 'S-445',
          date: '2026-02-04',
          muac: '10.8 cm',
          weight: '9.5 kg',
          height: '82 cm',
          edema: false,
          classification: 'SAM',
          recommendation: 'Urgent referral to Therapeutic Feeding Center required',
          conductedBy: 'CHW Mukamana Josiane'
        },
        {
          id: 'S-398',
          date: '2026-01-04',
          muac: '11.2 cm',
          weight: '9.2 kg',
          height: '81 cm',
          edema: false,
          classification: 'SAM',
          recommendation: 'Continue therapeutic feeding program',
          conductedBy: 'CHW Mukamana Josiane'
        },
        {
          id: 'S-352',
          date: '2025-12-04',
          muac: '11.8 cm',
          weight: '9.0 kg',
          height: '80 cm',
          edema: false,
          classification: 'MAM',
          recommendation: 'Enrolled in Supplementary Feeding Program',
          conductedBy: 'CHW Mutoni Beatrice'
        }
      ],
      'P-1156': [
        {
          id: 'S-444',
          date: '2026-02-03',
          muac: '12.0 cm',
          weight: '11.8 kg',
          height: '90 cm',
          edema: false,
          classification: 'MAM',
          recommendation: 'Enrolled in Supplementary Feeding Program',
          conductedBy: 'CHW Mukamana Josiane'
        },
        {
          id: 'S-396',
          date: '2026-01-03',
          muac: '12.2 cm',
          weight: '11.5 kg',
          height: '89 cm',
          edema: false,
          classification: 'MAM',
          recommendation: 'Continue supplementary feeding',
          conductedBy: 'CHW Mukamana Josiane'
        }
      ]
    };
    
    return screenings[patientId] || [];
  };

  // Mock visit history
  const getPatientVisits = (patientId: string): Visit[] => {
    const visits: { [key: string]: Visit[] } = {
      'P-1024': [
        {
          id: 'V-5012',
          date: '2026-02-04',
          type: 'Screening',
          conductedBy: 'CHW Mukamana Josiane',
          location: 'Community Outreach',
          notes: 'Community nutrition screening - SAM detected, immediate referral required'
        },
        {
          id: 'V-4834',
          date: '2026-01-15',
          type: 'Follow-up',
          conductedBy: 'CHW Mukamana Josiane',
          location: 'Home Visit',
          notes: 'Follow-up on therapeutic feeding program, weight gain slow'
        },
        {
          id: 'V-4512',
          date: '2025-12-20',
          type: 'Clinical Assessment',
          conductedBy: 'Dr. Mugabo Emmanuel',
          location: 'Health Center',
          notes: 'Clinical assessment for MAM, supplementary feeding prescribed'
        }
      ],
      'P-1156': [
        {
          id: 'V-5011',
          date: '2026-02-03',
          type: 'Screening',
          conductedBy: 'CHW Mukamana Josiane',
          location: 'Community Outreach',
          notes: 'Routine screening - MAM status maintained'
        },
        {
          id: 'V-4901',
          date: '2026-01-10',
          type: 'Follow-up',
          conductedBy: 'CHW Mukamana Josiane',
          location: 'Home Visit',
          notes: 'Follow-up visit, guardian compliance good'
        }
      ]
    };
    
    return visits[patientId] || [];
  };

  // Mock diagnosis history
  const getPatientDiagnoses = (patientId: string): Diagnosis[] => {
    const diagnoses: { [key: string]: Diagnosis[] } = {
      'P-1024': [
        {
          id: 'D-301',
          date: '2026-02-04',
          condition: 'Severe Acute Malnutrition (SAM)',
          severity: 'Severe',
          diagnosedBy: 'CHW Mukamana Josiane',
          status: 'Active'
        },
        {
          id: 'D-289',
          date: '2025-12-20',
          condition: 'Moderate Acute Malnutrition (MAM)',
          severity: 'Moderate',
          diagnosedBy: 'Dr. Mugabo Emmanuel',
          status: 'Resolved'
        },
        {
          id: 'D-267',
          date: '2025-10-15',
          condition: 'Micronutrient Deficiency',
          severity: 'Mild',
          diagnosedBy: 'CHW Mutoni Beatrice',
          status: 'Monitoring'
        }
      ],
      'P-1156': [
        {
          id: 'D-298',
          date: '2026-01-05',
          condition: 'Moderate Acute Malnutrition (MAM)',
          severity: 'Moderate',
          diagnosedBy: 'CHW Mukamana Josiane',
          status: 'Active'
        }
      ]
    };
    
    return diagnoses[patientId] || [];
  };

  // Mock treatment history
  const getPatientTreatments = (patientId: string): Treatment[] => {
    const treatments: { [key: string]: Treatment[] } = {
      'P-1024': [
        {
          id: 'T-401',
          date: '2026-02-04',
          type: 'Therapeutic Feeding',
          description: 'RUTF (Ready-to-Use Therapeutic Food) - 3 sachets/day',
          prescribedBy: 'CHW Mukamana Josiane',
          duration: '8 weeks',
          status: 'Active'
        },
        {
          id: 'T-387',
          date: '2025-12-20',
          type: 'Supplementary Feeding',
          description: 'CSB+ (Corn Soy Blend Plus) - Daily supplementation',
          prescribedBy: 'Dr. Mugabo Emmanuel',
          duration: '12 weeks',
          status: 'Completed'
        },
        {
          id: 'T-354',
          date: '2025-10-15',
          type: 'Micronutrient Supplementation',
          description: 'Vitamin A and Iron supplementation',
          prescribedBy: 'CHW Mutoni Beatrice',
          duration: '4 weeks',
          status: 'Completed'
        }
      ],
      'P-1156': [
        {
          id: 'T-395',
          date: '2026-01-05',
          type: 'Supplementary Feeding',
          description: 'RUSF (Ready-to-Use Supplementary Food) - 2 sachets/day',
          prescribedBy: 'CHW Mukamana Josiane',
          duration: '8 weeks',
          status: 'Active'
        }
      ]
    };
    
    return treatments[patientId] || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAM': return 'destructive';
      case 'MAM': return 'default';
      case 'Normal': return 'secondary';
      default: return 'secondary';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.currentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalPatients: patients.length,
    normal: patients.filter(p => p.currentStatus === 'Normal').length,
    mam: patients.filter(p => p.currentStatus === 'MAM').length,
    sam: patients.filter(p => p.currentStatus === 'SAM').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient History</h1>
        <p className="text-gray-600 mt-1">View comprehensive medical history including screenings, visits, diagnoses, and treatments (Read-only)</p>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Read-Only Access:</strong> You can view patient screening history but cannot modify past records. 
          All patients shown are from your assigned health center: <strong>{assignedHealthCenter}</strong>
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold mt-1">{stats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Normal</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.normal}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MAM</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.mam}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">SAM</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{stats.sam}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>No patients found matching your search criteria</p>
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
                      {patient.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{patient.name}</h3>
                          <Badge variant={getStatusColor(patient.currentStatus)}>
                            {patient.currentStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {patient.id} • {patient.age} • {patient.gender}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Health Center</p>
                        <p className="font-medium">{patient.healthCenter}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Screening</p>
                        <p className="font-medium">{patient.lastScreening}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Screenings</p>
                        <p className="font-medium">{patient.totalScreenings}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Current Status</p>
                        <p className="font-medium">{patient.currentStatus}</p>
                      </div>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full lg:w-auto">
                        <Eye className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Medical History: {patient.name}</DialogTitle>
                        <DialogDescription>
                          Complete medical records for {patient.id} (Read-only)
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="mt-4">
                        {/* Patient Summary */}
                        <Card className="bg-blue-50 border-blue-200 mb-4">
                          <CardContent className="pt-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Patient ID</p>
                                <p className="font-semibold">{patient.id}</p>
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
                                <Badge variant={getStatusColor(patient.currentStatus)}>
                                  {patient.currentStatus}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Tabbed Medical History */}
                        <Tabs defaultValue="screenings" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="screenings">Screenings</TabsTrigger>
                            <TabsTrigger value="visits">Visits</TabsTrigger>
                            <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
                            <TabsTrigger value="treatments">Treatments</TabsTrigger>
                          </TabsList>

                          {/* Screenings Tab */}
                          <TabsContent value="screenings" className="space-y-3 mt-4">
                            {getPatientScreenings(patient.id).map((screening) => (
                              <Card key={screening.id} className="border-l-4 border-l-blue-500">
                                <CardContent className="pt-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="font-semibold">{screening.date}</span>
                                        <Badge variant={getStatusColor(screening.classification)}>
                                          {screening.classification}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        ID: {screening.id} • By: {screening.conductedBy}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                    <div>
                                      <p className="text-xs text-gray-500">MUAC</p>
                                      <p className="font-semibold">{screening.muac}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Weight</p>
                                      <p className="font-semibold">{screening.weight}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Height/Length</p>
                                      <p className="font-semibold">{screening.height}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Edema</p>
                                      <p className="font-semibold">{screening.edema ? 'Yes' : 'No'}</p>
                                    </div>
                                  </div>

                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Recommendation</p>
                                    <p className="text-sm font-medium">{screening.recommendation}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            {getPatientScreenings(patient.id).length === 0 && (
                              <p className="text-center text-gray-500 py-8">No screening records found</p>
                            )}
                          </TabsContent>

                          {/* Visits Tab */}
                          <TabsContent value="visits" className="space-y-3 mt-4">
                            {getPatientVisits(patient.id).map((visit) => (
                              <Card key={visit.id} className="border-l-4 border-l-green-500">
                                <CardContent className="pt-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="font-semibold">{visit.date}</span>
                                        <Badge>{visit.type}</Badge>
                                      </div>
                                      <p className="text-sm text-gray-600">Visit ID: {visit.id}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                    <div>
                                      <p className="text-xs text-gray-500">Conducted By</p>
                                      <p className="font-semibold text-sm">{visit.conductedBy}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Location</p>
                                      <p className="font-semibold text-sm">{visit.location}</p>
                                    </div>
                                  </div>

                                  <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-600 mb-1">Visit Notes</p>
                                    <p className="text-sm">{visit.notes}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            {getPatientVisits(patient.id).length === 0 && (
                              <p className="text-center text-gray-500 py-8">No visit records found</p>
                            )}
                          </TabsContent>

                          {/* Diagnoses Tab */}
                          <TabsContent value="diagnoses" className="space-y-3 mt-4">
                            {getPatientDiagnoses(patient.id).map((diagnosis) => (
                              <Card key={diagnosis.id} className="border-l-4 border-l-yellow-500">
                                <CardContent className="pt-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="font-semibold">{diagnosis.date}</span>
                                        <Badge variant={diagnosis.severity === 'Severe' ? 'destructive' : 'default'}>
                                          {diagnosis.severity}
                                        </Badge>
                                        <Badge variant={diagnosis.status === 'Active' ? 'default' : 'secondary'}>
                                          {diagnosis.status}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600">Diagnosis ID: {diagnosis.id}</p>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <p className="text-sm font-semibold text-gray-900">{diagnosis.condition}</p>
                                    <p className="text-xs text-gray-600 mt-1">Diagnosed by: {diagnosis.diagnosedBy}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            {getPatientDiagnoses(patient.id).length === 0 && (
                              <p className="text-center text-gray-500 py-8">No diagnosis records found</p>
                            )}
                          </TabsContent>

                          {/* Treatments Tab */}
                          <TabsContent value="treatments" className="space-y-3 mt-4">
                            {getPatientTreatments(patient.id).map((treatment) => (
                              <Card key={treatment.id} className="border-l-4 border-l-purple-500">
                                <CardContent className="pt-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="font-semibold">{treatment.date}</span>
                                        <Badge variant={treatment.status === 'Active' ? 'default' : 'secondary'}>
                                          {treatment.status}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600">Treatment ID: {treatment.id}</p>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <p className="text-sm font-semibold text-gray-900">{treatment.type}</p>
                                    <p className="text-sm text-gray-700 mt-1">{treatment.description}</p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-xs text-gray-500">Prescribed By</p>
                                      <p className="font-semibold text-sm">{treatment.prescribedBy}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Duration</p>
                                      <p className="font-semibold text-sm">{treatment.duration}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            {getPatientTreatments(patient.id).length === 0 && (
                              <p className="text-center text-gray-500 py-8">No treatment records found</p>
                            )}
                          </TabsContent>
                        </Tabs>

                        {/* Note about read-only access */}
                        <Alert className="mt-4">
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            These records are read-only. You cannot modify past medical data. 
                            To add new records, use the appropriate forms from the main menu.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Export Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const data = patients.map(patient => ({
                  id: patient.id,
                  name: patient.name,
                  age: patient.age,
                  gender: patient.gender,
                  currentStatus: patient.currentStatus,
                  lastScreening: patient.lastScreening,
                  totalScreenings: patient.totalScreenings,
                  healthCenter: patient.healthCenter
                }));
                downloadCSV(data, 'patient_history');
                toast.success('CSV file downloaded successfully!');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const data = patients.map(patient => ({
                  id: patient.id,
                  name: patient.name,
                  age: patient.age,
                  gender: patient.gender,
                  currentStatus: patient.currentStatus,
                  lastScreening: patient.lastScreening,
                  totalScreenings: patient.totalScreenings,
                  healthCenter: patient.healthCenter
                }));
                downloadJSON(data, 'patient_history');
                toast.success('JSON file downloaded successfully!');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};