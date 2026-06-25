import React from 'react';
import { useApp } from '../context/AppContext';

export default function TopAppBar({ title, onMenuClick, onSearchChange, searchValue }) {
  const { user } = useApp();

  return (
    <header className="sticky top-0 z-10 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm flex justify-between items-center h-16 px-lg transition-all duration-300">
      {/* Left items: Mobile menu + Page Title */}
      <div className="flex items-center gap-md">
        <button
          onClick={onMenuClick}
          className="md:hidden text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 transition-colors cursor-pointer"
          aria-label="Toggle Navigation Drawer"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="font-headline-md text-headline-md font-bold text-primary">{title}</h2>
      </div>

      {/* Right items: Search + Notifications + Help + Profile */}
      <div className="flex items-center gap-sm">
        {onSearchChange && (
          <div className="relative hidden sm:block w-64 mr-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full transition-all"
              placeholder="Search documents..."
            />
          </div>
        )}

        <button
          onClick={() => alert('No new notifications')}
          className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 transition-colors relative cursor-pointer"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
        </button>

        <button
          onClick={() => alert('Opening Help Docs')}
          className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-2 transition-colors hidden sm:block cursor-pointer"
        >
          <span className="material-symbols-outlined">help</span>
        </button>

        <div className="w-8 h-8 rounded-full bg-secondary-container ml-2 overflow-hidden border border-outline-variant flex items-center justify-center">
          <img
            alt="User Avatar"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOoNWJiPYHZuDCTUJ-Ft0moFARKMQlZjLmLLNShmMxbiYLBnjNOap5KYUNZXloef7Xg_YuXJabFcNW9z3qOfBCTdBW01_hbgdx-N7iVZRCIo-1zXmUP7RzpbGnwwmEhHK47KG5zKy2VEkDdCfqx6nwLEz2IoVRpSfNwGVY-6_tkVieZfRSvl19ZhGlcKv-JBS5LplXWLdbXrEQabY0nNwXUwIadEASbTe2VbPIBDJoarMtDXyYGl52VIAV6LYMsQtG5tvRkRdvInz6"
          />
        </div>
      </div>
    </header>
  );
}
