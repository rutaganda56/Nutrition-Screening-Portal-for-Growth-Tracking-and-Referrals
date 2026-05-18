const BASE_URL = 'http://localhost:8080/api';

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  department?: string;
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
  createdAt: string;
}

async function request<T>(endpoint: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const message = typeof data === 'object' ? Object.values(data).join(', ') : 'Request failed';
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

export interface AlertResponse {
  id: number;
  alertCode: string;
  alertType: string;
  patientId: number;
  patientName: string;
  message: string;
  status: string;
  dueDate: string | null;
  assignedToName: string;
  createdAt: string;
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
  assignedToName: string;
  classification: string;
  muacCm: number;
  edema: boolean;
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

export const alertsApi = {
  getAll: () => request<AlertResponse[]>('/alerts', { method: 'GET' }),
  getByDoctor: (doctorId: number) => request<AlertResponse[]>(`/alerts/doctor/${doctorId}`, { method: 'GET' }),
};

export const serviceRequestsApi = {
  getAll: () => request<ServiceRequestResponse[]>('/service-requests', { method: 'GET' }),
  getByStatus: (status: string) => request<ServiceRequestResponse[]>(`/service-requests/status/${status}`, { method: 'GET' }),
};

export const usersApi = {
  getAll: () => request<UserResponse[]>('/users', { method: 'GET' }),
};

export const referralsApi = {
  getAll: () => request<unknown[]>('/referrals', { method: 'GET' }),
};
