import React, { useState } from 'react';
import { Printer, X, FileCheck, ShieldCheck } from 'lucide-react';
import { Patient, User, ClinicSettings } from '../types';

interface MedicalCertificateModalProps {
  patient: Patient;
  doctor?: User | null;
  settings?: ClinicSettings | null;
  onClose: () => void;
}

export const MedicalCertificateModal: React.FC<MedicalCertificateModalProps> = ({
  patient,
  doctor,
  settings,
  onClose
}) => {
  const [diagnosis, setDiagnosis] = useState('Acute Febrile Illness / Rest Required');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [remarks, setRemarks] = useState('Patient is advised rest and to refrain from strenuous activities.');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Controls Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 no-print">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-teal-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Doctor's Medical Certificate Generator</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} /> Print Certificate
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Input Controls (Hidden when printing) */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/30 space-y-3 text-xs no-print">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Diagnosis / Reason</label>
              <input
                type="text"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Rest From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Rest To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Special Remarks / Advice</label>
            <input
              type="text"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* Printable Official Medical Certificate Layout */}
        <div className="p-8 md:p-12 space-y-8 font-sans text-slate-900 bg-white">
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-800 pb-6 text-center space-y-1">
            <h1 className="text-2xl font-extrabold text-medical-800 uppercase tracking-tight">{settings?.name || 'MediScript Clinic'}</h1>
            <p className="text-xs text-slate-600 font-semibold">{settings?.address} • Phone: {settings?.phone}</p>
            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase pt-2 text-slate-800">
              Official Medical Fitness & Rest Certificate
            </p>
          </div>

          {/* Certificate Body Statement */}
          <div className="space-y-6 text-sm leading-relaxed text-slate-800 pt-4">
            <p className="text-right text-xs font-semibold text-slate-500">Date: {new Date().toLocaleDateString()}</p>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <p className="text-base font-serif">
                This is to certify that Mr. / Ms. <strong className="text-slate-900 font-bold text-lg underline">{patient.name}</strong>, 
                aged <strong>{patient.age} years</strong>, ({patient.gender}), residing at {patient.address || 'Wellness City'}, 
                has been under my medical examination and care.
              </p>

              <p className="text-base font-serif">
                He / She is diagnosed with <strong className="text-slate-900 font-bold">{diagnosis}</strong> and is medically advised rest for recovery from{' '}
                <strong className="text-slate-900 font-bold">{new Date(fromDate).toLocaleDateString()}</strong> to{' '}
                <strong className="text-slate-900 font-bold">{new Date(toDate).toLocaleDateString()}</strong> inclusive.
              </p>

              {remarks && (
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                  <strong>Remarks:</strong> {remarks}
                </p>
              )}
            </div>
          </div>

          {/* Signature & Doctor Metadata Footer */}
          <div className="pt-16 flex justify-between items-end text-xs border-t border-slate-200">
            <div>
              <p className="text-slate-400 font-medium">Ref ID: CERT-{patient.id.slice(0, 6).toUpperCase()}</p>
              <p className="text-[10px] text-slate-300">Generated by MediScript EHR Platform</p>
            </div>

            <div className="text-center space-y-8">
              <div className="border-b border-slate-400 w-44 inline-block" />
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{doctor?.name || settings?.doctorName || 'Dr. Alex Smith'}</p>
                <p className="text-xs text-slate-600">{doctor?.specialization || settings?.specialization || 'General Physician'}</p>
                <p className="text-[11px] text-slate-400 font-mono">Reg Lic No: {doctor?.licenseNumber || settings?.licenseNumber || 'MD-987654'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
