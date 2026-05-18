import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { referralsApi, ReferralResponse } from '@/services/api';

export const Referrals = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [showNewReferral, setShowNewReferral] = useState(false);
  const [referrals, setReferrals] = useState<ReferralResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferrals = () => {
    setLoading(true);
    referralsApi.getAll()
      .then((data) => {
        setReferrals(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load referrals from database');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'default';
      case 'ACCEPTED':
        return 'secondary';
      case 'COMPLETED':
        return 'outline';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
      case 'URGENT':
        return 'destructive';
      case 'MEDIUM':
      case 'SEMI-URGENT':
        return 'default';
      case 'LOW':
      case 'ROUTINE':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const activeReferrals = referrals.filter(r => r.status.toUpperCase() === 'PENDING' || r.status.toUpperCase() === 'ACCEPTED');
  const completedReferrals = referrals.filter(r => r.status.toUpperCase() === 'COMPLETED' || r.status.toUpperCase() === 'REJECTED');

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
            <NewReferralForm onClose={() => { setShowNewReferral(false); fetchReferrals(); }} />
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
                  {referrals.filter(r => r.status.toUpperCase() === 'PENDING').length}
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
                  {referrals.filter(r => r.status.toUpperCase() === 'ACCEPTED').length}
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
                  {referrals.filter(r => r.status.toUpperCase() === 'COMPLETED').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading referrals from database...</div>
      ) : (
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
            {activeReferrals.length > 0 ? (
              activeReferrals.map((referral) => (
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
                              Patient ID: {referral.patientId} • Diagnosis: {referral.diagnosis}
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
                            Created: {new Date(referral.referredDate).toLocaleDateString()} • Ref Code: {referral.referralCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex lg:flex-col gap-2">
                        <Button variant="outline" className="flex-1 lg:flex-none">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No active referrals</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedReferrals.length > 0 ? (
              completedReferrals.map((referral) => (
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
                          Patient ID: {referral.patientId} • Referred To: {referral.referredTo}
                        </p>
                        <p className="text-xs text-gray-500">
                          Referred on: {new Date(referral.referredDate).toLocaleDateString()} • Code: {referral.referralCode}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No completed referrals</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

function NewReferralForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patientId: '',
    facility: '',
    urgency: 'routine',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.facility || !formData.reason.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const followUpObj = new Date();
    followUpObj.setDate(followUpObj.getDate() + 7);
    const followUpDate = followUpObj.toISOString().split('T')[0];

    referralsApi.create({
      patientId: Number(formData.patientId),
      serviceRequestId: null,
      referredTo: formData.facility,
      priority: formData.urgency.toUpperCase() === 'URGENT' ? 'URGENT' : 'ROUTINE',
      urgency: formData.urgency.toUpperCase(),
      diagnosis: 'SAM', // Default placeholder diagnosis for new direct referrals
      referralReason: formData.reason,
      transportArranged: false,
      followUpDate
    }, Number(user?.id))
    .then((savedRef) => {
      toast.success(`Referral created successfully! Code: ${savedRef.referralCode}`);
      onClose();
    })
    .catch((err) => {
      console.error(err);
      toast.error(`Failed to create referral: ${err.message}`);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patientId">Patient Database ID *</Label>
        <Input
          id="patientId"
          placeholder="e.g. 1"
          value={formData.patientId}
          onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="facility">Referral Facility *</Label>
        <Select
          value={formData.facility}
          onValueChange={(value) => setFormData({ ...formData, facility: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select facility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Kigali University Hospital">Kigali University Hospital</SelectItem>
            <SelectItem value="Therapeutic Feeding Center">Therapeutic Feeding Center</SelectItem>
            <SelectItem value="District Hospital">District Hospital</SelectItem>
            <SelectItem value="Specialized Nutrition Clinic">Specialized Nutrition Clinic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="urgency">Urgency Level *</Label>
        <Select
          value={formData.urgency}
          onValueChange={(value) => setFormData({ ...formData, urgency: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="urgent">Urgent - Immediate attention required</SelectItem>
            <SelectItem value="routine">Routine - Standard process</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Referral *</Label>
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