// import React from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { useApp } from './context/AppContext';

// // Import Pages
// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import DashboardPage from './pages/DashboardPage';
// import DocumentsPage from './pages/DocumentsPage';
// import ChatPage from './pages/ChatPage';

// // Protected Route wrapper - Users must be logged in
// const ProtectedRoute = ({ children }) => {
//   const { user, isLoading } = useApp();

//   // Wait until context checks localStorage and fetches data from /users/me
//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
//         <div className="text-center space-y-2">
//           <p className="font-label-md animate-pulse">Verifying session...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// };

// // Public Route wrapper - Redirects to dashboard IF already logged in
// const PublicRoute = ({ children }) => {
//   const { user, isLoading } = useApp();

//   // Wait until context checks localStorage before making structural redirect choices
//   if (isLoading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
//         <div className="text-center space-y-2">
//           <p className="font-label-md animate-pulse">Verifying session...</p>
//         </div>
//       </div>
//     );
//   }

//   if (user) {
//     return <Navigate to="/dashboard" replace />;
//   }
//   return children;
// };

// function App() {
//   return (
//     <Routes>
//       {/* Public Pages */}
//       <Route
//         path="/"
//         element={
//           <PublicRoute>
//             <LandingPage />
//           </PublicRoute>
//         }
//       />
//       <Route
//         path="/login"
//         element={
//           <PublicRoute>
//             <LoginPage />
//           </PublicRoute>
//         }
//       />
//       <Route
//         path="/signup"
//         element={
//           <PublicRoute>
//             <RegisterPage />
//           </PublicRoute>
//         }
//       />

//       {/* Console (Protected) Pages */}
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <DashboardPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/documents"
//         element={
//           <ProtectedRoute>
//             <DocumentsPage />
//           </ProtectedRoute>
//         }
//       />

//       {/* Fallback Catch: If a user navigates to standard '/chat', 
//           instantly generate a new unique UUID session and route them to it.
//       */}
//       <Route
//         path="/chat"
//         element={
//           <ProtectedRoute>
//             <Navigate to={`/chat/${crypto.randomUUID()}`} replace />
//           </ProtectedRoute>
//         }
//       />

//       {/* Dynamic Chat Room Interface Route */}
//       <Route
//         path="/chat/:chatId"
//         element={
//           <ProtectedRoute>
//             <ChatPage />
//           </ProtectedRoute>
//         }
//       />

//       {/* Global Redirect Fallback */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// export default App;




// ###################################################################
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route wrapper - Users must be logged in
const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useApp();

  // Wait until context checks localStorage and fetches data from /users/me
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-2">
          <p className="font-label-md animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route wrapper - Redirects to dashboard IF already logged in
const PublicRoute = ({ children }) => {
  const { user, isLoading } = useApp();

  // Wait until context checks localStorage before making structural redirect choices
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-2">
          <p className="font-label-md animate-pulse">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Console (Protected) Pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Catch: If a user navigates to standard '/chat', 
          instantly generate a new unique UUID session and route them to it.
      */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Navigate to={`/chat/${crypto.randomUUID()}`} replace />
          </ProtectedRoute>
        }
      />

      {/* Dynamic Chat Room Interface Route */}
      <Route
        path="/chat/:chatId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

        <Route
        path="/profile/:profileId"
        element={
          <ProtectedRoute>
            <ProfilePage/>
          </ProtectedRoute>
        }
      />
      {/* Global Redirect Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;