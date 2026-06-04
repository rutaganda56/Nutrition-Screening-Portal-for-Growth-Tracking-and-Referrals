import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { User, Mail, Phone, MapPin, Calendar, Save, Camera, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { patientsApi, screeningsApi, referralsApi } from '@/services/api';

interface ActivityItem {
  id: string;
  action: string;
  patient: string;
  time: Date;
}

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

  const [stats, setStats] = useState({ patients: 0, screenings: 0, referrals: 0, thisMonth: 0 });
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    Promise.all([
      patientsApi.getAll(),
      screeningsApi.getAll(),
      referralsApi.getAll(),
    ]).then(([patients, screenings, referrals]) => {
      // Calculate Stats
      const thisMonthScreenings = screenings.filter(s => {
        const d = new Date(s.screeningDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;

      setStats({
        patients: patients.length,
        screenings: screenings.length,
        referrals: referrals.length,
        thisMonth: thisMonthScreenings,
      });

      // Build Recent Activity
      const myScreenings = screenings
        .filter(s => s.conductedByName === user?.name)
        .map(s => ({
          id: `s-${s.id}`,
          action: 'Completed screening',
          patient: s.patientName,
          time: new Date(s.screeningDate),
        }));

      const myReferrals = referrals
        .filter(r => r.referredByName === user?.name)
        .map(r => ({
          id: `r-${r.id}`,
          action: 'Created referral',
          patient: r.patientName,
          time: new Date(r.createdAt),
        }));

      const allActivity = [...myScreenings, ...myReferrals]
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 10);

      setActivities(allActivity);
    }).catch((error) => {
      console.error('Error fetching profile data:', error);
    });
  }, [user?.name]);

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information and activities</p>
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
                  className="absolute bottom-0 right-0 rounded-full h-10 w-10 bg-green-600 hover:bg-green-700"
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

              <TabsContent value="activity" className="space-y-3 mt-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div key={activity.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="mt-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="font-medium">{activity.action}</p>
                            <p className="text-sm text-gray-600">Patient: {activity.patient}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(activity.time, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent activity found.</p>
                  </div>
                )}
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
            <p className="text-2xl font-bold mt-2">{stats.patients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Screenings</p>
            <p className="text-2xl font-bold mt-2">{stats.screenings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Referrals</p>
            <p className="text-2xl font-bold mt-2">{stats.referrals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Screenings This Month</p>
            <p className="text-2xl font-bold mt-2">{stats.thisMonth}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};