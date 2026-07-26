export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other'
}

export interface ClinicSettings {
  name: string;
  address: string;
  phone: string;
  doctorName: string;
  specialization: string;
  licenseNumber: string;
  footerText: string;
}

export interface MedicineTemplate {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  category?: string;
}

export interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  price?: number;
}

export interface Vitals {
  bp?: string;
  weight?: string;
  height?: string;
  temp?: string;
  pulse?: string;
  spo2?: string;
  bmi?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  date: string; // ISO date string
  symptoms: string;
  diagnosis: string;
  notes: string;
  labOrders?: string;
  followUpDate?: string;
  prescriptions: PrescriptionItem[];
  vitals?: Vitals;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  address: string;
  medicalHistory: string;
  allergies?: string;
  bloodGroup?: string;
  doctorId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  username?: string; // Optional — not set until doctor activates their account
  password?: string;
  name: string;
  specialization?: string;
  licenseNumber?: string;
  phone?: string;
  role?: 'ADMIN' | 'DOCTOR' | 'COMPOUNDER' | 'RECEPTIONIST';
  assignedBranchId?: string;
  status?: 'PENDING' | 'ACTIVE'; // PENDING = awaiting first login, ACTIVE = fully set up
}

export interface ClinicBranch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  doctorCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface QueueItem {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED';
  registeredAt: string;
  tokenNumber: number;
  doctorId?: string;
  vitals?: Vitals;
}

export interface InventoryItem {
  id: string;
  name: string;
  stockQuantity: number;
  unitPrice: number;
  category: string;
  expiryDate: string;
  batchNumber: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayVisits: number;
  totalVisits: number;
  totalPrescriptions: number;
}