import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Calendar, FileText, Plus, AlertTriangle, Stethoscope, Activity, User, Phone, MapPin, ShieldAlert } from 'lucide-react';
import { Button } from '../components/Button';
import { patientService, settingsService } from '../services/apiService';
import { Patient, Visit, ClinicSettings } from '../types';

export const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPatientData(id);
    }
  }, [id]);

  const loadPatientData = async (patientId: string) => {
    try {
      setLoading(true);
      const [patientData, visitsData, settingsData] = await Promise.all([
        patientService.get(patientId),
        patientService.getVisits(patientId),
        settingsService.get().catch(() => null)
      ]);
      setPatient(patientData);
      setVisits(visitsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Failed to load patient profile:', error);
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this patient and all their visit records?')) {
      if (id) {
        try {
          await patientService.delete(id);
          navigate('/patients');
        } catch (error) {
          console.error('Failed to delete patient record:', error);
        }
      }
    }
  };

  const PrintablePrescription = ({ visit }: { visit: Visit }) => {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col hidden print-only p-8 text-slate-900 font-sans">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-medical-600 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-medical-800">{settings?.name || 'MediScript Clinic'}</h1>
            <p className="text-sm font-semibold text-slate-700">{settings?.doctorName || 'Dr. Alex Smith'} ({settings?.specialization || 'General Physician'})</p>
            <p className="text-xs text-slate-500">License No: {settings?.licenseNumber || 'MD-987654'}</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>{settings?.address}</p>
            <p>Phone: {settings?.phone}</p>
            <p className="mt-1 font-bold text-slate-900">Date: {new Date(visit.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Patient Details Row */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-4 gap-4 text-xs mb-6">
          <div>
            <span className="text-slate-400 block">Patient Name</span>
            <span className="font-bold text-slate-900 text-sm">{patient?.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Age / Gender</span>
            <span className="font-bold text-slate-900">{patient?.age} yrs / {patient?.gender}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Phone</span>
            <span className="font-bold text-slate-900">{patient?.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Vitals</span>
            <span className="font-bold text-slate-900">{visit.vitals?.bp || '120/80'} | {visit.vitals?.weight ? `${visit.vitals.weight}kg` : 'N/A'}</span>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-6 space-y-1">
          <h3 className="font-extrabold text-sm uppercase text-slate-600 border-b pb-1">Diagnosis</h3>
          <p className="text-sm font-bold text-slate-900">{visit.diagnosis}</p>
          {visit.symptoms && <p className="text-xs text-slate-600">Symptoms: {visit.symptoms}</p>}
        </div>

        {/* Prescription Table */}
        <div className="mb-6 space-y-2">
          <h3 className="font-extrabold text-sm uppercase text-slate-600 border-b pb-1 flex items-center gap-1">
            <span className="text-xl font-serif text-medical-600">Rx</span> Prescribed Medicines
          </h3>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b">
                <th className="p-2 font-bold">#</th>
                <th className="p-2 font-bold">Medicine</th>
                <th className="p-2 font-bold">Dosage</th>
                <th className="p-2 font-bold">Frequency</th>
                <th className="p-2 font-bold">Duration</th>
                <th className="p-2 font-bold">Instructions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {visit.prescriptions.map((med, idx) => (
                <tr key={idx}>
                  <td className="p-2 font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-2 font-bold text-slate-900">{med.medicine}</td>
                  <td className="p-2">{med.dosage}</td>
                  <td className="p-2">{med.frequency}</td>
                  <td className="p-2">{med.duration}</td>
                  <td className="p-2 italic text-slate-600">{med.instructions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {visit.notes && (
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs mb-8">
            <span className="font-bold text-amber-900 block">Doctor Advice:</span>
            <p className="text-amber-800">{visit.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-8 border-t flex justify-between items-end text-xs">
          <p className="text-slate-400">{settings?.footerText || 'Get well soon!'}</p>
          <div className="text-center">
            <div className="border-b border-slate-400 w-40 inline-block mb-1" />
            <p className="font-bold text-slate-800">{settings?.doctorName || 'Doctor Signature'}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading patient profile...</div>;
  if (!patient) {
    return (
      <div className="p-12 max-w-md mx-auto text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm my-12">
        <h3 className="font-extrabold text-slate-900 text-lg">Patient Profile Not Found</h3>
        <p className="text-xs text-slate-500">The requested patient record could not be located in directory.</p>
        <Button onClick={() => navigate('/patients')}>Return to Patient Directory</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {selectedVisit && <PrintablePrescription visit={selectedVisit} />}

      {/* Navigation Header */}
      <div className="flex items-center justify-between no-print bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/patients')}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              {patient.name}
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-medical-50 text-medical-700 font-semibold border border-medical-200">
                {patient.gender}, {patient.age} yrs
              </span>
            </h1>
            <p className="text-xs text-slate-500">Registered Patient ID: {patient.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(`/patients/${patient.id}/new-visit`)}
          >
            <Plus size={16} className="mr-1.5" /> Start New Consultation
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 size={16} className="mr-1.5" /> Delete Patient
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Left Col: Detailed Profile & Health Warning */}
        <div className="space-y-6">
          {/* Allergy Alert Card */}
          {patient.allergies && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-1 text-rose-900 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-700">
                <ShieldAlert size={16} /> Allergy Alert
              </div>
              <p className="text-xs font-semibold text-rose-900">{patient.allergies}</p>
            </div>
          )}

          {/* Patient Info Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-extrabold text-slate-800 text-base border-b pb-3 flex items-center gap-2">
              <User size={18} className="text-medical-600" />
              Patient Profile
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Age & Gender</span>
                <span className="font-bold text-slate-800">{patient.age} yrs / {patient.gender}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <span className="font-bold text-slate-800">{patient.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium font-medium">Blood Group</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{patient.bloodGroup || 'O+ (Default)'}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 font-medium block mb-1">Address</span>
                <span className="font-medium text-slate-800 block bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {patient.address || 'No address provided.'}
                </span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 font-medium block mb-1">Known Medical History</span>
                <div className="bg-amber-50/70 text-amber-900 p-3 rounded-xl border border-amber-200/80 font-medium">
                  {patient.medicalHistory || 'No prior chronic history registered.'}
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              onClick={() => navigate(`/patients/${patient.id}/new-visit`)}
            >
              <Stethoscope size={16} className="mr-1.5" /> Record Consultation Visit
            </Button>
          </div>
        </div>

        {/* Right 2 Cols: Timeline Visit History */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <Calendar size={20} className="text-teal-600" />
              Clinical Visit History ({visits.length})
            </h2>
          </div>

          {visits.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
              No consultation visits recorded for this patient yet. Click "Start New Consultation" above!
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div key={visit.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-medical-700 font-bold text-sm">
                      <Calendar size={16} />
                      {new Date(visit.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      <span className="text-slate-400 text-xs font-normal">
                        ({new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVisit(visit);
                        setTimeout(() => window.print(), 100);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-medical-50 hover:text-medical-700 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <FileText size={14} /> Print Rx Prescription
                    </button>
                  </div>

                  {/* Vitals Bar */}
                  {visit.vitals && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {visit.vitals.bp && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-medium">
                          BP: <strong>{visit.vitals.bp}</strong>
                        </span>
                      )}
                      {visit.vitals.weight && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-medium">
                          Weight: <strong>{visit.vitals.weight} kg</strong>
                        </span>
                      )}
                      {visit.vitals.temp && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-medium">
                          Temp: <strong>{visit.vitals.temp} °F</strong>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Final Diagnosis</span>
                      <p className="font-extrabold text-slate-900 text-sm">{visit.diagnosis}</p>
                    </div>
                    {visit.symptoms && (
                      <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">Chief Complaints</span>
                        <p className="text-slate-700">{visit.symptoms}</p>
                      </div>
                    )}
                  </div>

                  {/* Prescribed Medications */}
                  {visit.prescriptions?.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">Prescribed Medicines ({visit.prescriptions.length})</span>
                      <div className="flex flex-wrap gap-2">
                        {visit.prescriptions.map((p, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-medical-50 text-medical-800 text-xs font-semibold border border-medical-200/60">
                            {p.medicine} • <span className="text-slate-600 font-normal">{p.dosage} ({p.frequency})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};