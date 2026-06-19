import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Settings as SettingsIcon, Save, Building } from 'lucide-react';
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
        <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

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
    </div>
  );
};

