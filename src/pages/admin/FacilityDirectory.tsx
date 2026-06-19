import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Search, Plus, MapPin, Phone, Mail, Users, Building, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { facilitiesApi, FacilityResponse } from '@/services/api';

const emptyForm = { name: '', type: 'CLINIC', location: '', phone: '', email: '', staff: 0, capacity: 0, services: '' };

type FacilityFormProps = {
  form: typeof emptyForm;
  errors: Record<string,string>;
  submitting: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLocationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStaffChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCapacityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onServicesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTypeChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  label: string;
};

const FacilityFormComponent: React.FC<FacilityFormProps> = ({ form, errors, submitting, onNameChange, onLocationChange, onPhoneChange, onEmailChange, onStaffChange, onCapacityChange, onServicesChange, onTypeChange, onSubmit, onCancel, label }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Facility Information</CardTitle>
        <CardDescription>Provide basic information about the health facility</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facilityName">Facility Name <span className="text-red-600">*</span></Label>
            <Input id="facilityName" placeholder="Enter name" value={form.name} onChange={onNameChange} className={errors.name ? 'border-red-500' : ''} />
            {errors.name && (<p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="facilityType">Type *</Label>
            <Select value={form.type} onValueChange={onTypeChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HOSPITAL">Hospital</SelectItem>
                <SelectItem value="CLINIC">Clinic</SelectItem>
                <SelectItem value="HEALTH_CENTER">Health Center</SelectItem>
                <SelectItem value="DISPENSARY">Dispensary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="facilityLocation">Location <span className="text-red-600">*</span></Label>
            <Input id="facilityLocation" placeholder="City, Country" value={form.location} onChange={onLocationChange} className={errors.location ? 'border-red-500' : ''} />
            {errors.location && (<p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.location}</p>)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="facilityPhone">Phone</Label>
            <Input id="facilityPhone" placeholder="+250 788 123 456" value={form.phone} onChange={onPhoneChange} className={errors.phone ? 'border-red-500' : ''} />
            {errors.phone && (<p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.phone}</p>)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="facilityEmail">Email</Label>
            <Input id="facilityEmail" type="email" placeholder="facility@example.com" value={form.email} onChange={onEmailChange} className={errors.email ? 'border-red-500' : ''} />
            {errors.email && (<p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="facilityStaff">Staff Count</Label>
            <Input id="facilityStaff" type="number" value={form.staff} onChange={onStaffChange} className={errors.staff ? 'border-red-500' : ''} />
            {errors.staff && (<p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.staff}</p>)}
          </div>
          <div className="space-y-2">
            <Label htmlFor="facilityCapacity">Patient Capacity</Label>
            <Input id="facilityCapacity" type="number" value={form.capacity} onChange={onCapacityChange} className={errors.capacity ? 'border-red-500' : ''} />
            {errors.capacity && (<p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.capacity}</p>)}
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="facilityServices">Services (comma-separated)</Label>
            <Textarea id="facilityServices" placeholder="Nutrition, Pediatrics, Laboratory" value={form.services} onChange={onServicesChange} rows={2} className={errors.services ? 'border-red-500' : ''} />
            {errors.services && (<p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.services}</p>)}
          </div>
        </div>
      </CardContent>
      <div className="flex gap-2 justify-end p-4">
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting} className="bg-green-600 hover:bg-green-700">{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{label}</Button>
      </div>
    </Card>
  </form>
);

export const FacilityDirectory = () => {
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reload = () =>
    facilitiesApi.getAll().then(setFacilities).catch(() => toast.error('Failed to load facilities'));

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    const newErrors: Record<string,string> = {};
    if (!form.name || !form.name.trim()) newErrors.name = 'Facility name is required';
    if (!form.location || !form.location.trim()) newErrors.location = 'Location is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); toast.error('Please correct the errors in the form'); return; }
    setSubmitting(true);
    try {
      await facilitiesApi.create({ ...form, status: 'ACTIVE' } as any);
      toast.success('Facility created successfully');
      setIsCreateOpen(false);
      setForm(emptyForm);
      reload();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create facility');
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const newErrors: Record<string,string> = {};
    if (!form.name || !form.name.trim()) newErrors.name = 'Facility name is required';
    if (!form.location || !form.location.trim()) newErrors.location = 'Location is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); toast.error('Please correct the errors in the form'); return; }
    setSubmitting(true);
    try {
      await facilitiesApi.update(editingId, { ...form, status: 'ACTIVE' } as any);
      toast.success('Facility updated successfully');
      setIsEditOpen(false);
      setEditingId(null);
      reload();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update facility');
    } finally { setSubmitting(false); }
  };

  const handleToggle = async (id: number) => {
    try {
      await facilitiesApi.toggleStatus(id);
      toast.success('Facility status updated');
      reload();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await facilitiesApi.delete(id);
      toast.success('Facility deleted');
      reload();
    } catch { toast.error('Failed to delete facility'); }
  };

  const openEdit = (f: FacilityResponse) => {
    setEditingId(f.id);
    setForm({ name: f.name, type: f.type, location: f.location, phone: f.phone ?? '', email: f.email ?? '', staff: f.staff, capacity: f.capacity, services: f.services ?? '' });
    setIsEditOpen(true);
  };

  const filtered = facilities.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || f.type.toLowerCase() === filterType.toLowerCase();
    return matchSearch && matchType;
  });

  const stats = {
    total: facilities.length,
    active: facilities.filter(f => f.status === 'ACTIVE').length,
    staff: facilities.reduce((s, f) => s + f.staff, 0),
    capacity: facilities.reduce((s, f) => s + f.capacity, 0),
  };

  // useCallback handlers to avoid recreating functions on each render for smoother typing
  const onNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm(f => ({ ...f, name: v }));
    setErrors(prev => { if (!prev.name) return prev; const n = { ...prev }; delete n.name; return n; });
  }, []);
  const onLocationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm(f => ({ ...f, location: v }));
    setErrors(prev => { if (!prev.location) return prev; const n = { ...prev }; delete n.location; return n; });
  }, []);
  const onPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm(f => ({ ...f, phone: v }));
    setErrors(prev => { if (!prev.phone) return prev; const n = { ...prev }; delete n.phone; return n; });
  }, []);
  const onEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm(f => ({ ...f, email: v }));
    setErrors(prev => { if (!prev.email) return prev; const n = { ...prev }; delete n.email; return n; });
  }, []);
  const onStaffChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm(f => ({ ...f, staff: parseInt(v) || 0 }));
    setErrors(prev => { if (!prev.staff) return prev; const n = { ...prev }; delete n.staff; return n; });
  }, []);
  const onCapacityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm(f => ({ ...f, capacity: parseInt(v) || 0 }));
    setErrors(prev => { if (!prev.capacity) return prev; const n = { ...prev }; delete n.capacity; return n; });
  }, []);
  const onServicesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setForm(f => ({ ...f, services: v }));
    setErrors(prev => { if (!prev.services) return prev; const n = { ...prev }; delete n.services; return n; });
  }, []);


  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Center Management</h1>
          <p className="text-gray-600 mt-1">Manage healthcare facilities</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setForm(emptyForm); setErrors({}); setIsCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />Add Facility
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add New Facility</DialogTitle><DialogDescription>Register a new healthcare facility</DialogDescription></DialogHeader>
          <FacilityFormComponent
            form={form}
            errors={errors}
            submitting={submitting}
            onNameChange={onNameChange}
            onLocationChange={onLocationChange}
            onPhoneChange={onPhoneChange}
            onEmailChange={onEmailChange}
            onStaffChange={onStaffChange}
            onCapacityChange={onCapacityChange}
            onServicesChange={onServicesChange}
            onTypeChange={v => setForm(f => ({ ...f, type: v }))}
            onSubmit={handleCreate}
            onCancel={() => { setIsCreateOpen(false); setErrors({}); setForm(emptyForm); }}
            label="Add Facility"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Facility</DialogTitle><DialogDescription>Update facility information</DialogDescription></DialogHeader>
          <FacilityFormComponent
            form={form}
            errors={errors}
            submitting={submitting}
            onNameChange={onNameChange}
            onLocationChange={onLocationChange}
            onPhoneChange={onPhoneChange}
            onEmailChange={onEmailChange}
            onStaffChange={onStaffChange}
            onCapacityChange={onCapacityChange}
            onServicesChange={onServicesChange}
            onTypeChange={v => setForm(f => ({ ...f, type: v }))}
            onSubmit={handleUpdate}
            onCancel={() => { setIsEditOpen(false); setEditingId(null); setErrors({}); setForm(emptyForm); }}
            label="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Facilities</p><p className="text-3xl font-bold mt-1">{stats.total}</p></div><div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600"><Building className="h-6 w-6" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Active</p><p className="text-3xl font-bold mt-1">{stats.active}</p></div><div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600"><MapPin className="h-6 w-6" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Staff</p><p className="text-3xl font-bold mt-1">{stats.staff}</p></div><div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600"><Users className="h-6 w-6" /></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Capacity</p><p className="text-3xl font-bold mt-1">{stats.capacity}</p></div><div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600"><Building className="h-6 w-6" /></div></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search by name or location..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="clinic">Clinic</SelectItem>
                <SelectItem value="health_center">Health Center</SelectItem>
                <SelectItem value="dispensary">Dispensary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>All Facilities ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 py-4 animate-in fade-in duration-500">
              <div className="flex gap-4 border-b pb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center py-2 border-b last:border-0">
                  <div className="space-y-2 w-48">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2 w-48">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                {filtered.map(f => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-gray-500">{f.services}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{f.type}</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-1"><MapPin className="h-3 w-3 text-gray-400" />{f.location}</div></TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {f.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-gray-400" />{f.phone}</div>}
                        {f.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-gray-400" />{f.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell>{f.staff}</TableCell>
                    <TableCell>{f.capacity}</TableCell>
                    <TableCell><Badge variant={f.status === 'ACTIVE' ? 'secondary' : 'destructive'}>{f.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(f)}><Edit className="h-3 w-3" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggle(f.id)}>{f.status === 'ACTIVE' ? 'Disable' : 'Enable'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(f.id)}><Trash2 className="h-3 w-3 text-red-600" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-8">No facilities found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


