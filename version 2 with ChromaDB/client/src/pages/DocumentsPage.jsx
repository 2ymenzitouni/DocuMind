import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';

const API_BASE_URL = 'http://localhost:8000'; 

export default function DocumentsPage() {
  const { documents, setDocuments, uploadDocument, deleteDocument } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Fetch documents on mount with Authentication Header
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Normalisation pour garantir la compatibilité name / filename
      const normalizedData = response.data.map(doc => ({
        ...doc,
        name: doc.name || doc.filename || "Unnamed Document"
      }));
      setDocuments(normalizedData);
    } catch (error) {
      console.error("Error fetching documents:", error);
      alert("Failed to load documents from server. Please check your session.");
    }
  };

  // Filter documents based on search string
  const filteredDocs = documents.filter((doc) => {
    const docName = doc.name || doc.filename || "";
    return docName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // 2. File Upload Handler integrated with AppContext Pipeline
  const handleUpload = async (file) => {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("File is too large. Maximum allowed size is 50MB.");
      return;
    }

    setIsUploading(true);

    try {
      // Utilisation de la fonction centralisée du contexte (gère le token et FormData)
      await uploadDocument(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred during file upload. Verify backend logs.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
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
      handleUpload(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // 3. Delete Document Handler integrated with AppContext Pipeline
  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      // Utilisation de la fonction du contexte (efface l'état local + Chroma/FAISS)
      await deleteDocument(id);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete the document.");
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleViewSummary = (doc) => {
    const docName = doc.name || doc.filename;
    if (doc.status === 'Processing') {
      alert(`"${docName}" is currently processing. Please wait...`);
      return;
    }
    if (doc.status === 'Failed') {
      alert(`"${docName}" failed to upload. There is no summary available.`);
      return;
    }
    alert(
      `Document Summary for: ${docName}\n\nThis document covers operating guidelines, business goals, and strategic insights. You can query its details directly on the AI Chat panel.`
    );
  };

  return (
    <div className="bg-background text-on-surface h-screen overflow-hidden flex font-body-md">
      <SideNavBar visible={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-[280px] h-screen overflow-hidden text-left">
        <TopAppBar
          title="Documents"
          onMenuClick={() => setMobileNavOpen(true)}
          onSearchChange={setSearchQuery}
          searchValue={searchQuery}
        />

        <main className="flex-1 overflow-y-auto p-lg md:p-xl lg:p-2xl">
          <div className="max-w-container-max mx-auto space-y-xl">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Knowledge Base</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Upload and manage documents for AI analysis.</p>
            </div>

            <div
              onClick={triggerFileInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-xl text-center transition-all cursor-pointer group ${
                dragOver
                  ? 'border-primary bg-primary-container/10'
                  : 'border-outline-variant bg-surface-container-lowest hover:border-primary'
              } ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx,.txt"
              />

              <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-md group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                <span className={`material-symbols-outlined text-3xl text-primary group-hover:text-on-primary-container ${isUploading ? 'animate-bounce' : ''}`}>
                  {isUploading ? 'sync' : 'cloud_upload'}
                </span>
              </div>
              <p className="font-headline-md text-headline-md text-on-surface mb-xs">
                {isUploading ? 'Uploading file...' : 'Drag and drop files here'}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">Supports PDF, DOCX, TXT up to 50MB</p>
              <button
                type="button"
                disabled={isUploading}
                className="bg-primary hover:bg-primary/90 text-on-primary font-label-md text-label-md py-2 px-6 rounded-lg transition-colors cursor-pointer disabled:bg-gray-400"
              >
                {isUploading ? 'Please Wait...' : 'Upload Document'}
              </button>
            </div>

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
                            {doc.name || doc.filename}
                          </td>
                          <td className="p-4 text-on-surface-variant">{doc.date || "N/A"}</td>
                          <td className="p-4 text-on-surface-variant">{formatBytes(doc.size)}</td>
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
                              onClick={() => handleDeleteDocument(doc.id)}
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