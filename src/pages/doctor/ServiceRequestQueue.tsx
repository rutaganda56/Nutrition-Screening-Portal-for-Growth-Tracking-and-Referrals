import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import { Badge as UIBadge } from '@/app/components/ui/badge';
import { ExportDropdown } from '@/app/components/ui/ExportDropdown';
import { generateServiceRequestQueuePdfReport } from '@/utils/pdfReportGenerator';
import { toast } from 'sonner';
import { serviceRequestsApi, ServiceRequestResponse } from '@/services/api';

export const ServiceRequestQueue = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    serviceRequestsApi.getAll()
      .then((data) => {
        if (user) {
          const userNameStr = user.name?.toLowerCase().trim();
          const filtered = data.filter(r => r.assignedToName?.toLowerCase().trim() === userNameStr);
          setServiceRequests(filtered);
        } else {
          setServiceRequests(data);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load service requests from database');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

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
        return <WarningAmberIcon className="h-4 w-4" />;
      case 'routine':
        return <AccessTimeIcon className="h-4 w-4" />;
      default:
        return <AccessTimeIcon className="h-4 w-4" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'SAM':
        return 'bg-red-50 border text-red-700';
      case 'MAM':
        return 'bg-yellow-50 border text-yellow-700';
      default:
        return 'bg-green-50 border text-green-700';
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

  const handleExportPdfReport = async () => {
    toast.info('Generating professional PDF report...', { duration: 2000 });
    let requestsToExport = [
      ...pendingRequests,
      ...inReviewRequests,
      ...completedRequests
    ];

    requestsToExport = filteredRequests(requestsToExport);

    try {
      await generateServiceRequestQueuePdfReport({
        requests: requestsToExport.map(r => ({
          patientName: r.patientName,
          patientId: String(r.patientId),
          priority: r.priority,
          classification: r.classification,
          status: r.status
        })),
        queueFilter: 'All Requests',
        userName: user?.name || 'Doctor',
        userRole: user?.role || 'doctor',
      });
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  const ServiceRequestCard = ({ request }: { request: ServiceRequestResponse }) => (
    <Card className={`hover:shadow-lg transition-shadow ${
      request.priority.toLowerCase() === 'asap' || request.priority.toLowerCase() === 'urgent' ? 'border-2' : ''
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
                Patient ID: {request.patientId}  Age: {request.patientAge}
              </p>
            </div>
          </div>

          {/* CHW Information */}
          <div className="p-3 bg-gray-50 border rounded-lg">
            <div className="flex items-start gap-2">
              <PersonIcon className="h-4 w-4 text-gray-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Submitted by CHW</p>
                <p className="text-sm text-gray-700">{request.submittedByName}</p>
                <p className="text-xs text-gray-600 mt-1">
                  <CalendarTodayIcon className="h-3 w-3 inline mr-1" />
                  {new Date(request.submittedAt).toLocaleString()}  Screening: {request.screeningCode}
                </p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Reason: {request.description}</p>
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
              <DescriptionIcon className="h-4 w-4 mr-2" />
              Review Case
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div id="service-request-queue" className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Request Queue</h1>
          <p className="text-gray-600 mt-1">Review and respond to CHW-submitted service requests requiring clinical decisions</p>
        </div>
        <ExportDropdown
          data={filteredRequests(
            activeTab === 'pending' ? pendingRequests : 
            activeTab === 'in-review' ? inReviewRequests : 
            completedRequests
          )}
          filename={`Service_Requests_All_Queue`}
          pdfElementId="service-queue-document"
          onCustomPdfExport={handleExportPdfReport}
          buttonClassName="bg-green-600 hover:bg-green-700 text-white"
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-3xl font-bold  mt-1">{pendingRequests.length}</p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <WarningAmberIcon className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Review</p>
                <p className="text-3xl font-bold  mt-1">{inReviewRequests.length}</p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <AccessTimeIcon className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent Cases</p>
                <p className="text-3xl font-bold  mt-1">
                  {serviceRequests.filter(r => r.priority.toLowerCase() === 'urgent' || r.priority.toLowerCase() === 'asap').length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <SendIcon className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold  mt-1">{completedRequests.length}</p>
              </div>
              <div className="h-12 w-12 rounded-md flex items-center justify-center bg-white text-green-600">
                <CheckCircleIcon className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, ID, or request number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <FilterListIcon className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests Tabs */}
      {loading ? (
        <div className="space-y-4 pt-4">
          <div className="flex gap-2 mb-4">
            <Skeleton className="h-10 w-1/3 rounded-md" />
            <Skeleton className="h-10 w-1/3 rounded-md" />
            <Skeleton className="h-10 w-1/3 rounded-md" />
          </div>
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-in fade-in duration-500">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-14 w-full rounded" />
                    <Skeleton className="h-14 w-full rounded" />
                    <Skeleton className="h-14 w-full rounded" />
                  </div>
                  <div className="pt-2 border-t">
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <WarningAmberIcon className="h-4 w-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="in-review" className="flex items-center gap-2">
              <AccessTimeIcon className="h-4 w-4" />
              In Review ({inReviewRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
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
                  <CheckCircleIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
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
                  <AccessTimeIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
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
                  <DescriptionIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
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
