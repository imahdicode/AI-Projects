import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Stethoscope, 
  AlertTriangle, 
  ShieldAlert, 
  Filter,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/Button';
import { patientService, LOCAL_PATIENTS_KEY } from '../services/apiService';
import { Patient, Gender } from '../types';

export const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<Partial<Patient>[]>([]);
  const [importing, setImporting] = useState(false);
  const navigate = useNavigate();

  // Expanded Form State
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    age: undefined,
    gender: Gender.MALE,
    phone: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    bloodGroup: 'O+'
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.list();
      setPatients(prev => {
        const mergedMap = new Map<string, Patient>();
        data.forEach(p => mergedMap.set(p.id, p));
        prev.forEach(p => {
          if (!mergedMap.has(p.id)) {
            mergedMap.set(p.id, p);
          }
        });
        return Array.from(mergedMap.values());
      });
    } catch (error) {
      console.error('Failed to load patient directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.name && p.name.toLowerCase().includes(search.toLowerCase())) || 
                          (p.phone && p.phone.includes(search)) ||
                          (p.id && p.id.toLowerCase().includes(search.toLowerCase()));
    const matchesGender = genderFilter === 'ALL' || String(p.gender || '').toUpperCase() === String(genderFilter || '').toUpperCase();
    return matchesSearch && matchesGender;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.age) {
      alert("Please provide Name and Age.");
      return;
    }

    const patientPayload: Partial<Patient> = {
      name: formData.name,
      age: Number(formData.age),
      gender: formData.gender || Gender.MALE,
      phone: formData.phone || '',
      address: formData.address || '',
      medicalHistory: formData.medicalHistory || '',
      allergies: formData.allergies || '',
      bloodGroup: formData.bloodGroup || 'O+'
    };

    try {
      const newPatient = await patientService.create(patientPayload);
      setPatients(prev => [newPatient, ...prev.filter(p => p.id !== newPatient.id)]);
      await loadPatients();
    } catch (error) {
      console.warn('Backend API unreachable or error, adding patient to local session directory:', error);
      const fallbackPatient: Patient = {
        id: `P-${Date.now()}`,
        name: patientPayload.name!,
        age: patientPayload.age!,
        gender: (patientPayload.gender as Gender) || Gender.MALE,
        phone: patientPayload.phone || '',
        address: patientPayload.address || '',
        medicalHistory: patientPayload.medicalHistory || '',
        allergies: patientPayload.allergies || '',
        bloodGroup: patientPayload.bloodGroup || 'O+',
        createdAt: new Date().toISOString()
      };
      setPatients(prev => [fallbackPatient, ...prev.filter(p => p.id !== fallbackPatient.id)]);
    }

    setShowModal(false);
    setFormData({
      name: '',
      age: undefined,
      gender: Gender.MALE,
      phone: '',
      address: '',
      medicalHistory: '',
      allergies: '',
      bloodGroup: 'O+'
    });
  };

  // Universal CSV/TSV Parser Engine supporting tabs, commas, semicolons, and headerless rows
  const parsePatientCSV = (rawText: string): Partial<Patient>[] => {
    const cleanText = rawText.replace(/^\uFEFF/, '').trim();
    if (!cleanText) return [];

    // Auto-detect delimiter: tab (\t), semicolon (;), or comma (,)
    let delimiter = ',';
    const firstLine = cleanText.split(/[\r\n]+/)[0] || '';
    if (firstLine.includes('\t')) {
      delimiter = '\t';
    } else if (firstLine.includes(';') && !firstLine.includes(',')) {
      delimiter = ';';
    }

    // Split rows safely
    const rawRows: string[] = [];
    let currentRow = '';
    let inQuotes = false;
    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      if (char === '"') {
        inQuotes = !inQuotes;
        currentRow += char;
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && cleanText[i + 1] === '\n') {
          i++;
        }
        if (currentRow.trim()) {
          rawRows.push(currentRow);
        }
        currentRow = '';
      } else {
        currentRow += char;
      }
    }
    if (currentRow.trim()) {
      rawRows.push(currentRow);
    }

    if (rawRows.length === 0) return [];

    // Column parser for individual CSV/TSV rows
    const parseRowCols = (rowStr: string): string[] => {
      const cols: string[] = [];
      let entry = '';
      let inside = false;
      for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        if (char === '"') {
          if (inside && rowStr[i + 1] === '"') {
            entry += '"';
            i++;
          } else {
            inside = !inside;
          }
        } else if (char === delimiter && !inside) {
          cols.push(entry.trim().replace(/^"|"$/g, ''));
          entry = '';
        } else {
          entry += char;
        }
      }
      cols.push(entry.trim().replace(/^"|"$/g, ''));
      return cols;
    };

    const firstRowCols = parseRowCols(rawRows[0]);
    const firstRowJoined = firstRowCols.join(' ').toLowerCase();

    // Check if row 0 is a header line
    const isHeaderRow = firstRowJoined.includes('name') || 
                        firstRowJoined.includes('patient') || 
                        firstRowJoined.includes('gender') || 
                        firstRowJoined.includes('phone') || 
                        firstRowJoined.includes('age');

    let startIndex = isHeaderRow ? 1 : 0;

    let nameIdx = -1;
    let ageIdx = -1;
    let genderIdx = -1;
    let phoneIdx = -1;
    let addressIdx = -1;
    let historyIdx = -1;
    let allergyIdx = -1;
    let bloodIdx = -1;

    if (isHeaderRow) {
      const headerCols = firstRowCols.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
      nameIdx = headerCols.findIndex(h => h.includes('name') || h.includes('patient'));
      ageIdx = headerCols.findIndex(h => h.includes('age') || h.includes('dob') || h.includes('year'));
      genderIdx = headerCols.findIndex(h => h.includes('gender') || h.includes('sex'));
      phoneIdx = headerCols.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact') || h.includes('number'));
      addressIdx = headerCols.findIndex(h => h.includes('address') || h.includes('city') || h.includes('location'));
      historyIdx = headerCols.findIndex(h => h.includes('history') || h.includes('medical') || h.includes('notes') || h.includes('diagnosis'));
      allergyIdx = headerCols.findIndex(h => h.includes('allergy') || h.includes('allergies'));
      bloodIdx = headerCols.findIndex(h => h.includes('blood') || h.includes('group'));
    }

    const parsedPatients: Partial<Patient>[] = [];

    for (let i = startIndex; i < rawRows.length; i++) {
      const cols = parseRowCols(rawRows[i]);
      if (cols.length === 0) continue;

      let name = nameIdx >= 0 ? cols[nameIdx] : '';
      let age = ageIdx >= 0 ? parseInt(cols[ageIdx]) : NaN;
      let genderStr = genderIdx >= 0 ? cols[genderIdx] : '';
      let phone = phoneIdx >= 0 ? cols[phoneIdx] : '';
      let address = addressIdx >= 0 ? cols[addressIdx] : '';
      let medicalHistory = historyIdx >= 0 ? cols[historyIdx] : '';
      let allergies = allergyIdx >= 0 ? cols[allergyIdx] : '';
      let bloodGroup = bloodIdx >= 0 ? cols[bloodIdx] : 'O+';

      // Smart Field Inference if headers were not matched or index was missing
      if (!name) {
        // Find field that looks like a full name (2+ words or non-numeric string, excluding IDs/dates)
        const nameCandidate = cols.find(c => {
          const val = c.trim();
          return val.length > 2 && 
                 !/^\d+$/.test(val) && 
                 !/^P-\d+$/i.test(val) && 
                 !/^(male|female|other)$/i.test(val) &&
                 !/\d{4}-\d{2}-\d{2}/.test(val);
        });
        if (nameCandidate) name = nameCandidate;
      }

      if (isNaN(age)) {
        const ageCandidate = cols.find(c => /^\d{1,3}$/.test(c.trim()) && parseInt(c) > 0 && parseInt(c) < 120);
        if (ageCandidate) age = parseInt(ageCandidate);
        else age = 30;
      }

      if (!genderStr) {
        const genderCandidate = cols.find(c => /^(male|female|other|m|f|o)$/i.test(c.trim()));
        if (genderCandidate) genderStr = genderCandidate;
        else genderStr = 'Male';
      }

      if (!phone) {
        const phoneCandidate = cols.find(c => /^\+?\d{8,15}$/.test(c.trim().replace(/[- ]/g, '')));
        if (phoneCandidate) phone = phoneCandidate;
      }

      if (!address) {
        const addrCandidate = cols.find(c => c !== name && c !== medicalHistory && (c.includes('Road') || c.includes('Street') || c.includes('Place') || c.includes('New Delhi') || c.includes('Kolkata') || c.includes('Ahmedabad') || c.includes('Bengaluru') || c.includes('Jaipur') || c.includes('Chennai')));
        if (addrCandidate) address = addrCandidate;
      }

      if (!medicalHistory) {
        const histCandidate = cols.find(c => c !== name && c !== address && (c.includes('Diabetes') || c.includes('GERD') || c.includes('Asthma') || c.includes('Migraine') || c.includes('Hypertension') || c.includes('Hypothyroidism') || c.includes('Osteoarthritis')));
        if (histCandidate) medicalHistory = histCandidate;
      }

      if (!name || name.startsWith('P-') || /^\d+$/.test(name)) {
        // Fallback to first non-empty text field if name not resolved
        const fallbackName = cols.find(c => c.length > 2 && !/^\d+$/.test(c) && !/^P-/i.test(c) && !/\d{4}/.test(c));
        name = fallbackName || `Patient ${i + 1}`;
      }

      let genderVal = Gender.MALE;
      const lowerG = genderStr.toLowerCase();
      if (lowerG.includes('fem') || lowerG === 'f') {
        genderVal = Gender.FEMALE;
      } else if (lowerG.includes('oth') || lowerG === 'o') {
        genderVal = Gender.OTHER;
      }

      parsedPatients.push({
        name: name.trim(),
        age,
        gender: genderVal,
        phone: phone.trim(),
        address: address.trim(),
        medicalHistory: medicalHistory.trim(),
        allergies: allergies.trim(),
        bloodGroup: bloodGroup.trim() || 'O+'
      });
    }

    return parsedPatients;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parsePatientCSV(text);
      if (parsed.length === 0) {
        alert("Could not parse any patient records from this CSV file. Please make sure it has headers and valid patient rows.");
      } else {
        setImportPreview(parsed);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input so re-uploading same file triggers onChange
  };

  const downloadSampleTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Age,Gender,Phone,Address,MedicalHistory,Allergies,BloodGroup\n" +
      "Rajesh Sharma,45,Male,9876543210,123 MG Road Delhi,Type 2 Diabetes,Penicillin,O+\n" +
      "Sunita Gupta,38,Female,9812345678,45 Park Street Mumbai,Hypertension,None,A+\n" +
      "Amit Patel,52,Male,9988776655,78 Satellite Ahmedabad,Asthma,Dust Allergy,B+";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mediscript_patient_sample_import.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    const baseTimestamp = Date.now();
    const activeUser = sessionService.getUser();
    const currentDocId = activeUser?.id || '1';

    const preparedList: Patient[] = importPreview.map((p, idx) => {
      const uniqueId = `P-${baseTimestamp}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
      let uppercaseGender = Gender.MALE;
      if (p.gender) {
        const gStr = String(p.gender).toUpperCase();
        if (gStr.includes('FEM') || gStr === 'F') uppercaseGender = Gender.FEMALE;
        else if (gStr.includes('OTH') || gStr === 'O') uppercaseGender = Gender.OTHER;
      }
      return {
        id: uniqueId,
        name: p.name && p.name.trim() ? p.name.trim() : `Patient ${idx + 1}`,
        age: isNaN(Number(p.age)) || Number(p.age) < 0 ? 30 : Math.floor(Number(p.age)),
        gender: uppercaseGender,
        phone: p.phone || '',
        address: p.address || '',
        medicalHistory: p.medicalHistory || '',
        allergies: p.allergies || '',
        bloodGroup: p.bloodGroup || 'O+',
        doctorId: currentDocId,
        createdAt: new Date().toISOString()
      };
    });

    // Synchronous Persistent Local Storage Save — Guarantees survival on page refresh (F5)
    try {
      const raw = localStorage.getItem(LOCAL_PATIENTS_KEY);
      const existing: Patient[] = raw ? JSON.parse(raw) : [];
      const mergedMap = new Map<string, Patient>();
      preparedList.forEach(p => mergedMap.set(p.id, p));
      existing.forEach(p => mergedMap.set(p.id, p));
      localStorage.setItem(LOCAL_PATIENTS_KEY, JSON.stringify(Array.from(mergedMap.values())));
    } catch (e) {}

    // Instant UI Reactivity — Update Screen & Close Modal in 0 Milliseconds
    setPatients(prev => {
      const mergedMap = new Map<string, Patient>();
      prev.forEach(item => mergedMap.set(item.id, item));
      preparedList.forEach(item => mergedMap.set(item.id, item));
      return Array.from(mergedMap.values());
    });

    setImporting(false);
    setShowImportModal(false);
    setImportPreview([]);

    // Fire all API insertions concurrently in parallel (non-blocking)
    Promise.all(
      preparedList.map(patientItem => 
        patientService.create(patientItem).catch(err => {
          console.warn('Background sync for imported patient fallback:', err);
          return patientItem;
        })
      )
    ).then(() => {
      loadPatients();
    });
  };

  const handleExportCSV = () => {
    if (patients.length === 0) {
      alert("No patients to export.");
      return;
    }

    let csv = "Patient ID,Name,Age,Gender,Phone,Address,Medical History,Allergies,Blood Group,Registered Date\n";
    patients.forEach(p => {
      csv += `"${p.id}","${p.name}",${p.age},"${p.gender}","${p.phone || ''}","${p.address || ''}","${p.medicalHistory || ''}","${p.allergies || ''}","${p.bloodGroup || ''}","${new Date(p.createdAt).toLocaleDateString()}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mediscript_patients_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage patient health records & clinical histories</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Upload size={15} className="text-teal-600" />
            Import Excel / CSV
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download size={15} className="text-medical-600" />
            Export CSV
          </button>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={18} className="mr-1.5" />
            Register New Patient
          </Button>
        </div>
      </div>

      {/* Directory Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone, or patient ID..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-white focus:outline-none"
            >
              <option value="ALL">All Genders</option>
              <option value={Gender.MALE}>Male Patients</option>
              <option value={Gender.FEMALE}>Female Patients</option>
              <option value={Gender.OTHER}>Other</option>
            </select>
          </div>
        </div>

        {/* Patients List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm font-medium">
              Loading patients...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No matching patient records found. Click "Register New Patient" above or "Import Excel / CSV".
            </div>
          ) : (
            filteredPatients.map(patient => (
              <div
                key={patient.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-medical-50 text-medical-700 font-extrabold text-base flex items-center justify-center border border-medical-200/60 shadow-sm shrink-0">
                    {patient.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-medical-700 transition-colors">
                        {patient.name}
                      </h3>
                      {patient.allergies && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                          <AlertTriangle size={10} /> Allergy Flag
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{patient.age} yrs • {patient.gender}</span>
                      {patient.phone && (
                        <span className="flex items-center gap-1 text-slate-600 font-medium">
                          <Phone size={12} className="text-slate-400" /> {patient.phone}
                        </span>
                      )}
                      {patient.bloodGroup && (
                        <span className="font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
                          {patient.bloodGroup}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    View History
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/patients/${patient.id}/new-visit`)}
                  >
                    <Stethoscope size={14} className="mr-1" />
                    Write Rx
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-extrabold text-slate-900">Register New Patient</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center text-lg font-bold"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Patient Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age *</label>
                  <input
                    required
                    type="number"
                    placeholder="35"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                    value={formData.age || ''}
                    onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none bg-white"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                  >
                    {Object.values(Gender).map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none bg-white font-bold"
                    value={formData.bloodGroup}
                    onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option value="O+">O Positive (O+)</option>
                    <option value="O-">O Negative (O-)</option>
                    <option value="A+">A Positive (A+)</option>
                    <option value="A-">A Negative (A-)</option>
                    <option value="B+">B Positive (B+)</option>
                    <option value="B-">B Negative (B-)</option>
                    <option value="AB+">AB Positive (AB+)</option>
                    <option value="AB-">AB Negative (AB-)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="123 Main St, City"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-rose-700 mb-1">Allergies (If Any)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, NSAIDs, Sulfa drugs"
                    className="w-full px-3 py-2 text-sm border border-rose-200 bg-rose-50/50 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    value={formData.allergies}
                    onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Medical History & Chronic Conditions</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                    value={formData.medicalHistory}
                    onChange={e => setFormData({ ...formData, medicalHistory: e.target.value })}
                    placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  />
                </div>
              </div>
              <div className="pt-4 border-t flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Patient Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Excel/CSV Import Modal */}
      {showImportModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="import-modal-title" className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 space-y-4">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 id="import-modal-title" className="text-base font-extrabold text-slate-900">Bulk Import Patients (Excel / CSV)</h3>
                  <p className="text-xs text-slate-500">Upload old clinic patient spreadsheets into MediScript</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview([]);
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* File Select & Template Download */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-200/80">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-teal-900">Need an Excel sample template?</p>
                  <p className="text-[11px] text-teal-700">Download our formatted CSV template to align your column headers.</p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="px-3.5 py-2 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Download size={14} /> Download Sample Template
                </button>
              </div>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50 transition-colors">
                <Upload size={32} className="mx-auto text-teal-600" />
                <div>
                  <label className="cursor-pointer text-xs font-extrabold text-medical-600 hover:underline">
                    Choose Excel / CSV File
                    <input
                      type="file"
                      accept=".csv, .txt, .xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">Supports `.csv` files saved from Excel or Google Sheets</p>
                </div>
              </div>

              {/* Parsed Preview Table */}
              {importPreview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      Ready to Import: <strong className="text-slate-900">{importPreview.length} Patients</strong>
                    </span>
                    <button
                      onClick={() => setImportPreview([])}
                      className="text-xs text-rose-600 hover:underline font-semibold"
                    >
                      Clear Selection
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl text-xs divide-y">
                    <div className="bg-slate-100 p-2.5 font-bold text-slate-700 grid grid-cols-4 sticky top-0">
                      <div>Name</div>
                      <div>Age / Gender</div>
                      <div>Phone</div>
                      <div>Medical History</div>
                    </div>
                    {importPreview.map((p, i) => (
                      <div key={i} className="p-2.5 grid grid-cols-4 bg-white text-slate-800 font-medium">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div>{p.age} yrs • {p.gender}</div>
                        <div>{p.phone || 'N/A'}</div>
                        <div className="truncate text-slate-500">{p.medicalHistory || 'None'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportPreview([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={importPreview.length === 0 || importing}
                  isLoading={importing}
                >
                  <Upload size={15} className="mr-1.5" />
                  Confirm & Import ({importPreview.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};