import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Switch } from '@/app/components/ui/switch';
import { User, Mail, Phone, MapPin, Calendar, Save, Camera, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+250 788 123 456',
    department: user?.department || 'General Health',
    address: 'Kigali, Rwanda',
    joinDate: '2024-01-15'
  });

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);

  const handleSave = () => {
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'doctor':
        return 'Doctor';
      case 'communityhealthworker':
        return 'Community Health Worker';
      case 'administrator':
        return 'Administrator';
      default:
        return role;
    }
  };

  const recentActivity = [
    { action: 'Completed screening', patient: 'Sarah Johnson', time: '2 hours ago' },
    { action: 'Updated patient record', patient: 'Michael Brown', time: '5 hours ago' },
    { action: 'Created referral', patient: 'Emma Davis', time: '1 day ago' }
  ];

  const handleEnable2FA = () => {
    navigate('/2fa-setup');
  };

  const handleDisable2FA = () => {
    setShowDisable2FA(false);
    setTwoFactorEnabled(false);
    toast.success('2FA yararetswe neza');
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="bg-green-600 text-white text-4xl">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-blue-600 hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-2xl font-bold mt-4">{user?.name}</h2>
              <Badge className="mt-2">{getRoleName(user?.role || '')}</Badge>
              <p className="text-gray-600 mt-1">{user?.department}</p>
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{formData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{formData.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Joined {formData.joinDate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details and Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Profile Information</CardTitle>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Personal Details</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="security" className="space-y-6 mt-4">
                {/* Two-Factor Authentication */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Two-Factor Authentication (2FA)</h3>
                    <p className="text-sm text-gray-600">
                      Kongera umutekano kuri konti yawe ukoresheje telefoni yawe
                    </p>
                  </div>

                  <Card className={twoFactorEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <Shield className={`w-6 h-6 ${twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">
                                {twoFactorEnabled ? '2FA yashyizweho' : '2FA ntirishyizweho'}
                              </p>
                              {twoFactorEnabled && (
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {twoFactorEnabled 
                                ? 'Konti yawe irinzwe na 2FA. Uzasabwa ikode ya 2FA buri gihe winjira.'
                                : 'Shiraho 2FA kugira ngo ukorere umutekano muri konti yawe.'
                              }
                            </p>
                            {twoFactorEnabled && (
                              <p className="text-xs text-gray-500 mt-2">
                                Yashyizweho: Werurwe 15, 2026
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          {!twoFactorEnabled ? (
                            <Button
                              onClick={handleEnable2FA}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Shiraho 2FA
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setShowDisable2FA(true)}
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Hagarika 2FA
                            </Button>
                          )}
                        </div>
                      </div>

                      {showDisable2FA && (
                        <Alert variant="destructive" className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-3">
                              <p className="text-sm">
                                Uzi neza ko ushaka kuhagarika 2FA? Ibi bizagabanya umutekano wa konti yawe.
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleDisable2FA}
                                  variant="destructive"
                                  size="sm"
                                >
                                  Yego, Hagarika
                                </Button>
                                <Button
                                  onClick={() => setShowDisable2FA(false)}
                                  variant="outline"
                                  size="sm"
                                >
                                  Hagarika
                                </Button>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Password Change */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Change Password</h3>
                    <p className="text-sm text-gray-600">
                      Hindura ijambo ry'ibanga kugira ngo ukorere umutekano
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Ijambo ry'ibanga rya none</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Ijambo ry'ibanga rishya</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Emeza ijambo ry'ibanga rishya</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 w-fit">
                      Hindura Ijambo ry'ibanga
                    </Button>
                  </div>
                </div>

                {/* Session Management */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Active Sessions</h3>
                    <p className="text-sm text-gray-600">
                      Reba ahantu winjiye kuri konti yawe
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Current Session</p>
                              <p className="text-sm text-gray-600">Windows · Chrome · Kigali, Rwanda</p>
                              <p className="text-xs text-gray-500 mt-1">Last active: Now</p>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-600">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <Phone className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">Mobile App</p>
                              <p className="text-sm text-gray-600">Android · Kigali, Rwanda</p>
                              <p className="text-xs text-gray-500 mt-1">Last active: 2 hours ago</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            Revoke
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Button variant="outline" className="w-full">
                    Sign Out All Other Sessions
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-3 mt-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600">Patient: {activity.patient}</p>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Patients</p>
            <p className="text-2xl font-bold mt-2">87</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Screenings</p>
            <p className="text-2xl font-bold mt-2">245</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Referrals</p>
            <p className="text-2xl font-bold mt-2">34</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold mt-2">28</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};