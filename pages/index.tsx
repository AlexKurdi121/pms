import { useState, useEffect } from "react";
import Head from "next/head";

import axios from "axios";
import { useRouter } from "next/router";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SecurityIcon from "@mui/icons-material/Security";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role) {
      if (role === "pharmaciet") router.replace("/dash-pharmaciet");
      else if (role === "admin") router.replace("/dashboard");
      else if (role === "superadmin") router.replace("/dashboard");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await axios.post("/api/route/login", {
        email,
        password,
      });

      // Save token + role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      }

      // Redirect based on role
      const role = res.data.user.role;

      if (role === "pharmaciet") router.push("/dash-pharmaciet");
      else if (role === "admin") router.push("/dashboard");
      else if (role === "superadmin") router.push("/dashboard");

    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (

    
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
       <Head>
        <title>Home Page</title>
      </Head>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100 opacity-30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-100 opacity-30 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 h-60 w-60 rounded-full bg-purple-100 opacity-20 blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Medical Icons */}
      <div className="fixed top-20 left-10 text-blue-200 animate-bounce">
        <MedicalServicesIcon className="w-12 h-12 opacity-10" />
      </div>
      <div className="fixed bottom-20 right-10 text-emerald-200 animate-bounce delay-300">
        <LocalPharmacyIcon className="w-12 h-12 opacity-10" />
      </div>
      <div className="fixed top-1/2 right-1/4 text-purple-200 animate-bounce delay-700">
        <SecurityIcon className="w-10 h-10 opacity-10" />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
        {/* Left Side - Branding & Info */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <div className="mb-8">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-xl">
                <MedicalServicesIcon className="text-white text-3xl" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  PharmaCare
                </h1>
                <p className="text-gray-600 mt-2">Professional Pharmacy Management</p>
              </div>
            </div>

            <p className="text-gray-700 text-lg mb-6 max-w-xl">
              Secure login portal for pharmacy administrators, pharmacists, and super admins.
              Manage your pharmacy operations efficiently.
            </p>

            <div className="space-y-4 max-w-lg">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="p-2 rounded-lg bg-blue-500 text-white">
                  <VerifiedUserIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Secure Access</h3>
                  <p className="text-sm text-gray-600">Role-based authentication system</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl">
                <div className="p-2 rounded-lg bg-emerald-500 text-white">
                  <SecurityIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Protected Data</h3>
                  <p className="text-sm text-gray-600">Encrypted user and inventory data</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                <div className="p-2 rounded-lg bg-purple-500 text-white">
                  <LocalPharmacyIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Multi-role Support</h3>
                  <p className="text-sm text-gray-600">Pharmacist, Admin & Super Admin access</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Form Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-xl mb-4">
                <LockIcon className="text-white text-4xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your dashboard</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl animate-shake">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/20">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-red-800">Authentication Failed</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <EmailIcon className="w-4 h-4 text-gray-500" />
                    Email Address
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-400 text-gray-800 placeholder-gray-500"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <EmailIcon />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <LockIcon className="w-4 h-4 text-gray-500" />
                    Password
                  </div>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 group-hover:border-blue-400 text-gray-800 placeholder-gray-500"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors">
                    <LockIcon />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                      {rememberMe && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl text-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowForwardIcon className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Role Demo Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-3">Demo Credentials</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800">Super Admin</p>
                  <p className="text-blue-600 truncate">superadmin@pharma.com</p>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <p className="font-medium text-emerald-800">Admin</p>
                  <p className="text-emerald-600 truncate">admin@pharma.com</p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-800">Pharmacist</p>
                  <p className="text-purple-600 truncate">pharmacist@pharma.com</p>
                </div>
              </div>
            </div>

            {/* Security Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <SecurityIcon className="w-3 h-3" />
                Your data is protected with 256-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-4 right-4 text-gray-400 text-xs">
        © {new Date().getFullYear()} PharmaCare • v2.4.1
      </div>

      {/* Add custom animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;