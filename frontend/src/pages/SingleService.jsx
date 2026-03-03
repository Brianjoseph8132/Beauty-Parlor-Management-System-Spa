import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { Clock, DollarSign, Star, Calendar, MapPin, ChevronLeft, Heart, Share2, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ServiceContext } from "../context/ServiceContext";

const SingleService = () => {
  const navigate = useNavigate();
  const {id} =useParams();
  const {services} = useContext(ServiceContext);

  const service = services ? services.find((service) => service.id.toString() === id) : null;

  // Service data (would come from API/props)
  const servcesInfo = {
    
    location: "Poplar beauty place",
    address: "Ronald Ngala Street, RNG Plaza, 1st Floor, Shop No.203",
  };

  const handleBookNow = (service) => {
    navigate("/book", {
      state: {
        serviceId: service.id,
        title: service.title,
        image: service.image,
        duration: service.duration_minutes,
        price: service.price,
      },
    });
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-[#EFD09E] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#272727] mb-4">Service not found</h2>
          <button
            onClick={() => navigate("/services")}
            className="bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#272727] hover:text-[#EFD09E] transition"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-[#EFD09E] py-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="your-background-image-url"
          alt="Service background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#EFD09E] hover:text-[#D4AA7D] transition mb-8 bg-[#272727]/60 backdrop-blur-md px-4 py-2 rounded-xl"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back to Services</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Header */}
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-[#272727]/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#D4AA7D]/30"
            >
              {/* Service Image */}
              <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-[#D4AA7D] to-[#272727]">
                <div className="absolute inset-0 flex items-center justify-center">
                  {service.image && (  
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                </div>
              </div>

              {/* Service Info */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-[#D4AA7D]/30 text-[#D4AA7D] rounded-full text-sm font-semibold mb-3">
                      {service.category?.name || service.category}
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-bold text-[#EFD09E] mb-2">
                      {service.title}
                    </h1>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-[#D4AA7D]">
                      KSh {Number(service.price).toLocaleString('en-KE')}
                    </div>
                    <div className="text-sm text-[#EFD09E]/70 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.duration_minutes} min
                    </div>
                  </div>
                </div>

                <p className="text-[#EFD09E]/90 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-4 bg-[#EFD09E]/10 rounded-xl border border-[#D4AA7D]/20">
                <MapPin className="w-5 h-5 text-[#D4AA7D] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#EFD09E]">{servcesInfo.location}</p>
                  <p className="text-sm text-[#EFD09E]/70">{servcesInfo.address}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-[#272727]/80 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-[#D4AA7D]/30 sticky top-24"
            >
              <h3 className="text-xl font-bold text-[#EFD09E] mb-6">
                Book This Service
              </h3>

              {/* Price Summary */}
              <div className="mb-6 p-4 bg-[#EFD09E]/10 rounded-xl border border-[#D4AA7D]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#EFD09E]/70">Service Price</span>
                  <span className="font-semibold text-[#EFD09E]">
                    KSh {Number(service.price).toLocaleString('en-KE')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#EFD09E]/70">Duration</span>
                  <span className="font-semibold text-[#EFD09E]">
                    {service.duration_minutes} min 
                  </span>
                </div>
              </div>

              {/* Book Button */}
              <motion.button
                onClick={() => handleBookNow(service)}
                className="w-full bg-[#D4AA7D] text-[#272727] px-6 py-4 rounded-xl font-semibold text-lg hover:bg-[#EFD09E] transition mb-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Book Now
              </motion.button>

              {/* Additional Info */}
              <div className="space-y-3 text-sm text-[#EFD09E]/70">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#D4AA7D]" />
                  <span>Flexible scheduling available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#D4AA7D]" />
                  <span>Top-rated service</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleService;