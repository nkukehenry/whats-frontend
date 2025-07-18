"use client";

import type React from "react"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "../../hooks"
import { registerThunk } from "../../slices/authThunks"
import { useRouter } from "next/navigation"
import { MessageCircle, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"

// Common country codes with their dial codes
const countryCodes = [
  { code: 'UG', name: 'Uganda', dialCode: '+256' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'KE', name: 'Kenya', dialCode: '+254' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'GH', name: 'Ghana', dialCode: '+233' },
  { code: 'ET', name: 'Ethiopia', dialCode: '+251' },
];

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { loading, error } = useAppSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [selectedCountryCode, setSelectedCountryCode] = useState('+256'); // Default to Uganda
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccess(null);
    try {
      // Combine country code with phone number
      const fullPhone = selectedCountryCode + form.phone;
      const registrationData = {
        ...form,
        phone: fullPhone
      };
      const result = await dispatch(registerThunk(registrationData)).unwrap();
      setSuccess(result.message || "Registration successful! You can now log in.");
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80')`,
          }}
        />

        {/* Gradient Overlay - fades from image to green */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-green-900/60 to-green-600/95" />

        {/* Additional texture overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 border border-white/10">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">Geni WhatsApp</span>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight drop-shadow-lg">
                START YOUR
                <br />
                <span className="text-green-200">BUSINESS JOURNEY</span>
                <br />
                TODAY!
              </h1>
              <p className="text-xl text-white/95 leading-relaxed max-w-md drop-shadow-md">
                Join thousands of businesses using WhatsApp automation to grow their customer base and increase sales.
              </p>
            </div>
            <p className="text-lg text-green-100 drop-shadow-sm">Your success story begins here.</p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-12 right-12 opacity-10">
            <MessageCircle className="w-32 h-32" />
          </div>

          {/* Floating elements for visual interest */}
          <div className="absolute top-1/4 right-1/4 opacity-20">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          </div>
          <div className="absolute top-1/3 right-1/3 opacity-15">
            <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
          <div className="absolute bottom-1/3 right-1/5 opacity-25">
            <div className="w-4 h-4 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">CREATE ACCOUNT</h2>
              <p className="text-gray-600">Join us! Please enter your details to get started.</p>
            </div>

            {/* Form */}
            <div className="px-8 pb-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Phone Field */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="px-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 min-w-[120px]"
                      disabled={loading}
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.dialCode}>
                          {country.code} {country.dialCode}
                        </option>
                      ))}
                    </select>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                      placeholder="Phone number"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-green-400 mr-3" />
                      <p className="text-sm font-medium text-green-800">{success}</p>
                    </div>
                  </div>
                )}

                {/* Sign Up Button */}
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </button>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <button type="button" className="text-green-600 hover:text-green-700 font-medium" onClick={() => router.push("/login")}>
                    Sign in
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 