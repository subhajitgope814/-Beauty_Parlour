import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Key, RefreshCw, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'forgot';
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (newUser: User) => void;
  allUsers: User[];
}

export default function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
  allUsers
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset-flow'>(initialMode);
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Forgot password sub-states
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryUser, setRecoveryUser] = useState<User | null>(null);

  // Status/Error messages
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Reset states when mode changes or modal opens
  useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setInfoMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setRecoveryEmail('');
    setGeneratedCode('');
    setRecoveryCodeInput('');
    setNewPassword('');
    setRecoveryUser(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      setErrorMsg('No account found with this email. Please check spelling or register.');
      return;
    }

    if (user.passwordHash !== password) {
      setErrorMsg('Incorrect password. Please try again or use "Forgot Password".');
      return;
    }

    // Success login!
    onLoginSuccess(user);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!name.trim()) {
      setErrorMsg('Please specify your name.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMsg('Email and secure password are required.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const exists = allUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      setErrorMsg('An account with this email address already exists. Please login instead.');
      return;
    }

    // Create Customer User
    const newUser: User = {
      id: 'u-' + Date.now(),
      email: cleanEmail,
      passwordHash: password, // Simulated secure hash
      name: name.trim(),
      role: 'customer',
      phone: phone.trim() || undefined
    };

    onRegisterSuccess(newUser);
    onClose();
  };

  // Step 1: Request Password Recovery code
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanEmail = recoveryEmail.trim().toLowerCase();
    const user = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      setErrorMsg('No account matches this email address.');
      return;
    }

    // Generate simulated random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setRecoveryUser(user);
    setMode('reset-flow');
    setInfoMsg(`A verification code has been dispatched simulation-style!`);
  };

  // Step 2: Confirm Code and Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (recoveryCodeInput !== generatedCode) {
      setErrorMsg('Invalid recovery code. Please check and try again.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (!recoveryUser) return;

    // Update user password
    const updatedUsers = allUsers.map(u => {
      if (u.id === recoveryUser.id) {
        return { ...u, passwordHash: newPassword };
      }
      return u;
    });

    storage.saveUsers(updatedUsers);
    setInfoMsg('Your password has been successfully reset! Please sign in with your new credentials.');
    setMode('login');
    // Clear state
    setEmail(recoveryUser.email);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="auth-modal-overlay">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-charcoal/45 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Center Wrapper */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-md border border-sand-100 shadow-xl p-8 sm:p-10 z-10 rounded-xs">
          
          {/* Close button */}
          <button 
            onClick={onClose}
            id="auth-modal-close-btn"
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-charcoal transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-8">
            <span className="text-[9px] uppercase tracking-widest text-sand-200 font-bold block mb-1">
              TRISHA BEAUTY PARLOUR
            </span>
            <h3 className="title-font text-3xl font-light text-charcoal">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset-flow' && 'Enter Reset Code'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-light">
              {mode === 'login' && 'Sign in to schedule and coordinate your beauty treatments.'}
              {mode === 'register' && 'Join the Trisha family for instant reservation approvals.'}
              {mode === 'forgot' && "Don't worry, we'll help recover your credentials."}
              {mode === 'reset-flow' && 'Check your screen below for your simulated PIN.'}
            </p>
          </div>

          {/* Status Indicators */}
          {errorMsg && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 text-xs border border-red-100 rounded-xs flex items-center gap-2" id="auth-error-alert">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-4 bg-green-50 text-green-800 p-3 text-xs border border-green-100 rounded-xs flex items-center gap-2" id="auth-info-alert">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4" id="login-form">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="e.g. customer@trisha.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="login-email-input"
                    className="w-full pl-10 pr-3 py-2.5 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    id="forgot-password-link"
                    className="text-[10px] text-sand-200 uppercase tracking-wider font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="login-password-input"
                    className="w-full pl-10 pr-3 py-2.5 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="login-submit-btn"
                className="w-full py-3 bg-charcoal hover:bg-charcoal/90 text-white text-xs uppercase tracking-widest font-bold transition-all rounded-xs cursor-pointer shadow-xs"
              >
                Sign In securely
              </button>

              <div className="mt-6 text-center text-xs text-gray-500 pt-4 border-t border-sand-100">
                New to Trisha?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  id="switch-to-register-link"
                  className="text-sand-200 font-bold uppercase hover:underline cursor-pointer"
                >
                  Register Account
                </button>
              </div>
            </form>
          )}

          {/* REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4" id="register-form">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="register-name-input"
                    className="w-full pl-10 pr-3 py-2.5 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    id="register-email-input"
                    className="w-full pl-10 pr-3 py-2.5 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    id="register-phone-input"
                    className="w-full pl-10 pr-3 py-2.5 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Create Password (Min 6 chars)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    id="register-password-input"
                    className="w-full pl-10 pr-3 py-2.5 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="register-submit-btn"
                className="w-full py-3 bg-charcoal hover:bg-charcoal/90 text-white text-xs uppercase tracking-widest font-bold transition-all rounded-xs cursor-pointer shadow-xs"
              >
                Register Account
              </button>

              <div className="mt-6 text-center text-xs text-gray-500 pt-4 border-t border-sand-100">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  id="switch-to-login-link"
                  className="text-sand-200 font-bold uppercase hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleRequestCode} className="space-y-4" id="forgot-password-form">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Registered Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="customer@trisha.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    id="forgot-email-input"
                    className="w-full pl-10 pr-3 py-2.5 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                id="forgot-submit-btn"
                className="w-full py-3 bg-charcoal hover:bg-charcoal/90 text-white text-xs uppercase tracking-widest font-bold transition-all rounded-xs cursor-pointer"
              >
                Simulate Reset Email
              </button>

              <div className="mt-6 text-center text-xs text-gray-500 pt-4 border-t border-sand-100">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  id="back-to-login-link"
                  className="text-sand-200 font-bold uppercase hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FLOW (Simulated instant PIN verification) */}
          {mode === 'reset-flow' && (
            <form onSubmit={handleResetPassword} className="space-y-4" id="reset-password-flow-form">
              
              {/* Simulated dispatched PIN box */}
              <div className="p-4 bg-amber-50 border border-amber-200 text-left rounded-xs mb-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs mb-1">
                  <Key className="w-4 h-4 text-amber-700 animate-pulse" />
                  <span>Simulated Dispatched Email:</span>
                </div>
                <p className="text-xs text-amber-800">
                  To: <strong className="font-semibold text-charcoal">{recoveryEmail}</strong>
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  Your password recovery PIN code is:
                </p>
                <div className="text-center py-2">
                  <span className="font-mono text-xl tracking-widest font-bold text-charcoal bg-white border border-amber-100 px-4 py-1 inline-block">
                    {generatedCode}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Enter 6-Digit PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={recoveryCodeInput}
                  onChange={(e) => setRecoveryCodeInput(e.target.value)}
                  id="reset-pin-input"
                  className="w-full px-3 py-2.5 bg-sand-50 border border-sand-100 rounded-xs text-xs text-center font-mono tracking-widest text-charcoal focus:outline-none focus:border-sand-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gray-500">
                  Choose New Password (Min 6 chars)
                </label>
                <input
                  type="password"
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  id="reset-new-password-input"
                  className="w-full px-3 py-2.5 bg-sand-50 border border-sand-100 rounded-xs text-xs text-charcoal focus:outline-none focus:border-sand-200"
                  required
                />
              </div>

              <button
                type="submit"
                id="reset-submit-btn"
                className="w-full py-3 bg-charcoal hover:bg-charcoal/90 text-white text-xs uppercase tracking-widest font-bold transition-all rounded-xs cursor-pointer"
              >
                Reset and Save New Password
              </button>

              <button
                type="button"
                onClick={() => setMode('forgot')}
                id="cancel-reset-btn"
                className="w-full py-2 border border-sand-100 text-xs text-gray-500 uppercase tracking-widest font-bold hover:bg-sand-50 transition-all rounded-xs cursor-pointer"
              >
                Go Back
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
