import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Search, Plus, MapPin, Phone, Mail, Users, Building, Edit, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';

interface Facility {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Health Center' | 'Dispensary';
  status: 'Active' | 'Inactive';
  location: string;
  phone: string;
  email: string;
  staff: number;
  capacity: number;
  services: string[];
}

export const FacilityDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [facilities, setFacilities] = useState<Facility[]>([
    {
      id: 'F-001',
      name: 'Polyclinique du Bon Berger',
      type: 'Hospital',
      status: 'Active',
      location: 'Kigali, Rwanda',
      phone: '+250 788 123 456',
      email: 'contact@bonberger.org',
      staff: 45,
      capacity: 120,
      services: ['Nutrition', 'Pediatrics', 'General Medicine', 'Laboratory']
    },
    {
      id: 'F-002',
      name: 'Kibagabaga Health Center',
      type: 'Health Center',
      status: 'Active',
      location: 'Kibagabaga, Kigali',
      phone: '+250 788 234 567',
      email: 'kibagabaga@health.rw',
      staff: 28,
      capacity: 60,
      services: ['Nutrition', 'Maternal Health', 'Vaccination']
    },
    {
      id: 'F-003',
      name: 'Kimironko Clinic',
      type: 'Clinic',
      status: 'Active',
      location: 'Kimironko, Kigali',
      phone: '+250 788 345 678',
      email: 'info@kimironko.rw',
      staff: 15,
      capacity: 30,
      services: ['General Medicine', 'Nutrition Screening']
    },
    {
      id: 'F-004',
      name: 'Remera Dispensary',
      type: 'Dispensary',
      status: 'Inactive',
      location: 'Remera, Kigali',
      phone: '+250 788 456 789',
      email: 'remera@health.rw',
      staff: 8,
      capacity: 15,
      services: ['Basic Care', 'Vaccination']
    }
  ]);

  const [newFacility, setNewFacility] = useState<Partial<Facility>>({
    name: '',
    type: 'Clinic',
    status: 'Active',
    location: '',
    phone: '',
    email: '',
    staff: 0,
    capacity: 0,
    services: []
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Hospital':
        return 'default';
      case 'Clinic':
        return 'secondary';
      case 'Health Center':
        return 'outline';
      case 'Dispensary':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'secondary' : 'destructive';
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || facility.type.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  const handleAddFacility = () => {
    const facility: Facility = {
      id: `F-${String(facilities.length + 1).padStart(3, '0')}`,
      name: newFacility.name || '',
      type: newFacility.type as any,
      status: newFacility.status as any,
      location: newFacility.location || '',
      phone: newFacility.phone || '',
      email: newFacility.email || '',
      staff: newFacility.staff || 0,
      capacity: newFacility.capacity || 0,
      services: newFacility.services || []
    };

    setFacilities([...facilities, facility]);
    setIsAddDialogOpen(false);
    setNewFacility({
      name: '',
      type: 'Clinic',
      status: 'Active',
      location: '',
      phone: '',
      email: '',
      staff: 0,
      capacity: 0,
      services: []
    });
    toast.success('Facility added successfully');
  };

  const handleDeleteFacility = (id: string) => {
    setFacilities(facilities.filter(f => f.id !== id));
    toast.success('Facility deleted successfully');
  };

  const activeFacilities = facilities.filter(f => f.status === 'Active').length;
  const totalStaff = facilities.reduce((sum, f) => sum + f.staff, 0);
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Center Management</h1>
          <p className="text-gray-600 mt-1">Manage healthcare facilities and organizational structure</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Facility
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Facility</DialogTitle>
              <DialogDescription>Register a new healthcare facility in the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facility Name</Label>
                  <Input 
                    placeholder="Enter facility name"
                    value={newFacility.name}
                    onChange={(e) => setNewFacility({...newFacility, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newFacility.type} onValueChange={(value) => setNewFacility({...newFacility, type: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hospital">Hospital</SelectItem>
                      <SelectItem value="Clinic">Clinic</SelectItem>
                      <SelectItem value="Health Center">Health Center</SelectItem>
                      <SelectItem value="Dispensary">Dispensary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  placeholder="Enter location"
                  value={newFacility.location}
                  onChange={(e) => setNewFacility({...newFacility, location: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="+250 788 123 456"
                    value={newFacility.phone}
                    onChange={(e) => setNewFacility({...newFacility, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="facility@example.com"
                    value={newFacility.email}
                    onChange={(e) => setNewFacility({...newFacility, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Staff Count</Label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={newFacility.staff}
                    onChange={(e) => setNewFacility({...newFacility, staff: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Patient Capacity</Label>
                  <Input 
                    type="number" 
                    placeholder="0"
                    value={newFacility.capacity}
                    onChange={(e) => setNewFacility({...newFacility, capacity: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Services Offered</Label>
                <Textarea 
                  placeholder="Enter services separated by commas (e.g., Nutrition, Pediatrics, Laboratory)"
                  value={newFacility.services?.join(', ')}
                  onChange={(e) => setNewFacility({...newFacility, services: e.target.value.split(',').map(s => s.trim())})}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddFacility} className="bg-blue-600 hover:bg-blue-700">
                  Add Facility
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Facilities</p>
                <p className="text-3xl font-bold mt-1">{facilities.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Facilities</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{activeFacilities}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-3xl font-bold mt-1">{totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-3xl font-bold mt-1">{totalCapacity}</p>
              </div>
              <Building className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search facilities by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="clinic">Clinic</SelectItem>
                <SelectItem value="health center">Health Center</SelectItem>
                <SelectItem value="dispensary">Dispensary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Facilities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Facilities ({filteredFacilities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFacilities.map((facility) => (
                <TableRow key={facility.id}>
                  <TableCell className="font-medium">{facility.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{facility.name}</div>
                      <div className="text-xs text-gray-500">{facility.services.slice(0, 2).join(', ')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTypeColor(facility.type)}>{facility.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      {facility.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {facility.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        {facility.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{facility.staff}</TableCell>
                  <TableCell>{facility.capacity}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(facility.status)}>{facility.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toast.info('Edit functionality')}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleDeleteFacility(facility.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};