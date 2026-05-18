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
import { serviceRequestsApi, ServiceRequestResponse } from '@/services/api';

export const ServiceRequestQueue = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    serviceRequestsApi.getAll()
      .then((data) => {
        setServiceRequests(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load service requests from database');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const pendingRequests = serviceRequests.filter(r => r.status.toLowerCase() === 'pending');
  const inReviewRequests = serviceRequests.filter(r => r.status.toLowerCase() === 'in_review' || r.status.toLowerCase() === 'in-review');
  const completedRequests = serviceRequests.filter(r => r.status.toLowerCase() === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
      case 'asap':
        return 'destructive';
      case 'routine':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
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
    // Mark as in-review in database if it was pending
    const req = serviceRequests.find(r => String(r.id) === requestId);
    if (req && req.status.toLowerCase() === 'pending') {
      serviceRequestsApi.updateStatus(Number(requestId), 'IN_REVIEW')
        .then(() => {
          navigate(`/dashboard/patient-clinical-summary?patient=${patientId}&request=${requestId}`);
        })
        .catch((err) => {
          console.error(err);
          // Proceed anyway so doctor can see the patient summary
          navigate(`/dashboard/patient-clinical-summary?patient=${patientId}&request=${requestId}`);
        });
    } else {
      navigate(`/dashboard/patient-clinical-summary?patient=${patientId}&request=${requestId}`);
    }
  };

  const filteredRequests = (requests: ServiceRequestResponse[]) => {
    if (!searchTerm) return requests;
    return requests.filter(r => 
      r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.patientId).includes(searchTerm) ||
      String(r.id).includes(searchTerm)
    );
  };

  const ServiceRequestCard = ({ request }: { request: ServiceRequestResponse }) => (
    <Card className={`hover:shadow-lg transition-shadow ${
      request.priority.toLowerCase() === 'asap' || request.priority.toLowerCase() === 'urgent' ? 'border-2 border-red-400' : ''
    }`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{request.patientName}</h3>
                <Badge variant={getPriorityColor(request.priority.toLowerCase())} className="flex items-center gap-1">
                  {getPriorityIcon(request.priority.toLowerCase())}
                  {request.priority.toUpperCase()}
                </Badge>
                <Badge className={getClassificationColor(request.classification)}>
                  {request.classification}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Patient ID: {request.patientId} • Age: {request.patientAge}
              </p>
            </div>
          </div>

          {/* CHW Information */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Submitted by CHW</p>
                <p className="text-sm text-blue-700">{request.submittedByName}</p>
                <p className="text-xs text-blue-600 mt-1">
                  <Calendar className="h-3 w-3 inline mr-1" />
                  {new Date(request.submittedAt).toLocaleString()} • Screening: {request.screeningCode}
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
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-xs text-gray-500">Weight</p>
              <p className="font-semibold text-sm">{request.weightKg} kg</p>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-xs text-gray-500">Height</p>
              <p className="font-semibold text-sm">{request.heightCm} cm</p>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-xs text-gray-500">MUAC</p>
              <p className={`font-semibold text-sm ${
                request.muacCm < 11.5 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {request.muacCm} cm
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              onClick={() => handleReviewCase(String(request.id), String(request.patientId))}
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
                  {serviceRequests.filter(r => r.priority.toLowerCase() === 'urgent' || r.priority.toLowerCase() === 'asap').length}
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
                <p className="text-sm text-gray-600">Completed</p>
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
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading service requests from database...</div>
      ) : (
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
      )}
    </div>
  );
};