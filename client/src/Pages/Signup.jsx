import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!fullname || !email || !password) {
      alert('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("http://localhost:8000/signup", {
        name: fullname,
        email,
        password,
      });

      console.log(response.data);

      alert("Account created successfully!");

      // redirect to login or dashboard
      navigate('/login');

    } catch (error) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.detail || "Signup failed");
      } else {
        alert("Cannot connect to server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-4 antialiased relative overflow-hidden">

      <main className="w-full max-w-[440px] relative z-10">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-primary text-xl">
            DocuMind AI
          </Link>
          <p className="text-gray-500">Create an account to start automating.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Full Name */}
            <input
              type="text"
              placeholder="Full Name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full border p-3 rounded"
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-3 rounded"
            />

            {/* Password */}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded"
            />

            {/* Confirm Password */}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-3 rounded"
            />

            {/* Toggle Password */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Show password
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

          </form>

          <div className="mt-4 text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600">
                Log in
              </Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}