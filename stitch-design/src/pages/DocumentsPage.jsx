import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';

export default function DocumentsPage() {
  const { documents, uploadDocument, deleteDocument } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Filter documents based on search
  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // File Upload Handlers
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      uploadDocument(file.name, file.size);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      uploadDocument(file.name, file.size);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Preview Summary Action
  const handleViewSummary = (doc) => {
    if (doc.status === 'Processing...') {
      alert(`"${doc.name}" is currently processing. Please wait...`);
      return;
    }
    if (doc.status === 'Failed') {
      alert(`"${doc.name}" failed to upload. There is no summary available.`);
      return;
    }
    alert(
      `Document Summary for: ${doc.name}\n\nThis document covers operating guidelines, business goals, and strategic insights. You can query its details directly on the AI Chat panel.`
    );
  };

  return (
    <div className="bg-background text-on-surface h-screen overflow-hidden flex font-body-md">
      {/* Sidebar Nav */}
      <SideNavBar visible={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[280px] h-screen overflow-hidden text-left">
        {/* Top AppBar */}
        <TopAppBar
          title="Documents"
          onMenuClick={() => setMobileNavOpen(true)}
          onSearchChange={setSearchQuery}
          searchValue={searchQuery}
        />

        {/* Canvas Area */}
        <main className="flex-1 overflow-y-auto p-lg md:p-xl lg:p-2xl">
          <div className="max-w-container-max mx-auto space-y-xl">
            {/* Page Header */}
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Knowledge Base</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Upload and manage documents for AI analysis.</p>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-xl text-center transition-all cursor-pointer group ${
                dragOver
                  ? 'border-primary bg-primary-container/10'
                  : 'border-outline-variant bg-surface-container-lowest hover:border-primary'
              }`}
            >
              {/* Invisible File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.txt"
              />

              <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-md group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                <span className="material-symbols-outlined text-3xl text-primary group-hover:text-on-primary-container">
                  cloud_upload
                </span>
              </div>
              <p className="font-headline-md text-headline-md text-on-surface mb-xs">Drag and drop files here</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Supports PDF, DOCX, TXT up to 50MB</p>
              <button
                type="button"
                className="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md py-2 px-6 rounded-lg transition-colors cursor-pointer"
              >
                Upload Document
              </button>
            </div>

            {/* Document Table Container */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
              <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h4 className="font-headline-md text-headline-md text-on-surface text-lg">Recent Documents</h4>
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-md transition-colors cursor-pointer"
                  title="Clear Filter"
                >
                  <span className="material-symbols-outlined text-sm">filter_list</span>
                </button>
              </div>

              {/* Table wrapper */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant bg-surface-container-lowest">
                      <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Name</th>
                      <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date</th>
                      <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Size</th>
                      <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                      <th className="p-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                    {filteredDocs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="p-8 text-center text-on-surface-variant">
                          No matching documents found in your library.
                        </td>
                      </tr>
                    ) : (
                      filteredDocs.map((doc) => (
                        <tr key={doc.id} className="hover:bg-surface-container-low transition-colors">
                          <td className="p-4 flex items-center gap-sm text-on-surface font-medium truncate max-w-[200px] sm:max-w-[400px]">
                            <span className="material-symbols-outlined text-primary text-xl">description</span>
                            {doc.name}
                          </td>
                          <td className="p-4 text-on-surface-variant">{doc.date}</td>
                          <td className="p-4 text-on-surface-variant">{doc.size}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                doc.status === 'Completed'
                                  ? 'bg-surface-variant text-primary'
                                  : doc.status === 'Failed'
                                  ? 'bg-error-container text-on-error-container'
                                  : 'bg-surface-container-high text-on-surface-variant animate-pulse'
                              }`}
                            >
                              {doc.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => handleViewSummary(doc)}
                              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                              title="View summary"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                              title="Delete file"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
