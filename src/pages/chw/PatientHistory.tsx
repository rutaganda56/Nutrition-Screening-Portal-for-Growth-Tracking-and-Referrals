import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  AlertCircle,
  Info,
  Download,
  Loader2
} from 'lucide-react';
import { downloadCSV, downloadJSON } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { patientsApi, screeningsApi, PatientResponse, ScreeningResponse } from '@/services/api';

export const PatientHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [screeningsMap, setScreeningsMap] = useState<Record<number, ScreeningResponse[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingScreenings, setLoadingScreenings] = useState<Record<number, boolean>>({});

  useEffect(() => {
    patientsApi.getAll()
      .then(setPatients)
      .catch(() => toast.error('Failed to load patients'))
      .finally(() => setLoading(false));
  }, []);

  const loadScreenings = async (patientId: number) => {
    setLoadingScreenings(prev => ({ ...prev, [patientId]: true }));
    try {
      const data = await screeningsApi.getByPatient(patientId);
      setScreeningsMap(prev => ({ ...prev, [patientId]: data }));
    } catch {
      toast.error('Failed to load screening history');
      setScreeningsMap(prev => ({ ...prev, [patientId]: [] }));
    } finally {
      setLoadingScreenings(prev => ({ ...prev, [patientId]: false }));
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient History</h1>
        <p className="text-gray-600 mt-1">View patient screening history (Read-only)</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
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
                <Users className="h-6 w-6" />
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
                <Activity className="h-6 w-6" />
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
                <TrendingUp className="h-6 w-6" />
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
                <AlertCircle className="h-6 w-6" />
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
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
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

                    <Dialog onOpenChange={(open) => open && loadScreenings(patient.id)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full lg:w-auto">
                          <Eye className="h-4 w-4 mr-2" />
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

                          {/* Screenings */}
                          <h4 className="font-semibold mb-3">Screening Records</h4>
                          {loadingScreenings[patient.id] ? (
                            <div className="flex justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                          ) : (screeningsMap[patient.id] ?? []).length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No screening records found</p>
                          ) : (
                            <div className="space-y-3">
                              {(screeningsMap[patient.id] ?? []).map((s) => (
                                <Card key={s.id} className="border-l-4 border-l-blue-500">
                                  <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Calendar className="h-4 w-4 text-gray-500" />
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
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              These records are read-only. To add new records, use the Screening Form.
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
      )}

      {/* Export */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const data = patients.map(p => ({
                  id: p.patientCode,
                  name: `${p.firstName} ${p.lastName}`,
                  age: p.age,
                  gender: p.gender,
                  currentStatus: p.currentStatus,
                  lastScreeningDate: p.lastScreeningDate,
                  totalScreenings: p.totalScreenings,
                  facility: p.facilityName,
                }));
                downloadCSV(data, 'patient_history');
                toast.success('CSV downloaded successfully!');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const data = patients.map(p => ({
                  id: p.patientCode,
                  name: `${p.firstName} ${p.lastName}`,
                  age: p.age,
                  gender: p.gender,
                  currentStatus: p.currentStatus,
                  lastScreeningDate: p.lastScreeningDate,
                  totalScreenings: p.totalScreenings,
                  facility: p.facilityName,
                }));
                downloadJSON(data, 'patient_history');
                toast.success('JSON downloaded successfully!');
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



