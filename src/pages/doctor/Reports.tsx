import React, { useState } from 'react';
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
  LineChart,
  Line,
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

export const Reports = () => {
  const [dateRange, setDateRange] = useState('6months');
  const [reportType, setReportType] = useState('overview');

  // Sample data
  const screeningTrends = [
    { month: 'Jan', normal: 120, moderate: 30, severe: 10 },
    { month: 'Feb', normal: 135, moderate: 28, severe: 8 },
    { month: 'Mar', normal: 140, moderate: 25, severe: 12 },
    { month: 'Apr', normal: 150, moderate: 32, severe: 9 },
    { month: 'May', normal: 155, moderate: 27, severe: 11 },
    { month: 'Jun', normal: 165, moderate: 22, severe: 7 }
  ];

  const statusDistribution = [
    { name: 'Normal', value: 75, color: '#10b981' },
    { name: 'MAM', value: 18, color: '#f59e0b' },
    { name: 'SAM', value: 7, color: '#ef4444' }
  ];

  const ageDistribution = [
    { age: '0-6m', count: 45 },
    { age: '6-12m', count: 78 },
    { age: '12-24m', count: 124 },
    { age: '24-36m', count: 98 },
    { age: '36-60m', count: 85 }
  ];

  const outcomeData = [
    { month: 'Jan', cured: 25, defaulted: 3, death: 0 },
    { month: 'Feb', cured: 28, defaulted: 2, death: 1 },
    { month: 'Mar', cured: 32, defaulted: 4, death: 0 },
    { month: 'Apr', cured: 30, defaulted: 3, death: 0 },
    { month: 'May', cured: 35, defaulted: 2, death: 0 },
    { month: 'Jun', cured: 38, defaulted: 1, death: 0 }
  ];

  const performanceMetrics = [
    { label: 'Total Patients Screened', value: '1,247', change: '+12%', trend: 'up' },
    { label: 'SAM Cases Detected', value: '87', change: '-5%', trend: 'down' },
    { label: 'MAM Cases Detected', value: '156', change: '+8%', trend: 'up' },
    { label: 'Successful Referrals', value: '94%', change: '+2%', trend: 'up' },
    { label: 'Treatment Success Rate', value: '89%', change: '+4%', trend: 'up' },
    { label: 'Default Rate', value: '3.2%', change: '-1%', trend: 'down' }
  ];

  const handleExportReport = () => {
    // Prepare comprehensive data for export
    const exportData = {
      reportDate: new Date().toISOString(),
      dateRange: dateRange,
      reportType: reportType,
      summary: {
        totalPatientsScreened: 1247,
        samCases: 87,
        mamCases: 156,
        normalCases: 935,
        successfulReferrals: '94%',
        treatmentSuccessRate: '89%',
        defaultRate: '3.2%'
      },
      screeningTrends: screeningTrends,
      statusDistribution: statusDistribution,
      ageDistribution: ageDistribution,
      outcomeData: outcomeData,
      performanceMetrics: performanceMetrics.map(m => ({
        metric: m.label,
        value: m.value,
        change: m.change,
        trend: m.trend
      }))
    };
    
    // Export as JSON
    downloadJSON(exportData, 'doctor-nutrition-report');
    
    // Also export summary as CSV
    const csvData = performanceMetrics.map(m => ({
      Metric: m.label,
      Value: m.value,
      Change: m.change,
      Trend: m.trend
    }));
    downloadCSV(csvData, 'doctor-performance-metrics');
    
    toast.success('Report exported successfully');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive nutrition program performance metrics</p>
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
                  <SelectItem value="outcomes">Treatment Outcomes</SelectItem>
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
                  <SelectItem value="1month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="1year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
                  <p className="text-3xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`h-4 w-4 ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`} />
                    <span className={`text-sm ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500">vs last period</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Screening Trends</TabsTrigger>
          <TabsTrigger value="distribution">Status Distribution</TabsTrigger>
          <TabsTrigger value="age">Age Groups</TabsTrigger>
          <TabsTrigger value="outcomes">Treatment Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Screening Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={screeningTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="normal" stackId="a" fill="#10b981" name="Normal" />
                  <Bar dataKey="moderate" stackId="a" fill="#f59e0b" name="MAM" />
                  <Bar dataKey="severe" stackId="a" fill="#ef4444" name="SAM" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

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
                      <span className="font-medium text-green-900">Normal</span>
                      <span className="text-2xl font-bold text-green-700">75%</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">935 out of 1,247 patients</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-yellow-900">MAM</span>
                      <span className="text-2xl font-bold text-yellow-700">18%</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">225 patients require intervention</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-red-900">SAM</span>
                      <span className="text-2xl font-bold text-red-700">7%</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">87 patients need urgent care</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="age">
          <Card>
            <CardHeader>
              <CardTitle>Patient Distribution by Age Group</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Number of Patients" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={outcomeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cured" stroke="#10b981" strokeWidth={2} name="Cured" />
                  <Line type="monotone" dataKey="defaulted" stroke="#f59e0b" strokeWidth={2} name="Defaulted" />
                  <Line type="monotone" dataKey="death" stroke="#ef4444" strokeWidth={2} name="Death" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Cure Rate</p>
                  <p className="text-2xl font-bold text-green-700">89%</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600 font-medium">Default Rate</p>
                  <p className="text-2xl font-bold text-yellow-700">3.2%</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">Death Rate</p>
                  <p className="text-2xl font-bold text-red-700">0.8%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span>Monthly Summary</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span>Patient Roster</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2">
              <Activity className="h-6 w-6" />
              <span>Screening Log</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};