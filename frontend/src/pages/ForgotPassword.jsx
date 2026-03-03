import { motion } from "framer-motion";
import { useState } from "react";
import { Sparkles, ArrowLeft } from "lucide-react";
import salon from "../assets/images/salon1.jpeg";
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(""); // Clear previous messages

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("success|A reset link has been sent to your email.");
      } else {
        setMessage(`error|${data.error || "Something went wrong. Please try again."}`);
      }
    } catch (error) {
      setMessage("error|Network error. Please check your connection.");
    }

    setLoading(false);
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const [messageType, messageText] = message.split("|");

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={salon}
          alt="Forgot password background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Forgot Password Card */}
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
              Forgot Password?
            </h2>
            <p className="text-[#EFD09E]/70 text-sm">
              Enter your email, and we'll send you a reset link.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[#EFD09E] mb-2 font-medium text-sm"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full bg-[#D4AA7D] text-[#272727] px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-[#EFD09E] transition disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;