import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { 
  Sparkles, 
  Plus, 
  Trash, 
  Save, 
  AlertTriangle, 
  Printer, 
  Stethoscope, 
  Activity, 
  FileText,
  Clock,
  FlaskConical,
  FileCheck,
  PackageCheck,
  Receipt,
  Pill
} from 'lucide-react';
import { Button } from '../components/Button';
import { patientService, templateService, settingsService, sessionService } from '../services/apiService';
import { geminiService } from '../services/geminiService';
import { Patient, Visit, PrescriptionItem, MedicineTemplate, ClinicSettings, User, QueueItem } from '../types';
import { MedicalCertificateModal } from '../components/MedicalCertificateModal';
import { BillingReceiptModal } from '../components/BillingReceiptModal';

export const VisitRecorder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const activeDoctor = sessionService.getUser();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  // Clinical State
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedLabOrders, setSelectedLabOrders] = useState<string[]>([]);
  const [customLabOrder, setCustomLabOrder] = useState('');
  const [followUpDate, setFollowUpDate] = useState('7 days');
  const [vitals, setVitals] = useState({ 
    bp: '120/80', 
    weight: '70', 
    height: '170',
    temp: '98.6', 
    pulse: '72',
    spo2: '98',
    bmi: ''
  });
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [templates, setTemplates] = useState<MedicineTemplate[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);

  const commonLabTests = [
    'Complete Blood Count (CBC)',
    'Fasting Blood Sugar (FBS)',
    'HbA1c (Glycated Hemoglobin)',
    'Lipid Profile',
    'Liver Function Test (LFT)',
    'Renal Function Test (KFT)',
    'Thyroid Profile (T3, T4, TSH)',
    'Urine Routine & Microscopy',
    'Chest X-Ray PA View',
    'Electrocardiogram (ECG)',
    'Ultrasound Abdomen & Pelvis'
  ];

  // Compute BMI dynamically
  useEffect(() => {
    const w = parseFloat(vitals.weight);
    const h = parseFloat(vitals.height) / 100;
    if (!isNaN(w) && !isNaN(h) && h > 0) {
      const calculatedBmi = (w / (h * h)).toFixed(1);
      setVitals(prev => ({ ...prev, bmi: calculatedBmi }));
    } else {
      setVitals(prev => ({ ...prev, bmi: '' }));
    }
  }, [vitals.weight, vitals.height]);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (patientId: string) => {
    try {
      setLoading(true);
      const [patientData, templatesData, settingsData] = await Promise.all([
        patientService.get(patientId).catch(() => ({
          id: patientId,
          name: 'Consultation Patient',
          age: 35,
          gender: 'Male' as any,
          phone: '',
          address: '',
          medicalHistory: '',
          createdAt: new Date().toISOString()
        })),
        templateService.list().catch(() => []),
        settingsService.get().catch(() => null)
      ]);

      setPatient(patientData);
      setTemplates(templatesData || []);
      setSettings(settingsData);

      // Pre-fill initial vitals if recorded by reception compounder in queue
      const savedQueue = localStorage.getItem('mediscript_patient_queue');
      if (savedQueue) {
        try {
          const queueItems: QueueItem[] = JSON.parse(savedQueue);
          const activeQueueItem = queueItems.find(q => q.patientId === patientId && q.status !== 'COMPLETED');
          if (activeQueueItem?.vitals) {
            setVitals(prev => ({
              ...prev,
              bp: activeQueueItem.vitals?.bp || prev.bp,
              weight: activeQueueItem.vitals?.weight || prev.weight,
              temp: activeQueueItem.vitals?.temp || prev.temp,
              height: activeQueueItem.vitals?.height || prev.height
            }));
          }
        } catch (e) {}
      }
    } catch (error) {
      console.error('Failed to load clinical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLabOrder = (test: string) => {
    if (selectedLabOrders.includes(test)) {
      setSelectedLabOrders(selectedLabOrders.filter(t => t !== test));
    } else {
      setSelectedLabOrders([...selectedLabOrders, test]);
    }
  };

  const handleAddCustomLab = () => {
    if (customLabOrder.trim() && !selectedLabOrders.includes(customLabOrder.trim())) {
      setSelectedLabOrders([...selectedLabOrders, customLabOrder.trim()]);
      setCustomLabOrder('');
    }
  };

  const handleAiAnalyze = async () => {
    if (!symptoms.trim()) {
      alert("Please type patient symptoms first (e.g. fever, cough, chest pain, stomach pain).");
      return;
    }
    setAiLoading(true);
    try {
      const result = await geminiService.analyzeSymptoms(
        symptoms,
        patient?.age || 30,
        patient?.gender || 'Male',
        patient?.medicalHistory || ''
      );
      setAiSuggestions(result);
      if (result?.advice && !notes.includes(result.advice)) {
        setNotes(prev => (prev ? prev + '\n\n' : '') + `AI Clinical Note: ${result.advice}`);
      }
    } catch (e) {
      console.error('AI symptoms error:', e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSuggestMeds = async () => {
    if (!diagnosis.trim()) {
      alert("Please enter or select a Final Diagnosis first (e.g. Plantar Fasciitis, Acute Bronchitis).");
      return;
    }
    setAiLoading(true);
    try {
      const result = await geminiService.suggestMedicines(diagnosis);
      if (Array.isArray(result) && result.length > 0) {
        const newItems = result.map((m: any) => ({
          id: uuidv4(),
          medicine: m.medicine || '',
          dosage: m.dosage || '',
          frequency: m.frequency || '',
          duration: m.duration || '5 days',
          instructions: m.instructions || ''
        }));
        setItems(prev => [...prev, ...newItems]);
      }
    } catch (e) {
      console.error('Failed to suggest medicines:', e);
    } finally {
      setAiLoading(false);
    }
  };

  const applyPreset = (presetKey: string) => {
    if (presetKey === 'PLANTAR') {
      setSymptoms('Severe heel pain in the morning on taking first steps, calcaneal tenderness');
      setDiagnosis('Plantar Fasciitis (Inferior Calcaneal Heel Pain)');
      setNotes('Advise plantar fascia stretching exercises, silicone heel cushions, supportive footwear, ice massage, and avoidance of barefoot walking.');
      setSelectedLabOrders(['Weight-Bearing X-Ray Foot & Heel (Lateral View)', 'Serum Uric Acid Level']);
      setItems([
        { id: uuidv4(), medicine: 'Aceclofenac 100mg + Paracetamol 325mg', dosage: '1 tablet', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' },
        { id: uuidv4(), medicine: 'Methylcobalamin & Calcium Supplement', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'After dinner' },
        { id: uuidv4(), medicine: 'Diclofenac Topical Pain Gel', dosage: 'Apply gently', frequency: 'Thrice daily', duration: '7 days', instructions: 'External application to heel' }
      ]);
    } else if (presetKey === 'URTI') {
      setSymptoms('Fever, dry cough, sore throat, nasal congestion, bodyache');
      setDiagnosis('Acute Upper Respiratory Tract Infection (URTI)');
      setNotes('Encourage warm fluid intake, steam inhalation twice daily, antipyretics, adequate bed rest.');
      setSelectedLabOrders(['Complete Blood Count (CBC)']);
      setItems([
        { id: uuidv4(), medicine: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'Thrice daily', duration: '5 days', instructions: 'After food' },
        { id: uuidv4(), medicine: 'Levosalbutamol & Ambroxol Syrup', dosage: '10 ml', frequency: 'Thrice daily', duration: '5 days', instructions: 'After food' },
        { id: uuidv4(), medicine: 'Amoxicillin 500mg', dosage: '1 capsule', frequency: 'Thrice daily', duration: '5 days', instructions: 'After food' }
      ]);
    } else if (presetKey === 'GERD') {
      setSymptoms('Heartburn, retrosternal burning chest pain after meals, acid regurgitation');
      setDiagnosis('Acid Peptic Disease / GERD');
      setNotes('Encourage small frequent meals, avoid caffeine, alcohol, and spicy fried food. Elevate head end of bed.');
      setSelectedLabOrders(['Ultrasound Abdomen & Pelvis']);
      setItems([
        { id: uuidv4(), medicine: 'Pantoprazole 40mg', dosage: '1 tablet', frequency: 'Once daily', duration: '14 days', instructions: '30 mins before breakfast' },
        { id: uuidv4(), medicine: 'Magaldrate + Simethicone Oral Gel', dosage: '10 ml', frequency: 'Thrice daily', duration: '7 days', instructions: '1 hour after meals' }
      ]);
    } else if (presetKey === 'HTN') {
      setSymptoms('Routine BP check-up, mild head heaviness on exertion');
      setDiagnosis('Essential Hypertension Follow-Up');
      setNotes('Advise low-salt diet (< 5g/day), 30 minutes daily brisk walk, stress reduction, and daily BP logging.');
      setSelectedLabOrders(['Electrocardiogram (ECG)', 'Lipid Profile', 'Renal Function Test (KFT)']);
      setItems([
        { id: uuidv4(), medicine: 'Telmisartan 40mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'After breakfast' },
        { id: uuidv4(), medicine: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'At bedtime' }
      ]);
    } else if (presetKey === 'DIABETES') {
      setSymptoms('Routine blood glucose tracking, mild weakness');
      setDiagnosis('Type 2 Diabetes Mellitus Follow-Up');
      setNotes('Advise strict carbohydrate control, avoidance of refined sugars, daily 30-min walking, and regular foot care.');
      setSelectedLabOrders(['Fasting Blood Sugar (FBS)', 'HbA1c (Glycated Hemoglobin)', 'Lipid Profile']);
      setItems([
        { id: uuidv4(), medicine: 'Metformin 500mg (SR)', dosage: '1 tablet', frequency: 'Twice daily', duration: '30 days', instructions: 'With meals' },
        { id: uuidv4(), medicine: 'Teneligliptin 20mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days', instructions: 'Before breakfast' }
      ]);
    }
  };

  const addItem = () => {
    setItems([...items, { id: uuidv4(), medicine: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  const updateItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addTemplate = (t: MedicineTemplate) => {
    setItems([...items, {
      id: uuidv4(),
      medicine: t.name || '',
      dosage: t.dosage || '',
      frequency: t.frequency || '',
      duration: t.duration || '',
      instructions: t.instructions || ''
    }]);
  };

  const currentVisitObj: Visit = {
    id: `v-${Date.now()}`,
    patientId: patient?.id || '',
    doctorId: activeDoctor?.id,
    doctorName: activeDoctor?.name || settings?.doctorName,
    date: new Date().toISOString(),
    symptoms,
    diagnosis: diagnosis || 'General Consultation',
    notes,
    labOrders: selectedLabOrders.join(', '),
    followUpDate,
    vitals,
    prescriptions: items
  };

  const handleSave = async () => {
    if (!patient || !diagnosis) {
      alert("Please provide a Final Diagnosis before completing the visit.");
      return;
    }
    try {
      await patientService.createVisit(patient.id, currentVisitObj);
      navigate(`/patients/${patient.id}`);
    } catch (error) {
      console.error('Failed to save consultation visit:', error);
      alert('Error saving visit. Please try again.');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading clinical workspace...</div>;
  if (!patient) {
    return (
      <div className="p-12 max-w-md mx-auto text-center space-y-4 bg-white rounded-2xl border shadow-sm my-12">
        <h3 className="font-extrabold text-slate-900 text-lg">Patient Record Not Found</h3>
        <p className="text-xs text-slate-500">The requested patient record could not be loaded.</p>
        <button
          onClick={() => navigate('/patients')}
          className="px-4 py-2 bg-medical-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-medical-700"
        >
          Return to Patient Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 font-sans">
      {/* Medical Certificate Modal */}
      {showCertModal && (
        <MedicalCertificateModal
          patient={patient}
          doctor={activeDoctor}
          settings={settings}
          onClose={() => setShowCertModal(false)}
        />
      )}

      {/* Billing Invoice Modal */}
      {showBillingModal && (
        <BillingReceiptModal
          visit={currentVisitObj}
          patient={patient}
          doctor={activeDoctor}
          settings={settings}
          onClose={() => setShowBillingModal(false)}
        />
      )}

      {/* Top Header & Doctor Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm no-print">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center font-bold text-xl">
            <Stethoscope size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{patient.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {String(patient.gender || 'Male').toLowerCase() === 'female' ? 'Female' : 'Male'}, {patient.age} yrs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Doctor: <strong className="text-slate-800">{activeDoctor?.name || settings?.doctorName || 'Dr. Alex Smith'}</strong> ({activeDoctor?.specialization || settings?.specialization || 'General Physician'})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowBillingModal(true)}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Receipt size={15} className="text-emerald-600" />
            Billing Receipt
          </button>
          <button
            onClick={() => setShowCertModal(true)}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <FileCheck size={15} className="text-teal-600" />
            Medical Cert
          </button>
          <button
            onClick={() => setShowPrintPreview(!showPrintPreview)}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer size={15} />
            {showPrintPreview ? 'Hide Rx' : 'Print Rx'}
          </button>
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!diagnosis}>
            <Save size={15} className="mr-1" /> Complete Visit
          </Button>
        </div>
      </div>

      {/* Allergy Alert Banner */}
      {patient.allergies && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900 no-print shadow-sm">
          <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wide">CRITICAL ALLERGY ALERT</h4>
            <p className="text-xs text-rose-800 mt-0.5 font-semibold">{patient.allergies}</p>
          </div>
        </div>
      )}

      {/* Printable Rx Prescription Letterhead Layout */}
      {showPrintPreview ? (
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-300 shadow-xl max-w-4xl mx-auto font-sans text-slate-900 space-y-6">
          <div className="border-b-2 border-medical-600 pb-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-extrabold text-medical-800">{settings?.name || 'MediScript Clinic'}</h2>
              <p className="text-sm font-bold text-slate-800">{activeDoctor?.name || settings?.doctorName || 'Dr. Alex Smith'}</p>
              <p className="text-xs font-semibold text-slate-600">{activeDoctor?.specialization || settings?.specialization || 'General Physician'}</p>
              <p className="text-xs text-slate-500">Lic No: {activeDoctor?.licenseNumber || settings?.licenseNumber || 'MD-987654'}</p>
              <p className="text-xs text-slate-500 mt-1">{settings?.address} • Phone: {settings?.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-medical-600 font-serif">Rx</span>
              <p className="text-xs text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Age / Gender</span>
              <span className="font-bold text-slate-900">{patient.age} yrs / {String(patient.gender || 'Male').toLowerCase() === 'female' ? 'Female' : 'Male'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Vitals (BP / HR / BMI)</span>
              <span className="font-bold text-slate-900">{vitals.bp || '120/80'} | {vitals.pulse || '72'} bpm | BMI {vitals.bmi || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Phone</span>
              <span className="font-bold text-slate-900">{patient.phone}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-600 border-b pb-1">Clinical Assessment</h3>
            <p className="text-sm"><strong className="text-slate-900">Diagnosis:</strong> {diagnosis || 'Pending'}</p>
            {symptoms && <p className="text-xs text-slate-600"><strong>Chief Complaints:</strong> {symptoms}</p>}
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-600 border-b pb-1">Rx Prescribed Medications</h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="p-2 font-bold">#</th>
                  <th className="p-2 font-bold">Medicine</th>
                  <th className="p-2 font-bold">Dosage</th>
                  <th className="p-2 font-bold">Frequency</th>
                  <th className="p-2 font-bold">Duration</th>
                  <th className="p-2 font-bold">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="p-2 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2 font-bold text-slate-900">{item.medicine}</td>
                      <td className="p-2">{item.dosage}</td>
                      <td className="p-2">{item.frequency}</td>
                      <td className="p-2">{item.duration}</td>
                      <td className="p-2 italic text-slate-600">{item.instructions}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-400 italic">No medications prescribed.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedLabOrders.length > 0 && (
            <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-200 text-xs space-y-1">
              <span className="font-bold text-teal-900 block flex items-center gap-1">
                <FlaskConical size={14} className="text-teal-600" /> Recommended Lab Investigations / Tests:
              </span>
              <p className="text-teal-800 font-semibold">{selectedLabOrders.join(', ')}</p>
            </div>
          )}

          {(notes || followUpDate) && (
            <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl text-xs space-y-1">
              {notes && <p className="text-amber-900"><strong>Advice:</strong> {notes}</p>}
              {followUpDate && <p className="text-amber-900"><strong>Follow-up Visit:</strong> Re-consultation in {followUpDate}</p>}
            </div>
          )}

          <div className="pt-10 flex justify-between items-end border-t border-slate-200 text-xs">
            <div>
              <p className="text-slate-400">{settings?.footerText || 'Get well soon!'}</p>
              <p className="text-[10px] text-slate-300 mt-1">Generated by MediScript EHR Platform</p>
            </div>
            <div className="text-center space-y-8">
              <div className="border-b border-slate-400 w-44 inline-block" />
              <p className="font-bold text-slate-900">{activeDoctor?.name || settings?.doctorName || 'Doctor Signature'}</p>
            </div>
          </div>

          <div className="text-center pt-4 no-print">
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md hover:bg-slate-800 transition-colors"
            >
              Print Prescription Now
            </button>
          </div>
        </div>
      ) : (
        /* Interactive Form */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vitals */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <Activity size={18} className="text-medical-600" />
                  Vitals & Biometrics
                </h3>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Pre-filled from Reception
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">BP (mmHg)</label>
                  <input
                    type="text"
                    value={vitals.bp}
                    onChange={e => setVitals({ ...vitals, bp: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Weight (kg)</label>
                  <input
                    type="text"
                    value={vitals.weight}
                    onChange={e => setVitals({ ...vitals, weight: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Height (cm)</label>
                  <input
                    type="text"
                    value={vitals.height}
                    onChange={e => setVitals({ ...vitals, height: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">BMI Index</label>
                  <input
                    type="text"
                    readOnly
                    value={vitals.bmi || 'N/A'}
                    className="w-full px-3 py-2 border bg-slate-50 rounded-xl font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800 text-sm">Chief Complaints & Final Diagnosis</h3>
                <Button size="sm" variant="ghost" className="text-medical-600 bg-medical-50 hover:bg-medical-100" onClick={handleAiAnalyze} isLoading={aiLoading}>
                  <Sparkles size={15} className="mr-1 text-amber-500" /> AI Symptoms Assist
                </Button>
              </div>

              {/* 1-Click Clinical Specialty Presets */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  ⚡ 1-Click OPD Clinical Presets (Auto-fill Rx in 1 sec):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => applyPreset('PLANTAR')} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-2xs">
                    🦶 Plantar Fasciitis
                  </button>
                  <button type="button" onClick={() => applyPreset('URTI')} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-2xs">
                    🌡️ Fever / Cold (URTI)
                  </button>
                  <button type="button" onClick={() => applyPreset('GERD')} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-2xs">
                    🔥 GERD / Acidity
                  </button>
                  <button type="button" onClick={() => applyPreset('HTN')} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-2xs">
                    ❤️ Hypertension Check
                  </button>
                  <button type="button" onClick={() => applyPreset('DIABETES')} className="px-2.5 py-1 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors shadow-2xs">
                    🩸 Diabetes Follow-Up
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Symptoms / History</label>
                <textarea
                  className="w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  rows={3}
                  placeholder="Type patient complaints (e.g. fever, cough, chest pain, stomach ache)..."
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                />
              </div>

              {/* AI Clinical Symptoms Analysis Card */}
              {aiSuggestions && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3 text-xs shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-amber-900 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-amber-600" /> AI Clinical Symptoms Assist
                    </span>
                    <button onClick={() => setAiSuggestions(null)} className="text-amber-500 hover:text-amber-700 font-bold text-sm">✕</button>
                  </div>

                  {aiSuggestions.possibleConditions?.length > 0 && (
                    <div>
                      <span className="font-bold text-amber-800 block mb-1.5">Suggested Diagnoses (Click to set):</span>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.possibleConditions.map((cond: string) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => setDiagnosis(cond)}
                            className="px-2.5 py-1 bg-white border border-amber-300 rounded-xl text-amber-900 font-bold hover:bg-amber-100 transition-colors shadow-xs"
                            title="Click to select as Final Diagnosis"
                          >
                            + {cond}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiSuggestions.recommendedChecks?.length > 0 && (
                    <div>
                      <span className="font-bold text-amber-800 block mb-0.5">Recommended Vitals & Tests:</span>
                      <p className="text-amber-900 font-semibold">{aiSuggestions.recommendedChecks.join(' • ')}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Final Diagnosis *</label>
                <input
                  type="text"
                  placeholder="e.g. Acute Bronchitis"
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-medical-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Prescriptions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Prescribed Medication Table</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Specify generic medicine, dosage, timing & frequency</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" className="text-teal-700 bg-teal-50 hover:bg-teal-100" onClick={handleAiSuggestMeds} isLoading={aiLoading}>
                    <Sparkles size={15} className="mr-1 text-amber-500" /> AI Auto-Prescribe
                  </Button>
                  <Button size="sm" onClick={addItem}><Plus size={15} className="mr-1" /> Add Medicine</Button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                  <Pill size={24} className="mx-auto text-slate-300" />
                  <p>No medicines prescribed yet. Click <strong>"AI Auto-Prescribe"</strong> or <strong>"+ Add Medicine"</strong> above.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Table Column Titles */}
                  <div className="hidden md:grid grid-cols-12 gap-2 px-3 py-2 bg-slate-100/80 rounded-xl text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    <div className="col-span-4">Medicine Name & Formulation</div>
                    <div className="col-span-2">Dosage</div>
                    <div className="col-span-2">Frequency</div>
                    <div className="col-span-1 text-center">Duration</div>
                    <div className="col-span-2">Instructions / Meal Timing</div>
                    <div className="col-span-1 text-center">Action</div>
                  </div>

                  {/* Rows */}
                  {items.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/90 transition-all flex flex-col md:grid md:grid-cols-12 gap-2.5 items-center">
                      <div className="w-full md:col-span-4">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Medicine Name</span>
                        <input
                          type="text"
                          placeholder="e.g. Aceclofenac 100mg + Paracetamol 325mg"
                          value={item.medicine}
                          title={item.medicine}
                          onChange={e => updateItem(idx, 'medicine', e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-medical-500 focus:outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div className="w-full md:col-span-2">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Dosage</span>
                        <input
                          type="text"
                          placeholder="e.g. 1 tablet"
                          value={item.dosage}
                          title={item.dosage}
                          onChange={e => updateItem(idx, 'dosage', e.target.value)}
                          className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-medical-500 focus:outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div className="w-full md:col-span-2">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Frequency</span>
                        <input
                          type="text"
                          placeholder="e.g. Twice daily"
                          value={item.frequency}
                          title={item.frequency}
                          onChange={e => updateItem(idx, 'frequency', e.target.value)}
                          className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-medical-500 focus:outline-none bg-white shadow-2xs font-medium"
                        />
                      </div>

                      <div className="w-full md:col-span-1">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Duration</span>
                        <input
                          type="text"
                          placeholder="5 days"
                          value={item.duration}
                          title={item.duration}
                          onChange={e => updateItem(idx, 'duration', e.target.value)}
                          className="w-full px-2 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-medical-500 focus:outline-none bg-white shadow-2xs font-medium text-center"
                        />
                      </div>

                      <div className="w-full md:col-span-2">
                        <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase block mb-1">Instructions</span>
                        <input
                          type="text"
                          placeholder="e.g. After food for 5 days"
                          value={item.instructions}
                          title={item.instructions}
                          onChange={e => updateItem(idx, 'instructions', e.target.value)}
                          className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-xl text-slate-700 italic focus:ring-2 focus:ring-medical-500 focus:outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div className="w-full md:col-span-1 flex justify-center pt-2 md:pt-0">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100/70 rounded-xl transition-colors"
                          title="Remove medicine"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Diagnostic Lab Tests */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <FlaskConical size={18} className="text-teal-600" />
                Diagnostic Lab Test Orders / Investigations
              </h3>

              <div className="flex flex-wrap gap-2 pt-1">
                {commonLabTests.map(test => {
                  const selected = selectedLabOrders.includes(test);
                  return (
                    <button
                      key={test}
                      type="button"
                      onClick={() => toggleLabOrder(test)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '} {test}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Other custom test order..."
                  value={customLabOrder}
                  onChange={e => setCustomLabOrder(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleAddCustomLab}
                  className="px-3 py-1.5 bg-slate-800 text-white font-semibold text-xs rounded-xl hover:bg-slate-700"
                >
                  Add Test
                </button>
              </div>
            </div>

            {/* Follow-up & Advice */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 mb-1">Doctor Advice / Dietary Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Dietary precautions, rest, follow-up advice..."
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Follow-up Re-consultation</label>
                  <select
                    value={followUpDate}
                    onChange={e => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white font-semibold"
                  >
                    <option value="3 days">After 3 Days</option>
                    <option value="5 days">After 5 Days</option>
                    <option value="7 days">After 1 Week</option>
                    <option value="2 weeks">After 2 Weeks</option>
                    <option value="1 month">After 1 Month</option>
                    <option value="As needed">SOS / As Needed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Templates */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 sticky top-6">
              <h3 className="font-extrabold text-slate-800 text-sm">Saved Prescription Templates</h3>
              <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => addTemplate(t)}
                    className="w-full text-left p-2.5 text-xs border rounded-xl hover:bg-medical-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t.dosage} • {t.frequency}</div>
                    </div>
                    <Plus size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};