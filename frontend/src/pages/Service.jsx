import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { Search } from "lucide-react";
import { ServiceContext } from "../context/ServiceContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";


const Service = () => {
  const { categories,services } = useContext(ServiceContext);
  const {current_user } = useContext(UserContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 8;

  
  const filteredServices = services.filter((service) => {
    const matchesCategory = selectedCategory === "All" || service.category?.name === selectedCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  const navigate = useNavigate();

  // Reset to page 1 when filter or search changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookNow = (service) => {
    // Check if user is logged in
    if (!current_user) {
      // Redirect to login page if not logged in
      navigate("/login", {
        state: {
          from: "/service",
          message: "Please log in to book a service",
          serviceData: {
            serviceId: service.id,
            title: service.title,
            image: service.image,
            duration: service.duration_minutes,
            price: service.price,
          }
        }
      });
      return;
    }

    // If logged in, proceed to booking
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

  return (
    <div className="min-h-screen bg-[#EFD09E]">
      {/* Hero Section */}
      <section className="bg-[#272727] text-[#EFD09E] py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Our <span className="text-[#D4AA7D]">Services</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#EFD09E]/80 leading-relaxed">
              Discover our wide range of beauty and wellness services tailored just for you
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#272727]/50" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-4 bg-white border border-[#D4AA7D]/30 rounded-2xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition shadow-md"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {["All", ...categories.map(c => c.name)].map((category) => (
              <motion.button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-[#D4AA7D] text-[#272727] shadow-lg"
                    : "bg-white text-[#272727] hover:bg-[#D4AA7D]/20 border border-[#D4AA7D]/30"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentServices.length > 0 ? (
              currentServices.map((service, index) => (
                <Link 
                  to={`/single/${service.id}`} 
                  key={service.id}
                  className="block"
                >
                  <motion.div
                    variants={fadeInUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#D4AA7D]/20 cursor-pointer"
                  >
                    {/* Service Image */}
                    <div className="relative h-48 bg-gradient-to-br from-[#D4AA7D] to-[#272727]">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {service.image && (  
                          <img 
                            src={service.image} 
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="absolute top-3 right-3 bg-[#D4AA7D] text-[#272727] px-3 py-1 rounded-full text-sm font-semibold">
                        KSh {Number(service.price).toLocaleString('en-KE')} 
                      </div>
                    </div>

                    {/* Service Details */}
                    <div className="p-5">
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-[#D4AA7D] uppercase tracking-wide">
                          {service.category?.name || service.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#272727] mb-2">
                        {service.title}
                      </h3>
                      <p className="text-[#272727]/70 text-sm mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#272727]/60 flex items-center gap-1">
                          🕐 {service.duration_minutes} min
                        </span>
                        <motion.button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleBookNow(service);
                          }}
                          className="bg-[#D4AA7D] text-[#272727] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#272727] hover:text-[#EFD09E] transition"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {current_user ? "Book Now" : "Login to Book"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-[#272727]/60 text-lg">
                  No services found matching your criteria
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredServices.length > servicesPerPage && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex items-center justify-center gap-2 mt-12"
            >
              {/* Previous Button */}
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-[#D4AA7D]/30 text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                ‹
              </motion.button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <motion.button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        currentPage === pageNumber
                          ? "bg-[#D4AA7D] text-white shadow-lg"
                          : "border border-[#D4AA7D]/30 text-[#272727] hover:bg-[#D4AA7D]/20"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pageNumber}
                    </motion.button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="text-[#272727]/50">...</span>;
                }
                return null;
              })}

              {/* Next Button */}
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-[#D4AA7D]/30 text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                ›
              </motion.button>
            </motion.div>
          )}

          {/* Page Info */}
          {filteredServices.length > 0 && (
            <p className="text-center mt-6 text-[#272727]/60 text-sm">
              Page {currentPage} of {totalPages} ({filteredServices.length} services found)
            </p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#272727] text-[#EFD09E] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#D4AA7D]">
              Ready to Book Your Service?
            </h2>
            <p className="text-lg text-[#EFD09E]/80 mb-8">
              Choose from our wide range of premium services and book your appointment today
            </p>
            <motion.button
              className="bg-[#D4AA7D] text-[#272727] px-10 py-4 rounded-xl font-semibold text-lg hover:bg-[#EFD09E] transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Service;