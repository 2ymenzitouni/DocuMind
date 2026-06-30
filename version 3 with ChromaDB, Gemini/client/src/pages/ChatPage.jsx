// import React, { useState, useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { useApp } from '../context/AppContext';
// import SideNavBar from '../components/SideNavBar';
// import TopAppBar from '../components/TopAppBar';

// export default function ChatPage() {
//   const { chatId } = useParams(); // Récupère proprement l'identifiant de la session depuis l'URL
//   const { messages, sendMessage, isTyping, documents } = useApp();
  
//   const [mobileNavOpen, setMobileNavOpen] = useState(false);
//   const [inputText, setInputText] = useState('');
//   const [selectedFile, setSelectedFile] = useState(null);
  
//   const messagesContainerRef = useRef(null);
//   const chatBottomRef = useRef(null);
//   const textareaRef = useRef(null);

//   // Défilement automatique vers le bas à chaque nouveau message ou indicateur de frappe
//   useEffect(() => {
//     if (messagesContainerRef.current) {
//       messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//     }
//   }, [messages, isTyping]);

//   // Redimensionnement automatique de la zone de texte à l'écriture
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'auto';
//       textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
//     }
//   }, [inputText]);

//   /**
//    * Extracteur de texte sécurisé pour les payloads complexes ou imbriqués
//    */
//   const renderMessageText = (textValue) => {
//     if (!textValue) return "";

//     // Gère le cas du tableau JSON renvoyé par le backend RAG
//     if (Array.isArray(textValue)) {
//       if (textValue.length > 0 && textValue[0].text) {
//         return textValue[0].text;
//       }
//       return "";
//     }

//     // Gère le cas d'un objet simple contenant une clé text
//     if (typeof textValue === 'object') {
//       return textValue.text || JSON.stringify(textValue);
//     }

//     return textValue;
//   };

//   /**
//    * Gestionnaire unifié d'envoi de message.
//    * Transmet le texte et l'ID de session à la méthode globale du contexte.
//    */
//   const handleSend = (e) => {
//     if (e) e.preventDefault();
//     if (!inputText.trim() && !selectedFile) return;

//     let attachmentObj = null;
//     if (selectedFile) {
//       attachmentObj = {
//         name: selectedFile.name,
//         size: selectedFile.size,
//       };
//     }

//     // Appel direct au contexte centralisé qui prend en charge l'API
//     sendMessage(inputText, chatId, attachmentObj);
    
