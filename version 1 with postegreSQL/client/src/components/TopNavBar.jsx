import React from 'react';
import { Link } from 'react-router-dom';

export default function TopNavBar() {
  return (
    <header className="bg-surface sticky top-0 z-50 w-full border-b border-outline-variant transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center h-16 px-gutter max-w-container-max mx-auto w-full">
        {/* Brand */}
        <Link to="/" className="font-display-lg text-headline-md font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container fill" style={{ fontVariationSettings: "'FILL' 1" }}>
            description
          </span>
          DocuMind AI
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">
            Features
          </a>
          <a href="#pricing" className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">
            Pricing
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden md:block text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-primary-container text-on-primary font-label-md text-label-md py-2 px-6 rounded-lg hover:bg-primary transition-colors shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
