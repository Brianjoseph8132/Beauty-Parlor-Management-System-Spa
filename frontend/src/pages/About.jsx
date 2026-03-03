import { motion } from "framer-motion";
import salon from "../assets/images/salon.jpeg";
import interior from "../assets/images/interior1.jpeg";

const About = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fadeInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const fadeInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const values = [
    {
      title: "Excellence",
      description: "We strive for perfection in every service we provide",
      icon: "⭐",
    },
    {
      title: "Innovation",
      description: "Staying ahead with the latest beauty trends and technologies",
      icon: "💡",
    },
    {
      title: "Care",
      description: "Your comfort and satisfaction are our top priorities",
      icon: "❤️",
    },
    {
      title: "Expertise",
      description: "Skilled professionals dedicated to their craft",
      icon: "🎯",
    },
  ];

  const stats = [
    { number: "10+", label: "Years Experience" },
    { number: "5000+", label: "Happy Clients" },
    { number: "50+", label: "Expert Staff" },
    { number: "15+", label: "Services Offered" },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section - Light */}
      <section className="bg-[#EFD09E] text-[#272727] py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-[#272727]">
              About <span className="text-[#D4AA7D]">BPMS</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#272727]/80 leading-relaxed">
              Welcome to BPMS, where beauty meets innovation. We are dedicated to providing exceptional beauty services in a luxurious and comfortable environment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section - Dark */}
      <section className="bg-[#272727] text-[#EFD09E] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#D4AA7D]">
                Our Story
              </h2>
              <div className="space-y-4 text-[#EFD09E]/90">
                <p className="leading-relaxed">
                  Founded with a passion for beauty and excellence, BPMS has grown from a small salon into a premier beauty destination. Our journey began with a simple vision: to create a space where clients feel valued, pampered, and beautiful.
                </p>
                <p className="leading-relaxed">
                  Over the years, we've built a reputation for outstanding service, skilled professionals, and a welcoming atmosphere. Every member of our team is committed to making your experience memorable and transformative.
                </p>
                <p className="leading-relaxed">
                  Today, we continue to evolve, embracing new techniques and technologies while staying true to our core values of quality, care, and customer satisfaction.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative h-96 rounded-2xl overflow-hidden"
            >
              <img 
                src={salon}
                alt="Salon exterior"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values Section - Light */}
      <section className="bg-[#EFD09E] text-[#272727] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#272727]">
              Our <span className="text-[#D4AA7D]">Values</span>
            </h2>
            <p className="text-lg text-[#272727]/80 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white rounded-2xl p-6 shadow-lg text-center"
              >
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-[#D4AA7D]">
                  {value.title}
                </h3>
                <p className="text-[#272727]/70 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Dark */}
      <section className="bg-[#272727] text-[#EFD09E] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#D4AA7D]">
              Our Achievements
            </h2>
            <p className="text-lg text-[#EFD09E]/80 max-w-2xl mx-auto">
              Numbers that speak for themselves
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold text-[#D4AA7D] mb-2">
                  {stat.number}
                </div>
                <div className="text-[#EFD09E]/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section - Light */}
      <section className="bg-[#EFD09E] text-[#272727] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative h-96 rounded-2xl overflow-hidden order-2 lg:order-1"
            >
              <img 
                src={interior}
                alt="Salon interior"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#D4AA7D]">
                Our Mission
              </h2>
              <div className="space-y-4 text-[#272727]/90">
                <p className="leading-relaxed">
                  At BPMS, our mission is to empower individuals through beauty and self-care. We believe that everyone deserves to feel confident and beautiful in their own skin.
                </p>
                <p className="leading-relaxed">
                  We are committed to delivering personalized services that cater to your unique needs, using only the finest products and latest techniques in the beauty industry.
                </p>
                <p className="leading-relaxed">
                  Our goal is not just to meet your expectations, but to exceed them, creating lasting relationships built on trust, quality, and exceptional results.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action - Dark */}
      <section className="bg-[#272727] text-[#EFD09E] py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-[#D4AA7D]">
              Ready to Experience BPMS?
            </h2>
            <p className="text-lg text-[#EFD09E]/80 mb-8">
              Book your appointment today and discover why our clients keep coming back.
            </p>
            <motion.button
              className="bg-[#D4AA7D] text-[#272727] px-10 py-4 rounded-xl font-semibold text-lg hover:bg-[#EFD09E] transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Book Now
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;