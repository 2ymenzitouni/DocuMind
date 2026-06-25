import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  
  // ----------------------------------------------------------------
  // CORE APPLICATION STATES
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
  const [isLoading, setIsLoading] = useState(true); // Locks router layout during initialization

  const API_BASE_URL = "http://localhost:8000";

  // ----------------------------------------------------------------
  // REUSABLE SYNCHRONIZATION HELPERS
  // ----------------------------------------------------------------
  const fetchUserDocuments = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data || []);
      }
    } catch (error) {
      console.error("Failed to sync documents cache with backend:", error);
    }
  };

  // ----------------------------------------------------------------
  // AUTOMATIC SESSION RESTORATION (ON APP MOUNT)
  // ----------------------------------------------------------------
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.user) {
            setUser(data.user); // Hydrate user context globally
            await fetchUserDocuments(token); // Fetch documents in background
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
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ----------------------------------------------------------------
  // AUTHENTICATION OPERATIONS
  // ----------------------------------------------------------------
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error("Login failed");
      
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      setUser(data.user);
      
      // Load user assets immediately post authentication
      await fetchUserDocuments(data.access_token);
      
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
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
    setDocuments([]);
  };

  // ----------------------------------------------------------------
  // SYNCHRONIZED DOCUMENT OPERATIONS (FAISS Pipeline Sync)
  // ----------------------------------------------------------------
  const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
          // CRITICAL: Do NOT set Content-Type header here manually.
          // The browser must auto-assign the boundary metadata for multipart/form-data.
        },
        body: formData
      });

      if (!response.ok) throw new Error("File submission pipeline failed");

      const data = await response.json();
      
      const newDoc = {
        id: data.id,
        name: data.name || data.filename,
        status: data.status,
        date: data.date || new Date().toISOString().split('T')[0],
        size: data.size || file.size
      };

      setDocuments((prev) => [newDoc, ...prev]);
      return data;
    } catch (error) {
      console.error("Context upload operational error:", error);
      throw error;
    }
  };

  const deleteDocument = async (docId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${docId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to clear document from stores");

      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (error) {
      console.error("Context document deletion route failure:", error);
      throw error;
    }
  };

  // ----------------------------------------------------------------
  // CORE CHAT PIPELINE (RAG Agent Context Interface)
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

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          chat_id: chatId || "default-session",
          question: text
        })
      });

      if (!response.ok) throw new Error("AI Agent Inference Error");

      const data = await response.json();

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      const aiErrorMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "Sorry, I can't reach the AI agent at this time. Please check your local server or model runtime.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiErrorMessage]);
      console.error("Pipeline communication failed:", error);
    } finally {
      setIsTyping(false);
    }
  };  

  return (
    <AppContext.Provider
      value={{
        user,
        documents,
        setDocuments,
        messages,
        isTyping,
        isLoading,
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