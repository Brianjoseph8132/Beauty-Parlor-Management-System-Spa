import { motion } from "framer-motion";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sparkles, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setMessage("");

    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:5000/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("success|Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setMessage(`error|${data.error || "Something went wrong. Please try again."}`);
      }
    } catch (error) {
      setMessage("error|An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const [messageType, messageText] = message ? message.split("|") : [];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="your-background-image-url"
          alt="Reset password background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Reset Password Card */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#272727]/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 border border-[#D4AA7D]/30 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Sparkles className="w-10 h-10 text-[#D4AA7D]" />
              <h1 className="text-3xl font-bold text-[#EFD09E]">BPMS</h1>
            </motion.div>
          </div>

          {/* Header Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#D4AA7D] mb-2">
              Reset Password
            </h2>
            <p className="text-[#EFD09E]/70 text-sm">
              Enter your new password below
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[#EFD09E] mb-2 font-medium text-sm"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  required
                  className="w-full px-4 py-3 pr-12 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EFD09E]/60 hover:text-[#D4AA7D] transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-[#EFD09E] mb-2 font-medium text-sm"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                  }}
                  required
                  className="w-full px-4 py-3 pr-12 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EFD09E]/60 hover:text-[#D4AA7D] transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 text-sm text-red-400">{passwordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full bg-[#D4AA7D] text-[#272727] px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-[#EFD09E] transition disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              disabled={isLoading || !password || !confirmPassword}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </motion.button>
          </form>

          {/* Message Display */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-6 p-4 rounded-xl text-sm text-center ${
                messageType === "error"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-green-500/20 text-green-400 border border-green-500/30"
              }`}
            >
              {messageText}
            </motion.div>
          )}

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              href="#"
              className="inline-flex items-center gap-2 text-[#D4AA7D] hover:text-[#EFD09E] transition text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;