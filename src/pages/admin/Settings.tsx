import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { User, Save, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { usersApi } from '@/services/api';

export const Settings = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (profile.phone && profile.phone.trim() && !/^[0-9]{10}$/.test(profile.phone)) {
      toast.error('Contact phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);
    try {
      await usersApi.update(Number(user.id), {
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        role: user.role === 'communityhealthworker' ? 'CHW' : user.role.toUpperCase(),
        facilityId: user.facilityId || undefined
      });
      // Important: Update the local context so it reflects immediately without a refresh
      updateUser({
        name: profile.fullName,
        email: profile.email,
        phone: profile.phone
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await usersApi.changePassword(Number(user.id), passwords.currentPassword, passwords.newPassword);
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Failed to change password. Please verify your current password.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your personal account information and security</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Update your personal details and contact information</CardDescription>
        </CardHeader> 
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                pattern="[0-9]{10}"
                title="Phone number must be exactly 10 digits"
              />
            </div>
          </div>
          <div className="pt-4">
            <Button onClick={handleSaveProfile} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader> 
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-4">
            <Button onClick={handleChangePassword} disabled={loading} variant="outline" className="border-gray-300">
              <Lock className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


