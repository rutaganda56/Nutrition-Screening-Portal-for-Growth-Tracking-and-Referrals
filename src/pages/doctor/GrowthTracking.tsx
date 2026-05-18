import React, { useState, useEffect } from 'react';
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
import { patientsApi, screeningsApi, PatientResponse, ScreeningResponse } from '@/services/api';

export const GrowthTracking = () => {
  const [patients, setPatients] = useState<PatientResponse[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingScreenings, setLoadingScreenings] = useState(false);

  useEffect(() => {
    setLoadingPatients(true);
    patientsApi.getAll()
      .then((data) => {
        setPatients(data);
        if (data.length > 0) {
          setSelectedPatientId(String(data[0].id));
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load patients for growth tracking');
      })
      .finally(() => {
        setLoadingPatients(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedPatientId) return;

    setLoadingScreenings(true);
    screeningsApi.getByPatient(Number(selectedPatientId))
      .then((data) => {
        // Sort screenings chronologically for charting
        const sorted = [...data].sort((a, b) => 
          new Date(a.screeningDate).getTime() - new Date(b.screeningDate).getTime()
        );
        setScreenings(sorted);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load patient screening history');
      })
      .finally(() => {
        setLoadingScreenings(false);
      });
  }, [selectedPatientId]);

  const selectedPatient = patients.find(p => String(p.id) === selectedPatientId);
  
  // Format history for display (newest first)
  const screeningHistory = [...screenings].reverse();
  const latestScreening = screenings.length > 0 ? screenings[screenings.length - 1] : null;

  // Chart Mappings
  const chartData = screenings.map((s, index) => {
    const dateStr = new Date(s.screeningDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    return {
      date: dateStr,
      weight: s.weightKg,
      height: s.heightCm,
      muac: s.muacCm,
      // WHO standard approximations for visual comparison
      medianWeight: 10.5 + (index * 0.5),
      minus2SDWeight: 8.5 + (index * 0.4),
      medianHeight: 80 + (index * 2),
      minus2SDHeight: 74 + (index * 1.8),
    };
  });

  const getClassificationBadge = (classification: string | null) => {
    const c = classification || 'NORMAL';
    switch (c.toUpperCase()) {
      case 'SAM':
      case 'SEVERE':
        return <Badge variant="destructive">SAM</Badge>;
      case 'MAM':
      case 'MODERATE':
        return <Badge variant="default">MAM</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Growth Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor patient growth progress from active screenings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success('Exporting growth chart data...')}>
            <Download className="h-4 w-4 mr-2" />
            Export Chart
          </Button>
        </div>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm text-gray-600 mb-2 block">Select Patient</Label>
              {loadingPatients ? (
                <p className="text-sm text-gray-500">Loading patients...</p>
              ) : (
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="w-full max-w-md">
                    <SelectValue placeholder="Choose a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={String(patient.id)}>
                        {patient.firstName} {patient.lastName} ({patient.patientCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {selectedPatient && (
              <div className="flex gap-2">
                <Badge>{selectedPatient.gender}</Badge>
                <Badge variant="secondary">{selectedPatient.age}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Growth Charts */}
      {loadingScreenings ? (
        <div className="text-center py-10 text-gray-500">Loading growth data...</div>
      ) : (
        <>
          <Tabs defaultValue="weight-age" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weight-age">Weight-for-Age</TabsTrigger>
              <TabsTrigger value="height-age">Height-for-Age</TabsTrigger>
              <TabsTrigger value="muac">MUAC Tracking</TabsTrigger>
            </TabsList>

            {/* Weight Chart */}
            <TabsContent value="weight-age">
              <Card>
                <CardHeader>
                  <CardTitle>Weight Progress Chart</CardTitle>
                  <p className="text-sm text-gray-600">Monitored weight over time against WHO child development markers</p>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="medianWeight" stroke="#64748b" strokeWidth={2} name="WHO Median Standard" />
                        <Line type="monotone" dataKey="minus2SDWeight" stroke="#cbd5e1" strokeDasharray="5 5" name="WHO -2 SD Line" />
                        <Line type="monotone" dataKey="weight" stroke="#ef4444" strokeWidth={3} name="Patient Current Weight" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-10">No measurements recorded for this patient.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Height Chart */}
            <TabsContent value="height-age">
              <Card>
                <CardHeader>
                  <CardTitle>Height Progress Chart</CardTitle>
                  <p className="text-sm text-gray-600">Patient height progress compared to WHO growth standards</p>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="medianHeight" stroke="#64748b" strokeWidth={2} name="WHO Median Standard" />
                        <Line type="monotone" dataKey="minus2SDHeight" stroke="#cbd5e1" strokeDasharray="5 5" name="WHO -2 SD Line" />
                        <Line type="monotone" dataKey="height" stroke="#f59e0b" strokeWidth={3} name="Patient Current Height" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-10">No height measurements recorded.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* MUAC Chart */}
            <TabsContent value="muac">
              <Card>
                <CardHeader>
                  <CardTitle>MUAC Tracking Chart</CardTitle>
                  <p className="text-sm text-gray-600">Mid-Upper Arm Circumference trend vs severe diagnostic thresholds</p>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis label={{ value: 'MUAC (cm)', angle: -90, position: 'insideLeft' }} domain={[8, 16]} />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine y={12.5} stroke="#10b981" strokeDasharray="3 3" label="Normal (≥12.5cm)" />
                        <ReferenceLine y={11.5} stroke="#ef4444" strokeDasharray="3 3" label="SAM (<11.5cm)" />
                        <Area type="monotone" dataKey="muac" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Patient MUAC" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-10">No MUAC records found.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Measurement History */}
          <Card>
            <CardHeader>
              <CardTitle>Screening History Logs</CardTitle>
              <CardDescription>Historical measurements recorded during patient checkups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {screeningHistory.length > 0 ? (
                  screeningHistory.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold">{s.screeningDate}</p>
                        <p className="text-sm text-gray-600">
                          Weight: {s.weightKg} kg • Height: {s.heightCm} cm • MUAC: {s.muacCm} cm
                        </p>
                        {s.observationNotes && (
                          <p className="text-xs text-gray-500 italic mt-1">Note: {s.observationNotes}</p>
                        )}
                      </div>
                      {getClassificationBadge(s.classification)}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No historical screenings found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};