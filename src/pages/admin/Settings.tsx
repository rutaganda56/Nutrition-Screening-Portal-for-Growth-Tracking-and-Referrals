import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Settings as SettingsIcon, Save, Globe, Bell, Mail, 
  Palette, Languages, Building, Clock, Shield, Key
} from 'lucide-react';
import { toast } from 'sonner';

export const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    applicationName: 'Nutrition Screening Portal',
    organizationName: 'Polyclinique du Bon Berger',
    supportEmail: 'support@bonberger.org',
    contactPhone: '+250 788 123 456',
    address: 'Kigali, Rwanda',
    timezone: 'Africa/Kigali',
    language: 'en',
    dateFormat: 'MM/DD/YYYY'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dailyReports: true,
    weeklyReports: true,
    alertsEnabled: true,
    criticalAlerts: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    primaryColor: 'blue',
    compactMode: false,
    sidebarCollapsed: false
  });

  // Security & 2FA Settings
  const [securitySettings, setSecuritySettings] = useState({
    require2FA: false,
    enforce2FAForAdmins: false,
    enforce2FAForDoctors: false,
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumbers: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15
  });

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Settings</h1>
          <p className="text-gray-600 mt-1">Configure general application preferences</p>
        </div>
        <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security & 2FA</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Information
              </CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Application Name</Label>
                  <Input
                    value={generalSettings.applicationName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, applicationName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    value={generalSettings.organizationName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, organizationName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    value={generalSettings.contactPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  value={generalSettings.address}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security & 2FA Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & 2FA
              </CardTitle>
              <CardDescription>Manage security settings and two-factor authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Require 2FA</Label>
                  <p className="text-sm text-gray-600">Enforce two-factor authentication for all users</p>
                </div>
                <Switch
                  checked={securitySettings.require2FA}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, require2FA: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Enforce 2FA for Admins</Label>
                  <p className="text-sm text-gray-600">Require 2FA for administrators</p>
                </div>
                <Switch
                  checked={securitySettings.enforce2FAForAdmins}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, enforce2FAForAdmins: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Enforce 2FA for Doctors</Label>
                  <p className="text-sm text-gray-600">Require 2FA for doctors</p>
                </div>
                <Switch
                  checked={securitySettings.enforce2FAForDoctors}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, enforce2FAForDoctors: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Password Minimum Length</Label>
                <Input
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Require Special Characters in Password</Label>
                  <p className="text-sm text-gray-600">Enforce the use of special characters in passwords</p>
                </div>
                <Switch
                  checked={securitySettings.passwordRequireSpecialChar}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, passwordRequireSpecialChar: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Require Numbers in Password</Label>
                  <p className="text-sm text-gray-600">Enforce the use of numbers in passwords</p>
                </div>
                <Switch
                  checked={securitySettings.passwordRequireNumbers}
                  onCheckedChange={(checked) => 
                    setSecuritySettings({ ...securitySettings, passwordRequireNumbers: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Maximum Login Attempts</Label>
                <Input
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Lockout Duration (minutes)</Label>
                <Input
                  type="number"
                  value={securitySettings.lockoutDuration}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, lockoutDuration: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Manage how you receive notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Push Notifications</Label>
                  <p className="text-sm text-gray-600">Receive browser push notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, pushNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Daily Reports</Label>
                  <p className="text-sm text-gray-600">Receive daily summary reports</p>
                </div>
                <Switch
                  checked={notificationSettings.dailyReports}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, dailyReports: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Weekly Reports</Label>
                  <p className="text-sm text-gray-600">Receive weekly summary reports</p>
                </div>
                <Switch
                  checked={notificationSettings.weeklyReports}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, weeklyReports: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Critical Alerts</Label>
                  <p className="text-sm text-gray-600">Receive alerts for critical events</p>
                </div>
                <Switch
                  checked={notificationSettings.criticalAlerts}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, criticalAlerts: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Display
              </CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select 
                  value={appearanceSettings.theme} 
                  onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Color</Label>
                <Select 
                  value={appearanceSettings.primaryColor} 
                  onValueChange={(value) => setAppearanceSettings({ ...appearanceSettings, primaryColor: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Compact Mode</Label>
                  <p className="text-sm text-gray-600">Use compact spacing for denser layout</p>
                </div>
                <Switch
                  checked={appearanceSettings.compactMode}
                  onCheckedChange={(checked) => 
                    setAppearanceSettings({ ...appearanceSettings, compactMode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base">Collapsed Sidebar</Label>
                  <p className="text-sm text-gray-600">Start with sidebar collapsed by default</p>
                </div>
                <Switch
                  checked={appearanceSettings.sidebarCollapsed}
                  onCheckedChange={(checked) => 
                    setAppearanceSettings({ ...appearanceSettings, sidebarCollapsed: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Settings */}
        <TabsContent value="regional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>Configure language, timezone, and date formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select 
                  value={generalSettings.language} 
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="rw">Kinyarwanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select 
                  value={generalSettings.timezone} 
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Kigali">Africa/Kigali (GMT+2)</SelectItem>
                    <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                    <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select 
                  value={generalSettings.dateFormat} 
                  onValueChange={(value) => setGeneralSettings({ ...generalSettings, dateFormat: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Current Time</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {new Date().toLocaleString('en-US', { 
                        timeZone: generalSettings.timezone,
                        dateStyle: 'full',
                        timeStyle: 'long'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};