//     setInputText('');
//     setSelectedFile(null);
    
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'auto';
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   const handleSimulateAttachment = () => {
//     const completedDocs = documents.filter((d) => d.status === 'Completed');
//     if (completedDocs.length === 0) return;
    
//     const doc = completedDocs[0];
//     setSelectedFile({
//       name: doc.name,
//       size: doc.size,
//     });
//   };

//   return (
//     <div className="bg-background text-on-background h-screen overflow-hidden flex font-body-md">
//       {/* Barre de navigation latérale */}
//       <SideNavBar visible={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

//       {/* Zone de contenu principale */}
//       <div className="flex-1 flex flex-col w-full md:ml-[280px] h-full relative text-left">
//         {/* Barre supérieure */}
//         <TopAppBar title="Chat Workspace" onMenuClick={() => setMobileNavOpen(true)} />

//         {/* Layout de l'interface de discussion */}
//         <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
          
//           {/* Flux de messages défilable */}
//           <div
//             ref={messagesContainerRef}
//             className="flex-1 overflow-y-auto chat-scroll px-margin-mobile md:px-2xl py-xl flex flex-col gap-6"
//           >
//             {messages.length === 0 && (
//               <div className="flex flex-col items-center justify-center text-center mt-12 mb-8" id="empty-state">
//                 <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center mb-6 shadow-sm">
//                   <span className="material-symbols-outlined text-primary text-3xl">forum</span>
//                 </div>
//                 <h3 className="font-headline-lg text-headline-lg font-semibold text-on-surface mb-2">How can I help you today?</h3>
//                 <p className="font-body-md text-body-md text-on-surface-variant max-w-lg mx-auto">
//                   Ask a question or request assistance with your documents. The integrated pipeline will build context on-the-fly.
//                 </p>
//               </div>
//             )}

//             {/* Rendu dynamique des messages du flux */}
//             {messages.map((msg) => {
//               const safeText = renderMessageText(msg.text);
//               return (
//                 <div key={msg.id}>
//                   {msg.sender === 'user' ? (
//                     /* Composant Message Utilisateur */
//                     <div className="flex justify-end message-enter w-full max-w-4xl mx-auto">
//                       <div className="bg-primary-container text-on-primary-container rounded-2xl rounded-tr-none px-6 py-4 max-w-[85%] md:max-w-[70%] shadow-sm flex flex-col gap-3">
//                         {msg.attachment && (
//                           <div className="flex items-center gap-3 bg-white/20 rounded-lg p-2 pr-4 border border-on-primary-container/20 w-fit">
//                             <div className="w-10 h-10 rounded bg-white text-primary flex items-center justify-center">
//                               <span className="material-symbols-outlined">description</span>
//                             </div>
//                             <div className="flex flex-col text-left">
//                               <span className="font-label-sm text-label-sm text-white truncate max-w-[150px]">{msg.attachment.name}</span>
//                               <span className="text-[10px] text-on-primary-container opacity-80">{msg.attachment.size}</span>
//                             </div>
//                           </div>
//                         )}
//                         <p className="font-body-md text-body-md text-left whitespace-pre-line">{safeText}</p>
//                       </div>
//                     </div>
//                   ) : (
//                     /* Composant Message Intelligence Artificielle */
//                     <div className="flex justify-start message-enter w-full max-w-4xl mx-auto group">
//                       <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mr-3 mt-1 flex-shrink-0">
//                         <span className="material-symbols-outlined text-primary text-sm fill" style={{ fontVariationSettings: "'FILL' 1" }}>
//                           auto_awesome
//                         </span>
//                       </div>
//                       <div className="bg-surface rounded-2xl rounded-tl-none px-6 py-4 max-w-[85%] md:max-w-[75%] border-l-2 border-primary shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05),0_2px_4px_-2px_rgb(0,0,0,0.05)]">
//                         <div className="prose prose-sm max-w-none text-on-surface font-body-md">
//                           <p className="text-left whitespace-pre-line">{safeText}</p>
//                         </div>

//                         {/* Barre d'outils au survol */}
//                         <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                           <button
//                             onClick={() => navigator.clipboard.writeText(safeText)}
//                             className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
//                             title="Copy"
//                           >
//                             <span className="material-symbols-outlined text-sm">content_copy</span>
//                           </button>
//                           <button
//                             onClick={() => console.log('Regenerating response context...')}
//                             className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
//                             title="Regenerate"
//                           >
//                             <span className="material-symbols-outlined text-sm">refresh</span>
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}

//             {/* Indicateur visuel de frappe (Ollama / Llama3 actif) */}
//             {isTyping && (
//               <div className="flex justify-start w-full max-w-4xl mx-auto mt-4">
//                 <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mr-3 mt-1 flex-shrink-0">
//                   <span className="material-symbols-outlined text-primary text-sm fill" style={{ fontVariationSettings: "'FILL' 1" }}>
//                     auto_awesome
//                   </span>
//                 </div>
//                 <div className="bg-surface rounded-2xl rounded-tl-none px-5 py-4 w-20 border-l-2 border-primary shadow-sm flex items-center justify-center gap-1">
//                   <div className="w-2 h-2 bg-on-surface-variant rounded-full typing-dot"></div>
//                   <div className="w-2 h-2 bg-on-surface-variant rounded-full typing-dot"></div>
//                   <div className="w-2 h-2 bg-on-surface-variant rounded-full typing-dot"></div>
//                 </div>
//               </div>
//             )}

//             {/* Point d'ancrage pour maintenir l'alignement du scroll */}
//             <div ref={chatBottomRef} className="h-8" />
//           </div>

