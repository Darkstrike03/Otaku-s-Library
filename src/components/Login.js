'use client';

import React, { useState } from "react";
import { X, Mail, Lock } from "lucide-react";
import { supabase } from "@/supabaseClient"; // changed path

export default function Login({ isDark = true, onLogin, onClose }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (isForgotPassword) {
        // FORGOT PASSWORD - Send Magic Link
        if (!email) {
          alert("Please enter your email address");
          setLoading(false);
          return;
        }
        
        console.log("Attempting to send magic link to:", email);
        
        const { data, error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/profile`,
            shouldCreateUser: false, // Only send to existing users
          },
        });
        
        console.log("Magic link response:", { data, error });
        
        if (error) {
          console.error("Magic link failed:", error.message);
          
          // Check if it's a configuration issue
          if (error.message.includes('Email') || error.message.includes('SMTP')) {
            alert("Email service not configured. Please contact support or use the regular login with your password.");
          } else {
            alert("Failed to send magic link: " + error.message + "\n\nPlease check:\n1. Email exists in system\n2. Check spam folder\n3. Contact support if issue persists");
          }
          return;
        }
        
        alert("Magic link sent! Please check your email inbox (and spam folder) to login. The link will expire in 1 hour.");
        setIsForgotPassword(false);
        setEmail("");
      } else if (isSignUp) {
        // SIGN UP
        if (password !== confirmPassword) {
          alert("Passwords do not match!");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          alert("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          console.error("Sign-up failed:", signUpError.message);
          alert("Sign-up failed: " + signUpError.message);
          return;
        }
        alert("Sign-up successful! Please check your email to confirm your account.");
      } else {
        // LOGIN
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          console.error("Login failed:", loginError.message);
          alert("Login failed: " + loginError.message);
          return;
        }
        console.log("success");
        alert("Login successful!");
      }

      onLogin?.(); // Notify parent component
      onClose?.(); // Close modal
    } catch (err) {
      console.error("AUTH ERROR:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) alert(error.message);
    else {
      onLogin?.();
      onClose?.();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center 
      ${isDark ? "bg-black/40" : "bg-white/40"} backdrop-blur-xl`}
    >
      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl
        border ${isDark ? "border-white/10 bg-black/30" : "border-black/10 bg-white/30"} 
        backdrop-blur-2xl`}
      >
        {/* Glow bar top */}
        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
          <div
            className={`h-full w-1/3 ${
              isDark
                ? "bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                : "bg-gradient-to-r from-transparent via-purple-600 to-transparent"
            }`}
            style={{ animation: "slide 3s ease-in-out infinite" }}
          ></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 p-2 rounded-full transition
            ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/10 hover:bg-black/20 text-black"}`}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h2
          className={`text-3xl font-black text-center mb-6 ${
            isDark ? "text-white" : "text-black"
          }`}
        >
          {isForgotPassword ? "Reset Password" : isSignUp ? "Create Account" : "Welcome Back"}
        </h2>

        {/* Email */}
        <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-black/80"}`}>
          Email
        </label>
        <div
          className={`flex items-center mt-1 px-3 py-2 mb-4 rounded-xl backdrop-blur-xl border 
            ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}
        >
          <Mail size={18} className="mr-2 opacity-70" />
          <input
            className={`flex-1 bg-transparent outline-none text-sm 
            ${isDark ? "text-white placeholder-white/40" : "text-black placeholder-black/40"}`}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        {!isForgotPassword && (
          <>
            <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-black/80"}`}>
              Password
            </label>
            <div
              className={`flex items-center mt-1 px-3 py-2 mb-4 rounded-xl backdrop-blur-xl border 
                ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}
            >
              <Lock size={18} className="mr-2 opacity-70" />
              <input
                type="password"
                className={`flex-1 bg-transparent outline-none text-sm 
                ${isDark ? "text-white placeholder-white/40" : "text-black placeholder-black/40"}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Confirm Password (Sign Up only) */}
        {isSignUp && !isForgotPassword && (
          <>
            <label className={`text-sm font-bold ${isDark ? "text-white/80" : "text-black/80"}`}>
              Confirm Password
            </label>
            <div
              className={`flex items-center mt-1 px-3 py-2 mb-4 rounded-xl backdrop-blur-xl border 
                ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}
            >
              <Lock size={18} className="mr-2 opacity-70" />
              <input
                type="password"
                className={`flex-1 bg-transparent outline-none text-sm 
                ${isDark ? "text-white placeholder-white/40" : "text-black placeholder-black/40"}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Forgot Password Link (Login only) */}
        {!isSignUp && !isForgotPassword && (
          <div className="text-right mb-4">
            <button
              onClick={() => setIsForgotPassword(true)}
              className={`text-sm font-semibold hover:underline 
              ${isDark ? "text-purple-400" : "text-purple-700"}`}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className={`w-full py-3 rounded-xl text-white font-bold mt-2 transition 
          bg-gradient-to-r from-purple-500 to-pink-600 hover:scale-[1.02]`}
        >
          {loading ? "Loading..." : isForgotPassword ? "Send Magic Link" : isSignUp ? "Create Account" : "Login"}
        </button>

        {/* Back to Login (Forgot Password) */}
        {isForgotPassword && (
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setEmail("");
              }}
              className={`text-sm font-semibold hover:underline 
              ${isDark ? "text-purple-400" : "text-purple-700"}`}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Divider */}
        {!isForgotPassword && (
          <>
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-sm opacity-60">OR</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Social logins */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSocialLogin("Google")}
                className="flex items-center justify-center gap-3 w-full py-2 rounded-xl bg-white text-black hover:bg-gray-100 transition"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" />
                {isSignUp ? "Sign Up with Google" : "Login with Google"}
              </button>
            </div>
          </>
        )}

        {/* Toggle login/signup */}
        {!isForgotPassword && (
          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setConfirmPassword("");
              }}
              className={`text-sm font-semibold hover:underline 
              ${isDark ? "text-purple-400" : "text-purple-700"}`}
            >
              {isSignUp ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        )}

        <style>{`
          @keyframes slide {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    </div>
  );
}
