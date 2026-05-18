import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, Activity, FileText, Download, 
  Filter, BarChart3, PieChart as PieChartIcon, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSV, downloadJSON } from '@/utils/exportUtils';
import { 
  patientsApi, 
  screeningsApi, 
  facilitiesApi, 
  referralsApi,
  PatientResponse,
  ScreeningResponse,
  ReferralResponse,
  FacilityResponse
} from '@/services/api';

export const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState('all');
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Database states
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);
  const [referrals, setReferrals] = useState<ReferralResponse[]>([]);
  const [facilities, setFacilities] = useState<FacilityResponse[]>([]);

  useEffect(() => {
    Promise.all([
      patientsApi.getAll(),
      screeningsApi.getAll(),
      referralsApi.getAll(),
      facilitiesApi.getAll()
    ])
      .then(([p, s, r, f]) => {
        setPatients(p);
        setScreenings(s);
        setReferrals(r);
        setFacilities(f);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load real-time analytical data from database');
      })
      .finally(() => setLoading(false));
  }, []);

  // 1. Dynamic Calculations: Key Metrics
  const totalScreeningsCount = screenings.length;
  const atRiskCount = patients.filter(p => p.currentStatus === 'MAM' || p.currentStatus === 'SAM').length;
  const activeReferralsCount = referrals.filter(r => r.status.toUpperCase() === 'PENDING' || r.status.toUpperCase() === 'ACTIVE').length;
  
  const completedReferralsCount = referrals.filter(r => r.status.toUpperCase() === 'COMPLETED').length;
  const successRatePercent = referrals.length > 0 
    ? Math.round((completedReferralsCount / referrals.length) * 100) 
    : 0;

  // Helpers to safely parse dates for filtering
  const getMonthName = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('default', { month: 'short' });
    } catch {
      return 'Unknown';
    }
  };

  // 2. Dynamic Calculations: Screening Trends Over Time
  const screeningTrends = React.useMemo(() => {
    const monthlyMap: Record<string, { month: string; screenings: number; malnourished: number; severe: number }> = {};
    
    // Pre-populate last 6 months chronologically so the chart flows nicely even with small datasets
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonthIndex - i + 12) % 12;
      const mName = shortMonths[mIdx];
      monthlyMap[mName] = { month: mName, screenings: 0, malnourished: 0, severe: 0 };
    }

    screenings.forEach(s => {
      const mName = getMonthName(s.screeningDate);
      if (monthlyMap[mName]) {
        monthlyMap[mName].screenings += 1;
        if (s.classification === 'MAM' || s.classification === 'SAM') {
          monthlyMap[mName].malnourished += 1;
        }
        if (s.classification === 'SAM') {
          monthlyMap[mName].severe += 1;
        }
      }
    });

    return Object.values(monthlyMap);
  }, [screenings]);

  // 3. Dynamic Calculations: Patient Age Distribution
  const ageDistribution = React.useMemo(() => {
    const ageGroups = {
      '0-6 months': 0,
      '6-12 months': 0,
      '1-2 years': 0,
      '2-5 years': 0,
      '5+ years': 0
    };

    patients.forEach(p => {
      if (!p.age) return;
      const lower = p.age.toLowerCase();
      if (lower.includes('month')) {
        const match = lower.match(/(\d+)\s*month/);
        if (match) {
          const months = parseInt(match[1]);
          if (months <= 6) ageGroups['0-6 months'] += 1;
          else ageGroups['6-12 months'] += 1;
          return;
        }
      }
      if (lower.includes('year')) {
        const match = lower.match(/(\d+)\s*year/);
        if (match) {
          const years = parseInt(match[1]);
          if (years < 1) ageGroups['0-6 months'] += 1;
          else if (years === 1) ageGroups['1-2 years'] += 1;
          else if (years >= 2 && years < 5) ageGroups['2-5 years'] += 1;
          else ageGroups['5+ years'] += 1;
          return;
        }
      }
      // Fallback
      ageGroups['2-5 years'] += 1;
    });

    return Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
  }, [patients]);

  // 4. Dynamic Calculations: Malnutrition Severity
  const severityData = React.useMemo(() => {
    const counts = { NORMAL: 0, MAM: 0, SAM: 0 };
    
    patients.forEach(p => {
      const status = p.currentStatus ? p.currentStatus.toUpperCase() : 'NORMAL';
      if (status === 'SAM') counts.SAM += 1;
      else if (status === 'MAM') counts.MAM += 1;
      else counts.NORMAL += 1;
    });

    return [
      { name: 'Normal', value: counts.NORMAL, color: '#10b981' },
      { name: 'Moderate (MAM)', value: counts.MAM, color: '#f97316' },
      { name: 'Severe (SAM)', value: counts.SAM, color: '#ef4444' }
    ].filter(entry => entry.value > 0 || patients.length === 0); 
    // Show all if dataset is completely empty to draw an empty state chart
  }, [patients]);

  // 5. Dynamic Calculations: Facility Performance
  const facilityPerformance = React.useMemo(() => {
    const performanceMap: Record<string, { facility: string; screenings: number; normal: number }> = {};

    // Seed all active facilities so they appear in performance even with 0 screenings
    facilities.forEach(f => {
      performanceMap[f.name] = { facility: f.name, screenings: 0, normal: 0 };
    });

    screenings.forEach(s => {
      const fName = s.facilityName || 'Unknown Facility';
      if (!performanceMap[fName]) {
        performanceMap[fName] = { facility: fName, screenings: 0, normal: 0 };
      }
      performanceMap[fName].screenings += 1;
      if (s.classification === 'NORMAL') {
        performanceMap[fName].normal += 1;
      }
    });

    return Object.values(performanceMap).map(item => ({
      facility: item.facility,
      screenings: item.screenings,
      rate: item.screenings > 0 ? Math.round((item.normal / item.screenings) * 100) : 0
    }));
  }, [screenings, facilities]);

  // 6. Dynamic Calculations: Referral Statistics
  const referralData = React.useMemo(() => {
    const monthlyMap: Record<string, { month: string; sent: number; completed: number; pending: number }> = {};
    
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonthIndex - i + 12) % 12;
      const mName = shortMonths[mIdx];
      monthlyMap[mName] = { month: mName, sent: 0, completed: 0, pending: 0 };
    }

    referrals.forEach(r => {
      const dateStr = r.referredDate || r.createdAt;
      const mName = getMonthName(dateStr);
      if (monthlyMap[mName]) {
        monthlyMap[mName].sent += 1;
        if (r.status.toUpperCase() === 'COMPLETED') {
          monthlyMap[mName].completed += 1;
        } else {
          monthlyMap[mName].pending += 1;
        }
      }
    });

    return Object.values(monthlyMap);
  }, [referrals]);

  const handleExportReport = () => {
    const exportData = {
      reportDate: new Date().toISOString(),
      summary: {
        totalScreenings: totalScreeningsCount,
        atRiskPatients: atRiskCount,
        activeReferrals: activeReferralsCount,
        successRate: `${successRatePercent}%`
      },
      screeningTrends,
      ageDistribution,
      severityData,
      facilityPerformance,
      referralData
    };
    
    downloadJSON(exportData, 'nutritrack-analytics-report');
    downloadCSV(facilityPerformance, 'facility-performance-metrics');
    
    toast.success('Analytics report exported successfully');
  };

  const handleGenerateReport = () => {
    toast.success('Refreshing analytics data...');
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-gray-600 font-medium animate-pulse">Loading analytics dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            System performance insights and operational metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={handleExportReport} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview Dashboard</SelectItem>
                  <SelectItem value="screening">Nutritional Screenings</SelectItem>
                  <SelectItem value="referrals">Patient Referrals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-gray-500 italic">
              Showing analytics calculated from {patients.length} patients and {screenings.length} screenings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Screenings</p>
                <p className="text-3xl font-extrabold mt-1 text-gray-900">{totalScreeningsCount.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  Total recorded evaluations
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600 bg-blue-50 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">At-Risk Patients (MAM/SAM)</p>
                <p className="text-3xl font-extrabold mt-1 text-orange-600">{atRiskCount.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  Based on active screenings
                </div>
              </div>
              <Users className="h-8 w-8 text-orange-600 bg-orange-50 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Referrals</p>
                <p className="text-3xl font-extrabold mt-1 text-purple-600">{activeReferralsCount.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  Pending doctor assessment
                </div>
              </div>
              <FileText className="h-8 w-8 text-purple-600 bg-purple-50 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Referral Success Rate</p>
                <p className="text-3xl font-extrabold mt-1 text-emerald-600">{successRatePercent}%</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  {completedReferralsCount} completed of {referrals.length} total
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-emerald-600 bg-emerald-50 p-1.5 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="trends">Screening Trends</TabsTrigger>
          <TabsTrigger value="distribution">Patient Distribution</TabsTrigger>
          <TabsTrigger value="facilities">Facility Performance</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Screening Trends Over Time</CardTitle>
              <CardDescription>Monthly screening activities and malnutrition classification frequency</CardDescription>
            </CardHeader>
            <CardContent>
              {screenings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Activity className="h-12 w-12 mb-2 stroke-1" />
                  <p className="text-sm font-medium">No screenings have been registered yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={screeningTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="screenings" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Total Screenings" />
                    <Area type="monotone" dataKey="malnourished" stackId="2" stroke="#f97316" fill="#f97316" name="Malnourished (MAM + SAM)" />
                    <Area type="monotone" dataKey="severe" stackId="2" stroke="#ef4444" fill="#ef4444" name="Severe Cases (SAM)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Patient Age Distribution</CardTitle>
                <CardDescription>Breakdown by registered patient age groups</CardDescription>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <Users className="h-12 w-12 mb-2 stroke-1" />
                    <p className="text-sm font-medium">No patients found in the system.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Malnutrition Severity Breakdown</CardTitle>
                <CardDescription>Current patient health classification status</CardDescription>
              </CardHeader>
              <CardContent>
                {patients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <PieChartIcon className="h-12 w-12 mb-2 stroke-1" />
                    <p className="text-sm font-medium">No severity stats to display.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Facility Performance Metrics</CardTitle>
              <CardDescription>Screening volume and healthy percentage rates by health center</CardDescription>
            </CardHeader>
            <CardContent>
              {facilities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Activity className="h-12 w-12 mb-2 stroke-1" />
                  <p className="text-sm font-medium">No health facilities registered in the system.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={facilityPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="facility" />
                    <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" label={{ value: 'Screenings Count', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#10b981" label={{ value: 'Healthy Rate %', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="screenings" fill="#3b82f6" name="Total Screenings" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="rate" fill="#10b981" name="Healthy Rate %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Referral Management Trends</CardTitle>
              <CardDescription>Monthly sent referrals compared against completed and pending actions</CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <FileText className="h-12 w-12 mb-2 stroke-1" />
                  <p className="text-sm font-medium">No patient referrals found in the system.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={referralData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2.5} name="Total Sent" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
                    <Line type="monotone" dataKey="pending" stroke="#f97316" strokeWidth={2} name="Pending Action" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary / Templates section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Analytical Reports</CardTitle>
            <CardDescription>Export and save configured summaries based on current metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start hover:bg-gray-50" onClick={handleExportReport}>
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Download Full Analytical Audit (JSON)
            </Button>
            <Button variant="outline" className="w-full justify-start hover:bg-gray-50" onClick={() => downloadCSV(facilityPerformance, 'facility-performance')}>
              <Activity className="h-4 w-4 mr-2 text-emerald-600" />
              Download Health Facility Metrics (CSV)
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>System Entity Summary</CardTitle>
            <CardDescription>Total record counts across all active modules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-semibold text-gray-700">Patients:</span>
                <span>{patients.length} rows</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-semibold text-gray-700">Screenings:</span>
                <span>{screenings.length} rows</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-semibold text-gray-700">Referrals:</span>
                <span>{referrals.length} rows</span>
              </div>
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-semibold text-gray-700">Facilities:</span>
                <span>{facilities.length} rows</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};