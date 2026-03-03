import { motion } from "framer-motion";
import { CheckCircle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import salon from "../assets/images/salon1.jpeg";

const Thanks = () => {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const checkmarkAnimation = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.2 
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#EFD09E] relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={salon}
          alt="Thank you background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl w-full">
          {/* Success Card */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="bg-[#272727]/80 backdrop-blur-md rounded-3xl p-12 sm:p-16 shadow-2xl border border-[#D4AA7D]/30 text-center"
          >
            {/* Success Icon */}
            <motion.div
              variants={checkmarkAnimation}
              initial="hidden"
              animate="visible"
              className="flex justify-center mb-8"
            >
              <div className="w-32 h-32 bg-[#D4AA7D]/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-20 h-20 text-[#D4AA7D]" strokeWidth={2.5} />
              </div>
            </motion.div>

            {/* Thank You Message */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="mb-12"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#D4AA7D] mb-6">
                Thank You!
              </h1>
              <p className="text-xl text-[#EFD09E]/80">
                Your booking has been confirmed successfully
              </p>
            </motion.div>

            {/* Back to Home Button */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <motion.button
                onClick={() => navigate("/")}
                className="flex items-center justify-center gap-3 px-10 py-4 bg-[#D4AA7D] text-[#272727] rounded-2xl font-semibold text-lg hover:bg-[#EFD09E] transition shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home className="w-6 h-6" />
                Back to Home
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Thanks;