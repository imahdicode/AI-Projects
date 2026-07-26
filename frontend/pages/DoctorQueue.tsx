import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  Plus, 
  Search, 
  Play, 
  Printer, 
  Activity,
  Ticket
} from 'lucide-react';
import { patientService, sessionService, queueService } from '../services/apiService';
import { Patient, QueueItem, Vitals } from '../types';

export const DoctorQueue: React.FC = () => {
  const navigate = useNavigate();
  const activeDoctor = sessionService.getUser();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTokenToPrint, setSelectedTokenToPrint] = useState<QueueItem | null>(null);

  // Reception Pre-fill Vitals Form State
  const [receptionVitals, setReceptionVitals] = useState<Vitals>({
    bp: '120/80',
    weight: '70',
    temp: '98.6',
    height: '170'
  });

  useEffect(() => {
    const fetchPatientsAndQueue = async () => {
      try {
        setLoading(true);
        const [pData, qData] = await Promise.all([
          patientService.getAll(),
          queueService.list()
        ]);
        setPatients(pData);
        if (activeDoctor && activeDoctor.role !== 'ADMIN' && activeDoctor.username?.toLowerCase() !== 'mahdi') {
          setQueue(qData.filter(q => !q.doctorId || q.doctorId === activeDoctor.id));
        } else {
          setQueue(qData);
        }
      } catch (err) {
        console.error('Failed to load queue:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientsAndQueue();
  }, []);

  const handleAddToQueue = async (patient: Patient) => {
    if (queue.some(q => q.patientId === patient.id && q.status !== 'COMPLETED')) {
      alert(`${patient.name} is already in today's active queue!`);
      return;
    }

    const nextToken = queue.length + 1;
    const newItem: Partial<QueueItem> = {
      patientId: patient.id,
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      status: 'WAITING',
      registeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokenNumber: nextToken,
      doctorId: activeDoctor?.id,
      vitals: { ...receptionVitals }
    };

    const saved = await queueService.create(newItem);
    setQueue(prev => [...prev, saved]);
    setSelectedTokenToPrint(saved);
  };

  const handleStatusChange = async (queueId: string, newStatus: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED') => {
    setQueue(prev => prev.map(q => q.id === queueId ? { ...q, status: newStatus } : q));
    await queueService.update(queueId, { status: newStatus });
  };

  const handleRemoveFromQueue = async (queueId: string) => {
    setQueue(prev => prev.filter(q => q.id !== queueId));
    await queueService.delete(queueId);
  };

  const waitingList = queue.filter(q => q.status === 'WAITING');
  const inConsultationList = queue.filter(q => q.status === 'IN_CONSULTATION');
  const completedList = queue.filter(q => q.status === 'COMPLETED');

  const filteredPatients = search.trim()
    ? patients.filter(p => (p.name && p.name.toLowerCase().includes(search.toLowerCase())) || (p.phone && p.phone.includes(search)))
    : patients.slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Printable Token Ticket (Only visible when printing) */}
      {selectedTokenToPrint && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col hidden print-only p-8 font-sans text-slate-900">
          <div className="border-2 border-dashed border-slate-800 p-6 max-w-sm mx-auto text-center space-y-4 rounded-xl">
            <h2 className="text-xl font-extrabold text-medical-800 uppercase">MediScript Clinic Token</h2>
            <p className="text-xs text-slate-500">Reception Waiting Slip</p>

            <div className="my-4 py-3 bg-slate-100 rounded-2xl border">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Token Number</span>
              <span className="text-5xl font-extrabold text-slate-900 font-mono">#{selectedTokenToPrint.tokenNumber}</span>
            </div>

            <div className="text-xs space-y-1 text-slate-700 font-medium">
              <p><strong>Patient:</strong> {selectedTokenToPrint.patientName} ({selectedTokenToPrint.gender}, {selectedTokenToPrint.age} yrs)</p>
              <p><strong>Arrival Time:</strong> {selectedTokenToPrint.registeredAt}</p>
              {selectedTokenToPrint.vitals?.bp && <p><strong>Recorded BP:</strong> {selectedTokenToPrint.vitals.bp}</p>}
            </div>

            <p className="text-[10px] text-slate-400 pt-4 border-t border-slate-200">
              Please wait until your token number is called into the consultation room.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Reception Patient Queue & Vitals</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Compounder Counter
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Register arrival, pre-fill initial vitals, and issue token tickets for the doctor room.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-amber-50 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 flex items-center gap-2">
            <Clock size={16} className="text-amber-600" />
            <span>Waiting: {waitingList.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-teal-50 rounded-xl text-xs font-bold text-teal-800 border border-teal-200 flex items-center gap-2">
            <Stethoscope size={16} className="text-teal-600" />
            <span>In Room: {inConsultationList.length}</span>
          </div>
        </div>
      </div>

      {/* Compounder Registration & Vitals Entry Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 no-print">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <Activity size={18} className="text-teal-600" />
          Reception Pre-Fill Vitals & Token Generator
        </h3>

        {/* Compounder Speed Vitals Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-600">BP (mmHg)</label>
              <button onClick={() => setReceptionVitals({...receptionVitals, bp: '120/80'})} className="text-[10px] text-teal-600 hover:underline">120/80</button>
            </div>
            <input
              type="text"
              value={receptionVitals.bp}
              onChange={e => setReceptionVitals({ ...receptionVitals, bp: e.target.value })}
              className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-medium text-xs"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-600">Weight (kg)</label>
            </div>
            <input
              type="text"
              value={receptionVitals.weight}
              onChange={e => setReceptionVitals({ ...receptionVitals, weight: e.target.value })}
              className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-medium text-xs"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-600">Temp (°F)</label>
              <button onClick={() => setReceptionVitals({...receptionVitals, temp: '98.6'})} className="text-[10px] text-teal-600 hover:underline">98.6°F</button>
            </div>
            <input
              type="text"
              value={receptionVitals.temp}
              onChange={e => setReceptionVitals({ ...receptionVitals, temp: e.target.value })}
              className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-medium text-xs"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-slate-600">Height (cm)</label>
            </div>
            <input
              type="text"
              value={receptionVitals.height}
              onChange={e => setReceptionVitals({ ...receptionVitals, height: e.target.value })}
              className="w-full px-2.5 py-1.5 border rounded-lg bg-white font-medium text-xs"
            />
          </div>
        </div>

        {/* Patient Lookup */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search patient name or phone to add to queue..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
          />
        </div>

        {search.trim() !== '' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
            {filteredPatients.map(p => (
              <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-xs">{p.name}</p>
                  <p className="text-[11px] text-slate-500">{p.gender}, {p.age} yrs • Phone: {p.phone}</p>
                </div>
                <button
                  onClick={() => {
                    handleAddToQueue(p);
                    setSearch('');
                  }}
                  className="px-3 py-1 bg-medical-600 text-white text-xs font-bold rounded-lg hover:bg-medical-700 transition-colors"
                >
                  + Add & Issue Token
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3 Queue Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
        {/* Column 1: Waiting Room */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Waiting Room ({waitingList.length})
            </h3>
          </div>

          <div className="space-y-3">
            {waitingList.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs italic">
                No patients in waiting room.
              </div>
            ) : (
              waitingList.map(q => (
                <div key={q.id} className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center">
                      #{q.tokenNumber}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedTokenToPrint(q);
                        setTimeout(() => window.print(), 100);
                      }}
                      className="px-2 py-1 bg-white border text-[10px] font-bold text-slate-700 rounded-md hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Ticket size={11} /> Print Ticket
                    </button>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{q.patientName}</h4>
                    <p className="text-xs text-slate-500">{q.gender}, {q.age} yrs</p>
                    {q.vitals?.bp && (
                      <p className="text-[11px] text-teal-700 font-semibold mt-1 bg-teal-50 px-2 py-0.5 rounded inline-block">
                        Pre-filled BP: {q.vitals.bp} | Wt: {q.vitals.weight}kg
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleStatusChange(q.id, 'IN_CONSULTATION')}
                      className="flex-1 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-lg hover:bg-teal-700 flex items-center justify-center gap-1"
                    >
                      <Play size={13} /> Call to Room
                    </button>
                    <button
                      onClick={() => handleRemoveFromQueue(q.id)}
                      className="px-2 py-1.5 text-xs text-slate-400 hover:text-rose-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Consultation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <Stethoscope size={18} className="text-teal-600" />
              In Consultation ({inConsultationList.length})
            </h3>
          </div>

          <div className="space-y-3">
            {inConsultationList.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs italic">
                No active consultation. Click "Call to Room" above.
              </div>
            ) : (
              inConsultationList.map(q => (
                <div key={q.id} className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center">
                      #{q.tokenNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-600 text-white animate-pulse">
                      In Room Now
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{q.patientName}</h4>
                    <p className="text-xs text-slate-600">{q.gender}, {q.age} yrs</p>
                  </div>

                  <button
                    onClick={() => {
                      handleStatusChange(q.id, 'COMPLETED');
                      navigate(`/patients/${q.patientId}/new-visit`);
                    }}
                    className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Stethoscope size={14} /> Open Doctor Rx Screen
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Completed Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" />
              Completed ({completedList.length})
            </h3>
          </div>

          <div className="space-y-3">
            {completedList.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs italic">
                No consultations completed yet.
              </div>
            ) : (
              completedList.map(q => (
                <div key={q.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">#{q.tokenNumber} • {q.patientName}</span>
                    <p className="text-[11px] text-slate-500">{q.gender}, {q.age} yrs</p>
                  </div>
                  <button
                    onClick={() => navigate(`/patients/${q.patientId}`)}
                    className="px-2.5 py-1 bg-white border text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-100"
                  >
                    History
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
