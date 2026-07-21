import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { X, Lock, Mail, User as UserIcon, Phone, ShieldCheck, Key, RefreshCw, AlertCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { supabase } from '../lib/supabase';

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
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const tryLocalAuthFallback = (cleanEmail: string, pass: string): User | null => {
    // Check if user exists in allUsers with matching password
    const matchedUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === pass);
    if (matchedUser) {
      return matchedUser;
    }
    return null;
  };

  const isNetworkOrDatabaseOffline = (error: any): boolean => {
    if (!error) return false;
    const lowerMsg = String(error.message || error).toLowerCase();
    const isOffline = (
      error.status === 503 ||
      error.name === 'AuthRetryableFetchError' ||
      lowerMsg.includes('failed to fetch') ||
      lowerMsg.includes('network error') ||
      lowerMsg.includes('offline') ||
      lowerMsg.includes('service unavailable') ||
      lowerMsg.includes('503') ||
      lowerMsg.includes('load failed')
    );
    return isOffline;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        if (isNetworkOrDatabaseOffline(error)) {
          const localUser = tryLocalAuthFallback(cleanEmail, password);
          if (localUser) {
            console.log('Database offline: Authenticated user locally:', localUser.email);
            setInfoMsg('Logged in successfully via secure offline mode.');
            setTimeout(() => {
              onLoginSuccess(localUser);
              onClose();
            }, 1000);
            return;
          } else {
            const userExistsLocally = allUsers.some(u => u.email.toLowerCase() === cleanEmail);
            if (userExistsLocally) {
              setErrorMsg('The offline password you entered is incorrect.');
            } else {
              setErrorMsg('Database connection currently offline. Please verify your connection or try again later.');
            }
            setIsLoading(false);
            return;
          }
        }

        setErrorMsg(getFriendlyErrorMessage(error));
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const role = cleanEmail === 'trisha123@gmail.com' ? 'admin' : 'customer';
        const userObj: User = {
          id: data.user.id,
          email: cleanEmail,
          passwordHash: password, // preserved for backcompat
          name: data.user.user_metadata?.name || cleanEmail.split('@')[0] || 'Customer',
          role: role,
          phone: data.user.user_metadata?.phone || undefined
        };
        onLoginSuccess(userObj);
        onClose();
      }
    } catch (err: any) {
      if (isNetworkOrDatabaseOffline(err)) {
        const localUser = tryLocalAuthFallback(cleanEmail, password);
        if (localUser) {
          console.log('Database offline (exception caught): Authenticated user locally:', localUser.email);
          setInfoMsg('Logged in successfully via secure offline mode.');
          setTimeout(() => {
            onLoginSuccess(localUser);
            onClose();
          }, 1000);
          return;
        } else {
          const userExistsLocally = allUsers.some(u => u.email.toLowerCase() === cleanEmail);
          if (userExistsLocally) {
            setErrorMsg('The offline password you entered is incorrect.');
          } else {
            setErrorMsg('Database connection offline. Please verify your connection or try again later.');
          }
          setIsLoading(false);
          return;
        }
      }
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getFriendlyErrorMessage = (error: any): string => {
    if (!error) return 'An unknown error occurred.';
    
    // Extract full serializable properties from Error/AuthError instances to prevent empty {} in logs
    let errorDetails: any = {};
    try {
      if (typeof error === 'object') {
        const propNames = Object.getOwnPropertyNames(error);
        propNames.forEach(name => {
          errorDetails[name] = error[name];
        });
        if (error.message) errorDetails.message = error.message;
        if (error.name) errorDetails.name = error.name;
        if (error.status) errorDetails.status = error.status;
        if (error.code) errorDetails.code = error.code;
        if (error.details) errorDetails.details = error.details;
        if (error.hint) errorDetails.hint = error.hint;
        if (error.error_description) errorDetails.error_description = error.error_description;
        if (error.error) errorDetails.error = error.error;
      } else {
        errorDetails = { raw: error };
      }
    } catch (e) {
      errorDetails = { raw: String(error) };
    }
    
    // Log the full detailed object as string to console
    console.error('Database/Authentication error details:', JSON.stringify(errorDetails));
    
    let msg = '';
    
    if (typeof error === 'string') {
      msg = error;
    } else if (error && typeof error === 'object') {
      if (error.message) {
        msg = error.message;
      } else if (error.error_description) {
        msg = error.error_description;
      } else if (error.error) {
        msg = typeof error.error === 'string' ? error.error : (error.error.message || JSON.stringify(error.error));
      } else if (error.details) {
        msg = error.details;
      } else if (error.hint) {
        msg = error.hint;
      } else if (error.code) {
        msg = `Database Error Code: ${error.code}`;
      } else {
        const strVal = error.toString ? error.toString() : '';
        if (strVal && strVal !== '[object Object]') {
          msg = strVal;
        } else {
          try {
            const keys = Object.keys(error);
            if (keys.length > 0) {
              msg = JSON.stringify(error);
            }
          } catch (e) {}
        }
      }
    }
    
    if (!msg || msg === '{}') {
      msg = 'Database connection or authentication offline.';
    }

    const lowerMsg = msg.toLowerCase();
    
    if (
      lowerMsg.includes('failed to fetch') || 
      lowerMsg.includes('network error') || 
      lowerMsg.includes('load failed') || 
      lowerMsg.includes('offline') ||
      lowerMsg.includes('service unavailable') ||
      lowerMsg.includes('503')
    ) {
      return 'Network connection error. Please verify you are connected to the internet and that your ad-blocker or VPN is not blocking Supabase.';
    }
    
    if (lowerMsg.includes('user already exists') || lowerMsg.includes('already registered') || lowerMsg.includes('email_exists')) {
      return 'An account with this email address is already registered. Please sign in instead.';
    }
    
    if (lowerMsg.includes('weak_password') || lowerMsg.includes('should be at least') || lowerMsg.includes('password should') || lowerMsg.includes('at least 6 characters')) {
      return 'Your password must be at least 6 characters long.';
    }
    
    if (lowerMsg.includes('invalid email') || lowerMsg.includes('invalid format') || lowerMsg.includes('email is invalid')) {
      return 'Please enter a valid email address.';
    }

    if (lowerMsg.includes('rate limit') || lowerMsg.includes('too many requests') || lowerMsg.includes('429')) {
      return 'For security, we are experiencing rate limits. Please wait a few moments and try again.';
    }

    if (lowerMsg.includes('user_profiles') || lowerMsg.includes('relation "user_profiles" does not exist')) {
      return 'Account registered, but user profile table is missing. Running SQL Schema setup is recommended.';
    }
    
    return msg;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);

    // Precise input field validation
    if (!name.trim()) {
      setErrorMsg('Full Name is required.');
      setIsLoading(false);
      return;
    }
    
    if (!email.trim()) {
      setErrorMsg('Email Address is required.');
      setIsLoading(false);
      return;
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (!phone.trim()) {
      setErrorMsg('Contact Phone is required.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setErrorMsg('Password is required.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Create the user in Supabase Authentication
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            name: name.trim(),
            phone: phone.trim()
          }
        }
      });

      if (error) {
        if (isNetworkOrDatabaseOffline(error)) {
          // Check if user already exists locally
          const exists = allUsers.some(u => u.email.toLowerCase() === cleanEmail);
          if (exists) {
            setErrorMsg('An account with this email address is already registered locally. Please sign in instead.');
            setIsLoading(false);
            return;
          }

          const localId = 'u-' + Math.random().toString(36).substring(2, 11);
          const role = cleanEmail === 'trisha123@gmail.com' ? 'admin' : 'customer';
          const newUser: User = {
            id: localId,
            email: cleanEmail,
            passwordHash: password,
            name: name.trim(),
            role: role,
            phone: phone.trim() || undefined
          };

          // Save to local storage
          const updatedUsers = [...allUsers, newUser];
          storage.saveUsers(updatedUsers);

          setInfoMsg('Account created successfully in secure local offline mode!');
          setTimeout(() => {
            onRegisterSuccess(newUser);
            onClose();
          }, 1500);
          return;
        }

        setErrorMsg(getFriendlyErrorMessage(error));
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // 2. Create a profile in the user_profiles table on Supabase
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              full_name: name.trim(),
              email: cleanEmail,
              phone: phone.trim(),
              created_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.warn('Profile creation returned an error:', profileError);
          // If profile table doesn't exist yet, we still proceed but log a warning to ensure local fallback is active.
        }

        const role = cleanEmail === 'trisha123@gmail.com' ? 'admin' : 'customer';
        const newUser: User = {
          id: data.user.id,
          email: cleanEmail,
          passwordHash: password,
          name: name.trim(),
          role: role,
          phone: phone.trim() || undefined
        };

        setInfoMsg('Account created successfully! Welcome to Trisha Beauty Parlour.');
        
        // Auto-signin and redirect
        setTimeout(() => {
          onRegisterSuccess(newUser);
          onClose();
        }, 1500);
      } else {
        setErrorMsg('User object could not be resolved from Supabase Auth response.');
      }
    } catch (err: any) {
      if (isNetworkOrDatabaseOffline(err)) {
        // Check if user already exists locally
        const exists = allUsers.some(u => u.email.toLowerCase() === cleanEmail);
        if (exists) {
          setErrorMsg('An account with this email address is already registered locally. Please sign in instead.');
          setIsLoading(false);
          return;
        }

        const localId = 'u-' + Math.random().toString(36).substring(2, 11);
        const role = cleanEmail === 'trisha123@gmail.com' ? 'admin' : 'customer';
        const newUser: User = {
          id: localId,
          email: cleanEmail,
          passwordHash: password,
          name: name.trim(),
          role: role,
          phone: phone.trim() || undefined
        };

        // Save to local storage
        const updatedUsers = [...allUsers, newUser];
        storage.saveUsers(updatedUsers);

        setInfoMsg('Account created successfully in secure local offline mode!');
        setTimeout(() => {
          onRegisterSuccess(newUser);
          onClose();
        }, 1500);
        return;
      }
      setErrorMsg(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Request Password Recovery code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setIsLoading(true);

    const cleanEmail = recoveryEmail.trim().toLowerCase();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/#reset-password`,
      });

      if (error) {
        setErrorMsg(error.message);
        setIsLoading(false);
        return;
      }

      setInfoMsg('A secure password reset link has been dispatched to your email address by Supabase Auth!');
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during reset request.');
    } finally {
      setIsLoading(false);
    }
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
                disabled={isLoading}
                className="w-full py-3 bg-charcoal hover:bg-charcoal/90 disabled:bg-charcoal/70 disabled:cursor-not-allowed text-white text-xs uppercase tracking-widest font-bold transition-all rounded-xs cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In securely</span>
                )}
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
                  Contact Phone (Required)
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
                    required
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
                disabled={isLoading}
                className="w-full py-3 bg-charcoal hover:bg-charcoal/90 disabled:bg-charcoal/70 disabled:cursor-not-allowed text-white text-xs uppercase tracking-widest font-bold transition-all rounded-xs cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register Account</span>
                )}
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
