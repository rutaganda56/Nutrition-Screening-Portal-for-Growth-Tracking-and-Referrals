import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Label } from '@/app/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  Download,
  Plus,
  Lock,
  Info,
  Stethoscope,
  User
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { toast } from 'sonner';

interface Patient {
  id: string;
  name: string;
  age: string;
  gender: 'Male' | 'Female';
}

export const GrowthTracking = () => {
  const [selectedPatient, setSelectedPatient] = useState('P-1024');

  const patients: Patient[] = [
    { id: 'P-1024', name: 'Uwase Aline', age: '2y 4m', gender: 'Female' },
    { id: 'P-1089', name: 'Mugisha David', age: '1y 8m', gender: 'Male' },
    { id: 'P-1156', name: 'Imena Diane', age: '3y 2m', gender: 'Female' },
    { id: 'P-1242', name: 'Mutesi Divine', age: '2y 6m', gender: 'Female' }
  ];

  const selectedPatientData = patients.find(p => p.id === selectedPatient);
  
  // Latest CHW screening data (read-only)
  const latestCHWScreening = {
    date: '2026-02-04',
    conductedBy: 'CHW Mukamana Josiane',
    weight: '9.2 kg',
    height: '82.0 cm',
    muac: '10.8 cm',
    edema: false,
    classification: 'SAM'
  };

  // Weight-for-Age Data with WHO reference lines
  const weightData = [
    { age: '0m', weight: 3.2, median: 3.3, minus2SD: 2.8, plus2SD: 3.9 },
    { age: '3m', weight: 5.8, median: 6.0, minus2SD: 5.0, plus2SD: 7.2 },
    { age: '6m', weight: 7.2, median: 7.9, minus2SD: 6.4, plus2SD: 9.8 },
    { age: '9m', weight: 8.0, median: 8.9, minus2SD: 7.1, plus2SD: 11.0 },
    { age: '12m', weight: 8.5, median: 9.6, minus2SD: 7.7, plus2SD: 12.0 },
    { age: '15m', weight: 9.0, median: 10.3, minus2SD: 8.2, plus2SD: 12.8 },
    { age: '18m', weight: 9.3, median: 10.9, minus2SD: 8.6, plus2SD: 13.5 },
    { age: '21m', weight: 9.4, median: 11.5, minus2SD: 9.0, plus2SD: 14.3 },
    { age: '24m', weight: 9.5, median: 12.0, minus2SD: 9.4, plus2SD: 15.0 }
  ];

  // Height-for-Age Data
  const heightData = [
    { age: '0m', height: 49.0, median: 49.1, minus2SD: 46.1, plus2SD: 52.1 },
    { age: '3m', height: 59.5, median: 60.0, minus2SD: 56.7, plus2SD: 63.3 },
    { age: '6m', height: 65.0, median: 67.6, minus2SD: 63.8, plus2SD: 71.4 },
    { age: '9m', height: 70.0, median: 72.0, minus2SD: 67.7, plus2SD: 76.3 },
    { age: '12m', height: 74.0, median: 75.7, minus2SD: 71.0, plus2SD: 80.4 },
    { age: '15m', height: 77.0, median: 79.1, minus2SD: 74.0, plus2SD: 84.2 },
    { age: '18m', height: 79.5, median: 82.1, minus2SD: 76.7, plus2SD: 87.5 },
    { age: '21m', height: 81.0, median: 84.9, minus2SD: 79.2, plus2SD: 90.6 },
    { age: '24m', height: 82.0, median: 87.1, minus2SD: 81.3, plus2SD: 93.0 }
  ];

  // Weight-for-Height Data
  const wfhData = [
    { height: 65, weight: 6.5, median: 7.0, minus2SD: 6.0, plus2SD: 8.2 },
    { height: 70, weight: 7.8, median: 8.3, minus2SD: 7.1, plus2SD: 9.7 },
    { height: 75, weight: 8.5, median: 9.5, minus2SD: 8.1, plus2SD: 11.1 },
    { height: 80, weight: 9.2, median: 10.7, minus2SD: 9.2, plus2SD: 12.5 },
    { height: 85, weight: 9.5, median: 11.8, minus2SD: 10.1, plus2SD: 13.8 }
  ];

  // MUAC Measurements
  const muacData = [
    { date: 'Jan 2026', muac: 10.5, normal: 12.5, moderate: 11.5 },
    { date: 'Feb 2026', muac: 10.7, normal: 12.5, moderate: 11.5 },
    { date: 'Mar 2026', muac: 10.8, normal: 12.5, moderate: 11.5 },
    { date: 'Apr 2026', muac: 11.0, normal: 12.5, moderate: 11.5 },
    { date: 'May 2026', muac: 11.2, normal: 12.5, moderate: 11.5 },
    { date: 'Jun 2026', muac: 11.4, normal: 12.5, moderate: 11.5 }
  ];

  const growthIndicators = [
    {
      label: 'Weight Trend',
      value: '-15%',
      status: 'critical',
      icon: TrendingDown,
      description: 'Below -2 SD WHO standard'
    },
    {
      label: 'Height Trend',
      value: '-8%',
      status: 'warning',
      icon: TrendingDown,
      description: 'Approaching -2 SD threshold'
    },
    {
      label: 'MUAC Status',
      value: '11.4cm',
      status: 'critical',
      icon: Activity,
      description: 'Below 11.5cm threshold (SAM)'
    },
    {
      label: 'Last Measured',
      value: '2 days ago',
      status: 'normal',
      icon: Calendar,
      description: 'Regular monitoring ongoing'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'normal':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Growth Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor patient growth against WHO standards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('Exporting growth chart data...')}>
            <Download className="h-4 w-4 mr-2" />
            Export Chart
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success('Add measurement form opened')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Measurement
          </Button>
        </div>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm text-gray-600 mb-2 block">Select Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} ({patient.id}) - {patient.age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPatientData && (
              <div className="flex gap-2">
                <Badge>{selectedPatientData.gender}</Badge>
                <Badge variant="secondary">{selectedPatientData.age}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Growth Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {growthIndicators.map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <Card key={index} className={`border ${getStatusColor(indicator.status)}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">{indicator.label}</p>
                    <p className="text-2xl font-bold mb-1">{indicator.value}</p>
                    <p className="text-xs">{indicator.description}</p>
                  </div>
                  <Icon className="h-8 w-8 opacity-50" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Growth Charts */}
      <Tabs defaultValue="weight-age" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weight-age">Weight-for-Age</TabsTrigger>
          <TabsTrigger value="height-age">Height-for-Age</TabsTrigger>
          <TabsTrigger value="wfh">Weight-for-Height</TabsTrigger>
          <TabsTrigger value="muac">MUAC Tracking</TabsTrigger>
        </TabsList>

        {/* Weight-for-Age Chart */}
        <TabsContent value="weight-age">
          <Card>
            <CardHeader>
              <CardTitle>Weight-for-Age Growth Chart</CardTitle>
              <p className="text-sm text-gray-600">Compared to WHO Child Growth Standards</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="plus2SD" stroke="#cbd5e1" strokeDasharray="5 5" name="+2 SD" />
                  <Line type="monotone" dataKey="median" stroke="#64748b" strokeWidth={2} name="Median" />
                  <Line type="monotone" dataKey="minus2SD" stroke="#cbd5e1" strokeDasharray="5 5" name="-2 SD" />
                  <Line type="monotone" dataKey="weight" stroke="#ef4444" strokeWidth={3} name="Patient" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Alert:</strong> Patient weight is below -2 SD threshold. Immediate intervention recommended.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Height-for-Age Chart */}
        <TabsContent value="height-age">
          <Card>
            <CardHeader>
              <CardTitle>Height-for-Age Growth Chart</CardTitle>
              <p className="text-sm text-gray-600">Compared to WHO Child Growth Standards</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={heightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="plus2SD" stroke="#cbd5e1" strokeDasharray="5 5" name="+2 SD" />
                  <Line type="monotone" dataKey="median" stroke="#64748b" strokeWidth={2} name="Median" />
                  <Line type="monotone" dataKey="minus2SD" stroke="#cbd5e1" strokeDasharray="5 5" name="-2 SD" />
                  <Line type="monotone" dataKey="height" stroke="#f59e0b" strokeWidth={3} name="Patient" />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Height growth is slowing. Monitor for stunting indicators.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weight-for-Height Chart */}
        <TabsContent value="wfh">
          <Card>
            <CardHeader>
              <CardTitle>Weight-for-Height Chart</CardTitle>
              <p className="text-sm text-gray-600">Assesses wasting and acute malnutrition</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={wfhData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="height" label={{ value: 'Height (cm)', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="plus2SD" stroke="#cbd5e1" strokeDasharray="5 5" name="+2 SD" />
                  <Line type="monotone" dataKey="median" stroke="#64748b" strokeWidth={2} name="Median" />
                  <Line type="monotone" dataKey="minus2SD" stroke="#cbd5e1" strokeDasharray="5 5" name="-2 SD" />
                  <Line type="monotone" dataKey="weight" stroke="#ef4444" strokeWidth={3} name="Patient" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MUAC Tracking Chart */}
        <TabsContent value="muac">
          <Card>
            <CardHeader>
              <CardTitle>MUAC Tracking Over Time</CardTitle>
              <p className="text-sm text-gray-600">Mid-Upper Arm Circumference measurements</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={muacData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'MUAC (cm)', angle: -90, position: 'insideLeft' }} domain={[10, 14]} />
                  <Tooltip />
                  <Legend />
                  <ReferenceLine y={12.5} stroke="#10b981" strokeDasharray="3 3" label="Normal (≥12.5cm)" />
                  <ReferenceLine y={11.5} stroke="#ef4444" strokeDasharray="3 3" label="SAM (<11.5cm)" />
                  <Area type="monotone" dataKey="muac" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Patient MUAC" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 font-medium">SAM</p>
                  <p className="text-sm text-red-800">{'<'} 11.5 cm</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-600 font-medium">MAM</p>
                  <p className="text-sm text-yellow-800">11.5 - 12.5 cm</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Normal</p>
                  <p className="text-sm text-green-800">≥ 12.5 cm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Measurement History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Measurements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { date: '2026-01-23', weight: '9.5 kg', height: '82 cm', muac: '11.4 cm', status: 'SAM' },
              { date: '2026-01-16', weight: '9.3 kg', height: '81.5 cm', muac: '11.2 cm', status: 'SAM' },
              { date: '2026-01-09', weight: '9.1 kg', height: '81 cm', muac: '11.0 cm', status: 'SAM' },
              { date: '2026-01-02', weight: '8.9 kg', height: '80.5 cm', muac: '10.8 cm', status: 'SAM' }
            ].map((measurement, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{measurement.date}</p>
                  <p className="text-sm text-gray-600">
                    Weight: {measurement.weight} • Height: {measurement.height} • MUAC: {measurement.muac}
                  </p>
                </div>
                <Badge variant="destructive">{measurement.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Latest CHW Screening Data */}
      <Card>
        <CardHeader>
          <CardTitle>Latest CHW Screening Data</CardTitle>
          <CardDescription>Read-only data from the latest Community Health Worker screening</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{latestCHWScreening.date}</p>
                <p className="text-sm text-gray-600">
                  Weight: {latestCHWScreening.weight} • Height: {latestCHWScreening.height} • MUAC: {latestCHWScreening.muac}
                </p>
              </div>
              <Badge variant="destructive">{latestCHWScreening.classification}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};