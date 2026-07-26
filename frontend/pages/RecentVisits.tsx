import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { visitService, patientService } from '../services/apiService';
import { Visit, Patient } from '../types';

interface VisitWithPatient extends Visit {
  patientName: string;
}

export const RecentVisits: React.FC = () => {
  const navigate = useNavigate();
  const [recentVisits, setRecentVisits] = useState<VisitWithPatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [visits, patients] = await Promise.all([
        visitService.list(),
        patientService.list()
      ]);
      
      // Join patient data
      const joined = visits.map(v => {
        const p = patients.find(pat => pat.id === v.patientId);
        return { ...v, patientName: p ? p.name : 'Unknown Patient' };
      });

      setRecentVisits(joined);
    } catch (error) {
      console.error('Failed to load visits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Recent Visits</h1>
      
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading visits...
            </div>
          ) : recentVisits.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No visits recorded yet.
            </div>
          ) : (
            recentVisits.map(visit => (
              <div 
                key={visit.id} 
                onClick={() => navigate(`/patients/${visit.patientId}`)}
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 group-hover:text-medical-600 transition-colors">
                      {visit.patientName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(visit.date).toLocaleDateString()}
                      </span>
                      <span>{new Date(visit.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-medical-50 text-medical-700 text-xs rounded-full font-medium">
                    {visit.diagnosis}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};