import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import salon from "../assets/images/salon1.jpeg";
import { UserContext } from "../context/UserContext";
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from "react-toastify";


const Login = () => {
  const { login, login_with_google,current_user } = useContext(UserContext)
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      login(formData.email, formData.password, formData.rememberMe);
  };


  // Redirect if the user is already logged in
  useEffect(() => {
    if (current_user) {
      navigate('/');
    }
  }, [current_user, navigate]);


  async function handleGoogleLogin(credential) {
    login_with_google(credential);
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
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={salon}
          alt="Login background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Login Card */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md mt-20 mb-15"
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
              Welcome Back
            </h2>
            <p className="text-[#EFD09E]/70">
              Sign in to access your account
            </p>
          </div>

          {/* Login Form */}
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
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                placeholder="your.email@example.com"
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
                  placeholder="Enter your password"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#EFD09E]/60 hover:text-[#D4AA7D] transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5"/>
                  ) :(
                    <Eye className="w-5 h-5"/>
                  )}
                </button>
              </div> 
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-[#D4AA7D]/30 bg-[#EFD09E]/10 text-[#D4AA7D] focus:ring-[#D4AA7D] focus:ring-offset-0"
                />
                <span className="text-[#EFD09E]/80 text-sm">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                href="#"
                className="text-[#D4AA7D] hover:text-[#EFD09E] transition text-sm font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full bg-[#D4AA7D] text-[#272727] px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-[#EFD09E] transition"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sign In
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D4AA7D]/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#272727]/80 text-[#EFD09E]/70">
                Or continue with
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

          {/* Sign Up Link */}
          <p className="text-center mt-8 text-[#EFD09E]/70 text-sm">
            Don't have an account?{" "}
            <Link
              to="/signup"
              href="#"
              className="text-[#D4AA7D] hover:text-[#EFD09E] transition font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;