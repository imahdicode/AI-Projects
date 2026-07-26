import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  Stethoscope, 
  Clock, 
  Package, 
  Settings, 
  Plus, 
  FileText, 
  Sparkles,
  Command,
  ArrowRight
} from 'lucide-react';
import { patientService } from '../services/apiService';
import { Patient } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    if (isOpen) {
      patientService.getAll().then(setPatients).catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredPatients = query.trim()
    ? patients.filter(p => 
        (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
        (p.phone && p.phone.includes(query)) ||
        (p.id && p.id.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  const handleSelectRoute = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 z-[200] p-4 font-sans no-print animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden space-y-3">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="text-teal-600 shrink-0" size={20} />
          <input
            autoFocus
            type="text"
            placeholder="Search patient name, phone, ID, or type a command... (Esc to close)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-sm font-semibold bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
          />
          <kbd className="px-2 py-1 bg-slate-200/80 text-[10px] font-mono font-bold text-slate-600 rounded-md shrink-0">
            ESC
          </kbd>
        </div>

        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Patient Search Results */}
          {query.trim() !== '' && (
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Matching Patients ({filteredPatients.length})
              </span>
              {filteredPatients.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-2">No matching patients found.</p>
              ) : (
                filteredPatients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectRoute(`/patients/${p.id}/new-visit`)}
                    className="p-3 rounded-2xl hover:bg-teal-50/80 border border-slate-100 hover:border-teal-200 transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs group-hover:text-teal-700 transition-colors">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {p.gender}, {p.age} yrs • ID: {p.id} • Phone: {p.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-teal-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Write Rx <ArrowRight size={14} />
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Quick Actions & Navigation */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Quick Shortcuts & Navigation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleSelectRoute('/queue')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-100 hover:border-teal-200 flex items-center gap-2.5 text-slate-800 font-bold text-left transition-all"
              >
                <Clock size={16} className="text-amber-500" />
                <span>Doctor OPD Queue</span>
              </button>

              <button
                onClick={() => handleSelectRoute('/patients')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-100 hover:border-teal-200 flex items-center gap-2.5 text-slate-800 font-bold text-left transition-all"
              >
                <User size={16} className="text-medical-600" />
                <span>Patient Directory</span>
              </button>

              <button
                onClick={() => handleSelectRoute('/inventory')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-100 hover:border-teal-200 flex items-center gap-2.5 text-slate-800 font-bold text-left transition-all"
              >
                <Package size={16} className="text-emerald-600" />
                <span>Pharmacy Stock (₹)</span>
              </button>

              <button
                onClick={() => handleSelectRoute('/settings')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-100 hover:border-teal-200 flex items-center gap-2.5 text-slate-800 font-bold text-left transition-all"
              >
                <Settings size={16} className="text-slate-600" />
                <span>Clinic Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-100/70 border-t text-[11px] text-slate-500 flex items-center justify-between px-4">
          <span className="flex items-center gap-1.5 font-medium">
            <Command size={12} className="text-slate-400" /> Pro-Tip: Press <kbd className="font-mono bg-white px-1.5 py-0.5 border rounded">Ctrl + K</kbd> anywhere to open
          </span>
          <span className="font-bold text-teal-700">MediScript OPD Express</span>
        </div>
      </div>
    </div>
  );
};
