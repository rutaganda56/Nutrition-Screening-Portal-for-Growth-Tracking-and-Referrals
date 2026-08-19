import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  BarChart as BarChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
import { toast } from 'sonner';
import { ExportDropdown } from '@/app/components/ui/ExportDropdown';
import { generateDoctorReportsPdfReport } from '@/utils/pdfReportGenerator';
import { screeningsApi, referralsApi, patientsApi, serviceRequestsApi, PatientResponse, ScreeningResponse, ReferralResponse } from '@/services/api';

export const Reports = () => {
  const [dateRange, setDateRange] = useState('6months');
  const [reportType, setReportType] = useState('overview');
  
  const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);
  const [referrals, setReferrals] = useState<ReferralResponse[]>([]);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const fetchReportData = () => {
    setLoading(true);
    Promise.all([
      screeningsApi.getAll(),
      referralsApi.getAll(),
      patientsApi.getAll(),
      serviceRequestsApi.getAll()
    ])
    .then(([screeningsData, referralsData, patientsData, serviceRequestsData]) => {
      if (user) {
        const userNameStr = user.name?.toLowerCase().trim();
        
        // Find patients strictly assigned to this doctor via service requests
        const myRequests = serviceRequestsData.filter(r => r.assignedToName && r.assignedToName.toLowerCase().trim() === userNameStr);
        const myPatientIds = new Set(myRequests.map(r => r.patientId));
        
        // Filter patients, screenings, and referrals to only those involving the doctor's patients
        const myPatients = patientsData.filter(p => myPatientIds.has(p.id));
        const myScreenings = screeningsData.filter(s => myPatientIds.has(s.patientId));
        const myReferrals = referralsData.filter(r => myPatientIds.has(r.patientId));

        setScreenings(myScreenings);
        setReferrals(myReferrals);
        setPatients(myPatients);
      } else {
        setScreenings(screeningsData);
        setReferrals(referralsData);
        setPatients(patientsData);
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error('Failed to load real-time analytics data');
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchReportData();
  }, [user]);

  const totalPatients = patients.length;
  const totalScreened = screenings.length;
  const samCases = screenings.filter(s => s.classification === 'SAM').length;
  const mamCases = screenings.filter(s => s.classification === 'MAM').length;
  const normalCases = screenings.filter(s => !s.classification || s.classification.toUpperCase() === 'NORMAL').length;

  const resolvedReferrals = referrals.filter(r => r.status.toUpperCase() === 'ACCEPTED' || r.status.toUpperCase() === 'COMPLETED').length;
  const referralSuccessRate = referrals.length > 0 ? Math.round((resolvedReferrals / referrals.length) * 100) : 100;

  // Compute status distribution dynamically
  const statusDistribution = [
    { name: 'Normal', value: totalScreened > 0 ? Math.round((normalCases / totalScreened) * 100) : 100, color: '#10b981' },
    { name: 'MAM', value: totalScreened > 0 ? Math.round((mamCases / totalScreened) * 100) : 0, color: '#f59e0b' },
    { name: 'SAM', value: totalScreened > 0 ? Math.round((samCases / totalScreened) * 100) : 0, color: '#ef4444' }
  ];

  const exportDataArray = [{
    TotalScreenings: totalScreened,
    SAMDetected: samCases,
    MAMDetected: mamCases,
    ReferralSuccessRate: `${referralSuccessRate}%`,
    DateRange: dateRange
  }];

  const handleExportPdfReport = async () => {
    toast.info('Generating professional PDF report...', { duration: 2000 });
    try {
      await generateDoctorReportsPdfReport({
        stats: {
          totalPatients,
          totalScreened,
          samCases,
          mamCases,
          normalCases,
          referralSuccessRate
        },
        dateRange,
        userName: user?.name || 'Doctor',
        userRole: user?.role || 'doctor',
      });
      toast.success('PDF report downloaded successfully');
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  return (
    <div className="p-6 space-y-6" id="analytics-report-document">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Real time clinical and program analytics from the active database</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDropdown
            data={exportDataArray}
            filename={`Clinical_Analytics_Report_${dateRange}`}
            pdfElementId="analytics-report-document"
            onCustomPdfExport={handleExportPdfReport}
            buttonClassName="bg-green-600 hover:bg-green-700 text-white"
          />
        </div>
      </div>

      {/* Performance Metrics Grid */}
      {loading ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
              </CardHeader>
              <CardContent className="flex justify-center pb-8">
                <Skeleton className="h-64 w-64 rounded-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Total Screenings</p>
                  <p className="text-3xl font-bold">{totalScreened}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">SAM Detected</p>
                  <p className="text-3xl font-bold ">{samCases}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">MAM Detected</p>
                  <p className="text-3xl font-bold ">{mamCases}</p>
                </div>
              </CardContent>
            </Card>
            {/* <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Referrals Success</p>
                  <p className="text-3xl font-bold ">{referralSuccessRate}%</p>
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Charts Section */}
          <Tabs defaultValue="distribution" className="space-y-4">
            <TabsList>
              <TabsTrigger value="distribution">Nutritional Distribution</TabsTrigger>
              <TabsTrigger value="summary">Summary Details</TabsTrigger>
            </TabsList>

            <TabsContent value="distribution">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Nutritional Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-green-900">Normal Status</span>
                          <span className="text-2xl font-bold text-green-700">{normalCases} Cases</span>
                        </div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-yellow-900">MAM Cases</span>
                          <span className="text-2xl font-bold text-yellow-700">{mamCases} Cases</span>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-red-900">SAM Cases</span>
                          <span className="text-2xl font-bold text-red-700">{samCases} Cases</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Activity Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Registered Patients</span>
                    <span className="font-semibold">{totalPatients}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Total Growth Screenings Conducted</span>
                    <span className="font-semibold">{totalScreened}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};