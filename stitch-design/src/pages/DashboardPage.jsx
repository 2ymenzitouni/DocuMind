import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, documents, messages } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Statistics calculations
  const totalDocs = documents.length;
  const activeChats = messages.filter((m) => m.sender === 'user').length;
  const storageUsed = (totalDocs * 0.12).toFixed(2); // Mock 0.12 GB per doc
  const storagePercent = Math.min(Math.round((storageUsed / 5) * 100), 100);

  // Take the most recent documents (up to 3)
  const recentDocs = documents.slice(0, 3);

  // Take mock recent chat titles
  const recentChatThreads = [
    { id: 't1', title: 'Strategy Discussion', snippet: 'Based on the quarterly report, the key areas...', time: '10:42 AM' },
    { id: 't2', title: 'Tech Review', snippet: 'Can you summarize the API endpoints from...', time: 'Yesterday' }
  ];

  return (
    <div className="bg-background text-on-background min-h-screen flex font-body-md text-body-md">
      {/* Sidebar navigation */}
      <SideNavBar visible={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen overflow-hidden">
        {/* Top AppBar */}
        <TopAppBar title="Dashboard" onMenuClick={() => setMobileNavOpen(true)} />

        {/* Workspace Canvas */}
        <main className="flex-1 p-margin-mobile md:p-2xl max-w-container-max w-full mx-auto overflow-y-auto">
          {/* Welcome Header */}
          <div className="mb-10 text-left">
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Welcome back, {user?.name || 'User'}</h1>
            <p className="text-on-surface-variant font-body-lg text-body-lg">Here's what's happening with your documents today.</p>
          </div>

          {/* Stat Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 text-left">
            {/* Stat Card 1: Total Documents */}
            <div
              onClick={() => navigate('/documents')}
              className="bg-surface rounded-2xl p-6 border border-outline-variant ambient-shadow flex flex-col justify-between group hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                    description
                  </span>
                </div>
                <span className="text-xs font-semibold text-primary bg-primary-fixed px-2 py-1 rounded-full">+12% this week</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Documents</p>
                <h3 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">
                  {totalDocs}
                </h3>
              </div>
            </div>

            {/* Stat Card 2: Active Chats */}
            <div
              onClick={() => navigate('/chat')}
              className="bg-surface rounded-2xl p-6 border border-outline-variant ambient-shadow flex flex-col justify-between group hover:border-primary transition-colors cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                    forum
                  </span>
                </div>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Active Chats</p>
                <h3 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">
                  {activeChats}
                </h3>
              </div>
            </div>

            {/* Stat Card 3: Storage Gauge */}
            <div className="bg-surface rounded-2xl p-6 border border-outline-variant ambient-shadow flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                    storage
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="font-label-md text-label-md text-on-surface-variant">Storage Used</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{storageUsed} GB / 5 GB</p>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 mb-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${storagePercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            {/* Recent Documents Table View */}
            <div className="bg-surface rounded-2xl border border-outline-variant ambient-shadow overflow-hidden flex flex-col">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-headline-md text-headline-md text-on-surface">Recent Documents</h3>
                <button
                  onClick={() => navigate('/documents')}
                  className="text-primary font-label-md text-label-md hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-1">
                {recentDocs.length === 0 ? (
                  <p className="p-4 text-sm text-on-surface-variant">No documents uploaded yet.</p>
                ) : (
                  recentDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => navigate('/documents')}
                      className="flex items-center gap-4 p-4 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.status === 'Failed'
                            ? 'bg-error-container text-on-error-container'
                            : doc.status === 'Processing...'
                            ? 'bg-surface-variant text-on-surface-variant'
                            : 'bg-primary-container/20 text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {doc.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                          {doc.name}
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Uploaded {doc.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            doc.status === 'Completed'
                              ? 'bg-surface-variant text-primary'
                              : doc.status === 'Failed'
                              ? 'bg-error-container text-on-error-container'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Chat Threads View */}
            <div className="bg-surface rounded-2xl border border-outline-variant ambient-shadow overflow-hidden flex flex-col">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
                <h3 className="font-headline-md text-headline-md text-on-surface">Recent Chats</h3>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-primary font-label-md text-label-md hover:underline cursor-pointer"
                >
                  New Chat
                </button>
              </div>
              <div className="p-2 flex-1 flex flex-col gap-1">
                {recentChatThreads.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => navigate('/chat')}
                    className="flex items-center gap-4 p-4 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                        {chat.title}
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[200px] md:max-w-[280px]">
                        "{chat.snippet}"
                      </p>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{chat.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// #############################################