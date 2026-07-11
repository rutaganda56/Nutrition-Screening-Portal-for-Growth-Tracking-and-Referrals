import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { toast } from 'sonner';
import { downloadCSV } from '@/utils/exportUtils';
import { patientsApi, serviceRequestsApi, PatientResponse } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export const PatientManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const fetchPatients = () => {
    setLoading(true);
    Promise.all([
      patientsApi.getAll(),
      serviceRequestsApi.getAll()
    ])
      .then(([patientsData, serviceRequestsData]) => {
        let finalPatients = patientsData;
        if (user) {
          const userNameStr = user.name?.toLowerCase().trim();
          const myRequests = serviceRequestsData.filter(r => r.assignedToName && r.assignedToName.toLowerCase().trim() === userNameStr);
          const myPatientIds = new Set(myRequests.map(r => r.patientId));
          finalPatients = patientsData.filter(p => myPatientIds.has(p.id));
        }
        setPatients(finalPatients);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load patients from database');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, [user]);

  const filteredPatients = patients.filter(patient =>
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.patientCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string | null) => {
    const s = status || 'NORMAL';
    switch (s.toUpperCase()) {
      case 'SEVERE':
      case 'SAM':
        return 'destructive';
      case 'MODERATE':
      case 'MAM':
        return 'default';
      case 'NORMAL':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600 mt-1">View and manage all patient records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadCSV(patients, 'patients')}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search patients by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <FilterListIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold mt-2">{patients.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Normal</p>
              <p className="text-3xl font-bold mt-2 text-green-600">
                {patients.filter(p => !p.currentStatus || p.currentStatus.toUpperCase() === 'NORMAL').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Moderate</p>
              <p className="text-3xl font-bold mt-2 text-yellow-600">
                {patients.filter(p => p.currentStatus && (p.currentStatus.toUpperCase() === 'MODERATE' || p.currentStatus.toUpperCase() === 'MAM')).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Severe</p>
              <p className="text-3xl font-bold mt-2 text-red-600">
                {patients.filter(p => p.currentStatus && (p.currentStatus.toUpperCase() === 'SEVERE' || p.currentStatus.toUpperCase() === 'SAM')).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Records</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 pt-4 animate-in fade-in duration-500">
              <div className="flex gap-4 border-b pb-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-12" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center py-2 border-b last:border-0">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex items-center gap-2 w-48">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <div className="w-32 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Health Facility</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.patientCode}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-green-100 text-green-700">
                              {patient.firstName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{patient.firstName} {patient.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>{patient.gender}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(patient.currentStatus)}>
                          {patient.currentStatus || 'NORMAL'}
                        </Badge>
                      </TableCell>
                      <TableCell>{patient.facilityName || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{patient.guardianFirstName} {patient.guardianLastName}</div>
                          <div className="text-gray-500">{patient.guardianPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPatient(patient)}
                              >
                                <VisibilityIcon className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Patient Details</DialogTitle>
                                <DialogDescription>
                                  Comprehensive patient information and history
                                </DialogDescription>
                              </DialogHeader>
                              {selectedPatient && (
                                <Tabs defaultValue="overview" className="w-full">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="guardian">Guardian Info</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 pt-4">
                                      <div>
                                        <p className="text-sm text-gray-500">Patient Code</p>
                                        <p className="font-medium">{selectedPatient.patientCode}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Age</p>
                                        <p className="font-medium">{selectedPatient.age}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Gender</p>
                                        <p className="font-medium">{selectedPatient.gender}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <Badge variant={getStatusColor(selectedPatient.currentStatus)}>
                                          {selectedPatient.currentStatus || 'NORMAL'}
                                        </Badge>
                                      </div>
                                      <div>
                                        <p className="text-sm text-gray-500">Facility</p>
                                        <p className="font-medium">{selectedPatient.facilityName || 'N/A'}</p>
                                      </div>
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="guardian" className="space-y-4 pt-4">
                                    <div className="space-y-3">
                                      <h4 className="font-semibold">Guardian Information</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm">
                                          <StarBorderIcon className="h-4 w-4 text-gray-500" />
                                          <span>{selectedPatient.guardianFirstName} {selectedPatient.guardianLastName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <PhoneIcon className="h-4 w-4 text-gray-500" />
                                          <span>{selectedPatient.guardianPhone}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
