import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import salon from "../assets/images/salon1.jpeg";
import { GoogleLogin } from '@react-oauth/google';
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const SignUp = () => {
  const {addUser, login_with_google, current_user} = useContext(UserContext)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    addUser(formData.username, formData.email, formData.password);
  };


  // Redirect if the user is already logged in
  useEffect(() => {
    if (current_user) {
      navigate('/')
    }
  })

  async function handleGoogleLogin(credential) {
    try {
      await login_with_google(credential);
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      toast.error("Google login failed");
      console.error(err);
    }
  }


  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={salon}
          alt="Sign up background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Sign Up Card */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md mt-10"
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

          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#D4AA7D] mb-2">
              Create Account
            </h2>
            <p className="text-[#EFD09E]/70">
              Sign up to get started with BPMS
            </p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-[#EFD09E] mb-2 font-medium text-sm"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                placeholder="Enter your full name"
              />
            </div>

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
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[#EFD09E] mb-2 font-medium text-sm"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                  placeholder="Create a password"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EFD09E]/60 hover:text-[#D4AA7D] transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5"/>
                  ): (
                    <Eye className="w-5 h-5"/>
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
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                  placeholder="Confirm your password"
                />
                <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EFD09E]/60 hover:text-[#D4AA7D] transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5"/>
                  ): (
                    <Eye className="w-5 h-5"/>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full bg-[#D4AA7D] text-[#272727] px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-[#EFD09E] transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create Account
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D4AA7D]/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#272727]/80 text-[#EFD09E]/70">
                Or sign up with
              </span>
            </div>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                handleGoogleLogin(credentialResponse.credential);
              }}
            />
          </div>
          {/* Login Link */}
          <p className="text-center mt-8 text-[#EFD09E]/70 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              href="#"
              className="text-[#D4AA7D] hover:text-[#EFD09E] transition font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;