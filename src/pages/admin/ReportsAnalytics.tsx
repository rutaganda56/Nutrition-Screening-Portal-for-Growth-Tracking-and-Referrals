import React, { useState } from 'react';
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
  Calendar, Filter, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { downloadCSV, downloadJSON } from '@/utils/exportUtils';

export const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');

  // Mock data for screening trends
  const screeningTrends = [
    { month: 'Jan', screenings: 245, malnourished: 42, severe: 12 },
    { month: 'Feb', screenings: 278, malnourished: 38, severe: 10 },
    { month: 'Mar', screenings: 312, malnourished: 45, severe: 15 },
    { month: 'Apr', screenings: 295, malnourished: 40, severe: 11 },
    { month: 'May', screenings: 334, malnourished: 48, severe: 14 },
    { month: 'Jun', screenings: 356, malnourished: 52, severe: 16 }
  ];

  // Patient age distribution
  const ageDistribution = [
    { name: '0-6 months', value: 234 },
    { name: '6-12 months', value: 312 },
    { name: '1-2 years', value: 456 },
    { name: '2-5 years', value: 523 },
    { name: '5+ years', value: 189 }
  ];

  // Malnutrition severity
  const severityData = [
    { name: 'Normal', value: 1456, color: '#10b981' },
    { name: 'Mild', value: 234, color: '#fbbf24' },
    { name: 'Moderate', value: 123, color: '#f97316' },
    { name: 'Severe', value: 67, color: '#ef4444' }
  ];

  // Facility performance
  const facilityPerformance = [
    { facility: 'Bon Berger', screenings: 456, rate: 95 },
    { facility: 'Kibagabaga', screenings: 389, rate: 92 },
    { facility: 'Kimironko', screenings: 312, rate: 88 },
    { facility: 'Remera', screenings: 267, rate: 85 },
    { facility: 'Others', screenings: 456, rate: 90 }
  ];

  // Referral statistics
  const referralData = [
    { month: 'Jan', sent: 45, completed: 38, pending: 7 },
    { month: 'Feb', sent: 52, completed: 44, pending: 8 },
    { month: 'Mar', sent: 48, completed: 41, pending: 7 },
    { month: 'Apr', sent: 56, completed: 48, pending: 8 },
    { month: 'May', sent: 61, completed: 53, pending: 8 },
    { month: 'Jun', sent: 58, completed: 50, pending: 8 }
  ];

  const handleExportReport = () => {
    // Prepare comprehensive data for export
    const exportData = {
      reportDate: new Date().toISOString(),
      dateRange: dateRange,
      reportType: reportType,
      summary: {
        totalScreenings: 1820,
        atRiskPatients: 265,
        activeReferrals: 78,
        successRate: '91%'
      },
      screeningTrends: screeningTrends,
      ageDistribution: ageDistribution,
      severityData: severityData,
      facilityPerformance: facilityPerformance,
      referralData: referralData
    };
    
    // Export as JSON
    downloadJSON(exportData, 'admin-comprehensive-report');
    
    // Also export facility performance as CSV
    downloadCSV(facilityPerformance, 'facility-performance');
    
    toast.success('Report exported successfully');
  };

  const handleGenerateReport = () => {
    toast.success('Generating custom report...');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive system insights and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateReport}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <Button onClick={handleExportReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="growth">Growth Tracking</SelectItem>
                <SelectItem value="referrals">Referrals</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Screenings</p>
                <p className="text-3xl font-bold mt-1">1,820</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+12.5%</span>
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">At-Risk Patients</p>
                <p className="text-3xl font-bold mt-1 text-orange-600">265</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">-5.2%</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Referrals</p>
                <p className="text-3xl font-bold mt-1">78</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600">+8.1%</span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold mt-1 text-green-600">91%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">+2.3%</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Screening Trends</TabsTrigger>
          <TabsTrigger value="distribution">Patient Distribution</TabsTrigger>
          <TabsTrigger value="facilities">Facility Performance</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Screening Trends Over Time</CardTitle>
              <CardDescription>Monthly screening activities and malnutrition cases</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={screeningTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="screenings" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Total Screenings" />
                  <Area type="monotone" dataKey="malnourished" stackId="2" stroke="#f97316" fill="#f97316" name="Malnourished" />
                  <Area type="monotone" dataKey="severe" stackId="2" stroke="#ef4444" fill="#ef4444" name="Severe Cases" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Patient Age Distribution</CardTitle>
                <CardDescription>Breakdown by age groups</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ageDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Malnutrition Severity</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="facilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Facility Performance Metrics</CardTitle>
              <CardDescription>Screening volume and success rates by facility</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={facilityPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="facility" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="screenings" fill="#3b82f6" name="Screenings" />
                  <Bar yAxisId="right" dataKey="rate" fill="#10b981" name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Management Statistics</CardTitle>
              <CardDescription>Monthly referral trends and completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={referralData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} name="Sent" />
                  <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="pending" stroke="#f97316" strokeWidth={2} name="Pending" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Reports</CardTitle>
            <CardDescription>Pre-configured report templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Generating monthly summary')}>
              <FileText className="h-4 w-4 mr-2" />
              Monthly Summary Report
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Generating nutrition analysis')}>
              <Activity className="h-4 w-4 mr-2" />
              Nutrition Status Analysis
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Generating facility report')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Facility Performance Report
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Generating compliance report')}>
              <PieChartIcon className="h-4 w-4 mr-2" />
              Program Compliance Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { event: 'Monthly report generated', time: '2 hours ago', type: 'success' },
                { event: '145 new screenings completed', time: '5 hours ago', type: 'info' },
                { event: '12 referrals pending review', time: '1 day ago', type: 'warning' },
                { event: 'System backup completed', time: '1 day ago', type: 'success' },
                { event: 'Weekly summary sent to stakeholders', time: '3 days ago', type: 'info' }
              ].map((item, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{item.event}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                  </div>
                  <Badge variant={item.type === 'success' ? 'secondary' : item.type === 'warning' ? 'default' : 'outline'}>
                    {item.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};