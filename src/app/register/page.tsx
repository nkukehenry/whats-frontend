"use client";
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { registerThunk } from '../../slices/authThunks';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    try {
      const result = await dispatch(registerThunk(form)).unwrap();
      setSuccess(result.message || "Registration successful! You can now log in.");
    } catch {
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg flex flex-col p-10">
        <h2 className="text-3xl font-bold text-black mb-2">Create Account</h2>
        <p className="text-primary font-bold mb-8">Register for WhatsApp SaaS</p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-black mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-light bg-light focus:outline-none focus:ring-2 focus:ring-primary text-black"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-black mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-light bg-light focus:outline-none focus:ring-2 focus:ring-primary text-black"
              placeholder="Your email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-black mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg border border-light bg-light focus:outline-none focus:ring-2 focus:ring-primary text-black"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-black mb-1">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="w-full px-4 py-2 rounded-lg border border-light bg-light focus:outline-none focus:ring-2 focus:ring-primary text-black"
              placeholder="Your phone number"
              value={form.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-600 font-semibold text-sm">{error}</div>}
          {success && <div className="text-green-700 font-semibold text-sm">{success}</div>}
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-2 rounded-lg shadow hover:bg-green-600 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-sm text-center">
          Already have an account? <a href="/login" className="text-primary font-semibold hover:underline">Login</a>
        </div>
      </div>
    </div>
  );
} 