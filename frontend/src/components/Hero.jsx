import { motion } from "framer-motion";
import model from "../assets/images/model.png";
import { Sparkles } from "lucide-react";


const Hero = () => {
  return (
    <section className="relative h-screen overflow-hidden inset-0 bg-gradient-to-r from-black to-[#D2B48C]">
      <div className="w-full h-full flex items-center justify-center">
        {/* Image on the right with fade-in animation */}
        <motion.div 
          className="absolute right-0 top-0 h-full w-full sm:w-3/4 md:w-2/3 lg:w-1/2"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <img
            src={model}
            alt="model"
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-transparent" />
        </motion.div>

        {/* Text content - centered and on top with staggered animations */}
        <div className="relative z-10 text-center text-[#EFD09E] px-4 sm:px-8 lg:px-12 max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
          <motion.div
            animate={{rotate: [0, 360]}}
            transition={{duration:20,repeat: Infinity,ease: "linear"}}
            className="inline-block mb-6"
          >
            <Sparkles className="h-16 w-16 text-primary"/>
          </motion.div>
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 md:mb-6"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Welcome to BPMS
          </motion.h1>
          
          <motion.p 
            className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8 text-[#D4AA7D]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          >
            Experience a seamless, elegant, and modern beauty management system designed to bring your business to life.
          </motion.p>
          
          <motion.button 
            className="bg-[#D4AA7D] text-[#272727] px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 rounded-xl font-semibold hover:bg-[#EFD09E] transition"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9, ease: "easeOut" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Book Now
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
