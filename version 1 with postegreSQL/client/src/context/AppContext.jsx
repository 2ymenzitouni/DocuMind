import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  
  // ----------------------------------------------------------------
  // CORE STATES
  // ----------------------------------------------------------------
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 'm2',
      sender: 'ai',
      text: "Hello! 👋 I'm your AI assistant. How can I help you today? Feel free to ask me questions, upload documents, or request assistance with any task.",
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Locks router from dropping into login screen early

  // ----------------------------------------------------------------
  // DEFENSIVE AUTO RECOVERY ON PAGE REFRESH
  // ----------------------------------------------------------------
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/users/me", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.user) {
            setUser(data.user); // Hydrates state with verified backend profile credentials
          } else {
            localStorage.removeItem("token");
          }
        } else {
          console.warn("Session token invalid or expired. Clearing storage keys.");
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Network failure during session recovery lookup:", error);
      } finally {
        setIsLoading(false); // Drop loading block safely
      }
    };

    restoreSession();
  }, []);

  // ----------------------------------------------------------------
  // AUTHENTICATION MECHANICS
  // ----------------------------------------------------------------
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error("Login failed");
      
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      if (!response.ok) throw new Error("Registration failed");
      return await response.json();
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ----------------------------------------------------------------
  // DOCUMENT OPERATIONS
  // ----------------------------------------------------------------
  const uploadDocument = async (file) => {
    console.log("Uploading document:", file.name);
    // Document upload implementation logic goes here
  };

  const deleteDocument = async (docId) => {
    console.log("Deleting document identity id:", docId);
    // Document deletion implementation logic goes here
  };

  // ----------------------------------------------------------------
  // ONE UNIFIED SEND MESSAGE PIPELINE (Direct /chat routing)
  // ----------------------------------------------------------------
  const sendMessage = async (text, chatId, attachment = null) => {
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

    // Injection instantanée de la bulle utilisateur sur le flux UI
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");

      // Requête directe vers l'endpoint unique consolidé
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Protection Bearer injectée pour FastAPI
        },
        body: JSON.stringify({
          chat_id: chatId || "default-session", // Passe l'UUID issu des URL dynamiques
          question: text
        })
      });

      if (!response.ok) {
        throw new Error("Backend error during pipeline inference processing");
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
      const aiErrorMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Désolé, impossible de joindre l'intelligence artificielle pour le moment.",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      setMessages(prev => [...prev, aiErrorMessage]);
      console.error("Communication failure inside unified pipeline call:", error);
    } finally {
      setIsTyping(false);
    }
  };  

  // ----------------------------------------------------------------
  // CONTEXT PROVIDER LAYOUT
  // ----------------------------------------------------------------
  return (
    <AppContext.Provider
      value={{
        user,
        documents,
        messages,
        isTyping,
        isLoading, // Exposed cleanly to lock ProtectedRoute transitions
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

export const useApp = () => useContext(AppContext);