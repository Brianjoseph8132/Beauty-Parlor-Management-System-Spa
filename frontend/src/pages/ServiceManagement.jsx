import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState } from "react";
import { Plus, Edit2, Trash2, X, Search, Filter, Clock, DollarSign, Upload  } from "lucide-react";
import { ServiceContext } from "../context/ServiceContext";

const ServiceManagement = () => {
  const { categories,services, deleteService, addService,updateService } = useContext(ServiceContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null)


  const servicesPerPage = 10;

  const [formData, setFormData] = useState({
    title: "",
    category_name: "",
    price: "",
    duration_minutes: "",
    description: "",
  });

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) { 
          setImageFile(file); 
          // Create preview 
          const reader = new FileReader(); 
          reader.onloadend = () => { 
              setImagePreview(reader.result); 
          }; 
          reader.readAsDataURL(file); 
      } 
    };
  
  



  const handleEditImageChange = (e) => { 
    const file = e.target.files[0]; 
    if (file) { 
      setEditImageFile(file); 
      // Create preview 
      const reader = new FileReader(); 
      reader.onloadend = () => { 
        setEditImagePreview(reader.result); 
      }; 
      reader.readAsDataURL(file); 
    } 
  };
  


  const categoryOptions = ["All", ...categories];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddService = async () => { 
    // Convert duration format from "1h 30min" to minutes 
    const durationInMinutes = parseDurationToMinutes(formData.duration_minutes);
    await addService( 
        formData.title, // title 
        formData.description, // description 
        formData.duration_minutes, // duration_minutes 
        formData.price, // price 
        imageFile, // imageFile 
        formData.category_name  // category_name 
    ); 
    // Reset form and close modal 
    setIsAddModalOpen(false); 
    setFormData({ 
        title: "", 
        category_name : "", 
        price: "", 
        duration_minutes: "", 
        description: "", 
    }); setImageFile(null); 
    setImagePreview(null); 
  };

  // Helper function to convert duration format to minutes 
  const parseDurationToMinutes = (duration_minutes) => { 
    if (!duration_minutes) return 0;

    let totalMinutes = 0; 
    const hoursMatch = duration_minutes.match(/(\d+)h/); 
    const minutesMatch = duration_minutes.match(/(\d+)min/); 
    if (hoursMatch) { 
        totalMinutes += parseInt(hoursMatch[1]) * 60; 
    } 
    if (minutesMatch) { 
        totalMinutes += parseInt(minutesMatch[1]); 
    } 
    return totalMinutes; 
  };


  const handleEditClick = (service) => { 
    setSelectedService(service); 
    setFormData({ 
      title: service.title, 
      category: service.category_name, 
      price: service.price, 
      duration: service.duration_minutes, 
      description: service.description, 
    }); 
    setEditImagePreview(service.image || null); 
    setEditImageFile(null); 
    setIsEditModalOpen(true); 
  };

  const handleUpdateService = async () => { 
    // Convert duration format from "1h 30min" to minutes 
    const durationInMinutes = parseDurationToMinutes(formData.duration_minutes);
    await updateService( 
      formData.title, // title 
      formData.description, // description 
      formData.duration_minutes, // duration_minutes 
      formData.price, // price 
      editImageFile, // imageFile (null if no new image) 
      formData.category_name, // category_name 
      selectedService.id // service_id 
    );
      // Reset form and close modal 
      setIsEditModalOpen(false); 
      setSelectedService(null); 
      setFormData({ 
        title: "", 
        category_name: "", 
        price: "", 
        duration_minutes: "", 
        description: "", 
      }); 
      setEditImageFile(null); 
      setEditImagePreview(null); 
    };

  const handleDeleteClick = (service) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteService = () => {
    deleteService(selectedService.id);
    setIsDeleteModalOpen(false);
    setSelectedService(null);
  };


  const filteredServices = services.filter((service) => {
    const matchesCategory = categoryFilter === "All" || service.category.name === categoryFilter;
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filter or search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
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
    <div className="min-h-screen bg-[#EFD09E] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#272727] mb-2">
              Service <span className="text-[#D4AA7D]">Management</span>
            </h1>
            <p className="text-lg text-[#272727]/70">
              Manage all your services in one place
            </p>
          </div>
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#272727] hover:text-[#EFD09E] transition shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Add Service
          </motion.button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#272727]/50" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-[#272727]/70 flex-shrink-0" />
              <select
                value={categoryFilter}
                onChange={handleCategoryChange}
                className="flex-1 px-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] focus:outline-none focus:border-[#D4AA7D] transition"
              > 
                <option value="All">Select Category</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Services Table */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#D4AA7D] text-[#272727]">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Service Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Category</th>
                  <th className="px-6 py-4 text-left font-semibold">Price</th>
                  <th className="px-6 py-4 text-left font-semibold">Duration</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentServices.length > 0 ? (
                  currentServices.map((service, index) => (
                    <motion.tr
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#D4AA7D]/20 hover:bg-[#EFD09E]/30 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#272727]">{service.title}</p>
                          <p className="text-sm text-[#272727]/60 line-clamp-1">
                            {service.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-[#D4AA7D]/20 text-[#D4AA7D] rounded-full text-sm font-medium">
                          {service.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-[#272727] font-semibold">
                          <DollarSign className="w-4 h-4" />
                          KSH {service.price}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-[#272727]">
                          <Clock className="w-4 h-4 text-[#D4AA7D]" />
                          {service.duration_minutes } min
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            onClick={() => handleEditClick(service)}
                            className="p-2 bg-[#D4AA7D]/20 text-[#D4AA7D] rounded-lg hover:bg-[#D4AA7D] hover:text-[#272727] transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteClick(service)}
                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-[#272727]/60">
                      No services found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredServices.length > servicesPerPage && (
            <div className="flex items-center justify-center gap-2 p-6 border-t border-[#D4AA7D]/20">
              {/* Previous Button */}
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[#D4AA7D]/30 bg-white text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                <span className="text-lg">‹</span>
                <span className="hidden sm:inline text-sm">Previous</span>
              </motion.button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
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
                          : "bg-white border border-[#D4AA7D]/30 text-[#272727] hover:bg-[#D4AA7D]/20"
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
                className="px-4 py-2 rounded-lg border border-[#D4AA7D]/30 bg-white text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                ›
              </motion.button>
            </div>
          )}

          {/* Page Info */}
          {filteredServices.length > 0 && (
            <div className="px-6 pb-4 text-center text-sm text-[#272727]/60">
              Showing {indexOfFirstService + 1}-{Math.min(indexOfLastService, filteredServices.length)} of {filteredServices.length} services
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Service Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AA7D]/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-[#EFD09E]">Add New Service</h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-[#EFD09E]/20 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-[#EFD09E]" />
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Service Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                    placeholder="e.g., Hair Styling"
                  />
                </div>

                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Category
                  </label>
                  <select
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] focus:outline-none focus:border-[#D4AA7D] transition"
                  >
                    <option value="">Select a category</option>
                    {categoryOptions.filter(cat => cat !== "All").map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Service Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] hover:bg-[#EFD09E]/20 transition flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                          <span>{imageFile ? imageFile.name : "Choose an image"}</span>
                      </div>
                      <input
                       type="file"
                       accept="image/*"
                       onChange={handleImageChange}
                       className="hidden"
                     />
                    </label>
                  </div>
                 {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                         alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-[#D4AA7D]/30"
                      />
                    </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Price (KSH)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                      placeholder="280.00"
                    />
                  </div>

                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration_minutes"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                      placeholder="1h 30min"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition resize-none"
                    placeholder="Enter service description..."
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={handleAddService}
                    className="flex-1 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E] transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Service
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="flex-1 bg-[#EFD09E]/10 text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/20 transition border border-[#D4AA7D]/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Service Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AA7D]/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-[#EFD09E]">Edit Service</h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditImageFile(null);
                    setEditImagePreview(null);
                  }}
                  className="p-2 hover:bg-[#EFD09E]/20 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-[#EFD09E]" />
                </button>
              </div>

              <form className="space-y-6" onSubmit={(e) =>{e.preventDefault(); handleUpdateService();}}>
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Service Title
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                  />
                </div>

                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Category
                  </label>
                  <select
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] focus:outline-none focus:border-[#D4AA7D] transition"
                  >
                    <option value="">Select a category</option>
                    {categories.filter(cat => cat !== "All").map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload for Edit */}
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Service Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] hover:bg-[#EFD09E]/20 transition flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        <span>{editImageFile ? editImageFile.name : "Change image (optional)"}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {editImagePreview && (
                    <div className="mt-3">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-xl border-2 border-[#D4AA7D]/30"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Price (KSH)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration_minutes}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="submit"
                    className="flex-1 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E] transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Update Service
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditImageFile(null);
                      setEditImagePreview(null);
                    }}
                    className="flex-1 bg-[#EFD09E]/10 text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/20 transition border border-[#D4AA7D]/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-[#D4AA7D]/30"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#EFD09E] mb-2">Delete Service</h2>
                <p className="text-[#EFD09E]/70">
                  Are you sure you want to delete "{selectedService?.name}"? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={handleDeleteService}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete
                </motion.button>
                <motion.button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-[#EFD09E]/10 text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/20 transition border border-[#D4AA7D]/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceManagement;