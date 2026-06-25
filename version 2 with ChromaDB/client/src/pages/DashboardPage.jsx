import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';

const API_BASE_URL = 'http://localhost:8000';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Real statistical states from backend
  const [stats, setStats] = useState({
    totalDocs: 0,
    activeChats: 0,
    storageUsed: 0,
    recentDocuments: [],
    recentChats: []
  });
  const [loading, setLoading] = useState(true);

  // 1. Fetch real dashboard data on component mount and log it
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_BASE_URL}/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // ==========================================
        // DEBUG CONSOLE LOGS
        // ==========================================
        console.log("=== DASHBOARD FETCHED DATA ===");
        console.log("Raw Response Payload:", response.data);
        console.log("Total Documents:", response.data.total_docs);
        console.log("Active Chats:", response.data.active_chats);
        console.log("Storage Used (GB):", response.data.storage_used);
        console.log("Recent Documents List:", response.data.recent_documents);
        console.log("Recent Chat Threads List:", response.data.recent_chats);
        console.log("=======================================");

        setStats({
          totalDocs: response.data.total_docs || 0,
          activeChats: response.data.active_chats || 0,
          storageUsed: parseFloat(response.data.storage_used || 0).toFixed(4),
          recentDocuments: response.data.recent_documents || [],
          recentChats: response.data.recent_chats || []
        });
      } catch (error) {
        console.error("Error fetching dashboard statistics:", error);
        if (error.response) {
          console.error("Server Error Details:", error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute dynamic storage gauge metrics (Max quota set to 5 GB)
  const MAX_STORAGE_GB = 5;
  const storagePercent = Math.min(Math.round((stats.storageUsed / MAX_STORAGE_GB) * 100), 100);

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
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="text-on-surface-variant font-body-lg text-body-lg">
              Here's what's happening with your documents today.
            </p>
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
                <span className="text-xs font-semibold text-primary bg-primary-fixed px-2 py-1 rounded-full">Live Storage</span>
              </div>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Documents</p>
                <h3 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">
                  {loading ? '...' : stats.totalDocs}
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
                  {loading ? '...' : stats.activeChats}
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
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    {loading ? '...' : `${stats.storageUsed} GB / ${MAX_STORAGE_GB} GB`}
                  </p>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${loading ? 0 : storagePercent}%` }}
                  ></div>
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
                {stats.recentDocuments.length === 0 ? (
                  <p className="p-4 text-sm text-on-surface-variant">No documents uploaded yet.</p>
                ) : (
                  stats.recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => navigate('/documents')}
                      className="flex items-center gap-4 p-4 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.status === 'Failed'
                            ? 'bg-error-container text-on-error-container'
                            : doc.status === 'Processing'
                            ? 'bg-surface-container-high text-on-surface-variant animate-pulse'
                            : 'bg-primary-container/20 text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {doc.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors truncate max-w-[180px] sm:max-w-[300px]">
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
                {stats.recentChats.length === 0 ? (
                  <p className="p-4 text-sm text-on-surface-variant">No chat history available.</p>
                ) : (
                  stats.recentChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => navigate('/chat')}
                      className="flex items-center gap-4 p-4 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined">smart_toy</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors truncate">
                          {chat.title}
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          {chat.snippet}
                        </p>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex-shrink-0">{chat.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}