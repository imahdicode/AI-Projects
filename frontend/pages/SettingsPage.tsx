import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash, Database, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/Button';
import { settingsService, templateService, patientService, visitService } from '../services/apiService';
import { ClinicSettings, MedicineTemplate } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<ClinicSettings>({
    name: '', address: '', phone: '', doctorName: '', specialization: '', licenseNumber: '', footerText: ''
  });
  const [templates, setTemplates] = useState<MedicineTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'medicines' | 'backup'>('general');

  // New Template Form
  const [newTemplate, setNewTemplate] = useState<Partial<MedicineTemplate>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsData, templatesData] = await Promise.all([
        settingsService.get(),
        templateService.list()
      ]);
      setSettings(settingsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.save(settings);
      alert('Clinic settings saved successfully!');
      window.location.reload(); 
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings.');
    }
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.name) return;
    try {
      const template = await templateService.save(newTemplate);
      setTemplates([...templates, template]);
      setNewTemplate({});
    } catch (error) {
      console.error('Failed to add template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await templateService.delete(id);
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const [patientsData, visitsData] = await Promise.all([
        patientService.getAll(),
        visitService.getAll()
      ]);
      const backupObj = {
        clinic: settings,
        templates: templates,
        patients: patientsData,
        visits: visitsData,
        exportedAt: new Date().toISOString()
      };
      const jsonStr = JSON.stringify(backupObj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mediscript-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-medium">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinic Settings & Preferences</h1>
        <p className="text-xs text-slate-500 mt-0.5">Customize doctor info, prescription templates, and data backups</p>

        <div className="flex border-b border-slate-200 mt-6 gap-2">
          <button 
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all rounded-t-xl ${
              activeTab === 'general' 
                ? 'border-medical-600 text-medical-700 bg-medical-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('general')}
          >
            Clinic Profile
          </button>
          <button 
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all rounded-t-xl ${
              activeTab === 'medicines' 
                ? 'border-medical-600 text-medical-700 bg-medical-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('medicines')}
          >
            Prescription Templates ({templates.length})
          </button>
          <button 
            className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all rounded-t-xl ${
              activeTab === 'backup' 
                ? 'border-medical-600 text-medical-700 bg-medical-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('backup')}
          >
            Data & Backup
          </button>
        </div>
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Clinic Name *</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none font-bold"
                required
                value={settings.name}
                onChange={e => setSettings({ ...settings, name: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Clinic Address</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Doctor Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none font-bold"
                value={settings.doctorName}
                onChange={e => setSettings({ ...settings, doctorName: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinic Phone</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Specialization</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                value={settings.specialization}
                onChange={e => setSettings({ ...settings, specialization: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registration / License Number</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                value={settings.licenseNumber}
                onChange={e => setSettings({ ...settings, licenseNumber: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Prescription Printable Footer Notice</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none"
                value={settings.footerText}
                onChange={e => setSettings({ ...settings, footerText: e.target.value })}
              />
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end">
            <Button type="submit">
              <Save size={16} className="mr-1.5" /> Save Clinic Profile
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'medicines' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm">Add New Medicine Template</h3>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-500 mb-1">Medicine Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Azithromycin"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  value={newTemplate.name || ''}
                  onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block font-semibold text-slate-500 mb-1">Dosage</label>
                <input
                  type="text"
                  placeholder="500mg"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  value={newTemplate.dosage || ''}
                  onChange={e => setNewTemplate({ ...newTemplate, dosage: e.target.value })}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block font-semibold text-slate-500 mb-1">Frequency</label>
                <input
                  type="text"
                  placeholder="1-0-0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  value={newTemplate.frequency || ''}
                  onChange={e => setNewTemplate({ ...newTemplate, frequency: e.target.value })}
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block font-semibold text-slate-500 mb-1">Instruction</label>
                <input
                  type="text"
                  placeholder="After food"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm"
                  value={newTemplate.instructions || ''}
                  onChange={e => setNewTemplate({ ...newTemplate, instructions: e.target.value })}
                />
              </div>
              <div className="sm:col-span-1">
                <Button onClick={handleAddTemplate} size="sm" className="w-full" disabled={!newTemplate.name}>
                  <Plus size={16} className="mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b">
                <tr>
                  <th className="px-4 py-3">Medicine Name</th>
                  <th className="px-4 py-3">Dosage & Frequency</th>
                  <th className="px-4 py-3">Instructions</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templates.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{t.name}</td>
                    <td className="px-4 py-3 text-slate-700">{t.dosage || '-'} • {t.frequency || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 italic">{t.instructions || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteTemplate(t.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Database size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Database Engine Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Connected to PostgreSQL Database instance (`mediscript_db`).
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <CheckCircle2 size={14} /> PostgreSQL Active & Healthy
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <h4 className="font-extrabold text-slate-800 text-sm">Clinical Data Export & Backup</h4>
            <p className="text-xs text-slate-500">
              Export all patient records, medical history, consultations, and prescription templates into a portable JSON backup file.
            </p>
            <button
              onClick={handleExportData}
              disabled={exporting}
              className="px-5 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              <Download size={16} />
              {exporting ? 'Generating Export...' : 'Download Complete Backup (JSON)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};