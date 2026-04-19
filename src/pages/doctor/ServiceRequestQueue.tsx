import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import {
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceRequest {
  id: string;
  patientId: string;
  patientName: string;
  age: string;
  householdId: string;
  priority: 'urgent' | 'routine' | 'asap';
  status: 'pending' | 'in-review' | 'completed' | 'declined';
  reasonCode: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  screeningId: string;
  classification: 'SAM' | 'MAM' | 'Normal';
  observations: {
    weight: string;
    height: string;
    muac: string;
    edema: boolean;
  };
}

export const ServiceRequestQueue = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock service requests from CHWs
  const serviceRequests: ServiceRequest[] = [
    {
      id: 'SR-1024',
      patientId: 'P-1024',
      patientName: 'Uwimana Marie',
      age: '2y 4m',
      householdId: 'H-101',
      priority: 'urgent',
      status: 'pending',
      reasonCode: 'sam-detected',
      description: 'Severe Acute Malnutrition detected during community screening. MUAC: 10.8cm, Bilateral edema present. Child appears lethargic, mother reports reduced appetite for 2 weeks.',
      submittedBy: 'CHW Mukamana Josiane',
      submittedAt: '2026-02-04 11:00 AM',
      screeningId: 'S-521',
      classification: 'SAM',
      observations: {
        weight: '9.2 kg',
        height: '82.0 cm',
        muac: '10.8 cm',
        edema: true
      }
    },
    {
      id: 'SR-1089',
      patientId: 'P-1089',
      patientName: 'Ishimwe Claude',
      age: '1y 8m',
      householdId: 'H-087',
      priority: 'urgent',
      status: 'pending',
      reasonCode: 'sam-detected',
      description: 'SAM with rapid deterioration. MUAC: 11.2cm, showing signs of medical complications. Requires immediate assessment.',
      submittedBy: 'CHW Mutoni Beatrice',
      submittedAt: '2026-02-04 09:30 AM',
      screeningId: 'S-520',
      classification: 'SAM',
      observations: {
        weight: '7.8 kg',
        height: '75.0 cm',
        muac: '11.2 cm',
        edema: false
      }
    },
    {
      id: 'SR-1156',
      patientId: 'P-1156',
      patientName: 'Nshuti Diane',
      age: '3y 2m',
      householdId: 'H-142',
      priority: 'routine',
      status: 'pending',
      reasonCode: 'mam-detected',
      description: 'Moderate Acute Malnutrition detected. MUAC: 11.8cm. No immediate complications but needs treatment plan assessment.',
      submittedBy: 'CHW Mukamana Josiane',
      submittedAt: '2026-02-03 02:15 PM',
      screeningId: 'S-518',
      classification: 'MAM',
      observations: {
        weight: '11.8 kg',
        height: '88.0 cm',
        muac: '11.8 cm',
        edema: false
      }
    },
    {
      id: 'SR-1201',
      patientId: 'P-1201',
      patientName: 'Irakoze Patrick',
      age: '4y 1m',
      householdId: 'H-098',
      priority: 'routine',
      status: 'in-review',
      reasonCode: 'follow-up-required',
      description: 'Follow-up after previous treatment. Weight gain is slow, needs reassessment of nutrition plan.',
      submittedBy: 'CHW Mutoni Beatrice',
      submittedAt: '2026-02-03 10:00 AM',
      screeningId: 'S-517',
      classification: 'MAM',
      observations: {
        weight: '13.5 kg',
        height: '95.0 cm',
        muac: '12.0 cm',
        edema: false
      }
    },
    {
      id: 'SR-0987',
      patientId: 'P-0987',
      patientName: 'Mutesi Divine',
      age: '2y 6m',
      householdId: 'H-076',
      priority: 'asap',
      status: 'pending',
      reasonCode: 'complications',
      description: 'Child with SAM and medical complications - persistent diarrhea and fever. Immediate clinical review needed.',
      submittedBy: 'CHW Mukamana Josiane',
      submittedAt: '2026-02-05 08:00 AM',
      screeningId: 'S-523',
      classification: 'SAM',
      observations: {
        weight: '8.5 kg',
        height: '80.0 cm',
        muac: '10.5 cm',
        edema: true
      }
    }
  ];

  const pendingRequests = serviceRequests.filter(r => r.status === 'pending');
  const inReviewRequests = serviceRequests.filter(r => r.status === 'in-review');
  const completedRequests = serviceRequests.filter(r => r.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'asap':
        return 'destructive';
      case 'routine':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'asap':
        return <AlertTriangle className="h-4 w-4" />;
      case 'routine':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'SAM':
        return 'bg-red-50 border-red-300 text-red-700';
      case 'MAM':
        return 'bg-yellow-50 border-yellow-300 text-yellow-700';
      default:
        return 'bg-green-50 border-green-300 text-green-700';
    }
  };

  const handleReviewCase = (requestId: string, patientId: string) => {
    // Store the service request ID to pass to the Patient Clinical Summary
    localStorage.setItem('activeServiceRequest', requestId);
    navigate(`/dashboard/patient-clinical-summary?patient=${patientId}&request=${requestId}`);
  };

  const filteredRequests = (requests: ServiceRequest[]) => {
    if (!searchTerm) return requests;
    return requests.filter(r => 
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const ServiceRequestCard = ({ request }: { request: ServiceRequest }) => (
    <Card className={`hover:shadow-lg transition-shadow ${
      request.priority === 'asap' ? 'border-2 border-red-400' : ''
    }`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{request.patientName}</h3>
                <Badge variant={getPriorityColor(request.priority)} className="flex items-center gap-1">
                  {getPriorityIcon(request.priority)}
                  {request.priority.toUpperCase()}
                </Badge>
                <Badge className={getClassificationColor(request.classification)}>
                  {request.classification}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {request.patientId} • {request.age} • Household: {request.householdId}
              </p>
            </div>
          </div>

          {/* CHW Information */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Submitted by CHW</p>
                <p className="text-sm text-blue-700">{request.submittedBy}</p>
                <p className="text-xs text-blue-600 mt-1">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {request.submittedAt} • Screening: {request.screeningId}
                </p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Reason: {request.reasonCode}</p>
            <p className="text-sm text-gray-600">{request.description}</p>
          </div>

          {/* Observations Summary */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-xs text-gray-500">Weight</p>
              <p className="font-semibold text-sm">{request.observations.weight}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-xs text-gray-500">Height</p>
              <p className="font-semibold text-sm">{request.observations.height}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-xs text-gray-500">MUAC</p>
              <p className={`font-semibold text-sm ${
                parseFloat(request.observations.muac) < 11.5 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {request.observations.muac}
              </p>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-xs text-gray-500">Edema</p>
              <p className={`font-semibold text-sm ${
                request.observations.edema ? 'text-red-600' : 'text-gray-900'
              }`}>
                {request.observations.edema ? 'Yes' : 'No'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              onClick={() => handleReviewCase(request.id, request.patientId)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Review Case
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Request Queue</h1>
        <p className="text-gray-600 mt-1">Review and respond to CHW-submitted service requests requiring clinical decisions</p>
      </div>

      {/* Role Information */}
      <Alert className="border-blue-300 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>Doctor Workflow:</strong> Community Health Workers submit service requests for patients requiring clinical review. 
          All patient access is through these service requests - you cannot browse patients directly. Review each case to make clinical decisions.
        </AlertDescription>
      </Alert>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-red-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{pendingRequests.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{inReviewRequests.length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent Cases</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {serviceRequests.filter(r => r.priority === 'urgent' || r.priority === 'asap').length}
                </p>
              </div>
              <Send className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{completedRequests.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, ID, or request number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="in-review" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            In Review ({inReviewRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredRequests(pendingRequests).length > 0 ? (
            filteredRequests(pendingRequests).map((request) => (
              <ServiceRequestCard key={request.id} request={request} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No pending service requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in-review" className="space-y-4">
          {filteredRequests(inReviewRequests).length > 0 ? (
            filteredRequests(inReviewRequests).map((request) => (
              <ServiceRequestCard key={request.id} request={request} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No requests currently in review</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredRequests(completedRequests).length > 0 ? (
            filteredRequests(completedRequests).map((request) => (
              <ServiceRequestCard key={request.id} request={request} />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No completed requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};