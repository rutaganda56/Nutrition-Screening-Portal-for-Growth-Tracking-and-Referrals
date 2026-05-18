import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
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
import { 
  Search, 
  UserPlus, 
  Filter, 
  Download,
  Eye,
  Edit,
  Activity,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSV } from '@/utils/exportUtils';
import { patientsApi, PatientResponse } from '@/services/api';

export const PatientManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = () => {
    setLoading(true);
    patientsApi.getAll()
      .then((data) => {
        setPatients(data);
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
  }, []);

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
          <Button variant="outline" onClick={() => downloadCSV(patients)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search patients by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
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
                {patients.filter(p => !p.status || p.status.toUpperCase() === 'NORMAL').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Moderate</p>
              <p className="text-3xl font-bold mt-2 text-yellow-600">
                {patients.filter(p => p.status && (p.status.toUpperCase() === 'MODERATE' || p.status.toUpperCase() === 'MAM')).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Severe</p>
              <p className="text-3xl font-bold mt-2 text-red-600">
                {patients.filter(p => p.status && (p.status.toUpperCase() === 'SEVERE' || p.status.toUpperCase() === 'SAM')).length}
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
            <div className="text-center py-10 text-gray-500">Loading patients from database...</div>
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
                        <Badge variant={getStatusColor(patient.status)}>
                          {patient.status || 'NORMAL'}
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
                                <Eye className="h-4 w-4" />
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
                                        <Badge variant={getStatusColor(selectedPatient.status)}>
                                          {selectedPatient.status || 'NORMAL'}
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
                                          <Activity className="h-4 w-4 text-gray-500" />
                                          <span>{selectedPatient.guardianFirstName} {selectedPatient.guardianLastName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                          <Phone className="h-4 w-4 text-gray-500" />
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