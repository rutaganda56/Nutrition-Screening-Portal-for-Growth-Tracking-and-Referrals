import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PeopleIcon from "@mui/icons-material/People";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { toast } from 'sonner';
import { ExportDropdown } from '@/app/components/ui/ExportDropdown';
import { downloadCSV, downloadJSON } from '@/utils/exportUtils';
import { generateProfessionalExcelReport } from '@/utils/excelExportUtils';
import { 
  patientsApi, 
  screeningsApi, 
  facilitiesApi, 
  referralsApi,
  usersApi,
  serviceRequestsApi,
  PatientResponse,
  ScreeningResponse,
  ReferralResponse,
  FacilityResponse,
  UserResponse,
  ServiceRequestResponse
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
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestResponse[]>([]);

  useEffect(() => {
    Promise.all([
      patientsApi.getAll().catch(() => []),
      screeningsApi.getAll().catch(() => []),
      referralsApi.getAll().catch(() => []),
      facilitiesApi.getAll().catch(() => []),
      usersApi.getAll().catch(() => []),
      serviceRequestsApi.getAll().catch(() => [])
    ])
      .then(([p, s, r, f, u, sr]) => {
        setPatients(p);
        setScreenings(s);
        setReferrals(r);
        setFacilities(f);
        setUsers(u);
        setServiceRequests(sr);
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
        const cls = s.classification?.toUpperCase();
        if (cls === 'MAM' || cls === 'SAM') {
          monthlyMap[mName].malnourished += 1;
        }
        if (cls === 'SAM') {
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
      if (s.classification?.toUpperCase() === 'NORMAL') {
        performanceMap[fName].normal += 1;
      }
    });

    return Object.values(performanceMap).map(item => ({
      facility: item.facility,
      screenings: item.screenings,
      rate: item.screenings > 0 ? Math.round((item.normal / item.screenings) * 100) : 0
    }));
  }, [screenings, facilities]);

  // 6. Dynamic Calculations: Service Requests (Referrals) by Facility
  const serviceRequestData = React.useMemo(() => {
    const dataMap: Record<string, { facility: string; pending: number; resolved: number; total: number }> = {};
    
    // Seed all active facilities
    facilities.forEach(f => {
      dataMap[f.name] = { facility: f.name, pending: 0, resolved: 0, total: 0 };
    });

    serviceRequests.forEach(req => {
      // Find the facility of the CHW who submitted it
      const chw = users.find(u => u.fullName === req.submittedByName);
      // Fallback to finding by patient's facility
      const patient = patients.find(p => p.id === req.patientId);
      const fName = chw?.facilityName || patient?.facilityName || 'Unknown Facility';
      
      if (!dataMap[fName]) {
        dataMap[fName] = { facility: fName, pending: 0, resolved: 0, total: 0 };
      }
      
      dataMap[fName].total += 1;
      if (req.status.toUpperCase() === 'PENDING') {
        dataMap[fName].pending += 1;
      } else {
        dataMap[fName].resolved += 1;
      }
    });

    return Object.values(dataMap);
  }, [serviceRequests, facilities, users, patients]);

  const handleExportReport = async () => {
    toast.info('Generating professional Excel report...', { duration: 2000 });
    
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
      serviceRequestData
    };
    
    try {
      await generateProfessionalExcelReport(exportData, 'NutriTrack_Analytics_Report');
      toast.success('Analytics report exported successfully');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate Excel report');
    }
  };

  const handleGenerateReport = () => {
    toast.success('Refreshing analytics data...');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-48 rounded-md" />
              <Skeleton className="h-10 w-48 rounded-md" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[350px] w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div id="reports-analytics" className="p-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            System performance insights and operational metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateReport}>
            <DescriptionIcon className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <ExportDropdown 
            data={facilityPerformance}
            filename="NutriTrack_Analytics_Report"
            pdfElementId="reports-analytics"
            onCustomExcelExport={handleExportReport}
            buttonClassName="bg-green-600 hover:bg-green-700 text-white shadow-sm"
          />
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
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Screenings</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 tracking-tight">{totalScreeningsCount.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
                  Total recorded evaluations
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 group-hover:scale-110 transition-transform">
                <StarBorderIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">At-Risk Patients (MAM/SAM)</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 tracking-tight">{atRiskCount.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
                  Based on active screenings
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 group-hover:scale-110 transition-transform">
                <PeopleIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Referrals</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 tracking-tight">{activeReferralsCount.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
                  Pending doctor assessment
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 group-hover:scale-110 transition-transform">
                <DescriptionIcon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 bg-white group">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Referral Success Rate</p>
                <p className="text-3xl font-bold mt-1 text-gray-900 tracking-tight">{successRatePercent}%</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 font-medium">
                  {completedReferralsCount} completed of {referrals.length} total
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-green-50 text-green-600 group-hover:scale-110 transition-transform">
                <BarChartIcon className="h-6 w-6" />
              </div>
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
                  <StarBorderIcon className="h-12 w-12 mb-2 stroke-1" />
                  <p className="text-sm font-medium">No screenings have been registered yet.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={screeningTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMalnourished" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSevere" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="screenings" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" name="Total Screenings" />
                    <Area type="monotone" dataKey="malnourished" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorMalnourished)" name="Malnourished (MAM + SAM)" />
                    <Area type="monotone" dataKey="severe" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorSevere)" name="Severe Cases (SAM)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Patient Age Distribution</CardTitle>
              <CardDescription>Breakdown by registered patient age groups</CardDescription>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <PeopleIcon className="h-12 w-12 mb-2 stroke-1" />
                  <p className="text-sm font-medium">No patients found in the system.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={ageDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
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
                  <StarBorderIcon className="h-12 w-12 mb-2 stroke-1" />
                  <p className="text-sm font-medium">No health facilities registered in the system.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={facilityPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="facility" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                    <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dx={-10} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#10b981', fontSize: 12 }} dx={10} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar yAxisId="left" dataKey="screenings" fill="#3b82f6" name="Total Screenings" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar yAxisId="right" dataKey="rate" fill="#10b981" name="Healthy Rate %" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>CHW Service Requests by Facility</CardTitle>
              <CardDescription>Volume of patient service requests sent from CHWs to Doctors grouped by Health Facility</CardDescription>
            </CardHeader>
            <CardContent>
              {serviceRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <DescriptionIcon className="h-12 w-12 mb-2 stroke-1" />
                  <p className="text-sm font-medium">No service requests found in the system.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart data={serviceRequestData} margin={{ top: 20, right: 10, left: -20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="facility" 
                      angle={-45} 
                      textAnchor="end"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending Requests" maxBarSize={40} />
                    <Bar dataKey="resolved" stackId="a" fill="#10b981" name="Resolved/Completed" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
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
            <p className="text-sm text-gray-500 mb-4">
              Use the main Export button at the top of the page to download a complete PDF, CSV, or formatted Excel report of the current analytics dashboard.
            </p>
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
                <span className="font-semibold text-gray-700">Service Requests:</span>
                <span>{serviceRequests.length} rows</span>
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

