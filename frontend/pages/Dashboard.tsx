import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  PlusCircle, 
  Search, 
  ArrowUpRight, 
  Activity, 
  TrendingUp, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { patientService, visitService, settingsService } from '../services/apiService';
import { Patient, Visit, ClinicSettings } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientsData, visitsData, settingsData] = await Promise.all([
          patientService.getAll(),
          visitService.getAll(),
          settingsService.get().catch(() => null)
        ]);
        setPatients(patientsData);
        setVisits(visitsData);
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v.date && v.date.startsWith(todayStr));
  const recentVisitsList = visits.slice(0, 5);

  const filteredPatients = searchQuery.trim() 
    ? patients.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.phone.includes(searchQuery) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const totalPrescriptionsCount = visits.reduce((acc, v) => acc + (v.prescriptions?.length || 0), 0);

  // Group visits by day of week for simple visual analytics chart
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  visits.forEach(v => {
    if (v.date) {
      const d = new Date(v.date);
      if (!isNaN(d.getTime())) {
        dayCounts[d.getDay()] += 1;
      }
    }
  });
  const maxDayCount = Math.max(...dayCounts, 1);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-medical-800 via-medical-700 to-teal-700 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md border border-white/20">
              <Sparkles size={14} className="text-amber-300" />
              <span>MediScript Clinical Workspace</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {settings?.doctorName || 'Doctor'}
            </h1>
            <p className="text-medical-100 text-sm md:text-base max-w-xl">
              {settings?.name || 'Clinic Management System'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/queue')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-extrabold rounded-xl text-sm shadow-lg hover:brightness-105 transition-all flex items-center gap-2 active:scale-95 border border-amber-300"
            >
              <Clock size={16} />
              OPD Queue & Vitals
            </button>
            <button
              onClick={() => navigate('/patients')}
              className="px-4 py-2.5 bg-white text-medical-800 font-semibold rounded-xl text-sm shadow-md hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
            >
              <Users size={16} />
              Patient Directory
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-12 w-48 h-48 bg-medical-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Quick Search & Consultation Shortcut */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search patient by name, phone, or ID to start Rx..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-500 text-sm transition-all"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400 hidden md:inline uppercase tracking-wider">or</span>
          <button
            onClick={() => navigate('/patients')}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <PlusCircle size={16} />
            Add New Patient
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchQuery.trim() !== '' && (
          <div className="mt-3 divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(p => (
                <div key={p.id} className="p-3 hover:bg-medical-50/50 flex items-center justify-between transition-colors">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.gender} • {p.age} yrs • Phone: {p.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/patients/${p.id}`)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100"
                    >
                      History
                    </button>
                    <button
                      onClick={() => navigate(`/patients/${p.id}/new-visit`)}
                      className="px-3 py-1.5 bg-medical-600 text-white text-xs font-semibold rounded-lg hover:bg-medical-700 flex items-center gap-1"
                    >
                      <Stethoscope size={13} />
                      Write Rx
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400 text-sm">
                No matching patients found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Executive Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Patients</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-800">{loading ? '...' : patients.length}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp size={12} /> Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Registered in clinic system</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Visits</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-800">{loading ? '...' : todayVisits.length}</span>
            <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Clock size={12} /> Today
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Consultations recorded today</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Consultations</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Activity size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-800">{loading ? '...' : visits.length}</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              All time
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Total visit records in database</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Prescriptions</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-800">{loading ? '...' : totalPrescriptionsCount}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Issued
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Individual medications prescribed</p>
        </div>
      </div>

      {/* Main Grid: Activity & Recent Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Consultations & Weekly Analytics */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Consultations Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Stethoscope size={20} className="text-medical-600" />
                  Recent Patient Consultations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Latest visits and diagnosis summary</p>
              </div>
              <button
                onClick={() => navigate('/visits')}
                className="text-xs font-semibold text-medical-600 hover:text-medical-700 flex items-center gap-1 hover:underline"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Loading recent consultations...</div>
              ) : recentVisitsList.length > 0 ? (
                recentVisitsList.map((v) => {
                  const patient = patients.find(p => p.id === v.patientId);
                  return (
                    <div key={v.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">
                            {patient ? patient.name : `Patient ID: ${v.patientId}`}
                          </span>
                          {patient && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-medium">
                              {patient.gender}, {patient.age} yrs
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          <strong className="text-slate-700">Diagnosis:</strong> {v.diagnosis || 'General Checkup'}
                        </p>
                        {v.symptoms && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            Symptoms: {v.symptoms}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                        <div className="text-right hidden sm:block">
                          <span className="text-xs text-slate-400 block">
                            {v.date ? new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            {v.prescriptions?.length || 0} Rx items
                          </span>
                        </div>
                        {patient && (
                          <button
                            onClick={() => navigate(`/patients/${patient.id}`)}
                            className="p-2 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-xl transition-colors"
                            title="View Patient Record"
                          >
                            <ArrowUpRight size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No consultation records yet. Select a patient to record a visit!
                </div>
              )}
            </div>
          </div>

          {/* Weekly Visit Distribution Analytics */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <TrendingUp size={18} className="text-teal-600" />
                  Weekly Patient Volume Trends
                </h3>
                <p className="text-xs text-slate-500">Distribution of visits across days of the week</p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 items-end h-36 pt-4">
              {daysOfWeek.map((day, idx) => {
                const count = dayCounts[idx];
                const heightPercent = Math.max((count / maxDayCount) * 100, 12);
                return (
                  <div key={day} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {count}
                    </span>
                    <div 
                      className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 ${
                        count > 0 
                          ? 'bg-gradient-to-t from-medical-600 to-teal-400 shadow-sm group-hover:from-medical-700 group-hover:to-teal-500' 
                          : 'bg-slate-100'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs font-medium text-slate-500 mt-1">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Clinic Quick Info & Reminders */}
        <div className="space-y-6">
          {/* Doctor Details Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-medical-500/20 border border-medical-400/30 flex items-center justify-center text-medical-300 text-xl font-bold">
                {settings?.doctorName ? settings.doctorName.charAt(0) : 'D'}
              </div>
              <div>
                <h4 className="font-bold text-base">{settings?.doctorName || 'Dr. Alex Smith'}</h4>
                <p className="text-xs text-medical-300">{settings?.specialization || 'General Physician'}</p>
                <p className="text-xs text-slate-400 mt-0.5">Lic: {settings?.licenseNumber || 'MD-987654'}</p>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-700/60 space-y-3 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Clinic Name:</span>
                <span className="font-medium text-white">{settings?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-medium text-white">{settings?.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Database Engine:</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono text-[11px]">
                  PostgreSQL Active
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/settings')}
              className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition-colors"
            >
              Update Clinic Details
            </button>
          </div>

          {/* Quick Clinical Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Doctor Quick Checklist
            </h4>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-2.5 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-medical-600 focus:ring-medical-500 mt-0.5" />
                <span>Verify patient allergies & medical history before prescribing</span>
              </label>
              <label className="flex items-start gap-2.5 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-medical-600 focus:ring-medical-500 mt-0.5" />
                <span>Log vitals (BP, Weight, Temp, BMI) for accurate records</span>
              </label>
              <label className="flex items-start gap-2.5 text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-medical-600 focus:ring-medical-500 mt-0.5" />
                <span>Use 1-click templates for fast medication entry</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
