import { useContext, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { UserContext } from "../context/UserContext";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout, current_user } = useContext(UserContext);

  const isActive = (path) => location.pathname === path;

  const handleMobileLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Navigation items based on user state
  const getNavItems = () => {
    if (current_user?.is_admin) {
      // Admin navigation
      return (
        <>
          <Link
            to="/"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Home
          </Link>
          <Link
            to="/employee-management"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/employee-management")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Employees
          </Link>
          <Link
            to="/service-management"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/service-management")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Services
          </Link>
          <Link
            to="/employee-performance"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/employee-performance")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Performance
          </Link>
          <Link
            to="/attendance-management"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/attendance-management")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Attendance
          </Link>
          <Link
            to="/product-management"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/product-management")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Product
          </Link>
          <Link
            to="/email-management"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/email-management")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Email
          </Link>
          <motion.button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#D4AA7D] text-[#272727] hover:bg-[#EFD09E] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </>
      );
    } 
    else if (current_user?.is_beautician) {
      return(
        <>
          <Link
            to="/"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Home
          </Link>
          <Link
            to="/appointments"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/appointments")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Appoinments
          </Link>
          <Link
            to="/beauticianprofile"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/beauticianprofile")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Profile
          </Link>
          <motion.button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#D4AA7D] text-[#272727] hover:bg-[#EFD09E] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </>
      )
    }
    else if (current_user?.is_receptionist) {
      return(
        <>
          <Link
            to="/"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300
            ${
              isActive("/")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Home
          </Link>
          <Link
            to="/product-management"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/product-management")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Product
          </Link>
          <Link
            to="/employee-attendance"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/employee-attendance")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Attendance
          </Link>
          {/* <Link
            to="/beauticianprofile"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/beauticianprofile")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Profile
          </Link> */}
          <motion.button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#D4AA7D] text-[#272727] hover:bg-[#EFD09E] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </>
      )
    }
     else if (current_user) {
      // Regular logged-in user navigation
      return (
        <>
          <Link
            to="/"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Home
          </Link>
          <Link
            to="/service"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/service")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Services
          </Link>
          <Link
            to="/history"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/history")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            History
          </Link>
          <Link
            to="/profile"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/profile")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Profile
          </Link>
          <motion.button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#D4AA7D] text-[#272727] hover:bg-[#EFD09E] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </>
      );
    } 
    else {
      // Guest navigation (not logged in)
      return (
        <>
          <Link
            to="/about"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/about")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/contact")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Contact
          </Link>
          <Link
            to="/service"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/service")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Services
          </Link>
          <Link
            to="/login"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/login")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/signup")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D] shadow-sm"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
          >
            Sign Up
          </Link>
        </>
      );
    }
  };

  // Mobile navigation items
  const getMobileNavItems = () => {
    if (current_user?.is_admin) {
      return (
        <>
          <Link
            to="/"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/service-management"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/service-management")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Management
          </Link>
          <button
            onClick={handleMobileLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#D4AA7D] text-[#272727] hover:bg-[#EFD09E] transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </>
      );
    } else if (current_user) {
      return (
        <>
          <Link
            to="/"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/service"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/service")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            to="/history"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/history")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            History
          </Link>
          <Link
            to="/profile"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/profile")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Profile
          </Link>
          <button
            onClick={handleMobileLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium bg-[#D4AA7D] text-[#272727] hover:bg-[#EFD09E] transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </>
      );
    } else {
      return (
        <>
          <Link
            to="/about"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/about")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/contact")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            to="/service"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/service")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            to="/login"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/login")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className={`relative px-4 py-2 rounded-md font-medium transition-all duration-300 
            ${
              isActive("/signup")
                ? "bg-[#D4AA7D]/20 text-[#D4AA7D]"
                : "text-[#EFD09E] hover:text-[#D4AA7D] hover:bg-[#D4AA7D]/10"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign Up
          </Link>
        </>
      );
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 w-full left-0 bg-[#272727]/90 shadow-md z-[9999] py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <Link to="/">
              <motion.div
                className="flex items-center space-x-2 -ml-3"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  delay: 0.3,
                }}
              >
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  <Sparkles className="h-8 w-8 text-[#D4AA7D]" />
                </motion.div>

                <div className="font-playfair text-3xl font-bold text-[#D4AA7D] tracking-wider drop-shadow-sm">
                  BPMS
                </div>
              </motion.div>
            </Link>

            {/* Desktop Nav Links */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.8,
              }}
              className="hidden md:flex items-center space-x-6"
            >
              {getNavItems()}
            </motion.div>

            {/* Mobile Menu Icon */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6 text-[#EFD09E] cursor-pointer" />
              ) : (
                <FiMenu className="w-6 h-6 text-[#EFD09E] cursor-pointer" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar (Mobile Only) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9990]">
          {/* Dark overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Sidebar */}
          <div
            className="absolute top-0 right-0 w-[180px] h-full
                      bg-[#272727]/95 border-l border-[#D4AA7D]/30
                      backdrop-blur-sm flex flex-col items-center justify-center 
                      space-y-4 shadow-lg"
          >
            {getMobileNavItems()}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;