import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleIcon from "@mui/icons-material/People";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BlockIcon from "@mui/icons-material/Block";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { toast } from 'sonner'; 
import { ExportDropdown } from '@/app/components/ui/ExportDropdown';
import { usersApi, facilitiesApi, UserResponse, FacilityResponse } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { generateUserManagementPdfReport } from '@/utils/pdfReportGenerator';

const ROLE_LABELS: Record<string, string> = {
  DOCTOR: 'Doctor',
  COMMUNITY_HEALTH_WORKER: 'Community Health Worker',
  ADMINISTRATOR: 'Administrator',
};

export const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const emptyForm = { fullName: '', email: '', phone: '', role: 'DOCTOR', facilityId: '', tempPassword: '' };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      usersApi.getAll().catch(() => []), 
      facilitiesApi.getAll().catch(() => [])
    ])
      .then(([u, f]) => { setUsers(u); setFacilities(f); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const reload = () => usersApi.getAll().then(setUsers).catch(() => toast.error('Failed to reload users'));

  const handleCreate = async () => {
    if (!form.fullName || !form.email || !form.role) {
      toast.error('Full name, email and role are required');
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(form.fullName)) {
      toast.error('Full name can only contain letters');
      return;
    }
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    // Require facility assignment for clinical roles so admin can view by facility
    if ((form.role === 'DOCTOR' || form.role === 'COMMUNITY_HEALTH_WORKER') && !form.facilityId) {
      toast.error('Please assign a facility for Doctors and Community Health Workers');
      return;
    }
    setSubmitting(true);
    try {
      await usersApi.create({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        facilityId: form.facilityId ? Number(form.facilityId) : undefined,
        temporaryPassword: form.tempPassword || undefined,
      });
      toast.success(`User created! Temporary password: ${form.tempPassword || `Temp@${form.fullName.replace(/\s+/g, '').substring(0, 4)}123`}`);
      setIsCreateOpen(false);
      setForm(emptyForm);
      reload();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    if (!form.fullName || !form.email || !form.role) {
      toast.error('Full name, email and role are required');
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(form.fullName)) {
      toast.error('Full name can only contain letters');
      return;
    }
    if (form.phone && !/^[0-9]{10}$/.test(form.phone)) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }
    setSubmitting(true);
    // Require facility assignment for clinical roles when updating
    if ((form.role === 'DOCTOR' || form.role === 'COMMUNITY_HEALTH_WORKER') && !form.facilityId) {
      toast.error('Please assign a facility for Doctors and Community Health Workers');
      setSubmitting(false);
      return;
    }
    try {
      await usersApi.update(editingUser.id, {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        facilityId: form.facilityId ? Number(form.facilityId) : undefined,
      });
      toast.success('User updated successfully');
      setIsEditOpen(false);
      setEditingUser(null);
      reload();
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    try {
      await usersApi.toggleStatus(id);
      toast.success(`User ${currentStatus === 'ACTIVE' ? 'disabled' : 'enabled'} successfully`);
      reload();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await usersApi.delete(id);
      toast.success('User deleted successfully');
      reload();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const openEdit = (user: UserResponse) => {
    setEditingUser(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone ?? '',
      role: user.role,
      // Use facilityId from backend response for robust facility preselection
      facilityId: user.facilityId ? String(user.facilityId) : '',
      tempPassword: '',
    });
    setIsEditOpen(true);
  };

  const filteredUsers = users.filter(u =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    admins: users.filter(u => u.role === 'ADMINISTRATOR').length,
    inactive: users.filter(u => u.status === 'INACTIVE').length,
  };

  const handleExportPdfReport = async () => {
    toast.info('Generating professional PDF report...', { duration: 2000 });
    try {
      await generateUserManagementPdfReport({
        stats,
        roleDistribution: {
          doctor: users.filter(u => u.role === 'DOCTOR').length,
          chw: users.filter(u => u.role === 'COMMUNITY_HEALTH_WORKER').length,
          admin: users.filter(u => u.role === 'ADMINISTRATOR').length,
        },
        users: filteredUsers.map(u => ({
          fullName: u.fullName,
          email: u.email,
          role: ROLE_LABELS[u.role] ?? u.role,
          facilityName: u.facilityName,
          status: u.status,
        })),
        userName: user?.name || 'Administrator',
        userRole: user?.role || 'administrator',
      });
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  return (
    <div id="user-management-container" className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Create and manage system users and their access</p>
        </div>
        <div className="flex gap-2">
          <ExportDropdown 
            data={filteredUsers.length > 0 ? filteredUsers : users}
            filename={`SystemUsers_${new Date().toISOString().split('T')[0]}`}
            pdfElementId="user-management-container"
            onCustomPdfExport={handleExportPdfReport}
            variant="outline"
          />
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setForm(emptyForm); setIsCreateOpen(true); }}>
            <PersonAddIcon className="h-4 w-4 mr-2" />Add User
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Fill in the details to create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="John Habineza" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required pattern="[A-Za-z\s]+" title="Full name can only contain letters" />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input type="email" placeholder="john@gmail.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" placeholder="+250 788 123 456" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="COMMUNITY_HEALTH_WORKER">Community Health Worker</SelectItem>
                    <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Assign to Facility</Label>
                <Select value={form.facilityId} onValueChange={v => setForm(f => ({ ...f, facilityId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select facility " /></SelectTrigger>
                  <SelectContent>
                    {facilities.map(f => (
                      <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Temporary Password (leave blank to auto-generate)</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Auto-generated if empty"
                    value={form.tempPassword}
                    onChange={e => setForm(f => ({ ...f, tempPassword: e.target.value }))}
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon className="h-4 w-4 text-gray-400" /> : <VisibilityIcon className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                {submitting ? <AutorenewIcon className="h-4 w-4 animate-spin mr-2" /> : null}
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input placeholder="John Habineza" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required pattern="[A-Za-z\s]+" title="Full name can only contain letters" />
              </div>
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input type="email" placeholder="john@gmail.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input type="tel" placeholder="+250 788 123 456" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} pattern="[0-9]{10}" title="Phone number must be exactly 10 digits" />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="COMMUNITY_HEALTH_WORKER">Community Health Worker</SelectItem>
                    <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Assign to Facility</Label>
                <Select value={form.facilityId} onValueChange={v => setForm(f => ({ ...f, facilityId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select facility " /></SelectTrigger>
                  <SelectContent>
                    {facilities.map(f => (
                      <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={submitting} className="bg-green-600 hover:bg-green-700">
                {submitting ? <AutorenewIcon className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Total Users</p><p className="text-3xl font-bold mt-1 tracking-tight text-gray-900">{stats.total}</p></div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 group-hover:scale-110 transition-transform"><PeopleIcon className="h-6 w-6" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Active</p><p className="text-3xl font-bold mt-1 tracking-tight text-gray-900">{stats.active}</p></div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 group-hover:scale-110 transition-transform"><StarBorderIcon className="h-6 w-6" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Administrators</p><p className="text-3xl font-bold mt-1 tracking-tight text-gray-900">{stats.admins}</p></div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 group-hover:scale-110 transition-transform"><SecurityIcon className="h-6 w-6" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-500">Inactive</p><p className="text-3xl font-bold mt-1 tracking-tight text-gray-900">{stats.inactive}</p></div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 group-hover:scale-110 transition-transform"><BlockIcon className="h-6 w-6" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle>All Users ({filteredUsers.length})</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4 py-4 animate-in fade-in duration-500">
              <div className="flex gap-4 border-b pb-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-32" />
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 items-center py-2 border-b last:border-0">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Facility</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'ADMINISTRATOR' ? 'destructive' : user.role === 'DOCTOR' ? 'default' : 'secondary'}>
                          {ROLE_LABELS[user.role] ?? user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.facilityName ?? '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'ACTIVE' ? 'secondary' : 'outline'}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEdit(user)}>Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(user.id, user.status)}>
                            {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(user.id)}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-gray-500 py-8">No users found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



