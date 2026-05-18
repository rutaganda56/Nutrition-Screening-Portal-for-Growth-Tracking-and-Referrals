import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { 
  Activity, 
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calculator,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { screeningsApi, ScreeningResponse } from '@/services/api';

interface ScreeningResult {
  wfh: string; // Weight-for-Height Z-score
  muac: string; // Mid-Upper Arm Circumference
  edema: boolean;
  classification: 'Normal' | 'MAM' | 'SAM';
  recommendation: string;
}

export const NutritionScreening = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('new');
  const [patientId, setPatientId] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [muac, setMuac] = useState('');
  const [edema, setEdema] = useState('no');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<ScreeningResult | null>(null);
  
  const [screenings, setScreenings] = useState<ScreeningResponse[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const fetchRecentScreenings = () => {
    setLoadingRecent(true);
    screeningsApi.getAll()
      .then((data) => {
        setScreenings(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load recent screenings');
      })
      .finally(() => {
        setLoadingRecent(false);
      });
  };

  useEffect(() => {
    if (activeTab === 'recent') {
      fetchRecentScreenings();
    }
  }, [activeTab]);

  const calculateScreening = () => {
    if (!weight || !height || !muac || !patientId) {
      toast.error('Please enter patient ID and all measurements');
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const muacNum = parseFloat(muac);
    const hasEdema = edema === 'yes';

    // Simplified WHO classification logic
    let classification: 'Normal' | 'MAM' | 'SAM' = 'Normal';
    let recommendation = '';
    let wfhZScore = '';

    const wfhRatio = (weightNum / heightNum) * 100;
    
    if (hasEdema || muacNum < 11.5) {
      classification = 'SAM';
      recommendation = 'Immediate referral to therapeutic feeding program. Requires urgent medical attention.';
    } else if (muacNum >= 11.5 && muacNum < 12.5) {
      classification = 'MAM';
      recommendation = 'Enroll in supplementary feeding program. Schedule follow-up in 2 weeks.';
    } else {
      classification = 'Normal';
      recommendation = 'Continue regular monitoring. Next screening in 3 months.';
    }

    if (wfhRatio < 70) {
      wfhZScore = '< -3 SD';
    } else if (wfhRatio < 80) {
      wfhZScore = '-2 to -3 SD';
    } else {
      wfhZScore = '≥ -2 SD';
    }

    setResult({
      wfh: wfhZScore,
      muac: `${muacNum} cm`,
      edema: hasEdema,
      classification,
      recommendation
    });

    toast.success('Screening calculation complete');
  };

  const saveScreening = () => {
    if (!result) {
      toast.error('Please complete the screening first');
      return;
    }

    const payload = {
      patientId: Number(patientId),
      weightKg: parseFloat(weight),
      heightCm: parseFloat(height),
      muacCm: parseFloat(muac),
      appetite: 'GOOD',
      observationNotes: notes,
      screeningDate: new Date().toISOString().split('T')[0]
    };

    screeningsApi.create(payload, Number(user?.id))
      .then(() => {
        toast.success('Screening saved successfully to database!');
        // Reset form
        setPatientId('');
        setWeight('');
        setHeight('');
        setMuac('');
        setEdema('no');
        setNotes('');
        setResult(null);
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Failed to save screening: ${err.message}`);
      });
  };

  const getClassificationColor = (classification: string | null) => {
    const c = classification || 'NORMAL';
    switch (c.toUpperCase()) {
      case 'SAM':
      case 'SEVERE':
        return 'destructive';
      case 'MAM':
      case 'MODERATE':
        return 'default';
      case 'NORMAL':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nutrition Screening</h1>
        <p className="text-gray-600 mt-1">WHO-standard malnutrition assessment and classification</p>
      </div>

      {/* WHO Guidelines Reference */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900">WHO Classification Guidelines</h3>
              <div className="text-sm text-blue-800 mt-2 space-y-1">
                <p><strong>SAM (Severe Acute Malnutrition):</strong> MUAC {'<'} 11.5cm OR WHZ {'<'} -3 SD OR Bilateral pitting edema</p>
                <p><strong>MAM (Moderate Acute Malnutrition):</strong> MUAC 11.5-12.5cm OR WHZ -2 to -3 SD</p>
                <p><strong>Normal:</strong> MUAC ≥ 12.5cm AND WHZ ≥ -2 SD</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="new">
            <Plus className="h-4 w-4 mr-2" />
            New Screening
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Activity className="h-4 w-4 mr-2" />
            Recent Screenings
          </TabsTrigger>
        </TabsList>

        {/* New Screening Form */}
        <TabsContent value="new" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Screening Form */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Information & Measurements</CardTitle>
                <CardDescription>Enter anthropometric measurements for screening</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientId">Patient Database ID</Label>
                  <Input
                    id="patientId"
                    placeholder="e.g. 1"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="9.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder="82.0"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="muac">MUAC - Mid-Upper Arm Circumference (cm)</Label>
                  <Input
                    id="muac"
                    type="number"
                    step="0.1"
                    placeholder="11.5"
                    value={muac}
                    onChange={(e) => setMuac(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edema">Bilateral Pitting Edema</Label>
                  <Select value={edema} onValueChange={setEdema}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Clinical Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional observations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={calculateScreening}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Classification
                </Button>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Screening Results</CardTitle>
                <CardDescription>WHO-based nutritional classification</CardDescription>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Complete measurements to see results</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Classification Badge */}
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Classification</p>
                      <Badge 
                        variant={getClassificationColor(result.classification)}
                        className="text-lg px-4 py-2"
                      >
                        {result.classification === 'SAM' && 'Severe Acute Malnutrition'}
                        {result.classification === 'MAM' && 'Moderate Acute Malnutrition'}
                        {result.classification === 'Normal' && 'Normal Nutritional Status'}
                      </Badge>
                    </div>

                    {/* Indicators */}
                    <div className="space-y-3">
                      <h4 className="font-semibold">Anthropometric Indicators</h4>
                      
                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Weight-for-Height Z-score</span>
                          <span className="font-semibold">{result.wfh}</span>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">MUAC</span>
                          <span className="font-semibold">{result.muac}</span>
                        </div>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Bilateral Pitting Edema</span>
                          <span className="font-semibold">{result.edema ? 'Present' : 'Absent'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className={`p-4 rounded-lg ${
                      result.classification === 'SAM' ? 'bg-red-50 border border-red-200' :
                      result.classification === 'MAM' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-green-50 border border-green-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {result.classification === 'Normal' ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                        ) : (
                          <AlertTriangle className={`h-5 w-5 mt-1 ${
                            result.classification === 'SAM' ? 'text-red-600' : 'text-yellow-600'
                          }`} />
                        )}
                        <div>
                          <h4 className="font-semibold mb-1">Clinical Recommendation</h4>
                          <p className="text-sm">{result.recommendation}</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={saveScreening}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Save Screening Record
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Screenings */}
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Screening Records</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecent ? (
                <div className="text-center py-10 text-gray-500">Loading screening logs...</div>
              ) : (
                <div className="space-y-3">
                  {screenings.map((screening) => (
                    <div key={screening.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">{screening.patientName || `Patient ID: ${screening.patientId}`}</span>
                            {getClassificationBadge(screening.classification)}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Weight: {screening.weightKg} kg • Height: {screening.heightCm} cm • MUAC: {screening.muacCm} cm
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{new Date(screening.screeningDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {screenings.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No screening records found in the database.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};