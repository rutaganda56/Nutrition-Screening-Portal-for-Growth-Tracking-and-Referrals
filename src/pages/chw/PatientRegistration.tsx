import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Users, Save, AlertCircle, MapPin, Phone, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { patientsApi } from '@/services/api';

interface FormErrors {
  [key: string]: string;
}

export const PatientRegistration = () => {
  const { user } = useAuth();
  
  // CHW is assigned to a specific health center
  const assignedHealthCenter = 'Polyclinique du Bon Berger';
  
  const [formData, setFormData] = useState({
    // Patient Basic Information
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    // Guardian Information
    guardianFirstName: '',
    guardianLastName: '',
    guardianRelationship: '',
    guardianPhone: '',
    // Health Center (automatically set to CHW's assigned center)
    healthCenter: assignedHealthCenter,
    
    // Additional Information
    notes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      // Validate age is under 5 years
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const ageInYears = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      if (ageInYears > 5) {
        newErrors.birthDate = 'Patient must be under 5 years old for nutrition screening';
      }
      if (birthDate > today) {
        newErrors.birthDate = 'Birth date cannot be in the future';
      }
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    // Guardian validations
    if (!formData.guardianFirstName.trim()) {
      newErrors.guardianFirstName = 'Guardian first name is required';
    }
    if (!formData.guardianLastName.trim()) {
      newErrors.guardianLastName = 'Guardian last name is required';
    }
    if (!formData.guardianRelationship) {
      newErrors.guardianRelationship = 'Relationship to child is required';
    }
    if (!formData.guardianPhone.trim()) {
      newErrors.guardianPhone = 'Guardian phone number is required';
    } else if (!/^[0-9+\-() ]+$/.test(formData.guardianPhone)) {
      newErrors.guardianPhone = 'Please enter a valid phone number';
    }
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await patientsApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        birthDate: formData.birthDate,
        gender: formData.gender,
        guardianFirstName: formData.guardianFirstName,
        guardianLastName: formData.guardianLastName,
        guardianRelationship: formData.guardianRelationship,
        guardianPhone: formData.guardianPhone,
        notes: formData.notes,
      }, Number(user?.id));

      toast.success(`Patient registered successfully! Patient ID: ${result.patientCode}`);

      setFormData({
        firstName: '',
        lastName: '',
        birthDate: '',
        gender: '',
        guardianFirstName: '',
        guardianLastName: '',
        guardianRelationship: '',
        guardianPhone: '',
        healthCenter: assignedHealthCenter,
        notes: ''
      });
      setErrors({});
    } catch (error: any) {
      toast.error(error.message ?? 'Failed to register patient. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
        <p className="text-gray-600 mt-1">Register new patients for nutrition screening and monitoring</p>
      </div>

      {/* Health Center Notice */}
      <Alert>
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Patients will be registered to your assigned health center: <strong>{assignedHealthCenter}</strong>
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patient Information
            </CardTitle>
            <CardDescription>Basic information about the child (under 5 years)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Uwase"
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Aline"
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.lastName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">
                  Date of Birth <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={errors.birthDate ? 'border-red-500' : ''}
                />
                {errors.birthDate && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.birthDate}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">
                  Gender <span className="text-red-600">*</span>
                </Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.gender}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Guardian Information
            </CardTitle>
            <CardDescription>Contact details for the child's primary caregiver</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guardianFirstName">
                  Guardian First Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="guardianFirstName"
                  value={formData.guardianFirstName}
                  onChange={(e) => handleInputChange('guardianFirstName', e.target.value)}
                  placeholder="Mukamana"
                  className={errors.guardianFirstName ? 'border-red-500' : ''}
                />
                {errors.guardianFirstName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.guardianFirstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianLastName">
                  Guardian Last Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="guardianLastName"
                  value={formData.guardianLastName}
                  onChange={(e) => handleInputChange('guardianLastName', e.target.value)}
                  placeholder="Josiane"
                  className={errors.guardianLastName ? 'border-red-500' : ''}
                />
                {errors.guardianLastName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.guardianLastName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianRelationship">
                  Relationship to Child <span className="text-red-600">*</span>
                </Label>
                <Select 
                  value={formData.guardianRelationship} 
                  onValueChange={(value) => handleInputChange('guardianRelationship', value)}
                >
                  <SelectTrigger className={errors.guardianRelationship ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="grandmother">Grandmother</SelectItem>
                    <SelectItem value="grandfather">Grandfather</SelectItem>
                    <SelectItem value="aunt">Aunt</SelectItem>
                    <SelectItem value="uncle">Uncle</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.guardianRelationship && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.guardianRelationship}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianPhone">
                Phone Number <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="guardianPhone"
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                  placeholder="+250 XXX XXX XXX"
                  className={errors.guardianPhone ? 'border-red-500' : ''}
                />
                {errors.guardianPhone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.guardianPhone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>Any relevant information about the patient</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes <span className="text-gray-500">(Optional)</span>
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Medical history, allergies, special circumstances..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                birthDate: '',
                gender: '',
                guardianFirstName: '',
                guardianLastName: '',
                guardianRelationship: '',
                guardianPhone: '',
                healthCenter: assignedHealthCenter,
                notes: ''
              });
              setErrors({});
            }}
            disabled={isSubmitting}
          >
            Clear Form
          </Button>
          <Button
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Registering Patient...' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </div>
  );
};