//           {/* Console d'entrée fixe au bas du composant */}
//           <div className="bg-background/90 backdrop-blur-md px-margin-mobile md:px-2xl py-lg border-t border-outline-variant relative z-10">
//             <div className="max-w-4xl mx-auto relative flex flex-col gap-2">
              
//               {/* Boîte de prévisualisation des fichiers joints */}
//               {selectedFile && (
//                 <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
//                   <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg p-1.5 pr-3">
//                     <div className="w-8 h-8 rounded bg-surface flex items-center justify-center text-primary">
//                       <span className="material-symbols-outlined text-sm">description</span>
//                     </div>
//                     <span className="font-label-sm text-label-sm text-on-surface truncate max-w-[120px]">{selectedFile.name}</span>
//                     <button
//                       type="button"
//                       onClick={() => setSelectedFile(null)}
//                       className="ml-1 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
//                     >
//                       <span className="material-symbols-outlined text-[16px]">close</span>
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Console d'écriture avec Textarea */}
//               <div className="relative bg-surface rounded-2xl border border-outline-variant shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex flex-col min-h-[60px]">
//                 <textarea
//                   ref={textareaRef}
//                   value={inputText}
//                   onChange={(e) => setInputText(e.target.value)}
//                   onKeyDown={handleKeyDown}
//                   className="w-full bg-transparent border-none resize-none focus:ring-0 p-4 pb-14 font-body-md text-on-surface placeholder-on-surface-variant/70 min-h-[52px] max-h-[200px] outline-none overflow-y-auto chat-scroll"
//                   placeholder="Ask DocuMind AI anything..."
//                   rows="1"
//                 ></textarea>
                
//                 <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-surface pt-1">
//                   <div className="flex gap-1">
//                     <button
//                       type="button"
//                       onClick={handleSimulateAttachment}
//                       className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors relative group cursor-pointer"
//                       title="Attach File"
//                     >
//                       <span className="material-symbols-outlined">attach_file</span>
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => alert('Indexing workspace matrices...')}
//                       className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors relative group cursor-pointer"
//                       title="Search Workspace"
//                     >
//                       <span className="material-symbols-outlined">manage_search</span>
//                     </button>
//                   </div>
                  
//                   <button
//                     type="button"
//                     onClick={() => handleSend()}
//                     disabled={!inputText.trim() && !selectedFile}
//                     className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
//                   >
//                     <span className="material-symbols-outlined">send</span>
//                   </button>
//                 </div>
//               </div>
              
//               <div className="text-center mt-2">
//                 <span className="text-[11px] text-on-surface-variant/70 font-body-sm">
//                   DocuMind AI can make mistakes. Consider verifying important information.
//                 </span>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// // ----------------------------------------------------------------
// // FULL COMPREHENSIVE CSS STYLESHEET FOR CHAT LAYOUT & ANIMATIONS
// // ----------------------------------------------------------------
// const layoutStyles = `
// .chat-scroll::-webkit-scrollbar {
//   width: 6px;
//   height: 6px;
// }
// .chat-scroll::-webkit-scrollbar-track {
//   background: transparent;
// }
// .chat-scroll::-webkit-scrollbar-thumb {
//   background-color: rgba(0, 0, 0, 0.08);
//   border-radius: 10px;
// }
// .chat-scroll::-webkit-scrollbar-thumb:hover {
//   background-color: rgba(0, 0, 0, 0.15);
// }

// @keyframes messageSlideIn {
//   from { opacity: 0; transform: translateY(8px); }
//   to { opacity: 1; transform: translateY(0); }
// }

// .message-enter {
//   animation: messageSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
// }

// .typing-dot {
//   animation: waveAnimation 1.3s infinite ease-in-out both;
// }
// .typing-dot:nth-child(1) { animation-delay: -0.32s; }
// .typing-dot:nth-child(2) { animation-delay: -0.16s; }

// @keyframes waveAnimation {
//   0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
//   40% { transform: scale(1.1); opacity: 1; }
// }
// `;

