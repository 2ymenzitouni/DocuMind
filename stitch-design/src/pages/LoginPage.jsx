// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useApp } from '../context/AppContext';

// export default function LoginPage() {
//   const { login } = useApp();
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (email && password) {
//       login(email, password);
//       navigate('/dashboard');
//     }
//   };

//   return (
//     <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-margin-mobile md:p-xl font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
//       <main className="w-full max-w-[400px]">
//         {/* Brand / Header */}
//         <div className="text-center mb-xl">
//           <Link to="/" className="inline-block font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-primary mb-sm font-bold">
//             DocuMind AI
//           </Link>
//           <p className="font-body-md text-body-md text-on-surface-variant">Welcome back. Please sign in to your account.</p>
//         </div>

//         {/* Login Card */}
//         <div className="bg-surface-container-lowest rounded-2xl p-xl shadow-[0_10px_15px_-3px_rgb(0,0,0,0.1)] border border-outline-variant/30">
//           <form onSubmit={handleSubmit} className="space-y-lg">
//             {/* Email Input */}
//             <div className="space-y-sm text-left">
//               <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
//                 </div>
//                 <input
//                   autoComplete="email"
//                   type="email"
//                   id="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-2 border border-outline/30 rounded-lg bg-surface-bright text-on-surface shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow font-body-md text-body-md placeholder-outline-variant"
//                   placeholder="you@example.com"
//                 />
//               </div>
//             </div>

//             {/* Password Input */}
//             <div className="space-y-sm text-left">
//               <div className="flex items-center justify-between">
//                 <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
//                   Password
//                 </label>
//                 <a
//                   href="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     alert('Password recovery simulation');
//                   }}
//                   className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors"
//                 >
//                   Forgot password?
//                 </a>
//               </div>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
//                 </div>
//                 <input
//                   autoComplete="current-password"
//                   type="password"
//                   id="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="block w-full pl-10 pr-3 py-2 border border-outline/30 rounded-lg bg-surface-bright text-on-surface shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow font-body-md text-body-md placeholder-outline-variant"
//                   placeholder="••••••••"
//                 />
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div>
//               <button
//                 type="submit"
//                 className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer"
//               >
//                 Sign In
//               </button>
//             </div>
//           </form>

//           {/* Sign Up Link */}
//           <div className="mt-lg text-center">
//             <p className="font-body-sm text-body-sm text-on-surface-variant">
//               Don't have an account?{' '}
//               <Link to="/signup" className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors ml-1">
//                 Sign up
//               </Link>
//             </p>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// ################################################
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      // Adjusted to match your prefix-free backend route structure
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid email or password');
      }

      // Sync user data / access token to context if tracked there
      if (typeof login === 'function') {
        login(data);
      }

      // Successful login redirect
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex items-center justify-center p-margin-mobile md:p-xl font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container">
      <main className="w-full max-w-[400px]">
        {/* Brand / Header */}
        <div className="text-center mb-xl">
          <Link to="/" className="inline-block font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-primary mb-sm font-bold">
            DocuMind AI
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant">Welcome back. Please sign in to your account.</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-xl shadow-[0_10px_15px_-3px_rgb(0,0,0,0.1)] border border-outline-variant/30">
          <form onSubmit={handleSubmit} className="space-y-lg">
            
            {/* Backend Response Error Banner */}
            {errorMsg && (
              <div className="p-3 bg-error/10 border border-error/20 text-error rounded-lg text-sm text-left">
                {errorMsg}
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-sm text-left">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
                </div>
                <input
                  autoComplete="email"
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-outline/30 rounded-lg bg-surface-bright text-on-surface shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow font-body-md text-body-md placeholder-outline-variant"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-sm text-left">
              <div className="flex items-center justify-between">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password recovery simulation');
                  }}
                  className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                </div>
                <input
                  autoComplete="current-password"
                  type="password"
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-outline/30 rounded-lg bg-surface-bright text-on-surface shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow font-body-md text-body-md placeholder-outline-variant"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-surface-tint focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/signup" className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors ml-1">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}