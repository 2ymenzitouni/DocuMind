// import React from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useApp } from '../context/AppContext';

// export default function SideNavBar({ visible, onClose }) {
//   const { user, logout } = useApp();
//   const navigate = useNavigate();

//   const handleLogoutClick = () => {
//     // 1. Fire context state cleanup
//     logout();
//     // 2. Shut mobile layout drawer overlay
//     if (onClose) onClose();
//     // 3. Boot user back to auth portal entry screen
//     navigate('/login');
//   };

//   return (
//     <>
//       {/* Mobile Drawer Overlay */}
//       {visible && (
//         <div
//           className="fixed inset-0 z-30 bg-black/40 md:hidden"
//           onClick={onClose}
//         ></div>
//       )}

//       <aside
//         className={`fixed left-0 top-0 h-full w-[280px] bg-surface-container-low border-r border-outline-variant flex flex-col py-md z-40 transition-transform duration-300 md:translate-x-0 ${
//           visible ? 'translate-x-0' : '-translate-x-full md:flex'
//         }`}
//       >
//         {/* Header */}
//         <div className="px-lg mb-8 flex items-center gap-3">
//           <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary shadow-sm">
//             <span className="material-symbols-outlined fill" style={{ fontSize: '24px' }}>description</span>
//           </div>
//           <div>
//             <h1 className="font-headline-md text-headline-md font-bold text-on-surface">DocuMind AI</h1>
//             <p className="font-label-sm text-label-sm text-on-surface-variant">{user?.plan || 'Free Plan'}</p>
//           </div>
//         </div>

//         {/* Main Navigation */}
//         <nav className="flex-1 px-sm flex flex-col gap-1 font-label-md text-label-md">
//           <NavLink
//             to="/dashboard"
//             onClick={onClose}
//             className={({ isActive }) =>
//               `flex items-center gap-3 rounded-lg mx-2 px-4 py-3 transition-all ${
//                 isActive
//                   ? 'bg-primary-container text-on-primary-container font-semibold scale-95'
//                   : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
//               }`
//             }
//           >
//             <span className="material-symbols-outlined fill">dashboard</span>
//             Dashboard
//           </NavLink>

//           <NavLink
//             to="/documents"
//             onClick={onClose}
//             className={({ isActive }) =>
//               `flex items-center gap-3 rounded-lg mx-2 px-4 py-3 transition-all ${
//                 isActive
//                   ? 'bg-primary-container text-on-primary-container font-semibold scale-95'
//                   : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
//               }`
//             }
//           >
//             <span className="material-symbols-outlined fill">description</span>
//             Documents
//           </NavLink>

//           <NavLink
//             to="/chat"
//             onClick={onClose}
//             className={({ isActive }) =>
//               `flex items-center gap-3 rounded-lg mx-2 px-4 py-3 transition-all ${
//                 isActive
//                   ? 'bg-primary-container text-on-primary-container font-semibold scale-95'
//                   : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
//               }`
//             }
//           >
//             <span className="material-symbols-outlined fill">chat</span>
//             Chat
//           </NavLink>
//         </nav>

//         {/* Footer Navigation */}
//         <div className="mt-auto px-sm flex flex-col gap-1 font-label-md text-label-md border-t border-outline-variant pt-4 mx-4">
//           <button
//             onClick={() => alert('Settings popup simulation')}
//             className="flex items-center w-full gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg px-4 py-2 transition-colors text-left"
//           >
//             <span className="material-symbols-outlined">settings</span>
//             Settings
//           </button>
//           <button
//             onClick={() => alert('Support chatbot popup simulation')}
//             className="flex items-center w-full gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg px-4 py-2 transition-colors text-left"
//           >
//             <span className="material-symbols-outlined">help</span>
//             Support
//           </button>
//           <button
//             onClick={handleLogoutClick}
//             className="flex items-center w-full gap-3 text-error hover:bg-error-container/20 rounded-lg px-4 py-2 transition-colors text-left mt-2"
//           >
//             <span className="material-symbols-outlined">logout</span>
//             Log Out
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }


// #################################################################
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function SideNavBar({ visible, onClose }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {visible && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[280px] bg-surface-container-low border-r border-outline-variant flex flex-col py-md z-40 transition-transform duration-300 md:translate-x-0 ${
          visible ? 'translate-x-0' : '-translate-x-full md:flex'
        }`}
      >
        {/* Header */}
        <div className="px-lg mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined fill" style={{ fontSize: '24px' }}>description</span>
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface">DocuMind AI</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{user?.plan || 'Free Plan'}</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-sm flex flex-col gap-1 font-label-md text-label-md">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg mx-2 px-4 py-3 transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold scale-95'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined fill">dashboard</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/documents"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg mx-2 px-4 py-3 transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold scale-95'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined fill">description</span>
            Documents
          </NavLink>

          <NavLink
            to="/chat"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg mx-2 px-4 py-3 transition-all ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold scale-95'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              }`
            }
          >
            <span className="material-symbols-outlined fill">chat</span>
            Chat
          </NavLink>
        </nav>

        {/* Footer Navigation */}
        <div className="mt-auto px-sm flex flex-col gap-1 font-label-md text-label-md border-t border-outline-variant pt-4 mx-4">
          
          {/* Nouveau lien Settings dynamique */}
          <NavLink
            to={`/profile/${user?.id || '123'}`}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center w-full gap-3 rounded-lg px-4 py-2 transition-colors text-left ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`
            }
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </NavLink>

          <button
            onClick={() => alert('Support chatbot popup simulation')}
            className="flex items-center w-full gap-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg px-4 py-2 transition-colors text-left"
          >
            <span className="material-symbols-outlined">help</span>
            Support
          </button>
          <button
            onClick={handleLogoutClick}
            className="flex items-center w-full gap-3 text-error hover:bg-error-container/20 rounded-lg px-4 py-2 transition-colors text-left mt-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}