// if (typeof document !== 'undefined') {
//   const styleSheet = document.createElement("style");
//   styleSheet.type = "text/css";
//   styleSheet.innerText = layoutStyles;
//   document.head.appendChild(styleSheet);
// }

// #######################################
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import SideNavBar from '../components/SideNavBar';
import TopAppBar from '../components/TopAppBar';

export default function ChatPage() {
  const { chatId } = useParams(); // Récupère proprement l'identifiant de la session depuis l'URL
  const { messages, sendMessage, isTyping, documents } = useApp();
  
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const messagesContainerRef = useRef(null);
  const chatBottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Défilement automatique vers le bas à chaque nouveau message ou indicateur de frappe
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Redimensionnement automatique de la zone de texte à l'écriture
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  /**
   * Extracteur de texte sécurisé avec mini-parseur Markdown intégré
   * Transforme les astérisques bruts (* et **) en un rendu HTML élégant.
   */
  const renderMessageText = (textValue) => {
    if (!textValue) return "";

    // 1. Déballage initial si le RAG renvoie un tableau ou un objet complexe
    let cleanText = textValue;
    if (Array.isArray(textValue)) {
      cleanText = textValue.length > 0 && textValue[0].text ? textValue[0].text : "";
    } else if (typeof textValue === 'object') {
      cleanText = textValue.text || JSON.stringify(textValue);
    }

    // 2. Traitement des lignes pour transformer le Markdown basique (* et **)
    const lines = cleanText.split('\n');
    let insideList = false;
    const elements = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Détection des listes à puces (* Élément)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        if (!insideList) {
          insideList = true;
        }
        
        // Extraction du contenu de la ligne sans la puce
        const content = trimmed.substring(2);
        elements.push(
          <li key={`li-${index}`} className="markdown-li">
            {parseInlineMarkdown(content)}
          </li>
        );
      } else {
        // Si on quitte une liste, on ferme la logique visuelle
        if (insideList) {
          insideList = false;
        }
        
        if (trimmed === '') {
          elements.push(<div key={`br-${index}`} className="h-2" />);
        } else {
          elements.push(
            <p key={`p-${index}`} className="markdown-p text-left">
              {parseInlineMarkdown(line)}
            </p>
          );
        }
      }
    });

    return <div className="markdown-body">{elements}</div>;
  };

  /**
   * Helper pour parser le gras (**) à l'intérieur d'une ligne textuelle
   */
  const parseInlineMarkdown = (text) => {
    const parts = text.split(/\*\*([\s\S]*?)\*\*/g);
    return parts.map((part, i) => {
      // Les indices impairs représentent les éléments entourés de **
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-inherit">{part}</strong>;
      }
      return part;
    });
  };

  /**
   * Gestionnaire unifié d'envoi de message.
   * Transmet le texte et l'ID de session à la méthode globale du contexte.
   */
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

    // Appel direct au contexte centralisé qui prend en charge l'API
    sendMessage(inputText, chatId, attachmentObj);
    
    setInputText('');
    setSelectedFile(null);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSimulateAttachment = () => {
    const completedDocs = documents.filter((d) => d.status === 'Completed');
    if (completedDocs.length === 0) return;
    
    const doc = completedDocs[0];
    setSelectedFile({
      name: doc.name,
      size: doc.size,
    });
  };

  return (
    <div className="bg-background text-on-background h-screen overflow-hidden flex font-body-md">
      {/* Barre de navigation latérale */}
      <SideNavBar visible={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Zone de contenu principale */}
      <div className="flex-1 flex flex-col w-full md:ml-[280px] h-full relative text-left">
        {/* Barre supérieure */}
        <TopAppBar title="Chat Workspace" onMenuClick={() => setMobileNavOpen(true)} />

        {/* Layout de l'interface de discussion */}
        <main className="flex-1 flex flex-col bg-background relative overflow-hidden">
          
          {/* Flux de messages défilable */}
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
                  Ask a question or request assistance with your documents. The integrated pipeline will build context on-the-fly.
                </p>
              </div>
            )}

            {/* Rendu dynamique des messages du flux */}
            {messages.map((msg) => {
              const parsedContent = renderMessageText(msg.text);
              return (
                <div key={msg.id}>
                  {msg.sender === 'user' ? (
                    /* Composant Message Utilisateur */
                    <div className="flex justify-end message-enter w-full max-w-4xl mx-auto">
                      <div className="bg-primary-container text-on-primary-container rounded-2xl rounded-tr-none px-6 py-4 max-w-[85%] md:max-w-[70%] shadow-sm flex flex-col gap-3">
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
                        <div className="font-body-md text-body-md text-left">{parsedContent}</div>
                      </div>
                    </div>
                  ) : (
                    /* Composant Message Intelligence Artificielle */
                    <div className="flex justify-start message-enter w-full max-w-4xl mx-auto group">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-sm fill" style={{ fontVariationSettings: "'FILL' 1" }}>
                          auto_awesome
                        </span>
                      </div>
                      <div className="bg-surface rounded-2xl rounded-tl-none px-6 py-4 w-full max-w-[85%] md:max-w-[75%] border-l-2 border-primary shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05),0_2px_4px_-2px_rgb(0,0,0,0.05)]">
                        <div className="prose prose-sm max-w-none text-on-surface font-body-md">
                          {parsedContent}
                        </div>

                        {/* Barre d'outils au survol */}
                        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              const rawString = typeof msg.text === 'object' ? (msg.text.text || JSON.stringify(msg.text)) : msg.text;
                              navigator.clipboard.writeText(rawString);
                            }}
                            className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                            title="Copy"
                          >
                            <span className="material-symbols-outlined text-sm">content_copy</span>
                          </button>
                          <button
                            onClick={() => console.log('Regenerating response context...')}
                            className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                            title="Regenerate"
                          >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Indicateur visuel de frappe (Ollama / Llama3 actif) */}
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

            {/* Point d'ancrage pour maintenir l'alignement du scroll */}
            <div ref={chatBottomRef} className="h-8" />
          </div>

          {/* Console d'entrée fixe au bas du composant */}
          <div className="bg-background/90 backdrop-blur-md px-margin-mobile md:px-2xl py-lg border-t border-outline-variant relative z-10">
            <div className="max-w-4xl mx-auto relative flex flex-col gap-2">
              
              {/* Boîte de prévisualisation des fichiers joints */}
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

              {/* Console d'écriture avec Textarea */}
              <div className="relative bg-surface rounded-2xl border border-outline-variant shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all flex flex-col min-h-[60px]">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent border-none resize-none focus:ring-0 p-4 pb-14 font-body-md text-on-surface placeholder-on-surface-variant/70 min-h-[52px] max-h-[200px] outline-none overflow-y-auto chat-scroll"
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
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Indexing workspace matrices...')}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors relative group cursor-pointer"
                      title="Search Workspace"
                    >
                      <span className="material-symbols-outlined">manage_search</span>
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

// ----------------------------------------------------------------
// FULL COMPREHENSIVE CSS STYLESHEET FOR CHAT LAYOUT & ANIMATIONS
// ----------------------------------------------------------------
const layoutStyles = `
.chat-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.chat-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.chat-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
}
.chat-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.15);
}

/* Styles pour le rendu Markdown des puces et du texte */
.markdown-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.markdown-p {
  margin: 0 0 4px 0;
  line-height: 1.6;
}
.markdown-li {
  list-style-type: none;
  position: relative;
  padding-left: 20px;
  margin-bottom: 6px;
  line-height: 1.5;
  text-align: left;
}
.markdown-li::before {
  content: "•";
  position: absolute;
  left: 6px;
  color: currentColor;
  font-weight: bold;
}

@keyframes messageSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-enter {
  animation: messageSlideIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.typing-dot {
  animation: waveAnimation 1.3s infinite ease-in-out both;
}
.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes waveAnimation {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1.1); opacity: 1; }
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = layoutStyles;
  document.head.appendChild(styleSheet);
}