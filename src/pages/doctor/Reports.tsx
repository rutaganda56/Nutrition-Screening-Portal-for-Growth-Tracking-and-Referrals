import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Label } from '@/app/components/ui/label';
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
import { downloadCSV, downloadJSON } from '@/utils/exportUtils';
import { screeningsApi, referralsApi, patientsApi, PatientResponse, ScreeningResponse, ReferralResponse } from '@/services/api';

export const Reports = () => {
  const [dateRange, setDateRange] = useState('6months');
  const [reportType, setReportType] = useState('overview');
  
  const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);
  const [referrals, setReferrals] = useState<ReferralResponse[]>([]);
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = () => {
    setLoading(true);
    Promise.all([
      screeningsApi.getAll(),
      referralsApi.getAll(),
      patientsApi.getAll()
    ])
    .then(([screeningsData, referralsData, patientsData]) => {
      setScreenings(screeningsData);
      setReferrals(referralsData);
      setPatients(patientsData);
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
  }, []);

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

  const handleExportReport = () => {
    const exportData = {
      reportDate: new Date().toISOString(),
      dateRange: dateRange,
      reportType: reportType,
      summary: {
        totalPatientsScreened: totalScreened,
        samCases,
        mamCases,
        normalCases,
        totalReferrals: referrals.length,
        referralSuccessRate: `${referralSuccessRate}%`
      },
      screenings: screenings,
      referrals: referrals,
      patients: patients
    };
    
    downloadJSON(exportData, 'doctor-clinical-nutrition-report');
    toast.success('Report analytics exported successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Real-time clinical and program analytics from the active database</p>
        </div>
        <Button onClick={handleExportReport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview Summary</SelectItem>
                  <SelectItem value="screening">Screening Report</SelectItem>
                  <SelectItem value="performance">Performance Metrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="all">All-Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchReportData} variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Grid */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Computing analytics from database...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Card>
              <CardContent className="pt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Referrals Success</p>
                  <p className="text-3xl font-bold ">{referralSuccessRate}%</p>
                </div>
              </CardContent>
            </Card>
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
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Specialized Referrals Issued</span>
                    <span className="font-semibold">{referrals.length}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-gray-600">Referral Success Rate</span>
                    <span className="font-semibold">{referralSuccessRate}%</span>
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