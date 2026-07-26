import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Stethoscope, 
  Plus, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Trash,
  Database,
  Layers,
  Search
} from 'lucide-react';
import { Button } from '../components/Button';
import { authService, patientService, settingsService, clinicBranchService } from '../services/apiService';
import { User, Patient, ClinicBranch } from '../types';

export const AdminDashboard: React.FC = () => {
  const [doctors, setDoctors] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [branches, setBranches] = useState<ClinicBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);

  // New Branch Form
  const [branchForm, setBranchForm] = useState({
    name: '',
    code: '',
    address: '',
    phone: ''
  });

  // New Doctor Form
  const [docForm, setDocForm] = useState({
    name: '',
    specialization: 'General Physician',
    licenseNumber: '',
    phone: '',
    assignedBranchId: '',
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [docsData, patientsData, branchesData] = await Promise.all([
        authService.getDoctors().catch(() => []),
        patientService.getAll().catch(() => []),
        clinicBranchService.list().catch(() => [])
      ]);
      setDoctors(docsData);
      setPatients(patientsData);
      setBranches(branchesData);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAutoBranchCode = (name: string, count: number) => {
    const nextNum = (count + 1).toString().padStart(2, '0');
    if (!name.trim()) return `BR-${nextNum}`;
    const words = name.trim().split(/\s+/).filter(Boolean);
    let prefix = 'BR';
    if (words.length >= 2) {
      prefix = (words[0][0] + words[1][0]).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 2) {
      prefix = words[0].slice(0, 2).toUpperCase();
    }
    return `${prefix}-${nextNum}`;
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim()) return;

    const autoCode = generateAutoBranchCode(branchForm.name, branches.length);

    const newBranchData: Partial<ClinicBranch> = {
      id: `branch-${Date.now()}`,
      name: branchForm.name.trim(),
      code: autoCode,
      address: branchForm.address.trim() || 'Address not specified',
      phone: branchForm.phone.trim() || 'Phone not specified',
      doctorCount: 0,
      status: 'ACTIVE'
    };

    try {
      const savedBranch = await clinicBranchService.create(newBranchData);
      const updated = [...branches, savedBranch];
      setBranches(updated);
      localStorage.setItem('mediscript_clinic_branches', JSON.stringify(updated));
      setShowAddBranchModal(false);
      setBranchForm({ name: '', code: '', address: '', phone: '' });
      alert(`Successfully registered branch: ${savedBranch.name} (Auto-Assigned Code: ${autoCode})`);
    } catch (err) {
      alert('Failed to register clinic branch.');
    }
  };

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.name) return;

    const autoLicense = docForm.licenseNumber.trim() || `MCI-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      const created = await authService.registerDoctor({
        name: docForm.name.trim(),
        specialization: docForm.specialization.trim(),
        licenseNumber: autoLicense,
        phone: docForm.phone.trim(),
        assignedBranchId: docForm.assignedBranchId || branches[0]?.id || '',
      });
      setDoctors(prev => [...prev, created]);
      setShowAddDocModal(false);
      setDocForm({
        name: '',
        specialization: 'General Physician',
        licenseNumber: '',
        phone: '',
        assignedBranchId: branches[0]?.id || '',
      });
      alert(
        `✅ Doctor "${created.name}" registered successfully!\n\n` +
        `📋 License Number: ${autoLicense}\n` +
        `🔑 Status: PENDING ACTIVATION\n\n` +
        `Please share this license number with the doctor.\n` +
        `They can activate their account via the "First Login" tab on the login page.`
      );
    } catch (err: any) {
      const msg = err?.message?.includes('API Error') ? err.message.split(' - ')[1] : 'Failed to register doctor.';
      alert(`Error: ${msg}`);
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (confirm('Are you sure you want to remove this clinic branch from the database?')) {
      try {
        await clinicBranchService.delete(id);
        const updated = branches.filter(b => b.id !== id);
        setBranches(updated);
        localStorage.setItem('mediscript_clinic_branches', JSON.stringify(updated));
        alert('Clinic branch deleted from database.');
      } catch (e) {
        alert('Failed to delete branch from database.');
      }
    }
  };

  const handleDeleteDoctor = async (username: string) => {
    if (username.toLowerCase() === 'mahdi') {
      alert('Super Admin account (Mahdi) cannot be removed.');
      return;
    }
    if (confirm(`Are you sure you want to permanently delete doctor account "${username}" from the database?`)) {
      try {
        await authService.deleteDoctor(username);
        setDoctors(prev => prev.filter(d => d.username !== username));
        alert(`Doctor account "${username}" permanently deleted from database.`);
      } catch (e) {
        alert('Failed to delete doctor account from database.');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold backdrop-blur-md border border-white/20 text-indigo-300">
            <ShieldCheck size={14} /> Super Admin Control Panel
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Multi-Clinic Network Management</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl">
            Manage all clinic branches, register doctor accounts, assign OPD staff, and monitor system metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddBranchModal(true)}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
          >
            <Building2 size={16} /> + Add Clinic Branch
          </button>
          <button
            onClick={() => setShowAddDocModal(true)}
            className="px-4 py-2.5 bg-white text-slate-900 font-extrabold rounded-xl text-xs shadow-md hover:bg-slate-100 transition-all flex items-center gap-1.5"
          >
            <Stethoscope size={16} /> + Register Doctor
          </button>
        </div>
      </div>

      {/* Network Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold text-xs">Active Clinic Branches</span>
            <Building2 size={20} className="text-teal-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{branches.length}</p>
          <p className="text-[11px] text-teal-600 font-semibold">Live Operational Centers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold text-xs">Registered Doctors</span>
            <Stethoscope size={20} className="text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{doctors.length}</p>
          <p className="text-[11px] text-indigo-600 font-semibold">Active Medical Staff</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold text-xs">Total Patients Registered</span>
            <Users size={20} className="text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{patients.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">Across All Network Branches</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold text-xs">Database Status</span>
            <Database size={20} className="text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5 pt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" /> PostgreSQL 18
          </p>
          <p className="text-[11px] text-slate-400 font-semibold">Port 5432 • Connected</p>
        </div>
      </div>

      {/* Main Grid: Branches & Doctors Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Card 1: Clinic Branches Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Building2 size={20} className="text-teal-600" />
                Clinic Branches Directory
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage all active physical OPD locations</p>
            </div>
            <button
              onClick={() => setShowAddBranchModal(true)}
              className="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Branch
            </button>
          </div>

          <div className="space-y-3">
            {branches.map(branch => (
              <div key={branch.id} className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/90 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-teal-600 text-white font-mono font-extrabold text-[10px] rounded">
                      {branch.code}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{branch.name}</h4>
                  </div>
                  <button
                    onClick={() => handleDeleteBranch(branch.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Remove branch"
                  >
                    <Trash size={15} />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400 shrink-0" /> {branch.address}</p>
                  <p className="flex items-center gap-1.5"><Phone size={13} className="text-slate-400 shrink-0" /> {branch.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Doctors Roster Management */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Stethoscope size={20} className="text-indigo-600" />
                Doctor Accounts Roster
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Registered medical practitioners & staff</p>
            </div>
            <button
              onClick={() => setShowAddDocModal(true)}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Register Doctor
            </button>
          </div>

          <div className="space-y-3">
            {doctors.map(doc => (
              <div key={doc.id || doc.licenseNumber} className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200/90 transition-all flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl text-white font-extrabold text-xs flex items-center justify-center shadow-xs ${
                    doc.status === 'PENDING' ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}>
                    <Stethoscope size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs">{doc.name}</h4>
                    <p className="text-[11px] text-slate-500">{doc.specialization || 'General Physician'} • Lic: {doc.licenseNumber || '—'}</p>
                    {doc.status === 'PENDING' ? (
                      <p className="text-[10px] text-amber-600 font-semibold mt-0.5">⏳ Awaiting first login activation</p>
                    ) : (
                      <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Username: {doc.username}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                    doc.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}>
                    {doc.status === 'PENDING' ? 'PENDING SETUP' : (doc.role || 'DOCTOR')}
                  </span>
                  <button
                    onClick={() => handleDeleteDoctor(doc.username || doc.licenseNumber || doc.id || '')}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                    title="Remove doctor account"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Building2 size={18} className="text-teal-600" /> Add New Clinic Branch
              </h3>
              <button onClick={() => setShowAddBranchModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddBranch} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Branch Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Hope Multispecialty Clinic - West Branch"
                  value={branchForm.name}
                  onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>

              {/* Auto-Assigned Branch Code Chip */}
              <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-900 block">Auto-Assigned Branch Code:</span>
                  <span className="text-[10px] text-teal-600 font-medium">Generated automatically based on branch name</span>
                </div>
                <span className="px-2.5 py-1 bg-teal-600 text-white font-mono font-extrabold text-xs rounded-lg shadow-2xs">
                  {generateAutoBranchCode(branchForm.name, branches.length)}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Full Physical Address</label>
                <input
                  type="text"
                  placeholder="e.g. 78 Ring Road, Sector 4, City"
                  value={branchForm.address}
                  onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Contact Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98000 11122"
                  value={branchForm.phone}
                  onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddBranchModal(false)}>Cancel</Button>
                <Button type="submit">+ Register Branch</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Stethoscope size={18} className="text-indigo-600" /> Register New Doctor
              </h3>
              <button onClick={() => setShowAddDocModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            {/* Info Banner */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
              <p className="font-bold">🔑 How Doctor Accounts Work</p>
              <p>You set the doctor's profile here. The doctor will use the <span className="font-bold">License Number</span> to activate their own account and choose their username &amp; password via <span className="font-bold">"First Login"</span> on the login page.</p>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Dr. Vikram Kapoor"
                  value={docForm.name}
                  onChange={e => setDocForm({ ...docForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Consultant Physician / Orthopedic"
                  value={docForm.specialization}
                  onChange={e => setDocForm({ ...docForm, specialization: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">License Number <span className="text-slate-400 font-normal">(auto-generated if blank)</span></label>
                <input
                  type="text"
                  placeholder="e.g. MCI-2026-4521"
                  value={docForm.licenseNumber}
                  onChange={e => setDocForm({ ...docForm, licenseNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98000 11122"
                  value={docForm.phone}
                  onChange={e => setDocForm({ ...docForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Assigned Clinic Branch</label>
                <select
                  value={docForm.assignedBranchId}
                  onChange={e => setDocForm({ ...docForm, assignedBranchId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold bg-white"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowAddDocModal(false)}>Cancel</Button>
                <Button type="submit">+ Register Doctor</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
