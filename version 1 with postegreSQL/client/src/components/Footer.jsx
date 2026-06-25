import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-outline-variant py-12">
      <div className="max-w-container-max mx-auto px-gutter flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-display-lg text-[20px] font-bold text-on-surface">
          <span className="material-symbols-outlined text-primary fill" style={{ fontVariationSettings: "'FILL' 1" }}>
            description
          </span>
          DocuMind AI
        </Link>
        <div className="flex gap-6 font-body-sm text-body-sm text-on-surface-variant">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <div className="font-body-sm text-body-sm text-outline">
          © {new Date().getFullYear()} DocuMind AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
