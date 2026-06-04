import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (fullname && email && password) {
      register(fullname, email, password);
      navigate('/dashboard');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-4 antialiased relative overflow-hidden">
      {/* Register Canvas */}
      <main className="w-full max-w-[440px] relative z-10">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 font-display-lg text-display-lg text-primary mb-2 font-bold">
            <span className="material-symbols-outlined fill" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>
              description
            </span>
            DocuMind AI
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant">Create an account to start automating.</p>
        </div>

        {/* Register Card */}
        <div className="bg-surface-container-lowest rounded-2xl soft-float border border-surface-container p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input */}
            <div className="text-left">
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="fullname">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <input
                  type="text"
                  id="fullname"
                  required
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-surface-bright text-on-surface font-body-md text-body-md placeholder:text-outline focus:ring-0 transition-colors focus:border-primary focus:outline-none"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="text-left">
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-outline-variant rounded-lg bg-surface-bright text-on-surface font-body-md text-body-md placeholder:text-outline focus:ring-0 transition-colors focus:border-primary focus:outline-none"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="text-left">
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-outline-variant rounded-lg bg-surface-bright text-on-surface font-body-md text-body-md placeholder:text-outline focus:ring-0 transition-colors focus:border-primary focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="text-left">
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="confirm-password">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-xl">lock_reset</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirm-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-outline-variant rounded-lg bg-surface-bright text-on-surface font-body-md text-body-md placeholder:text-outline focus:ring-0 transition-colors focus:border-primary focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200 cursor-pointer"
            >
              Create Account
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link to="/login" className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Subtle Decor Background */}
      <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-surface-variant/40 to-surface-container-high/40 rounded-full blur-[80px] opacity-50 pointer-events-none"></div>
    </div>
  );
}
