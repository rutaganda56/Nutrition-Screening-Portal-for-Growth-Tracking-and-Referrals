import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { 
  Send, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Hospital,
  AlertTriangle,
  Info,
  Lock,
  User,
  Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';

interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  age: string;
  status: 'Pending' | 'Accepted' | 'Completed' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
  referredTo: string;
  diagnosis: string;
  referralReason: string;
  referredDate: string;
  followUpDate: string;
}

export const Referrals = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showNewReferral, setShowNewReferral] = useState(false);

  const referrals: Referral[] = [
    {
      id: 'REF-2401',
      patientId: 'P-1024',
      patientName: 'Uwase Aline',
      age: '2y 4m',
      status: 'Pending',
      priority: 'High',
      referredTo: 'TFC - Polyclinique du Bon Berger',
      diagnosis: 'Severe Acute Malnutrition',
      referralReason: 'MUAC < 11.5cm with bilateral edema',
      referredDate: '2026-02-20',
      followUpDate: '2026-02-27'
    },
    {
      id: 'REF-2398',
      patientId: 'P-1089',
      patientName: 'Mugisha David',
      age: '1y 8m',
      status: 'Accepted',
      priority: 'High',
      referredTo: 'Regional Nutrition Center',
      diagnosis: 'SAM with complications',
      referralReason: 'Requires intensive therapeutic feeding',
      referredDate: '2026-02-18',
      followUpDate: '2026-02-25'
    },
    {
      id: 'REF-2375',
      patientId: 'P-1156',
      patientName: 'Imena Diane',
      age: '3y 2m',
      status: 'Completed',
      priority: 'Medium',
      referredTo: 'Supplementary Feeding Program',
      diagnosis: 'Moderate Acute Malnutrition',
      referralReason: 'MUAC 11.5-12.5cm, requires supplementary feeding',
      referredDate: '2026-02-10',
      followUpDate: '2026-02-17'
    },
    {
      id: 'REF-2356',
      patientId: 'P-1201',
      patientName: 'Ntare Eric',
      age: '4y 1m',
      status: 'Completed',
      priority: 'Low',
      referredTo: 'Pediatric Clinic - Growth Assessment',
      diagnosis: 'Growth monitoring',
      referralReason: 'Slow weight gain, needs specialist review',
      referredDate: '2026-02-01',
      followUpDate: '2026-02-15'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'default';
      case 'Accepted':
        return 'secondary';
      case 'Completed':
        return 'outline';
      case 'Rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'default';
      case 'Low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const activeReferrals = referrals.filter(r => r.status === 'Pending' || r.status === 'Accepted');
  const completedReferrals = referrals.filter(r => r.status === 'Completed' || r.status === 'Rejected');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referrals Management</h1>
          <p className="text-gray-600 mt-1">Track and manage patient referrals to specialized facilities</p>
        </div>
        <Dialog open={showNewReferral} onOpenChange={setShowNewReferral}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Referral
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Referral</DialogTitle>
              <DialogDescription>
                Complete the form to create a new patient referral
              </DialogDescription>
            </DialogHeader>
            <NewReferralForm onClose={() => setShowNewReferral(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Clinical Role Information */}
      <Alert>
        <Stethoscope className="h-4 w-4" />
        <AlertDescription>
          <strong>Doctor Clinical Role:</strong> You can create and manage referrals based on your clinical assessment. 
          CHW-collected screening data is available in the Patient Clinical Summary for review before making referral decisions.
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Referrals</p>
                <p className="text-3xl font-bold mt-1">{referrals.length}</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-3xl font-bold mt-1 text-yellow-600">
                  {referrals.filter(r => r.status === 'Pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-3xl font-bold mt-1 text-green-600">
                  {referrals.filter(r => r.status === 'Accepted').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold mt-1 text-gray-600">
                  {referrals.filter(r => r.status === 'Completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            <Clock className="h-4 w-4 mr-2" />
            Active Referrals ({activeReferrals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed ({completedReferrals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeReferrals.map((referral) => (
            <Card key={referral.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{referral.patientName}</h3>
                          <Badge variant={getPriorityColor(referral.priority)}>
                            {referral.priority} Priority
                          </Badge>
                          <Badge variant={getStatusColor(referral.status)}>
                            {referral.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {referral.patientId} • {referral.age} • {referral.diagnosis}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Hospital className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Referral To:</p>
                          <p className="text-sm text-gray-600">{referral.referredTo}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Reason:</p>
                          <p className="text-sm text-gray-600">{referral.referralReason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-500">
                        Created: {referral.referredDate} • Ref ID: {referral.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <Button variant="outline" className="flex-1 lg:flex-none">
                      View Details
                    </Button>
                    {referral.status === 'Pending' && (
                      <Button variant="outline" className="flex-1 lg:flex-none">
                        Follow Up
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedReferrals.map((referral) => (
            <Card key={referral.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{referral.patientName}</h3>
                      <Badge variant={getStatusColor(referral.status)}>
                        {referral.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {referral.patientId} • {referral.referredTo}
                    </p>
                    <p className="text-xs text-gray-500">
                      {referral.referredDate} • {referral.id}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function NewReferralForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    patientId: '',
    facility: '',
    priority: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Referral created successfully');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patientId">Patient ID</Label>
        <Input
          id="patientId"
          placeholder="P-1024"
          value={formData.patientId}
          onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="facility">Referral Facility</Label>
        <Select
          value={formData.facility}
          onValueChange={(value) => setFormData({ ...formData, facility: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select facility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="therapeutic">Therapeutic Feeding Center</SelectItem>
            <SelectItem value="supplementary">Supplementary Feeding Program</SelectItem>
            <SelectItem value="hospital">District Hospital</SelectItem>
            <SelectItem value="counseling">Nutrition Counseling</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority Level</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High - Immediate attention required</SelectItem>
            <SelectItem value="medium">Medium - Schedule within week</SelectItem>
            <SelectItem value="low">Low - Routine follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Referral</Label>
        <Textarea
          id="reason"
          placeholder="Describe the clinical reason for this referral..."
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          <Send className="h-4 w-4 mr-2" />
          Create Referral
        </Button>
      </div>
    </form>
  );
}