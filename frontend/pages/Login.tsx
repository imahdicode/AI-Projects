import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, ShieldCheck, Building2, User, Lock, Key, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { authService, sessionService, settingsService, clinicBranchService } from '../services/apiService';
import { ClinicBranch } from '../types';

type PortalMode = 'CLINIC' | 'FIRST_LOGIN' | 'ADMIN';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [portalMode, setPortalMode] = useState<PortalMode>('CLINIC');

  // DB Branches State
  const [dbBranches, setDbBranches] = useState<ClinicBranch[]>([]);
  const [selectedBranchName, setSelectedBranchName] = useState('');

  // Doctor Credentials State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Admin Credentials State (Mahdi)
  const [adminUsername, setAdminUsername] = useState('mahdi');
  const [adminPassword, setAdminPassword] = useState('');

  // First Login / Activation State
  const [activateLicense, setActivateLicense] = useState('');
  const [activateUsername, setActivateUsername] = useState('');
  const [activatePassword, setActivatePassword] = useState('');
  const [activateConfirm, setActivateConfirm] = useState('');
  const [activateSuccess, setActivateSuccess] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clinicBranchService.list().then(branches => {
      setDbBranches(branches);
      if (branches.length > 0) {
        setSelectedBranchName(branches[0].name);
      }
    }).catch(() => {});
  }, []);

  const handleClinicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const user = await authService.login(username, password);
      if (user.role === 'ADMIN') {
        setError('Super Admin account detected. Please click the "Admin" tab to sign in.');
        setLoading(false);
        return;
      }
      sessionService.setUser(user);

      // Save selected clinic branch setting
      try {
        const existingSettings = await settingsService.get().catch(() => null);
        await settingsService.save({
          name: selectedBranchName || existingSettings?.name || 'MediScript Healthcare Clinic',
          doctorName: user.name || 'Dr. Practitioner',
          specialization: user.specialization || 'General Physician',
          address: existingSettings?.address || 'Healthcare Blvd',
          phone: existingSettings?.phone || '(555) 123-4567',
          licenseNumber: user.licenseNumber || 'MD-1001',
          footerText: 'Get well soon!'
        });
      } catch (e) {}

      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.message?.includes('API Error') ? err.message.split(' - ')[1] : 'Invalid username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setError('Please enter admin credentials.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const adminUser = await authService.login(adminUsername, adminPassword);
      if (adminUser.role !== 'ADMIN') {
        setError('Access Denied: Only Super Admin credentials permitted.');
        setLoading(false);
        return;
      }
      sessionService.setUser(adminUser);
      navigate('/admin');
    } catch (err: any) {
      const msg = err?.message?.includes('API Error') ? err.message.split(' - ')[1] : 'Admin authentication failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!activateLicense.trim() || !activateUsername.trim() || !activatePassword.trim()) {
      setError('All fields are required.');
      return;
    }
    if (activatePassword !== activateConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (activatePassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await authService.activateAccount({
        licenseNumber: activateLicense.trim(),
        username: activateUsername.trim().toLowerCase(),
        password: activatePassword,
      });
      setActivateSuccess(true);
    } catch (err: any) {
      const msg = err?.message?.includes('API Error') ? err.message.split(' - ')[1] : 'Activation failed. Please check your license number.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (mode: PortalMode) => {
    setPortalMode(mode);
    setError('');
    setActivateSuccess(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden space-y-6 p-8">
        
        {/* Brand Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-teal-700/20">
            <Stethoscope size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">MediScript</h1>
          <p className="text-xs text-slate-500 font-medium">Clinic & EHR System</p>
        </div>

        {/* 3-Tab Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1">
          <button
            type="button"
            onClick={() => switchTab('CLINIC')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              portalMode === 'CLINIC'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Stethoscope size={13} className={portalMode === 'CLINIC' ? 'text-teal-600' : ''} />
            <span>Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('FIRST_LOGIN')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              portalMode === 'FIRST_LOGIN'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <KeyRound size={13} />
            <span>First Login</span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('ADMIN')}
            className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
              portalMode === 'ADMIN'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck size={13} className={portalMode === 'ADMIN' ? 'text-indigo-400' : ''} />
            <span>Admin</span>
          </button>
        </div>

        {/* PORTAL 1: DOCTOR LOGIN */}
        {portalMode === 'CLINIC' && (
          <form onSubmit={handleClinicLogin} className="space-y-4">
            {/* Database-Driven Clinic Branch Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 size={14} className="text-teal-600" />
                Select Clinic Branch
              </label>
              <select
                value={selectedBranchName}
                onChange={(e) => setSelectedBranchName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-900"
              >
                {dbBranches.map(b => (
                  <option key={b.id} value={b.name}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username or License Number</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium bg-slate-50 focus:bg-white text-slate-900"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or license number (e.g. MCI-2026-4521)"
                />
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-900"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-3.5 py-2 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-[11px] text-slate-400">
              First time here?{' '}
              <button type="button" onClick={() => switchTab('FIRST_LOGIN')} className="text-amber-600 font-bold hover:underline">
                Activate your account →
              </button>
            </p>
          </form>
        )}

        {/* PORTAL 2: FIRST LOGIN / ACCOUNT ACTIVATION */}
        {portalMode === 'FIRST_LOGIN' && (
          <div className="space-y-4">
            {activateSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Account Activated!</h3>
                  <p className="text-xs text-slate-500 mt-1">Your account is now active. You can sign in with your new credentials.</p>
                </div>
                <Button
                  type="button"
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl"
                  onClick={() => switchTab('CLINIC')}
                >
                  Go to Doctor Login →
                </Button>
              </div>
            ) : (
              <>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  <p className="font-bold mb-1">🔑 First Time Setup</p>
                  <p>Enter the <strong>License Number</strong> given to you by your admin. Then choose your username and password.</p>
                </div>

                <form onSubmit={handleActivateAccount} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Key size={13} className="text-amber-600" /> License Number
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono bg-slate-50 focus:bg-white text-slate-900"
                      value={activateLicense}
                      onChange={(e) => setActivateLicense(e.target.value)}
                      placeholder="e.g. MCI-2026-4521"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Choose Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none font-medium bg-slate-50 focus:bg-white text-slate-900"
                        value={activateUsername}
                        onChange={(e) => setActivateUsername(e.target.value)}
                        placeholder="e.g. dr.kapoor"
                      />
                      <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Set Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50 focus:bg-white text-slate-900"
                        value={activatePassword}
                        onChange={(e) => setActivatePassword(e.target.value)}
                        placeholder="Min. 6 characters"
                      />
                      <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50 focus:bg-white text-slate-900"
                        value={activateConfirm}
                        onChange={(e) => setActivateConfirm(e.target.value)}
                        placeholder="••••••••"
                      />
                      <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 px-3.5 py-2 rounded-xl text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <Button type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs" disabled={loading}>
                    {loading ? 'Activating...' : 'Activate My Account'}
                  </Button>
                </form>
              </>
            )}
          </div>
        )}

        {/* PORTAL 3: SUPER ADMIN LOGIN (MAHDI) */}
        {portalMode === 'ADMIN' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Super Admin Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold bg-slate-50 focus:bg-white text-slate-900"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="mahdi"
                />
                <User size={16} className="absolute left-3.5 top-3 text-indigo-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Passkey / Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-900"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Key size={16} className="absolute left-3.5 top-3 text-indigo-600" />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 px-3.5 py-2 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In as Super Admin'}
            </Button>
          </form>
        )}

      </div>
    </div>
  );
};