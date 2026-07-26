import { Patient, Visit, ClinicSettings, MedicineTemplate, User, Gender } from '../types';

const KEYS = {
  PATIENTS: 'mediscript_patients',
  VISITS: 'mediscript_visits',
  SETTINGS: 'mediscript_settings',
  MED_TEMPLATES: 'mediscript_med_templates',
  USER: 'mediscript_user' // Simple auth persistence
};

// Initial Data Seeding
const seedData = () => {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    const defaultSettings: ClinicSettings = {
      name: "City Care Clinic",
      address: "123 Health Blvd, Wellness City, ST 12345",
      phone: "(555) 123-4567",
      doctorName: "Dr. Alex Smith",
      specialization: "General Physician",
      licenseNumber: "MD-987654",
      footerText: "Get well soon! Please bring this prescription for your next visit."
    };
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }
  if (!localStorage.getItem(KEYS.MED_TEMPLATES)) {
    const defaults: MedicineTemplate[] = [
      { id: '1', name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' },
      { id: '2', name: 'Amoxicillin', dosage: '250mg', frequency: 'Thrice daily', duration: '7 days', instructions: 'Complete course' },
      { id: '3', name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '5 days', instructions: 'At night' },
    ];
    localStorage.setItem(KEYS.MED_TEMPLATES, JSON.stringify(defaults));
  }
};

seedData();

export const storageService = {
  // Auth
  login: (username: string): User => {
    const user = { id: 'user-1', username, name: 'Doctor' };
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
    return user;
  },
  logout: () => {
    localStorage.removeItem(KEYS.USER);
  },
  getUser: (): User | null => {
    const u = localStorage.getItem(KEYS.USER);
    return u ? JSON.parse(u) : null;
  },

  // Patients
  getPatients: (): Patient[] => {
    const data = localStorage.getItem(KEYS.PATIENTS);
    return data ? JSON.parse(data) : [];
  },
  savePatient: (patient: Patient) => {
    const patients = storageService.getPatients();
    const existingIndex = patients.findIndex(p => p.id === patient.id);
    if (existingIndex >= 0) {
      patients[existingIndex] = patient;
    } else {
      patients.push(patient);
    }
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
  },
  deletePatient: (id: string) => {
    const patients = storageService.getPatients().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
    // Cascade delete visits
    const visits = storageService.getVisits().filter(v => v.patientId !== id);
    localStorage.setItem(KEYS.VISITS, JSON.stringify(visits));
  },

  // Visits
  getVisits: (): Visit[] => {
    const data = localStorage.getItem(KEYS.VISITS);
    return data ? JSON.parse(data) : [];
  },
  getVisitsByPatient: (patientId: string): Visit[] => {
    return storageService.getVisits().filter(v => v.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  saveVisit: (visit: Visit) => {
    const visits = storageService.getVisits();
    const existingIndex = visits.findIndex(v => v.id === visit.id);
    if (existingIndex >= 0) {
      visits[existingIndex] = visit;
    } else {
      visits.push(visit);
    }
    localStorage.setItem(KEYS.VISITS, JSON.stringify(visits));
  },

  // Settings
  getSettings: (): ClinicSettings => {
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || '{}');
  },
  saveSettings: (settings: ClinicSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Templates
  getTemplates: (): MedicineTemplate[] => {
    return JSON.parse(localStorage.getItem(KEYS.MED_TEMPLATES) || '[]');
  },
  saveTemplate: (template: MedicineTemplate) => {
    const list = storageService.getTemplates();
    const idx = list.findIndex(t => t.id === template.id);
    if (idx >= 0) list[idx] = template;
    else list.push(template);
    localStorage.setItem(KEYS.MED_TEMPLATES, JSON.stringify(list));
  },
  deleteTemplate: (id: string) => {
    const list = storageService.getTemplates().filter(t => t.id !== id);
    localStorage.setItem(KEYS.MED_TEMPLATES, JSON.stringify(list));
  }
};