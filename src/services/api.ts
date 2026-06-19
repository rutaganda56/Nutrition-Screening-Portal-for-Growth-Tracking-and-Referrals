const BASE_URL = '/api';

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  department?: string;
  facilityId?: number;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  facilityName: string;
  facilityId: number | null;
  createdAt: string;
}

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const { headers: optionHeaders, ...restOptions } = options;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(optionHeaders instanceof Headers
        ? Object.fromEntries(optionHeaders.entries())
        : optionHeaders ?? {}),
    },
    ...restOptions,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = typeof data === 'object' && data !== null ? Object.values(data).join(', ') : 'Request failed';
    throw new Error(message as string);
  }

  return data as T;
}

const ROLE_TO_API: Record<string, string> = {
  doctor: 'DOCTOR',
  communityhealthworker: 'COMMUNITY_HEALTH_WORKER',
  administrator: 'ADMINISTRATOR',
};

const ROLE_FROM_API: Record<string, string> = {
  DOCTOR: 'doctor',
  COMMUNITY_HEALTH_WORKER: 'communityhealthworker',
  ADMINISTRATOR: 'administrator',
};

export const authApi = {
  login: (email: string, password: string, role: string) =>
    request<UserResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role: ROLE_TO_API[role] ?? role }),
    }),

  register: (payload: RegisterPayload) =>
    request<UserResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...payload, role: ROLE_TO_API[payload.role] ?? payload.role }),
    }),

  toFrontendRole: (apiRole: string): string => ROLE_FROM_API[apiRole] ?? apiRole,
};

export interface PatientResponse {
  id: number;
  patientCode: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  age: string;
  gender: string;
  currentStatus: string;
  lastScreeningDate: string | null;
  totalScreenings: number;
  facilityName: string | null;
  guardianFirstName: string;
  guardianLastName: string;
  guardianPhone: string;
  registeredByName?: string;
  createdAt?: string;
}

export interface ScreeningResponse {
  id: number;
  screeningCode: string;
  patientId: number;
  patientName: string;
  screeningDate: string;
  weightKg: number;
  heightCm: number;
  muacCm: number;
  classification: string;
  recommendation: string;
  conductedByName: string;
  facilityName: string;
  observationNotes: string;
}

export interface ServiceRequestResponse {
  id: number;
  requestCode: string;
  patientId: number;
  patientName: string;
  patientAge: string;
  priority: string;
  status: string;
  reasonCode: string;
  description: string;
  submittedByName: string;
  assignedToName: string | null;
  screeningCode: string;
  classification: string;
  weightKg: number;
  heightCm: number;
  muacCm: number;
  submittedAt: string;
}

export interface PatientRegisterPayload {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianRelationship: string;
  guardianPhone: string;
  notes?: string;
}

