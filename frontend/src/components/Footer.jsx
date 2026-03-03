import { motion } from "framer-motion";

const Footer = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <footer className="bg-[#272727] text-[#EFD09E] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Company Info */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-[#D4AA7D] mb-4">BPMS</h3>
            <p className="text-[#EFD09E]/80 text-sm leading-relaxed">
              Experience a seamless, elegant, and modern beauty management system designed to bring your business to life.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold text-[#D4AA7D] mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-[#EFD09E]/80 hover:text-[#D4AA7D] transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-[#EFD09E]/80 hover:text-[#D4AA7D] transition">
                  About
                </a>
              </li>
              <li>
                <a href="#services" className="text-[#EFD09E]/80 hover:text-[#D4AA7D] transition">
                  Services
                </a>
              </li>
              <li>
                <a href="#contact" className="text-[#EFD09E]/80 hover:text-[#D4AA7D] transition">
                  Contact
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold text-[#D4AA7D] mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li className="text-[#EFD09E]/80">Cosmetics</li>
              <li className="text-[#EFD09E]/80">Hairdressing</li>
              <li className="text-[#EFD09E]/80">Barber</li>
              <li className="text-[#EFD09E]/80">Massages</li>
              <li className="text-[#EFD09E]/80">Body Treatments</li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-[#D4AA7D] mb-4">Contact Us</h4>
            

            {/* Social Media */}
            <div className="flex gap-4 mt-6">
              <motion.a
                href="#"
                className="w-10 h-10 bg-[#D4AA7D] rounded-full flex items-center justify-center text-[#272727] hover:bg-[#EFD09E] transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-lg">f</span>
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-[#D4AA7D] rounded-full flex items-center justify-center text-[#272727] hover:bg-[#EFD09E] transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-lg">𝕏</span>
              </motion.a>
              <motion.a
                href="#"
                className="w-10 h-10 bg-[#D4AA7D] rounded-full flex items-center justify-center text-[#272727] hover:bg-[#EFD09E] transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-lg">in</span>
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#EFD09E]/20 pt-8">
          <p className="text-center text-[#EFD09E]/70 text-sm">
            © 2025 BPMS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;