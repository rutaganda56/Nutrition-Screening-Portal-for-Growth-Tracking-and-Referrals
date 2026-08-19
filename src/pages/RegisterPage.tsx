import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { PasswordInput } from '@/app/components/ui/password-input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const roleOptions = [
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'COMMUNITY_HEALTH_WORKER', label: 'Community Health Worker' },
  { value: 'ADMINISTRATOR', label: 'Administrator' },
];

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: '',
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      await authApi.register({ ...formData, role: formData.role });
      toast.success('Account created. You can now sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nutri Track</h1>
          <p className="text-gray-600 mt-2">Create an account for system testing</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create Account
            </CardTitle>
            <CardDescription>
              Choose a role and create credentials to access the portal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" required value={formData.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" required value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" required value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+250700000000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput id="password" required minLength={6} value={formData.password} onChange={(e) => updateField('password', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => updateField('role', value)}>
                  <SelectTrigger id="role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button type="button" className="text-green-600 hover:underline" onClick={() => navigate('/login')}>Sign in</button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
