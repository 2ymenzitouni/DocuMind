import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: 'Alex',
    email: 'alex@company.com',
    plan: 'Enterprise Plan',
  });

  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Q3_Financial_Report.pdf',
      date: 'Oct 24, 2023',
      size: '2.4 MB',
      status: 'Completed',
      type: 'pdf',
    },
    {
      id: '2',
      name: 'Project_Alpha_Specs.docx',
      date: 'Oct 23, 2023',
      size: '1.1 MB',
      status: 'Processing...',
      type: 'docx',
    },
    {
      id: '3',
      name: 'Corrupted_Archive.zip',
      date: 'Oct 20, 2023',
      size: '0.0 KB',
      status: 'Failed',
      type: 'zip',
    },
  ]);

  const [messages, setMessages] = useState([
    // {
    //   id: 'm1',
    //   sender: 'user',
    //   text: 'Can you summarize the Q3 Financial Report and highlight the key risk factors mentioned in the appendix?',
    //   timestamp: '10:42 AM',
    // },
    {
      id: 'm2',
      sender: 'ai',
      text: "Hello! 👋 I'm your AI assistant. How can I help you today?Feel free to ask me questions, upload documents, or request assistance with any task.",
      // summaryPoints: [
      //   'Overall revenue increased by 14% year-over-year, driven largely by enterprise software subscriptions.',
      //   'Operating margins improved to 22%, up from 18% in Q2, due to cost-saving measures in infrastructure.',
      //   'Customer acquisition cost (CAC) decreased by 5%, indicating improved marketing efficiency.',
      // ],
      // risks: [
      //   {
      //     title: 'Supply Chain Volatility',
      //     desc: 'The report notes potential delays in hardware procurement for Q4, which could impact planned data center expansions.',
      //     citation: 'Q3_Report.pdf p.12',
      //   },
      //   {
      //     title: 'Regulatory Changes',
      //     desc: 'Upcoming compliance requirements in the EU market may necessitate significant updates to data processing workflows by early next year.',
      //     citation: 'Q3_Report.pdf p.15',
      //   },
      // ],
      // timestamp: '10:43 AM',
    },
  ]);

  const [isTyping, setIsTyping] = useState(false);

  // Simulate document processing transition for any initial processing docs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.status === 'Processing...' ? { ...doc, status: 'Completed' } : doc
        )
      );
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const login = (email, password) => {
    setUser({
      name: 'Alex',
      email: email,
      plan: 'Enterprise Plan',
    });
    return true;
  };

  const register = (fullname, email, password) => {
    setUser({
      name: fullname,
      email: email,
      plan: 'Enterprise Plan',
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const uploadDocument = (fileName, fileSize) => {
    const newId = Date.now().toString();
    const sizeInMB = fileSize ? (fileSize / (1024 * 1024)).toFixed(1) + ' MB' : '1.5 MB';
    const isCorrupt = fileName.toLowerCase().includes('corrupt') || fileName.toLowerCase().endsWith('.zip');

    const newDoc = {
      id: newId,
      name: fileName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: sizeInMB,
      status: 'Processing...',
      type: fileName.split('.').pop() || 'pdf',
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Simulate completion
    setTimeout(() => {
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === newId
            ? { ...doc, status: isCorrupt ? 'Failed' : 'Completed' }
            : doc
        )
      );
    }, 3000);
  };

  const deleteDocument = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  // const sendMessage = (text, attachment = null) => {
  //   const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  //   const userMsg = {
  //     id: Date.now().toString(),
  //     sender: 'user',
  //     text,
  //     attachment,
  //     timestamp,
  //   };

  //   setMessages((prev) => [...prev, userMsg]);
  //   setIsTyping(true);

  //   // Simulate AI response logic
  //   setTimeout(() => {
  //     setIsTyping(false);
  //     const cleanedText = text.toLowerCase();
  //     let responseMsg = {
  //       id: (Date.now() + 1).toString(),
  //       sender: 'ai',
  //       timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  //     };

  //     if (cleanedText.includes('risk') || cleanedText.includes('report') || cleanedText.includes('q3')) {
  //       responseMsg.text = 'Analyzing the requested documentation. The Q3 Report highlights operating efficiency improvements but underscores supply-chain and legislative vulnerabilities:';
  //       responseMsg.summaryPoints = [
  //         'Operating margins grew due to hardware optimization.',
  //         'Delayed expansion of regional hosting clusters constitutes a main threat.',
  //       ];
  //       responseMsg.risks = [
  //         {
  //           title: 'Supply Chain Bottlenecks',
  //           desc: 'Global logistics hold-ups could restrict hardware availability for primary data nodes.',
  //           citation: 'Q3_Financial_Report.pdf p.12',
  //         },
  //       ];
  //     } else if (cleanedText.includes('spec') || cleanedText.includes('alpha') || cleanedText.includes('regulatory')) {
  //       responseMsg.text = 'Regarding compliance guidelines in Project_Alpha_Specs.docx, the text details regulatory protocols:';
  //       responseMsg.summaryPoints = [
  //         'Design specification aligns fully with standard localized privacy policies.',
  //         'Additional encryption levels are planned to counter strict security protocols.',
  //       ];
  //       responseMsg.risks = [
  //         {
  //           title: 'GDPR / Regional Data Restraints',
  //           desc: 'Requires local server localization for user profiles which might delay the platform launch.',
  //           citation: 'Project_Alpha_Specs.docx p.7',
  //         },
  //       ];
  //     } else {
  //       responseMsg.text = `Thank you for asking. I see ${documents.filter(d => d.status === 'Completed').length} completed documents in your knowledge base. How can I help you extract details, summarize points, or compare risk profiles for these files?`;
  //     }

  //     setMessages((prev) => [...prev, responseMsg]);
  //   }, 2000);
  // };

  // ==============================================
const sendMessage = async (text, attachment = null) => {

  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const userMessage = {
    id: Date.now().toString(),
    sender: "user",
    text,
    attachment,
    timestamp
  };

  setMessages(prev => [...prev, userMessage]);

  setIsTyping(true);

  try {

    const response = await fetch(
      "http://localhost:8000/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: text
        })
      }
    );

    if (!response.ok) {
      throw new Error("Backend error");
    }

    const data = await response.json();

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: data.answer,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, aiMessage]);

  } catch (error) {

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      sender: "ai",
      text: "Erreur de connexion avec le serveur.",
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages(prev => [...prev, aiMessage]);

    console.error(error);

  } finally {

    setIsTyping(false);

  }
};  return (
    <AppContext.Provider
      value={{
        user,
        documents,
        messages,
        isTyping,
        login,
        register,
        logout,
        uploadDocument,
        deleteDocument,
        sendMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
