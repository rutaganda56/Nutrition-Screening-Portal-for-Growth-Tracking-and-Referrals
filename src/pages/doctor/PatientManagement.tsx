import React, { useState } from 'react';
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
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { downloadCSV } from '@/utils/exportUtils';

interface Patient {
  id: string;
  name: string;
  age: string;
  gender: 'Male' | 'Female';
  status: 'Normal' | 'Moderate' | 'Severe';
  lastVisit: string;
  weight: string;
  height: string;
  guardian: string;
  phone: string;
  address: string;
}

export const PatientManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const patients: Patient[] = [
    {
      id: 'P-1024',
      name: 'Uwase Aline',
      age: '2y 4m',
      gender: 'Female',
      status: 'Severe',
      lastVisit: '2 days ago',
      weight: '9.5kg',
      height: '82cm',
      guardian: 'Mukamana Josiane',
      phone: '+250 788 123 456',
      address: 'Village A, Zone 3'
    },
    {
      id: 'P-1089',
      name: 'Mugisha David',
      age: '1y 8m',
      gender: 'Male',
      status: 'Severe',
      lastVisit: '1 day ago',
      weight: '8.2kg',
      height: '75cm',
      guardian: 'Uwimana Claire',
      phone: '+250 788 234 567',
      address: 'Village B, Zone 1'
    },
    {
      id: 'P-1156',
      name: 'Imena Diane',
      age: '3y 2m',
      gender: 'Female',
      status: 'Moderate',
      lastVisit: '3 days ago',
      weight: '11.8kg',
      height: '88cm',
      guardian: 'Habimana Emmanuel',
      phone: '+250 788 345 678',
      address: 'Village A, Zone 5'
    },
    {
      id: 'P-1201',
      name: 'Ntare Eric',
      age: '4y 1m',
      gender: 'Male',
      status: 'Normal',
      lastVisit: '1 week ago',
      weight: '14.5kg',
      height: '98cm',
      guardian: 'Ingabire Sarah',
      phone: '+250 788 456 789',
      address: 'Village C, Zone 2'
    },
    {
      id: 'P-1242',
      name: 'Mutesi Divine',
      age: '2y 6m',
      gender: 'Female',
      status: 'Normal',
      lastVisit: '5 days ago',
      weight: '12.5kg',
      height: '85cm',
      guardian: 'Kamanzi Jean',
      phone: '+250 788 567 890',
      address: 'Village B, Zone 4'
    },
    {
      id: 'P-1278',
      name: 'Nkusi Cedric',
      age: '1y 9m',
      gender: 'Male',
      status: 'Normal',
      lastVisit: '4 days ago',
      weight: '10.2kg',
      height: '79cm',
      guardian: 'Mukandayisenga Rose',
      phone: '+250 788 678 901',
      address: 'Village A, Zone 1'
    }
  ];

  const growthData = [
    { month: 'Jan', weight: 8.5 },
    { month: 'Feb', weight: 8.8 },
    { month: 'Mar', weight: 9.0 },
    { month: 'Apr', weight: 9.2 },
    { month: 'May', weight: 9.4 },
    { month: 'Jun', weight: 9.5 }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Severe':
        return 'destructive';
      case 'Moderate':
        return 'default';
      case 'Normal':
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
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success('Add patient form opened')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Patient
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
                {patients.filter(p => p.status === 'Normal').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Moderate</p>
              <p className="text-3xl font-bold mt-2 text-yellow-600">
                {patients.filter(p => p.status === 'Moderate').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Severe</p>
              <p className="text-3xl font-bold mt-2 text-red-600">
                {patients.filter(p => p.status === 'Severe').length}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Measurements</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {patient.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{patient.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.lastVisit}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{patient.weight}</div>
                        <div className="text-gray-500">{patient.height}</div>
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
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="overview">Overview</TabsTrigger>
                                  <TabsTrigger value="growth">Growth Chart</TabsTrigger>
                                  <TabsTrigger value="history">History</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500">Patient ID</p>
                                      <p className="font-medium">{selectedPatient.id}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Name</p>
                                      <p className="font-medium">{selectedPatient.name}</p>
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
                                        {selectedPatient.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Last Visit</p>
                                      <p className="font-medium">{selectedPatient.lastVisit}</p>
                                    </div>
                                  </div>

                                  <div className="border-t pt-4 space-y-3">
                                    <h4 className="font-semibold">Guardian Information</h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <Activity className="h-4 w-4 text-gray-500" />
                                        <span>{selectedPatient.guardian}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-gray-500" />
                                        <span>{selectedPatient.phone}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-500" />
                                        <span>{selectedPatient.address}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="border-t pt-4 space-y-3">
                                    <h4 className="font-semibold">Current Measurements</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                      <Card>
                                        <CardContent className="pt-6">
                                          <p className="text-sm text-gray-500">Weight</p>
                                          <p className="text-2xl font-bold">{selectedPatient.weight}</p>
                                        </CardContent>
                                      </Card>
                                      <Card>
                                        <CardContent className="pt-6">
                                          <p className="text-sm text-gray-500">Height</p>
                                          <p className="text-2xl font-bold">{selectedPatient.height}</p>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="growth">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold">Weight Over Time</h4>
                                    <ResponsiveContainer width="100%" height={300}>
                                      <LineChart data={growthData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                </TabsContent>
                                <TabsContent value="history">
                                  <div className="space-y-4">
                                    <h4 className="font-semibold">Visit History</h4>
                                    <div className="space-y-3">
                                      {[
                                        { date: '2026-01-21', type: 'Screening', result: 'Severe malnutrition detected' },
                                        { date: '2026-01-10', type: 'Follow-up', result: 'Weight gain noted' },
                                        { date: '2025-12-15', type: 'Initial Assessment', result: 'Normal status' }
                                      ].map((visit, idx) => (
                                        <div key={idx} className="p-3 border rounded-lg">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium">{visit.type}</p>
                                              <p className="text-sm text-gray-600">{visit.result}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                              <Calendar className="h-4 w-4" />
                                              {visit.date}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </TabsContent>
                              </Tabs>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm" onClick={() => toast.success(`Editing ${patient.name}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};