export const patientsApi = {
  getAll: () => request<PatientResponse[]>('/patients', { method: 'GET' }),
  getByStatus: (status: string) => request<PatientResponse[]>(`/patients/status/${status}`, { method: 'GET' }),
  getById: (id: number) => request<PatientResponse>(`/patients/${id}`, { method: 'GET' }),
  register: (payload: PatientRegisterPayload, registeredBy: number) =>
    request<PatientResponse>(`/patients?registeredBy=${registeredBy}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export interface ScreeningCreatePayload {
  patientId: number;
  weightKg: number;
  heightCm: number;
  muacCm: number;
  appetite?: string;
  observationNotes?: string;
  screeningDate: string;
}

export const screeningsApi = {
  getAll: () => request<ScreeningResponse[]>('/screenings', { method: 'GET' }),
  getByPatient: (patientId: number) => request<ScreeningResponse[]>(`/screenings/patient/${patientId}`, { method: 'GET' }),
  create: (payload: ScreeningCreatePayload, conductedBy: number) =>
    request<ScreeningResponse>(`/screenings?conductedBy=${conductedBy}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export interface AlertResponse {
  id: number;
  alertCode: string;
  alertType: string;
  patientId: number;
  patientName: string;
  message: string;
  status: string;
  dueDate: string | null;
  assignedToName: string | null;
  createdAt: string;
  actionType?: string;
}

export interface AlertCreatePayload {
  patientId: number | null;
  assignedToId: number;
  alertType: string;
  message: string;
  dueDate?: string;
}

export const alertsApi = {
  getAll: () => request<AlertResponse[]>('/alerts', { method: 'GET' }),
  getByUser: (userId: number) => request<AlertResponse[]>(`/alerts/user/${userId}`, { method: 'GET' }),
  updateStatus: (id: number, status: string) => request<AlertResponse>(`/alerts/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' }),
  create: (payload: AlertCreatePayload) => 
    request<AlertResponse>('/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export interface ServiceRequestCreatePayload {
  patientId: number;
  screeningId: number;
  priority: string;
  reasonCode: string;
  description: string;
  assignedToId: number | null;
}

export const serviceRequestsApi = {
  getAll: () => request<ServiceRequestResponse[]>('/service-requests', { method: 'GET' }),
  getByStatus: (status: string) => request<ServiceRequestResponse[]>(`/service-requests/status/${status}`, { method: 'GET' }),
  getById: (id: number) => request<ServiceRequestResponse>(`/service-requests/${id}`, { method: 'GET' }),
  updateStatus: (id: number, status: string) => request<ServiceRequestResponse>(`/service-requests/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' }),
  create: (payload: ServiceRequestCreatePayload, submittedBy: number) =>
    request<ServiceRequestResponse>(`/service-requests?submittedBy=${submittedBy}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export interface FacilityResponse {
  id: number;
  name: string;
  type: string;
  status: string;
  location: string;
  phone: string;
  email: string;
  staff: number;
  capacity: number;
  services: string;
}

export interface UserCreatePayload {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  facilityId?: number;
  status?: string; // used to pass temp password
}

export const usersApi = {
  getAll: () => request<UserResponse[]>('/users', { method: 'GET' }),
  create: (payload: UserCreatePayload) =>
    request<UserResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: UserCreatePayload) =>
    request<UserResponse>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  toggleStatus: (id: number) =>
    request<UserResponse>(`/users/${id}/toggle-status`, { method: 'PATCH' }),
  delete: (id: number) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
  changePassword: (id: number, currentPassword: string, newPassword: string) =>
    request<UserResponse>(`/users/${id}/change-password?currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`, { method: 'PATCH' }),
};

export const facilitiesApi = {
  getAll: () => request<FacilityResponse[]>('/facilities', { method: 'GET' }),
  create: (payload: Omit<FacilityResponse, 'id' | 'status'>) =>
    request<FacilityResponse>('/facilities', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: number, payload: Omit<FacilityResponse, 'id' | 'status'>) =>
    request<FacilityResponse>(`/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  toggleStatus: (id: number) =>
    request<FacilityResponse>(`/facilities/${id}/toggle-status`, { method: 'PATCH' }),
  delete: (id: number) =>
    request<void>(`/facilities/${id}`, { method: 'DELETE' }),
};

export interface ReferralResponse {
  id: number;
  referralCode: string;
  patientId: number;
  patientName: string;
  patientAge: string;
  referredTo: string;
  priority: string;
  urgency: string;
  diagnosis: string;
  referralReason: string;
  transportArranged: boolean;
  status: string;
  referredDate: string;
  followUpDate: string;
  referredByName: string;
  createdAt: string;
}

export interface ReferralCreatePayload {
  patientId: number;
  serviceRequestId: number | null;
  referredTo: string;
  priority: string;
  urgency: string;
  diagnosis: string;
  referralReason: string;
  transportArranged: boolean;
  followUpDate: string;
}

export const referralsApi = {
  getAll: () => request<ReferralResponse[]>('/referrals', { method: 'GET' }),
  create: (payload: ReferralCreatePayload, referredBy: number) =>
    request<ReferralResponse>(`/referrals?referredBy=${referredBy}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export interface NutritionOrderCreatePayload {
  patientId: number;
  screeningId?: number | null;
  serviceRequestId?: number | null;
  orderType: string;
  supplement?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions: string;
  startDate: string;
  endDate: string;
}

export interface NutritionOrderResponse {
  id: number;
  patientId: number;
  serviceRequestId: number | null;
  screeningId: number | null;
  orderType: string;
  supplement: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  startDate: string;
  endDate: string;
  status: string;
  prescribedByName: string;
  createdAt: string;
}

export const nutritionOrdersApi = {
  create: (payload: NutritionOrderCreatePayload, prescribedBy: number) =>
    request<NutritionOrderResponse>(`/nutrition-orders?prescribedBy=${prescribedBy}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getByPatient: (patientId: number) =>
    request<NutritionOrderResponse[]>(`/nutrition-orders/patient/${patientId}`, { method: 'GET' }),
};

export interface ClinicalAssessmentCreatePayload {
  serviceRequestId: number;
  patientId: number;
  diagnosis: string;
  severity: string;
  complications?: string;
  clinicalNotes: string;
}

export interface ClinicalAssessmentResponse {
  id: number;
  serviceRequestId: number;
  patientId: number;
  diagnosis: string;
  severity: string;
  complications: string;
  clinicalNotes: string;
  assessedByName: string;
  createdAt: string;
}

export const clinicalAssessmentsApi = {
  create: (payload: ClinicalAssessmentCreatePayload, assessedBy: number) =>
    request<ClinicalAssessmentResponse>(`/clinical-assessments?assessedBy=${assessedBy}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getByPatient: (patientId: number) =>
    request<ClinicalAssessmentResponse[]>(`/clinical-assessments/patient/${patientId}`, { method: 'GET' }),
};
