import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState } from "react";
import { Plus, Edit2, Trash2, X, Search, Filter, Clock, User, Camera, CheckCircle, XCircle } from "lucide-react";
import { EmployeeContext } from "../context/EmployeeContext";
import { ServiceContext } from "../context/ServiceContext";
import { Link } from "react-router-dom";

const EmployeeManagement = () => {
  const {employees, deleteEmployee,addEmployee,updateEmployee} = useContext(EmployeeContext);
  const {services} = useContext(ServiceContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [profileImageFile, setProfileImageFile] = useState(null)
  const employeesPerPage = 5;

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    employee_profile_picture: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
    workingHours: { work_start: "", work_end: "" },
    work_days: [],
    skills: [],
    other_skills:[],
    role: "",
    is_active: true,
  });

  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "workingHoursStart") {
      setFormData({
        ...formData,
        workingHours: {
          ...formData.workingHours,
          work_start: value,
        },
      });
    } else if (name === "workingHoursEnd") {
      setFormData({
        ...formData,
        workingHours: {
          ...formData.workingHours,
          work_end: value,
        },
      });
    }
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDayToggle = (day) => {
    const updatedDays = formData.work_days.includes(day)
      ? formData.work_days.filter(d => d !== day)
      : [...formData.work_days, day];
    
    setFormData({
      ...formData,
      work_days: updatedDays,
    });
  };


  const handleSkillToggle = (skill) => {
    const updatedSkills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    
    setFormData({
      ...formData,
      skills: updatedSkills,
    });
  };


  
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleAddEmployee = async () => {
    await addEmployee(
      formData.username,
      formData.full_name,
      formData.workingHours.work_start,
      formData.workingHours.work_end,
      profileImageFile,
      formData.work_days,
      formData.skills,
      formData.other_skills,
      formData.role
    );

    setIsAddModalOpen(false);
    resetForm();
  };


  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      username: employee.username,
      email: employee.email,
      employee_profile_picture: employee.employee_profile_picture,
      workingHours: {work_start: employee.work_start, work_end: employee.work_end,},
      work_days: employee.work_days,
      skills: employee.skills,
      role: employee.role,
      other_skills:employee.other_skills || [],
      is_active: employee.is_active,
    });
    setIsEditModalOpen(true);
    setProfilePicturePreview(employee.employee_profile_picture);
  };

  const handleUpdateEmployee = async () => {
    await updateEmployee(
      formData.full_name,
      formData.workingHours.work_start,
      formData.workingHours.work_end,
      profileImageFile,
      formData.work_days,
      formData.skills,
      formData.other_skills,
      selectedEmployee.id,
      formData.is_active
    );

    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    resetForm();
  };


  const handleDeleteClick = (employee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEmployee = () => {
    deleteEmployee(selectedEmployee.id)
    setIsDeleteModalOpen(false);
    setSelectedEmployee(null);
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      username: "",
      email: "",
      employee_profile_picture: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
      workingHours: { work_start: "", work_end: "" },
      work_days: [],
      skills: [],
      other_skills: [],
      role: "",
    });
    setProfilePicturePreview(null);
    setProfileImageFile(null)
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
              Employee <span className="text-[#D4AA7D]">Management</span>
            </h1>
            <p className="text-lg text-[#272727]/70">
              Manage all your beauticians and staff
            </p>
          </div>
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#272727] hover:text-[#EFD09E] transition shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </motion.button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#272727]/50" />
            <input
              type="text"
              placeholder="Search employees by name, email, or username..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition"
            />
          </div>
        </motion.div>

        {/* Employees List */}
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
                  <th className="px-6 py-4 text-left font-semibold">Employee</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Working Hours</th>
                  <th className="px-6 py-4 text-center font-semibold">Status</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEmployees.length > 0 ? (
                  currentEmployees.map((employee, index) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#D4AA7D]/20 hover:bg-[#EFD09E]/30 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Link
                          to={`/employee-profile/${employee.id}`}
                          >
                            <div className="w-12 h-12 bg-[#D4AA7D] rounded-full flex items-center justify-center flex-shrink-0">
                              {employee.employee_profile_picture ? (
                                <img
                                  src={employee.employee_profile_picture}
                                  alt={employee.full_name}
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <User className="w-6 h-6 text-[#272727]" style={{ display: employee.employee_profile_picture ? 'none' : 'block' }} />
                            </div>
                          </Link>
                          <div>
                            <p className="font-semibold text-[#272727]">{employee.full_name}</p>
                            <p className="text-sm text-[#272727]/60">@{employee.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#272727]">{employee.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-[#272727]">
                          <Clock className="w-4 h-4 text-[#D4AA7D]" />
                          {employee.work_start} - {employee.work_end}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleToggleStatus(employee)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              employee.is_active ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                employee.is_active ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`ml-2 text-sm font-medium ${
                            employee.is_active ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {employee.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            onClick={() => handleEditClick(employee)}
                            className="p-2 bg-[#D4AA7D]/20 text-[#D4AA7D] rounded-lg hover:bg-[#D4AA7D] hover:text-[#272727] transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteClick(employee)}
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
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredEmployees.length > employeesPerPage && (
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
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[#D4AA7D]/30 bg-white text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                <span className="hidden sm:inline text-sm">Next</span>
                <span className="text-lg">›</span>
              </motion.button>
            </div>
          )}

          {/* Page Info */}
          {filteredEmployees.length > 0 && (
            <div className="px-6 pb-4 text-center text-sm text-[#272727]/60">
              Showing {indexOfFirstEmployee + 1}-{Math.min(indexOfLastEmployee, filteredEmployees.length)} of {filteredEmployees.length} employees
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Employee Modal */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AA7D]/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-[#EFD09E]">
                  {isAddModalOpen ? "Add New Employee" : "Edit Employee"}
                </h2>
                <button
                  onClick={() => {
                    isAddModalOpen ? setIsAddModalOpen(false) : setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-[#EFD09E]/20 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-[#EFD09E]" />
                </button>
              </div>

              <form className="space-y-6" onSubmit={(e) => {e.preventDefault(); isAddModalOpen ? handleAddEmployee() : handleUpdateEmployee(); }}>
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <img
                      src={profilePicturePreview || formData.employee_profile_picture}
                      alt="Profile Preview"
                      className="w-full h-full rounded-full object-cover border-4 border-[#D4AA7D]"
                      onError={(e) => {
                        e.target.src = "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=";
                      }}
                    />
                    <label
                      htmlFor="profilePicture"
                      className="absolute bottom-0 right-0 p-2 bg-[#D4AA7D] rounded-full cursor-pointer hover:bg-[#EFD09E] transition"
                    >
                      <Camera className="w-5 h-5 text-[#272727]" />
                    </label>
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-[#EFD09E]/70">Click camera to upload photo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                      placeholder="e.g., Sarah Johnson"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                      placeholder="e.g., sarah_beauty"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                      placeholder="sarah@bpms.com"
                    />
                  </div>

                  {/* Role */}
                  <div className="md:col-span-2">
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] focus:outline-none focus:border-[#D4AA7D] transition"
                    >
                      <option value="">Select a role</option>
                      <option value="beautician">Beautician</option>
                      <option value="receptionist">Receptionist</option>
                    </select>
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Working Hours
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#EFD09E]/70 mb-1 text-xs">Start Time</label>
                      <input
                        type="time"
                        name="workingHoursStart"
                        value={formData.workingHours.work_start}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] focus:outline-none focus:border-[#D4AA7D] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[#EFD09E]/70 mb-1 text-xs">End Time</label>
                      <input
                        type="time"
                        name="workingHoursEnd"
                        value={formData.workingHours.work_end}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] focus:outline-none focus:border-[#D4AA7D] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Working Days */}
                <div>
                  <label className="block text-[#EFD09E] mb-3 font-medium text-sm">
                    Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          formData.work_days.includes(day)
                            ? "bg-[#D4AA7D] text-[#272727]"
                            : "bg-[#EFD09E]/10 text-[#EFD09E] border border-[#D4AA7D]/30"
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skills (Only for Beautician) */}
                {formData.role === "beautician" && (
                  <div>
                    <label className="block text-[#EFD09E] mb-3 font-medium text-sm">
                      Skills (Services)
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-[#EFD09E]/5 rounded-xl">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleSkillToggle(service.title)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            formData.skills.includes(service.title)
                              ? "bg-[#D4AA7D] text-[#272727]"
                              : "bg-[#EFD09E]/10 text-[#EFD09E] border border-[#D4AA7D]/30"
                          }`}
                        >
                          {service.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}


                {/* Active Status Toggle (Only in Edit Mode) */}
                {isEditModalOpen && (
                  <div>
                    <label className="block text-[#EFD09E] mb-3 font-medium text-sm">
                      Employee Status
                    </label>
                    <div className="flex items-center gap-3 p-4 bg-[#EFD09E]/5 rounded-xl border border-[#D4AA7D]/30">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          formData.is_active ? "bg-green-500" : "bg-[#EFD09E]/20"
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            formData.is_active ? "translate-x-7" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <div>
                        <p className="text-[#EFD09E] font-medium">
                          {formData.is_active ? "Active" : "Inactive"}
                        </p>
                        <p className="text-xs text-[#EFD09E]/60">
                          {formData.is_active ? "Employee can receive bookings" : "Employee unavailable for bookings"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="submit"
                    className="flex-1 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E] transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isAddModalOpen ? "Add Employee" : "Update Employee"}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      isAddModalOpen ? setIsAddModalOpen(false) : setIsEditModalOpen(false);
                      resetForm();
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
                <h2 className="text-2xl font-bold text-[#EFD09E] mb-2">Delete Employee</h2>
                <p className="text-[#EFD09E]/70">
                  Are you sure you want to delete "{selectedEmployee?.full_name}"? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={handleDeleteEmployee}
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

export default EmployeeManagement;