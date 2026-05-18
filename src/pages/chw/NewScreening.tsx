import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Checkbox } from '@/app/components/ui/checkbox';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle, 
  Save, 
  Info, 
  Send, 
  Utensils,
  FileText,
  User,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { patientsApi, screeningsApi, usersApi, serviceRequestsApi, nutritionOrdersApi, PatientResponse } from '@/services/api';

export const NewScreening = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  
  const assignedHealthCenter = user?.facilityName || 'Polyclinique du Bon Berger';

  const [patientCodeInput, setPatientCodeInput] = useState('');
  const [loadedPatient, setLoadedPatient] = useState<PatientResponse | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    // Child Info
    patientSelect: '',
    childName: '',
    birthDate: '',
    gender: '',
    guardianName: '',
    guardianPhone: '',

    // Measurements
    weight: '',
    height: '',
    muac: '',

    // Notes
    observationNotes: ''
  });

  const [result, setResult] = useState<{
    classification: 'Normal' | 'MAM' | 'SAM';
    recommendation: string;
  } | null>(null);

  // Service Request fields (for severe cases)
  const [serviceRequest, setServiceRequest] = useState({
    enabled: false,
    priority: 'urgent',
    reasonCode: '',
    description: '',
    assignedDoctor: ''
  });

  // Nutrition Order fields
  const [nutritionOrder, setNutritionOrder] = useState({
    enabled: false,
    orderType: '',
    supplement: '',
    instructions: '',
    duration: ''
  });

  // Available doctors for service request assignment (dynamically fetched from DB and filtered by CHW facility)
  const [availableDoctors, setAvailableDoctors] = useState<{ id: string; name: string; specialty: string }[]>([]);

  React.useEffect(() => {
    usersApi.getAll()
      .then((allUsers) => {
        const chwFacilityId = user?.facilityId;
        const doctorsList = allUsers.filter(u => {
          const isDoctor = u.role === 'DOCTOR';
          if (!isDoctor) return false;
          if (chwFacilityId) {
            return u.facilityId === chwFacilityId;
          }
          return true;
        });

        const mapped = doctorsList.map(doc => ({
          id: String(doc.id),
          name: doc.fullName,
          specialty: doc.department || 'General Medicine'
        }));
        setAvailableDoctors(mapped);
      })
      .catch((err) => {
        console.error('Failed to load doctors from database:', err);
      });
  }, [user?.facilityId]);

  const handlePatientLookup = async () => {
    if (!patientCodeInput.trim()) {
      toast.error('Please enter a patient ID');
      return;
    }
    setIsLookingUp(true);
    try {
      const all = await patientsApi.getAll();
      const found = all.find(
        (p) => p.patientCode.toLowerCase() === patientCodeInput.trim().toLowerCase()
      );
      if (!found) {
        toast.error('No patient found with that ID');
        setLoadedPatient(null);
        return;
      }

      const resolvedAge = found.age && found.age.trim()
        ? found.age
        : found.birthDate
          ? computeAgeFromDate(found.birthDate)
          : 'Age unknown';

      setLoadedPatient({ ...found, age: resolvedAge });
      setPatientId(found.id);
      setFormData((prev) => ({
        ...prev,
        childName: `${found.firstName} ${found.lastName}`,
        birthDate: found.birthDate ?? '',
        gender: found.gender.toLowerCase(),
        guardianName: `${found.guardianFirstName} ${found.guardianLastName}`,
        guardianPhone: found.guardianPhone,
      }));
      toast.success(`Patient ${found.patientCode} loaded successfully`);
    } catch {
      toast.error('Failed to look up patient');
    } finally {
      setIsLookingUp(false);
    }
  };

  const computeAgeFromDate = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) { years--; months += 12; }
    return `${years}y ${months}m`;
  };

  const calculateClassification = () => {
    const muacNum = parseFloat(formData.muac);

    if (muacNum < 11.5) {
      return {
        classification: 'SAM' as const,
        recommendation: 'Urgent referral to Therapeutic Feeding Center required. Submit service request to doctor immediately.'
      };
    } else if (muacNum >= 11.5 && muacNum < 12.5) {
      return {
        classification: 'MAM' as const,
        recommendation: 'Moderate malnutrition detected. Create nutrition order and consider service request to doctor for follow-up.'
      };
    } else {
      return {
        classification: 'Normal' as const,
        recommendation: 'Normal nutritional status. Create preventive nutrition order to support healthy growth.'
      };
    }
  };

  const handleNext = () => {
    if (step === 2) {
      if (!formData.weight || !formData.height || !formData.muac) {
        toast.error('Please complete all measurements');
        return;
      }
      const classification = calculateClassification();
      setResult(classification);
      
      // Auto-enable service request for severe cases
      if (classification.classification === 'SAM') {
        setServiceRequest({
          enabled: true,
          priority: 'urgent',
          reasonCode: 'sam-detected',
          description: 'Severe Acute Malnutrition detected during community screening',
          assignedDoctor: ''
        });
      } else if (classification.classification === 'MAM') {
        setServiceRequest({
          enabled: false,
          priority: 'routine',
          reasonCode: 'mam-detected',
          description: 'Moderate Acute Malnutrition detected during community screening',
          assignedDoctor: ''
        });
      }
      
      // Auto-enable nutrition order
      setNutritionOrder({
        enabled: true,
        orderType: classification.classification === 'SAM' ? 'therapeutic' : 
                   classification.classification === 'MAM' ? 'supplementary' : 'preventive',
        supplement: '',
        instructions: '',
        duration: ''
      });
    }
    setStep(step + 1);
  };

  const handleSaveScreening = async () => {
    if (serviceRequest.enabled && !serviceRequest.description.trim()) {
      toast.error('Please provide a description for the service request');
      return;
    }
    if (nutritionOrder.enabled && (!nutritionOrder.orderType || !nutritionOrder.instructions.trim())) {
      toast.error('Please complete the nutrition order details');
      return;
    }
    if (!patientId) {
      toast.error('No patient selected. Please look up a patient first.');
      return;
    }

    try {
      const saved = await screeningsApi.create({
        patientId,
        weightKg: parseFloat(formData.weight),
        heightCm: parseFloat(formData.height),
        muacCm: parseFloat(formData.muac),
        observationNotes: formData.observationNotes,
        screeningDate: new Date().toISOString().split('T')[0],
      }, Number(user?.id));

      toast.success(`Screening ${saved.screeningCode} saved successfully!`);

      let createdServiceRequestId: number | null = null;

      if (serviceRequest.enabled) {
        try {
          const docId = serviceRequest.assignedDoctor ? Number(serviceRequest.assignedDoctor) : null;
          const sr = await serviceRequestsApi.create({
            patientId,
            screeningId: saved.id,
            priority: serviceRequest.priority.toUpperCase(),
            reasonCode: serviceRequest.reasonCode || 'sam-detected',
            description: serviceRequest.description,
            assignedToId: docId
          }, Number(user?.id));
          createdServiceRequestId = sr.id;
          toast.success('Service request submitted to doctor', {
            description: `Priority: ${serviceRequest.priority.toUpperCase()}`
          });
        } catch (srErr: any) {
          console.error(srErr);
          toast.error(`Screening saved, but failed to create service request: ${srErr.message}`);
        }
      }

      if (nutritionOrder.enabled) {
        try {
          const startDate = new Date().toISOString().split('T')[0];
          let days = 14;
          if (nutritionOrder.duration === '4-weeks') days = 28;
          else if (nutritionOrder.duration === '8-weeks') days = 56;
          else if (nutritionOrder.duration === '12-weeks') days = 84;
          
          const endDateObj = new Date();
          endDateObj.setDate(endDateObj.getDate() + days);
          const endDate = endDateObj.toISOString().split('T')[0];

          await nutritionOrdersApi.create({
            patientId,
            screeningId: saved.id,
            serviceRequestId: createdServiceRequestId,
            orderType: nutritionOrder.orderType.toUpperCase(),
            supplement: nutritionOrder.supplement || 'rutf',
            instructions: nutritionOrder.instructions,
            startDate,
            endDate,
            duration: nutritionOrder.duration || '2-weeks'
          }, Number(user?.id));
          toast.success('Nutrition order created', {
            description: `Type: ${nutritionOrder.orderType}`
          });
        } catch (noErr: any) {
          console.error(noErr);
          toast.error(`Screening saved, but failed to create nutrition order: ${noErr.message}`);
        }
      }
    } catch (error: any) {
      toast.error(error.message ?? 'Failed to save screening');
      return;
    }
    
    // Reset form
    setFormData({
      patientSelect: '',
      childName: '',
      birthDate: '',
      gender: '',
      guardianName: '',
      guardianPhone: '',
      weight: '',
      height: '',
      muac: '',
      observationNotes: ''
    });
    setResult(null);
    setLoadedPatient(null);
    setPatientId(null);
    setPatientCodeInput('');
    setServiceRequest({
      enabled: false,
      priority: 'urgent',
      reasonCode: '',
      description: '',
      assignedDoctor: ''
    });
    setNutritionOrder({
      enabled: false,
      orderType: '',
      supplement: '',
      instructions: '',
      duration: ''
    });
    setStep(1);
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'SAM':
        return 'destructive';
      case 'MAM':
        return 'default';
      case 'Normal':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Screening Form</h1>
        <p className="text-gray-600 mt-1">Record observations and create encounter for nutrition assessment</p>
      </div>

      {/* Health Center Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Assigned Health Center:</strong> {assignedHealthCenter}. You can only screen patients registered at your assigned health center. 
          The nutrition status classification is automatically calculated based on WHO standards (read-only).
        </AlertDescription>
      </Alert>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <p className="text-sm font-medium">Patient Info</p>
            </div>
            <div className={`h-1 flex-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 text-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <p className="text-sm font-medium">Measurements</p>
            </div>
            <div className={`h-1 flex-1 ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 text-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <p className="text-sm font-medium">Review & Actions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Patient Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Step 1: Patient Information
            </CardTitle>
            <CardDescription>Enter patient details for the encounter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Lookup */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
              <p className="text-sm font-medium text-blue-900">Look up an existing patient by their Patient ID</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. P-1"
                  value={patientCodeInput}
                  onChange={(e) => setPatientCodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePatientLookup()}
                  className="bg-white"
                />
                <Button
                  type="button"
                  onClick={handlePatientLookup}
                  disabled={isLookingUp}
                  className="bg-blue-600 hover:bg-blue-700 shrink-0"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isLookingUp ? 'Searching...' : 'Look Up'}
                </Button>
              </div>
              {loadedPatient && (
                <div className="flex items-center gap-2 text-sm text-green-700 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Patient found — fields auto-filled from database
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Child's Full Name *</Label>
                <Input
                  id="childName"
                  placeholder="Uwase Aline"
                  value={formData.childName}
                  onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                  readOnly={!!loadedPatient}
                  className={loadedPatient ? 'bg-gray-50' : ''}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">{loadedPatient ? 'Age' : 'Date of Birth *'}</Label>
                {loadedPatient ? (
                  <Input
                    id="birthDate"
                    value={loadedPatient.age}
                    readOnly
                    className="bg-gray-50"
                  />
                ) : (
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => !loadedPatient && setFormData({ ...formData, gender: v })}
                  disabled={!!loadedPatient}
                >
                  <SelectTrigger className={loadedPatient ? 'bg-gray-50' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianName">Guardian's Name</Label>
                <Input
                  id="guardianName"
                  placeholder="Mukamana Josiane"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  readOnly={!!loadedPatient}
                  className={loadedPatient ? 'bg-gray-50' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianPhone">Guardian's Phone</Label>
                <Input
                  id="guardianPhone"
                  placeholder="+250 788 123 456"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  readOnly={!!loadedPatient}
                  className={loadedPatient ? 'bg-gray-50' : ''}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
                Next Step
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Measurements */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Step 2: Record Observations
            </CardTitle>
            <CardDescription>Measure and record anthropometric data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="9.5"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height/Length (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="82.0"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="muac">MUAC - Mid-Upper Arm Circumference (cm) *</Label>
                <Input
                  id="muac"
                  type="number"
                  step="0.1"
                  placeholder="11.5"
                  value={formData.muac}
                  onChange={(e) => setFormData({ ...formData, muac: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500">
                  WHO Reference: SAM {'<'} 11.5cm | MAM 11.5-12.5cm | Normal ≥ 12.5cm
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observationNotes">Observation Notes</Label>
                <Textarea
                  id="observationNotes"
                  placeholder="Any additional observations about the patient's condition..."
                  value={formData.observationNotes}
                  onChange={(e) => setFormData({ ...formData, observationNotes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
                Calculate & Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Actions */}
      {step === 3 && result && (
        <div className="space-y-6">
          {/* Classification Result */}
          <Card>
            <CardHeader>
              <CardTitle>Nutritional Classification (Auto-Calculated - Read Only)</CardTitle>
              <CardDescription>Based on WHO standards for children under 5</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Nutritional Status</p>
                <Badge variant={getClassificationColor(result.classification)} className="text-lg px-4 py-2">
                  {result.classification === 'SAM' && 'Severe Acute Malnutrition (SAM)'}
                  {result.classification === 'MAM' && 'Moderate Acute Malnutrition (MAM)'}
                  {result.classification === 'Normal' && 'Normal Nutritional Status'}
                </Badge>
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
                    <h4 className="font-semibold mb-1">Recommended Action</h4>
                    <p className="text-sm">{result.recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-3">
                <h4 className="font-semibold">Observation Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 border rounded">
                    <p className="text-gray-500">Child Name</p>
                    <p className="font-medium">{formData.childName}</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="text-gray-500">Weight</p>
                    <p className="font-medium">{formData.weight} kg</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="text-gray-500">Height</p>
                    <p className="font-medium">{formData.height} cm</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="text-gray-500">MUAC</p>
                    <p className="font-medium">{formData.muac} cm</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Request (for severe cases) */}
          <Card className={result.classification !== 'Normal' ? 'border-2 border-blue-300' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Service Request to Doctor
                  </CardTitle>
                  <CardDescription>
                    {result.classification === 'SAM' 
                      ? 'Required for severe cases - Submit for immediate doctor review'
                      : result.classification === 'MAM'
                      ? 'Recommended - Request doctor consultation for treatment plan'
                      : 'Optional - Request doctor consultation if needed'}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="serviceRequestEnabled"
                    checked={serviceRequest.enabled}
                    onCheckedChange={(checked) => 
                      setServiceRequest({ ...serviceRequest, enabled: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="serviceRequestEnabled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Create Service Request
                  </label>
                </div>
              </div>
            </CardHeader>
            {serviceRequest.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select 
                      value={serviceRequest.priority} 
                      onValueChange={(v) => setServiceRequest({ ...serviceRequest, priority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent (SAM - Within 24hrs)</SelectItem>
                        <SelectItem value="routine">Routine (MAM - Within 1 week)</SelectItem>
                        <SelectItem value="asap">ASAP (Complications present)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reasonCode">Reason Code *</Label>
                    <Select 
                      value={serviceRequest.reasonCode} 
                      onValueChange={(v) => setServiceRequest({ ...serviceRequest, reasonCode: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sam-detected">SAM Detected</SelectItem>
                        <SelectItem value="mam-detected">MAM Detected</SelectItem>
                        <SelectItem value="rapid-deterioration">Rapid Deterioration</SelectItem>
                        <SelectItem value="complications">Medical Complications</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="serviceDescription">Description *</Label>
                    <Textarea
                      id="serviceDescription"
                      placeholder="Describe the case and why doctor consultation is needed..."
                      value={serviceRequest.description}
                      onChange={(e) => setServiceRequest({ ...serviceRequest, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="assignedDoctor">Assign to Doctor</Label>
                    <Select 
                      value={serviceRequest.assignedDoctor} 
                      onValueChange={(v) => setServiceRequest({ ...serviceRequest, assignedDoctor: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} ({doctor.specialty})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Nutrition Order */}
          <Card className="border-2 border-green-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5" />
                    Nutrition Order
                  </CardTitle>
                  <CardDescription>
                    Create nutrition intervention to support healthy growth and prevent malnutrition
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="nutritionOrderEnabled"
                    checked={nutritionOrder.enabled}
                    onCheckedChange={(checked) => 
                      setNutritionOrder({ ...nutritionOrder, enabled: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="nutritionOrderEnabled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Create Nutrition Order
                  </label>
                </div>
              </div>
            </CardHeader>
            {nutritionOrder.enabled && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderType">Order Type *</Label>
                    <Select 
                      value={nutritionOrder.orderType} 
                      onValueChange={(v) => setNutritionOrder({ ...nutritionOrder, orderType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="therapeutic">Therapeutic Feeding (SAM)</SelectItem>
                        <SelectItem value="supplementary">Supplementary Feeding (MAM)</SelectItem>
                        <SelectItem value="preventive">Preventive Nutrition (Normal)</SelectItem>
                        <SelectItem value="counseling">Nutrition Counseling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplement">Supplement/Product</Label>
                    <Select 
                      value={nutritionOrder.supplement} 
                      onValueChange={(v) => setNutritionOrder({ ...nutritionOrder, supplement: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rutf">RUTF (Ready-to-Use Therapeutic Food)</SelectItem>
                        <SelectItem value="rusf">RUSF (Ready-to-Use Supplementary Food)</SelectItem>
                        <SelectItem value="csb">CSB+ (Corn Soy Blend Plus)</SelectItem>
                        <SelectItem value="micronutrients">Micronutrient Powder</SelectItem>
                        <SelectItem value="fortified-porridge">Fortified Porridge</SelectItem>
                        <SelectItem value="none">None - Counseling Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select 
                      value={nutritionOrder.duration} 
                      onValueChange={(v) => setNutritionOrder({ ...nutritionOrder, duration: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2-weeks">2 weeks</SelectItem>
                        <SelectItem value="4-weeks">4 weeks (1 month)</SelectItem>
                        <SelectItem value="8-weeks">8 weeks (2 months)</SelectItem>
                        <SelectItem value="12-weeks">12 weeks (3 months)</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nutritionInstructions">Instructions for Guardian *</Label>
                    <Textarea
                      id="nutritionInstructions"
                      placeholder="Provide detailed feeding instructions, frequency, quantity, and follow-up schedule..."
                      value={nutritionOrder.instructions}
                      onChange={(e) => setNutritionOrder({ ...nutritionOrder, instructions: e.target.value })}
                      rows={4}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Include dosage, frequency, preparation method, and when to return for follow-up
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-2 justify-between pt-4">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back to Measurements
            </Button>
            <Button onClick={handleSaveScreening} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Screening & Submit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};