import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';

export default function ChatPage() {
  const { messages, sendMessage, isTyping, documents } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const chatBottomRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom of messages container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    let attachmentObj = null;
    if (selectedFile) {
      attachmentObj = {
        name: selectedFile.name,
        size: selectedFile.size,
      };
    }

    sendMessage(inputText, attachmentObj);
    setInputText('');
    setSelectedFile(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSimulateAttachment = () => {
    // Pick the first completed document as a simulated attachment
    const completedDocs = documents.filter((d) => d.status === 'Completed');
    if (completedDocs.length === 0) {
      alert('Upload a document in the Documents manager first to attach it here.');
      return;
    }
    const doc = completedDocs[0];
    setSelectedFile({
      name: doc.name,
      size: doc.size,
    });
  };

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden flex font-body-md">
      {/* Sidebar Nav */}
      <SideNavBar visible={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full md:ml-[280px] h-full relative text-left">
        {/* Top AppBar */}
        <TopAppBar title="Chat" onMenuClick={() => setMobileNavOpen(true)} />

        {/* Chat Interface Layout */}
        <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
          {/* Scrollable Messages Stream */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto chat-scroll px-margin-mobile md:px-2xl py-xl flex flex-col gap-6"
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center mt-12 mb-8" id="empty-state">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6 shadow-sm">
                  <span className="material-symbols-outlined text-primary text-3xl">forum</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg font-semibold text-on-surface mb-2">How can I help you today?</h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
                  Upload a document or ask a question about your existing workspace. I can analyze data, summarize reports, or draft new content.
                </p>
              </div>
            )}

            {/* Map Messages List */}
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.sender === 'user' ? (
                  /* User message component */
                  <div className="flex justify-end message-enter w-full max-w-4xl mx-auto">
                    <div className="bg-primary-container text-on-primary-container rounded-2xl rounded-tr-none px-6 py-4 max-w-[85%] md:max-w-[70%] shadow-sm flex flex-col gap-3">
                      {/* Optional attached file preview */}
                      {msg.attachment && (
                        <div className="flex items-center gap-3 bg-white/20 rounded-lg p-2 pr-4 border border-on-primary-container/20 w-fit">
                          <div className="w-10 h-10 rounded bg-white text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined">description</span>
                          </div>
                          <div className="flex flex-col text-left">
                            <span className="font-label-sm text-label-sm text-white truncate max-w-[150px]">{msg.attachment.name}</span>
                            <span className="text-[10px] text-on-primary-container opacity-80">{msg.attachment.size}</span>
                          </div>
                        </div>
                      )}
                      <p className="font-body-md text-body-md text-left">{msg.text}</p>
                    </div>
                  </div>
                ) : (
                  /* AI response component */
                  <div className="flex justify-start message-enter w-full max-w-4xl mx-auto group">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_awesome
                      </span>
                    </div>
                    <div className="bg-surface rounded-2xl rounded-tl-none px-6 py-4 max-w-[85%] md:max-w-[75%] border-l-2 border-primary shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05),0_2px_4px_-2px_rgb(0,0,0,0.05)]">
                      <div className="prose prose-sm max-w-none text-on-surface font-body-md">
                        <p className="mb-4 text-left">{msg.text}</p>

                        {/* Bulleted summary points */}
                        {msg.summaryPoints && (
                          <>
                            <h4 className="font-label-md text-label-md font-semibold mt-4 mb-2 text-on-surface">Executive Summary</h4>
                            <ul className="list-disc pl-5 mb-4 space-y-1 text-on-surface-variant text-left">
                              {msg.summaryPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                              ))}
                            </ul>
                          </>
                        )}

                        {/* Citations warnings box */}
                        {msg.risks && (
                          <>
                            <h4 className="font-label-md text-label-md font-semibold mt-4 mb-2 text-on-surface">Key Risk Factors</h4>
                            <div className="bg-error-container/30 border border-error-container rounded-lg p-4 mb-2 text-left">
                              <ul className="list-disc pl-5 space-y-2 text-on-surface-variant">
                                {msg.risks.map((risk, index) => (
                                  <li key={index}>
                                    <strong>{risk.title}:</strong> {risk.desc}{' '}
                                    <span className="text-[10px] bg-surface-variant px-1.5 py-0.5 rounded text-primary font-semibold ml-1.5 whitespace-nowrap">
                                      {risk.citation}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Tool hover actions bar */}
                      <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.text);
                            alert('Copied response to clipboard!');
                          }}
                          className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                          title="Copy"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                        </button>
                        <button
                          onClick={() => alert('Regenerating response...')}
                          className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                          title="Regenerate"
                        >
                          <span className="material-symbols-outlined text-sm">refresh</span>
                        </button>
                        <button
                          onClick={() => alert('Pinned to dashboard insights.')}
                          className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                          title="Save to Documents"
                        >
                          <span className="material-symbols-outlined text-sm">bookmark_add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start w-full max-w-4xl mx-auto mt-4">
                <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-sm fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                </div>
                <div className="bg-surface rounded-2xl rounded-tl-none px-5 py-4 w-20 border-l-2 border-primary shadow-sm flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-on-surface-variant rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-on-surface-variant rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-on-surface-variant rounded-full typing-dot"></div>
                </div>
              </div>
            )}

            {/* Anchor ref for scrollbar tracking */}
            <div ref={chatBottomRef} className="h-8" />
          </div>

          {/* Fixed Bottom Input Area */}
          <div className="bg-background/90 backdrop-blur-md px-margin-mobile md:px-2xl py-lg border-t border-outline-variant relative z-10">
            <div className="max-w-4xl mx-auto relative flex flex-col gap-2">
              {/* Attachment Preview Box */}
              {selectedFile && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                  <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg p-1.5 pr-3">
                    <div className="w-8 h-8 rounded bg-surface flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-sm">description</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface truncate max-w-[120px]">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="ml-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Text Input Console */}
              <div className="relative bg-surface rounded-2xl border border-outline-variant shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex flex-col min-h-[60px]">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none resize-none focus:ring-0 p-4 pb-12 font-body-md text-on-surface placeholder-on-surface-variant/70 min-h-[60px] max-h-[200px] outline-none"
                  placeholder="Ask DocuMind AI anything..."
                  rows="1"
                ></textarea>
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-surface pt-1">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={handleSimulateAttachment}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors relative group cursor-pointer"
                      title="Attach File"
                    >
                      <span className="material-symbols-outlined">attach_file</span>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] font-label-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Attach File
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Indexing search workspace... All matching document blocks loaded.')}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors relative group cursor-pointer"
                      title="Search Workspace"
                    >
                      <span className="material-symbols-outlined">manage_search</span>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface text-[10px] font-label-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Search Workspace
                      </span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!inputText.trim() && !selectedFile}
                    className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
              <div className="text-center mt-2">
                <span className="text-[11px] text-on-surface-variant/70 font-body-sm">
                  DocuMind AI can make mistakes. Consider verifying important information.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// //------------------------------------------------------------
