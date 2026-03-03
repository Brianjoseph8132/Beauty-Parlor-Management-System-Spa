import { motion } from "framer-motion";
import cosmetics from "../assets/images/cosmetic1.png"
import hairdressing from "../assets/images/hairdressing1.jpeg"
import barber from "../assets/images/barber1.jpeg"
import Massage from "../assets/images/Massage.jpeg"
import body from "../assets/images/body.jpeg"
import aromatherapy from "../assets/images/aromatherapy.jpeg"

const Services = () => {
  const services = [
    {
      id: 1,
      title: "Cosmetics",
      image: cosmetics, 
    },
    {
      id: 2,
      title: "Hairdressing",
      image: hairdressing, 
    },
    {
      id: 3,
      title: "Barber",
      image: barber, 
    },
    {
      id: 4,
      title: "Massages",
      image: Massage,
    },
    {
      id: 5,
      title: "Body Treatments",
      image: body
    },
    {
      id: 6,
      title: "Aromatherapy",
      image: aromatherapy
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="bg-[#EFD09E] text-[#272727] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#272727] mb-3">
            Our Services
          </h2>
          <p className="text-base sm:text-lg text-[#272727]/70">
            Our salon offers a wide variety of beauty services
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service) => (
            <motion.div
              key={service.id}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -10 }}
              className="relative h-64 sm:h-72 rounded-2xl overflow-hidden cursor-pointer group"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Overlay - Glassmorphism Effect */}
              <div className="absolute inset-0 bg-black/45  group-hover:bg-black/50 transition-all duration-300" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                <motion.div
                  className="text-5xl sm:text-6xl mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {service.icon}
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-semibold">
                  {service.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;