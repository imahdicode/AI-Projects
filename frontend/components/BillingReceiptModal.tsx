import React, { useState } from 'react';
import { Printer, X, Receipt, CheckCircle2 } from 'lucide-react';
import { Patient, Visit, User, ClinicSettings } from '../types';

interface BillingReceiptModalProps {
  visit: Visit;
  patient: Patient;
  doctor?: User | null;
  settings?: ClinicSettings | null;
  onClose: () => void;
}

export const BillingReceiptModal: React.FC<BillingReceiptModalProps> = ({
  visit,
  patient,
  doctor,
  settings,
  onClose
}) => {
  const [consultationFee, setConsultationFee] = useState<number>(300);
  const [medicineCost, setMedicineCost] = useState<number>(() => {
    return (visit.prescriptions?.length || 0) * 80;
  });
  const [discount, setDiscount] = useState<number>(0);

  const grandTotal = Math.max(0, (consultationFee + medicineCost) - discount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Controls Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/70 no-print">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Clinic Payment Receipt & Invoice Generator</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Input Controls (Hidden on print) */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 grid grid-cols-3 gap-3 text-xs no-print">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Consultation Fee (Rs. ₹)</label>
            <input
              type="number"
              value={consultationFee}
              onChange={e => setConsultationFee(Number(e.target.value))}
              className="w-full px-3 py-1.5 border rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Medicine Charges (Rs. ₹)</label>
            <input
              type="number"
              value={medicineCost}
              onChange={e => setMedicineCost(Number(e.target.value))}
              className="w-full px-3 py-1.5 border rounded-xl font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Discount (Rs. ₹)</label>
            <input
              type="number"
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
              className="w-full px-3 py-1.5 border rounded-xl font-bold text-rose-600"
            />
          </div>
        </div>

        {/* Printable Official Receipt Layout */}
        <div className="p-8 space-y-6 bg-white text-slate-900">
          {/* Receipt Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-extrabold text-medical-800">{settings?.name || 'MediScript Clinic'}</h2>
              <p className="text-xs text-slate-600 font-semibold">{settings?.address} • Tel: {settings?.phone}</p>
              <p className="text-xs text-slate-500 mt-1">Doctor: {doctor?.name || settings?.doctorName || 'Dr. Alex Smith'}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                PAID RECEIPT
              </span>
              <p className="text-[11px] text-slate-500 mt-2 font-mono">Invoice #: INV-{visit.id.slice(0, 6).toUpperCase()}</p>
              <p className="text-[11px] text-slate-500 font-medium">Date: {new Date(visit.date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Patient Row */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Age / Gender</span>
              <span className="font-bold text-slate-900">{patient.age} yrs / {patient.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Phone</span>
              <span className="font-bold text-slate-900">{patient.phone}</span>
            </div>
          </div>

          {/* Fee Items Table */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider border-b pb-1">Billing Summary</h4>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="p-2 font-bold">Service / Item</th>
                  <th className="p-2 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-2 text-slate-900">Doctor Consultation & Clinical Checkup ({visit.diagnosis})</td>
                  <td className="p-2 text-right font-bold">₹{consultationFee.toFixed(2)}</td>
                </tr>
                {visit.prescriptions?.length > 0 && (
                  <tr>
                    <td className="p-2 text-slate-900">Dispensed Pharmacy Medicines ({visit.prescriptions.length} items)</td>
                    <td className="p-2 text-right font-bold">₹{medicineCost.toFixed(2)}</td>
                  </tr>
                )}
                {discount > 0 && (
                  <tr className="text-rose-600 font-bold">
                    <td className="p-2">Special Discount / Adjustment</td>
                    <td className="p-2 text-right">-₹{discount.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total */}
          <div className="pt-4 border-t-2 border-slate-800 flex justify-between items-center text-slate-900">
            <span className="font-extrabold text-sm uppercase">Total Payment Received:</span>
            <span className="text-2xl font-extrabold text-emerald-700">₹{grandTotal.toFixed(2)}</span>
          </div>

          {/* Counter Signature */}
          <div className="pt-8 flex justify-between items-end text-[11px] border-t border-slate-200">
            <p className="text-slate-400 italic">Thank you for choosing {settings?.name || 'MediScript Clinic'}!</p>
            <div className="text-center">
              <div className="border-b border-slate-400 w-36 inline-block mb-1" />
              <p className="font-bold text-slate-800">Reception / Billing Desk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
