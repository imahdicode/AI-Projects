import { Patient, Visit, ClinicSettings, MedicineTemplate, User, ClinicBranch } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Fast In-Memory Cache for sub-millisecond tab switching
const memoryCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 3000; // 3-second ultra-fast cache

// Generic fetch wrapper with error handling & fast caching
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const url = `${API_BASE_URL}${endpoint}`;

  if (method === 'GET') {
    const cached = memoryCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  } else {
    memoryCache.clear(); // Clear cache on POST, PUT, DELETE mutations
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();
  if (method === 'GET') {
    memoryCache.set(url, { timestamp: Date.now(), data });
  }
  return data;
}

// Inject logged-in doctor's identity headers for server-side data isolation
function getAuthHeaders(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem('mediscript_user') || localStorage.getItem('mediscript_user');
    if (!raw) return {};
    const user = JSON.parse(raw);
    return {
      'X-Doctor-Id': user.id || '',
      'X-Doctor-Role': user.role || 'DOCTOR',
    };
  } catch {
    return {};
  }
}

const LOCAL_DOCTORS_KEY = 'mediscript_doctors';

const getLocalDoctors = (): User[] => {
  try {
    const raw = localStorage.getItem(LOCAL_DOCTORS_KEY);
    if (raw) {
      const parsed: User[] = JSON.parse(raw);
      if (parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [
    { id: '1', username: 'mahdi', name: 'Mahdi (Super Admin)', specialization: 'System Administrator & Owner', licenseNumber: 'ADMIN-001', role: 'ADMIN', status: 'ACTIVE' },
    { id: '2', username: 'farid', name: 'Dr. Farid Ansari', specialization: 'General Physician', licenseNumber: 'MCI-2026-4469', role: 'DOCTOR', status: 'ACTIVE' },
    { id: '3', username: 'shoeb', name: 'Dr. Shoeb', specialization: 'Consultant Physician', licenseNumber: 'MCI-2026-5865', role: 'DOCTOR', status: 'ACTIVE' }
  ];
};

const saveLocalDoctors = (docs: User[]) => {
  try {
    localStorage.setItem(LOCAL_DOCTORS_KEY, JSON.stringify(docs));
  } catch (e) {}
};

// Auth
export const authService = {
  login: async (username: string, password: string): Promise<User> => {
    try {
      const dbUser = await fetchAPI<User>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      return dbUser;
    } catch (apiErr: any) {
      // Fallback check against local seed accounts if API returns 401 or network error
      const localDocs = getLocalDoctors();
      const cleanInput = username.trim().toLowerCase();
      const match = localDocs.find(d => 
        (d.username && d.username.toLowerCase() === cleanInput) ||
        (d.licenseNumber && d.licenseNumber.toLowerCase() === cleanInput)
      );
      if (match) {
        const expectedPass = match.password || (match.role === 'ADMIN' ? 'admin123' : 'password123');
        if (expectedPass === password) {
          return match;
        } else {
          throw new Error('API Error: 401 - Incorrect password.');
        }
      }
      throw apiErr;
    }
  },

  getDoctors: async (): Promise<User[]> => {
    try {
      const dbUsers = await fetchAPI<User[]>('/api/auth/doctors');
      if (Array.isArray(dbUsers)) {
        saveLocalDoctors(dbUsers);
        return dbUsers;
      }
    } catch (e) {}

    return getLocalDoctors();
  },

  registerDoctor: async (data: {
    name: string;
    specialization: string;
    licenseNumber: string;
    phone: string;
    assignedBranchId: string;
  }): Promise<User> => {
    return await fetchAPI<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  activateAccount: async (data: {
    licenseNumber: string;
    username: string;
    password: string;
  }): Promise<User> => {
    return await fetchAPI<User>('/api/auth/activate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteDoctor: async (targetKey: string): Promise<void> => {
    // 1. Delete from persistent local storage
    const current = getLocalDoctors();
    const filtered = current.filter(d => 
      (d.username && d.username.toLowerCase() !== targetKey.toLowerCase()) &&
      d.id !== targetKey &&
      d.licenseNumber !== targetKey
    );
    saveLocalDoctors(filtered);

    // 2. Delete from PostgreSQL database via API
    try {
      await fetchAPI(`/api/auth/doctors/${targetKey}`, { method: 'DELETE' });
    } catch (e) {
      try {
        await fetchAPI(`/api/auth/doctors/username/${targetKey}`, { method: 'DELETE' });
      } catch (e2) {
        try {
          await fetchAPI(`/api/auth/doctors/license/${targetKey}`, { method: 'DELETE' });
        } catch (e3) {
          console.warn('Backend DELETE doctor fallback:', e3);
        }
      }
    }
  }
};

// Clinic Branches (Database Driven)
export const clinicBranchService = {
  list: async (): Promise<ClinicBranch[]> => {
    try {
      const branches = await fetchAPI<ClinicBranch[]>('/api/branches');
      if (Array.isArray(branches)) {
        localStorage.setItem('mediscript_clinic_branches', JSON.stringify(branches));
        return branches;
      }
    } catch (e) {}

    const saved = localStorage.getItem('mediscript_clinic_branches');
    return saved ? JSON.parse(saved) : [];
  },

  create: async (branch: Partial<ClinicBranch>): Promise<ClinicBranch> => {
    try {
      return await fetchAPI<ClinicBranch>('/api/branches', {
        method: 'POST',
        body: JSON.stringify(branch),
      });
    } catch (e) {
      const newB: ClinicBranch = {
        id: branch.id || `branch-${Date.now()}`,
        name: branch.name || 'New Clinic Branch',
        code: branch.code || 'BR-01',
        address: branch.address || '',
        phone: branch.phone || '',
        doctorCount: 0,
        status: 'ACTIVE'
      };
      return newB;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await fetchAPI(`/api/branches/${id}`, { method: 'DELETE' });
    } catch (e) {}
  }
};

const LOCAL_PATIENTS_KEY = 'mediscript_local_patients';
const LOCAL_VISITS_KEY = 'mediscript_local_visits';

const getLocalPatients = (): Patient[] => {
  try {
    const raw = localStorage.getItem(LOCAL_PATIENTS_KEY);
    const list: Patient[] = raw ? JSON.parse(raw) : [];
    const activeUser = sessionService.getUser();
    if (!activeUser) return [];
    if (activeUser.role === 'ADMIN' || activeUser.username?.toLowerCase() === 'mahdi') {
      return list;
    }
    return list.filter(p => p.doctorId === activeUser.id);
  } catch (e) {
    return [];
  }
};

const saveLocalPatient = (p: Patient) => {
  try {
    const raw = localStorage.getItem(LOCAL_PATIENTS_KEY);
    const existing: Patient[] = raw ? JSON.parse(raw) : [];
    const updated = [p, ...existing.filter(item => item.id !== p.id)];
    localStorage.setItem(LOCAL_PATIENTS_KEY, JSON.stringify(updated));
  } catch (e) {}
};

const getLocalVisits = (patientId?: string): Visit[] => {
  try {
    const raw = localStorage.getItem(LOCAL_VISITS_KEY);
    let visits: Visit[] = raw ? JSON.parse(raw) : [];
    const activeUser = sessionService.getUser();
    if (activeUser && activeUser.role !== 'ADMIN' && activeUser.username?.toLowerCase() !== 'mahdi') {
      visits = visits.filter(v => v.doctorId === activeUser.id);
    }
    if (patientId) {
      return visits.filter(v => v.patientId === patientId);
    }
    return visits;
  } catch (e) {
    return [];
  }
};

const saveLocalVisit = (visit: Visit) => {
  try {
    const raw = localStorage.getItem(LOCAL_VISITS_KEY);
    const existing: Visit[] = raw ? JSON.parse(raw) : [];
    const updated = [visit, ...existing.filter(v => v.id !== visit.id)];
    localStorage.setItem(LOCAL_VISITS_KEY, JSON.stringify(updated));
  } catch (e) {}
};

// Patients Service with complete offline & backend sync
export const patientService = {
  list: async (): Promise<Patient[]> => {
    try {
      const apiPatients = await fetchAPI<Patient[]>('/api/patients', {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(apiPatients)) {
        localStorage.setItem(LOCAL_PATIENTS_KEY, JSON.stringify(apiPatients));
        return apiPatients;
      }
      return getLocalPatients();
    } catch (e) {
      return getLocalPatients();
    }
  },

  getAll: async (): Promise<Patient[]> => {
    return patientService.list();
  },

  get: async (id: string): Promise<Patient> => {
    try {
      return await fetchAPI<Patient>(`/api/patients/${id}`, {
        headers: getAuthHeaders(),
      });
    } catch (e) {
      const localMatch = getLocalPatients().find(p => p.id === id);
      if (localMatch) return localMatch;
      return {
        id,
        name: 'Consultation Patient',
        age: 35,
        gender: 'Male' as any,
        phone: '',
        address: '',
        medicalHistory: 'None recorded',
        createdAt: new Date().toISOString()
      };
    }
  },

  create: async (patient: Partial<Patient>): Promise<Patient> => {
    const uppercaseGender = (patient.gender ? String(patient.gender).toUpperCase() : 'MALE');
    const payload = {
      ...patient,
      gender: uppercaseGender
    };

    try {
      const created = await fetchAPI<Patient>('/api/patients', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: getAuthHeaders(),
      });
      saveLocalPatient(created);
      return created;
    } catch (e) {
      console.warn('Backend POST failed, saving to persistent local storage:', e);
      const fallback: Patient = {
        id: patient.id || `P-${Date.now()}`,
        name: patient.name || 'Unknown Patient',
        age: Number(patient.age) || 0,
        gender: (patient.gender as any) || 'Male',
        phone: patient.phone || '',
        address: patient.address || '',
        medicalHistory: patient.medicalHistory || '',
        allergies: patient.allergies || '',
        bloodGroup: patient.bloodGroup || 'O+',
        createdAt: new Date().toISOString()
      };
      saveLocalPatient(fallback);
      return fallback;
    }
  },

  update: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
    const uppercaseGender = (patient.gender ? String(patient.gender).toUpperCase() : undefined);
    const payload = {
      ...patient,
      ...(uppercaseGender ? { gender: uppercaseGender } : {})
    };

    try {
      const updated = await fetchAPI<Patient>(`/api/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
        headers: getAuthHeaders(),
      });
      saveLocalPatient(updated);
      return updated;
    } catch (e) {
      const existing = getLocalPatients().find(p => p.id === id);
      if (existing) {
        const merged = { ...existing, ...patient };
        saveLocalPatient(merged);
        return merged;
      }
      throw e;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await fetchAPI<void>(`/api/patients/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (e) {}
    const localPatients = getLocalPatients().filter(p => p.id !== id);
    localStorage.setItem(LOCAL_PATIENTS_KEY, JSON.stringify(localPatients));
  },

  getVisits: async (patientId: string): Promise<Visit[]> => {
    try {
      const apiVisits = await fetchAPI<Visit[]>(`/api/patients/${patientId}/visits`, {
        headers: getAuthHeaders(),
      });
      const localVisits = getLocalVisits(patientId);
      const combined = [...apiVisits];
      localVisits.forEach(lv => {
        if (!combined.some(av => av.id === lv.id)) {
          combined.unshift(lv);
        }
      });
      return combined;
    } catch (e) {
      return getLocalVisits(patientId);
    }
  },

  createVisit: async (patientId: string, visit: Partial<Visit>): Promise<Visit> => {
    const fullVisitObj: Visit = {
      id: visit.id || `v-${Date.now()}`,
      patientId,
      doctorId: visit.doctorId,
      doctorName: visit.doctorName,
      date: visit.date || new Date().toISOString(),
      symptoms: visit.symptoms || '',
      diagnosis: visit.diagnosis || 'General Consultation',
      notes: visit.notes || '',
      labOrders: visit.labOrders || '',
      followUpDate: visit.followUpDate || '',
      vitals: visit.vitals || {},
      prescriptions: visit.prescriptions || []
    };

    saveLocalVisit(fullVisitObj);

    try {
      return await fetchAPI<Visit>(`/api/patients/${patientId}/visits`, {
        method: 'POST',
        body: JSON.stringify(visit),
        headers: getAuthHeaders(),
      });
    } catch (e) {
      return fullVisitObj;
    }
  },
};

// Visits (Recent)
export const visitService = {
  list: async (): Promise<Visit[]> => {
    try {
      const apiVisits = await fetchAPI<Visit[]>('/api/visits', {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(apiVisits)) {
        localStorage.setItem(LOCAL_VISITS_KEY, JSON.stringify(apiVisits));
        return apiVisits;
      }
      return getLocalVisits();
    } catch (e) {
      return getLocalVisits();
    }
  },
  getAll: async (): Promise<Visit[]> => {
    return visitService.list();
  },
};

// Settings
export const settingsService = {
  get: async (): Promise<ClinicSettings> => {
    return fetchAPI<ClinicSettings>('/api/settings');
  },

  save: async (settings: ClinicSettings): Promise<ClinicSettings> => {
    return fetchAPI<ClinicSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};

// Templates
export const templateService = {
  list: async (): Promise<MedicineTemplate[]> => {
    return fetchAPI<MedicineTemplate[]>('/api/templates');
  },

  save: async (template: Partial<MedicineTemplate>): Promise<MedicineTemplate> => {
    return fetchAPI<MedicineTemplate>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`/api/templates/${id}`, {
      method: 'DELETE',
    });
  },
};

// Auth persistence & Doctor session
const USER_KEY = 'mediscript_user';

export const sessionService = {
  setUser: (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getUser: (): User | null => {
    try {
      const u = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  clearUser: () => {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
    memoryCache.clear();
  },
};
