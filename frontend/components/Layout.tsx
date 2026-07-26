import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Stethoscope, 
  Clock, 
  Pill, 
  Repeat, 
  UserCheck, 
  Search,
  Command,
  Sparkles,
  Zap,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { sessionService, settingsService, authService } from '../services/apiService';
import { ClinicSettings, User } from '../types';
import { CommandPaletteModal } from './CommandPaletteModal';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const activeUser = sessionService.getUser();
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [doctorsList, setDoctorsList] = useState<User[]>([]);
  const [showDoctorSwitchModal, setShowDoctorSwitchModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<'DOCTOR' | 'COMPOUNDER'>('DOCTOR');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    settingsService.get().then(setSettings).catch(() => {
      setSettings({
        name: 'MediScript Clinic',
        doctorName: activeUser?.name || 'Dr. Alex Smith',
        specialization: activeUser?.specialization || 'General Physician',
        address: '123 Health Blvd',
        phone: '(555) 123-4567',
        licenseNumber: activeUser?.licenseNumber || 'MD-987654',
        footerText: 'Get well soon!'
      });
    });

    authService.getDoctors().then(setDoctorsList).catch(() => {});
  }, []);

  const handleLogout = () => {
    sessionService.clearUser();
    navigate('/login');
  };

  const handleSwitchDoctor = (doc: User) => {
    sessionService.setUser(doc);
    setShowDoctorSwitchModal(false);
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Global Command Palette (Ctrl + K) */}
      <CommandPaletteModal
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 hidden md:flex flex-col no-print shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-600 to-teal-400 flex items-center justify-center text-white font-extrabold shadow-md shadow-medical-900/40">
              <Stethoscope size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg tracking-tight">MediScript</h1>
              <p className="text-[11px] text-teal-400 font-medium">Clinic Suite</p>
            </div>
          </div>

          {/* Quick Mode Indicator Switch */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <div className="flex bg-slate-950/60 p-1 rounded-xl w-full border border-slate-800">
              <button
                onClick={() => setWorkspaceMode('DOCTOR')}
                className={`flex-1 py-1 rounded-lg font-extrabold text-[10px] transition-all flex items-center justify-center gap-1 ${
                  workspaceMode === 'DOCTOR' 
                    ? 'bg-medical-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Stethoscope size={12} /> Doctor Room
              </button>
              <button
                onClick={() => setWorkspaceMode('COMPOUNDER')}
                className={`flex-1 py-1 rounded-lg font-extrabold text-[10px] transition-all flex items-center justify-center gap-1 ${
                  workspaceMode === 'COMPOUNDER' 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck size={12} /> Front Desk
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive 
                ? 'bg-medical-600 text-white shadow-md shadow-medical-900/30' 
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink 
            to="/queue" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive 
                ? 'bg-medical-600 text-white shadow-md shadow-medical-900/30' 
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Clock size={18} />
            OPD Queue & Vitals
          </NavLink>

          <NavLink 
            to="/patients" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive 
                ? 'bg-medical-600 text-white shadow-md shadow-medical-900/30' 
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Users size={18} />
            Patient Directory
          </NavLink>

          <NavLink 
            to="/inventory" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive 
                ? 'bg-medical-600 text-white shadow-md shadow-medical-900/30' 
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Pill size={18} />
            Pharmacy Stock (₹)
          </NavLink>

          <NavLink 
            to="/visits" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive 
                ? 'bg-medical-600 text-white shadow-md shadow-medical-900/30' 
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <ClipboardList size={18} />
            Recent Consultations
          </NavLink>

          <div className="pt-5 pb-2">
            <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Configuration</p>
          </div>

          {(activeUser?.role === 'ADMIN' || activeUser?.username?.toLowerCase() === 'mahdi') && (
            <NavLink 
              to="/admin" 
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30' 
                  : 'text-indigo-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <ShieldCheck size={18} />
              Super Admin Control
            </NavLink>
          )}

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive 
                ? 'bg-medical-600 text-white shadow-md shadow-medical-900/30' 
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <Settings size={18} />
            Clinic Settings
          </NavLink>
        </nav>

        {/* Doctor User Badge & Switcher */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-medical-600/30 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                <Stethoscope size={16} />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-white text-xs truncate">
                  {activeUser?.name || settings?.doctorName || 'Dr. Alex Smith'}
                </p>
                <p className="text-[10px] text-teal-400 truncate">
                  {activeUser?.specialization || settings?.specialization || 'General Physician'}
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-colors border border-rose-500/20"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
        {/* Modern Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 hidden md:flex items-center justify-between no-print shadow-xs shrink-0">
          {/* Quick Command Palette Search Button */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center gap-3 px-4 py-2 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-slate-500 text-xs font-semibold max-w-md w-full transition-all group"
          >
            <Search size={16} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
            <span className="flex-1 text-left">Search patient name, phone, or ID...</span>
            <kbd className="px-2 py-0.5 bg-white text-[10px] font-mono font-bold text-slate-500 border border-slate-200 rounded-md shadow-xs flex items-center gap-1">
              <Command size={10} /> K
            </kbd>
          </button>

          {/* Right Header Status & Actions */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Live OPD Time */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600">
              <Clock size={14} className="text-teal-600" />
              <span>OPD Time: <strong>{currentTime}</strong></span>
            </div>

            {/* Doctor Active Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-800 rounded-xl border border-teal-200/80 font-bold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span>{activeUser?.name || 'Dr. Alex Smith'}</span>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={() => navigate('/patients')}
              className="px-3.5 py-2 bg-medical-600 text-white rounded-xl font-bold hover:bg-medical-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Zap size={14} /> Quick Rx
            </button>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between no-print shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-medical-600 flex items-center justify-center text-white font-bold">
              <Stethoscope size={16} />
            </div>
            <span className="font-extrabold text-base tracking-tight">MediScript</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCommandPalette(true)} className="p-1.5 bg-slate-800 rounded-lg text-slate-300">
              <Search size={16} />
            </button>
            <NavLink to="/queue" className="text-xs bg-slate-800 px-2.5 py-1.5 rounded-lg text-slate-200">
              Queue
            </NavLink>
            <button onClick={handleLogout} className="text-slate-300 hover:text-white p-1">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable View Container */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Switch Active Doctor Account Modal */}
      {showDoctorSwitchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[150] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Stethoscope size={18} className="text-medical-600" />
                Select Doctor Account
              </h3>
              <button
                onClick={() => setShowDoctorSwitchModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {doctorsList.map(doc => {
                const isSelected = activeUser?.username === doc.username;
                return (
                  <div
                    key={doc.username}
                    onClick={() => handleSwitchDoctor(doc)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-medical-50 border-medical-500 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">{doc.name}</p>
                      <p className="text-[11px] text-slate-500">{doc.specialization} • Lic: {doc.licenseNumber}</p>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-medical-600 text-white">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};